# Sky Monitor

Real-time flight tracking application with live flight data, filtering by country, and detailed flight information.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Motion  
**Backend:** Express, tRPC, Better-SQLite3, Bun

## Features

- Live flight tracking via OpenSky Network API
- Filter flights by country (CIS/Russia-priority dictionary)
- Flight details: airline, aircraft, route, speed, altitude
- Airline logos, aircraft images, country flags
- Animated UI components

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) runtime

### Install dependencies

```bash
bun install
cd backend && bun install
```

### Run development

```bash
# Frontend
bun run dev

# Backend (in separate terminal)
cd backend && bun run dev
```

### Build

```bash
bun run build
```

## Project Structure

```
├── src/
│   ├── components/         # UI components
│   │   ├── flight-list/    # Flight list & cards
│   │   ├── flight-details/ # Flight detail view
│   │   └── animate-ui/     # Animated components
│   ├── screens/            # Page-level components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services (tRPC client)
│   ├── store/              # State management
│   └── types/              # TypeScript interfaces
└── backend/
    └── src/
        ├── routers/        # tRPC routers (flights, airlines)
        ├── db/             # SQLite database & migrations
        └── services/       # External API integrations
```