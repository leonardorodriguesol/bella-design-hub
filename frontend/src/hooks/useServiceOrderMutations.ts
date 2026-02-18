import { useMutation, useQueryClient } from '@tanstack/react-query'

import { serviceOrdersApi } from '../api/serviceOrders'
import type { CreateServiceOrderInput, ServiceOrderStatus, UpdateServiceOrderInput } from '../types/serviceOrder'

export const useServiceOrderMutations = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['serviceOrders'] })
  }

  const create = useMutation({
    mutationFn: (payload: CreateServiceOrderInput) => serviceOrdersApi.create(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServiceOrderInput }) => serviceOrdersApi.update(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: string) => serviceOrdersApi.remove(id),
    onSuccess: invalidate,
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceOrderStatus }) =>
      serviceOrdersApi.updateStatus(id, { status }),
    onSuccess: invalidate,
  })

  return { create, update, remove, updateStatus }
}
