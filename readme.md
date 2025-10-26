
# 🎮 Pokémon Team Builder & Battle Simulator

A modern React application for building competitive Pokémon teams, analyzing type coverage, and simulating battles against AI trainers. Built with the official Pokémon API and featuring intelligent AI opponents.

![Pokémon Team Builder](https://img.shields.io/badge/Pokémon-Team%20Builder-red) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![Vite](https://img.shields.io/badge/Vite-7.1.7-purple)

## Features

### Team Building
- **Smart Team Analysis**: Real-time type coverage and weakness analysis
- **Drag & Drop Interface**: Intuitive team management with @dnd-kit
- **Type Synergy**: Visual feedback on team defensive and offensive coverage
- **Stat Overview**: Total team stats and balance indicators

### AI Battle Simulation
- **Multiple AI Personalities**: Battle against different AI trainer models:
  - **Strategic AI**: Makes optimal type-effective moves
  - **Aggressive AI**: Prefers high-damage attacks
  - **Defensive AI**: Focuses on survival and status moves
  - **Random AI**: Unpredictable moves for casual battles

### Pokémon Database
- **Complete Pokédex**: Search and browse all Pokémon with detailed stats
- **Type Effectiveness**: Comprehensive type chart with damage calculations
- **Evolution Chains**: View Pokémon evolution paths
- **Move Learnsets**: Check level-up, TM, and egg moves

### Battle Features
- **Real Battle Calculations**: Accurate stat and damage calculations
- **Held Items**: Support for mega stones, Z-crystals, and battle items
- **Nature Support**: Proper stat modifications based on natures
- **Move Effectiveness**: Real-time type advantage indicators

## Tech Stack

- **Frontend**: React 19.1.1 + Vite
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **API**: Official PokéAPI + Custom Backend
- **Deployment**: Vercel

## How to Use

### Building Your Team
1. **Search Pokémon**: Use the search function to find Pokémon
2. **Drag to Team**: Drag Pokémon to your team slots
3. **Analyze Coverage**: Check type weaknesses and resistances
4. **Optimize**: Use suggestions to improve team balance

### Battle Simulation
1. **Select Your Team**: Choose from your saved teams
2. **Pick AI Opponent**: Choose from different AI personalities
3. **Configure Battle**: Set levels, items, and battle rules
4. **Simulate**: Watch the AI battle in real-time

### AI Trainer Personalities

#### Strategic AI
- Analyzes type advantages thoroughly
- Switches Pokémon strategically
- Uses status moves when beneficial
- Considers long-term battle strategy

#### Aggressive AI
- Prefers high-damage moves
- Rarely switches Pokémon
- Focuses on quick knockouts
- High-risk, high-reward playstyle

#### Defensive AI
- Prioritizes survival and healing
- Uses defensive status moves
- Strategic switching to resist attacks
- Wins through attrition

#### Random AI
- Completely unpredictable moves
- Great for casual playtesting
- No strategic pattern
- Fun for surprise battles


## API Integration

The app uses a custom backend that wraps the official PokéAPI with additional features:

- **Team Analysis**: Advanced type coverage calculations
- **Battle Stats**: Proper level-based stat calculations
- **Move Data**: Enhanced move information with effects
- **Cached Responses**: Improved performance with smart caching

## Contributing

We welcome contributions! Areas where you can help:

- **New AI Personalities**: Create more diverse trainer AI
- **Battle Features**: Add double battles, weather effects
- **UI Improvements**: Enhanced mobile experience
- **Performance**: Optimize bundle size and loading

## License

This project is for educational purposes and fan use. Pokémon and Pokémon character names are trademarks of Nintendo.

## Acknowledgments

- **PokéAPI**: For the comprehensive Pokémon data
- **React Team**: For the amazing framework
- **Vercel**: For seamless deployment
- **AI Contributors**: For helping train the battle AI models

---
