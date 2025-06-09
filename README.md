# 🎲 multiplayer-yahtzee

## Multiplayer Yahtzee

A full-stack multiplayer Yahtzee game built as a portfolio project to showcase clean code, thoughtful architecture, and real-time multiplayer gameplay.

---

### ✨ Features

- ✅ Sign in / play as guest  
- 🧑‍🤝‍🧑 Create and join multiplayer lobbies  
- 🎮 Play real-time Yahtzee with other users  
- 💬 In-lobby and in-game chat  
- 🔐 Session tracking and user management  
- 🚀 Deployed and live on Render

---

### 🛠 Tech Stack

- **Frontend:** Vue 3 + Vite  
- **Backend:** Node.js, Express  
- **Real-time:** Socket.IO  
- **Database:** PostgreSQL (via `pg` module)  
- **Hosting:** Render.com

---

### 📦 Architecture & Approach

#### 🔒 Game Logic Encapsulation  
Game logic is fully self-contained and testable. Internal state is protected, with controlled public interfaces via the `MatchManager` class.

#### 🧩 Modular Domain Design  
Application logic is split into focused modules (`/game`, `/user`, `/lobby`) to encourage a domain-driven approach and clear separation of concerns.

#### 🤝 Composition Over Inheritance  
The codebase prefers composition for flexibility and testability, avoiding tight coupling between logic components.

#### ✅ Result Pattern & Guard Clauses  
Flow control and error handling are handled using the result pattern and guard clauses for cleaner, more readable code.

---
### 🧪 Running Locally

```bash
# Clone the repository
git clone https://github.com/TrygoGH/multiplayer-yahtzee
cd multiplayer-yahtzee

# Backend
cd server
npm install
node server.js

# Frontend (in a new terminal window)
cd client
npm install
npm run dev
```
---

### 🌐 Live Demo

The project is deployed and running live on Render.
Demo link: [https://multiplayer-yahtzee-frontend.onrender.com](https://multiplayer-yahtzee-frontend.onrender.com)  
Repo link: [https://github.com/TrygoGH/multiplayer-yahtzee](https://github.com/TrygoGH/multiplayer-yahtzee)


---

### 👤 Intended Audience

This is a personal project designed to:

- Demonstrate real-world development skills to potential employers  
- Serve as a fun multiplayer game for users  
- Show proficiency in fullstack JS, architecture, and real-time systems

---

### 📚 Learning Focus

- Clean architecture & modular design  
- Real-time event handling with Socket.IO  
- RESTful API development  
- Frontend state management (Vue 3)  
- Deployment (CI/CD) via Render  
- Secure multiplayer session logic

---

### 📝 TODO / Improvements

- Add unit and integration tests using Jest  
- Add persistent login / registration  
- Improve mobile responsiveness and accessibility  
- Add deployment instructions and database setup guide

---

### 📄 License

This project is licensed under the MIT License.
