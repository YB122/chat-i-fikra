"use strict";
// const socket = io();
// const socket = io("https://nd1cgptf-3002.uks1.devtunnels.ms");
const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const fileInput = document.getElementById("file-input");
const filePreview = document.getElementById("file-preview");
const recordBtn = document.getElementById("record-btn");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");
const room = urlParams.get("room");
document.getElementById("room-name").innerText = room;
document.title = `SkyChat | ${room}`;
socket.on("connect", () => {
    socket.emit("joinRoom", { userName: username, room });
});
let isReady = false;
// ✅ FIX 1: fetch messages only after confirmed room join
socket.on("joinedRoom", () => {
    isReady = true;
    fetchMessages();
});
// --- Audio Recording (press & hold like WhatsApp) ---
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recordStream = null;
let recordTimerInterval = null;
let recordSeconds = 0;
const recordingBar = document.getElementById("recording-bar");
const recordingTimer = document.getElementById("recording-timer");
async function startRecording() {
    if (isRecording)
        return;
    try {
        recordStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(recordStream);
        audioChunks = [];
        recordSeconds = 0;
        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };
        mediaRecorder.onstop = async () => {
            if (recordTimerInterval) {
                clearInterval(recordTimerInterval);
                recordTimerInterval = null;
            }
            recordStream?.getTracks().forEach((t) => t.stop());
            recordStream = null;
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            recordBtn.classList.remove("recording");
            recordingBar.classList.add("hidden");
            isRecording = false;
            if (audioChunks.length === 0)
                return;
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("file", file);
            try {
                const uploadRes = await fetch("/upload-file", { method: "POST", body: formData });
                const uploadData = await uploadRes.json();
                if (uploadRes.ok) {
                    socket.emit("chatMessage", {
                        text: "",
                        file: { url: uploadData.url, publicId: uploadData.publicId, type: "audio", name: "Voice message" },
                    });
                }
            }
            catch (err) {
                console.error("Upload error:", err);
            }
        };
        mediaRecorder.start();
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        recordBtn.classList.add("recording");
        recordingBar.classList.remove("hidden");
        isRecording = true;
        recordTimerInterval = setInterval(() => {
            recordSeconds++;
            const m = Math.floor(recordSeconds / 60);
            const s = recordSeconds % 60;
            recordingTimer.textContent = `${m}:${s.toString().padStart(2, "0")}`;
        }, 1000);
    }
    catch (err) {
        console.error("Mic access denied:", err);
    }
}
function stopRecording() {
    if (!isRecording || !mediaRecorder)
        return;
    mediaRecorder.stop();
}
recordBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    startRecording();
});
recordBtn.addEventListener("mouseup", () => {
    stopRecording();
});
recordBtn.addEventListener("mouseleave", () => {
    if (isRecording)
        stopRecording();
});
recordBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startRecording();
});
recordBtn.addEventListener("touchend", () => {
    stopRecording();
});
// --- End Audio Recording ---
async function fetchMessages() {
    try {
        const response = await fetch(`/all-messages-for-room?room=${room}`);
        const result = await response.json();
        if (response.ok && result.data) {
            chatMessages.innerHTML = "";
            result.data.forEach((msg) => {
                const file = msg.file
                    ? { url: msg.file.url, publicId: msg.file.publicId, type: msg.file.type, name: msg.file.name }
                    : undefined;
                outputMessage({
                    userName: msg.userId ? msg.userId.name : "System",
                    text: msg.content || "",
                    time: new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    file,
                });
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    catch (error) {
        console.error("Error fetching messages:", error);
    }
}
// ✅ FIX 1: fetchMessages() removed from here — now called inside joinedRoom above
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
    typingIndicator.innerText = isTyping ? `${userName} is typing...` : "";
});
fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) {
        filePreview.classList.add("hidden");
        return;
    }
    filePreview.classList.remove("hidden");
    if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            filePreview.innerHTML = `<img src="${e.target.result}" class="preview-img" /> <button type="button" class="preview-remove">&times;</button>`;
        };
        reader.readAsDataURL(file);
    }
    else {
        filePreview.innerHTML = `<span class="preview-name"><i class="fas fa-file"></i> ${file.name}</span> <button type="button" class="preview-remove">&times;</button>`;
    }
    filePreview.querySelector(".preview-remove")?.addEventListener("click", () => {
        fileInput.value = "";
        filePreview.classList.add("hidden");
        filePreview.innerHTML = "";
    });
});
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = e.target.elements.namedItem("msg");
    const file = fileInput.files?.[0];
    if (file) {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const uploadRes = await fetch("/upload-file", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) {
                console.error("Upload failed");
                return;
            }
            socket.emit("chatMessage", {
                text: msg.value,
                file: { url: uploadData.url, publicId: uploadData.publicId, type: uploadData.type, name: uploadData.name },
            });
            fileInput.value = "";
            filePreview.classList.add("hidden");
            filePreview.innerHTML = "";
        }
        catch (error) {
            console.error("Upload error:", error);
        }
    }
    else if (msg.value.trim()) {
        // ✅ FIX 2: emit consistent object format instead of plain string
        socket.emit("chatMessage", { text: msg.value, file: null });
    }
    socket.emit("typing", false);
    msg.value = "";
    msg.focus();
});
window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";
async function renderPdfPages(container, url) {
    try {
        const pdf = await window.pdfjsLib.getDocument(url).promise;
        const totalPages = pdf.numPages;
        const scale = 0.5;
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.className = "pdf-page";
            const ctx = canvas.getContext("2d");
            await page.render({ canvasContext: ctx, viewport }).promise;
            container.appendChild(canvas);
        }
    }
    catch (err) {
        console.error("PDF render error:", err);
    }
}
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    if (message.userName === "Chat") {
        div.classList.add("system");
    }
    else if (message.userName === username) {
        div.classList.add("own");
    }
    else {
        div.classList.add("other");
    }
    let fileHtml = "";
    if (message.file) {
        if (message.file.type === "image") {
            fileHtml = `<div class="file-attachment"><img src="${message.file.url}" class="chat-image" alt="${message.file.name}" /></div>`;
        }
        else if (message.file.type === "audio") {
            fileHtml = `<div class="file-attachment audio-attachment">
        <i class="fas fa-microphone audio-icon"></i>
        <audio controls src="${message.file.url}" class="chat-audio"></audio>
      </div>`;
        }
        else if (message.file.type === "video") {
            const posterUrl = message.file.url.replace(/\.\w+$/, ".jpg");
            fileHtml = `<div class="file-attachment video-attachment"><div class="video-wrapper"><video poster="${posterUrl}" src="${message.file.url}" class="chat-video" preload="none" playsinline></video><div class="play-overlay"><i class="fas fa-play"></i></div></div></div>`;
        }
        else if (message.file.name?.toLowerCase().endsWith(".pdf")) {
            fileHtml = `<div class="file-attachment pdf-attachment"><a href="#" class="file-link pdf-download" data-url="${message.file.url}" data-filename="${message.file.name}"><i class="fas fa-file-pdf" style="font-size:20px;color:#ef4444"></i> ${message.file.name}</a><div class="pdf-pages" data-pdf-url="${message.file.url}"></div></div>`;
        }
        else {
            fileHtml = `<div class="file-attachment"><a href="${message.file.url}" target="_blank" rel="noopener noreferrer" class="file-link"><i class="fas fa-file"></i> ${message.file.name}</a></div>`;
        }
    }
    const textHtml = message.text ? `<p class="text">${message.text}</p>` : "";
    div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
  ${fileHtml}
  ${textHtml}`;
    document.querySelector(".chat-messages").appendChild(div);
    const pdfContainer = div.querySelector(".pdf-pages");
    if (pdfContainer) {
        renderPdfPages(pdfContainer, pdfContainer.dataset.pdfUrl);
    }
    const videoWrapper = div.querySelector(".video-wrapper");
    if (videoWrapper) {
        const video = videoWrapper.querySelector("video");
        const overlay = videoWrapper.querySelector(".play-overlay");
        videoWrapper.addEventListener("click", () => {
            if (video.paused) {
                video.play();
                overlay.classList.add("playing");
                video.setAttribute("controls", "controls");
            }
            else {
                video.pause();
                overlay.classList.remove("playing");
            }
        });
        video.addEventListener("play", () => overlay.classList.add("playing"));
        video.addEventListener("pause", () => {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("playing");
                video.removeAttribute("controls");
            }
        });
        video.addEventListener("ended", () => {
            overlay.classList.remove("playing");
            video.removeAttribute("controls");
        });
    }
    const pdfLink = div.querySelector(".pdf-download");
    if (pdfLink) {
        pdfLink.addEventListener("click", async (e) => {
            e.preventDefault();
            const url = pdfLink.dataset.url;
            const filename = pdfLink.dataset.filename;
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            }
            catch (err) {
                window.open(url, "_blank");
            }
        });
    }
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
document.getElementById("leave-btn").addEventListener("click", () => {
    Swal.fire({
        title: "Are you sure?",
        text: "You will be disconnected from the chat!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#667aff",
        cancelButtonColor: "#ff4b4b",
        confirmButtonText: "Yes, leave chat",
        background: "#1e293b",
        color: "#fff",
    }).then((result) => {
        if (result.isConfirmed) {
            socket.disconnect();
            window.location.href = "index.html";
        }
    });
});
