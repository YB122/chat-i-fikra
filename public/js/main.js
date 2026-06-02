const socket = io();

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');
const room = urlParams.get('room');


document.getElementById('room-name').innerText = room;
document.title = `SkyChat | ${room}`;

socket.emit("joinRoom", { userName: username, room });


async function fetchMessages() {
  try {
    const response = await fetch(`/all-messages-for-room?room=${room}`);
    const result = await response.json();
    if (response.ok && result.data) {
      chatMessages.innerHTML = '';
      result.data.forEach(msg => {

        outputMessage({
          userName: msg.userId ? msg.userId.name : "System",
          text: msg.content,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

fetchMessages();

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  console.log("Received message:", message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


const msgInput = document.getElementById("msg");
const typingIndicator = document.getElementById("typing-indicator");
let typingTimeout;

msgInput.addEventListener("input", () => {
  socket.emit("typing", true);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", false);
  }, 2000);
});

socket.on("displayTyping", ({ userName, isTyping }) => {
  if (isTyping) {
    typingIndicator.innerText = `${userName} is typing...`;
  } else {
    typingIndicator.innerText = "";
  }
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("chatMessage", msg);
  socket.emit("typing", false);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");

  if (message.userName === 'Chat') {
    div.classList.add("system");
  } else if (message.userName === username) {
    div.classList.add("own");
  } else {
    div.classList.add("other");
  }

  div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room) {
  document.getElementById("room-name").innerText = room;
}

function outputUsers(users) {
  const usersContainer = document.getElementById("users");
  usersContainer.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.className = user.name == username ? "active-user" : "";

    const badge = document.createElement("span");
    badge.className = `status-badge ${user.isOnline ? "online" : "offline"}`;

    li.appendChild(badge);
    li.appendChild(document.createTextNode(` ${user.name}`));
    usersContainer.appendChild(li);
  });
}


document.getElementById('leave-btn').addEventListener('click', () => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You will be disconnected from the chat!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#667aff',
    cancelButtonColor: '#ff4b4b',
    confirmButtonText: 'Yes, leave chat',
    background: '#1e293b',
    color: '#fff'
  }).then((result) => {
    if (result.isConfirmed) {
      socket.disconnect();
      window.location = 'index.html';
    }
  });
});
