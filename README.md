# DevCollab

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.17.1-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0.9-brightgreen)](https://www.mongodb.com/)

DevCollab is a full-featured **social collaboration backend application** designed to demonstrate **scalable, production-ready backend development** using Node.js, Express, and MongoDB. It includes features like user authentication, posts, comments, followers, and **real-time chat messaging**. The project emphasizes clean REST API design, proper data modeling, and complete API documentation.

You can explore the **Swagger API Docs** here: [API Docs](https://your-render-link.com/api-docs)  

Full source code: [GitHub Repository](https://github.com/kapuriajeet/devcollab)

---

## About Me

I am a backend-focused software developer specializing in building scalable, secure, and maintainable APIs using Node.js, Express, and MongoDB. I have experience designing database schemas, implementing authentication and authorization, handling file uploads, and optimizing backend systems for performance and reliability. My focus is on clean architecture, production-ready code, and API-first development, enabling frontend and mobile applications to integrate seamlessly with robust backend services.

---

## About DevCollab

DevCollab is a full-featured social collaboration backend application designed with a focus on modularity, scalability, and clean REST API architecture. Key features include:

- **Authentication & Authorization**
  - JWT-based auth
  - Register, login, refresh token, logout, delete account
- **User Profiles**
  - Customize username, avatar, bio, skills, and social links
  - Follow/unfollow other users
  - Get followers and following lists
- **Posts**
  - Create, fetch, and delete posts
  - Media uploads (images, videos)
  - Like/unlike posts
  - Fetch all posts or user-specific posts
- **Comments**
  - CRUD for comments
  - Like/unlike comments
  - Retrieve all comments for a post
- **Real-Time Chat Messaging**
  - Send and receive messages in real-time using WebSocket
  - Maintain message history for users
  - Scalable backend-ready chat module
    
---

## # Chat Messaging

The chat messaging feature is built to enable **real-time communication** between users. Key points:

- Built using **WebSocket** for real-time events
- Backend stores messages and allows fetching message history
- Supports one-to-one messaging and group messaging

## Tech Stack

- **Backend:** Node.js, Express  
- **Database:** MongoDB, Mongoose  
- **Authentication:** JWT  
- **File Uploads:** Multer + Cloudinary  
- **Real-Time Messaging:** WebSocket (Socket.IO)  
- **Documentation:** Swagger (OpenAPI 3.0)  
- **Environment Management:** dotenv  

---

