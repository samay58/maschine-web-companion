# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting checks

## Code Style Guidelines

- **React Components**: Use functional components with hooks, optimize render performance
- **State Management**: Use Zustand for global state, follow immutable update patterns
- **Web Audio/MIDI**: Handle browser compatibility, use refs for audio contexts
- **Naming**: 
  - Components: PascalCase (e.g., `PadGrid.jsx`) 
  - Hooks: camelCase with 'use' prefix (e.g., `useMidi.js`)
  - Store actions: camelCase verbs (e.g., `togglePlaying`, `assignSound`)
- **Imports**: Group by: 1) React/Next.js, 2) third-party, 3) project imports
- **Error Handling**: Try/catch for async operations, user-friendly feedback messages
- **LocalStorage**: Use constants for keys, handle serialization errors
- **UI Events**: Use debounced handlers for high-frequency events (audio, MIDI)

## Project Architecture

- **Components**: Implement presentational logic, connect to store via hooks
- **Store (utils/store.js)**: Single source of truth with actions for state updates
- **Hooks**: Abstract browser APIs and complex stateful logic
- **Utils**: Pure helper functions, audio processing, and data transformations
- **Layout**: Responsive design with mobile/tablet/desktop breakpoints
- **Performance**: Memoize expensive calculations, cancel animations on unmount