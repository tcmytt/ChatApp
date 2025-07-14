# API: Lấy danh sách phòng do user làm chủ (Own Rooms)

## Endpoint
```
GET /api/rooms/own?page=0&size=16
```

## Headers
```
Authorization: Bearer <jwt_token>
```

## Request Parameters
- `page` (int, optional, default = 0): Trang hiện tại (bắt đầu từ 0)
- `size` (int, optional, default = 16): Số lượng phòng mỗi trang

## Response (Success)
```json
{
  "result": "SUCCESS",
  "message": "User own rooms fetched successfully",
  "data": {
    "rooms": [
      {
        "id": 1,
        "name": "Gaming Room",
        "code": "ABC123",
        "maxMembers": 5,
        "creatorUsername": "john_doe",
        "memberCount": 3,
        "hasPassword": true
      },
      {
        "id": 2,
        "name": "Study Group",
        "code": "XYZ789",
        "maxMembers": 8,
        "creatorUsername": "john_doe",
        "memberCount": 2,
        "hasPassword": false
      }
    ],
    "page": 0,
    "size": 16,
    "totalElements": 2
  }
}
```

## Response (No rooms)
```json
{
  "result": "SUCCESS",
  "message": "User own rooms fetched successfully",
  "data": {
    "rooms": [],
    "page": 0,
    "size": 16,
    "totalElements": 0
  }
}
```

## Response (Error)
```json
{
  "result": "ERROR",
  "message": "User not found",
  "data": null
}
```

## Cách sử dụng ở frontend
- Gọi API này để lấy danh sách các phòng mà user hiện tại là chủ phòng (creator).
- Hỗ trợ phân trang giống các API phòng khác (`rooms`, `page`, `size`, `totalElements`).
- Hiển thị danh sách này ở trang "Your Own Rooms" hoặc tab "Phòng của tôi".
- Nếu không có phòng nào, hiển thị thông báo phù hợp.

## Ghi chú
- Chỉ trả về các trường frontend cần: id, name, code, maxMembers, creatorUsername, memberCount, hasPassword.
- Đảm bảo phân trang chính xác, hiệu quả.
- Nếu user chưa tạo phòng nào, trả về mảng rỗng và totalElements = 0. 