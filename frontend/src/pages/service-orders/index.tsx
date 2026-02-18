import { isAxiosError } from 'axios'
import { Fragment, useEffect, useMemo, useState } from 'react'

import { ServiceOrderForm, type ServiceOrderFormValues } from '../../components/serviceOrders/ServiceOrderForm'
import { useCustomers } from '../../hooks/useCustomers'
import { useOrders } from '../../hooks/useOrders'
import { useServiceOrderMutations } from '../../hooks/useServiceOrderMutations'
import { useServiceOrders } from '../../hooks/useServiceOrders'
import type { Customer } from '../../types/customer'
import type { Order } from '../../types/order'
import type { ServiceOrder } from '../../types/serviceOrder'

type PrintableItem = {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

type PrintableLineItem = PrintableItem & {
  kind: 'Produto' | 'Serviço'
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

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const parseDate = (value?: string | null) => {
  if (!value) return null
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (value?: string | null) => {
  const parsed = parseDate(value)
  if (!parsed) return '—'
  return parsed.toLocaleDateString('pt-BR')
}

const getPrintableProductItems = (serviceOrder: ServiceOrder | null, orderMap: Map<string, Order>): PrintableItem[] => {
  if (!serviceOrder) return []
  const serviceOrderProductItems =
    serviceOrder.items
      ?.filter((item) => item.orderItemId)
      .map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice ?? 0),
      })) ?? []

  if (serviceOrderProductItems.length > 0) {
    return serviceOrderProductItems
  }

  const resolvedOrderItems = serviceOrder.order?.items ?? orderMap.get(serviceOrder.orderId)?.items ?? []
  return resolvedOrderItems.map(({ id, description, quantity, unitPrice }) => ({
    id,
    description,
    quantity,
    unitPrice,
  }))
}

const getPrintableAdditionalItems = (serviceOrder: ServiceOrder | null): PrintableItem[] => {
  if (!serviceOrder) return []
  return (
    serviceOrder.items
      ?.filter((item) => !item.orderItemId)
      .map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice ?? 0),
    })) ?? []
  )
}

export const ServiceOrders = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [orderForPrint, setOrderForPrint] = useState<ServiceOrder | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')

  const { data: customers } = useCustomers()
  const { data: ordersData } = useOrders()
  const { data: serviceOrders, isLoading, error } = useServiceOrders()
  const {
    create: createServiceOrder,
    update: updateServiceOrder,
    remove: removeServiceOrder,
  } = useServiceOrderMutations()

  const customerMap = useMemo(() => {
    if (!customers) return {}
    return customers.reduce<Record<string, string>>((acc, customer) => {
      acc[customer.id] = customer.name
      return acc
    }, {})
  }, [customers])

  const customerDetailsMap = useMemo(() => {
    if (!customers) return {}
    return customers.reduce<Record<string, Customer>>((acc, customer) => {
      acc[customer.id] = customer
      return acc
    }, {})
  }, [customers])

  const orderMap = useMemo(() => {
    if (!ordersData) return new Map<string, Order>()
    return new Map(ordersData.map((order) => [order.id, order]))
  }, [ordersData])

  useEffect(() => {
    const handleAfterPrint = () => setOrderForPrint(null)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const ordersForForm = useMemo(() => {
    if (!ordersData) return []
    return ordersData.map((order) => ({
      id: order.id,
      code: order.code,
      customerId: order.customerId,
      customerName: customerMap[order.customerId],
    }))
  }, [customerMap, ordersData])

  const printableProductItems = useMemo(() => getPrintableProductItems(orderForPrint, orderMap), [orderForPrint, orderMap])
  const printableAdditionalItems = useMemo(() => getPrintableAdditionalItems(orderForPrint), [orderForPrint])
  const printableLineItems = useMemo<PrintableLineItem[]>(
    () => [
      ...printableProductItems.map((item) => ({ ...item, kind: 'Produto' as const })),
      ...printableAdditionalItems.map((item) => ({ ...item, kind: 'Serviço' as const })),
    ],
    [printableProductItems, printableAdditionalItems],
  )
  const productsTotal = useMemo(
    () => printableProductItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [printableProductItems],
  )
  const additionalItemsTotal = useMemo(
    () => printableAdditionalItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [printableAdditionalItems],
  )
  const printableGrandTotal = productsTotal + additionalItemsTotal
  const customerForPrint = useMemo(() => {
    if (!orderForPrint) return null
    return customerDetailsMap[orderForPrint.customerId] ?? orderForPrint.customer ?? null
  }, [customerDetailsMap, orderForPrint])

  const normalizeText = (value?: string | null) => {
    if (!value) return ''
    const text = `${value}`.trim()
    return text
  }

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback(message)
    setFeedbackType(type)
    setTimeout(() => setFeedback(null), 4000)
  }

  const openCreateModal = () => {
    setCreateError(null)
    setEditingOrder(null)
    setIsCreateOpen(true)
  }

  const openEditModal = (serviceOrder: ServiceOrder) => {
    setCreateError(null)
    setEditingOrder(serviceOrder)
    setIsCreateOpen(true)
  }

  const closeFormModal = () => {
    setCreateError(null)
    setEditingOrder(null)
    setIsCreateOpen(false)
  }

  const handlePrint = (serviceOrder: ServiceOrder) => {
    setOrderForPrint(serviceOrder)
    setTimeout(() => window.print(), 40)
  }

  const handleSubmitForm = async (values: ServiceOrderFormValues) => {
    setCreateError(null)
    const order = values.orderId ? orderMap.get(values.orderId) : null

    if (!order) {
      const message = editingOrder ? 'Pedido não encontrado para atualizar a OS.' : 'Pedido não encontrado para gerar a OS.'
      setCreateError(message)
      showMessage(message, 'error')
      return
    }

    const payload = {
      orderId: order.id,
      customerId: values.customerId,
      scheduledDate: values.scheduledDate,
      responsible: values.responsible?.trim() ? values.responsible.trim() : undefined,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
      items:
        values.extraItems && values.extraItems.length > 0
          ? values.extraItems.map((item) => ({
              orderItemId: null,
              description: item.description.trim(),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          : undefined,
    }

    try {
      if (editingOrder) {
        await updateServiceOrder.mutateAsync({ id: editingOrder.id, payload })
        showMessage('Ordem de serviço atualizada com sucesso!')
        if (selectedOrder?.id === editingOrder.id) {
          setSelectedOrder(null)
        }
      } else {
        await createServiceOrder.mutateAsync(payload)
        showMessage('Ordem de serviço criada com sucesso!')
      }

      closeFormModal()
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        editingOrder ? 'Erro ao atualizar ordem de serviço.' : 'Erro ao criar ordem de serviço.',
      )
      setCreateError(message)
      showMessage(message, 'error')
    }
  }

  const handleDelete = async (serviceOrder: ServiceOrder) => {
    const shouldDelete = window.confirm(
      `Deseja excluir a ordem de serviço ${serviceOrder.order?.code ?? serviceOrder.id.slice(0, 8)}?`,
    )
    if (!shouldDelete) return

    try {
      await removeServiceOrder.mutateAsync(serviceOrder.id)
      showMessage('Ordem de serviço excluída com sucesso!')

      if (selectedOrder?.id === serviceOrder.id) {
        setSelectedOrder(null)
      }
      if (editingOrder?.id === serviceOrder.id) {
        closeFormModal()
      }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao excluir ordem de serviço.')
      showMessage(message, 'error')
    }
  }

  const displayedOrders = serviceOrders ?? []
  const showEmptyState = !isLoading && !error && displayedOrders.length === 0
  const formDefaultValues = useMemo<Partial<ServiceOrderFormValues> | undefined>(() => {
    if (!editingOrder) return undefined

    return {
      customerId: editingOrder.customerId,
      orderId: editingOrder.orderId,
      scheduledDate: editingOrder.scheduledDate,
      responsible: editingOrder.responsible ?? '',
      notes: editingOrder.notes ?? '',
      extraItems: editingOrder.items
        .filter((item) => !item.orderItemId)
        .map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice ?? 0),
        })),
    }
  }, [editingOrder])
  const isSubmittingForm = createServiceOrder.isPending || updateServiceOrder.isPending

  return (
    <>
      <section className="space-y-6 screen-only">
        <header className="space-y-2 text-brand-700">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Ordens de serviço</p>
          <h2 className="text-2xl font-bold text-brand-700">Entregas e instalações planejadas</h2>
          <p className="text-sm text-brand-500">Painel com ordens de serviço por status e informações de planejamento diário da equipe.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow hover:bg-brand-400"
              onClick={openCreateModal}
              disabled={!ordersForForm.length}
            >
              <span aria-hidden>＋</span>
              Gerar ordem
            </button>
          </div>
          {!ordersForForm.length && <p className="text-xs text-brand-400">Cadastre pedidos para gerar ordens de serviço.</p>}
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

        <div className="rounded-2xl border border-brand-100 bg-white/95 shadow-sm">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm text-brand-700">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-brand-400">
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-6 py-6 text-brand-500" colSpan={5}>
                    Carregando ordens de serviço...
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td className="px-6 py-6 text-brand-600" colSpan={5}>
                    Não foi possível carregar as ordens de serviço.
                  </td>
                </tr>
              )}

              {showEmptyState && (
                <tr>
                  <td className="px-6 py-6 text-brand-500" colSpan={5}>
                    Nenhuma ordem de serviço encontrada.
                  </td>
                </tr>
              )}

              {!isLoading && !error &&
                displayedOrders.map((serviceOrder) => {
                  return (
                    <tr key={serviceOrder.id} className="border-t border-brand-100">
                      <td className="px-6 py-4 text-sm font-semibold text-brand-800">{serviceOrder.order?.code ?? '—'}</td>
                      <td className="px-6 py-4 text-brand-600">{customerMap[serviceOrder.customerId] ?? '—'}</td>
                      <td className="px-6 py-4 text-brand-600">{formatDate(serviceOrder.scheduledDate)}</td>
                      <td className="px-6 py-4 text-brand-600">{serviceOrder.responsible ?? 'Não informado'}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2 flex-wrap">
                          <button
                            type="button"
                            className="rounded-full border border-brand-100 px-3 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                            onClick={() => setSelectedOrder(serviceOrder)}
                          >
                            Ver detalhes
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-brand-100 px-3 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                            onClick={() => openEditModal(serviceOrder)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-brand-100 px-3 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                            onClick={() => handlePrint(serviceOrder)}
                          >
                            Imprimir
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-red-200 px-3 py-1 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-60"
                            onClick={() => handleDelete(serviceOrder)}
                            disabled={removeServiceOrder.isPending}
                          >
                            Excluir
                          </button>
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
                  <p className="text-xs uppercase tracking-[0.4em] text-brand-400">{editingOrder ? 'Editar OS' : 'Nova OS'}</p>
                  <h3 className="text-xl font-semibold text-brand-700">
                    {editingOrder ? 'Editar ordem de serviço' : 'Gerar ordem de serviço'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                  onClick={closeFormModal}
                >
                  Fechar
                </button>
              </div>

              {createError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {createError}
                </div>
              )}

              <ServiceOrderForm
                customers={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
                orders={ordersForForm}
                defaultValues={formDefaultValues}
                onSubmit={handleSubmitForm}
                isSubmitting={isSubmittingForm}
              />
            </div>
          </div>
        )}
      </section>

      {selectedOrder && (
        <div className="screen-only fixed inset-0 z-40 flex items-stretch justify-end bg-black/20">
          <div className="w-full max-w-md space-y-6 overflow-y-auto border-l border-brand-100 bg-white/95 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Detalhes</p>
                <h3 className="text-2xl font-semibold text-brand-700">{selectedOrder.order?.code ?? 'Ordem'}</h3>
                <p className="text-sm text-brand-500">{customerMap[selectedOrder.customerId] ?? '—'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-brand-100 px-4 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                  onClick={() => openEditModal(selectedOrder)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-full border border-brand-100 px-4 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                  onClick={() => handlePrint(selectedOrder)}
                >
                  Imprimir 2 vias
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-200 px-4 py-1 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-60"
                  onClick={() => handleDelete(selectedOrder)}
                  disabled={removeServiceOrder.isPending}
                >
                  Excluir
                </button>
                <button
                  type="button"
                  className="rounded-full border border-brand-100 px-4 py-1 text-sm font-semibold text-brand-500 hover:bg-brand-50"
                  onClick={() => setSelectedOrder(null)}
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm text-sm">
              <div>
                <p className="text-brand-400">Data programada</p>
                <p className="text-brand-700">{formatDate(selectedOrder.scheduledDate)}</p>
              </div>
              <div>
                <p className="text-brand-400">Responsável</p>
                <p className="text-brand-700">{selectedOrder.responsible ?? 'Não informado'}</p>
              </div>
            </div>

            {normalizeText(selectedOrder.notes) && (
              <div className="rounded-2xl border border-brand-100 bg-white p-4 text-sm text-brand-600 shadow-sm">
                <p className="text-sm font-semibold text-brand-700">Observações</p>
                <p className="mt-2 whitespace-pre-line">{normalizeText(selectedOrder.notes)}</p>
              </div>
            )}

            <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-brand-700">Itens vinculados</h4>
                <span className="text-sm text-brand-400">{selectedOrder.items.length} itens</span>
              </div>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id ?? item.description} className="rounded-xl border border-brand-50 bg-brand-50/60 p-3">
                    <p className="text-sm font-semibold text-brand-700">{item.description}</p>
                    <p className="mt-1 text-sm text-brand-500">Qtd: {item.quantity}</p>
                    <p className="mt-1 text-sm text-brand-500">Valor unit.: {formatCurrency(Number(item.unitPrice ?? 0))}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="flex-1" type="button" onClick={() => setSelectedOrder(null)} aria-label="Fechar detalhes" />
        </div>
      )}

      {orderForPrint && (
        <section className="print-view">
          <style>{`
            @media screen {
              .print-view {
                display: none;
              }
            }
            @media print {
              body, html {
                background: #fff !important;
              }
              body * {
                visibility: hidden;
              }
              .print-view,
              .print-view * {
                visibility: visible;
              }
              .print-view {
                position: fixed;
                inset: 0;
                display: block;
              }
              .screen-only {
                display: none !important;
              }
            }
            .print-view {
              color: #000;
              font-family: 'Arial', sans-serif;
              padding: 12px;
              background: #fff;
              width: 100%;
              height: 100%;
            }
            .print-wrapper {
              display: grid;
              grid-template-rows: 1fr auto 1fr;
              gap: 6px;
              height: 100%;
            }
            .print-copy {
              border: 2px solid #000;
              padding: 10px;
              min-height: calc(50vh - 20px);
              display: flex;
              flex-direction: column;
              gap: 6px;
              box-sizing: border-box;
            }
            .print-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .print-company {
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              margin: 0;
              font-size: 0.86rem;
            }
            .print-subtitle {
              margin: 2px 0 0;
              font-size: 0.68rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .print-identifier {
              border: 1px solid #000;
              padding: 4px 8px;
              text-align: center;
              font-size: 0.7rem;
              line-height: 1.3;
            }
            .print-identifier strong {
              display: block;
              font-size: 0.82rem;
            }
            .print-client-section {
              border: 1px solid #000;
              padding: 5px 6px;
              font-size: 0.65rem;
            }
            .print-client-title {
              margin: 0 0 4px;
              font-size: 0.62rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .print-client-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 4px 8px;
            }
            .print-client-item {
              min-width: 0;
              display: flex;
              flex-direction: column;
              gap: 1px;
            }
            .print-client-item-full {
              grid-column: 1 / -1;
            }
            .print-client-label {
              font-size: 0.54rem;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              opacity: 0.8;
            }
            .print-client-value {
              font-size: 0.66rem;
              font-weight: 600;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .print-client-item-full .print-client-value {
              white-space: normal;
              overflow: visible;
              text-overflow: clip;
            }
            .print-list-section {
              border: 1px solid #000;
              padding: 5px 6px;
              font-size: 0.67rem;
            }
            .print-list-title {
              margin: 0;
              font-size: 0.62rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 4px;
            }
            .print-list-body {
              display: flex;
              flex-direction: column;
              gap: 2px;
            }
            .print-list-row {
              display: grid;
              grid-template-columns: 1fr auto;
              gap: 8px;
              align-items: center;
              padding: 2px 0;
              border-bottom: 1px dotted #d1d1d1;
              line-height: 1.2;
            }
            .print-list-row:last-child {
              border-bottom: 0;
            }
            .print-list-desc {
              min-width: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .print-list-kind {
              text-transform: uppercase;
              font-size: 0.54rem;
              letter-spacing: 0.04em;
              margin-right: 4px;
              opacity: 0.8;
            }
            .print-list-values {
              display: grid;
              grid-template-columns: 28px 56px 64px;
              gap: 6px;
              justify-items: end;
              text-align: right;
              font-size: 0.64rem;
              white-space: nowrap;
            }
            .print-list-empty {
              font-size: 0.63rem;
              opacity: 0.8;
            }
            .print-list-total {
              margin-top: 4px;
              padding-top: 3px;
              border-top: 1px solid #000;
              font-weight: 700;
              text-align: right;
              font-size: 0.66rem;
            }
            .print-note {
              border: 1px solid #000;
              padding: 4px;
              font-size: 0.66rem;
              min-height: 24px;
            }
            .print-summary {
              display: grid;
              grid-template-columns: 1fr;
              gap: 6px;
              font-size: 0.66rem;
            }
            .print-summary span {
              border: 1px solid #000;
              padding: 4px;
            }
            .print-signature-footer {
              display: flex;
              justify-content: flex-end;
              gap: 12px;
              margin-top: auto;
              font-size: 0.66rem;
              align-items: flex-end;
            }
            .print-signature-block {
              flex: 0 0 240px;
              max-width: 240px;
              text-align: center;
            }
            .print-signature-line {
              border-top: 1px solid #000;
              margin-top: 14px;
              padding-top: 2px;
            }
            .print-date-fill {
              min-width: 180px;
              width: 180px;
              margin-top: 14px;
              text-align: center;
            }
            .print-date-line {
              font-weight: 600;
              letter-spacing: 0.08em;
              margin-bottom: 2px;
            }
            .print-date-label {
              display: block;
            }
            .print-cut-guide {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.55rem;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #444;
            }
            .print-cut-guide::before,
            .print-cut-guide::after {
              content: '';
              flex: 1;
              border-top: 1px dashed #666;
            }
          `}</style>
          <div className="print-wrapper">
            {[0, 1].map((_, index) => {
              const companyName = 'Bella Design'
              const osNumber = orderForPrint.order?.code ?? orderForPrint.id.slice(0, 8).toUpperCase()
              const customerName =
                normalizeText(customerForPrint?.name) ||
                normalizeText(customerMap[orderForPrint.customerId]) ||
                'Não informado'
              const customerPhone = normalizeText(customerForPrint?.phone) || 'Não informado'
              const customerEmail = normalizeText(customerForPrint?.email) || 'Não informado'
              const customerAddress = normalizeText(customerForPrint?.address) || 'Não informado'
              const notesText = normalizeText(orderForPrint.notes)

              return (
                <Fragment key={index}>
                  <article className="print-copy">
                    <div className="print-header">
                      <div>
                        <p className="print-company">{companyName}</p>
                        <p className="print-subtitle">Documento de atendimento e entrega</p>
                      </div>
                      <div className="print-identifier">
                        <span>OS Nº</span>
                        <strong>{osNumber}</strong>
                      </div>
                    </div>

                    <section className="print-client-section">
                      <h4 className="print-client-title">Dados do cliente</h4>
                      <div className="print-client-grid">
                        <div className="print-client-item">
                          <span className="print-client-label">Cliente</span>
                          <span className="print-client-value">{customerName}</span>
                        </div>
                        <div className="print-client-item">
                          <span className="print-client-label">Telefone</span>
                          <span className="print-client-value">{customerPhone}</span>
                        </div>
                        <div className="print-client-item">
                          <span className="print-client-label">Email</span>
                          <span className="print-client-value">{customerEmail}</span>
                        </div>
                        <div className="print-client-item">
                          <span className="print-client-label">Data programada</span>
                          <span className="print-client-value">{formatDate(orderForPrint.scheduledDate)}</span>
                        </div>
                        <div className="print-client-item">
                          <span className="print-client-label">Responsável</span>
                          <span className="print-client-value">{normalizeText(orderForPrint.responsible) || 'Não informado'}</span>
                        </div>
                        <div className="print-client-item print-client-item-full">
                          <span className="print-client-label">Endereço</span>
                          <span className="print-client-value">{customerAddress}</span>
                        </div>
                      </div>
                    </section>

                    <section className="print-list-section">
                      <h4 className="print-list-title">Produtos e serviços</h4>
                      <div className="print-list-body">
                        {printableLineItems.length ? (
                          printableLineItems.map((item) => (
                            <div key={`${item.kind}-${item.id ?? item.description}`} className="print-list-row">
                              <div className="print-list-desc">
                                <span className="print-list-kind">{item.kind}</span>
                                <span>{item.description}</span>
                              </div>
                              <div className="print-list-values">
                                <span>{item.quantity}x</span>
                                <span>{formatCurrency(item.unitPrice)}</span>
                                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="print-list-empty">Nenhum item listado.</div>
                        )}
                      </div>
                      <div className="print-list-total">Total: {formatCurrency(printableGrandTotal)}</div>
                    </section>

                    {notesText && (
                      <div className="print-note">
                        <strong>Observações: </strong>
                        {notesText}
                      </div>
                    )}

                    <div className="print-summary">
                      <span>
                        Total da OS:
                        <strong>{formatCurrency(printableGrandTotal)}</strong>
                      </span>
                    </div>

                    <div className="print-signature-footer">
                      <div className="print-signature-block">
                        <div className="print-signature-line">Cliente</div>
                      </div>
                      <div className="print-date-fill">
                        <div className="print-date-line">____/____/______</div>
                        <span className="print-date-label">Data</span>
                      </div>
                    </div>
                  </article>
                  {index === 0 && <div className="print-cut-guide">Corte aqui</div>}
                </Fragment>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
