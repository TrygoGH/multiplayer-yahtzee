# multiplayer-yahtzee
🎲 Multiplayer Yahtzee
A full-stack multiplayer Yahtzee game built as a portfolio project to showcase clean code, thoughtful architecture, and real-time multiplayer gameplay.

✨ Features
✅ Sign in / Sign up (guest support included)

🧑‍🤝‍🧑 Create and join multiplayer lobbies

🎮 Start and play games of Yahtzee with others

💬 In-lobby and in-game chat

🔐 Session management and user tracking

🛠 Tech Stack
Frontend: Vue 3 + Vite

Backend: Node.js, Express

Real-time: Socket.IO

Database: MySQL (via SQL)

Testing / Patterns: Result pattern, guard clauses, domain-driven structure

📦 Architecture & Approach
Game Logic Encapsulation: The game logic is self-contained. Only minimal methods and properties are exposed—no internal state leakage. The MatchManager class acts as the interface for running and observing a match.

Modular Design: Domain logic is separated by modules (e.g., game/, user/, lobby/) to encourage a domain-driven approach.

Composition Over Inheritance: Flexible and reusable code structure without tight coupling.

Result Pattern & Guard Clauses: Used for clean, readable flow and clear error handling.

🧪 Running the Project Locally
# Backend
node server.js

# Frontend (in a separate terminal)
npm run dev
Ensure you have your MySQL database running and configured.

🌐 Hosting
Currently, the project runs locally via Vite and Express, but deployment to a public server is planned to make the game easily accessible.

👤 Intended Audience
This is a personal project meant for learning and showcasing my skills. The target audience includes anyone who wants to play a fun round of Yahtzee, as well as potential employers interested in my development abilities.


