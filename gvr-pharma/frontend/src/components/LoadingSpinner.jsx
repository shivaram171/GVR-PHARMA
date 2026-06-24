import React from 'react'

const LoadingSpinner = ({ fullScreen, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizes.lg} mx-auto`}></div>
          <p className="mt-4 text-primary-600 font-medium">Loading GVR Pharma...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 ${sizes[size]}`}></div>
    </div>
  )
}

export default LoadingSpinner