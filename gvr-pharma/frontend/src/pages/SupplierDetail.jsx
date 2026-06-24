import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MdArrowBack, MdEmail, MdPhone, MdLocationOn, MdStar, MdBusiness } from 'react-icons/md'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

const SupplierDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await api.get(`/suppliers/${id}`)
        setSupplier(res.data.data)
        setMedicines(res.data.medicines || [])
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchSupplier()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!supplier) return <div className="text-center py-12 text-gray-500">Supplier not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <MdArrowBack size={18} /> Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
          <p className="text-sm text-gray-500">Supplier Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <MdBusiness className="text-primary-600" size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{supplier.name}</h2>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <MdStar key={i} size={14} className={i < supplier.rating ? 'text-yellow-400' : 'text-gray-200'} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{supplier.rating}/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MdEmail size={16} className="text-primary-500" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MdPhone size={16} className="text-primary-500" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MdLocationOn size={16} className="text-primary-500" />
                <span>{[supplier.address?.street, supplier.address?.city, supplier.address?.state, supplier.address?.pincode].filter(Boolean).join(', ')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Contact Person</span>
                <span className="font-medium">{supplier.contactPerson}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Terms</span>
                <span className="badge-blue">{supplier.paymentTerms}</span>
              </div>
              {supplier.gstNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST No.</span>
                  <span className="font-mono text-xs">{supplier.gstNumber}</span>
                </div>
              )}
              {supplier.drugLicenseNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Drug License</span>
                  <span className="font-mono text-xs">{supplier.drugLicenseNumber}</span>
                </div>
              )}
            </div>

            {supplier.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Medicines */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">Medicines from this Supplier ({medicines.length})</h3>
          {medicines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-th">Name</th>
                    <th className="table-th">Category</th>
                    <th className="table-th">Quantity</th>
                    <th className="table-th">Price</th>
                    <th className="table-th">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {medicines.map(med => (
                    <tr key={med._id} className="hover:bg-gray-50">
                      <td className="table-td font-medium">{med.name}</td>
                      <td className="table-td"><span className="badge-blue">{med.category}</span></td>
                      <td className="table-td">{med.quantity}</td>
                      <td className="table-td">₹{med.price}</td>
                      <td className="table-td text-sm text-gray-600">
                        {new Date(med.expiryDate).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No medicines linked to this supplier</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierDetail