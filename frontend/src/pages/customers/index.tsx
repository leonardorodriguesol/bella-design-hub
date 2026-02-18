import { useMemo, useState } from 'react'

import { CustomerForm } from '../../components/customers/CustomerForm'
import { IconActionButton } from '../../components/ui/IconActionButton'
import { useCustomerMutations } from '../../hooks/useCustomerMutations'
import { useCustomers } from '../../hooks/useCustomers'
import type { Customer } from '../../types/customer'
import type { CreateCustomerInput } from '../../types/customer'

export const Customers = () => {
  const { data, isLoading, error } = useCustomers()
  const { create, update, remove } = useCustomerMutations()
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
  const [nameFilter, setNameFilter] = useState('')

  const filteredCustomers = useMemo(() => {
    if (!data) return []
    if (!nameFilter) return data
    const term = nameFilter.trim().toLowerCase()
    return data.filter((customer) => customer.name.toLowerCase().includes(term))
  }, [data, nameFilter])

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback(message)
    setFeedbackType(type)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleCreate = async (values: CreateCustomerInput) => {
    try {
      await create.mutateAsync(values)
      showMessage('Cliente criado com sucesso!')
      setIsCreateOpen(false)
    } catch {
      showMessage('Erro ao criar cliente.', 'error')
      throw new Error('create failed')
    }
  }

  const handleUpdate = async (values: CreateCustomerInput) => {
    if (!editingCustomer) return
    try {
      await update.mutateAsync({ id: editingCustomer.id, payload: values })
      showMessage('Cliente atualizado com sucesso!')
      setEditingCustomer(null)
    } catch {
      showMessage('Erro ao atualizar cliente.', 'error')
      throw new Error('update failed')
    }
  }

  const handleDelete = (customer: Customer) => {
    if (!window.confirm(`Deseja excluir ${customer.name}?`)) {
      return
    }

    remove.mutate(customer.id, {
      onSuccess: () => showMessage('Cliente removido com sucesso!'),
      onError: () => showMessage('Erro ao remover cliente.', 'error'),
    })
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2 text-brand-700">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Clientes</p>
        <h2 className="text-2xl font-semibold text-brand-700">Base de clientes da Bella Design</h2>
        <p className="text-sm text-brand-500">Registro centralizado dos clientes utilizados em todos os pedidos.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md flex-col text-sm text-brand-500">
            <span className="mb-1 font-medium text-brand-700">Filtrar por nome</span>
            <input
              type="text"
              className="rounded-2xl border border-brand-100 px-4 py-2 text-brand-700 placeholder:text-brand-300 focus:border-brand-500 focus:outline-none"
              placeholder="Digite parte do nome"
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <span aria-hidden>＋</span>
            Adicionar cliente
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

      <div className="rounded-2xl border border-brand-100 bg-white/95 shadow-sm">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm text-brand-700">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-brand-400">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Telefone</th>
              <th className="px-6 py-4">Endereço</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={4}>
                  Carregando clientes...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td className="px-6 py-6 text-brand-600" colSpan={4}>
                  Não foi possível carregar os clientes. Verifique se a API está rodando.
                </td>
              </tr>
            )}

            {!isLoading && !error && data && data.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={4}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredCustomers.length === 0 && data && data.length > 0 && (
              <tr>
                <td className="px-6 py-6 text-brand-500" colSpan={4}>
                  Nenhum cliente encontrado para "{nameFilter}".
                </td>
              </tr>
            )}

            {!isLoading && !error &&
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-brand-100">
                  <td className="px-6 py-4 text-sm font-medium text-brand-800">{customer.name}</td>
                  <td className="px-6 py-4 text-brand-600">{customer.email ?? '—'}</td>
                  <td className="px-6 py-4 text-brand-600">{customer.phone ?? '—'}</td>
                  <td className="px-6 py-4 text-brand-600">{customer.address ?? '—'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <IconActionButton label="Editar" onClick={() => setEditingCustomer(customer)}>
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
                      <IconActionButton label="Excluir" variant="danger" onClick={() => handleDelete(customer)} disabled={remove.isPending}>
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

      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Editar</p>
                <h3 className="text-xl font-semibold text-brand-700">{editingCustomer.name}</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => setEditingCustomer(null)}
              >
                Fechar
              </button>
            </div>

            <CustomerForm
              defaultValues={{
                name: editingCustomer.name,
                email: editingCustomer.email ?? undefined,
                phone: editingCustomer.phone ?? undefined,
                address: editingCustomer.address ?? undefined,
              }}
              onSubmit={handleUpdate}
              isSubmitting={update.isPending}
            />
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xl rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Novo</p>
                <h3 className="text-xl font-semibold text-brand-700">Adicionar cliente</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-brand-500 hover:text-brand-700"
                onClick={() => setIsCreateOpen(false)}
              >
                Fechar
              </button>
            </div>

            <CustomerForm onSubmit={handleCreate} isSubmitting={create.isPending} />
          </div>
        </div>
      )}
    </section>
  )
}
