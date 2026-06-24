import React, { useState, useEffect } from 'react'
import { MdPeople, MdAdminPanelSettings } from 'react-icons/md'
import toast from 'react-hot-toast'
import api from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const roleBadge = (role) => {
  const map = {
    admin: 'badge-red',
    manager: 'badge-blue',
    sales_executive: 'badge-green'
  }
  return <span className={map[role] || 'badge-gray'}>{role?.replace('_', ' ')}</span>
}

const Users = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data.data)
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId)
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole })
      toast.success('User role updated!')
      fetchUsers()
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage system users and roles</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MdPeople size={18} />
          <span>{users.length} users</span>
        </div>
      </div>

      {/* Role Legend */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <MdAdminPanelSettings size={18} className="text-primary-600" /> Role Permissions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="font-semibold text-red-700 mb-1">Admin</p>
            <p className="text-gray-600 text-xs">Full access — add, edit, delete all data and manage users</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="font-semibold text-blue-700 mb-1">Manager</p>
            <p className="text-gray-600 text-xs">Add and edit medicines, suppliers, orders. View reports</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="font-semibold text-green-700 mb-1">Sales Executive</p>
            <p className="text-gray-600 text-xs">View medicines, suppliers, create orders. No delete access</p>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th">Joined</th>
                <th className="table-th">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        {u._id === currentUser._id && <p className="text-xs text-primary-600">You</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-sm">{u.email}</td>
                  <td className="table-td">{roleBadge(u.role)}</td>
                  <td className="table-td">
                    {u.isActive
                      ? <span className="badge-green">Active</span>
                      : <span className="badge-red">Inactive</span>}
                  </td>
                  <td className="table-td text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="table-td">
                    {u._id !== currentUser._id ? (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        disabled={updatingId === u._id}
                        className="input-field w-36 text-sm py-1"
                      >
                        <option value="sales_executive">Sales Executive</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">Cannot change own role</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users