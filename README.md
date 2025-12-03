# DevCollab — Real-Time Developer Collaboration Backend

DevCollab is a production-grade backend built using **Node.js, Express, MongoDB, Mongoose, JWT Authentication, Socket.io**, and advanced backend engineering concepts. It powers a real-time developer collaboration platform with features such as user authentication, workrooms, posts, comments, reactions, notifications, and more.

This backend was engineered to practice clean architecture, modular code organization, scalable API design, and industry-standard best practices.

---

## 🚀 Features

### **1. Authentication & Users**

* JWT-based authentication (access + refresh tokens)
* Role-based user permissions
* User profiles with Cloudinary image uploads
* Secure password hashing using bcrypt

### **2. Workrooms**

* Create and manage collaborative workrooms
* Add/remove collaborators
* Admin-level controls inside each room
* Real-time events using Socket.io

### **3. Posts & Comments**

* Create posts inside workrooms
* Add comments and nested replies
* Like/unlike posts and comments using `$addToSet` / `$pull`
* Pagination using cursor-based pagination

### **4. Notifications System**

* Real-time notifications using Socket.io
* Database-persisted notifications
* Event-based triggers for likes, comments, and room updates

### **5. File Uploads**

* Cloudinary integration for image/file uploads
* Multer middleware for parsing form-data

### **6. Production Ready**

* Environment configuration for dev & prod
* Error handling middleware
* Security best practices (helmet, rate-limiter, CORS config)
* Modular folder structure for scalability

---

## 🏗️ Tech Stack

### **Backend**

* Node.js
* Express.js
* Mongoose (MongoDB ODM)
* Socket.io
* JWT
* Cloudinary
* Multer

### **Database**

* MongoDB Atlas

### **Dev Tools**

* Nodemon
* Postman / ThunderClient
* Swagger (Upcoming)

---

## 📁 Folder Structure

```
DevCollab/
│
├── config/
│   ├── cloudinary.js
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── userProfileController.js
│   ├── workroomController.js
│   ├── postController.js
│   └── notificationController.js
│
├── middlewares/
│   ├── isAuthenticated.js
│   ├── upload.js
│
│
├── models/
│   ├── User.js
│   ├── UserProfile.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Workroom.js
│   ├── Notification.js
│   
│
├── routes/
│   ├── authRoutes.js
│   ├── userProfileRoutes.js
│   ├── workroomRoutes.js
│   ├── postRoutes.js
│   └── notificationRoutes.js
│
├── utils/
│   ├── fileHelper.js
│   ├── asyncHandler.js
│   └── socket.js
│
├── .env
├── package.json
├── server.js
└── README.md
```

---

## 🔐 Authentication Flow

* User logs in → receives Access + Refresh tokens
* Access token used for all protected routes
* Refresh token automatically rotates

---

## 🔄 Realtime Events

Using **Socket.io**, DevCollab supports:

* Live workroom updates
* New posts & comments pushed instantly
* Likes/comments notifications

---

## 📚 API Documentation

Swagger documentation will be available soon.
Hosted Link: *coming soon*

---

## 📦 Installation & Setup

### **1. Clone the repository**

```
git clone https://github.com/kapuriajeet/DevCollab.git
cd DevCollab
```

### **2. Install dependencies**

```
npm install
```

### **3. Configure environment variables**

Create a `.env` file:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5000
```

### **4. Start server**

```
npm run dev
```

Backend now runs on:

```
http://localhost:5000
```

---

## 🧪 Testing

Use Postman/ThunderClient to test all API endpoints.
Swagger UI documentation will soon be hosted for easy testing.

---

## 🌟 Future Roadmap

* Swagger Documentation (hosted online)
* Public API versioning
* Caching with Redis
* CI/CD using GitHub Actions
* Queue processing using BullMQ
* Containerized deployment (Docker + Kubernetes)

---

## 🤝 Contributions

Contributions are welcome! Create an issue or submit a PR.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgements

* Built as part of a full backend engineering learning journey
* Guided with industry practices & real-world system design principles

---

If you like this project, 🌟 **star the repository** on GitHub!
