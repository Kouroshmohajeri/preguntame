# 🕹️ Pregúntame — A Retro-Minimal Real-Time Quiz & Game Platform

Pregúntame is a real-time quiz and interactive game platform built with a **retro-minimal design**.  
It combines the softness of the **Nunito font** with bold, brutal-retro visual elements to create a modern interface that still feels nostalgic — inspired by the simple and colorful digital games we grew up playing.

The result is a clean, fast, and intuitive experience designed for classrooms, events, communities, and teams.

---

## 🎮 Features

### 👥 Game Participation
- Join games using a unique **game code**
- Guest mode at `/play/guest/{code}`
- Mobile players see only answer buttons
- Desktop players can view a full layout similar to the host
- Custom player name + Dicebear avatar selection
- Real-time state syncing using WebSockets + Redis

---

### 🏁 Hosting & Real-Time Game Flow
- Host dashboard available at `/play/host/{code}`
- Pre-question state with blurred first answer for fairness
- Synchronized countdown across all participants
- Speed-based scoring (faster answers earn more points)
- Post-question feedback:
  - Correct answer
  - Individual result indicator
- End-of-game leaderboard with:
  - Player activity breakdown
  - Correct vs wrong answers
  - Average response time
  - Per-question performance

---

### 📊 Player Stats & Analytics
Logged-in players get:
- Saved game history
- Total correct/wrong answers
- Response-time analysis
- Per-question breakdowns
- Personal performance overview

---

### 🧑‍🏫 User Dashboard
Includes:
- Games created  
- Games played  
- Score overview  
- Credits (future system)  
- Profile details (email, join date)  
- Avatar display  
- Privacy settings for email communication  

---

### 🧪 Game Management Tools
For each created game:
- **Host** the game  
- **Share** (QR code + planned email sharing/cloning)  
- **Edit**  
- **Delete**  
- **Export** to PDF (via JSPDF) with questions + marked correct answers  

---

## 🚀 Roadmap

### 📚 `/games` — Public Game Library
- Browse community-created games (questions only)  
- Clone games into your account  
- Ideal for teachers, creators, and event hosts  

### 📝 `/exam/{code}` — Exam Mode
A dedicated exam environment with:
- Timed or untimed sessions  
- Automatic grading  
- Student-specific answer reports  
- Exportable results  

### 💳 Subscription Plans
Affordable plans designed to unlock more capabilities:
- Game export  
- Game cloning  
- Private games  
- Advanced analytics  
- Higher player limits  
- Teacher & school tiers  

### 📰 `/blog`
Platform walkthroughs, updates, tutorials, and educational content.

---

## 🎨 Design Philosophy

Pregúntame follows a **retro-minimal** and **brutalist-inspired** visual direction:

- Clean, rounded **Nunito** typography  
- Blocky, geometric shapes  
- Low-noise, bold-interface layout  
- Bright, inviting color palette  
- Fast and accessible user interactions  

The goal is to recreate the joy and simplicity of classic games while delivering a modern, responsive experience suitable for real-world use.

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js**  
- **React**  
- Retro-minimal custom CSS design  

### **Backend**
- **Node.js + Express**  
- **MVC architecture**

### **Database**
- **MongoDB**

### **Real-Time**
- **WebSockets** for gameplay  
- **Redis** for pub/sub event synchronization  

### **Authentication**
- **NextAuth**  
- **JWT tokens**  
- **Google Login**  

### **PDF Generation**
- **JSPDF** for producing question/answer exports  

### **Avatars**
- **Dicebear** for character generation  

### **Deployment**
- **Vercel** — Frontend  
- **AWS** — Backend server  

---
