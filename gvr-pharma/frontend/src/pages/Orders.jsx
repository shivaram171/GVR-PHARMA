import React, { useState, useEffect, useCallback } from 'react'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdVisibility } from 'react-icons/md'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

const getStatusBadge = (status) => {
  const map = {
    Pending: 'badge-yellow', Confirmed: 'badge-blue',
    Shipped: 'badge-blue', Delivered: 'badge-green', Cancelled: 'badge-red'
  }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

const getPaymentBadge = (status) => {
  const map = { Unpaid: 'badge-red', Partial: 'badge-yellow', Paid: 'badge-green' }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModal, setViewModal] = useState({ open: false, order: null })
  const [editModal, setEditModal] = useState({ open: false, order: null })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const [form, setForm] = useState({
    supplier: '', items: [{ medicine: '', quantity: 1, unitPrice: 0 }],
    expectedDeliveryDate: '', paymentStatus: 'Unpaid', notes: ''
  })
  const [editForm, setEditForm] = useState({ status: 'Pending', paymentStatus: 'Unpaid', notes: '' })

  const canEdit = ['admin', 'manager'].includes(user?.role)
  const canDelete = user?.role === 'admin'

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/orders', { params })
      setOrders(res.data.data)
      setPagination({ totalPages: res.data.totalPages, currentPage: res.data.currentPage })
    } catch {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, mRes] = await Promise.all([
          api.get('/suppliers', { params: { limit: 100 } }),
          api.get('/medicines', { params: { limit: 100 } })
        ])
        setSuppliers(sRes.data.data)
        setMedicines(mRes.data.data)
      } catch {}
    }
    fetchData()
  }, [])

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { medicine: '', quantity: 1, unitPrice: 0 }] }))
  const removeItem = (i) => setForm(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, value) => {
    setForm(prev => {
      const items = [...prev.items]
      items[i] = { ...items[i], [field]: value }
      if (field === 'medicine') {
        const med = medicines.find(m => m._id === value)
        if (med) items[i].unitPrice = med.price
      }
      return { ...prev, items }
    })
  }

  const getTotal = () => form.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.supplier) return toast.error('Select a supplier')
    if (form.items.some(i => !i.medicine)) return toast.error('Select medicine for all items')
    setSaving(true)
    try {
      await api.post('/orders', form)
      toast.success('Order created!')
      setModalOpen(false)
      setForm({ supplier: '', items: [{ medicine: '', quantity: 1, unitPrice: 0 }], expectedDeliveryDate: '', paymentStatus: 'Unpaid', notes: '' })
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/orders/${editModal.order._id}`, editForm)
      toast.success('Order updated!')
      setEditModal({ open: false, order: null })
      fetchOrders()
    } catch {
      toast.error('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/orders/${deleteDialog.id}`)
      toast.success('Order deleted!')
      setDeleteDialog({ open: false, id: null })
      fetchOrders()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage purchase orders</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <MdAdd size={20} /> Create Order
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-9"
              placeholder="Search by order number..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-field w-40"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <LoadingSpinner /> : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-th">Order #</th>
                  <th className="table-th">Supplier</th>
                  <th className="table-th">Items</th>
                  <th className="table-th">Total</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Payment</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length > 0 ? orders.map(order => (
                  <tr key={order._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="table-td font-medium text-primary-600">{order.orderNumber}</td>
                    <td className="table-td">
                      <p className="font-medium text-sm">{order.supplier?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{order.supplier?.contactPerson}</p>
                    </td>
                    <td className="table-td">{order.items?.length} item(s)</td>
                    <td className="table-td font-semibold">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="table-td">{getStatusBadge(order.status)}</td>
                    <td className="table-td">{getPaymentBadge(order.paymentStatus)}</td>
                    <td className="table-td text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewModal({ open: true, order })}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <MdVisibility size={16} />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditForm({ status: order.status, paymentStatus: order.paymentStatus, notes: order.notes })
                              setEditModal({ open: true, order })
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteDialog({ open: true, id: order._id })}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          >
                            <MdDelete size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && <div className="px-6 py-4 border-t border-gray-100">
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>}
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Order" size="xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select required value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="input-field">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
              <input type="date" value={form.expectedDeliveryDate} onChange={e => setForm({ ...form, expectedDeliveryDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select value={form.paymentStatus} onChange={e => setForm({ ...form, paymentStatus: e.target.value })} className="input-field">
                <option>Unpaid</option><option>Partial</option><option>Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" placeholder="Optional notes" />
            </div>
          </div>

          {/* Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Order Items</label>
              <button type="button" onClick={addItem} className="text-primary-600 text-sm font-medium hover:text-primary-800">
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <select
                      value={item.medicine}
                      onChange={e => updateItem(i, 'medicine', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.batchNumber})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', parseInt(e.target.value))}
                      className="input-field text-sm" placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number" min="0" step="0.01" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value))}
                      className="input-field text-sm" placeholder="Unit Price"
                    />
                  </div>
                  <div className="col-span-1 text-sm font-medium text-gray-700 pb-2">
                    ₹{(item.quantity * item.unitPrice).toFixed(0)}
                  </div>
                  <div className="col-span-1">
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 pb-2">✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <span className="text-sm font-semibold text-gray-800">Total: ₹{getTotal().toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, order: null })} title={`Order ${viewModal.order?.orderNumber}`} size="lg">
        {viewModal.order && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Supplier</p><p className="font-medium">{viewModal.order.supplier?.name}</p></div>
              <div><p className="text-xs text-gray-500">Status</p>{getStatusBadge(viewModal.order.status)}</div>
              <div><p className="text-xs text-gray-500">Payment</p>{getPaymentBadge(viewModal.order.paymentStatus)}</div>
              <div><p className="text-xs text-gray-500">Total</p><p className="font-semibold">₹{viewModal.order.totalAmount?.toLocaleString('en-IN')}</p></div>
              <div><p className="text-xs text-gray-500">Order Date</p><p className="text-sm">{new Date(viewModal.order.createdAt).toLocaleDateString('en-IN')}</p></div>
              {viewModal.order.expectedDeliveryDate && (
                <div><p className="text-xs text-gray-500">Expected Delivery</p><p className="text-sm">{new Date(viewModal.order.expectedDeliveryDate).toLocaleDateString('en-IN')}</p></div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50"><th className="table-th">Medicine</th><th className="table-th">Qty</th><th className="table-th">Price</th><th className="table-th">Total</th></tr></thead>
                <tbody>
                  {viewModal.order.items?.map((item, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="table-td">{item.medicineName || 'N/A'}</td>
                      <td className="table-td">{item.quantity}</td>
                      <td className="table-td">₹{item.unitPrice}</td>
                      <td className="table-td font-medium">₹{item.totalPrice?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {viewModal.order.notes && <div><p className="text-xs text-gray-500">Notes</p><p className="text-sm">{viewModal.order.notes}</p></div>}
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, order: null })} title="Update Order" size="sm">
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select value={editForm.paymentStatus} onChange={e => setEditForm({ ...editForm, paymentStatus: e.target.value })} className="input-field">
              <option>Unpaid</option><option>Partial</option><option>Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setEditModal({ open: false, order: null })} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Order"
        message="Are you sure you want to delete this order? This cannot be undone."
      />
    </div>
  )
}

export default Orders