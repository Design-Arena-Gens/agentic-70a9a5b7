'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

interface Expense {
  id: string
  date: string
  category: string
  amount: number
  description: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Other']

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    amount: '',
    description: ''
  })

  useEffect(() => {
    const stored = localStorage.getItem('expenses')
    if (stored) {
      setExpenses(JSON.parse(stored))
    } else {
      const sampleData: Expense[] = [
        { id: '1', date: '2025-12-01', category: 'Food', amount: 45.50, description: 'Groceries' },
        { id: '2', date: '2025-12-02', category: 'Transport', amount: 15.00, description: 'Uber' },
        { id: '3', date: '2025-12-03', category: 'Shopping', amount: 120.00, description: 'Clothes' },
        { id: '4', date: '2025-12-04', category: 'Entertainment', amount: 30.00, description: 'Movie tickets' },
        { id: '5', date: '2025-12-05', category: 'Bills', amount: 150.00, description: 'Electricity' },
        { id: '6', date: '2025-12-06', category: 'Food', amount: 25.00, description: 'Restaurant' },
        { id: '7', date: '2025-12-07', category: 'Transport', amount: 50.00, description: 'Gas' },
      ]
      setExpenses(sampleData)
      localStorage.setItem('expenses', JSON.stringify(sampleData))
    }
  }, [])

  const saveExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses)
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
  }

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) return

    const expense: Expense = {
      id: Date.now().toString(),
      date: newExpense.date,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description
    }

    const updated = [...expenses, expense]
    saveExpenses(updated)

    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      amount: '',
      description: ''
    })
  }

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id)
    saveExpenses(updated)
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(item => item.value > 0)

  const dailyData = expenses.reduce((acc: any[], exp) => {
    const existing = acc.find(item => item.date === exp.date)
    if (existing) {
      existing.amount += exp.amount
    } else {
      acc.push({ date: exp.date, amount: exp.amount })
    }
    return acc
  }, []).sort((a, b) => a.date.localeCompare(b.date)).slice(-7)

  const categoryBarData = categoryData.slice().sort((a, b) => b.value - a.value)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Personal Expenses Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold text-gray-800">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Average per Transaction</h3>
            <p className="text-3xl font-bold text-gray-800">
              ${expenses.length > 0 ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Expenses by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#8884d8">
                  {categoryBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Daily Expenses Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} name="Amount" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Expense Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Add Expense
              </button>
            </form>
          </div>

          {/* Recent Expenses List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Expenses</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No expenses yet. Add your first expense!</p>
              ) : (
                expenses.slice().reverse().map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">${expense.amount.toFixed(2)}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{expense.category}</span>
                        </div>
                        <p className="text-sm text-gray-600">{expense.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{expense.date}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium ml-4"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
