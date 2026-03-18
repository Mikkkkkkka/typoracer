# Typoracer - Design Document

## 1. Overview

The typing competition platform consists of two separate web applications:

### 🎮 Game Client (SPA)
- High-performance typing game
- Focus on responsiveness and low latency
- Built for real-time interaction

### 🌐 Community Platform (SSR)
- Social and content layer
- Forum, user profiles, texts (like beatmaps)
- Server-side rendered using templates

---

## 2. High-Level Architecture

```
                +----------------------+
                |   Community Server   |
                |  (Nest.js + SSR)     |
                +----------+-----------+
                           |
                           | REST API / Auth / Content
                           |
                +----------v-----------+
                |      Backend API     |
                | (shared or separate) |
                +----------+-----------+
                           |
          +----------------+----------------+
          |                                 |
+---------v---------+             +---------v---------+
|   Game Client     |             | Community Frontend|
|   (Angular SPA)   |             | (SSR Templates)   |
+-------------------+             +-------------------+
```

---

## 3. Game Client (Angular SPA)

### Goal
Provide a fast and smooth typing experience.

### Functional Requirements
- Text selection
- Real-time typing
- Metrics:
  - WPM
  - Accuracy
  - Errors
- Modes:
  - Practice
  - Competitive (optional)
- Send results to server

### Non-Functional Requirements
- Minimal input latency
- No UI freezes at high typing speeds
- Efficient rendering

### Technical Choices
- Angular (OnPush change detection)
- RxJS for input handling
- Local state management
- Optional WebSocket support

### Core Modules
- TypingEngine
- TimerService
- StatsCalculator
- InputHandler

---

## 4. Community Platform (Nest.js + SSR)

### Goal
Manage users, content, and social features.

### Features

#### Users
- Registration / Login
- Profile
- Game history
- Statistics

#### Texts
- CRUD operations
- Tags / categories
- Rating system
- Moderation (optional)

#### Forum
- Threads
- Comments
- Likes / replies

#### Statistics
- Leaderboards
- User history
- Best scores

### Technologies
- Nest.js
- Template engine (Handlebars / EJS / Pug)
- PostgreSQL
- Prisma or TypeORM

### Modules
- AuthModule
- UserModule
- TextModule
- ResultModule
- ForumModule

---

## 5. API Design

### Auth
POST /auth/register  
POST /auth/login  

### Texts
GET /texts  
GET /texts/:id  
POST /texts  

### Results
POST /results  
GET /users/:id/results  

### Leaderboard
GET /leaderboard  

---

## 6. Data Model (Simplified)

User
- id
- username
- password_hash

Text
- id
- content
- author_id
- created_at

Result
- id
- user_id
- text_id
- wpm
- accuracy
- created_at

ForumPost
- id
- title
- content
- author_id

---

## 7. Key Decisions

- Separate SPA and SSR apps
- Shared or unified backend API
- Client-side performance prioritized
- SSR used for simplicity and SEO

---

## 8. Definition of Done (DoD)

### Game Client
- User can select text
- Typing works smoothly
- WPM and accuracy calculated
- Results sent to server
- No UI lag

### Community Platform
- Auth works
- Profile page exists
- Text creation available
- Text list available
- Leaderboard exists
- SSR rendering works

### Integration
- Game client fetches texts
- Results stored
- Auth shared (JWT/cookies)

### Quality
- No critical bugs
- Stable database
- Working API
- Deployment instructions exist

---

## 9. Future Improvements

- Anti-cheat system
- Multiplayer (WebSocket)
- Ranking system (ELO)
- Themes / customization
- Keyboard layout support
- Error analytics
