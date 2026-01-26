# BettaFish Frontend

Modern React frontend for the BettaFish (微舆) public opinion analysis system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for API data fetching
- **Socket.IO Client** for real-time updates
- **Framer Motion** for animations
- **Vis-Network** for knowledge graph visualization

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The dev server runs on `http://localhost:3000` and proxies API requests to the Flask backend at `http://localhost:5000`.

### Running with Flask Backend

1. Start Flask backend: `python app.py` (runs on port 5000)
2. Start frontend dev server: `npm run dev` (runs on port 3000)
3. Open `http://localhost:3000` in browser

### API Proxy Configuration

The Vite config (`vite.config.ts`) proxies:
- `/api/*` → Flask backend
- `/socket.io/*` → Socket.IO server

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   └── console/     # Console/terminal components
│   ├── pages/           # Page components
│   │   ├── dashboard.tsx    # Main control panel
│   │   ├── graph.tsx        # Knowledge graph visualization
│   │   ├── reports.tsx      # Report center
│   │   └── settings.tsx     # System settings
│   ├── stores/          # Zustand stores
│   ├── lib/             # Utilities, API client, Socket client
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app with routing
│   └── main.tsx         # Entry point
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## Features

- **Dashboard**: Search interface, engine status monitoring, real-time console logs
- **Knowledge Graph**: Interactive Vis.js visualization with filtering and search
- **Reports**: View and download generated analysis reports
- **Settings**: Configure database connections and LLM API keys

## Design

- Dark theme with glass-morphism effects
- Gradient accents (indigo/purple)
- Responsive layout
- Real-time status updates via WebSocket
