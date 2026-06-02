# SkyChat - Modern Real-time Chat Application

A beautiful, feature-rich real-time chat application built with Node.js, Express, Socket.io, and MongoDB. SkyChat offers a modern space-themed UI with smooth animations and a seamless chatting experience.

## 🚀 Features

### Core Functionality

- **Real-time Messaging**: Instant message delivery using Socket.io
- **Room-based Chat**: Users can join different chat rooms
- **User Management**: Online/offline status tracking
- **Message History**: Persistent message storage in MongoDB
- **Typing Indicators**: See when other users are typing

### User Experience

- **Beautiful Space-themed UI**: Stunning animated background with stars and meteors
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time User List**: See who's currently online in your room
- **Join/Leave Notifications**: Get notified when users enter or leave the chat

## 🛠️ Technology Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database for user and message storage
- **Mongoose** - MongoDB object modeling

### Frontend

- **HTML5/CSS3** - Modern web standards
- **JavaScript (ES6+)** - Client-side functionality
- **Font Awesome** - Icon library
- **CSS Animations** - Custom space-themed animations

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chat/socket
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory
   - Add your MongoDB connection string:

   ```
   MONGODB_URI=mongodb://localhost:27017/skychat
   ```

4. **Start the application**

   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
chat/socket/
├── back/
│   ├── database/
│   │   ├── connection.js          # MongoDB connection
│   │   └── model/
│   │       ├── user.model.js      # User schema
│   │       └── message.model.js   # Message schema
│   └── index.js                   # Main server file
├── public/
│   ├── css/
│   │   └── style.css              # Styling and animations
│   ├── js/
│   │   └── chat.js                # Client-side Socket.io logic
│   ├── index.html                 # Main chat interface
│   └── chat.html                  # Chat room interface
├── utils/
│   ├── message.js                 # Message formatting utilities
│   └── users.js                   # User management utilities
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 💾 API Endpoints

### User Management

- `POST /go-to-room` - Join or create a user in a room
- `GET /all-messages-for-room?room=<roomName>` - Get all messages for a room
- `POST /add-message` - Add a new message to the database

### Socket.io Events

- `joinRoom` - Join a chat room
- `chatMessage` - Send a chat message
- `typing` - Broadcast typing status
- `disconnect` - Handle user disconnection

## 🎮 Usage

1. **Enter Chat Room**
   - Open the application in your browser
   - Enter your name and desired room name
   - Click "Join Chat"

2. **Start Chatting**
   - Type your message in the input field
   - Press Enter or click Send to deliver your message
   - See real-time updates as other users join and chat

3. **Room Features**
   - View all online users in the current room
   - See typing indicators when others are composing messages
   - Receive notifications when users join or leave

## 🎨 UI Features

- **Animated Space Background**: Dynamic stars and meteors
- **Smooth Transitions**: CSS animations for better UX
- **Responsive Layout**: Adapts to different screen sizes
- **Modern Color Scheme**: Dark theme with vibrant accents

## 🔧 Development

### Available Scripts

- `npm start` - Start the development server with file watching
- `npm test` - Run Jest tests (if configured)

### Key Files to Modify

- `back/index.js` - Server logic and Socket.io events
- `public/js/chat.js` - Client-side chat functionality
- `public/css/style.css` - Styling and animations
- `back/database/model/` - Database schemas

## 📱 Demo Video

[![SkyChat Demo](https://img.youtube.com/vi/AVVwuyVG7D8/0.jpg)](https://www.youtube.com/watch?v=AVVwuyVG7D8)

_Click the thumbnail above to watch the full demonstration on YouTube_

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 🙏 Acknowledgments

- Socket.io team for the excellent real-time communication library
- MongoDB for the robust database solution
- Font Awesome for the beautiful icon set
- The open-source community for inspiration and tools

---

**Happy Chatting! 🚀✨**

Made with ❤️ and lots of ☕
