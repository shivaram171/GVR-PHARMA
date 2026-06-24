import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdMedication, MdLocalShipping, MdShoppingCart,
  MdAssessment, MdPeople, MdLogout, MdClose
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'sales_executive'] },
  { path: '/medicines', icon: MdMedication, label: 'Medicines', roles: ['admin', 'manager', 'sales_executive'] },
  { path: '/suppliers', icon: MdLocalShipping, label: 'Suppliers', roles: ['admin', 'manager', 'sales_executive'] },
  { path: '/orders', icon: MdShoppingCart, label: 'Orders', roles: ['admin', 'manager', 'sales_executive'] },
  { path: '/reports', icon: MdAssessment, label: 'Reports', roles: ['admin', 'manager'] },
  { path: '/users', icon: MdPeople, label: 'Users', roles: ['admin'] },
]

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <div className="h-full bg-gradient-to-b from-primary-900 to-primary-800 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-primary-700">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-800 font-bold text-sm">GVR</span>
            </div>
            <div>
              <h1 className="text-sm font-bold">GVR Pharma</h1>
              <p className="text-primary-300 text-xs">Pvt. Ltd.</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-primary-700 transition-colors">
          <MdClose size={20} />
        </button>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-primary-300 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-white text-primary-800 shadow-md'
                : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-100 hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <MdLogout size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar