# Cập nhật Room API - Thêm trường hasPassword

## Vấn đề
Frontend không thể phân biệt được phòng nào có mật khẩu, phòng nào không có mật khẩu. Hiện tại đang dùng `maxMembers > 1` để giả định phòng có mật khẩu, nhưng điều này không chính xác.

## Giải pháp
Thêm trường `hasPassword` vào tất cả API response trả về Room object.

## Thay đổi đã thực hiện

### 1. Cập nhật RoomResponse DTO
```java
public record RoomResponse(
        Long id,
        String name,
        String code,
        Integer maxMembers,
        String creatorUsername,
        Integer memberCount,
        Boolean hasPassword) {
}
```

### 2. Logic xử lý hasPassword
- `hasPassword: true` = Phòng có mật khẩu, cần nhập mật khẩu để vào
- `hasPassword: false` = Phòng không có mật khẩu, có thể vào trực tiếp (sau khi xác nhận)

Logic tính toán:
```java
room.getPasswordHash() != null && !room.getPasswordHash().isBlank()
```

### 3. Các API endpoints đã cập nhật

#### GET /api/rooms/search
Trả về danh sách phòng với trường `hasPassword`

**Response:**
```json
{
  "result": "SUCCESS",
  "message": "Rooms fetched successfully",
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
        "creatorUsername": "jane_smith",
        "memberCount": 2,
        "hasPassword": false
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 2
  }
}
```

#### GET /api/rooms/{roomId}
Trả về thông tin phòng với trường `hasPassword`

**Response:**
```json
{
  "result": "SUCCESS",
  "message": "Room details fetched successfully",
  "data": {
    "id": 1,
    "name": "Gaming Room",
    "code": "ABC123",
    "maxMembers": 5,
    "creatorUsername": "john_doe",
    "memberCount": 3,
    "hasPassword": true
  }
}
```

#### POST /api/rooms/create
Trả về phòng mới tạo với trường `hasPassword`

**Request:**
```json
{
  "name": "New Gaming Room",
  "password": "123456",
  "maxMembers": 5
}
```

**Response:**
```json
{
  "result": "SUCCESS",
  "message": "Room created successfully",
  "data": {
    "id": 3,
    "name": "New Gaming Room",
    "code": "DEF456",
    "maxMembers": 5,
    "creatorUsername": "john_doe",
    "memberCount": 1,
    "hasPassword": true
  }
}
```

#### POST /api/rooms/join
Trả về phòng sau khi join với trường `hasPassword`

**Request:**
```json
{
  "code": "ABC123",
  "password": "123456"
}
```

**Response:**
```json
{
  "result": "SUCCESS",
  "message": "Joined room successfully",
  "data": {
    "id": 1,
    "name": "Gaming Room",
    "code": "ABC123",
    "maxMembers": 5,
    "creatorUsername": "john_doe",
    "memberCount": 4,
    "hasPassword": true
  }
}
```

#### GET /api/rooms/user (NEW)
Trả về tất cả phòng mà user đã tham gia (bao gồm phòng tự tạo và phòng đã join)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success):**
```json
{
  "result": "SUCCESS",
  "message": "User rooms fetched successfully",
  "data": [
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
      "creatorUsername": "jane_smith",
      "memberCount": 2,
      "hasPassword": false
    }
  ]
}
```

**Response (Error):**
```json
{
  "result": "ERROR",
  "message": "User not found",
  "data": null
}
```

## Frontend Usage

### 1. Hiển thị icon khóa cho phòng có mật khẩu
```typescript
const RoomCard = ({ room }: { room: Room }) => {
  return (
    <div className="room-card">
      <div className="room-header">
        <h3>{room.name}</h3>
        {room.hasPassword && (
          <span className="lock-icon">🔒</span>
        )}
      </div>
      <p>Code: {room.code}</p>
      <p>Members: {room.memberCount}/{room.maxMembers}</p>
    </div>
  );
};
```

### 2. Logic join room
```typescript
const handleJoinRoom = async (room: Room) => {
  if (room.hasPassword) {
    // Hiển thị modal nhập mật khẩu
    setShowPasswordModal(true);
    setSelectedRoom(room);
  } else {
    // Join trực tiếp
    try {
      const response = await roomApi.joinRoom({
        code: room.code,
        password: undefined
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  }
};
```

### 3. Modal nhập mật khẩu
```typescript
const PasswordModal = ({ room, onJoin }: { room: Room, onJoin: (password: string) => void }) => {
  const [password, setPassword] = useState('');
  
  return (
    <div className="modal">
      <h3>Enter password for {room.name}</h3>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter 6-digit password"
      />
      <button onClick={() => onJoin(password)}>
        Join Room
      </button>
    </div>
  );
};
```

### 4. Lấy danh sách phòng của user (NEW)
```typescript
const UserRooms = () => {
  const [userRooms, setUserRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRooms = async () => {
      try {
        const response = await roomApi.getUserRooms();
        setUserRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch user rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRooms();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-rooms">
      <h2>My Rooms</h2>
      {userRooms.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};
```

## Timeline
- ✅ **Ưu tiên cao:** Cập nhật API search rooms trước
- ✅ **Sau đó:** Cập nhật các API khác trả về Room object
- ✅ **Hoàn thành:** Tất cả API đã được cập nhật
- ✅ **NEW:** Thêm GET /api/rooms/user endpoint

## Testing
1. Tạo phòng có mật khẩu → `hasPassword: true`
2. Tạo phòng không có mật khẩu → `hasPassword: false`
3. Search rooms → Kiểm tra `hasPassword` field
4. Join room → Kiểm tra `hasPassword` field
5. Get room details → Kiểm tra `hasPassword` field
6. **NEW:** Get user rooms → Kiểm tra danh sách phòng và `hasPassword` field

## Lưu ý
- Trường `hasPassword` là `Boolean`, không phải `boolean` primitive để hỗ trợ null values nếu cần
- Logic tính toán dựa trên `passwordHash` field trong database
- Tất cả API trả về Room object đã được cập nhật
- Frontend có thể sử dụng ngay lập tức để hiển thị UI phù hợp
- **NEW:** API `/api/rooms/user` trả về danh sách phòng sắp xếp theo thời gian tham gia mới nhất 