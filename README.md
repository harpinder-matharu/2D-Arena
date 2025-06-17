# Battle Arena Engine

A fast-paced 2D battle arena game built with PixiJS and TypeScript, featuring an Entity Component System (ECS) architecture.

## Features

- Real-time combat system with player vs enemy battles
- Entity Component System (ECS) architecture for efficient game state management
- Smooth animations and particle effects
- Dynamic bullet firing system with customizable patterns
- Collision detection and damage system
- Team-based gameplay mechanics
- Time-limited matches (20 minutes per round)
- Modern UI system with GSAP animations
- Responsive design that adapts to different screen sizes

## Tech Stack

- [PixiJS](https://pixijs.com/) - Fast 2D rendering engine
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [GSAP](https://greensock.com/gsap/) - Professional-grade animation library
- [Howler.js](https://howlerjs.com/) - Audio library
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Battle-Arena-Task
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Game Architecture

The game uses an Entity Component System (ECS) architecture with the following key systems:

- **Movement System**: Handles entity movement and physics
- **Firing System**: Manages weapon firing and bullet creation
- **Collision System**: Detects and resolves collisions between entities
- **Render System**: Handles sprite rendering and animations
- **AI System**: Controls enemy behavior
- **Game State System**: Manages game states (menu, playing, game over, etc.)
- **Status Effect System**: Handles temporary effects on entities
- **Boundary System**: Manages game world boundaries

## Controls

- Mouse movement to aim
- Mouse click to shoot
- (Add other controls as implemented)

## License

ISC License

## Author

[Your Name]

## Acknowledgments

- PixiJS team for the amazing rendering engine
- GSAP team for the animation library
- All contributors and testers 