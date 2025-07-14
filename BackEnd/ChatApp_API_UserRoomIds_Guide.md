# API: Lấy danh sách ID các phòng user đã tham gia

## Endpoint
```
GET /api/rooms/user/ids
```

## Headers
```
Authorization: Bearer <jwt_token>
```

## Response (Success)
```json
{
  "result": "SUCCESS",
  "message": "User room IDs fetched successfully",
  "data": [1, 2, 5, 10]
}
```

## Response (User chưa tham gia phòng nào)
```json
{
  "result": "SUCCESS",
  "message": "User room IDs fetched successfully",
  "data": []
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
- Khi vào trang Public Rooms, gọi API này để lấy danh sách roomId đã tham gia.
- Khi render card phòng:
  - Nếu roomId nằm trong mảng trả về → cho vào phòng luôn (không cần xác nhận/mật khẩu)
  - Nếu roomId không nằm trong mảng → hiện modal nhập mật khẩu/xác nhận như logic cũ.

## Ghi chú
- Không cần phân trang, chỉ trả về mảng số roomId.
- Nếu user chưa tham gia phòng nào, trả về mảng rỗng.
- Số lượng phòng thường không quá lớn, API này rất nhẹ. 