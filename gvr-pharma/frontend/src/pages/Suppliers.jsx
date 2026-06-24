import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MdAdd, MdEdit, MdDelete, MdSearch, MdVisibility, MdStar } from 'react-icons/md'
import toast from 'react-hot-toast'
import api from '../utils/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const PAYMENT_TERMS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Immediate']
const emptyForm = {
  name: '', contactPerson: '', email: '', phone: '',
  address: { street: '', city: '', state: '', pincode: '', country: 'India' },
  gstNumber: '', drugLicenseNumber: '', paymentTerms: 'Net 30',
  rating: 3, notes: ''
}

const Suppliers = () => {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null })
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const canEdit = ['admin', 'manager'].includes(user?.role)
  const canDelete = user?.role === 'admin'

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      const res = await api.get('/suppliers', { params })
      setSuppliers(res.data.data)
      setPagination({ totalPages: res.data.totalPages, currentPage: res.data.currentPage })
    } catch {
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (sup) => {
    setEditItem(sup)
    setForm({ ...sup, address: sup.address || emptyForm.address })
    setModalOpen(true)
  }

  const handleAddressChange = (field, value) => {
    setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await api.put(`/suppliers/${editItem._id}`, form)
        toast.success('Supplier updated!')
      } else {
        await api.post('/suppliers', form)
        toast.success('Supplier added!')
      }
      setModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save supplier')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/suppliers/${deleteDialog.id}`)
      toast.success('Supplier deleted!')
      setDeleteDialog({ open: false, id: null })
      fetchSuppliers()
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
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your supplier network</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="btn-primary">
            <MdAdd size={20} /> Add Supplier
          </button>
        )}
      </div>

      <div className="card">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field pl-9"
            placeholder="Search suppliers..."
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <LoadingSpinner /> : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-th">Supplier</th>
                  <th className="table-th">Contact</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Payment Terms</th>
                  <th className="table-th">Rating</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.length > 0 ? suppliers.map(sup => (
                  <tr key={sup._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="table-td">
                      <p className="font-medium text-gray-900">{sup.name}</p>
                      <p className="text-xs text-gray-500">{sup.contactPerson}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm">{sup.email}</p>
                      <p className="text-xs text-gray-500">{sup.phone}</p>
                    </td>
                    <td className="table-td">
                      <p className="text-sm">{sup.address?.city}, {sup.address?.state}</p>
                    </td>
                    <td className="table-td">
                      <span className="badge-blue">{sup.paymentTerms}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <MdStar className="text-yellow-400" size={16} />
                        <span className="text-sm font-medium">{sup.rating}/5</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Link to={`/suppliers/${sup._id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                            <MdVisibility size={16} />
                          </button>
                        </Link>
                        {canEdit && (
                          <button onClick={() => openEdit(sup)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                            <MdEdit size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => setDeleteDialog({ open: true, id: sup._id })} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                            <MdDelete size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No suppliers found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {!loading && <div className="px-6 py-4 border-t border-gray-100">
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Supplier' : 'Add New Supplier'} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Supplier company name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input required value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drug License No.</label>
              <input value={form.drugLicenseNumber} onChange={e => setForm({ ...form, drugLicenseNumber: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} className="input-field">
                {PAYMENT_TERMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.address?.city} onChange={e => handleAddressChange('city', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input value={form.address?.state} onChange={e => handleAddressChange('state', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input value={form.address?.pincode} onChange={e => handleAddressChange('pincode', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input value={form.address?.street} onChange={e => handleAddressChange('street', e.target.value)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editItem ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
      />
    </div>
  )
}

export default Suppliers