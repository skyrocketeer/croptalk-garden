export type GardenPlot = {
  id: string
  farm_id: string
  farm_name: string
  farm_status: 'ACTIVE' | 'INACTIVE'
  name: string
  code: string
  area?: number | null
  area_unit: string
  status: 'ACTIVE' | 'FALLOW'
  active_cycle?: { id: string; name: string } | null
  active_crop?: { id: string; name: string; variety: string; growth_stage: string } | null
  available_actions: string[]
}

export type IrrigationOperationStatus =
  | 'AWAITING_ASSIGNMENT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_VERIFICATION'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'

export type GardenIrrigationOperation = {
  id: string
  plot_id: string
  status: IrrigationOperationStatus
  crm_task_id?: string | null
  requested_at: string
  assigned_at?: string | null
  completed_at?: string | null
}

export class GardenAPIError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'GardenAPIError'
  }
}

async function gardenJSON<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'same-origin',
      cache: 'no-store',
    })
  } catch {
    throw new GardenAPIError('garden_unavailable', 'Không thể kết nối đến dữ liệu khu vườn.', 0)
  }
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new GardenAPIError(
      typeof body?.code === 'string' ? body.code : 'garden_request_failed',
      typeof body?.message === 'string' ? body.message : 'Không thể tải dữ liệu khu vườn.',
      response.status,
    )
  }
  return body as T
}

export async function getGardenPlots() {
  const response = await gardenJSON<{ items: GardenPlot[] }>('/api/garden/plots')
  return response.items
}

export async function getPlotIrrigationOperations(plotID: string) {
  const query = new URLSearchParams({ plot_id: plotID })
  const response = await gardenJSON<{ items: GardenIrrigationOperation[] }>(
    `/api/garden/irrigation-operations?${query}`,
  )
  return response.items
}

export function submitIrrigationRequest(plotID: string, idempotencyKey: string, note = '') {
  return gardenJSON<GardenIrrigationOperation>('/api/garden/irrigation-operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plot_id: plotID, idempotency_key: idempotencyKey, note }),
  })
}

export function getIrrigationOperation(operationID: string) {
  return gardenJSON<GardenIrrigationOperation>(
    `/api/garden/irrigation-operations/${encodeURIComponent(operationID)}`,
  )
}
