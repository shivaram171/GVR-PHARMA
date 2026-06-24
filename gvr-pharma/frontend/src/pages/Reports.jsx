import React, { useState, useEffect } from 'react'
import { MdInventory, MdTrendingUp, MdWarning, MdDownload } from 'react-icons/md'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2']

const Reports = () => {
  const [activeTab, setActiveTab] = useState('inventory')
  const [inventoryData, setInventoryData] = useState(null)
  const [salesData, setSalesData] = useState(null)
  const [lowStockData, setLowStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  useEffect(() => { fetchReport(activeTab) }, [activeTab])

  const fetchReport = async (type) => {
    setLoading(true)
    try {
      if (type === 'inventory') {
        const res = await api.get('/reports/inventory')
        setInventoryData(res.data.data)
      } else if (type === 'sales') {
        const params = {}
        if (dateRange.startDate) params.startDate = dateRange.startDate
        if (dateRange.endDate) params.endDate = dateRange.endDate
        const res = await api.get('/reports/sales', { params })
        setSalesData(res.data.data)
      } else if (type === 'lowstock') {
        const res = await api.get('/reports/low-stock')
        setLowStockData(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'inventory', label: 'Inventory Report', icon: MdInventory },
    { id: 'sales', label: 'Sales Report', icon: MdTrendingUp },
    { id: 'lowstock', label: 'Low Stock Report', icon: MdWarning },
  ]

  const categoryChartData = inventoryData?.byCategory
    ? Object.entries(inventoryData.byCategory).map(([name, count]) => ({ name, count }))
    : []

  const salesChartData = salesData?.monthlyData
    ? Object.entries(salesData.monthlyData).map(([month, data]) => ({ month, ...data }))
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business analytics and insights</p>
      </div>

      {/* Tabs */}
      <div className="card p-1.5">
        <div className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all
                ${activeTab === id ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Inventory Report */}
          {activeTab === 'inventory' && inventoryData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card text-center">
                  <p className="text-3xl font-bold text-primary-600">{inventoryData.totalMedicines}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Medicines</p>
                </div>
                <div className="card text-center">
                  <p className="text-3xl font-bold text-green-600">₹{(inventoryData.totalValue || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Inventory Value</p>
                </div>
                <div className="card text-center">
                  <p className="text-3xl font-bold text-red-600">{inventoryData.lowStock}</p>
                  <p className="text-sm text-gray-500 mt-1">Low Stock Items</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-4">Medicines by Category</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-4">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                        {categoryChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Medicine Inventory</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="table-th">Medicine</th>
                      <th className="table-th">Category</th>
                      <th className="table-th">Quantity</th>
                      <th className="table-th">Price</th>
                      <th className="table-th">Value</th>
                      <th className="table-th">Supplier</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {inventoryData.medicines?.slice(0, 20).map(med => (
                        <tr key={med._id} className="hover:bg-gray-50">
                          <td className="table-td font-medium">{med.name}</td>
                          <td className="table-td"><span className="badge-blue">{med.category}</span></td>
                          <td className="table-td">
                            <span className={med.quantity <= med.minStockLevel ? 'text-red-600 font-bold' : ''}>
                              {med.quantity}
                            </span>
                          </td>
                          <td className="table-td">₹{med.price}</td>
                          <td className="table-td font-medium">₹{(med.quantity * med.price).toLocaleString('en-IN')}</td>
                          <td className="table-td">{med.supplier?.name || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sales Report */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} className="input-field" />
                  </div>
                  <button onClick={() => fetchReport('sales')} className="btn-primary">Apply Filter</button>
                </div>
              </div>

              {salesData && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card text-center">
                      <p className="text-3xl font-bold text-primary-600">{salesData.totalOrders}</p>
                      <p className="text-sm text-gray-500 mt-1">Total Orders</p>
                    </div>
                    <div className="card text-center">
                      <p className="text-3xl font-bold text-green-600">₹{(salesData.totalRevenue || 0).toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
                    </div>
                    <div className="card text-center">
                      <p className="text-3xl font-bold text-blue-600">{salesData.deliveredOrders}</p>
                      <p className="text-sm text-gray-500 mt-1">Delivered Orders</p>
                    </div>
                  </div>

                  {salesChartData.length > 0 && (
                    <div className="card">
                      <h3 className="font-semibold text-gray-800 mb-4">Monthly Revenue</h3>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={salesChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                          <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Low Stock Report */}
          {activeTab === 'lowstock' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center gap-3 mb-1">
                  <MdWarning className="text-orange-500" size={24} />
                  <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
                  <span className="badge-red">{lowStockData?.length || 0} items</span>
                </div>
                <p className="text-sm text-gray-500">Medicines that need restocking</p>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200"><tr>
                      <th className="table-th">Medicine</th>
                      <th className="table-th">Category</th>
                      <th className="table-th">Current Stock</th>
                      <th className="table-th">Min Stock</th>
                      <th className="table-th">Shortage</th>
                      <th className="table-th">Supplier</th>
                      <th className="table-th">Contact</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {lowStockData?.length > 0 ? lowStockData.map(med => (
                        <tr key={med._id} className="hover:bg-red-50/30">
                          <td className="table-td">
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-xs text-gray-500">{med.batchNumber}</p>
                          </td>
                          <td className="table-td"><span className="badge-blue">{med.category}</span></td>
                          <td className="table-td font-bold text-red-600">{med.quantity}</td>
                          <td className="table-td text-gray-600">{med.minStockLevel}</td>
                          <td className="table-td">
                            <span className="badge-red">{Math.max(0, med.minStockLevel - med.quantity)} units</span>
                          </td>
                          <td className="table-td">{med.supplier?.name || '—'}</td>
                          <td className="table-td text-sm text-gray-600">{med.supplier?.phone || '—'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">All stock levels are healthy ✓</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Reports