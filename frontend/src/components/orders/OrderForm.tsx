import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

const orderSchema = z.object({
  customerId: z.string().uuid('Selecione um cliente válido'),
  deliveryDate: z.string().optional(),
  status: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        description: z.string().min(2, 'Descrição obrigatória'),
        quantity: z.number().min(1, 'Quantidade mínima 1'),
        unitPrice: z.number().min(0.01, 'Valor mínimo R$ 0,01'),
      }),
    )
    .min(1, 'Inclua pelo menos um item'),
})

export type OrderFormValues = z.infer<typeof orderSchema>

interface OrderFormProps {
  customers: { id: string; name: string }[]
  products?: { id: string; name: string; defaultSalePrice: number }[]
  defaultValues?: OrderFormValues
  onSubmit: (values: OrderFormValues) => Promise<void> | void
  isSubmitting?: boolean
  showStatusField?: boolean
}

const defaultItem = { productId: '', description: '', quantity: 1, unitPrice: 0 }

export const OrderForm = ({
  customers,
  products,
  defaultValues,
  onSubmit,
  isSubmitting,
  showStatusField = false,
}: OrderFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: defaultValues ?? {
      customerId: '',
      deliveryDate: '',
      status: 'Pending',
      items: [defaultItem],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  const handleSelectProduct = (index: number, productId: string) => {
    if (!productId) return
    const selectedProduct = products?.find((product) => product.id === productId)
    if (!selectedProduct) return

    setValue(`items.${index}.description`, selectedProduct.name, { shouldDirty: true, shouldValidate: true })
    setValue(`items.${index}.unitPrice`, selectedProduct.defaultSalePrice, { shouldDirty: true, shouldValidate: true })
  }

  const handleFormSubmit = async (values: OrderFormValues) => {
    await onSubmit({
      ...values,
      items: values.items.map((item) => ({
        ...item,
        productId: item.productId?.trim() ? item.productId : undefined,
      })),
    })

    if (!defaultValues) {
      reset({
        customerId: '',
        deliveryDate: '',
        status: 'Pending',
        items: [defaultItem],
      })
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-semibold text-brand-700">Cliente*</span>
          <select
            className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
            {...register('customerId')}
          >
            <option value="">Selecione um cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-xs text-brand-600">{errors.customerId.message}</p>}
        </label>

        <div />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-semibold text-brand-700">Data de entrega</span>
          <input
            type="date"
            className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
            {...register('deliveryDate')}
          />
        </label>

        {showStatusField && (
          <label className="text-sm text-brand-600">
            <span className="mb-1 block font-semibold text-brand-700">Status</span>
            <select
              className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
              {...register('status')}
            >
              <option value="Pending">Pendente</option>
              <option value="InProduction">Produção</option>
              <option value="Shipped">Enviado</option>
              <option value="Delivered">Entregue</option>
              <option value="Cancelled">Cancelado</option>
            </select>
          </label>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-700">Itens</h4>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-xl border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
            onClick={() => append(defaultItem)}
          >
            + Adicionar item
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-2xl border border-brand-100 p-4 md:grid-cols-5">
            <label className="text-xs text-brand-500">
              <span className="mb-1 block font-semibold text-brand-700">Produto</span>
              <select
                className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                {...register(`items.${index}.productId` as const)}
                onChange={(event) => {
                  setValue(`items.${index}.productId`, event.target.value, { shouldDirty: true })
                  handleSelectProduct(index, event.target.value)
                }}
              >
                <option value="">Item avulso</option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-brand-500 md:col-span-2">
              <span className="mb-1 block font-semibold text-brand-700">Descrição</span>
              <input
                className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm text-brand-700 placeholder:text-brand-200 focus:border-brand-500 focus:outline-none"
                {...register(`items.${index}.description` as const)}
                placeholder="Convite floral"
              />
              {errors.items?.[index]?.description && (
                <p className="text-xs text-brand-600">{errors.items[index]?.description?.message}</p>
              )}
            </label>

            <label className="text-xs text-brand-500">
              <span className="mb-1 block font-semibold text-brand-700">Quantidade</span>
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
              />
              {errors.items?.[index]?.quantity && (
                <p className="text-xs text-brand-600">{errors.items[index]?.quantity?.message}</p>
              )}
            </label>

            <label className="text-xs text-brand-500">
              <span className="mb-1 block font-semibold text-brand-700">Valor unitário</span>
              <input
                type="number"
                step="0.01"
                min={0}
                className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
              />
              {errors.items?.[index]?.unitPrice && (
                <p className="text-xs text-brand-600">{errors.items[index]?.unitPrice?.message}</p>
              )}
            </label>

            {fields.length > 1 && (
              <button
                type="button"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-brand-100 px-3 py-2 text-brand-500 transition hover:bg-brand-50"
                onClick={() => remove(index)}
              >
                Remover
              </button>
            )}
          </div>
        ))}

        {typeof errors.items?.message === 'string' && (
          <p className="text-xs text-brand-600">{errors.items.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Salvando pedido...' : 'Salvar pedido'}
      </button>
    </form>
  )
}
