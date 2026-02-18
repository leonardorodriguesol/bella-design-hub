export type ServiceOrderStatus = 'Scheduled' | 'InRoute' | 'Delivered' | 'Cancelled'

export interface ServiceOrderItem {
  id?: string
  serviceOrderId?: string
  orderItemId?: string | null
  description: string
  quantity: number
  unitPrice: number
}

export interface ServiceOrder {
  id: string
  orderId: string
  customerId: string
  scheduledDate: string
  status: ServiceOrderStatus
  responsible?: string | null
  notes?: string | null
  createdAt: string
  updatedAt?: string | null
  order?: {
    id: string
    code: string
    deliveryDate?: string | null
    items: Array<{
      id?: string
      description: string
      quantity: number
      unitPrice: number
    }>
  }
  customer?: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    address?: string | null
  }
  items: ServiceOrderItem[]
}

export interface CreateServiceOrderInput {
  orderId: string
  customerId: string
  scheduledDate: string
  responsible?: string | null
  notes?: string | null
  items?: Array<{
    orderItemId?: string | null
    description: string
    quantity: number
    unitPrice: number
  }>
}

export type UpdateServiceOrderInput = CreateServiceOrderInput

export interface UpdateServiceOrderStatusInput {
  status: ServiceOrderStatus
}
