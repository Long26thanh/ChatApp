# ChatApp

Ứng dụng chat full-stack sử dụng Node.js, Express, MongoDB và React.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Kiến trúc dự án](#kiến-trúc-dự-án)
- [Tech stack](#tech-stack)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Scripts](#scripts)
- [API chính](#api-chính)
- [Ghi chú phát triển](#ghi-chú-phát-triển)

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
- Giao diện chat theo layout sidebar + chat window.

## Công nghệ

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose

### Frontend

- React + TypeScript
- Vite
- React Router

## Cài đặt nhanh

```bash
git clone https://github.com/your-username/ChatApp.git
cd ChatApp

cd backend
npm install

cd ../frontend
npm install
```

## Biến môi trường

Tạo file .env trong thư mục backend với nội dung:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/chatapp
ACCESS_TOKEN_SECRET=replace_with_your_secret
NODE_ENV=development
```

Ghi chú:

- ACCESS_TOKEN_SECRET là bắt buộc để ký/verify access token.
- Refresh token đang được lưu trong DB và cookie httpOnly.
- NODE_ENV=production sẽ bật secure cookie.

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
