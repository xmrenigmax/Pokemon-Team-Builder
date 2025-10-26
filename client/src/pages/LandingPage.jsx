import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-[#f87171] to-[#ef4444] bg-clip-text text-transparent">
          POKÉMON TEAM BUILDER
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Build your ultimate Pokémon team with strategic type coverage
        </p>
        <Link 
          to="/team-builder" 
          className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 border-2 border-[#ef4444] hover:border-[#f87171] shadow-lg hover:shadow-xl inline-block"
        >
          Start Building
        </Link>
      </div>
    </div>
  )
}

export default LandingPage