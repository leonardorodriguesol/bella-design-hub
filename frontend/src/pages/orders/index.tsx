import { isAxiosError } from 'axios'
import { useMemo, useState } from 'react'

import { OrderForm, type OrderFormValues } from '../../components/orders/OrderForm'
import { IconActionButton } from '../../components/ui/IconActionButton'
import { useOrders } from '../../hooks/useOrders'
import { useCustomers } from '../../hooks/useCustomers'
import { useOrderMutations } from '../../hooks/useOrderMutations'
import { useProducts } from '../../hooks/useProducts'
import type { Order, OrderStatus, UpdateOrderInput } from '../../types/order'

type OrderFilterStatus = OrderStatus | 'Overdue'

const orderStatusOptions: { label: string; value: OrderStatus }[] = [
  { label: 'Pendente', value: 'Pending' },
  { label: 'Produção', value: 'InProduction' },
  { label: 'Enviado', value: 'Shipped' },
  { label: 'Entregue', value: 'Delivered' },
  { label: 'Cancelado', value: 'Cancelled' },
]

const orderFilterStatusOptions: { label: string; value: OrderFilterStatus }[] = [
  ...orderStatusOptions,
  { label: 'Atrasado', value: 'Overdue' },
]

export const Orders = () => {
  const { data: customers } = useCustomers()
  const { data: products } = useProducts()
  const [filters, setFilters] = useState<{ customerId?: string; status?: OrderFilterStatus }>({})
  const [customerSearch, setCustomerSearch] = useState('')
  const [isCustomerFilterOpen, setIsCustomerFilterOpen] = useState(false)

  const apiFilters = useMemo(
    () => ({
      customerId: filters.customerId,
      status: filters.status && filters.status !== 'Overdue' ? (filters.status as OrderStatus) : undefined,
    }),
    [filters],
  )

  const { data, isLoading, error } = useOrders(apiFilters)
  const { create, update, remove } = useOrderMutations()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')

  const customerMap = useMemo(() => {
    if (!customers) return {}
    return customers.reduce<Record<string, string>>((acc, customer) => {
      acc[customer.id] = customer.name
      return acc
    }, {})
  }, [customers])

  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    const term = customerSearch.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((customer) => customer.name.toLowerCase().includes(term))
  }, [customers, customerSearch])

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback(message)
    setFeedbackType(type)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleSelectCustomer = (customerId?: string) => {
    setFilters((prev) => ({ ...prev, customerId }))
    setIsCustomerFilterOpen(false)
  }

  const selectedCustomerLabel = filters.customerId
    ? customerMap[filters.customerId] ?? 'Cliente selecionado'
    : 'Todos'

  const normalizeDate = (value?: string) => {
    if (!value) return undefined
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return undefined
    return date.toISOString()
  }

  const formatDateForInput = (value?: string | null) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
  }

  const getApiErrorMessage = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) {
      const data = err.response?.data
      if (typeof data === 'string') return data
      if (data && typeof data === 'object') {
        if ('message' in data && typeof (data as { message?: string }).message === 'string') {
          return (data as { message: string }).message
        }
        if ('errors' in data && data.errors && typeof data.errors === 'object') {
          const errorsObj = data.errors as Record<string, string | string[]>
          const firstKey = Object.keys(errorsObj)[0]
          if (firstKey) {
            const value = errorsObj[firstKey]
            if (Array.isArray(value)) return value[0]
            if (typeof value === 'string') return value
          }
        }
        if ('title' in data && typeof (data as { title?: string }).title === 'string') {
          return (data as { title: string }).title
        }
      }
    }
    return fallback
  }

  const isOrderOverdue = (order: Order) => {
    if (!order.deliveryDate || order.status === 'Delivered') return false
    const deliveryDate = new Date(order.deliveryDate)
    return deliveryDate.getTime() < new Date().getTime()
  }

  const getOrderStatusInfo = (order: Order) => {
    const overdue = isOrderOverdue(order)
    const label = overdue
      ? 'Atrasado'
      : orderStatusOptions.find((opt) => opt.value === order.status)?.label ?? order.status
    return {
      label,
      isOverdue: overdue,
      textClass: overdue ? 'text-red-600 font-semibold' : 'text-brand-600',
      badgeClass: overdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-brand-50 text-brand-700 border-brand-100',
    }
  }

  const displayedOrders = useMemo(() => {
    if (!data) return []
    if (filters.status === 'Overdue') {
      return data.filter(isOrderOverdue)
    }
    return data
  }, [data, filters.status])

  const showEmptyState = !isLoading && !error && displayedOrders.length === 0
  const totalOrders = data?.length ?? 0
  const activeProducts = useMemo(
    () =>
      (products ?? [])
        .filter((product) => product.isActive)
        .map((product) => ({
          id: product.id,
          name: product.name,
          defaultSalePrice: product.defaultSalePrice,
        })),
    [products],
  )

  const handleCreate = async (values: OrderFormValues) => {
    setCreateError(null)
    try {
      await create.mutateAsync({
        customerId: values.customerId,
        deliveryDate: normalizeDate(values.deliveryDate?.trim()),
        items: values.items.map((item) => ({
          productId: item.productId?.trim() ? item.productId : undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      })
      showMessage('Pedido criado com sucesso!')
      setIsCreateOpen(false)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Erro ao criar pedido.')
      setCreateError(message)
      showMessage(message, 'error')
    }
  }

  const handleUpdate = async (values: OrderFormValues) => {
    if (!editingOrder) return
    setUpdateError(null)
    try {
      const payload: UpdateOrderInput = {
        customerId: values.customerId,
        deliveryDate: normalizeDate(values.deliveryDate?.trim()),
        status: (values.status as OrderStatus) ?? 'Pending',
        items: values.items.map((item) => ({
          productId: item.productId?.trim() ? item.productId : undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }

      await update.mutateAsync({ id: editingOrder.id, payload })
      showMessage('Pedido atualizado com sucesso!')
      setEditingOrder(null)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Erro ao atualizar pedido.')
      setUpdateError(message)
      showMessage(message, 'error')
    }
  }

  const handleDelete = (order: Order) => {
    if (!window.confirm(`Deseja excluir o pedido ${order.code}?`)) return
    remove.mutate(order.id, {
      onSuccess: () => showMessage('Pedido removido com sucesso!'),
      onError: () => showMessage('Erro ao remover pedido.', 'error'),
    })
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-3xl border border-brand-100 bg-white/95 p-6 text-brand-700 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Pedidos</p>
            <h2 className="text-3xl font-semibold text-brand-800">Acompanhamento comercial</h2>
            <p className="text-sm text-brand-500">
              Pedidos com filtros por cliente e status para leitura rápida da operação.
            </p>
            <p className="text-xs text-brand-400">
              {isLoading ? 'Carregando pedidos...' : `${totalOrders.toLocaleString('pt-BR')} pedido(s) no total`}
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <span aria-hidden>＋</span>
            Novo pedido
          </button>
        </div>
      </header>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedbackType === 'success'
              ? 'border-brand-200 bg-brand-50 text-brand-700'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}
        >
          {feedback}
        </div>
      )}

      <div className="rounded-2xl border border-brand-100 bg-white/95 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-brand-500">
            <span className="mb-1 block font-medium text-brand-700">Cliente</span>
            <div className="relative">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-brand-100 bg-white px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                onClick={() => setIsCustomerFilterOpen((prev) => !prev)}
              >
                <span>{selectedCustomerLabel}</span>
                <span className={`text-brand-500 transition-transform ${isCustomerFilterOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {isCustomerFilterOpen && (
                <div className="absolute z-10 mt-2 w-full rounded-xl border border-brand-100 bg-white shadow-lg">
                  <div className="border-b border-brand-100 p-3">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 placeholder:text-brand-300 focus:border-brand-500 focus:outline-none"
                      placeholder="Digite parte do nome"
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1">
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-brand-50 ${
                        !filters.customerId ? 'bg-brand-50 text-brand-800' : 'text-brand-600'
                      }`}
                      onClick={() => handleSelectCustomer(undefined)}
                    >
                      <span>Todos</span>
                      {!filters.customerId && <span className="text-xs text-brand-400">Selecionado</span>}
                    </button>
                    {filteredCustomers.length === 0 && (
                      <p className="px-3 py-2 text-xs text-brand-400">Nenhum cliente encontrado.</p>
                    )}
                    {filteredCustomers.map((customer) => {
                      const isActive = filters.customerId === customer.id
                      return (
                        <button
                          type="button"
                          key={customer.id}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-brand-50 ${
                            isActive ? 'bg-brand-50 text-brand-800' : 'text-brand-600'
                          }`}
                          onClick={() => handleSelectCustomer(customer.id)}
                        >
                          <span>{customer.name}</span>
                          {isActive && <span className="text-xs text-brand-400">Selecionado</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </label>

          <label className="text-sm text-brand-500">
            <span className="mb-1 block font-medium text-brand-700">Status</span>
            <select
              className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
              value={filters.status ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: (event.target.value as OrderFilterStatus) || undefined }))
              }
            >
              <option value="">Todos</option>
              {orderFilterStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white/95 shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm text-brand-700">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-brand-400">
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4">Entrega prevista</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={7}>
                  Carregando pedidos...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td className="px-6 py-6 text-brand-600" colSpan={7}>
                  Não foi possível carregar os pedidos.
                </td>
              </tr>
            )}

            {showEmptyState && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={7}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}

            {!isLoading && !error &&
              displayedOrders.map((order) => {
                const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : null
                const statusInfo = getOrderStatusInfo(order)

                return (
                  <tr key={order.id} className="border-t border-brand-100">
                    <td className="px-6 py-4 text-sm font-medium text-brand-800">{order.code}</td>
                    <td className="px-6 py-4 text-brand-600">{customerMap[order.customerId] ?? '—'}</td>
                    <td className={`px-6 py-4 ${statusInfo.textClass}`}>{statusInfo.label}</td>
                    <td className="px-6 py-4 text-brand-600">
                      {order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-brand-600">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-brand-600">
                      {deliveryDate ? deliveryDate.toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <IconActionButton label="Detalhes" onClick={() => setSelectedOrder(order)}>
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </IconActionButton>
                        <IconActionButton label="Editar" onClick={() => setEditingOrder(order)}>
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 21h4l11-11a2.121 2.121 0 0 0-3-3L4 18v3z" />
                            <path d="m14.5 5.5 3 3" />
                          </svg>
                        </IconActionButton>
                        <IconActionButton label="Excluir" variant="danger" onClick={() => handleDelete(order)} disabled={remove.isPending}>
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </IconActionButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {isCreateOpen && customers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Novo</p>
                <h3 className="text-xl font-semibold text-brand-700">Criar pedido</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => setIsCreateOpen(false)}
              >
                Fechar
              </button>
            </div>

            {createError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {createError}
              </div>
            )}

            <OrderForm customers={customers} products={activeProducts} onSubmit={handleCreate} isSubmitting={create.isPending} />
          </div>
        </div>
      )}

      {editingOrder && customers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Editar</p>
                <h3 className="text-xl font-semibold text-brand-700">{editingOrder.code}</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => setEditingOrder(null)}
              >
                Fechar
              </button>
            </div>

            {updateError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {updateError}
              </div>
            )}

            <OrderForm
              customers={customers}
              defaultValues={{
                customerId: editingOrder.customerId,
                deliveryDate: formatDateForInput(editingOrder.deliveryDate),
                status: editingOrder.status,
                items: editingOrder.items.map((item) => ({
                  productId: item.productId ?? '',
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                })),
              }}
              products={activeProducts}
              onSubmit={handleUpdate}
              isSubmitting={update.isPending}
              showStatusField
            />
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-stretch justify-end bg-black/20">
          <div className="w-full max-w-md space-y-6 overflow-y-auto border-l border-brand-100 bg-white/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Detalhes</p>
                <h3 className="text-2xl font-semibold text-brand-700">{selectedOrder.code}</h3>
                <p className="text-sm text-brand-500">{customerMap[selectedOrder.customerId] ?? '—'}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-brand-100 px-4 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                onClick={() => setSelectedOrder(null)}
              >
                Fechar
              </button>
            </div>

            {getOrderStatusInfo(selectedOrder).isOverdue && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                ⚠️ Pedido atrasado — atualize o status para acompanhar.
              </div>
            )}

            <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-500">Status atual</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusInfo(selectedOrder).badgeClass}`}>
                  {getOrderStatusInfo(selectedOrder).label}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {orderStatusOptions.map((status) => {
                  const isReached =
                    orderStatusOptions.findIndex((opt) => opt.value === status.value) <=
                    orderStatusOptions.findIndex((opt) => opt.value === selectedOrder.status)

                  return (
                    <div key={status.value} className="flex items-center gap-3">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isReached ? 'bg-brand-500' : 'bg-brand-100'
                        }`}
                      />
                      <span className={`text-sm ${isReached ? 'text-brand-700' : 'text-brand-300'}`}>
                        {status.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm text-sm md:grid-cols-2">
              <div>
                <p className="text-brand-400">Criado em</p>
                <p className="text-brand-700">{new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-brand-400">Entrega prevista</p>
                <p className="text-brand-700">
                  {selectedOrder.deliveryDate
                    ? new Date(selectedOrder.deliveryDate).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-brand-400">Atualizado em</p>
                <p className="text-brand-700">
                  {selectedOrder.updatedAt
                    ? new Date(selectedOrder.updatedAt).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-brand-400">Total</p>
                <p className="text-brand-700">
                  {selectedOrder.totalAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-brand-700">Itens do pedido</h4>
                <span className="text-sm text-brand-400">{selectedOrder.items.length} itens</span>
              </div>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id ?? item.description} className="rounded-xl border border-brand-50 bg-brand-50/60 p-3">
                    <p className="text-sm font-semibold text-brand-700">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-brand-500">
                      <span>Qtd: {item.quantity}</span>
                      <span>
                        {item.unitPrice.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      <span className="font-semibold text-brand-700">
                        {(item.unitPrice * item.quantity).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="flex-1" type="button" onClick={() => setSelectedOrder(null)} aria-label="Fechar detalhes" />
        </div>
      )}
    </section>
  )
}
