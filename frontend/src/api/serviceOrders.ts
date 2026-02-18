import { httpClient } from '../lib/httpClient'
import type {
  CreateServiceOrderInput,
  ServiceOrder,
  ServiceOrderStatus,
  UpdateServiceOrderInput,
  UpdateServiceOrderStatusInput,
} from '../types/serviceOrder'

const statusMap: Record<number, ServiceOrderStatus> = {
  0: 'Scheduled',
  1: 'InRoute',
  2: 'Delivered',
  3: 'Cancelled',
}

const statusNumberMap: Record<ServiceOrderStatus, number> = {
  Scheduled: 0,
  InRoute: 1,
  Delivered: 2,
  Cancelled: 3,
}

type ServiceOrderApiResponse = Omit<ServiceOrder, 'status'> & { status: ServiceOrderStatus | number }

const normalizeStatus = (status: ServiceOrderStatus | number): ServiceOrderStatus => {
  if (typeof status === 'string') return status
  return statusMap[status] ?? 'Scheduled'
}

const mapServiceOrder = (serviceOrder: ServiceOrderApiResponse): ServiceOrder => ({
  ...serviceOrder,
  status: normalizeStatus(serviceOrder.status),
  order: serviceOrder.order
    ? {
        ...serviceOrder.order,
        items: serviceOrder.order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice ?? 0),
        })),
      }
    : undefined,
  items: serviceOrder.items.map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice ?? 0),
  })),
})

export const serviceOrdersApi = {
  list: async (params?: {
    customerId?: string
    orderId?: string
    status?: string
    scheduledFrom?: string
    scheduledTo?: string
  }) => {
    const { data } = await httpClient.get<ServiceOrderApiResponse[]>('/api/serviceOrders', { params })
    return data.map(mapServiceOrder)
  },
  get: async (id: string) => {
    const { data } = await httpClient.get<ServiceOrderApiResponse>(`/api/serviceOrders/${id}`)
    return mapServiceOrder(data)
  },
  create: async (payload: CreateServiceOrderInput) => {
    const { data } = await httpClient.post<ServiceOrderApiResponse>('/api/serviceOrders', payload)
    return mapServiceOrder(data)
  },
  update: async (id: string, payload: UpdateServiceOrderInput) => {
    const { data } = await httpClient.put<ServiceOrderApiResponse>(`/api/serviceOrders/${id}`, payload)
    return mapServiceOrder(data)
  },
  remove: async (id: string) => {
    await httpClient.delete(`/api/serviceOrders/${id}`)
    return id
  },
  updateStatus: async (id: string, payload: UpdateServiceOrderStatusInput) => {
    const serialized = {
      status: typeof payload.status === 'string' ? statusNumberMap[payload.status] : payload.status,
    }
    const { data } = await httpClient.patch<ServiceOrderApiResponse>(`/api/serviceOrders/${id}/status`, serialized)
    return mapServiceOrder(data)
  },
}
