import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ef4444] rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#dc2626] rounded-full blur-3xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#991b1b] rounded-full blur-3xl opacity-5 animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-[#f87171] via-[#ef4444] to-[#dc2626] bg-clip-text text-transparent leading-tight">
              POKÉMON
            </h1>
            <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[#ef4444] to-[#991b1b] bg-clip-text text-transparent leading-tight">
              TEAM BUILDER
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Build your ultimate competitive team with advanced strategy tools, 
            type coverage analysis, and battle-ready Pokémon customization
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              to="/team-builder" 
              className="btn-primary group relative py-5 px-16 text-xl overflow-hidden"
            >
              <span className="relative z-10">Start Building</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Link>
            
            <Link 
              to="/pokedex" 
              className="bg-[#1a1a1a] hover:bg-[#141414] text-white font-bold py-5 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 border-2 border-[#991b1b] hover:border-[#ef4444] shadow-lg"
            >
              Browse Pokédex
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <div className="pokemon-card group p-8 hover:border-[#ef4444]/50">
            <div className="w-16 h-16 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-2xl mb-6 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Team Builder</h3>
            <p className="text-gray-300 leading-relaxed">
              Create and optimize your perfect team with real-time type coverage analysis and strategic recommendations
            </p>
          </div>

          <div className="pokemon-card group p-8 hover:border-[#ef4444]/50">
            <div className="w-16 h-16 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-2xl mb-6 flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-500">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Type Analysis</h3>
            <p className="text-gray-300 leading-relaxed">
              Master type matchups with comprehensive effectiveness charts and defensive coverage planning
            </p>
          </div>

          <div className="pokemon-card group p-8 hover:border-[#ef4444]/50">
            <div className="w-16 h-16 bg-gradient-to-br from-[#991b1b] to-[#7f1d1d] rounded-2xl mb-6 flex items-center justify-center transform group-hover:rotate-45 transition-transform duration-500">
              <div className="w-8 h-8 bg-white transform rotate-45"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Battle Ready</h3>
            <p className="text-gray-300 leading-relaxed">
              Customize movesets, abilities, and stats to create battle-ready Pokémon for competitive play
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 bg-[#1a1a1a] border border-[#7f1d1d]/30 rounded-2xl p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#f87171] to-[#ef4444] bg-clip-text text-transparent mb-2">1025+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Pokémon</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#ef4444] to-[#dc2626] bg-clip-text text-transparent mb-2">18</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Types</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#dc2626] to-[#991b1b] bg-clip-text text-transparent mb-2">900+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Moves</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] bg-clip-text text-transparent mb-2">300+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Abilities</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">Ready to build your champion team?</p>
          <Link 
            to="/team-builder" 
            className="btn-primary inline-block py-4 px-12 text-lg"
          >
            Begin Your Journey
          </Link>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#ef4444] rounded-full opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
        {[...Array(10)].map((_, i) => (
          <div
            key={i + 15}
            className="absolute w-1 h-1 bg-[#dc2626] rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default LandingPage