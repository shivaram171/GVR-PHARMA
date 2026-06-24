import React, { useState, useEffect } from 'react'
import {
  MdMedication, MdLocalShipping, MdShoppingCart, MdPeople,
  MdWarning, MdTrendingUp, MdInventory, MdAttachMoney
} from 'react-icons/md'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2']

const getStatusBadge = (status) => {
  const map = {
    Pending: 'badge-yellow',
    Confirmed: 'badge-blue',
    Shipped: 'badge-blue',
    Delivered: 'badge-green',
    Cancelled: 'badge-red'
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats')
        setData(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return null

  const { stats, lowStockMedicines, expiringMedicines, recentOrders, chartData } = data

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Medicines" value={stats.totalMedicines} icon={MdMedication} color="blue" subtitle="Active items" />
        <StatCard title="Total Suppliers" value={stats.totalSuppliers} icon={MdLocalShipping} color="green" subtitle="Active suppliers" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={MdShoppingCart} color="purple" subtitle={`${stats.pendingOrders} pending`} />
        <StatCard title="Inventory Value" value={`₹${(stats.totalInventoryValue || 0).toLocaleString('en-IN')}`} icon={MdAttachMoney} color="orange" subtitle="Current stock value" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Orders & Revenue (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData.monthlyOrders}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => name === 'revenue' ? `₹${val.toLocaleString('en-IN')}` : val} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue (₹)" />
              <Bar dataKey="orders" fill="#93c5fd" name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Category Distribution</h3>
          {chartData.categoryDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={chartData.categoryDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  labelLine={false}
                >
                  {chartData.categoryDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data available</div>
          )}
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <MdWarning className="text-orange-500" />
              Low Stock Alert
            </h3>
            <span className="badge-red">{lowStockMedicines?.length} items</span>
          </div>
          {lowStockMedicines?.length > 0 ? (
            <div className="space-y-3">
              {lowStockMedicines.map(med => (
                <div key={med._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{med.name}</p>
                    <p className="text-xs text-gray-500">Min: {med.minStockLevel}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{med.quantity} left</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">All stock levels are healthy ✓</div>
          )}
        </div>

        {/* Expiring Soon */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <MdInventory className="text-red-500" />
              Expiring in 30 Days
            </h3>
            <span className="badge-red">{expiringMedicines?.length} items</span>
          </div>
          {expiringMedicines?.length > 0 ? (
            <div className="space-y-3">
              {expiringMedicines.map(med => (
                <div key={med._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{med.name}</p>
                    <p className="text-xs text-gray-500">Batch: {med.batchNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-red-600">
                      {new Date(med.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {med.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No medicines expiring soon ✓</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-th">Order #</th>
                <th className="table-th">Supplier</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.length > 0 ? recentOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td font-medium text-primary-600">{order.orderNumber}</td>
                  <td className="table-td">{order.supplier?.name || '—'}</td>
                  <td className="table-td font-medium">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="table-td">{getStatusBadge(order.status)}</td>
                  <td className="table-td text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No recent orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard