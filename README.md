# Invenio Chat App

A full-stack real-time chat application with group and individual messaging, AI integration, video calls, notifications, and productivity widgets.

## Features

- Real-time 1-on-1 and group chat
- AI-powered chat assistant
- Video calling
- Push notifications
- Google Calendar and Todo widgets
- User authentication
- Responsive UI with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), and [daisyUI](https://daisyui.com/)
- Backend powered by [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Socket.IO](https://socket.io/)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies for both frontend and backend:**
   ```sh
   npm run build
   ```

3. **Setup .env file:**

MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
OPENAI_API_KEY=...
NODE_ENV=development

4. **Start the backend server:**
   ```sh
   npm run start
   ```
   or, for development with auto-reload:
   ```sh
   cd backend
   npm run dev
   ```

5. **Start the frontend dev server:**
   ```sh
   cd frontend
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173) by default.

## Scripts

From the root:

- `npm run build` &mdash; Installs dependencies and builds the frontend.
- `npm run start` &mdash; Starts the backend server.

From `frontend/`:

- `npm run dev` &mdash; Starts the frontend dev server.
- `npm run build` &mdash; Builds the frontend for production.
- `npm run lint` &mdash; Runs ESLint.

From `backend/`:

- `npm run dev` &mdash; Starts the backend with nodemon.
- `npm run start` &mdash; Starts the backend server.

## Technologies Used

- **Frontend:** React, Vite, Zustand, Tailwind CSS, daisyUI, Socket.IO Client
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, Cloudinary, OpenAI
- **Other:** ESLint, PostCSS

## License

This project is licensed under the ISC License.

---

*Made with ❤️ for learning and collaboration.*