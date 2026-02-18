import { isAxiosError } from 'axios'
import { useMemo, useState } from 'react'

import { ExpenseForm, type ExpenseFormValues } from '../../components/expenses/ExpenseForm'
import { IconActionButton } from '../../components/ui/IconActionButton'
import { useExpenses } from '../../hooks/useExpenses'
import { useExpenseMutations } from '../../hooks/useExpenseMutations'
import type { Expense, ExpenseCategory } from '../../types/expense'

const categoryOptions: { label: string; value: ExpenseCategory }[] = [
  { label: 'Materiais', value: 'Materials' },
  { label: 'Mão de obra', value: 'Labor' },
  { label: 'Logística', value: 'Logistics' },
  { label: 'Utilidades', value: 'Utilities' },
  { label: 'Outros', value: 'Other' },
]

const formatDateInput = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const normalizeDate = (value?: string) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
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

export const Expenses = () => {
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; category?: ExpenseCategory }>({})
  const { data, isLoading, error } = useExpenses(filters)
  const { create, update, remove } = useExpenseMutations()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
  const [formError, setFormError] = useState<string | null>(null)

  const totalAmount = useMemo(() => {
    if (!data) return 0
    return data.reduce((sum, expense) => sum + expense.amount, 0)
  }, [data])

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback(message)
    setFeedbackType(type)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleCreate = async (values: ExpenseFormValues) => {
    setFormError(null)
    try {
      await create.mutateAsync({
        description: values.description,
        amount: values.amount,
        category: values.category as ExpenseCategory,
        expenseDate: normalizeDate(values.expenseDate) ?? new Date().toISOString(),
        notes: values.notes?.trim() ? values.notes.trim() : undefined,
      })
      showMessage('Despesa criada com sucesso!')
      setIsCreateOpen(false)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao criar despesa.')
      setFormError(message)
      showMessage(message, 'error')
    }
  }

  const handleUpdate = async (values: ExpenseFormValues) => {
    if (!editingExpense) return
    setFormError(null)
    try {
      await update.mutateAsync({
        id: editingExpense.id,
        payload: {
          description: values.description,
          amount: values.amount,
          category: values.category as ExpenseCategory,
          expenseDate: normalizeDate(values.expenseDate) ?? editingExpense.expenseDate,
          notes: values.notes?.trim() ? values.notes.trim() : undefined,
        },
      })
      showMessage('Despesa atualizada com sucesso!')
      setEditingExpense(null)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao atualizar despesa.')
      setFormError(message)
      showMessage(message, 'error')
    }
  }

  const handleDelete = (expense: Expense) => {
    if (!window.confirm(`Deseja remover a despesa "${expense.description}"?`)) return
    remove.mutate(expense.id, {
      onSuccess: () => showMessage('Despesa removida com sucesso!'),
      onError: () => showMessage('Erro ao remover despesa.', 'error'),
    })
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-brand-700">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Despesas</p>
        <h2 className="text-2xl font-semibold text-brand-700">Custos operacionais da Bella Design</h2>
        <p className="text-sm text-brand-500">Painel de materiais, logística e demais gastos registrados.</p>
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3 text-brand-700 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Total</p>
            <p className="text-2xl font-semibold">
              {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <span aria-hidden>＋</span>
            Nova despesa
          </button>
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

      <div className="rounded-2xl border border-brand-100 bg-white/95 p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-brand-500">
            <span className="mb-1 block font-medium text-brand-700">De</span>
            <input
              type="date"
              className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
              value={filters.startDate ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, startDate: event.target.value || undefined }))
              }
            />
          </label>

          <label className="text-sm text-brand-500">
            <span className="mb-1 block font-medium text-brand-700">Até</span>
            <input
              type="date"
              className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
              value={filters.endDate ?? ''}
              onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value || undefined }))}
            />
          </label>

          <label className="text-sm text-brand-500">
            <span className="mb-1 block font-medium text-brand-700">Categoria</span>
            <select
              className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
              value={filters.category ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  category: (event.target.value as ExpenseCategory) || undefined,
                }))
              }
            >
              <option value="">Todas</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
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
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Notas</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={6}>
                  Carregando despesas...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td className="px-6 py-6 text-brand-600" colSpan={6}>
                  Não foi possível carregar as despesas.
                </td>
              </tr>
            )}

            {!isLoading && !error && (!data || data.length === 0) && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={6}>
                  Nenhuma despesa registrada.
                </td>
              </tr>
            )}

            {!isLoading && !error &&
              data?.map((expense) => (
                <tr key={expense.id} className="border-t border-brand-100">
                  <td className="px-6 py-4 text-sm font-medium text-brand-800">{expense.description}</td>
                  <td className="px-6 py-4 text-brand-600">
                    {categoryOptions.find((opt) => opt.value === expense.category)?.label ?? expense.category}
                  </td>
                  <td className="px-6 py-4 text-brand-600">
                    {new Date(expense.expenseDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-brand-500">{expense.notes ? expense.notes : '—'}</td>
                  <td className="px-6 py-4 text-right text-brand-700">
                    {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <IconActionButton label="Editar" onClick={() => setEditingExpense(expense)}>
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
                      <IconActionButton label="Excluir" variant="danger" onClick={() => handleDelete(expense)} disabled={remove.isPending}>
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
              ))}
          </tbody>
        </table>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Nova</p>
                <h3 className="text-xl font-semibold text-brand-700">Registrar despesa</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => {
                  setIsCreateOpen(false)
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

            <ExpenseForm categories={categoryOptions} onSubmit={handleCreate} isSubmitting={create.isPending} />
          </div>
        </div>
      )}

      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Editar</p>
                <h3 className="text-xl font-semibold text-brand-700">{editingExpense.description}</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => {
                  setEditingExpense(null)
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

            <ExpenseForm
              categories={categoryOptions}
              defaultValues={{
                description: editingExpense.description,
                amount: editingExpense.amount,
                category: editingExpense.category,
                expenseDate: formatDateInput(editingExpense.expenseDate),
                notes: editingExpense.notes ?? '',
              }}
              onSubmit={handleUpdate}
              isSubmitting={update.isPending}
            />
          </div>
        </div>
      )}
    </section>
  )
}

