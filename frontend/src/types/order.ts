export type OrderStatus = 'Pending' | 'InProduction' | 'Shipped' | 'Delivered' | 'Cancelled'

export interface OrderItem {
  id?: string
  productId?: string | null
  description: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  code: string
  customerId: string
  customer?: {
    id: string
    name: string
  }
  status: OrderStatus
  totalAmount: number
  createdAt: string
  updatedAt?: string | null
  deliveryDate?: string | null
  items: OrderItem[]
}

export interface CreateOrderInput {
  customerId: string
  code?: string | null
  deliveryDate?: string | null
  items: Array<{
    productId?: string | null
    description: string
    quantity: number
    unitPrice: number
  }>
}

export interface UpdateOrderInput extends CreateOrderInput {
  status: OrderStatus
}
