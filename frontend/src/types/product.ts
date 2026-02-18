export interface ProductPart {
  id?: string
  name: string
  measurements?: string | null
  quantity: number
}

export interface Product {
  id: string
  name: string
  description?: string | null
  defaultSalePrice: number
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
  parts: ProductPart[]
}

export interface ProductPartInput {
  name: string
  measurements?: string | null
  quantity: number
}

export interface CreateProductInput {
  name: string
  description?: string | null
  defaultSalePrice: number
  isActive: boolean
  parts: ProductPartInput[]
}

export type UpdateProductInput = CreateProductInput

export type ProductionStatus = 'Planned' | 'InProgress' | 'Completed' | 'Cancelled'

export interface ProductionSchedulePart {
  id?: string
  name: string
  measurements?: string | null
  quantity: number
}

export interface ProductionSchedule {
  id: string
  productId: string
  product?: Product
  scheduledDate: string
  quantity: number
  status: ProductionStatus
  createdAt: string
  updatedAt?: string | null
  parts: ProductionSchedulePart[]
}

export interface CreateProductionScheduleInput {
  productId: string
  scheduledDate: string
  quantity: number
}

export interface UpdateProductionStatusInput {
  status: ProductionStatus
}
