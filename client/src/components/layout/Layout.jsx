import React from 'react'
import Navigation from './Navigation'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout