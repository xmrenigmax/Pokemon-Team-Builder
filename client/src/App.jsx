import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PokemonProvider } from './contexts/PokemonContext'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import TeamBuilderPage from './pages/TeamBuilderPage'
import PokedexPage from './pages/PokedexPage'
import TypeShowcasePage from './pages/TypeShowcasePage'

function App() {
  return (
    <PokemonProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/team-builder" element={<TeamBuilderPage />} />
            <Route path="/pokedex" element={<PokedexPage />} />
            <Route path="/types" element={<TypeShowcasePage />} />
          </Routes>
        </Layout>
      </Router>
    </PokemonProvider>
  )
}

export default App