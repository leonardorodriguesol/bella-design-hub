import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { z } from 'zod'

const extraItemsSchema = z.array(
  z.object({
    description: z.string().min(1, 'Informe o nome do serviço'),
    quantity: z.coerce
      .number()
      .int('Somente números inteiros')
      .min(1, 'Quantidade mínima é 1'),
    unitPrice: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  }),
)

const serviceOrderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente válido'),
  orderId: z.string().min(1, 'Selecione um pedido válido'),
  scheduledDate: z.string().min(1, 'Informe a data prevista'),
  responsible: z.string().max(150, 'Máximo de 150 caracteres').optional(),
  notes: z.string().max(1000, 'Máximo de 1000 caracteres').optional(),
  extraItems: extraItemsSchema.optional(),
})

export type ServiceOrderFormValues = z.infer<typeof serviceOrderSchema>

interface ServiceOrderFormProps {
  customers: Array<{ id: string; name: string }>
  orders: Array<{ id: string; code: string; customerId: string; customerName?: string }>
  defaultValues?: Partial<ServiceOrderFormValues>
  onSubmit: (values: ServiceOrderFormValues) => Promise<void> | void
  isSubmitting?: boolean
}

export const ServiceOrderForm = ({ customers, orders, defaultValues, onSubmit, isSubmitting }: ServiceOrderFormProps) => {
  const initialDefaults = useMemo<ServiceOrderFormValues>(
    () => ({
      customerId: defaultValues?.customerId ?? '',
      orderId: defaultValues?.orderId ?? '',
      scheduledDate: defaultValues?.scheduledDate ?? new Date().toISOString().slice(0, 10),
      responsible: defaultValues?.responsible ?? '',
      notes: defaultValues?.notes ?? '',
      extraItems: defaultValues?.extraItems ?? [],
    }),
    [defaultValues],
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(serviceOrderSchema) as Resolver<ServiceOrderFormValues>,
    defaultValues: initialDefaults,
  })

  const { fields, append, remove } = useFieldArray({
    name: 'extraItems',
    control,
  })

  useEffect(() => {
    reset(initialDefaults)
  }, [initialDefaults, reset])

  const selectedCustomerId = useWatch({ control, name: 'customerId' }) ?? ''
  const selectedOrderId = useWatch({ control, name: 'orderId' }) ?? ''
  const selectedOrder = orders.find((order) => order.id === selectedOrderId)
  const filteredOrders = orders.filter((order) => !selectedCustomerId || order.customerId === selectedCustomerId)

  useEffect(() => {
    if (selectedCustomerId) {
      const belongsToCustomer = selectedOrder && selectedOrder.customerId === selectedCustomerId
      if (!belongsToCustomer) {
        setValue('orderId', '')
      }
    } else {
      setValue('orderId', '')
    }
  }, [selectedCustomerId, selectedOrder, setValue])

  const handleFormSubmit = async (values: ServiceOrderFormValues) => {
    await onSubmit(values)

    if (!defaultValues) {
      reset({
        customerId: '',
        orderId: '',
        scheduledDate: new Date().toISOString().slice(0, 10),
        responsible: '',
        notes: '',
        extraItems: [],
      })
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-semibold text-brand-700">Cliente*</span>
          <select
            className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
            {...register('customerId')}
          >
            <option value="">Selecione um cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-xs text-red-600">{errors.customerId.message}</p>}
        </label>

        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-semibold text-brand-700">Pedido*</span>
          <select
            className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
            {...register('orderId')}
            disabled={!selectedCustomerId}
          >
            <option value="">{selectedCustomerId ? 'Selecione um pedido' : 'Selecione um cliente primeiro'}</option>
            {filteredOrders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.code}
              </option>
            ))}
          </select>
          {errors.orderId && <p className="text-xs text-red-600">{errors.orderId.message}</p>}
        </label>
      </div>

      {selectedOrder && (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm text-brand-600">
          <p className="font-semibold text-brand-700">Resumo do pedido selecionado</p>
          <p className="mt-1">Código: {selectedOrder.code}</p>
          {selectedOrder.customerName && <p>Cliente: {selectedOrder.customerName}</p>}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-semibold text-brand-700">Data de execução*</span>
          <input
            type="date"
            className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
            {...register('scheduledDate')}
          />
          {errors.scheduledDate && <p className="text-xs text-red-600">{errors.scheduledDate.message}</p>}
        </label>

        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-semibold text-brand-700">Responsável</span>
          <input
            className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
            placeholder="Ex.: Equipe logística"
            {...register('responsible')}
          />
          {errors.responsible && <p className="text-xs text-red-600">{errors.responsible.message}</p>}
        </label>
      </div>

      <label className="text-sm text-brand-600">
        <span className="mb-1 block font-semibold text-brand-700">Observações</span>
        <textarea
          rows={4}
          className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 placeholder:text-brand-300 focus:border-brand-500 focus:outline-none"
          placeholder="Detalhes relevantes para a entrega"
          {...register('notes')}
        />
        {errors.notes && <p className="text-xs text-red-600">{errors.notes.message}</p>}
      </label>

      <div className="space-y-4 rounded-2xl border border-dashed border-brand-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">Serviços extras</p>
            <p className="text-xs text-brand-400">Use para adicionar taxa de entrega, juros da máquina, etc.</p>
          </div>
          <button
            type="button"
            className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            Adicionar serviço
          </button>
        </div>

        {fields.length > 0 ? (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-2xl border border-brand-100 p-3 md:grid-cols-[2fr_120px_170px_auto]"
              >
                <div>
                  <label className="text-xs font-semibold text-brand-500">
                    Descrição
                    <input
                      className="mt-1 w-full rounded-2xl border border-brand-100 px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                      placeholder="Ex.: Taxa de entrega"
                      {...register(`extraItems.${index}.description` as const)}
                    />
                  </label>
                  {errors.extraItems?.[index]?.description && (
                    <p className="text-xs text-red-600">{errors.extraItems[index]?.description?.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-500">
                    Quantidade
                    <input
                      type="number"
                      min={1}
                      className="mt-1 w-full rounded-2xl border border-brand-100 px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                      {...register(`extraItems.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                  </label>
                  {errors.extraItems?.[index]?.quantity && (
                    <p className="text-xs text-red-600">{errors.extraItems[index]?.quantity?.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-500">
                    Valor unitário (R$)
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="mt-1 w-full rounded-2xl border border-brand-100 px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                      {...register(`extraItems.${index}.unitPrice` as const, { valueAsNumber: true })}
                    />
                  </label>
                  {errors.extraItems?.[index]?.unitPrice && (
                    <p className="text-xs text-red-600">{errors.extraItems[index]?.unitPrice?.message}</p>
                  )}
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                    onClick={() => remove(index)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-brand-400">Nenhum serviço extra adicionado.</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Gerando ordem...' : 'Gerar OS'}
      </button>
    </form>
  )
}
