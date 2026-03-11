# ChatApp

Ứng dụng chat full-stack được xây dựng với Node.js, Express, MongoDB và React.

---

## Mục lục

- [Tính năng](#tính-năng)
- [Tech Stack](#tech-stack)
- [Cài đặt](#cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Tính năng

- Đăng ký / Đăng nhập tài khoản
- Xác thực bằng JWT (Access Token + Refresh Token)
- Bảo vệ route với middleware xác thực
- Quản lý session phía server
- Giao diện hiện đại với React + Tailwind CSS
- Thông báo toast khi thao tác thành công / thất bại

---

## Tech Stack

**Backend**

| Thư viện             | Mục đích                  |
| -------------------- | ------------------------- |
| Node.js + Express v5 | HTTP server & routing     |
| MongoDB + Mongoose   | Cơ sở dữ liệu             |
| bcrypt               | Mã hoá mật khẩu           |
| jsonwebtoken         | Tạo & xác thực JWT        |
| cookie-parser        | Đọc cookie từ request     |
| cors                 | Xử lý CORS                |
| dotenv               | Quản lý biến môi trường   |
| nodemon              | Hot-reload khi phát triển |

**Frontend**

| Thư viện              | Mục đích            |
| --------------------- | ------------------- |
| React 19 + TypeScript | UI framework        |
| Vite                  | Build tool          |
| React Router v7       | Client-side routing |
| Zustand               | State management    |
| Axios                 | Gọi HTTP API        |
| React Hook Form + Zod | Form & validation   |
| Tailwind CSS v4       | Styling             |
| shadcn/ui + Radix UI  | UI components       |
| Sonner                | Toast notifications |

## Cài đặt

```bash
# Clone repository
git clone https://github.com/your-username/ChatApp.git
cd ChatApp

# Cài đặt dependencies backend
cd backend
npm install

# Cài đặt dependencies frontend
cd ../frontend
npm install
```

---

## Biến môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLIENT_URL=http://localhost:5173
```

---

## Chạy ứng dụng

Mở 2 terminal riêng biệt:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Backend chạy tại: `http://localhost:5001`
- Frontend chạy tại: `http://localhost:5173`

---

## API Endpoints

### Auth (Public)

| Method | Endpoint        | Mô tả                 |
| ------ | --------------- | --------------------- |
| `POST` | `/auth/signup`  | Đăng ký tài khoản mới |
| `POST` | `/auth/signin`  | Đăng nhập             |
| `POST` | `/auth/refresh` | Làm mới Access Token  |
| `POST` | `/auth/signout` | Đăng xuất             |

## License

ISC
