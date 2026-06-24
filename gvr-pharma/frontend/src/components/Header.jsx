import React from 'react'
import { MdMenu, MdNotifications, MdSearch } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/medicines': 'Medicines',
  '/suppliers': 'Suppliers',
  '/orders': 'Orders',
  '/reports': 'Reports',
  '/users': 'Users',
}

const Header = ({ onMenuClick }) => {
  const { user } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'GVR Pharma'

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MdMenu size={22} className="text-gray-600" />
      </button>

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">GVR Pharma Pvt. Ltd.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <MdSearch className="text-gray-400" size={18} />
          <span className="text-gray-400 text-sm">Quick search...</span>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <MdNotifications size={22} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header