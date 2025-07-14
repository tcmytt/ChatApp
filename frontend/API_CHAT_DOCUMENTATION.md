# ChatApp Chat API Documentation (Full)

## 1. WebSocket Chat (STOMP)

### Kết nối WebSocket
- **Endpoint:** `ws://localhost:8080/chat` (SockJS/STOMP)
- **Origin:** Cho phép mọi origin (dev)

### Gửi tin nhắn
- **Client gửi:** `/app/rooms/{roomId}/send`
- **Payload:**
```json
{
  "roomId": 1,
  "content": "Hello world!",         // Text hoặc URL file
  "contentType": "text"              // "text", "image", "video"
}
```
- **Server broadcast:** `/topic/rooms/{roomId}`
- **Payload:**
```json
{
  "id": 123,
  "roomId": 1,
  "userId": 5,
  "username": "john_doe",
  "avatarUrl": "/avatars/avatar1.png",
  "content": "Hello world!",
  "contentType": "text",
  "timestamp": "2024-07-13T12:34:56",
  "seenBy": [5]
}
```

### Đánh dấu đã đọc (seen)
- **Client gửi:** `/app/rooms/{roomId}/messages/{messageId}/seen`
- **Payload:**
```json
{
  "roomId": 1,
  "messageId": 123
}
```
- **Server broadcast:** `/topic/rooms/{roomId}` (gửi lại message đã cập nhật seenBy)

### Trạng thái online/offline
- **Server broadcast:** `/topic/rooms/{roomId}/status`
- **Payload:**
```json
{
  "userId": 5,
  "username": "john_doe",
  "avatarUrl": "/avatars/avatar1.png",
  "roomId": 1,
  "status": "online" // hoặc "offline"
}
```

---

## 2. REST APIs

### Lấy lịch sử tin nhắn
- **Endpoint:** `GET /api/rooms/{roomId}/messages?page=0&size=30`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
```json
{
  "result": "SUCCESS",
  "message": "Messages fetched successfully",
  "data": {
    "messages": [
      {
        "id": 123,
        "roomId": 1,
        "userId": 5,
        "username": "john_doe",
        "avatarUrl": "/avatars/avatar1.png",
        "content": "Hello world!",
        "contentType": "text",
        "timestamp": "2024-07-13T12:34:56",
        "seenBy": [5, 6]
      }
    ],
    "page": 0,
    "size": 30,
    "totalElements": 1
  }
}
```

### Xóa tin nhắn (chỉ creator phòng)
- **Endpoint:** `DELETE /api/rooms/{roomId}/messages/{messageId}/delete`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
```json
{
  "result": "SUCCESS",
  "message": "Message deleted successfully",
  "data": null
}
```

### Lấy danh sách thành viên phòng
- **Endpoint:** `GET /api/rooms/{roomId}/members`
- **Headers:** `Authorization: Bearer <jwt_token>`
- **Response:**
```json
{
  "result": "SUCCESS",
  "message": "Room members fetched successfully",
  "data": [
    {
      "userId": 5,
      "username": "john_doe",
      "avatarUrl": "/avatars/avatar1.png",
      "role": "creator", // hoặc "admin", "member"
      "online": true
    },
    {
      "userId": 6,
      "username": "alice",
      "avatarUrl": "/avatars/avatar2.png",
      "role": "member",
      "online": false
    }
  ]
}
```

---

## 3. Upload file chat (ảnh/video)

### Upload file
- **Endpoint:** `POST /api/upload`
- **Headers:** `Authorization: Bearer <jwt_token>`, `Content-Type: multipart/form-data`
- **Body:** file (.jpg/.png ≤ 5MB, .mp4 ≤ 50MB)
- **Response:**
```json
{
  "result": "SUCCESS",
  "message": "File uploaded successfully",
  "data": {
    "url": "/uploads/abc123.jpg"
  }
}
```
- **Sau khi upload thành công, gửi URL này qua WebSocket như một message có contentType = "image" hoặc "video"**

### Truy cập file upload
- **URL:** `http://localhost:8080/uploads/{filename}`
- **Có thể dùng trực tiếp cho thẻ `<img src=...>` hoặc `<video src=...>`

---

## 4. Lưu ý & Best Practice
- **Tất cả WebSocket và REST API đều yêu cầu JWT token.**
- **Chỉ thành viên phòng mới gửi/nhận tin nhắn, xem lịch sử, seen, member list, v.v.**
- **Chỉ creator phòng mới được xóa tin nhắn.**
- **File upload chỉ cho phép .jpg/.png/.mp4, validate kích thước.**
- **Online/offline status tự động broadcast khi user connect/disconnect WebSocket.**
- **Để xác định user có phải là owner phòng không:**
  - Lấy user info từ `/api/users/profile` (hoặc JWT)
  - So sánh với `creatorUsername` hoặc `creatorId` (nếu có) trả về từ API phòng
- **Member list:**
  - API trả về role (creator/admin/member) và trạng thái online/offline cho từng user
  - Frontend nên subscribe `/topic/rooms/{roomId}/status` để cập nhật realtime trạng thái online/offline
- **Nếu cần phân quyền UI:**
  - So sánh userId hiện tại với userId của member có role "creator" để xác định quyền owner

---

## 5. Ví dụ sử dụng với SockJS + StompJS (JS)
```javascript
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const socket = new SockJS('http://localhost:8080/chat');
const stompClient = Stomp.over(socket);

stompClient.connect({ Authorization: 'Bearer ' + token }, () => {
  // Subscribe nhận tin nhắn
  stompClient.subscribe('/topic/rooms/1', (msg) => {
    const message = JSON.parse(msg.body);
    // Xử lý message
  });
  // Subscribe nhận trạng thái online/offline
  stompClient.subscribe('/topic/rooms/1/status', (msg) => {
    const status = JSON.parse(msg.body);
    // Xử lý status
  });
  // Gửi tin nhắn
  stompClient.send('/app/rooms/1/send', {}, JSON.stringify({
    roomId: 1,
    content: 'Hello',
    contentType: 'text'
  }));
  // Đánh dấu đã đọc
  stompClient.send('/app/rooms/1/messages/123/seen', {}, JSON.stringify({
    roomId: 1,
    messageId: 123
  }));
});
``` 