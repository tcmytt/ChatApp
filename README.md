# ChatApp - Real-time Chat Application

## Overview
ChatApp is a modern real-time chat application built with Next.js 15 (frontend) and Spring Boot (backend). It features JWT authentication, real-time messaging via WebSocket/STOMP, room management, and rich media support (images, videos). The UI is designed with a neon theme using Tailwind CSS and shadcn/ui for a beautiful, responsive experience.

---

## Table of Contents
1. [Features](#features)
2. [Backend Overview](#backend-overview)
3. [Frontend Overview](#frontend-overview)
4. [Main Functionalities](#main-functionalities)
    - [User Registration](#user-registration)
    - [User Login](#user-login)
    - [Room Creation](#room-creation)
    - [Room Search & Join](#room-search--join)
    - [Chat Messaging (Text, Image, Video)](#chat-messaging-text-image-video)
    - [Room Management](#room-management)
    - [User Profile & Settings](#user-profile--settings)
5. [Screenshots](#screenshots)
6. [Developer Info](#developer-info)

---

## Features
- **JWT Authentication**: Secure login and registration.
- **Real-time Chat**: Instant messaging using WebSocket (STOMP protocol).
- **Media Messaging**: Send and receive images and videos in chat.
- **Room Management**: Create, search, join, and manage chat rooms (public/private).
- **Modern UI/UX**: Neon-themed, responsive design with dark/light mode.
- **Admin Controls**: Room owners can manage members and delete rooms.
- **Pagination & Filtering**: Efficient room and message browsing.

---

## Backend Overview
- **Framework**: Spring Boot (Java)
- **Authentication**: JWT-based, secure endpoints
- **WebSocket**: Native WebSocket with STOMP for real-time messaging
- **REST APIs**: For user, room, and message management
- **Media Upload**: REST endpoint for image/video upload, static resource serving
- **Database**: (Describe your DB, e.g., MySQL/PostgreSQL/MongoDB)

---

## Frontend Overview
- **Framework**: Next.js 15 (React, TypeScript)
- **UI Library**: Tailwind CSS, shadcn/ui
- **State Management**: React Context, hooks
- **WebSocket Client**: Native WebSocket for real-time chat
- **Responsive Design**: Mobile-first, dark/light mode

---

## Main Functionalities

### 1. User Registration
- Users can sign up with username, email, and password.
- Validation and error handling for user-friendly experience.

**[Insert registration screenshot here]**

---

### 2. User Login
- Secure login with JWT authentication.
- Redirects to chat rooms upon successful login.

**[Insert login screenshot here]**

---

### 3. Room Creation
- Users can create new chat rooms (public or private with password).
- Set room name, password (optional), and max members.

**[Insert create room screenshot here]**

---

### 4. Room Search & Join
- Browse and search for public rooms.
- Filter by public/private.
- Join rooms directly or via password (for private rooms).
- Pagination for efficient browsing.

**[Insert room search/join screenshot here]**

---

### 5. Chat Messaging (Text, Image, Video)
- Real-time text messaging in rooms.
- Upload and send images (JPG, PNG, max 5MB) and videos (MP4, max 50MB).
- Media is displayed inline in the chat.
- Optimistic UI for instant feedback.

**[Insert chat with media screenshot here]**

---

### 6. Room Management
- "Your Rooms": List of rooms the user has joined.
- "Own Rooms": List of rooms the user created (owner).
- Room owners can delete rooms and manage (kick) members.
- Member list and management modal for each room.

**[Insert room management screenshot here]**

---

### 7. User Profile & Settings
- View and update user profile (avatar, username, email, password).
- Theme toggle (dark/light mode).

**[Insert profile/settings screenshot here]**

---

## Screenshots
- Please see the above sections for placeholders to insert actual screenshots of each feature.

---

## Developer Info
- **Author**: Nguyễn Vũ Hiệp
- **Phone**: 0789388656
- **Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Spring Boot, WebSocket, JWT

---

## Notes
- If you need to add more features or screenshots, please let me know!
- For any questions or contributions, feel free to contact the developer. 