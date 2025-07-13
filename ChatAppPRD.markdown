# Product Requirements Document (PRD) - Real-Time Chat Web App

## 1. Overview
### 1.1 Purpose
A real-time chat web application allowing users to register, log in, create chat rooms with unique 6-digit codes and optional passwords, join rooms, chat (text, .jpg/.png images, .mp4 videos), and manage rooms. Room owners can kick members and delete rooms/messages. Admins have a dashboard for monitoring and management. The app runs locally for 50-100 concurrent users, designed for CV purposes.

### 1.2 Scope
- **Backend**: Spring Boot, WebSocket (STOMP), JWT, PostgreSQL.
- **Frontend**: Next.js 14, TypeScript, ShadCN UI, TailwindCSS (dark/light mode, neon style).
- **Environment**: Local deployment, with Docker Compose added post-development.
- **Users**: Regular users (create/join rooms, chat, view dashboard stats) and admins (manage rooms/users, view dashboard).

### 1.3 Assumptions
- Images/videos stored locally (URLs in DB), supporting .jpg/.png (max 5MB) and .mp4 (max 50MB).
- Avatars stored as static files in `/public/avatars` (Next.js) named `avatar1.jpg` to `avatar10.jpg`.
- Single language (default: Vietnamese).
- No logging, analytics, or advanced security (CV project).
- Message history stored permanently, deleted when room is deleted.

## 2. Functional Requirements

### 2.1 User Management
- **Registration**:
  - Input: username, email, password.
  - Select avatar from 10 predefined images (`avatar1.jpg` to `avatar10.jpg`).
  - Store user data in DB, hash password, use JWT for authentication.
- **Login**:
  - Input: email, password.
  - Return JWT for session management.
- **Profile**:
  - View: username, email, avatar.
  - Update: username, password, avatar (from 10 predefined images).
- **Roles**:
  - Regular users: Create/join rooms, chat, view dashboard stats.
  - Room owners: Kick members, delete rooms/messages.
  - Admins: Delete rooms/users, access full dashboard.

### 2.2 Room Management
- **Create Room**:
  - Input: room name, optional 6-character password (letters/numbers), member limit (1-10).
  - Generate unique 6-digit code.
  - Owners can kick members, delete rooms/messages.
- **Join Room**:
  - Input: 6-digit code, password (if required).
  - On incorrect password: red border on input, shake animation, "Incorrect password" message.
  - Display: room name, owner, online/offline member count.
- **Delete Room**:
  - Owners or admins can delete.
  - Deletes all related messages.
- **Search Rooms**:
  - Search by: room ID, name, or owner username.
  - Paginated results (10 rooms/page).
- **Kick Members**:
  - Owners can remove members from rooms.

### 2.3 Chat
- **Send/Receive Messages**:
  - Support: text, images (.jpg/.png, max 5MB), videos (.mp4, max 50MB).
  - Display images/videos directly in chat (using `<img>`/`<video>` tags).
  - Error on invalid format or size: display error message.
- **Message History**:
  - Load 30 messages initially, load more on scroll up.
  - Stored permanently, deleted when room is deleted.
- **Delete Messages**:
  - Only room owners can delete messages.
- **Message Styling**:
  - Others' messages: left-aligned.
  - User's messages: right-aligned.
  - Show timestamp and "seen" checkmark (tracked via user_ids).
- **Seen Status**:
  - Display checkmark when message is viewed by users.
  - Store seen user_ids in DB.

### 2.4 Notifications
- **Popup**:
  - Neon-style popup (bottom-right, 1-2s) for new messages.
  - Matches dark/light mode theme.
- **Unread Count**:
  - Display unread message count per room in room list.

### 2.5 Admin Dashboard
- **Statistics**:
  - Display: total users, rooms, active rooms.
- **Management**:
  - Delete rooms or user accounts.

## 3. Non-Functional Requirements
- **Performance**: Support 50-100 concurrent users locally.
- **UI/UX**:
  - Dark/light mode with neon color scheme (modern, youth-friendly).
  - Responsive design using ShadCN UI and TailwindCSS.
- **Storage**: Messages stored permanently, deleted with room; images/videos stored locally (URLs in DB).
- **Security**: Basic JWT authentication (no advanced security for CV project).

## 4. Technical Requirements
- **Backend**:
  - Framework: Spring Boot (Java 17).
  - Authentication: Spring Security (JWT).
  - Database: PostgreSQL with tables:
    - `Users`: id, username, password_hash, email, avatar_url.
    - `Rooms`: id, name, creator_id, code, password_hash (null if no password), max_members, created_at.
    - `Room_members`: room_id, user_id, joined_at, role (admin/creator/member).
    - `Messages`: id, room_id, user_id, content, content_type (text/image/video), timestamp, seen_by (user_ids).
  - Real-time: Spring WebSocket (STOMP) for chat, notifications, online/offline status, seen status.
  - File Upload: Handle .jpg/.png (5MB), .mp4 (50MB); store URLs in DB; reject invalid formats/sizes with error message.
- **Frontend**:
  - Framework: Next.js 14, TypeScript.
  - UI: ShadCN UI, TailwindCSS (dark/light mode, neon colors).
  - Avatars: 10 static images in `/public/avatars` (avatar1.jpg to avatar10.jpg).
  - Real-time: STOMP client for WebSocket.
- **Storage**: Local server for images/videos (URLs in DB).
- **Deployment**: Local (direct); Docker Compose added post-development.

## 5. User Interface
- **Layout**:
  - Header: Avatar, username, login/logout.
  - Main Content: Personal rooms, public rooms (paginated, 10 rooms/page), chat area, dashboard.
- **Pages**:
  - Login/Signup: Email, password; avatar selection on signup.
  - Create Room: Name, optional 6-character password, member limit.
  - Join Room: Code, password (if required); error handling (red border, shake, message).
  - Profile: Update username, password, avatar.
  - Search: Filter by room ID, name, owner (paginated).
  - Chat: Message history (30 messages, load more on scroll), text/image/video input, timestamps, seen checkmark, left/right alignment.
  - Admin Dashboard: Stats (users, rooms, active rooms), management tools.
- **Notifications**: Neon popup (bottom-right, 1-2s) for new messages, themed for dark/light mode.
- **Room List**: Show unread message count per room.

## 6. Development Milestones
1. **Backend Setup**:
   - Initialize Spring Boot project (Web, WebSocket, Security, JPA).
   - Configure PostgreSQL, define entities (Users, Rooms, Room_members, Messages).
   - Implement APIs: signup, login, profile, room creation/join/search, file upload.
   - Setup WebSocket (STOMP): chat, notifications, status, seen checkmark.
   - Handle file uploads (.jpg/.png/.mp4, 5MB/50MB) with error messages.
   - Implement pagination for room search (10 rooms/page).
   - Dashboard APIs for admin.
2. **Frontend Setup**:
   - Initialize Next.js project (TypeScript), ShadCN UI, TailwindCSS (dark/light mode, neon).
   - Store 10 avatars in `/public/avatars` (avatar1.jpg to avatar10.jpg).
   - Build layout: header, room lists (paginated), chat, dashboard.
   - Implement pages: login, signup, create room, join room, profile, search.
   - Build chat UI: messages (text/image/video), timestamps, seen checkmark, alignment, file upload.
   - Add password error handling (red border, shake, message).
   - Implement neon popup for notifications.
   - Show unread message count in room list.
   - Connect to WebSocket (STOMP client).
3. **Integration**:
   - Link frontend to backend APIs and WebSocket.
   - Test JWT authentication.
4. **Testing**:
   - Test features: signup, room creation (with password), join, chat (text/image/video), search, notifications, seen status.
   - Test error handling: file size/format, password errors.
5. **Deployment**:
   - Run locally (direct).
   - Add Docker Compose post-development.