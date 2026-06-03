# SkyChat - Real-time Chat Application

A real-time chat app with a space-themed UI built with TypeScript, Node.js, Express, Socket.io, and MongoDB.

## Features

- **Real-time messaging** via Socket.io
- **Room-based chat** — join any room by name
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
| Frontend | Vanilla TypeScript (compiled to JS) |

## Prerequisites

- Node.js v18+
- MongoDB (Atlas or local)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
#    Add your MongoDB connection string:
echo "DATA_BASE=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Cluster0" > .env

# 3. Build frontend (compile .ts → .js)
npm run build

# 4. Start the server
npm start
```

The server runs on **http://localhost:3002**.

## Project Structure

```
├── back/
│   ├── index.ts                  # Express server + Socket.io
│   └── database/
│       ├── connection.ts         # MongoDB connection
│       └── model/
│           ├── user.model.ts     # User schema
│           └── message.model.ts  # Message schema
├── public/
│   ├── index.html                # Join page
│   ├── chat.html                 # Chat room page
│   ├── css/style.css             # Styles + animations
│   └── js/
│       ├── main.ts               # Chat client logic
│       ├── join.ts               # Join form logic
│       ├── globals.d.ts          # Ambient type declarations
│       ├── main.js               # Compiled output
│       └── join.js               # Compiled output
├── utils/
│   ├── message.ts                # Message formatting
│   └── users.ts                  # In-memory user store
├── .env                          # Environment variables
├── tsconfig.json                 # Backend TS config
├── tsconfig.frontend.json        # Frontend TS config
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run server with hot-reload (`tsx --watch`) |
| `npm run build` | Compile frontend `.ts` → `.js` |
| `npm test` | Run Jest tests |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/go-to-room` | Join or create a user in a room |
| GET | `/all-messages-for-room?room=` | Get message history for a room |
| POST | `/add-message` | Save a message to the database |

## Socket.io Events

### Client → Server
- `joinRoom` — `{ userName, room }`
- `chatMessage` — `string`
- `typing` — `boolean`

### Server → Client
- `message` — `{ userName, text, time }`
- `roomUsers` — `{ room, users[] }`
- `displayTyping` — `{ userName, isTyping }`

## Development

```bash
# Start the dev server with file watching
npm start

# Compile frontend TypeScript after editing .ts files
npm run build

# Type-check backend
npx tsc --noEmit
```

## License

ISC
