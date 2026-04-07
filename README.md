# Cloud-Based Real-Time Chat Application

A full-stack real-time chat application deployed on AWS EC2 with a production-ready architecture using NGINX, PM2, and secure authentication.

---

## 🚀 Features

* Real-time 1-on-1 and group chat
* Message editing functionality
* AI-powered chat assistant
* Video calling (WebRTC)
* Push notifications
* Google Calendar and Todo widgets
* Secure authentication (JWT + cookies)
* Responsive UI with React + Tailwind CSS
* Production deployment with reverse proxy and process manager

---

## ☁️ Cloud Architecture

```
User → NGINX (Port 80) → Node.js Server (PM2, Port 5001) → MongoDB
```

* Frontend served via Express (Vite build)
* Backend managed using PM2 (auto-restart)
* NGINX acts as reverse proxy (removes port exposure)
* AWS EC2 (Ubuntu) used for hosting

---

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* Zustand
* Tailwind CSS
* daisyUI
* Socket.IO Client

### Backend

* Node.js
* Express
* MongoDB (Mongoose)
* Socket.IO
* Cloudinary
* OpenAI API

### DevOps / Deployment

* AWS EC2 (Ubuntu)
* NGINX
* PM2

---

## 📁 Project Structure

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

---

## ⚙️ Getting Started (Local Development)

### Prerequisites

* Node.js (v18+ recommended)
* MongoDB (local or Atlas)

---

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

---

### 2. Install Dependencies

```bash
npm run build
```

---

### 3. Setup Environment Variables

Create `.env` inside `backend/`:

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
OPENAI_API_KEY=...

NODE_ENV=development
```

---

### 4. Run Backend

```bash
cd backend
npm run dev
```

---

### 5. Run Frontend

```bash
cd frontend
npm run dev
```

App runs at:

```
http://localhost:5173
```

---

## 🚀 Production Deployment (AWS EC2)

### 1. Setup EC2 (Ubuntu)

* Launch instance
* Allow ports: **22, 80, 5001**
* Connect via SSH

---

### 2. Install Node.js

```bash
sudo apt update
sudo apt install nodejs npm -y
```

---

### 3. Clone Project

```bash
git clone <your-repo-url>
cd cloud-project
```

---

### 4. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install --legacy-peer-deps
```

---

### 5. Build Frontend

```bash
npm run build
```

---

### 6. Setup Environment Variables

```bash
nano backend/.env
```

---

### 7. Run with PM2

```bash
npm install -g pm2
pm2 start backend/src/index.js --name chat-app
pm2 save
pm2 startup
```

---

### 8. Setup NGINX Reverse Proxy

```bash
sudo apt install nginx -y
```

Edit config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart:

```bash
sudo systemctl restart nginx
```

---

## 🔐 Authentication Notes

* Uses JWT stored in HTTP-only cookies
* Development mode:

  * `secure: false`
  * `sameSite: "lax"`
* Production (with HTTPS):

  * `secure: true`
  * `sameSite: "none"`

---

## 📜 Scripts

### Root

* `npm run build` — installs dependencies + builds frontend
* `npm run start` — starts backend

### Backend

* `npm run dev` — dev server (nodemon)
* `npm start` — production server

### Frontend

* `npm run dev` — dev server
* `npm run build` — production build

---

## ⚠️ Important Notes

* Do NOT commit `.env` file
* Always rebuild frontend after changes
* Restart PM2 after updates:

```bash
pm2 restart chat-app
```

---

## 🎯 Future Improvements

* HTTPS with domain (Certbot)
* CI/CD pipeline (GitHub Actions)
* Redis for scaling sockets
* Docker containerization

---

## 📄 License

This project is licensed under the ISC License.

---

*Built as part of a cloud deployment and full-stack engineering project.* ☁️
