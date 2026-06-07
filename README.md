# SkyChat — Real-time Chat Application

A real-time chat app with **file sharing**, **voice recording**, and a **clean architecture** built with TypeScript, Node.js, Express, Socket.io, and MongoDB.

## Features

- **Real-time messaging** via Socket.io
- **Room-based chat** — join channels like General, Design, Engineering, Marketing
- **File sharing** — upload images & files via Cloudinary
- **Voice recording** — record and send audio clips
- **Online/offline status** — live user list with status badges
- **Message history** — persisted in MongoDB
- **Typing indicators** — see who's typing
- **Join/leave notifications** — broadcast to the room
- **Space-themed UI** — animated stars and meteors

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Backend | Node.js, Express 5 |
| Real-time | Socket.io |
| Database | MongoDB + Mongoose |
| File Storage | Cloudinary |
| Frontend | Vanilla TypeScript (compiled to JS) |

## Architecture

The server follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── domain/               # Enterprise business rules
│   ├── entities/         # User & Message interfaces
│   └── repositories/     # Repository interfaces (ports)
├── application/          # Application business rules
│   └── use-cases/        # Use cases (GoToRoom, SaveMessage, etc.)
├── infrastructure/       # Adapters & frameworks
│   ├── database/         # Mongoose connection & models
│   ├── repositories/     # Mongo implementations of domain repos
│   └── services/         # Cloudinary file upload service
└── presentation/         # Interface adapters
    ├── http/             # Express routes & controller
    └── sockets/          # Socket.io gateway
```

## Prerequisites

- Node.js v18+
- MongoDB (Atlas or local)
- Cloudinary account (for file uploads)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with:
echo "DATA_BASE=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority" > .env
echo "CLOUD_NAME=your_cloud_name" >> .env
echo "CLOUD_API_KEY=your_api_key" >> .env
echo "CLOUD_API_SECRET=your_api_secret" >> .env

# 3. Build frontend (compile .ts → .js)
npm run build

# 4. Start the server
npm start
```

The server runs on **http://localhost:3002**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run server with hot-reload (`tsx --watch`) |
| `npm run build` | Compile frontend `.ts` → `.js` |
| `npm run typecheck` | Type-check the backend with `tsc --noEmit` |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/go-to-room` | Join or create a user in a room |
| GET | `/all-messages-for-room?room=` | Get message history for a room |
| POST | `/upload-file` | Upload a file to Cloudinary |

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ userName, room }` | Join a chat room |
| `chatMessage` | `string \| { text, file }` | Send a text/file message |
| `typing` | `boolean` | Typing indicator |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message` | `{ userName, text, time, file? }` | Incoming message |
| `roomUsers` | `{ room, users[] }` | Updated user list |
| `displayTyping` | `{ userName, isTyping }` | Typing notification |

## Project Structure

```
├── src/
│   ├── index.ts                    # Entry point — DI container, Express + Socket.io setup
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts      # User interface
│   │   │   └── message.entity.ts   # Message + FileAttachment interfaces
│   │   └── repositories/
│   │       ├── user.repository.ts  # UserRepository port
│   │       └── message.repository.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── go-to-room.use-case.ts
│   │       ├── join-room.use-case.ts
│   │       ├── save-message.use-case.ts
│   │       └── get-room-messages.use-case.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── mongoose-connection.ts
│   │   │   └── models/             # Mongoose schemas
│   │   ├── repositories/           # Mongo implementations
│   │   └── services/
│   │       └── cloudinary.service.ts
│   └── presentation/
│       ├── http/
│       │   ├── routes.ts           # Express router
│       │   └── controllers/
│       │       └── chat.controller.ts
│       └── sockets/
│           ├── socket.server.ts    # (reserved)
│           └── chat.gateway.ts     # Socket.io event handlers
├── utils/
│   ├── message.ts                  # Message formatting helper
│   └── users.ts                    # In-memory socket user store
├── public/
│   ├── index.html                  # Join page
│   ├── chat.html                   # Chat room page
│   ├── css/style.css               # Space-themed styles
│   └── js/                         # Frontend TypeScript source + compiled output
├── .env                            # Environment variables
├── package.json
├── tsconfig.json                   # Backend TS config
└── tsconfig.frontend.json          # Frontend TS config
```

## Development

```bash
# Start dev server with file watching
npm start

# Compile frontend TypeScript after editing .ts files
npm run build

# Type-check backend
npm run typecheck
```

## License

ISC
