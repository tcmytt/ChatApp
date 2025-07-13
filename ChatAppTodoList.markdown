# To-Do List for Building Real-Time Chat Web App

This to-do list outlines the steps to build a real-time chat web application with Spring Boot (backend) and Next.js 14 (frontend), as specified in the PRD. The app supports user registration, room creation with passwords, real-time chat (text, .jpg/.png, .mp4), notifications, and an admin dashboard, running locally for 50-100 users.

## 1. Backend Setup (Spring Boot)
- [ ] **Initialize Project**:
  - Create a Spring Boot project (Java 17) with dependencies: Spring Web, WebSocket, Security, JPA, PostgreSQL.
  - Configure `application.properties` for PostgreSQL connection.
- [ ] **Database Schema**:
  - Define entities:
    - `Users`: id, username, password_hash, email, avatar_url.
    - `Rooms`: id, name, creator_id, code (6-digit), password_hash (null if no password), max_members (1-10), created_at.
    - `Room_members`: room_id, user_id, joined_at, role (admin/creator/member).
    - `Messages`: id, room_id, user_id, content, content_type (text/image/video), timestamp, seen_by (user_ids).
  - Create corresponding JPA repositories.
- [ ] **User Management APIs**:
  - Implement `/signup`: Accept username, email, password, avatar_url; hash password; return JWT.
  - Implement `/login`: Accept email, password; return JWT.
  - Implement `/profile`: GET to view username, email, avatar; PUT to update username, password, avatar.
- [ ] **Room Management APIs**:
  - Implement `/rooms/create`: Accept name, optional 6-character password (letters/numbers), max_members; generate unique 6-digit code.
  - Implement `/rooms/join`: Accept code, password (if required); validate password; return error if incorrect.
  - Implement `/rooms/delete`: Allow owner/admin to delete room and associated messages.
  - Implement `/rooms/search`: Search by ID, name, or owner username; return paginated results (10 rooms/page).
  - Implement `/rooms/kick`: Allow owner to remove a member.
- [ ] **Chat Functionality**:
  - Configure WebSocket with STOMP (endpoint: `/chat`).
  - Implement message sending/receiving: text, images (.jpg/.png, max 5MB), videos (.mp4, max 50MB).
  - Implement file upload endpoint: Validate format (.jpg/.png/.mp4) and size; store files locally, save URLs in DB.
  - Implement message deletion (owner only).
  - Implement seen status: Track user_ids in `seen_by`; broadcast updates via WebSocket.
  - Implement history loading: Return 30 messages initially, support pagination for older messages.
- [ ] **Notifications**:
  - Send WebSocket messages for new messages in rooms the user is part of.
- [ ] **Admin Dashboard APIs**:
  - Implement `/admin/stats`: Return total users, rooms, active rooms.
  - Implement `/admin/delete-user`: Allow admin to delete user accounts.
  - Implement `/admin/delete-room`: Allow admin to delete rooms.

## 2. Frontend Setup (Next.js 14)
- [ ] **Initialize Project**:
  - Create a Next.js 14 project with TypeScript.
  - Install dependencies: ShadCN UI, TailwindCSS, STOMP client (`@stomp/stompjs`).
  - Configure TailwindCSS for dark/light mode with neon color scheme.
- [ ] **Static Assets**:
  - Add 10 avatar images (`avatar1.jpg` to `avatar10.jpg`) to `/public/avatars`.
- [ ] **Layout**:
  - Create main layout: header (avatar, username, login/logout), room lists (personal/public, paginated), chat area, dashboard.
  - Implement responsive design with ShadCN UI and TailwindCSS.
- [ ] **Pages**:
  - Create `/login`: Form for email, password; redirect to room list on success.
  - Create `/signup`: Form for username, email, password, avatar selection (10 images); redirect to room list.
  - Create `/profile`: Display username, email, avatar; form to update username, password, avatar.
  - Create `/rooms/create`: Form for name, optional 6-character password, member limit.
  - Create `/rooms/join`: Form for code, password (if required); show red border, shake animation, and "Incorrect password" message on error.
  - Create `/rooms/search`: Input for ID, name, or owner username; display paginated results (10 rooms/page).
  - Create `/chat/[roomId]`: Chat interface with message history, input, and member list.
  - Create `/admin`: Dashboard with stats (users, rooms, active rooms) and management tools (delete rooms/users).
- [ ] **Chat Interface**:
  - Display 30 messages (text, .jpg/.png, .mp4) with timestamps and seen checkmarks.
  - Align messages: others (left), user (right).
  - Support image/video display using `<img>`/`<video>` tags.
  - Implement file upload input: Restrict to .jpg/.png (5MB), .mp4 (50MB); show error for invalid format/size.
  - Add buttons for owners: kick members, delete messages.
  - Load older messages (30 at a time) on scroll up.
- [ ] **Notifications**:
  - Implement neon-style popup (bottom-right, 1-2s) for new messages, styled for dark/light mode.
  - Display unread message count per room in room list.
- [ ] **WebSocket Integration**:
  - Connect to `/chat` endpoint using STOMP client.
  - Subscribe to room-specific channels for messages, seen status, and member updates.
  - Handle online/offline status updates for room members.

## 3. Integration
- [ ] **Connect Frontend to Backend**:
  - Configure API calls with JWT authentication (include token in headers).
  - Test API endpoints: signup, login, profile, room management, file upload.
  - Test WebSocket connection for chat, notifications, and status updates.
- [ ] **Error Handling**:
  - Handle file upload errors (invalid format/size) with user-facing messages.
  - Handle room password errors with red border, shake animation, and "Incorrect password" message.

## 4. Testing
- [ ] **Unit Tests**:
  - Test backend APIs: signup, login, room creation/join/search, file upload.
  - Test WebSocket: message sending/receiving, seen status, notifications.
  - Test file upload validation (.jpg/.png/.mp4, size limits).
- [ ] **Integration Tests**:
  - Test full flow: register, create room (with/without password), join, chat (text/image/video), kick, delete.
  - Test pagination for room search and message history.
  - Test admin dashboard: stats, delete rooms/users.
- [ ] **UI Tests**:
  - Test responsive design across devices.
  - Test dark/light mode and neon styling.
  - Test password error handling (red border, shake, message).
  - Test notification popups and unread message counts.

## 5. Deployment
- [ ] **Local Deployment**:
  - Run backend (Spring Boot) and frontend (Next.js) locally.
  - Verify functionality for 50-100 concurrent users.
- [ ] **Docker Setup** (Post-Development):
  - Create Dockerfile for backend (Spring Boot).
  - Create Dockerfile for frontend (Next.js).
  - Create Docker Compose file to run PostgreSQL, backend, and frontend together.