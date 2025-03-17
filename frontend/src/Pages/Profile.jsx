import React from 'react'
import Sidebar from './sidebar'

function Profile() {
  return (
    <div className='min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-6'>
      <Sidebar />
      <div className='text-center'>Profile</div>
    </div>
  )
}

export default Profile