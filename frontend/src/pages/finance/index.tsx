import { useMemo, useState } from 'react'

import { useOrders } from '../../hooks/useOrders'
import { useExpenses } from '../../hooks/useExpenses'

const getMonthOptions = (count: number) => {
  const now = new Date()
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      value: `${date.getFullYear()}-${date.getMonth()}`,
    }
  })
}

export const Finance = () => {
  const monthOptions = useMemo(() => getMonthOptions(12), [])
  const [selectedMonth, setSelectedMonth] = useState(() => ({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  }))

  const { data: orders, isLoading: ordersLoading } = useOrders()
  const { data: expenses, isLoading: expensesLoading } = useExpenses()

  const period = useMemo(() => {
    const start = new Date(selectedMonth.year, selectedMonth.month, 1)
    const end = new Date(selectedMonth.year, selectedMonth.month + 1, 0)
    return { start, end }
  }, [selectedMonth])

  const deliveredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter((order) => {
      if (order.status !== 'Delivered') return false
      const accountingDate = new Date(order.deliveryDate ?? order.createdAt)
      if (Number.isNaN(accountingDate.getTime())) return false
      if (accountingDate < period.start) return false
      const endOfDay = new Date(period.end)
      endOfDay.setHours(23, 59, 59, 999)
      if (accountingDate > endOfDay) return false
      return true
    })
  }, [orders, period])

  const filteredExpenses = useMemo(() => {
    if (!expenses) return []
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate)
      if (expenseDate < period.start) return false
      const endOfDay = new Date(period.end)
      endOfDay.setHours(23, 59, 59, 999)
      if (expenseDate > endOfDay) return false
      return true
    })
  }, [expenses, period])

  const summary = useMemo(() => {
    const totalOrders = deliveredOrders.length
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return { totalOrders, totalRevenue, totalExpenses }
  }, [deliveredOrders, filteredExpenses])

  const loading = ordersLoading || expensesLoading

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-400">Controle financeiro</p>
          <h1 className="text-3xl font-semibold text-brand-800">Fluxo financeiro da Bella Design</h1>
          <p className="text-base text-brand-500">
            Visão consolidada das receitas confirmadas e despesas registradas para acompanhar a saúde do caixa.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Pedidos</p>
            <p className="mt-3 text-3xl font-semibold text-brand-800">
              {loading ? '—' : summary.totalOrders.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 text-sm text-brand-500">Pedidos entregues no período</p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Receita</p>
            <p className="mt-3 text-3xl font-semibold text-brand-800">
              {loading
                ? '—'
                : summary.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="mt-1 text-sm text-brand-500">Soma dos pedidos entregues (faturamento)</p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Despesas</p>
            <p className="mt-3 text-3xl font-semibold text-brand-800">
              {loading
                ? '—'
                : summary.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="mt-1 text-sm text-brand-500">Investimentos e custos</p>
          </div>
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-brand-400">Período exibido</p>
            <p className="text-lg font-semibold text-brand-800">
              {period.start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm text-brand-500">
              Os números acima refletem apenas pedidos entregues e despesas deste período.
            </p>
          </div>
          <div className="grid gap-4 md:w-1/2">
            <label className="text-sm text-brand-500">
              <span className="mb-1 block font-medium text-brand-700">Selecione o mês</span>
              <select
                className="w-full rounded-xl border border-brand-100 px-4 py-2 text-sm text-brand-700 focus:border-brand-500 focus:outline-none"
                value={`${selectedMonth.year}-${selectedMonth.month}`}
                onChange={(event) => {
                  const [year, month] = event.target.value.split('-').map(Number)
                  setSelectedMonth({ year, month })
                }}
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-brand-400">
            Dica: escolha um mês para visualizar rapidamente a saúde financeira desse período.
          </p>

          {!loading && deliveredOrders.length === 0 && filteredExpenses.length === 0 && (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-600">
              Não há dados para este período.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
