# 🕹️ Pregúntame — A Retro-Minimal Real-Time Quiz & Game Platform with AI

Pregúntame is a real-time quiz and interactive game platform built with a **retro-minimal design**.  
It combines the softness of the **Nunito font** with bold, brutal-retro visual elements to create a modern interface that still feels nostalgic — inspired by the simple and colorful digital games we grew up playing.

Now featuring **Pregúntame Wizard (AI)** — our latest AI-powered quiz generator that transforms prompts, documents, URLs, and YouTube videos into engaging quizzes in seconds.

The result is a clean, fast, and intuitive experience designed for classrooms, events, communities, and teams.

---

## 🎮 Features

### 🤖 Pregúntame Wizard (AI) — **NEW!**
Our latest feature brings AI-powered quiz creation to your fingertips:

#### 4 Powerful Input Methods:
1. **AI Prompts** — Generate quizzes from simple text descriptions
2. **Document Upload** — Transform PDFs, Word docs, and text files into quizzes
3. **Website URLs** — Extract content from any webpage to create questions
4. **YouTube Videos** — Convert video transcripts into interactive quiz questions

#### Beta Access Program:
- **500 free AI credits** for early adopters
- Full access to all AI features
- Approval within 2 hours
- No credit card required
- License-based access control with real-time validation

#### AI Features:
- Smart question generation with multiple-choice answers
- Automatic difficulty adjustment
- Topic-based question creation
- Instant quiz creation (seconds, not hours)
- Credit-based usage system

---

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
- **AI Access Tab** — Request beta access, view credits, manage AI license
- Games created (manual + AI-generated)
- Games played  
- Score overview  
- AI Credits balance and usage history
- Profile details (email, join date)  
- Avatar display  
- Privacy settings for email communication  

---

### 🧪 Game Management Tools
For each created game:
- **Host** the game  
- **Share** (QR code + planned email sharing/cloning)  
- **Clone** AI-generated games (with credit deduction for AI games)
- **Edit**  
- **Delete**  
- **Export** to PDF (via JSPDF) with questions + marked correct answers  
- **AI Badge** indicator for AI-generated games

---

## 🚀 Roadmap

### 🤖 AI Enhancements — **Beta Access Available**
- Advanced AI models (Gemini integration)
- Multi-language quiz generation
- Difficulty level customization
- Bulk quiz generation
- AI-powered quiz improvement suggestions

---

### 📚 Public Game Library (Coming soon...)
- Browse community-created games (questions only)  
- Clone games into your account  
- Filter by AI-generated vs manual games
- Ideal for teachers, creators, and event hosts  

---

### 📝 Exam Mode (Coming soon...)
A dedicated exam environment with:
- Timed or untimed sessions  
- Automatic grading  
- Student-specific answer reports  
- Exportable results  
- AI-generated exam questions

---

### 💳 Subscription Plans (Coming soon...)
Affordable plans designed to unlock more capabilities:
- Additional AI credits
- Premium AI models
- Game export with initials 
- Private games  
- Higher player limits  
- Teacher & school tiers  

---

### 📰 `/blog`
Platform walkthroughs, updates, tutorials, and educational content including:
- AI quiz creation best practices
- How to maximize your AI credits
- Tips for effective prompt writing
- YouTube-to-quiz conversion guides

---

## 🎨 Design Philosophy

Pregúntame follows a **retro-minimal** and **brutalist-inspired** visual direction:

- Clean, rounded **Nunito** typography  
- Blocky, geometric shapes  
- Low-noise, bold-interface layout  
- Bright, inviting color palette  
- Fast and accessible user interactions  
- **AI-futuristic-retro-chic** elements for Wizard features

The goal is to recreate the joy and simplicity of classic games while delivering a modern, AI-powered, responsive experience suitable for real-world use.

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16** (App Router)
- **React 18**  
- Retro-minimal custom CSS design  
- **TypeScript**

### **Backend**
- **Node.js + Express**  
- **MVC architecture**
- **RESTful API** for AI integration

### **AI & Machine Learning**
- **Gemini Flash** — Primary AI model for quiz generation
- Custom prompt engineering for educational content
- Document parsing (PDF, DOCX, TXT)
- Web scraping for URL content extraction
- YouTube transcript API integration

### **Database**
- **MongoDB** — Main database
- Collections for:
  - Users
  - Games / Ai detection
  - Beta access requests
  - AI credits tracking
  - License management

### **Real-Time**
- **WebSockets** for gameplay  
- **Redis** for pub/sub event synchronization up to 100 players in a room
- Real-time license validation for AI access

### **Authentication & Authorization**
- **NextAuth**  
- **JWT tokens**  
- **Google OAuth 2.0**  
- License-based AI access control
- Middleware for protected routes

### **PDF Generation**
- **JSPDF** for producing question/answer exports  

### **Avatars**
- **Dicebear** for character generation  

### **File Processing**
- **PDF parsing** libraries
- **Document converters** (DOCX to text)
- **YouTube Data API** for transcript extraction

### **Deployment**
- **Vercel** — Frontend (Next.js)
- **AWS EC2** — Backend server  
- **MongoDB Atlas** — Database hosting
- **Redis Cloud** — Redis hosting

---

## 🆕 What's New in v1.5.0

### Pregúntame Wizard (AI)
- ✅ AI-powered quiz generation from 4 input sources
- ✅ Beta access program with free 500 credits
- ✅ License-based access control
- ✅ Real-time credit tracking
- ✅ AI game cloning with credit system
- ✅ Dedicated `/create/wizard` landing page
- ✅ Integration with user dashboard
- ✅ Middleware protection for AI routes

### Enhanced Dashboard
- ✅ New "AI Access" tab
- ✅ Credit balance display
- ✅ License status indicators
- ✅ Beta access request modal
- ✅ AI game indicators

### Technical Improvements
- ✅ Next.js middleware for license validation
- ✅ MongoDB schema updates for AI features
- ✅ Redis integration for AI request queuing
- ✅ Enhanced error handling for AI operations
- ✅ SEO optimization for AI landing page

---

## 📖 Getting Started with AI

1. **Create an account** or **sign in**
2. Navigate to **Dashboard → AI Access**
3. **Request beta access** (instant approval for early users)
4. Receive **500 free AI credits**
5. Visit `/create/wizard/{your-license-key}`
6. Choose your input method and **generate your first AI quiz!**

---

## 🔐 License

Proprietary. All rights reserved.

---

## 👨‍💻 Creator

Built with passion by **WEB GALLERY** in Barcelona, Spain 🇪🇸

---

## 📞 Contact & Support

- **Website**: [preguntame.eu](https://preguntame.eu)
- **Email**: info@preguntame.eu
- **AI Beta Support**: info@preguntame.eu

---

**Pregúntame** — Where classic gaming meets modern AI-powered education 🎮🤖
