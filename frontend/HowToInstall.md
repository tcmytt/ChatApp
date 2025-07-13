npx create-next-app@latest frontend -ts

npx shadcn@latest init

npm install

npm run dev

npm install @stomp/stompjs

Note :
Đề xuất thực hiện theo TodoList
Tôi đề xuất thực hiện theo thứ tự ưu tiên sau:
Phase 1: Setup & Foundation (Ưu tiên cao)
Cấu hình ShadCN UI components - Cài đặt các components cần thiết
Tạo cấu trúc thư mục - Tổ chức /components, /lib, /public/avatars
Setup API utilities - Tạo /lib/api.ts và /lib/stomp.ts
Cập nhật layout chính - Header với avatar, dark/light toggle
Phase 2: Authentication (Ưu tiên cao)
Login page (/app/login/page.tsx)
Signup page (/app/signup/page.tsx)
Profile page (/app/profile/page.tsx)
Phase 3: Room Management (Ưu tiên trung bình)
Rooms list (/app/rooms/page.tsx)
Create room (/app/rooms/create/page.tsx)
Join room (/app/rooms/join/page.tsx)
Phase 4: Chat Interface (Ưu tiên cao)
Chat component (/components/Chat.tsx)
Chat page (/app/chat/[roomId]/page.tsx)
WebSocket integration
Phase 5: Advanced Features (Ưu tiên thấp)
Notifications (/components/Notification.tsx)
Admin dashboard (/app/admin/page.tsx)
Error handling (/app/error.tsx, /app/loading.tsx)