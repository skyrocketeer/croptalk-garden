import "./garden-game.css";
import { getSavedLocale, saveLocale, translateText, type Locale } from "./i18n";
import {
  GardenAuthError,
  getGardenCustomerSession,
  signInGardenCustomerWithEmail,
  signInGardenCustomerWithGoogle,
  signOutGardenCustomer,
  type GardenCustomer,
} from "./customer-auth";
import {
  GardenAPIError,
  getGardenPlots,
  getIrrigationOperation,
  getPlotIrrigationOperations,
  submitIrrigationRequest,
  type GardenIrrigationOperation,
  type GardenPlot,
} from "./garden-api";

type ViewKey = "garden" | "diary" | "marketplace" | "community" | "shop";
type MapMode = "real" | "animated";

const icons = {
  leaf: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5C11 3.5 5 6 5 12.5a5 5 0 0 0 5 5c6.5 0 9-6 10.5-14Zm-14 16c2-4 5-7 9-9" /></svg>`,
  xpBadge: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.8 5.5c-7.7.2-12.2 2.8-12.2 8.4a4.8 4.8 0 0 0 4.8 4.8c5.7 0 7.4-5.7 7.4-13.2Z" fill="#f6db65" stroke="#75a92e" stroke-width="1.3"/><path d="M7.5 20c2.2-4.1 5.2-6.6 8.8-8.7" fill="none" stroke="#4c9138" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  farmSeal: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3.5 42 11v12.1c0 10.3-7 17.4-18 21.4C13 40.5 6 33.4 6 23.1V11l18-7.5Z" fill="#e7c95b" stroke="#fff2a5" stroke-width="1.5"/><circle cx="24" cy="22" r="14" fill="#318a8a" stroke="#dff6d1" stroke-width="1.4"/><path d="M12.5 24c3.5-2.7 6.6-3.7 10.1-2.6 2.6.8 5.9.5 12.5-2.9v7.9c-3.2 5.2-7.3 8.1-12.5 8.1-4.5 0-8-2.9-10.1-7.8V24Z" fill="#62a94f"/><path d="M15 27c4.3-.9 8.6.5 12 4.2m-2.7-10c.6-4.4 3.2-7.2 7.8-8.5.6 4.9-1.8 8-7.8 8.5Z" fill="#b5df62" stroke="#edfac6" stroke-width=".8" stroke-linejoin="round"/><path d="M23.8 21.5v10.2" fill="none" stroke="#eff6c9" stroke-width="1.1" stroke-linecap="round"/></svg>`,
  rewardBadge: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 7.2 4.1v9.1L12 20.2l-7.2-4.2V6.9L12 2.8Z" fill="#64b9f5" stroke="#287bc1" stroke-width="1.4"/><path d="m12 5.6 4.7 2.7v5.7L12 16.8l-4.7-2.8V8.3L12 5.6Z" fill="#d7f2ff" stroke="#388ad0" stroke-width="1.2"/><path d="m9.4 11 1.7 1.7 3.6-3.9" fill="none" stroke="#287bc1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  gamepad: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 8.2h9.6a4.3 4.3 0 0 1 4.1 3.1l1 3.9a2.8 2.8 0 0 1-4.5 2.8l-2.2-1.8H8.8l-2.2 1.8a2.8 2.8 0 0 1-4.5-2.8l1-3.9a4.3 4.3 0 0 1 4.1-3.1Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.4 11v4m-2-2h4m6.8-.8h.01m2 2h.01" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  google: `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4H24v7.6h11A12 12 0 0 1 31 34l6.2 5.2c4.1-3.8 6.4-9.1 6.4-14.7Z"/><path fill="#4285F4" d="M24 44c5.4 0 10-1.8 13.3-4.8L31 34c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4l-6.4 5C9.5 39.3 16.2 44 24 44Z"/><path fill="#34A853" d="M12.6 27.6a12 12 0 0 1 0-7.2l-6.4-5a20 20 0 0 0 0 17.2l6.4-5Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4 16.2 4 9.5 8.7 6.2 15.4l6.4 5C14.2 15.6 18.7 12 24 12Z"/></svg>`,
  livestock: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8 4 5 3 9l3 2m11-3 3-3 1 4-3 2M6 10a6 6 0 0 1 12 0v4a6 6 0 0 1-12 0v-4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 13h.01M15 13h.01m-4 3c.7.6 1.3.6 2 0m-1-3v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  avatar: `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="avatarBg" x1="4" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse"><stop stop-color="#f8d8a4"/><stop offset="1" stop-color="#e9a86f"/></linearGradient></defs><circle cx="20" cy="20" r="19" fill="url(#avatarBg)"/><path d="M8 37c1.4-7.2 5.5-10.8 12-10.8S30.6 29.8 32 37" fill="#478a55"/><path d="M12.4 17c0-7.1 3.3-10.8 8-10.8 4.9 0 7.5 3.7 7.5 9.8v3.6c0 5.4-3.3 8.9-8 8.9s-7.5-3.8-7.5-9.2V17Z" fill="#f5bd88"/><path d="M11.8 17.6c-.2-7.8 3-12.1 8.9-12.1 5.7 0 8.8 4.1 8.2 11-1.7-.8-3-2-3.8-4.1-3.1 2.6-7.2 3.7-13.3 3.7Z" fill="#513d31"/><circle cx="17.2" cy="19" r=".8" fill="#3a302d"/><circle cx="24.4" cy="19" r=".8" fill="#3a302d"/><path d="M18.2 23.1c1.3 1 2.7 1 4 0" fill="none" stroke="#b86a58" stroke-width="1" stroke-linecap="round"/></svg>`,
  more: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>`,
  plot: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Zm0 0 8 4.6m8-4.6-8 4.6m0 0V21" /></svg>`,
  diary: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h12v16H6a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Zm2 5h8m-8 4h8m-8 4h5" /></svg>`,
  pin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.3" /></svg>`,
  task: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8m-9 0H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2h-2M8 4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2M7 12h10m-10 4h7" /></svg>`,
  trophy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v4m-4 3h8m-7-3h6v3H9v-3Z" /></svg>`,
  people: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20m7-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.7a4 4 0 0 1 0 7.4m6 9.3v-1.5a4 4 0 0 0-3-3.9" /></svg>`,
  water: `<svg class="action-art action-art-water" viewBox="0 0 48 48" aria-hidden="true">
    <ellipse cx="25" cy="40" rx="13" ry="2.5" fill="#1f83c3" opacity=".2"/>
    <path d="M15 20h21l-2.3 17H17.3L15 20Z" fill="url(#canBody)" stroke="#1477b8" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M17 21.5h17l-.6 4H17.6z" fill="#59d4ff" opacity=".8"/>
    <path d="M19 20c-1.5-8 1.8-12 7-12s8.4 4 7 12" fill="none" stroke="#1686cb" stroke-width="3.2" stroke-linecap="round"/>
    <path d="m16 23-8-5.5-3 2.2 8.6 9.1" fill="url(#canSpout)" stroke="#1477b8" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="m4.5 18.8 1.8-3 3.1 1.7-2.1 2.8z" fill="#50cfff" stroke="#1477b8" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M9 13c-.8-1.3-.6-2.3.3-3.3.9 1 .9 2 .1 3.3m-4.2-1.2c-.6-1-.4-1.9.4-2.6.7.9.6 1.7-.1 2.6" fill="#4cc8ff"/>
    <path d="M20 29h10" stroke="#a8efff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
    <defs><linearGradient id="canBody" x1="15" y1="19" x2="34" y2="38" gradientUnits="userSpaceOnUse"><stop stop-color="#4fcaff"/><stop offset="1" stop-color="#0875c5"/></linearGradient><linearGradient id="canSpout" x1="7" y1="17" x2="16" y2="29" gradientUnits="userSpaceOnUse"><stop stop-color="#45caff"/><stop offset="1" stop-color="#0875c5"/></linearGradient></defs>
  </svg>`,
  harvest: `<svg class="action-art action-art-hand" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M17.4 42.5c-1.2-2.2-2.1-4.4-3.2-6.2l-4.4-7.5c-1.1-1.9-.5-4.1 1.1-4.8 1.5-.7 3.1.1 4.1 1.7l3.1 4.7-1.4-17.2c-.2-2 1-3.4 2.8-3.5 1.7-.1 2.8 1.1 3 3l1.1 10.6-.5-14c-.1-1.9 1.1-3.2 2.8-3.2s2.8 1.2 2.8 3.1l.4 13.7.5-10.8c.1-1.8 1.3-2.9 2.9-2.8 1.7.1 2.6 1.4 2.5 3.3l-.5 11.5 1.8-6.4c.5-1.7 1.8-2.5 3.3-2.1 1.6.4 2.2 1.8 1.7 3.6l-3.1 12.2c-1.5 6.1-5.5 10.1-11.4 10.1h-9.4Z" fill="url(#handFill)" stroke="#dd9b27" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="m20.6 29-.6-13.8m6.1 13.2-.3-17.2m5.7 17 .5-14.1m5 14.7 1.3-6.4" fill="none" stroke="#f3b840" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M11.7 17.2c-1.2-.8-1.8-2-1.7-3.4m27.7-1.7c1.1-.9 1.6-2.1 1.4-3.6" fill="none" stroke="#d89427" stroke-width="1.5" stroke-linecap="round"/>
    <defs><linearGradient id="handFill" x1="15" y1="10" x2="33" y2="42" gradientUnits="userSpaceOnUse"><stop stop-color="#fff18a"/><stop offset="1" stop-color="#ffbd38"/></linearGradient></defs>
  </svg>`,
  seedling: `<svg class="action-art action-art-seedling" viewBox="0 0 48 48" aria-hidden="true">
    <ellipse cx="24" cy="39.5" rx="14" ry="2.7" fill="#5a9637" opacity=".22"/>
    <path d="M23.7 30.5c.2-7.2 1.1-11.1 3.1-15.5" fill="none" stroke="#3b9a45" stroke-width="3" stroke-linecap="round"/>
    <path d="M26.8 18.4c-1.1-6.3 2.1-10.8 8.8-11.3 1.2 6.2-1.6 10.4-8.8 11.3Z" fill="url(#leafRight)" stroke="#438d36" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M25.5 22c-1.7-6.5-6.1-9-12.3-6.4.8 6.1 5 9 12.3 6.4Z" fill="url(#leafLeft)" stroke="#438d36" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="m25.6 21.1 6.8-9.3M24.7 21.5l-7.9-4" fill="none" stroke="#b9e872" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M10 29.2c4.4 1.3 9.1 1.9 14 1.9s9.6-.6 14-1.9l-2.4 9.4H12.4L10 29.2Z" fill="url(#soil)" stroke="#98602b" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M10.6 29.3c4.3 1.5 8.8 2.2 13.4 2.2s9.1-.7 13.4-2.2" fill="none" stroke="#b87a3c" stroke-width="2" stroke-linecap="round"/>
    <circle cx="18" cy="35.5" r="1" fill="#e8ae63"/><circle cx="29.7" cy="36.4" r=".9" fill="#e8ae63"/>
    <defs><linearGradient id="leafRight" x1="26" y1="7" x2="37" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#9be249"/><stop offset="1" stop-color="#39a33c"/></linearGradient><linearGradient id="leafLeft" x1="14" y1="15" x2="25" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#b4e85a"/><stop offset="1" stop-color="#54b843"/></linearGradient><linearGradient id="soil" x1="24" y1="29" x2="24" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#bd813d"/><stop offset="1" stop-color="#8c5528"/></linearGradient></defs>
  </svg>`,
  sun: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  search: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.6 4.6 0 0 1 8.8-1.9 4.6 4.6 0 0 1 8.8 1.9Z"/></svg>`,
  comment: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>`,
  basket: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 2 10h12l2-10H4Zm-1-3h18M9 7l3-4 3 4m-7 7v3m4-3v3m4-3v3"/></svg>`,
  store: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v10h16V10M3 10l2-6h14l2 6a3 3 0 0 1-5 2 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-5-2Zm5 10v-5h8v5"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>`,
  farm: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-7 9 7v9H3v-9Zm5 9v-6h8v6M7 11h.01M12 11h.01M17 11h.01"/></svg>`,
  language: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h12M10 3v2m4 0c-.7 4-3.4 7.3-7.5 9M6 8c1.3 2.7 3.5 4.7 6.5 6m3.5-2 4.5 9m-7-3h5"/><path d="m16.2 18h4"/></svg>`,
};

const englishCopy: Record<string, string> = {
  "Vườn của bạn": "Your Garden",
  "Vườn của tôi": "My Garden",
  "VƯỜN CỦA TÔI": "MY GARDEN",
  "KHU VƯỜN SỐ": "VIRTUAL GARDEN",
  "VƯỜN ẢO": "VIRTUAL GARDEN",
  "Vườn ảo": "Virtual garden",
  "Vườn": "Garden",
  "Nhật ký canh tác": "Farm diary",
  "Nhật ký": "Diary",
  "GHI CHÉP": "DIARY",
  "GHI CHÉP TỪ NÔNG TRẠI": "FARM RECORDS",
  "CẬP NHẬT TỪ NÔNG TRẠI": "FARM UPDATES",
  "Marketplace": "Marketplace",
  "Đăng nhập vào khu vườn": "Sign in to your garden",
  "Dùng tài khoản Croptalk đã xác minh email để xem các lô đất được liên kết.": "Use your verified Croptalk account to view linked plots.",
  "Đăng nhập với email": "Sign in with email",
  "Đăng nhập với Google": "Continue with Google",
  "Đăng nhập trải nghiệm": "Try the garden",
  "TÀI KHOẢN THỬ": "TEST ACCOUNT",
  "Tài khoản này chỉ dùng để kiểm thử giao diện. Dữ liệu không đại diện cho hoạt động hay sản lượng thật.": "This account is for interface testing only. Its data does not represent real farm activity or produce.",
  "Tài khoản thử nghiệm": "Test account",
  "Thao tác nông trại bị tắt với tài khoản thử nghiệm.": "Farm actions are disabled for this test account.",
  "Email": "Email",
  "Mật khẩu": "Password",
  "Đăng nhập": "Sign in",
  "Đang đăng nhập…": "Signing in…",
  "Đăng xuất": "Sign out",
  "Lô đất của tôi": "My plots",
  "Chưa có lô đất nào được liên kết với tài khoản này.": "No plots are linked to this account yet.",
  "Đang tải lô đất…": "Loading your plots…",
  "Không thể tải lô đất. Hãy thử tải lại.": "Unable to load plots. Try again.",
  "Yêu cầu tưới nước": "Request irrigation",
  "Gửi yêu cầu tưới nước?": "Send irrigation request?",
  "Quản lý trang trại sẽ phân công nhân viên. Vườn chỉ cập nhật sau khi công việc được xác minh.": "A farm manager will assign a worker. Your garden updates only after the work is verified.",
  "Gửi yêu cầu": "Send request",
  "Đang gửi…": "Sending…",
  "Chờ quản lý phân công": "Awaiting manager assignment",
  "Đã phân công nhân viên": "Worker assigned",
  "Nhân viên đang thực hiện": "Worker in progress",
  "Chờ quản lý xác minh": "Awaiting manager verification",
  "Đã hoàn tất và xác minh": "Completed and verified",
  "Yêu cầu chưa thể hoàn tất": "Request could not be completed",
  "Yêu cầu đã hủy": "Request cancelled",
  "Hủy": "Cancel",
  "Cửa hàng": "Shop",
  "CỬA HÀNG CROPTALK": "CROPTALK SHOP",
  "NÔNG SẢN THỰC TẾ": "PHYSICAL PRODUCE",
  "Cộng đồng": "Community",
  "Nhiệm vụ": "Quests",
  "Thành tựu": "Achievements",
  "Bạn bè": "Friends",
  "Sắp ra mắt": "Coming soon",
  "Điều hướng chính": "Main navigation",
  "Điều hướng chính trên điện thoại": "Main navigation on mobile",
  "Tính năng này sẽ sớm có mặt.": "This section is coming soon.",
  "Điểm XP chưa có dữ liệu": "XP balance unavailable",
  "Thông tin tài khoản": "Account information",
  "Điểm thưởng chưa có dữ liệu": "Reward balance unavailable",
  "Trò chơi": "Game controls",
  "Hồ sơ": "Profile",
  "Tùy chọn khác": "More options",
  "VƯỜN ẢO ĐANG PHÁT TRIỂN!": "YOUR VIRTUAL GARDEN IS GROWING!",
  "Vườn ảo đang phát triển!": "Your virtual garden is growing!",
  "Chào bạn, người làm vườn!": "Welcome, gardener!",
  "Cảnh khu vườn số không phải ảnh chụp nông trại thật.":
    "This digital garden view is not a real farm photo.",
  "Kết nối ô trồng để theo dõi canh tác thật. Cảnh game không tạo sản lượng.":
    "Link a real plot to follow farm activity. The game scene does not create produce.",
  "Thực tế": "Real",
  "Hoạt họa": "Animated",
  "Chế độ hiển thị khu vườn": "Garden display mode",
  "Thời tiết hôm nay": "Weather today",
  "Nắng đẹp": "Sunny",
  "Xà lách": "Lettuce",
  "2h 30m · vườn ảo": "2h 30m · virtual garden",
  "Luống xà lách ảo · 2 giờ 30 phút":
    "Virtual lettuce bed · 2h 30m",
  "ẢNH VƯỜN THẬT": "REAL FARM IMAGE",
  "Chưa có ảnh thực tế": "No real farm image yet",
  "Ảnh nông trại sẽ hiển thị tại đây khi được kết nối với ô trồng của bạn.":
    "A farm image will appear here once it is linked to your plot.",
  "Khu vực trong vườn ảo": "Virtual garden areas",
  "Tưới nước": "Water",
  "Thu hoạch": "Harvest",
  "Xem thêm": "More",
  "KHU VƯỜN CỦA TÔI": "MY GARDEN",
  "Mua hạt giống": "Buy seeds",
  "Chăm sóc": "Care",
  "Chăn nuôi": "Livestock",
  "Gieo trồng": "Planting",
  "Đơn hàng": "Orders",
  "Nhiệm vụ hôm nay": "Today's tasks",
  "Gieo trồng xà lách": "Plant lettuce",
  "Chọn luống để xem tiến trình.": "Choose a plot to see its progress.",
  "Tưới nước cho vườn ảo.": "Water the virtual garden.",
  "Hoạt động hôm nay": "Today's activity",
  "Chọn luống": "Choose a plot",
  "Xà lách · vườn ảo": "Lettuce · virtual garden",
  "Tưới vườn ảo": "Water virtual garden",
  "Chưa có sản lượng để thu hoạch": "No produce available to harvest",
  "Đã tưới vườn ảo": "Virtual garden watered",
  "Tưới nước trong vườn ảo": "Water the virtual garden",
  "Chi tiết mảnh vườn": "Garden plot details",
  "Ảnh ô trồng chưa có": "No plot photo yet",
  "Giống:": "Variety:",
  "Thời gian thu hoạch dự kiến:": "Estimated harvest:",
  "còn 4 ngày": "4 days left",
  "8 – 12 kg (tùy điều kiện thực tế)": "8–12 kg (depending on actual conditions)",
  "Giai đoạn sinh trưởng": "Growth stages",
  "Phát triển": "Growing",
  "Ra lá": "Leafing",
  "Liên kết sản xuất thực tế": "Real farm connection",
  "Nông trại HydroWorks – Đà Lạt": "HydroWorks Farm – Da Lat",
  "Đang được chăm sóc theo quy trình hữu cơ": "Being cared for using organic methods",
  "Xem chi tiết": "View details",
  "Ảnh và nhật ký sẽ xuất hiện khi có dữ liệu từ nông trại.": "Photos and records will appear when farm data is connected.",
  "Chưa chọn giống": "No variety selected",
  "Ngày gieo": "Sowing date",
  "Thời gian thu hoạch": "Harvest timing",
  "Sản lượng dự kiến": "Estimated yield",
  "Kết nối ô trồng": "Link a plot",
  "Chờ liên kết": "Awaiting connection",
  "Thông tin nông trại sẽ hiển thị sau khi kết nối ô trồng.": "Farm details will appear after a plot is linked.",
  "Gieo hạt": "Sowing",
  "Chưa bắt đầu": "Not started",
  "KẾT NỐI THỰC TẾ": "REAL FARM CONNECTION",
  "Ô trồng riêng": "Dedicated Plot",
  "Ô trồng": "Plot",
  "Chưa liên kết": "Not linked",
  "Liên kết một ô trồng thực tế để xem nhật ký canh tác và cập nhật từ nông trại.":
    "Link a real plot to see the farm diary and updates from the farm.",
  "Tiến trình theo dõi": "Tracking progress",
  "Liên kết ô trồng": "Plot linked",
  "Mùa vụ": "Season",
  "Chưa có dữ liệu": "No data yet",
  "Cập nhật gần nhất": "Last update",
  "Mở nhật ký canh tác": "Open farm diary",
  "Cây trang trí trong vườn ảo không đại diện cho sản lượng thật.":
    "Decorative virtual plants do not represent real produce.",
  "Chưa có ghi chép": "No entries yet",
  "Hoạt động canh tác sẽ hiển thị sau khi ô trồng được liên kết.":
    "Farm activity will appear after a plot is linked.",
  "Sản lượng thực tế từ nông trại sẽ xuất hiện tại đây. Cây trong game không tạo ra hàng hóa.":
    "Physical produce from the farm will appear here. Game plants do not create goods.",
  "Trao đổi - Mua bán - Kết nối cộng đồng": "Swap · Trade · Connect",
  "Sản phẩm từ nông trại cộng đồng": "Products from community farms",
  "Hạt giống": "Seeds",
  "Vật phẩm trang trí": "Decorations",
  "Nâng cấp": "Upgrades",
  "Vật phẩm khác": "Other items",
  "Danh mục cửa hàng": "Shop categories",
  "Hạt giống, vật phẩm trang trí, nâng cấp và vật phẩm khác.": "Seeds, decorations, upgrades, and other items.",
  "Danh mục sẽ mở bán khi cửa hàng được kết nối.": "Items will be available when the shop is connected.",
  "Sản lượng của tôi": "My produce",
  "Tồn kho vật lý": "Physical inventory",
  "Lịch sử giao dịch": "Transaction history",
  "Chưa có sản lượng": "No produce yet",
  "Sản lượng thực tế sẽ hiển thị tại đây khi có dữ liệu.": "Physical produce will appear here when data is available.",
  "Chưa có giao dịch": "No transactions yet",
  "Lịch sử giao dịch sản lượng sẽ hiển thị tại đây.": "Produce transaction history will appear here.",
  "Mở kho sản lượng": "Open produce inventory",
  "Xem sản lượng và giao dịch": "View physical inventory and transactions",
  "Tài khoản": "Account",
  "Quay lại vườn": "Back to garden",

  "Danh mục sản phẩm": "Product categories",
  "Tất cả": "All",
  "Rau củ": "Vegetables",
  "Trái cây": "Fruit",
  "Thịt - Trứng": "Meat & Eggs",
  "Sản phẩm khác": "Other products",
  "Tin tức": "News",
  "Chia sẻ": "Sharing",
  "Hỏi đáp": "Questions",
  "Lan Anh": "Lan Anh",
  "Minh Tuấn": "Minh Tuan",
  "2 giờ trước": "2 hours ago",
  "5 giờ trước": "5 hours ago",
  "Ai có nhu cầu đổi lấy xà lách lấy 10 quả trứng gà không ạ? Mình ở khu vực Hà Nội.": "Would anyone like to trade lettuce for 10 eggs? I am in Hanoi.",
  "Vườn của mình vừa thu hoạch đợt cà chua bi, chất lượng rất tốt! Sẵn sàng bán số lượng lớn cho các chợ bán.": "I just harvested cherry tomatoes from my garden, and the quality is excellent! Available in bulk for markets.",
  "Bình luận": "Comments",
  "Không có bài viết trong mục này.": "No posts in this category.",
  "Bài viết cộng đồng": "Community posts",
  "Xà lách Romaine": "Romaine lettuce",
  "Cà chua bi": "Cherry tomatoes",
  "Trứng gà sạch": "Clean chicken eggs",
  "Rau muống": "Water spinach",
  "10 quả": "10 eggs",
  "Tìm kiếm sản phẩm...": "Search products...",
  "Tìm kiếm sản phẩm": "Search products",
  "Trang trại": "Farm",
  "Tất cả trang trại": "All farms",
  "Giá": "Price",
  "Lọc theo trang trại": "Filter by farm",
  "Lọc theo giá": "Filter by price",
  "Mọi mức giá": "Any price",
  "Dưới 100 HWK": "Under 100 HWK",
  "100–150 HWK": "100–150 HWK",
  "Trên 150 HWK": "Over 150 HWK",
  "Sắp xếp": "Sort",
  "Sắp xếp sản phẩm": "Sort products",
  "Mặc định": "Default",
  "Giá thấp đến cao": "Price: low to high",
  "Giá cao đến thấp": "Price: high to low",
  "Đã thu hoạch": "Harvested",
  "Đang phát triển": "Growing",
  "Xà lách Romaine tươi": "Fresh romaine lettuce",
  "Cà chua bi đỏ trên cành": "Red cherry tomatoes on the vine",
  "Trứng gà nâu trong giỏ": "Brown eggs in a basket",
  "Rau muống tươi": "Fresh water spinach",
  "Bỏ yêu thích": "Remove from favorites",
  "Thêm vào yêu thích": "Add to favorites",
  "Có thể giao ngay": "Ready to deliver",
  "Có thể giao dịch trước thu hoạch": "Pre-harvest trading available",
  "Trang trại Mộc Châu": "Moc Chau Farm",
  "Trang trại Đà Lạt": "Da Lat Farm",
  "Trang trại Của Chị": "Chi's Farm",
  "Trang trại GreenFarm": "GreenFarm",
  "Không tìm thấy sản phẩm phù hợp.": "No matching products found.",
  "Thông tin sản phẩm và khả năng giao hàng cần được xác nhận với từng trang trại.":
    "Product details and delivery availability must be confirmed with each farm.",
  "Đóng": "Close",
  "Thông tin sản phẩm": "Product information",
  "Sản phẩm và thông tin chi tiết sẽ do nông trại xác nhận.":
    "Product details will be confirmed by the farm.",
  "Đơn vị phân phối:": "Distributor:",
  "Tổng lượng": "Total quantity",
  "Giá / ": "Price / ",
  "Giao dịch": "Transaction",
  "Chưa mở bán": "Not available yet",
  "Giảm số lượng": "Decrease quantity",
  "Tăng số lượng": "Increase quantity",
  "Mua ngay": "Buy now",
  "Sản phẩm được bao chứng bởi sản lượng vật lý từ nông trại thật.":
    "Product availability is backed by physical produce from a real farm.",
};

const headerCopy: Record<Locale, Record<string, string>> = {
  vi: {
    myGarden: "Vườn của tôi",
    marketplace: "Marketplace",
    store: "Cửa hàng",
    community: "Cộng đồng",
    garden: "Vườn",
    diary: "Nhật ký",
    language: "Ngôn ngữ",
  },
  en: {
    myGarden: "My Garden",
    marketplace: "Marketplace",
    store: "Shop",
    community: "Community",
    garden: "Garden",
    diary: "Diary",
    language: "Language",
  },
};

let activeLocale: Locale = getSavedLocale();
document.documentElement.lang = activeLocale;

function localizeDom(root: ParentNode): void {
  if (activeLocale === "en") {
    const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    while (textWalker.nextNode()) textNodes.push(textWalker.currentNode as Text);
    textNodes.forEach((node) => {
      node.nodeValue = translateText(node.nodeValue ?? "", activeLocale, englishCopy);
    });

    root
      .querySelectorAll<HTMLElement>("[aria-label], [title], [placeholder], [alt]")
      .forEach((element) => {
        ["aria-label", "title", "placeholder", "alt"].forEach((attribute) => {
          const value = element.getAttribute(attribute);
          if (value) element.setAttribute(attribute, translateText(value, activeLocale, englishCopy));
        });
      });
  }

  root.querySelectorAll<HTMLElement>("[data-header-copy]").forEach((element) => {
    const key = element.dataset.headerCopy;
    if (key) element.textContent = headerCopy[activeLocale][key] ?? element.textContent ?? "";
  });
}

const views: Record<ViewKey, true> = {
  garden: true,
  diary: true,
  marketplace: true,
  community: true,
  shop: true,
};

const marketplaceProducts = [
  {
    name: "Xà lách Romaine",
    kind: "Rau củ",
    farm: "Mộc Châu",
    price: "120",
    quantity: "2 kg",
    status: "Đã thu hoạch",
    image: "/images/market-products-sheet.png",
    photoClass: "photo-lettuce",
    alt: "Xà lách Romaine tươi",
  },
  {
    name: "Cà chua bi",
    kind: "Rau củ",
    farm: "Đà Lạt",
    price: "180",
    quantity: "3 kg",
    status: "Đã thu hoạch",
    image: "/images/market-products-sheet.png",
    photoClass: "photo-tomatoes",
    alt: "Cà chua bi đỏ trên cành",
  },
  {
    name: "Trứng gà sạch",
    kind: "Thịt - Trứng",
    farm: "Của Chị",
    price: "150",
    quantity: "10 quả",
    status: "Đã thu hoạch",
    image: "/images/market-products-sheet.png",
    photoClass: "photo-eggs",
    alt: "Trứng gà nâu trong giỏ",
  },
  {
    name: "Rau muống",
    kind: "Rau củ",
    farm: "GreenFarm",
    price: "80",
    quantity: "5 kg",
    status: "Đang phát triển",
    image: "/images/market-products-sheet.png",
    photoClass: "photo-morning-glory",
    alt: "Rau muống tươi",
  },
];

let activeCategory = "Tất cả";
let searchTerm = "";
let activeFarm = "Tất cả trang trại";
let productQuantity = 1;
let activePrice = "Mọi mức giá";
let activeSort = "Mặc định";
let favoriteProducts = new Set<string>();
let selectedProduct: (typeof marketplaceProducts)[number] | undefined;
let activeCommunityTab = "Tất cả";
const likedCommunityPosts = new Set<string>();

const communityPosts = [
  {
    id: "lan-anh-question",
    author: "Lan Anh",
    initials: "LA",
    time: "2 giờ trước",
    kind: "Hỏi đáp",
    message: "Ai có nhu cầu đổi lấy xà lách lấy 10 quả trứng gà không ạ? Mình ở khu vực Hà Nội.",
    photos: [
      { photoClass: "photo-lettuce", alt: "Xà lách xanh" },
      { photoClass: "photo-eggs", alt: "Trứng gà trong giỏ" },
    ],
    likes: 24,
    comments: 8,
  },
  {
    id: "minh-tuan-share",
    author: "Minh Tuấn",
    initials: "MT",
    time: "5 giờ trước",
    kind: "Chia sẻ",
    message: "Vườn của mình vừa thu hoạch đợt cà chua bi, chất lượng rất tốt! Sẵn sàng bán số lượng lớn cho các chợ bán.",
    photos: [{ photoClass: "photo-tomatoes", alt: "Cà chua bi chín đỏ" }],
    likes: 56,
    comments: 12,
  },
];

let activeMapMode: MapMode = "animated";
const GARDEN_DETAIL_ROUTE = "garden/plots/romaine";
const MY_PRODUCE_ROUTE = "garden/produce";
type ProduceTab = "inventory" | "history";
let farmDetailsOpen = window.location.hash.slice(1) === GARDEN_DETAIL_ROUTE;
let myProduceOpen = window.location.hash.slice(1) === MY_PRODUCE_ROUTE;
let activeProduceTab: ProduceTab = "inventory";
let farmSummaryOpen = false;
let gardenCustomer: GardenCustomer | null = null;
let gardenTestMode = false;
const GARDEN_TEST_SESSION_KEY = "croptalk-garden-test-session";
const testGardenPlot: GardenPlot = {
  id: "test-plot-romaine",
  farm_id: "test-farm",
  farm_name: "Trang trại kiểm thử",
  farm_status: "ACTIVE",
  name: "Luống xà lách",
  code: "CT-01",
  area: 1,
  area_unit: "m²",
  status: "ACTIVE",
  active_cycle: { id: "test-cycle-romaine", name: "Mùa vụ xà lách" },
  active_crop: {
    id: "test-crop-romaine",
    name: "Xà lách Romaine",
    variety: "Romaine",
    growth_stage: "GROWING",
  },
  available_actions: [],
};
let gardenAuthLoading = true;
let gardenAuthError = "";
let gardenLoginPending = false;
let gardenPlots: GardenPlot[] = [];
let gardenPlotsLoading = false;
let gardenPlotsError = "";
let selectedPlotId = "";
let irrigationConfirmOpen = false;
let irrigationSubmitting = false;
let irrigationRequestKey = "";
let irrigationRequestError = "";
let irrigationStatusError = "";
const irrigationOperationsByPlot = new Map<string, GardenIrrigationOperation>();
let operationPollTimer: number | undefined;

const cropDetailPopup = () => selectedProduct ? `<div class="crop-detail-backdrop" data-close-crop-detail>
  <section class="crop-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-detail-title">
    <button class="crop-detail-close" type="button" aria-label="Đóng" data-close-crop-detail>×</button>
    <div class="crop-detail-summary"><div class="crop-detail-photo"><img class="${selectedProduct.photoClass}" src="${selectedProduct.image}" alt="${selectedProduct.alt}" /></div><div class="crop-detail-overview">
      <h2 id="crop-detail-title">${selectedProduct.name}</h2><span class="crop-status">${selectedProduct.status}</span><p class="crop-farm">${icons.farm} Trang trại ${selectedProduct.farm}</p>
      <div class="crop-detail-metrics"><div><strong>${selectedProduct.quantity}</strong><span>Tổng lượng</span></div><div><strong>${selectedProduct.price} HWK</strong><span>Giá / ${selectedProduct.quantity}</span></div></div><span class="delivery-badge">Có thể giao ngay</span>
    </div></div>
    <div class="crop-detail-product"><h3>Thông tin sản phẩm</h3><p>${icons.leaf} Chất lượng: Loại 1 (đạt tiêu chuẩn VietGAP)</p><p>${icons.harvest} Ngày thu hoạch: 18/04/2025</p><p>${icons.harvest} Hạn sử dụng: 5 ngày</p><p>${icons.farm} Đơn vị phân phối: Nông trại ${selectedProduct.farm}</p></div>
    <div class="crop-detail-purchase"><label for="crop-quantity">Số lượng</label><div class="crop-detail-buyrow"><div class="quantity-stepper"><button type="button" data-quantity="-1" aria-label="Giảm số lượng">−</button><output id="crop-quantity">${productQuantity}</output><button type="button" data-quantity="1" aria-label="Tăng số lượng">+</button></div><span>(${selectedProduct.quantity})</span><button class="buy-now-button" type="button">Mua ngay</button></div></div>
    <p class="crop-detail-truth">${icons.plot} Sản phẩm được bao chứng bởi sản lượng vật lý từ nông trại thật.</p>
  </section>
</div>` : "";

const farmDetailContent = () => {
  const plot = selectedGardenPlot();
  if (!gardenCustomer || !plot) return gardenContent();
  return `
    <section class="farm-detail-page" aria-labelledby="farm-detail-title">
      <button class="farm-detail-back" type="button" data-close-farm-details><span>‹</span> Quay lại</button>
      <h1 class="farm-detail-title" id="farm-detail-title">${escapeHTML(plot.name)}</h1>
      ${gardenTestMode ? `<p class="garden-test-disclaimer">Tài khoản này chỉ dùng để kiểm thử giao diện. Dữ liệu không đại diện cho hoạt động hay sản lượng thật.</p>` : ""}
      <section class="farm-popup-summary" aria-label="Thông tin lô đất">
        <div class="farm-popup-photo"><span class="garden-auth-mark">${icons.plot}</span></div>
        <div class="farm-popup-overview">
          <div class="farm-popup-name-row"><h3>${escapeHTML(plot.code)}</h3><span class="farm-popup-growing">${plot.status === "ACTIVE" ? "Đang hoạt động" : "Để trống"}</span></div>
          <p><span>Trang trại:</span> ${escapeHTML(plot.farm_name)}</p>
          <p><span>Cây trồng:</span> ${escapeHTML(plot.active_crop?.name ?? "Chưa có cây trồng đang hoạt động")}</p>
          ${plot.active_cycle ? `<p><span>Chu kỳ:</span> ${escapeHTML(plot.active_cycle.name)}</p>` : ""}
          ${plot.area != null ? `<p><span>Diện tích:</span> ${escapeHTML(plot.area)} ${escapeHTML(plot.area_unit)}</p>` : ""}
        </div>
      </section>
    </section>`;
};

const escapeHTML = (value: unknown): string =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });

const selectedGardenPlot = () => gardenPlots.find((plot) => plot.id === selectedPlotId);

const operationIsOpen = (operation?: GardenIrrigationOperation): boolean =>
  Boolean(operation && !["COMPLETED", "FAILED", "CANCELLED"].includes(operation.status));

const irrigationStatusLabel = (status: GardenIrrigationOperation["status"]): string => {
  const labels: Record<GardenIrrigationOperation["status"], string> = {
    AWAITING_ASSIGNMENT: "Chờ quản lý phân công",
    ASSIGNED: "Đã phân công nhân viên",
    IN_PROGRESS: "Nhân viên đang thực hiện",
    AWAITING_VERIFICATION: "Chờ quản lý xác minh",
    COMPLETED: "Đã hoàn tất và xác minh",
    FAILED: "Yêu cầu chưa thể hoàn tất",
    CANCELLED: "Yêu cầu đã hủy",
  };
  return labels[status];
};

const customerLoginContent = () => `
  <section class="garden-auth-view" aria-labelledby="garden-auth-title">
    <div class="garden-auth-card">
      <span class="garden-auth-mark">${icons.leaf}</span>
      <p class="card-kicker">CROPTALK GARDEN</p>
      <h1 id="garden-auth-title">Đăng nhập vào khu vườn</h1>
      <p>Dùng tài khoản Croptalk đã xác minh email để xem các lô đất được liên kết.</p>
      ${gardenAuthError ? `<p class="garden-auth-error" role="alert">${escapeHTML(gardenAuthError)}</p>` : ""}
      <form class="garden-auth-form" data-garden-login-form>
        <label for="garden-email">Email</label>
        <input id="garden-email" name="email" type="email" autocomplete="username" required />
        <label for="garden-password">Mật khẩu</label>
        <input id="garden-password" name="password" type="password" autocomplete="current-password" required />
        <button class="game-button primary" type="submit" ${gardenLoginPending ? "disabled" : ""}>
          ${gardenLoginPending ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
      ${import.meta.env.DEV ? `<button class="game-button secondary garden-test-login" type="button" data-garden-test-login ${gardenLoginPending ? "disabled" : ""}>${icons.leaf}<span>Đăng nhập trải nghiệm</span></button>` : ""}
      <div class="garden-auth-divider"><span>hoặc</span></div>
      <button class="game-button secondary garden-google-login" type="button" data-garden-google-login ${gardenLoginPending ? "disabled" : ""}>
        ${icons.google}<span>Đăng nhập với Google</span>
      </button>
    </div>
  </section>`;

const profileMenuContent = () => `
  <strong>Tài khoản</strong>
  ${gardenCustomer ? `<span class="profile-menu-customer">${escapeHTML(gardenCustomer.email)}</span>` : ""}
  <button type="button" data-open-my-produce>${icons.basket}<span>Sản lượng của tôi</span></button>
  <button type="button" data-upcoming>${icons.people}<span>Hồ sơ</span></button>
  ${gardenCustomer ? `<button type="button" data-garden-logout><span>Đăng xuất</span></button>` : ""}
`;

const plotSelectorContent = () => {
  if (gardenPlotsLoading) {
    return `<div class="garden-plots-state" role="status">Đang tải lô đất…</div>`;
  }
  if (gardenPlotsError) {
    return `<div class="garden-plots-state garden-plots-error" role="alert">${escapeHTML(gardenPlotsError)}</div>`;
  }
  if (gardenPlots.length === 0) {
    return `<div class="garden-plots-state">Chưa có lô đất nào được liên kết với tài khoản này.</div>`;
  }
  return gardenPlots
    .map((plot) => {
      const selected = plot.id === selectedPlotId;
      const cropName = plot.active_crop?.name ?? "Đất trống";
      const plotTitle = `${plot.name} · ${plot.code}`;
      return `<button
        class="garden-plot-option ${selected ? "is-selected" : ""}"
        type="button"
        data-select-garden-plot="${escapeHTML(plot.id)}"
        aria-pressed="${selected}"
        aria-expanded="${selected && farmSummaryOpen}"
        aria-label="Chọn ${escapeHTML(plotTitle)}, ${escapeHTML(cropName)}"
      >
        <span class="garden-plot-option-icon">${icons.plot}</span>
        <span class="garden-plot-option-copy">
          <strong>${escapeHTML(plot.code)} · ${escapeHTML(plot.name)}</strong>
          <span>${escapeHTML(cropName)}</span>
        </span>
        <span class="garden-plot-status ${plot.status === "ACTIVE" ? "is-active" : "is-fallow"}">${plot.status === "ACTIVE" ? "Đang hoạt động" : "Để trống"}</span>
      </button>`;
    })
    .join("");
};

const plotActionPanel = (plot: GardenPlot) => {
  const operation = irrigationOperationsByPlot.get(plot.id);
  const hasOpenOperation = operationIsOpen(operation);
  const canRequestIrrigation = plot.available_actions.includes("IRRIGATION") && !hasOpenOperation;
  return `
    <section class="plot-action-panel" aria-labelledby="plot-action-title">
      <button class="crop-summary-close" type="button" aria-label="Đóng" data-close-crop-summary>×</button>
      <div class="plot-action-heading">
        <div class="plot-action-art">${plot.active_crop ? icons.leaf : icons.plot}</div>
        <div>
          <span class="plot-test-kicker">${escapeHTML(plot.farm_name)} · #${escapeHTML(plot.code)}</span>
          <h2 id="plot-action-title">${escapeHTML(plot.name)}</h2>
          <p>${plot.active_crop ? escapeHTML(plot.active_crop.name) : "Chưa có cây trồng đang hoạt động"}</p>
        </div>
      </div>
      <h3>Chọn hành động</h3>
      <div class="plot-action-options">
        <button type="button" data-open-irrigation-confirm ${canRequestIrrigation ? "" : "disabled"}>
          ${icons.water}<strong>Tưới nước</strong>
          <span>${gardenTestMode ? "Thao tác nông trại không khả dụng trong tài khoản thử nghiệm." : canRequestIrrigation ? "Gửi yêu cầu đến nông trại" : hasOpenOperation ? "Đang có yêu cầu xử lý" : "Chưa đủ điều kiện"}</span>
        </button>
      </div>
      ${operation ? `
        <div class="plot-task-preview" role="status" aria-live="polite">
          <span class="plot-task-icon">${icons.people}</span>
          <div>
            <strong>${irrigationStatusLabel(operation.status)}</strong>
            <p>${operation.status === "COMPLETED" ? "Công việc đã được quản lý xác minh." : "Trạng thái được cập nhật từ quy trình công việc của nông trại."}</p>
          </div>
        </div>` : ""}
      ${irrigationStatusError ? `<p class="garden-auth-error" role="alert">${escapeHTML(irrigationStatusError)}</p>` : ""}
      ${irrigationConfirmOpen && canRequestIrrigation ? `
        <div class="plot-irrigation-confirm" role="group" aria-labelledby="irrigation-confirm-title">
          <h3 id="irrigation-confirm-title">Gửi yêu cầu tưới nước?</h3>
          <p>Quản lý trang trại sẽ phân công nhân viên. Khu vườn chỉ cập nhật sau khi công việc được xác minh.</p>
          ${irrigationRequestError ? `<p class="garden-auth-error" role="alert">${escapeHTML(irrigationRequestError)}</p>` : ""}
          <div class="plot-irrigation-confirm-actions">
            <button type="button" class="game-button secondary" data-cancel-irrigation ${irrigationSubmitting ? "disabled" : ""}>Hủy</button>
            <button type="button" class="game-button primary" data-confirm-irrigation ${irrigationSubmitting ? "disabled" : ""}>
              ${irrigationSubmitting ? "Đang gửi…" : "Gửi yêu cầu"}
            </button>
          </div>
        </div>` : ""}
    </section>`;
};

const gardenContent = () => {
  if (gardenAuthLoading) {
    return `<section class="garden-auth-view"><div class="garden-auth-card" role="status">Đang xác minh tài khoản Croptalk…</div></section>`;
  }
  if (!gardenCustomer) return customerLoginContent();
  const plot = selectedGardenPlot();
  const selectedOperation = plot ? irrigationOperationsByPlot.get(plot.id) : undefined;
  return `
  <div class="garden-dashboard">
    <div class="garden-layout has-no-detail">
      <section class="game-scene ${selectedOperation?.status === "COMPLETED" ? "is-irrigation-verified" : ""}" data-mode="${activeMapMode}" aria-label="Khu vườn">
        <img class="scene-art" src="/images/garden-world-map.png" alt="Khu vườn nông trại isometric với nhà kính, luống rau, lối đi và dòng suối." />
        <div class="scene-shade"></div>
        <div class="farm-identity-card">
          <span class="farm-identity-icon">${icons.leaf}</span>
          <span class="farm-identity-copy"><small>CROPTALK GARDEN</small><strong>${escapeHTML(gardenCustomer.name || gardenCustomer.email)}</strong>${gardenTestMode ? `<em class="garden-test-badge">TÀI KHOẢN THỬ</em>` : ""}</span>
        </div>
        <nav class="map-sidebar" aria-label="Khu vực trong vườn ảo">
          <button class="map-nav-item is-active" type="button" aria-current="page">${icons.leaf}<span>Vườn</span></button>
          <button class="map-nav-item" type="button" disabled title="Sắp ra mắt">${icons.task}<span>Nhiệm vụ</span></button>
          <button class="map-nav-item" type="button" disabled title="Sắp ra mắt">${icons.trophy}<span>Thành tựu</span></button>
          <button class="map-nav-item" type="button" disabled title="Sắp ra mắt">${icons.people}<span>Bạn bè</span></button>
        </nav>
        <div class="real-map-empty" ${activeMapMode === "real" ? "" : "hidden"}>
          <span class="map-pin-mark">${icons.pin}</span>
          <p class="card-kicker">ẢNH VƯỜN THẬT</p>
          <h2>Chưa có ảnh thực tế</h2>
          <p>Ảnh nông trại sẽ hiển thị tại đây khi được kết nối với lô đất của bạn.</p>
        </div>
        <div class="scene-topline">
          <div class="map-mode-switch" role="group" aria-label="Chế độ hiển thị khu vườn">
            <button class="map-mode-button ${activeMapMode === "real" ? "is-active" : ""}" type="button" data-map-mode="real" aria-pressed="${activeMapMode === "real"}">${icons.leaf}<span>Thực tế</span></button>
            <button class="map-mode-button ${activeMapMode === "animated" ? "is-active" : ""}" type="button" data-map-mode="animated" aria-pressed="${activeMapMode === "animated"}">${icons.gamepad}<span>Hoạt họa</span></button>
          </div>
        </div>
        <section class="game-weather" aria-label="Thời tiết trong khu vườn ảo">
          <div class="weather-heading"><span>Thời tiết hôm nay</span><span class="garden-mode-chip">VƯỜN ẢO</span></div>
          <div class="weather-reading"><span class="weather-icon">${icons.sun}</span><strong>28°C</strong><span>Nắng đẹp</span></div>
        </section>
        <section class="garden-plot-board" aria-labelledby="garden-plots-title">
          <div class="garden-plot-board-heading">
            <span>${icons.plot}</span>
            <strong id="garden-plots-title">Lô đất của tôi</strong>
            <span>${gardenPlots.length}</span>
          </div>
          <div class="garden-plot-list" aria-live="polite">${plotSelectorContent()}</div>
        </section>
        ${plot && farmSummaryOpen ? plotActionPanel(plot) : ""}
        <div class="scene-actions" aria-label="Thao tác vườn ảo">
          <button class="game-action produce-action" type="button" data-open-my-produce>
            <span class="game-action-icon">${icons.basket}</span><span>Sản lượng của tôi</span>
          </button>
        </div>
      </section>
    </div>
  </div>
  ${cropDetailPopup()}
`;
};

const diaryContent = () => `
  <section class="game-subview">
    <div class="subview-banner"><span class="subview-icon">${icons.diary}</span><div><p class="card-kicker">GHI CHÉP TỪ NÔNG TRẠI</p><h1>Nhật ký canh tác</h1></div></div>
    <div class="empty-game-state">
      <span class="empty-seed">${icons.leaf}</span>
      <div><h2>Chưa có ghi chép</h2><p>Nhật ký sẽ xuất hiện khi ô trồng thực tế được liên kết và hoạt động được ghi nhận.</p></div>
      <a class="game-button secondary" href="#garden" data-view="garden">Về khu vườn ${icons.arrow}</a>
    </div>
  </section>
`;

const communityContent = () => {
  const tabs = ["Tất cả", "Tin tức", "Chia sẻ", "Hỏi đáp"];
  const posts = communityPosts.filter(
    (post) => activeCommunityTab === "Tất cả" || post.kind === activeCommunityTab,
  );

  return `
    <section class="community-view" aria-labelledby="community-title">
      <h1 id="community-title">Cộng đồng</h1>
      <div class="community-tabs" role="tablist" aria-label="Lọc bài viết cộng đồng">
        ${tabs.map((tab) => `<button class="community-tab ${activeCommunityTab === tab ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeCommunityTab === tab}" data-community-tab="${tab}">${tab}</button>`).join("")}
      </div>
      <div class="community-post-list" aria-live="polite">
        ${posts.length ? posts.map((post) => {
          const liked = likedCommunityPosts.has(post.id);
          return `<article class="community-post">
            <header class="community-post-header">
              <span class="community-avatar ${post.id === "lan-anh-question" ? "avatar-lan" : "avatar-minh"}" role="img" aria-label="Ảnh đại diện ${post.author}">${post.id === "lan-anh-question" ? "👩🏻‍🌾" : "👨🏻‍🌾"}</span>
              <div class="community-author"><strong>${post.author}</strong><span>${post.time}</span></div>
              <button class="post-more" type="button" aria-label="Tùy chọn bài viết của ${post.author}">${icons.more}</button>
            </header>
            <p class="community-message">${post.message}</p>
            <div class="community-media ${post.photos.length === 1 ? "is-single" : ""}">
              ${post.photos.map((photo) => `<div class="community-photo ${photo.photoClass}" role="img" aria-label="${photo.alt}"></div>`).join("")}
            </div>
            <footer class="community-post-footer">
              <div class="community-reactions">
                <button class="community-like ${liked ? "is-liked" : ""}" type="button" data-community-like="${post.id}" aria-pressed="${liked}" aria-label="${liked ? "Bỏ thích" : "Thích"} bài viết của ${post.author}">${icons.heart}<span>${post.likes + Number(liked)}</span></button>
                <span class="community-comment-count" aria-label="${post.comments} bình luận">${icons.comment}<span>${post.comments}</span></span>
              </div>
            </footer>
          </article>`;
        }).join("") : `<div class="community-empty">${icons.people}<p>Không có bài viết trong mục này.</p></div>`}
      </div>
    </section>
  `;
};

const shopContent = () => `
  <section class="shop-view" aria-labelledby="shop-title">
    <header class="shop-page-heading"><div><p class="card-kicker">CỬA HÀNG CROPTALK</p><h1 id="shop-title">Cửa hàng</h1><p>Hạt giống, vật phẩm trang trí, nâng cấp và vật phẩm khác.</p></div></header>
    <section class="shop-category-grid" aria-label="Danh mục cửa hàng">
      <article class="shop-category-card">${icons.seedling}<h2>Hạt giống</h2><span>Sắp ra mắt</span></article>
      <article class="shop-category-card">${icons.leaf}<h2>Vật phẩm trang trí</h2><span>Sắp ra mắt</span></article>
      <article class="shop-category-card">${icons.trophy}<h2>Nâng cấp</h2><span>Sắp ra mắt</span></article>
      <article class="shop-category-card">${icons.basket}<h2>Vật phẩm khác</h2><span>Sắp ra mắt</span></article>
    </section>
    <p class="shop-coming-note">Danh mục sẽ mở bán khi cửa hàng được kết nối.</p>
  </section>
`;

const myProduceContent = () => `
  <section class="produce-page" aria-labelledby="my-produce-title">
    <button class="produce-back" type="button" data-close-my-produce><span>‹</span> Quay lại vườn</button>
    <header class="produce-page-heading"><p class="card-kicker">NÔNG SẢN THỰC TẾ</p><h1 id="my-produce-title">Sản lượng của tôi</h1><p>Xem sản lượng và giao dịch.</p></header>
    <div class="produce-tabs" role="tablist" aria-label="Sản lượng của tôi">
      <button type="button" role="tab" aria-selected="${activeProduceTab === "inventory"}" class="produce-tab ${activeProduceTab === "inventory" ? "is-active" : ""}" data-produce-tab="inventory">Tồn kho vật lý</button>
      <button type="button" role="tab" aria-selected="${activeProduceTab === "history"}" class="produce-tab ${activeProduceTab === "history" ? "is-active" : ""}" data-produce-tab="history">Lịch sử giao dịch</button>
    </div>
    <section class="produce-empty-state" role="tabpanel">
      <span class="produce-empty-icon">${activeProduceTab === "inventory" ? icons.basket : icons.diary}</span>
      <h2>${activeProduceTab === "inventory" ? "Chưa có sản lượng" : "Chưa có giao dịch"}</h2>
      <p>${activeProduceTab === "inventory" ? "Sản lượng thực tế sẽ hiển thị tại đây khi có dữ liệu." : "Lịch sử giao dịch sản lượng sẽ hiển thị tại đây."}</p>
    </section>
  </section>
`;

const marketplaceContent = () => {
  const categories = [
    "Tất cả",
    "Rau củ",
    "Trái cây",
    "Thịt - Trứng",
    "Sản phẩm khác",
  ];
  const filteredProducts = marketplaceProducts.filter(
    (product) =>
      (activeCategory === "Tất cả" || product.kind === activeCategory) &&
      (activeFarm === "Tất cả trang trại" || product.farm === activeFarm) &&
      (activePrice === "Mọi mức giá" ||
        (activePrice === "Dưới 100 HWK" && Number(product.price) < 100) ||
        (activePrice === "100–150 HWK" && Number(product.price) >= 100 && Number(product.price) <= 150) ||
        (activePrice === "Trên 150 HWK" && Number(product.price) > 150)) &&
      `${product.name} ${product.farm}`
        .toLocaleLowerCase("vi")
        .includes(searchTerm.toLocaleLowerCase("vi")),
  );
  const sortedProducts = [...filteredProducts].sort((left, right) =>
    activeSort === "Giá thấp đến cao"
      ? Number(left.price) - Number(right.price)
      : activeSort === "Giá cao đến thấp"
        ? Number(right.price) - Number(left.price)
        : 0,
  );
  return `
    <section class="marketplace-view" aria-labelledby="marketplace-title">
      <div class="marketplace-heading"><div><h1 id="marketplace-title">Marketplace</h1><p>Trao đổi - Mua bán - Kết nối cộng đồng</p></div><span class="marketplace-note">Sản phẩm từ nông trại cộng đồng</span></div>
      <div class="marketplace-categories" role="tablist" aria-label="Danh mục sản phẩm">
        ${categories.map((category) => `<button class="category-chip ${activeCategory === category ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeCategory === category}" data-category="${category}">${category}</button>`).join("")}
      </div>
      <div class="marketplace-tools">
        <label class="market-search">${icons.search}<input type="search" placeholder="Tìm kiếm sản phẩm..." aria-label="Tìm kiếm sản phẩm" value="${searchTerm.replaceAll('"', "&quot;")}" /></label>
        <div class="market-filters"><label class="filter-chip">${icons.farm} Trang trại<select aria-label="Lọc theo trang trại" data-filter="farm"><option>Tất cả trang trại</option>${[...new Set(marketplaceProducts.map((product) => product.farm))].map((farm) => `<option ${activeFarm === farm ? "selected" : ""}>${farm}</option>`).join("")}</select>${icons.chevron}</label><label class="filter-chip">Giá<select aria-label="Lọc theo giá" data-filter="price"><option>Mọi mức giá</option><option ${activePrice === "Dưới 100 HWK" ? "selected" : ""}>Dưới 100 HWK</option><option ${activePrice === "100–150 HWK" ? "selected" : ""}>100–150 HWK</option><option ${activePrice === "Trên 150 HWK" ? "selected" : ""}>Trên 150 HWK</option></select>${icons.chevron}</label><label class="filter-chip sort-filter">☷ Sắp xếp<select aria-label="Sắp xếp sản phẩm" data-filter="sort"><option>Mặc định</option><option ${activeSort === "Giá thấp đến cao" ? "selected" : ""}>Giá thấp đến cao</option><option ${activeSort === "Giá cao đến thấp" ? "selected" : ""}>Giá cao đến thấp</option></select>${icons.chevron}</label></div>
      </div>
      <div class="market-product-grid" aria-live="polite">
        ${
          sortedProducts.length
            ? sortedProducts
                .map(
                  (
                    product,
                  ) => `<article class="market-product-card" data-product="${product.name}">
          <div class="product-photo"><img class="${product.photoClass}" src="${product.image}" alt="${product.alt}" /><button class="favorite-button ${favoriteProducts.has(product.name) ? "is-favorite" : ""}" type="button" aria-label="${favoriteProducts.has(product.name) ? "Bỏ yêu thích" : "Thêm vào yêu thích"}: ${product.name}" aria-pressed="${favoriteProducts.has(product.name)}" data-favorite="${product.name}">${icons.heart}</button></div>
          <div class="product-info"><h2>${product.name}</h2><p class="product-harvest">${icons.leaf}<span>${product.quantity} · ${product.status}</span></p><p class="product-price">${product.price} <span>HWK</span></p><span class="delivery-badge">${product.status === "Đã thu hoạch" ? "Có thể giao ngay" : "Có thể giao dịch trước thu hoạch"}</span></div>
          <a class="product-farm" href="#marketplace" aria-label="Trang trại ${product.farm}">${icons.farm}<span>Trang trại ${product.farm}</span></a>
        </article>`,
                )
                .join("")
            : `<div class="market-empty">Không tìm thấy sản phẩm phù hợp.</div>`
        }
      </div>
      <p class="marketplace-disclaimer">Thông tin sản phẩm và khả năng giao hàng cần được xác nhận với từng trang trại.</p>
      ${
        selectedProduct
          ? `<div class="crop-detail-backdrop" data-close-crop-detail>
        <section class="crop-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="crop-detail-title">
          <button class="crop-detail-close" type="button" aria-label="Đóng" data-close-crop-detail>×</button>
          <div class="crop-detail-summary"><div class="crop-detail-photo"><img class="${selectedProduct.photoClass}" src="${selectedProduct.image}" alt="${selectedProduct.alt}" /></div><div class="crop-detail-overview">
            <h2 id="crop-detail-title">${selectedProduct.name}</h2><span class="crop-status">${selectedProduct.status}</span><p class="crop-farm">${icons.farm} Trang trại ${selectedProduct.farm}</p>
            <div class="crop-detail-metrics"><div><strong>${selectedProduct.quantity}</strong><span>Tổng lượng</span></div><div><strong>${selectedProduct.price} HWK</strong><span>Giá / ${selectedProduct.quantity}</span></div></div>
            <span class="delivery-badge">Có thể giao ngay</span>
          </div></div>
          <div class="crop-detail-product"><h3>Thông tin sản phẩm</h3>
            <p>${icons.leaf} Chất lượng: Loại 1 (đạt tiêu chuẩn VietGAP)</p><p>${icons.harvest} Ngày thu hoạch: 18/04/2025</p><p>${icons.harvest} Hạn sử dụng: 5 ngày</p><p>${icons.farm} Đơn vị phân phối: Nông trại ${selectedProduct.farm}</p>
          </div>
          <div class="crop-detail-purchase"><label for="crop-quantity">Số lượng</label><div class="crop-detail-buyrow"><div class="quantity-stepper"><button type="button" data-quantity="-1" aria-label="Giảm số lượng">−</button><output id="crop-quantity">${productQuantity}</output><button type="button" data-quantity="1" aria-label="Tăng số lượng">+</button></div><span>(${selectedProduct.quantity})</span><button class="buy-now-button" type="button">Mua ngay</button>
          </div>
          <p class="crop-detail-truth">${icons.plot} Sản phẩm được bao chứng bởi sản lượng vật lý từ nông trại thật.</p>
        </section>
      </div>`
          : ""
      }
    </section>
  `;
};

const contentFor: Record<ViewKey, () => string> = {
  garden: gardenContent,
  diary: diaryContent,
  marketplace: marketplaceContent,
  community: communityContent,
  shop: shopContent,
};

const activeContentFor = (view: ViewKey): string =>
  view === "garden" && !gardenAuthLoading && !gardenCustomer
    ? gardenContent()
    : view === "garden" && farmDetailsOpen
    ? farmDetailContent()
    : view === "garden" && myProduceOpen
      ? myProduceContent()
      : contentFor[view]();

const app = document.querySelector<HTMLDivElement>("#app");
let activeView: ViewKey = "garden";

if (!app) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <header class="game-header">
    <a class="brand" href="#garden" data-view="garden" aria-label="Croptalk Garden — Trang chủ">
      <span class="brand-mark">${icons.leaf}</span>
      <span class="brand-copy"><strong>croptalk</strong><span>GARDEN</span></span>
    </a>
    <nav class="primary-nav" aria-label="Điều hướng chính">
      <a class="nav-link is-active" href="#garden" data-view="garden" aria-current="page">${icons.leaf}<span data-header-copy="myGarden">Vườn của tôi</span></a>
      <a class="nav-link" href="#marketplace" data-view="marketplace">${icons.basket}<span data-header-copy="marketplace">Marketplace</span></a>
      <a class="nav-link" href="#shop" data-view="shop">${icons.store}<span data-header-copy="store">Cửa hàng</span></a>
      <a class="nav-link" href="#community" data-view="community">${icons.people}<span data-header-copy="community">Cộng đồng</span></a>
    </nav>
    <div class="header-utilities" aria-label="Thông tin tài khoản">
      <div class="header-status-group">
        <span class="header-status-icon status-xp" role="img" aria-label="Điểm XP chưa có dữ liệu" title="Điểm XP chưa có dữ liệu">${icons.xpBadge}</span>
        <span class="header-status-icon status-reward" role="img" aria-label="Điểm thưởng chưa có dữ liệu" title="Điểm thưởng chưa có dữ liệu">${icons.rewardBadge}</span>
      </div>
      <button class="header-utility-button" type="button" data-upcoming aria-label="Trò chơi" title="Trò chơi">${icons.gamepad}</button>
      <div class="profile-menu-wrap">
        <button class="header-avatar" type="button" data-profile-menu-toggle aria-label="Tài khoản" title="Tài khoản" aria-haspopup="true" aria-expanded="false">${icons.avatar}</button>
        <div class="profile-menu" data-profile-menu hidden>${profileMenuContent()}</div>
      </div>
      <button class="header-utility-button header-more" type="button" data-upcoming aria-label="Tùy chọn khác" title="Tùy chọn khác">${icons.more}</button>
      <div class="language-menu-wrap">
      <button class="language-switch" type="button" data-language-toggle aria-label="Choose language" title="Choose language" aria-haspopup="true" aria-expanded="false">${icons.language}</button>
      <div class="language-menu" data-language-menu hidden>
        <button type="button" data-locale="vi" aria-checked="${activeLocale === "vi"}" role="menuitemradio">Tiếng Việt<span class="language-choice-mark"></span></button>
        <button type="button" data-locale="en" aria-checked="${activeLocale === "en"}" role="menuitemradio">Tiếng Anh<span class="language-choice-mark"></span></button>
      </div>
      </div>
    </div>
  </header>

  <div class="nav-feedback" role="status" aria-live="polite"></div>

  <main class="game-main">
    <div class="view-content is-entering" id="view-content" aria-live="polite">${activeContentFor(activeView)}</div>
    <footer class="game-footer"><span>Croptalk Garden</span></footer>
  </main>
`;

localizeDom(app);
const localizationObserver = new MutationObserver((records) => {
  records.forEach((record) => {
    record.addedNodes.forEach((node) => {
      if (node instanceof Element) localizeDom(node);
    });
  });
});
localizationObserver.observe(app, { childList: true, subtree: true });

app.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("[data-garden-test-login]")) {
    startGardenTestSession();
  }
});

app.addEventListener("submit", (event: SubmitEvent) => {
  const target = event.target;
  if (!(target instanceof HTMLFormElement) || !target.matches("[data-garden-login-form]")) return;
  event.preventDefault();
  const email = target.querySelector<HTMLInputElement>("[name=email]")?.value.trim() ?? "";
  const password = target.querySelector<HTMLInputElement>("[name=password]")?.value ?? "";
  void completeGardenSignIn(() => signInGardenCustomerWithEmail(email, password));
});

function setView(view: ViewKey, pushHistory = true): void {
  if (view === activeView && !farmDetailsOpen && !myProduceOpen && !farmSummaryOpen) return;
  activeView = view;
  farmDetailsOpen = false;
  myProduceOpen = false;
  farmSummaryOpen = false;
  irrigationConfirmOpen = false;
  irrigationRequestError = "";
  document.querySelectorAll<HTMLAnchorElement>(".nav-link").forEach((link) => {
    const isActive = link.dataset.view === view;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const content = document.querySelector<HTMLDivElement>("#view-content");

  if (content) {
    content.classList.remove("is-entering");
    content.innerHTML = activeContentFor(view);
    requestAnimationFrame(() => content.classList.add("is-entering"));
  }
  if (pushHistory) {
    window.history.pushState(null, "", `#${view}`);
  }
}

function setLocale(locale: Locale): void {
  activeLocale = locale;
  saveLocale(locale);
  document.documentElement.lang = locale;
  const content = document.querySelector<HTMLDivElement>("#view-content");
  if (content) content.innerHTML = activeContentFor(activeView);
  if (!app) return;
  localizeDom(app);
  app.querySelectorAll<HTMLButtonElement>("[data-locale]").forEach((option) => {
    option.setAttribute("aria-checked", String(option.dataset.locale === locale));
  });
}

function openFarmDetails(): void {
  if (farmDetailsOpen) return;
  farmSummaryOpen = false;
  farmDetailsOpen = true;
  window.history.pushState({ croptalkGardenDetail: true }, "", `#${GARDEN_DETAIL_ROUTE}`);
  const content = document.querySelector<HTMLDivElement>("#view-content");
  if (content) {
    content.innerHTML = farmDetailContent();
    window.scrollTo(0, 0);
    content.querySelector<HTMLButtonElement>("[data-close-farm-details]")?.focus();
  }
}

function closeFarmDetails(): void {
  if (window.history.state?.croptalkGardenDetail) {
    window.history.back();
    return;
  }
  window.history.replaceState(null, "", "#garden");
  syncViewFromLocation();
}

function openMyProduce(tab: ProduceTab = "inventory"): void {
  activeProduceTab = tab;
  farmDetailsOpen = false;
  farmSummaryOpen = false;
  myProduceOpen = true;
  window.history.pushState({ croptalkMyProduce: true }, "", `#${MY_PRODUCE_ROUTE}`);
  const content = document.querySelector<HTMLDivElement>("#view-content");
  if (content) {
    content.innerHTML = myProduceContent();
    window.scrollTo(0, 0);
    content.querySelector<HTMLButtonElement>("[data-close-my-produce]")?.focus();
  }
}

function closeMyProduce(): void {
  if (window.history.state?.croptalkMyProduce) {
    window.history.back();
    return;
  }
  window.history.replaceState(null, "", "#garden");
  syncViewFromLocation();
}

function setMapMode(mode: MapMode): void {
  activeMapMode = mode;
  if (mode === "real" && farmSummaryOpen) {
    farmSummaryOpen = false;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = gardenContent();
  }
  const scene = document.querySelector<HTMLElement>(".game-scene");
  const realModePanel = document.querySelector<HTMLElement>(".real-map-empty");

  if (scene) scene.dataset.mode = mode;
  if (realModePanel) realModePanel.hidden = mode !== "real";
  document
    .querySelectorAll<HTMLButtonElement>(".map-mode-button")
    .forEach((button) => {
      const isActive = button.dataset.mapMode === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
}

function syncViewFromLocation(): void {
  const route = window.location.hash.slice(1);
  if (route === GARDEN_DETAIL_ROUTE || route === MY_PRODUCE_ROUTE) {
    if (activeView !== "garden") setView("garden", false);
    farmSummaryOpen = false;
    farmDetailsOpen = route === GARDEN_DETAIL_ROUTE;
    myProduceOpen = route === MY_PRODUCE_ROUTE;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = activeContentFor("garden");
    return;
  }
  const view = route as ViewKey;
  if (view in views) {
    setView(view, false);
  } else {
    setView("garden", false);
    window.history.replaceState(null, "", "#garden");
  }
}

function renderGardenView(): void {
  if (activeView !== "garden" || farmDetailsOpen || myProduceOpen) return;
  const content = document.querySelector<HTMLDivElement>("#view-content");
  if (content) content.innerHTML = gardenContent();
  const profileMenu = document.querySelector<HTMLElement>("[data-profile-menu]");
  if (profileMenu) profileMenu.innerHTML = profileMenuContent();
}

function clearOperationPolling(): void {
  if (operationPollTimer !== undefined) window.clearTimeout(operationPollTimer);
  operationPollTimer = undefined;
}

function scheduleOperationPolling(plotID: string, operation: GardenIrrigationOperation): void {
  clearOperationPolling();
  if (!operationIsOpen(operation)) return;
  operationPollTimer = window.setTimeout(async () => {
    try {
      const current = irrigationOperationsByPlot.get(plotID);
      if (!current || current.id !== operation.id) return;
      const updated = await getIrrigationOperation(current.id);
      irrigationOperationsByPlot.set(plotID, updated);
      if (updated.status === "COMPLETED" && current.status !== "COMPLETED") {
        gardenPlots = await getGardenPlots();
        document.querySelector<HTMLElement>(".game-scene")?.classList.add("is-irrigation-verified");
      }
      renderGardenView();
      scheduleOperationPolling(plotID, updated);
    } catch {
      scheduleOperationPolling(plotID, operation);
    }
  }, 8000);
}

async function refreshPlotOperation(plotID: string): Promise<void> {
  irrigationStatusError = "";
  try {
    const operations = await getPlotIrrigationOperations(plotID);
    const latest = operations[0];
    if (latest) {
      irrigationOperationsByPlot.set(plotID, latest);
      scheduleOperationPolling(plotID, latest);
    } else {
      irrigationOperationsByPlot.delete(plotID);
      clearOperationPolling();
    }
  } catch (error) {
    irrigationStatusError = error instanceof GardenAPIError ? error.message : "Không thể tải trạng thái yêu cầu.";
  }
}

async function loadGardenPlots(): Promise<void> {
  gardenPlotsLoading = true;
  gardenPlotsError = "";
  renderGardenView();
  try {
    gardenPlots = await getGardenPlots();
    if (!gardenPlots.some((plot) => plot.id === selectedPlotId)) {
      selectedPlotId = gardenPlots[0]?.id ?? "";
    }
    if (selectedPlotId) await refreshPlotOperation(selectedPlotId);
  } catch (error) {
    gardenPlotsError = error instanceof GardenAPIError ? error.message : "Không thể tải lô đất. Hãy thử tải lại.";
    if (error instanceof GardenAPIError && error.status === 401) {
      gardenCustomer = null;
      gardenAuthError = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }
  } finally {
    gardenPlotsLoading = false;
    gardenAuthLoading = false;
    renderGardenView();
  }
}

function testSessionIsActive(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return window.sessionStorage.getItem(GARDEN_TEST_SESSION_KEY) === "active";
  } catch {
    return false;
  }
}

function setGardenTestCustomer(): void {
  gardenTestMode = true;
  gardenCustomer = {
    id: "garden-test-customer",
    email: "gardener@test.local",
    name: "Người làm vườn",
    role: "CUSTOMER",
  };
  gardenPlots = [testGardenPlot];
  selectedPlotId = testGardenPlot.id;
  gardenPlotsLoading = false;
  gardenPlotsError = "";
  gardenAuthError = "";
  gardenAuthLoading = false;
  irrigationConfirmOpen = false;
  irrigationOperationsByPlot.clear();
}

function startGardenTestSession(): void {
  if (!import.meta.env.DEV || gardenLoginPending) return;
  try {
    window.sessionStorage.setItem(GARDEN_TEST_SESSION_KEY, "active");
  } catch {
    // The test session still works for the current page if storage is unavailable.
  }
  setGardenTestCustomer();
  farmDetailsOpen = false;
  myProduceOpen = false;
  farmSummaryOpen = false;
  renderGardenView();
}

async function restoreGardenCustomer(): Promise<void> {
  gardenAuthLoading = true;
  if (testSessionIsActive()) {
    setGardenTestCustomer();
    renderGardenView();
    return;
  }
  gardenTestMode = false;
  try {
    gardenCustomer = await getGardenCustomerSession();
    gardenAuthError = "";
    if (gardenCustomer) await loadGardenPlots();
  } catch (error) {
    gardenCustomer = null;
    const expectedDevAuthGap = import.meta.env.DEV && error instanceof GardenAuthError && error.code === "garden_auth_unavailable";
    gardenAuthError = expectedDevAuthGap ? "" : error instanceof GardenAuthError ? error.message : "Không thể xác minh tài khoản Croptalk.";
  } finally {
    gardenAuthLoading = false;
    renderGardenView();
  }
}

async function completeGardenSignIn(signIn: () => Promise<GardenCustomer>): Promise<void> {
  gardenLoginPending = true;
  gardenAuthError = "";
  renderGardenView();
  try {
    gardenCustomer = await signIn();
    gardenTestMode = false;
    try { window.sessionStorage.removeItem(GARDEN_TEST_SESSION_KEY); } catch { /* best effort */ }
    farmDetailsOpen = false;
    myProduceOpen = false;
    await loadGardenPlots();
  } catch (error) {
    gardenAuthError = error instanceof GardenAuthError ? error.message : "Không thể đăng nhập. Hãy thử lại.";
  } finally {
    gardenLoginPending = false;
    gardenAuthLoading = false;
    renderGardenView();
  }
}

async function signOutGarden(): Promise<void> {
  clearOperationPolling();
  if (!gardenTestMode) await signOutGardenCustomer();
  gardenTestMode = false;
  try { window.sessionStorage.removeItem(GARDEN_TEST_SESSION_KEY); } catch { /* best effort */ }
  gardenCustomer = null;
  gardenPlots = [];
  selectedPlotId = "";
  irrigationOperationsByPlot.clear();
  farmSummaryOpen = false;
  farmDetailsOpen = false;
  myProduceOpen = false;
  renderGardenView();
}

async function sendIrrigationRequest(): Promise<void> {
  const plot = selectedGardenPlot();
  if (!plot || irrigationSubmitting) return;
  irrigationSubmitting = true;
  irrigationRequestError = "";
  renderGardenView();
  try {
    if (!irrigationRequestKey) irrigationRequestKey = crypto.randomUUID();
    const operation = await submitIrrigationRequest(plot.id, irrigationRequestKey);
    irrigationOperationsByPlot.set(plot.id, operation);
    irrigationRequestKey = "";
    irrigationConfirmOpen = false;
    scheduleOperationPolling(plot.id, operation);
  } catch (error) {
    irrigationRequestError = error instanceof GardenAPIError ? error.message : "Không thể gửi yêu cầu tưới nước.";
    if (error instanceof GardenAPIError && error.code === "operation_in_progress") {
      await refreshPlotOperation(plot.id);
      if (operationIsOpen(irrigationOperationsByPlot.get(plot.id))) {
        irrigationConfirmOpen = false;
        irrigationRequestKey = "";
      }
    }
    if (error instanceof GardenAPIError && error.status === 401) {
      gardenCustomer = null;
      gardenAuthError = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }
  } finally {
    irrigationSubmitting = false;
    renderGardenView();
  }
}

app.addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (farmSummaryOpen && target.closest(".game-scene") && !target.closest(".plot-action-panel") && !target.closest("[data-select-garden-plot]")) {
    farmSummaryOpen = false;
    irrigationConfirmOpen = false;
    irrigationRequestError = "";
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = gardenContent();
    return;
  }
  if (target.closest("[data-garden-google-login]")) {
    void completeGardenSignIn(signInGardenCustomerWithGoogle);
    return;
  }
  if (target.closest("[data-garden-logout]")) {
    void signOutGarden();
    return;
  }
  const selectedPlotButton = target.closest<HTMLButtonElement>("[data-select-garden-plot]");
  if (selectedPlotButton) {
    const plotID = selectedPlotButton.dataset.selectGardenPlot ?? "";
    if (!gardenPlots.some((plot) => plot.id === plotID)) return;
    selectedPlotId = plotID;
    farmSummaryOpen = true;
    irrigationConfirmOpen = false;
    irrigationRequestKey = "";
    irrigationRequestError = "";
    renderGardenView();
    void refreshPlotOperation(plotID).then(renderGardenView);
    return;
  }
  if (target.closest("[data-open-irrigation-confirm]")) {
    irrigationConfirmOpen = true;
    irrigationRequestError = "";
    irrigationRequestKey = crypto.randomUUID();
    renderGardenView();
    return;
  }
  if (target.closest("[data-cancel-irrigation]")) {
    irrigationConfirmOpen = false;
    irrigationRequestKey = "";
    irrigationRequestError = "";
    renderGardenView();
    return;
  }
  if (target.closest("[data-confirm-irrigation]")) {
    void sendIrrigationRequest();
    return;
  }
  if (target.closest("[data-profile-menu-toggle]")) {
    const toggle = target.closest<HTMLButtonElement>("[data-profile-menu-toggle]");
    const menu = app.querySelector<HTMLElement>("[data-profile-menu]");
    if (menu && toggle) {
      menu.hidden = !menu.hidden;
      toggle.setAttribute("aria-expanded", String(!menu.hidden));
    }
    return;
  }
  if (target.closest("[data-open-produce-history]")) {
    const menu = app.querySelector<HTMLElement>("[data-profile-menu]");
    if (menu) menu.hidden = true;
    openMyProduce("history");
    return;
  }
  if (target.closest("[data-open-my-produce]")) {
    const menu = app.querySelector<HTMLElement>("[data-profile-menu]");
    const toggle = app.querySelector<HTMLButtonElement>("[data-profile-menu-toggle]");
    if (menu) menu.hidden = true;
    toggle?.setAttribute("aria-expanded", "false");
    openMyProduce();
    return;
  }
  if (target.closest("[data-language-toggle]")) {
    const toggle = target.closest<HTMLButtonElement>("[data-language-toggle]");
    const menu = app.querySelector<HTMLElement>("[data-language-menu]");
    if (menu && toggle) {
      menu.hidden = !menu.hidden;
      toggle.setAttribute("aria-expanded", String(!menu.hidden));
    }
    return;
  }
  const localeChoice = target.closest<HTMLButtonElement>("[data-locale]")?.dataset.locale;
  if (localeChoice === "vi" || localeChoice === "en") {
    setLocale(localeChoice);
    const menu = app.querySelector<HTMLElement>("[data-language-menu]");
    const toggle = app.querySelector<HTMLButtonElement>("[data-language-toggle]");
    if (menu) menu.hidden = true;
    toggle?.setAttribute("aria-expanded", "false");
    return;
  }
  if (target.closest("[data-open-farm-details]")) {
    openFarmDetails();
    return;
  }
  if (target.closest("[data-close-farm-details]")) {
    closeFarmDetails();
    return;
  }
  if (target.closest("[data-close-my-produce]")) {
    closeMyProduce();
    return;
  }
  const produceTab = target.closest<HTMLButtonElement>("[data-produce-tab]")?.dataset.produceTab;
  if (produceTab === "inventory" || produceTab === "history") {
    activeProduceTab = produceTab;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = myProduceContent();
    return;
  }
  if (target.closest("[data-close-crop-summary]")) {
    farmSummaryOpen = false;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = gardenContent();
    return;
  }
  if (target.closest("[data-upcoming]")) {
    const feedback = app.querySelector<HTMLElement>(".nav-feedback");
    if (feedback) {
      feedback.textContent = activeLocale === "vi" ? "Tính năng này sẽ sớm có mặt." : englishCopy["Tính năng này sẽ sớm có mặt."];
      feedback.classList.add("is-visible");
      window.setTimeout(() => feedback.classList.remove("is-visible"), 1800);
    }
    return;
  }
  if (target.closest("[data-close-crop-detail]")) {
    if (target === target.closest(".crop-detail-dialog")) return;
    selectedProduct = undefined;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = activeView === "garden" ? gardenContent() : marketplaceContent();
    return;
  }
  if (target.closest("[data-open-garden-crop]")) {
    selectedProduct = marketplaceProducts[0];
    productQuantity = 1;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = gardenContent();
    return;
  }
  const quantityControl = target.closest<HTMLButtonElement>("[data-quantity]");
  if (quantityControl) {
    productQuantity = Math.max(1, productQuantity + Number(quantityControl.dataset.quantity));
    const output = document.querySelector<HTMLOutputElement>("#crop-quantity");
    if (output) output.value = String(productQuantity);
    return;
  }
  const productCard = target.closest<HTMLElement>("[data-product]");
  if (productCard && !target.closest("button, a")) {
    productQuantity = 1;
    selectedProduct = marketplaceProducts.find(
      (product) => product.name === productCard.dataset.product,
    );
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = marketplaceContent();
    return;
  }
  const modeControl = target.closest<HTMLButtonElement>("[data-map-mode]");
  const mapMode = modeControl?.dataset.mapMode as MapMode | undefined;
  if (mapMode === "real" || mapMode === "animated") {
    setMapMode(mapMode);
    return;
  }
  const control = target.closest<HTMLElement>("[data-view]");
  const view = control?.dataset.view as ViewKey | undefined;
  if (view && view in views) {
    event.preventDefault();
    setView(view);
    return;
  }
  const category =
    target.closest<HTMLButtonElement>("[data-category]")?.dataset.category;
  if (category) {
    activeCategory = category;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = marketplaceContent();
    return;
  }
  const favorite =
    target.closest<HTMLButtonElement>("[data-favorite]")?.dataset.favorite;
  if (favorite) {
    if (favoriteProducts.has(favorite)) favoriteProducts.delete(favorite);
    else favoriteProducts.add(favorite);
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = marketplaceContent();
    return;
  }
  const communityTab = target.closest<HTMLButtonElement>("[data-community-tab]")?.dataset.communityTab;
  if (communityTab) {
    activeCommunityTab = communityTab;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = communityContent();
    return;
  }
  const communityLike = target.closest<HTMLButtonElement>("[data-community-like]")?.dataset.communityLike;
  if (communityLike) {
    if (likedCommunityPosts.has(communityLike)) likedCommunityPosts.delete(communityLike);
    else likedCommunityPosts.add(communityLike);
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = communityContent();
  }
});

app.addEventListener("input", (event: Event) => {
  const target = event.target;
  if (
    !(target instanceof HTMLInputElement) ||
    !target.matches(".market-search input")
  )
    return;
  const selectionStart = target.selectionStart;
  searchTerm = target.value;
  const content = document.querySelector<HTMLDivElement>("#view-content");
  if (content) {
    content.innerHTML = marketplaceContent();
    const input = content.querySelector<HTMLInputElement>(
      ".market-search input",
    );
    input?.focus();
    if (selectionStart !== null)
      input?.setSelectionRange(selectionStart, selectionStart);
  }
});

app.addEventListener("change", (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.dataset.filter === "farm") activeFarm = target.value;
  if (target.dataset.filter === "price") activePrice = target.value;
  if (target.dataset.filter === "sort") activeSort = target.value;
  const content = document.querySelector<HTMLDivElement>("#view-content");
  if (content) content.innerHTML = marketplaceContent();
});

window.addEventListener("popstate", syncViewFromLocation);
window.addEventListener("hashchange", syncViewFromLocation);
window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape" && farmDetailsOpen) {
    closeFarmDetails();
    return;
  }
  if (event.key === "Escape" && myProduceOpen) {
    closeMyProduce();
    return;
  }
  if (event.key === "Escape" && irrigationConfirmOpen) {
    irrigationConfirmOpen = false;
    irrigationRequestKey = "";
    irrigationRequestError = "";
    renderGardenView();
    return;
  }
  if (event.key === "Escape" && farmSummaryOpen) {
    farmSummaryOpen = false;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = gardenContent();
    return;
  }
  if (event.key === "Escape" && selectedProduct) {
    selectedProduct = undefined;
    const content = document.querySelector<HTMLDivElement>("#view-content");
    if (content) content.innerHTML = marketplaceContent();
  }
});

const initialRoute = window.location.hash.slice(1);
const initialView = initialRoute as ViewKey;
if (initialRoute === GARDEN_DETAIL_ROUTE) {
  farmDetailsOpen = true;
  window.history.replaceState(null, "", `#${GARDEN_DETAIL_ROUTE}`);
} else if (initialRoute === MY_PRODUCE_ROUTE) {
  myProduceOpen = true;
  window.history.replaceState(null, "", `#${MY_PRODUCE_ROUTE}`);
} else if (initialView in views && initialView !== activeView) {
  setView(initialView, false);
} else if (!(initialView in views)) {
  window.history.replaceState(null, "", "#garden");
}

void restoreGardenCustomer();
