import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth'

export type GardenCustomer = {
  id: string
  email: string
  name: string
  role: 'CUSTOMER'
}

export class GardenAuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'GardenAuthError'
  }
}

let auth: Auth | undefined

function firebaseAuth(): Auth {
  if (auth) return auth
  const {
    VITE_FIREBASE_API_KEY: apiKey,
    VITE_FIREBASE_AUTH_DOMAIN: authDomain,
    VITE_FIREBASE_PROJECT_ID: projectId,
    VITE_FIREBASE_STORAGE_BUCKET: storageBucket,
    VITE_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
    VITE_FIREBASE_APP_ID: appId,
  } = import.meta.env
  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new GardenAuthError('firebase_not_configured', 'Garden sign-in is not configured.')
  }
  const app = getApps().length
    ? getApp()
    : initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId })
  auth = getAuth(app)
  return auth
}

async function exchangeFirebaseSession(idToken: string): Promise<GardenCustomer> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ idToken }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.user) {
    const code = typeof data?.code === 'string' ? data.code : 'session_failed'
    const message =
      code === 'email_not_verified' || code === 'EMAIL_NOT_VERIFIED'
        ? 'Verify your email before signing in.'
        : code === 'customer_account_required'
          ? 'This Croptalk account is not enabled as a customer account.'
          : 'Unable to sign in. Please try again.'
    throw new GardenAuthError(code, message)
  }
  return data.user as GardenCustomer
}

async function endFirebaseSession(currentAuth: Auth) {
  await signOut(currentAuth).catch(() => undefined)
}

export async function signInGardenCustomerWithEmail(email: string, password: string) {
  const currentAuth = firebaseAuth()
  try {
    const credential = await signInWithEmailAndPassword(currentAuth, email.trim(), password)
    if (!credential.user.emailVerified) {
      await endFirebaseSession(currentAuth)
      throw new GardenAuthError('email_not_verified', 'Verify your email before signing in.')
    }
    const customer = await exchangeFirebaseSession(await credential.user.getIdToken())
    await endFirebaseSession(currentAuth)
    return customer
  } catch (error) {
    await endFirebaseSession(currentAuth)
    if (error instanceof GardenAuthError) throw error
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
    throw new GardenAuthError(code || 'sign_in_failed', 'Unable to sign in. Check your details and try again.')
  }
}

export async function signInGardenCustomerWithGoogle() {
  const currentAuth = firebaseAuth()
  try {
    const credential = await signInWithPopup(currentAuth, new GoogleAuthProvider())
    if (!credential.user.emailVerified) {
      await endFirebaseSession(currentAuth)
      throw new GardenAuthError('email_not_verified', 'Verify your email before signing in.')
    }
    const customer = await exchangeFirebaseSession(await credential.user.getIdToken())
    await endFirebaseSession(currentAuth)
    return customer
  } catch (error) {
    await endFirebaseSession(currentAuth)
    if (error instanceof GardenAuthError) throw error
    throw new GardenAuthError('sign_in_failed', 'Unable to sign in with Google. Please try again.')
  }
}

export async function getGardenCustomerSession(): Promise<GardenCustomer | null> {
  const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
  if (response.status === 401) return null
  const data = await response.json().catch(() => null)
  if (!response.ok || !data?.user) {
    throw new GardenAuthError('session_unavailable', 'Unable to load your Garden account.')
  }
  return data.user as GardenCustomer
}

export async function signOutGardenCustomer() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  }).catch(() => undefined)
}
