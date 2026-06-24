import React, { useState, useEffect, useCallback } from 'react'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdRefresh } from 'react-icons/md'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Powder', 'Other']
const UNITS = ['Strips', 'Bottles', 'Vials', 'Boxes', 'Pieces', 'Tubes']

const emptyForm = {
  name: '', genericName: '', category: 'Tablet', batchNumber: '',
  manufacturingDate: '', expiryDate: '', quantity: '', unit: 'Strips',
  price: '', mrp: '', manufacturer: '', description: '', minStockLevel: 10, supplier: ''
}

const getExpiryBadge = (expiryDate) => {
  const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return <span className="badge-red">Expired</span>
  if (days <= 30) return <span className="badge-red">{days}d left</span>
  if (days <= 90) return <span className="badge-yellow">{days}d left</span>
  return <span className="badge-green">{new Date(expiryDate).toLocaleDateString('en-IN')}</span>
}

const Medicines = () => {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const canEdit = ['admin', 'manager'].includes(user?.role)
  const canDelete = user?.role === 'admin'

  const fetchMedicines = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (category) params.category = category
      const res = await api.get('/medicines', { params })
      setMedicines(res.data.data)
      setPagination({ total: res.data.total, totalPages: res.data.totalPages, currentPage: res.data.currentPage })
    } catch {
      toast.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }, [page, search, category])

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers', { params: { limit: 100 } })
      setSuppliers(res.data.data)
    } catch {}
  }

  useEffect(() => { fetchMedicines() }, [fetchMedicines])
  useEffect(() => { fetchSuppliers() }, [])

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (med) => {
    setEditItem(med)
    setForm({
      ...med,
      manufacturingDate: med.manufacturingDate ? new Date(med.manufacturingDate).toISOString().split('T')[0] : '',
      expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : '',
      supplier: med.supplier?._id || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/medicines/${editItem._id}`, form)
        toast.success('Medicine updated!')
      } else {
        await api.post('/medicines', form)
        toast.success('Medicine added!')
      }
      setModalOpen(false)
      fetchMedicines()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save medicine')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/medicines/${deleteDialog.id}`)
      toast.success('Medicine deleted!')
      setDeleteDialog({ open: false, id: null })
      fetchMedicines()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage pharmaceutical inventory</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary">
            <MdAdd size={20} /> Add Medicine
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-9"
              placeholder="Search by name, batch number..."
            />
          </div>
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-400" size={20} />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1) }}
              className="input-field w-40"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={fetchMedicines} className="btn-secondary">
            <MdRefresh size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <LoadingSpinner /> : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-th">Medicine</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Batch No.</th>
                  <th className="table-th">Quantity</th>
                  <th className="table-th">Price / MRP</th>
                  <th className="table-th">Mfg Date</th>
                  <th className="table-th">Expiry</th>
                  <th className="table-th">Supplier</th>
                  {canEdit && <th className="table-th">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicines.length > 0 ? medicines.map(med => (
                  <tr key={med._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="table-td">
                      <p className="font-medium text-gray-900">{med.name}</p>
                      {med.genericName && <p className="text-xs text-gray-500">{med.genericName}</p>}
                    </td>
                    <td className="table-td">
                      <span className="badge-blue">{med.category}</span>
                    </td>
                    <td className="table-td font-mono text-xs">{med.batchNumber}</td>
                    <td className="table-td">
                      <span className={med.quantity <= med.minStockLevel ? 'font-bold text-red-600' : 'font-medium'}>
                        {med.quantity} {med.unit}
                      </span>
                    </td>
                    <td className="table-td">
                      <p className="text-sm">₹{med.price}</p>
                      <p className="text-xs text-gray-500">MRP: ₹{med.mrp}</p>
                    </td>
                    <td className="table-td text-sm text-gray-600">
                      {new Date(med.manufacturingDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="table-td">{getExpiryBadge(med.expiryDate)}</td>
                    <td className="table-td text-sm">{med.supplier?.name || '—'}</td>
                    {canEdit && (
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(med)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteDialog({ open: true, id: med._id })}
                              className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={canEdit ? 9 : 8} className="text-center py-12 text-gray-400">
                      No medicines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && <div className="px-6 py-4 border-t border-gray-100">
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Medicine' : 'Add New Medicine'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="e.g. Paracetamol 500mg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
              <input value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} className="input-field" placeholder="Generic name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
              <input required value={form.batchNumber} onChange={e => setForm({ ...form, batchNumber: e.target.value })} className="input-field" placeholder="e.g. B-2024-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} className="input-field" placeholder="Manufacturer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date *</label>
              <input required type="date" value={form.manufacturingDate} onChange={e => setForm({ ...form, manufacturingDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
              <input required type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input required type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="input-field">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
              <input type="number" min="0" value={form.minStockLevel} onChange={e => setForm({ ...form, minStockLevel: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="input-field">
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Optional description..." />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editItem ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
      />
    </div>
  )
}

export default Medicines