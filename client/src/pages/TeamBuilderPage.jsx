import React from 'react'
import TeamBuilder from '../components/team/TeamBuilder'
import PokemonSearch from '../components/pokemon/PokemonSearch'
import TeamStorage from '../components/team/TeamStorage'

const TeamBuilderPage = () => {
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-[#f87171] to-[#ef4444] bg-clip-text text-transparent mb-4">
            TEAM BUILDER
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Build your ultimate Pokémon team with strategic type coverage and advanced analysis
          </p>
        </div>

        {/* Main Content - Improved Layout */}
        <div className="grid xl:grid-cols-12 gap-8">
          {/* Left Sidebar - Search */}
          <div className="xl:col-span-3">
            <PokemonSearch />
          </div>

          {/* Center - Team Builder (Larger) */}
          <div className="xl:col-span-6">
            <TeamBuilder />
          </div>

          {/* Right Sidebar - Team Storage */}
          <div className="xl:col-span-3">
            <TeamStorage />
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#7f1d1d]/30 text-center">
            <p className="text-gray-400 text-sm">Total Teams Saved</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#7f1d1d]/30 text-center">
            <p className="text-gray-400 text-sm">Pokémon in Database</p>
            <p className="text-2xl font-bold text-white">1000+</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#7f1d1d]/30 text-center">
            <p className="text-gray-400 text-sm">Type Combinations</p>
            <p className="text-2xl font-bold text-white">18</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#7f1d1d]/30 text-center">
            <p className="text-gray-400 text-sm">Team Slots Used</p>
            <p className="text-2xl font-bold text-white">0/6</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamBuilderPage