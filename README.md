# ChatApp

Ứng dụng chat full-stack sử dụng Node.js, Express, MongoDB và React.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Kiến trúc dự án](#kiến-trúc-dự-án)
- [Công nghệ](#công-nghệ)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Scripts](#scripts)
- [Realtime Socket.IO](#realtime-socketio)
- [Lỗi thường gặp](#lỗi-thường-gặp)

## Tổng quan

ChatApp gồm 2 phần:

- Backend API: Express + MongoDB, xác thực bằng Access Token và Refresh Token.
- Frontend Web: React + Vite + TypeScript, quản lý state bằng Zustand.

## Tính năng

- Đăng ký, đăng nhập, đăng xuất tài khoản.
- Tự động làm mới access token khi hết hạn.
- Quản lý danh sách bạn bè và lời mời kết bạn.
- Tạo và hiển thị cuộc trò chuyện direct/group.
- Gửi tin nhắn direct và group.
- Cập nhật tin nhắn realtime cho cả 2 phía bằng Socket.IO.
- Giao diện chat theo layout sidebar + chat window.

## Công nghệ

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- Socket.IO
- JWT + Cookie Parser

### Frontend

- React + TypeScript
- Vite
- React Router
- Zustand
- Socket.IO Client

## Cài đặt nhanh

```bash
git clone https://github.com/your-username/ChatApp.git
cd ChatApp

cd backend
npm install

cd ../frontend
npm install
```

Nếu gặp lỗi peer dependency khi cài frontend, chạy:

```bash
cd frontend
npm install --legacy-peer-deps
```

## Biến môi trường

### Backend

Tạo file .env trong thư mục backend với nội dung:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/chatapp
ACCESS_TOKEN_SECRET=replace_with_your_secret
NODE_ENV=development
```

### Frontend

Tạo file .env trong thư mục frontend với nội dung:

```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

## Chạy ứng dụng

Mở 2 terminal:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Địa chỉ mặc định:

- Backend: http://localhost:5001
- Frontend: http://localhost:5173

## Realtime Socket.IO

- Backend khởi tạo Socket.IO server ở cổng API và bật CORS theo CLIENT_URL.
- Frontend kết nối Socket.IO qua VITE_SOCKET_URL.
- Event chính:
    - onlineUsers: cập nhật danh sách user online.
    - new-message: đẩy tin nhắn mới để cập nhật UI realtime.

## Scripts

### Backend

- npm run dev: Chạy server với nodemon
- npm start: Chạy server production mode

### Frontend

- npm run dev: Chạy Vite dev server
- npm run build: Build production
- npm run preview: Preview bản build
- npm run lint: Chạy ESLint

## License

ISC
