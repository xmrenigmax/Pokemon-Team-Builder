import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/team-builder', label: 'Team Builder' },
    { path: '/pokedex', label: 'Pokédex' },
    { path: '/types', label: 'Types' },
  ]

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#7f1d1d]/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-black text-[#ef4444]">
            POKÉMON
          </Link>
          
          <div className="flex space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 border border-transparent hover:border-[#ef4444]/30 ${
                  location.pathname === item.path
                    ? 'bg-[#7f1d1d]/50 border-[#ef4444]/50 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-[#7f1d1d]/30'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation