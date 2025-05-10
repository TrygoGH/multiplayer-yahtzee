const socket = window.socket;

// Replace with actual lobby name from backend
document.getElementById("lobby-name").innerText = "Example Lobby";

// Enable start button if host (replace with actual check)
const isHost = true; // You would get this from your server
if (isHost) {
  document.getElementById("start-button").disabled = false;
}

// Chat logic
const sendButton = document.getElementById("send-button");
const messageInput = document.getElementById("chat-message");
const chatBox = document.getElementById("chat-box");

sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("message_room_request", message);
    appendMessage("You", message);
    messageInput.value = "";
  }
});

function appendMessage(sender, message) {
  const msgElement = document.createElement("div");
  msgElement.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msgElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen for messages from the room
socket.on("message_room_broadcast", ({ sender, message }) => {
  appendMessage(sender, message);
});

document.getElementById("leave-button").addEventListener("click", () => {
  socket.emit("leave_lobby_request");
  window.location.href = "/"; // Or wherever your main menu is
});
