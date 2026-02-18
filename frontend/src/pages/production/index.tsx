import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'

import { ProductForm } from '../../components/production/ProductForm'
import { IconActionButton } from '../../components/ui/IconActionButton'
import { useProductMutations } from '../../hooks/useProductMutations'
import { useProducts } from '../../hooks/useProducts'
import { useProductionScheduleMutations } from '../../hooks/useProductionScheduleMutations'
import { useProductionSchedules } from '../../hooks/useProductionSchedules'
import type { CreateProductInput, CreateProductionScheduleInput, Product, ProductionSchedule } from '../../types/product'

const getLocalDateString = () => {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  const local = new Date(now.getTime() - tzOffset)
  return local.toISOString().split('T')[0]
}

const getDateParts = (value?: string) => {
  if (!value) return null
  const datePart = value.split('T')[0]
  if (!datePart) return null
  const [year, month, day] = datePart.split('-').map(Number)
  if (!year || !month || !day) return null
  return { year, month, day }
}

const formatDate = (value: string) => {
  const parts = getDateParts(value)
  if (!parts) return 'Data inválida'
  const { day, month, year } = parts
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
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

export const Production = () => {
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString())
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
  const [formError, setFormError] = useState<string | null>(null)
  const [planProductId, setPlanProductId] = useState('')
  const [planQuantity, setPlanQuantity] = useState(1)
  const [planError, setPlanError] = useState<string | null>(null)
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null)
  const [expandedCatalogId, setExpandedCatalogId] = useState<string | null>(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `@media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      .screen-only {
        display: none !important;
      }
      body * {
        visibility: hidden;
      }
      .print-only, .print-only * {
        visibility: visible;
      }
      .print-only {
        display: block !important;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 32px;
        background: #fff !important;
        color: #000 !important;
        font-size: 12pt;
        line-height: 1.4;
      }
      .print-only table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      .print-only table th,
      .print-only table td {
        border: 1px solid #000;
        padding: 6px;
        text-align: left;
      }
      .print-only table th {
        text-transform: uppercase;
        font-weight: 600;
      }
    }`
    document.head.append(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  const handlePrintPlan = () => {
    window.print()
  }

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback(message)
    setFeedbackType(type)
    setTimeout(() => setFeedback(null), 4000)
  }

  const { data: products } = useProducts()
  const { create: createProduct, update: updateProduct, remove: removeProduct } = useProductMutations()

  const scheduleFilters = useMemo(() => ({ scheduledDate: selectedDate }), [selectedDate])

  const {
    data: schedules,
    isLoading: loadingSchedules,
    error: schedulesError,
  } = useProductionSchedules(scheduleFilters)

  const { create: createSchedule, remove: removeSchedule } = useProductionScheduleMutations()

  const daySchedules = useMemo(() => schedules ?? [], [schedules])
  const totalQuantity = daySchedules.reduce((sum, schedule) => sum + schedule.quantity, 0)

  const handleCreateProduct = async (values: CreateProductInput) => {
    setFormError(null)
    try {
      await createProduct.mutateAsync(values)
      showMessage('Produto criado com sucesso!')
      setProductModalOpen(false)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao criar produto.')
      setFormError(message)
      showMessage(message, 'error')
    }
  }

  const handleUpdateProduct = async (values: CreateProductInput) => {
    if (!editingProduct) return
    setFormError(null)
    try {
      await updateProduct.mutateAsync({ id: editingProduct.id, payload: values })
      showMessage('Produto atualizado com sucesso!')
      setEditingProduct(null)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao atualizar produto.')
      setFormError(message)
      showMessage(message, 'error')
    }
  }

  const handleCreateSchedule = async (values: CreateProductionScheduleInput) => {
    setFormError(null)
    try {
      await createSchedule.mutateAsync(values)
      showMessage('Produção planejada!')
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao planejar produção.')
      setFormError(message)
      showMessage(message, 'error')
    }
  }

  const handleDeleteSchedule = (schedule: ProductionSchedule) => {
    if (!window.confirm('Deseja cancelar este planejamento?')) return
    removeSchedule.mutate(schedule.id, {
      onSuccess: () => showMessage('Planejamento removido!'),
      onError: () => showMessage('Erro ao remover planejamento.', 'error'),
    })
  }

  const handleEditProduct = (product: Product) => {
    setCatalogOpen(false)
    setEditingProduct(product)
    setProductModalOpen(true)
    setFormError(null)
  }

  const handleDeleteProduct = (product: Product) => {
    if (!window.confirm(`Remover o produto "${product.name}"?`)) return
    removeProduct.mutate(product.id, {
      onSuccess: () => showMessage('Produto removido!'),
      onError: () => showMessage('Erro ao remover produto.', 'error'),
    })
  }

  const consolidatedParts = useMemo(() => {
    const summary = new Map<string, { name: string; quantity: number }>()
    daySchedules.forEach((schedule) => {
      schedule.parts.forEach((part) => {
        const key = part.name
        const item = summary.get(key)
        if (item) {
          item.quantity += part.quantity
        } else {
          summary.set(key, {
            name: part.name,
            quantity: part.quantity,
          })
        }
      })
    })
    return Array.from(summary.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [daySchedules])

  return (
    <>
      <section className="mx-auto max-w-6xl space-y-6 screen-only">
        <header className="rounded-3xl border border-brand-100 bg-white/95 p-6 text-brand-700 shadow-sm">
          <div className="flex flex-col gap-5 text-brand-800 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Produção</p>
              <h2 className="text-3xl font-semibold text-brand-800">Planejamento diário</h2>
              <p className="text-sm text-brand-500">Agenda de fabricação com quantidades, peças e histórico por data.</p>
              <p className="text-xs text-brand-400">
                {loadingSchedules
                  ? 'Carregando agenda...'
                  : `${daySchedules.length.toLocaleString('pt-BR')} item(ns) planejado(s) em ${formatDate(selectedDate)}`}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <label className="flex flex-col text-xs uppercase tracking-[0.3em] text-brand-400 md:items-end">
                <span>Histórico de produção</span>
                <input
                  type="date"
                  className="mt-1 rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value || getLocalDateString())}
                />
              </label>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 md:justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400"
                  onClick={() => {
                    setEditingProduct(null)
                    setProductModalOpen(true)
                    setFormError(null)
                  }}
                >
                  Cadastrar produto
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                  onClick={() => setCatalogOpen(true)}
                >
                  Ver catálogo
                </button>
              </div>
            </div>
          </div>
        </header>

        {feedback && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedbackType === 'success' ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {feedback}
          </div>
        )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-brand-100 bg-white/95 p-5 text-brand-700 shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-brand-800">Adicionar produção</h3>
            <p className="text-sm text-brand-500">Seleção de produto do catálogo para gerar as peças necessárias no dia.</p>
          </div>

          <form
            className="mt-4 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setPlanError(null)
              if (!planProductId) {
                setPlanError('Selecione um produto para produzir')
                return
              }

              try {
                await handleCreateSchedule({
                  productId: planProductId,
                  quantity: planQuantity,
                  scheduledDate: selectedDate,
                })
                setPlanProductId('')
                setPlanQuantity(1)
              } catch {
                setPlanError('Não foi possível salvar o plano. Verifique a API.')
              }
            }}
          >
            <label className="text-sm text-brand-600">
              <span className="mb-1 block font-semibold text-brand-700">Produto</span>
              <select
                className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                value={planProductId}
                onChange={(event) => setPlanProductId(event.target.value)}
              >
                <option value="">Itens do catálogo</option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-brand-600">
              <span className="mb-1 block font-semibold text-brand-700">Quantidade</span>
              <input
                type="number"
                min={1}
                className="w-full rounded-2xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                value={planQuantity}
                onChange={(event) => setPlanQuantity(Math.max(1, Number(event.target.value)))}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
              disabled={createSchedule.isPending}
            >
              {createSchedule.isPending ? 'Salvando...' : 'Adicionar ao plano'}
            </button>
          </form>

          {planError && <p className="text-sm text-red-600">{planError}</p>}
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </section>

        <section className="rounded-3xl border border-brand-100 bg-white/95 p-5 text-brand-700 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-brand-800">Plano de hoje</h3>
              <p className="text-sm text-brand-500">Lista das produções confirmadas e das peças calculadas para o dia.</p>
            </div>
            <div className="flex flex-col gap-2 text-xs font-semibold text-brand-600 sm:flex-row sm:items-center sm:gap-3">
              <span className="rounded-full border border-brand-100 px-4 py-1">Total: {totalQuantity}</span>
              <button
                type="button"
                className="rounded-2xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                onClick={handlePrintPlan}
              >
                Imprimir plano
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loadingSchedules && <p className="text-sm text-brand-500">Carregando...</p>}
            {schedulesError && <p className="text-sm text-red-600">Erro ao carregar o plano.</p>}
            {!loadingSchedules && !schedulesError && daySchedules.length === 0 && (
              <p className="rounded-2xl border border-dashed border-brand-200 px-4 py-6 text-center text-sm text-brand-500">
                Nada planejado para {formatDate(selectedDate)}.
              </p>
            )}

            <ul className="divide-y divide-brand-100 rounded-2xl border border-brand-50 bg-white">
              {daySchedules.map((schedule) => {
                const productName = schedule.product?.name ?? 'Produto'
                const expanded = expandedScheduleId === schedule.id

                return (
                  <li key={schedule.id} className="p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="product-header">
                        <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Produto</p>
                        <h4 className="text-lg font-semibold text-brand-800">{productName}</h4>
                        <p className="text-sm text-brand-500">Qtd: {schedule.quantity}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                          onClick={() => setExpandedScheduleId(expanded ? null : schedule.id)}
                        >
                          {expanded ? 'Ocultar peças' : 'Ver peças'}
                        </button>
                        <IconActionButton
                          label="Remover do plano"
                          variant="danger"
                          onClick={() => handleDeleteSchedule(schedule)}
                          disabled={removeSchedule.isPending}
                        >
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
                    </div>

                    {expanded && schedule.parts.length > 0 && (
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-sm text-brand-700">
                          <thead>
                            <tr className="text-xs uppercase tracking-wide text-brand-400">
                              <th className="pb-1">Peça</th>
                              <th className="pb-1 text-right">Qtd.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schedule.parts.map((part) => (
                              <tr key={`${schedule.id}-${part.name}`}>
                                <td className="py-1 text-brand-600">{part.name}</td>
                                <td className="py-1 text-right text-brand-800">{part.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </div>

      {(productModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">{editingProduct ? 'Editar' : 'Novo'}</p>
                <h3 className="text-xl font-semibold text-brand-700">
                  {editingProduct ? editingProduct.name : 'Adicionar produto'}
                </h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => {
                  setProductModalOpen(false)
                  setEditingProduct(null)
                  setFormError(null)
                }}
              >
                Fechar
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {formError}
              </div>
            )}

            <ProductForm
              defaultValues={
                editingProduct
                  ? {
                      name: editingProduct.name,
                      description: editingProduct.description ?? '',
                      defaultSalePrice: editingProduct.defaultSalePrice,
                      isActive: editingProduct.isActive,
                      parts: editingProduct.parts,
                    }
                  : undefined
              }
              onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
              isSubmitting={createProduct.isPending || updateProduct.isPending}
            />
          </div>
        </div>
      )}

      {catalogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-4xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <header className="mb-4 flex flex-col gap-2 text-brand-700 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Catálogo</p>
                <h3 className="text-2xl font-semibold">Produtos e peças</h3>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-2xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                  onClick={() => setCatalogOpen(false)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-400"
                  onClick={() => {
                    setCatalogOpen(false)
                    setEditingProduct(null)
                    setProductModalOpen(true)
                    setFormError(null)
                  }}
                >
                  <span aria-hidden>＋</span>
                  Novo produto
                </button>
              </div>
            </header>

            <div className="max-h-[60vh] overflow-y-auto">
              {products && products.length > 0 ? (
                <ul className="divide-y divide-brand-100 rounded-2xl border border-brand-50 bg-brand-50/40">
                  {products.map((product) => {
                    const expanded = expandedCatalogId === product.id
                    return (
                      <li key={product.id} className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-brand-700">
                            <h4 className="text-lg font-semibold text-brand-800">{product.name}</h4>
                            {product.description && <p className="text-sm text-brand-500">{product.description}</p>}
                            <p className="text-xs text-brand-400">{product.parts.length} peça(s)</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                              onClick={() => setExpandedCatalogId(expanded ? null : product.id)}
                            >
                              {expanded ? 'Ocultar peças' : 'Ver peças'}
                            </button>
                            <IconActionButton label="Editar produto" onClick={() => handleEditProduct(product)}>
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
                            <IconActionButton
                              label="Remover produto"
                              variant="danger"
                              onClick={() => handleDeleteProduct(product)}
                              disabled={removeProduct.isPending}
                            >
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
                        </div>

                        {expanded && (
                          <div className="mt-3 overflow-x-auto">
                            {product.parts.length > 0 ? (
                              <table className="w-full text-left text-sm text-brand-700">
                                <thead>
                                  <tr className="text-xs uppercase tracking-wide text-brand-400">
                                    <th className="pb-1">Peça</th>
                                    <th className="pb-1 text-right">Qtd.</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {product.parts.map((part) => (
                                    <tr key={`${product.id}-${part.name}`}>
                                      <td className="py-1 text-brand-600">{part.name}</td>
                                      <td className="py-1 text-right text-brand-800">{part.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p className="text-sm text-brand-500">Sem peças cadastradas.</p>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-brand-200 px-4 py-6 text-center text-sm text-brand-500">
                  Nenhum produto cadastrado ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      </section>

      <section className="print-only hidden">
        <style>{`
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 24px;
            color: #000;
            font-family: 'Segoe UI', sans-serif;
          }
          .print-only header {
            margin-bottom: 16px;
          }
          .print-section {
            border-top: 2px solid #000;
            padding-top: 16px;
            margin-top: 24px;
          }
          .print-section:first-of-type {
            border-top: none;
            padding-top: 0;
            margin-top: 0;
          }
          .print-only table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          .print-only table th,
          .print-only table td {
            border: 1px solid #000;
            padding: 6px;
          }
          .print-only table th {
            text-transform: uppercase;
            font-weight: 600;
          }
        `}</style>
        <header>
          <p style={{ textTransform: 'uppercase', letterSpacing: '.3em', fontSize: '0.75rem', marginBottom: '4px' }}>Bella Design</p>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Plano diário – {formatDate(selectedDate)}</h2>
          <p style={{ margin: '4px 0 12px' }}>Resumo das peças necessárias para o dia.</p>
        </header>
        {daySchedules.length > 0 ? (
          <>
            <div className="print-section">
              <h3 style={{ margin: '0 0 8px', fontWeight: 700 }}>Produtos planeados</h3>
              {daySchedules.map((schedule) => (
                <div key={schedule.id} style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 4px', fontWeight: 700 }}>{schedule.product?.name ?? 'Produto'}</h4>
                  <p style={{ margin: '0 0 8px' }}>Quantidade planejada: {schedule.quantity}</p>
                  {schedule.parts.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Peça</th>
                          <th>Quantidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.parts.map((part) => (
                          <tr key={`${schedule.id}-${part.name}`}>
                            <td>{part.name}</td>
                            <td>{part.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Sem peças cadastradas para este produto.</p>
                  )}
                </div>
              ))}
            </div>

            <div className="print-section">
              <h3 style={{ margin: '0 0 8px', fontWeight: 700 }}>Lista total de peças</h3>
              {consolidatedParts.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Peça</th>
                      <th>Quantidade total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidatedParts.map((part) => (
                      <tr key={part.name}>
                        <td>{part.name}</td>
                        <td>{part.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Não há peças cadastradas.</p>
              )}
            </div>
          </>
        ) : (
          <p>Nenhum item planejado para {formatDate(selectedDate)}.</p>
        )}
      </section>
    </>
  )
}
