# ChatApp Room Management API Documentation

## Base URL
```
http://localhost:8080
```

---

## 1. Tạo phòng chat
### `POST /api/rooms/create`
**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "Phòng Lập Trình",
  "password": "123456",      // Optional, 6 ký tự, có thể null
  "maxMembers": 10            // Số thành viên tối đa (1-10)
}
```
**Response (Success):**
```json
{
  "result": "SUCCESS",
  "message": "Room created successfully",
  "data": {
    "id": 1,
    "name": "Phòng Lập Trình",
    "code": "A1B2C3",
    "maxMembers": 10,
    "creatorUsername": "john_doe",
    "memberCount": 1
  }
}
```
**Response (Error):**
```json
{
  "result": "ERROR",
  "message": "Error message",
  "data": null
}
```

---

## 2. Tham gia phòng chat
### `POST /api/rooms/join`
**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "code": "A1B2C3",
  "password": "123456"   // Nếu phòng có password, bắt buộc nhập
}
```
**Response (Success):**
```json
{
  "result": "SUCCESS",
  "message": "Joined room successfully",
  "data": {
    "id": 1,
    "name": "Phòng Lập Trình",
    "code": "A1B2C3",
    "maxMembers": 10,
    "creatorUsername": "john_doe",
    "memberCount": 2
  }
}
```
**Response (Error):**
```json
{
  "result": "ERROR",
  "message": "Incorrect password",
  "data": null
}
```

---

## 3. Xóa phòng chat
### `DELETE /api/rooms/delete?roomId=<roomId>`
**Headers:**
```
Authorization: Bearer <jwt_token>
```
**Response (Success):**
```json
{
  "result": "SUCCESS",
  "message": "Room deleted successfully",
  "data": null
}
```
**Response (Error):**
```json
{
  "result": "ERROR",
  "message": "Only the room creator can delete the room",
  "data": null
}
```

---

## 4. Tìm kiếm phòng chat
### `GET /api/rooms/search?query=<text>&page=0&size=10`
**Headers:**
```
Authorization: Bearer <jwt_token>
```
**Response (Success):**
```json
{
  "result": "SUCCESS",
  "message": "Rooms fetched successfully",
  "data": {
    "rooms": [
      {
        "id": 1,
        "name": "Phòng Lập Trình",
        "code": "A1B2C3",
        "maxMembers": 10,
        "creatorUsername": "john_doe",
        "memberCount": 2
      },
      {
        "id": 2,
        "name": "Phòng Java",
        "code": "J4V4C0",
        "maxMembers": 5,
        "creatorUsername": "alice",
        "memberCount": 1
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 2
  }
}
```

---

## 5. Kick thành viên khỏi phòng
### `POST /api/rooms/kick?roomId=<roomId>&userId=<userId>`
**Headers:**
```
Authorization: Bearer <jwt_token>
```
**Response (Success):**
```json
{
  "result": "SUCCESS",
  "message": "User kicked successfully",
  "data": null
}
```
**Response (Error):**
```json
{
  "result": "ERROR",
  "message": "Only the room creator can kick members",
  "data": null
}
```

---

## 6. Quy tắc & Lưu ý
- **Tất cả endpoint đều yêu cầu JWT token ở header Authorization.**
- **Room code** là chuỗi 6 ký tự chữ hoa và số, duy nhất.
- **Chỉ creator mới được xóa phòng hoặc kick thành viên.**
- **Khi tham gia phòng có password, phải nhập đúng password.**
- **Tìm kiếm phòng hỗ trợ phân trang (page, size).**
- **memberCount** là số thành viên hiện tại trong phòng.

---

## 7. Ví dụ sử dụng với fetch (JS)
```javascript
// Tạo phòng
fetch('http://localhost:8080/api/rooms/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Phòng Test', maxMembers: 5 })
})
.then(res => res.json())
.then(console.log);

// Tham gia phòng
fetch('http://localhost:8080/api/rooms/join', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code: 'A1B2C3', password: '123456' })
})
.then(res => res.json())
.then(console.log);

// Tìm kiếm phòng
fetch('http://localhost:8080/api/rooms/search?query=java&page=0&size=10', {
  headers: { 'Authorization': 'Bearer ' + token }
})
.then(res => res.json())
.then(console.log);
``` 