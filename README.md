# 🛒 E-Commerce Microservices - Phuoc Techno System

Chào mừng bạn đến với hệ thống thương mại điện tử Microservices cao cấp. Tài liệu này hướng dẫn bạn cách khởi chạy toàn bộ hệ thống từ A-Z. Hệ thống được tích hợp Trợ lý ảo AI Shopping Assistant thông minh giúp tối ưu trải nghiệm mua sắm.

---

## 🏗️ Kiến trúc Hệ thống

Hệ thống được xây dựng trên nền tảng **Spring Boot Cloud**, sử dụng kiến trúc Microservices tách biệt:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js :3000)          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              API Gateway (Spring Cloud :8900)        │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬───────┘
   │      │      │      │      │      │      │
:8800  :8810  :8820  :8830  :8840  :8850  :8860  :8870
user  catalog order  admin  blog  media  notif  recom
```

| Dịch vụ (Service) | Cổng (Port) | Mô tả chức năng |
|:------------------|:------------|:----------------|
| **eureka-server** | 8761 | Quản lý định danh các dịch vụ (Service Discovery) |
| **api-gateway** | 8900 | Cổng giao tiếp duy nhất điều phối yêu cầu |
| **user-service** | 8800 | Quản lý tài khoản, phân quyền JWT |
| **product-catalog-service** | 8810 | Quản lý danh mục và kho sản phẩm |
| **order-service** | 8820 | Xử lý đơn hàng và thanh toán VNPay |
| **admin-service** | 8830 | Backend-for-Frontend dành riêng cho Admin |
| **blog-service** | 8840 | Quản lý tin tức công nghệ |
| **media-service** | 8850 | Xử lý hình ảnh (Cloudinary) |
| **notification-service** | 8860 | Gửi Email thông báo (SMTP) |
| **product-recommendation-service**| 8870 | Đánh giá và gợi ý sản phẩm |

---

## 📧 Cấu hình Email tự động (Gmail SMTP)

Để hệ thống có thể gửi email thông báo đơn hàng hoặc khôi phục mật khẩu, bạn cần cấu hình **Mật khẩu ứng dụng** từ Google:

1. Truy cập: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
2. Đăng nhập email muốn sử dụng và nhập một tên ứng dụng (ví dụ: "Phuoc Techno").
3. Sao chép **mã 16 ký tự** được cấp.
4. **Kích hoạt trong hệ thống:** 
   - Khởi chạy ứng dụng và truy cập giao diện **Admin**.
   - Vào mục **Cài đặt -> Email (SMTP)**.
   - Dán mã 16 ký tự vào ô mật khẩu và nhấn lưu.

---

## ⚙️ Yêu cầu Hệ thống

| Công cụ | Phiên bản | Ghi chú |
|:--------|:----------|:--------|
| **Java JDK** | 21+ | Chạy Backend |
| **Node.js** | 18+ | Chạy Frontend & Script |
| **MySQL** | 8.0+ | Database chính (XAMPP) |
| **Redis** | 7.0+ | Cache & Session |
| **Maven** | Tích hợp | Dùng `.\mvnw.cmd` |

---

## 🚀 Hướng dẫn khởi chạy (Step-by-Step)

### Bước 1: Khởi tạo Cơ sở dữ liệu (XAMPP)
Hệ thống sử dụng MySQL. Bạn cần khởi động **XAMPP Control Panel**:
1. Bật (Start) dịch vụ **MySQL**.
2. Truy cập `http://localhost/phpmyadmin` để tạo các Database sau:
   `user_service_db`, `product_catalog_db`, `order_service_db`, `admin_service_db`, `blog_service_db`, `media_service_db`, `notification_service_db`, `recommendation_service_db`.

### Bước 2: Cấu hình và Chạy Redis
- **Windows:** Tải Redis tại [GitHub Microsoft](https://github.com/microsoftarchive/redis/releases), giải nén và chạy `redis-server.exe`.
- **Kiểm tra:** Chạy `redis-cli ping` phải trả về `PONG`.

### Bước 3: Khởi chạy Backend (Theo thứ tự bắt buộc)
Bạn cần khởi chạy các dịch vụ theo đúng thứ tự để đảm bảo việc đăng ký định danh thành công:

1. **eureka-server:**
   - Di chuyển vào thư mục `eureka-server` -> Chạy: `.\mvnw.cmd spring-boot:run`
   - Đợi đến khi truy cập được Dashboard: `http://localhost:8761`

2. **user-service:**
   - Di chuyển vào thư mục `user-service` -> Chạy: `.\mvnw.cmd spring-boot:run`

3. **API Gateway:**
   - `api-gateway` (Chạy sau khi các service trên đã hiển thị trạng thái UP trên Eureka).

4. **Các Dịch vụ Lõi (Core Services):** (Có thể chạy song song)
   - `admin-service`, `blog-service`, `media-service`, `notification-service`, `order-service`, `product-catalog-service`, `product-recommendation-service`.

### Bước 4: Nạp dữ liệu mẫu (Sample Data)
Mở Terminal tại thư mục gốc của dự án và chạy lệnh sau (chỉ cần chạy lần đầu):
```bash
node db-seed.js
```

### Bước 5: Khởi chạy Frontend (Atelier UI)
Mở một Terminal mới tại thư mục `frontend`:
```bash
npm install
npm run dev
```
Ứng dụng sẽ chạy tại: **http://localhost:3000**

---

## 👤 Tài khoản mặc định

| Loại tài khoản | Username | Password |
|:---------------|:---------|:---------|
| **Admin** | `admin_tong` | `Password123@` |
| **Khách hàng** | `khachhang99` | `Password123@` |

---

## 🤖 AI Shopping Assistant (PHUOC AI)

Hệ thống tích hợp trợ lý ảo tư vấn sản phẩm sử dụng mô hình **Llama 3.3 70B** qua Groq Cloud.
- Lấy API Key tại: [console.groq.com](https://console.groq.com)
- Điền vào file `frontend/.env.local` (Sao chép từ `.env.local.example`).

---

## 🌐 Triển khai Online (Cloudflare Tunnel)

Để ứng dụng có thể truy cập từ internet mà không cần cấu hình Router phức tạp:
1. Đặt `cloudflared.exe` vào thư mục `cloudflared/`.
2. Chạy lệnh:
   ```powershell
   ./cloudflared/cloudflared.exe tunnel --url http://127.0.0.1:3000
   ```
3. Cloudflare sẽ cấp URL dạng `https://xxxx.trycloudflare.com`.

---

## 🛠️ Công cụ hỗ trợ Quản trị

- **Quản lý Service:** `http://localhost:8761` (Eureka Dashboard).
- **Quản lý Database:** `http://localhost/phpmyadmin` (Dùng XAMPP).

---

## 📝 Lưu ý quan trọng

- **Nạp dữ liệu:** Luôn chạy `node db-seed.js` sau khi các service đã khởi động xong để đảm bảo dữ liệu được đồng bộ.
- **Giải phóng cổng:** Nếu gặp lỗi "Port already in use", dùng lệnh sau trong CMD (Admin) để tắt toàn bộ tiến trình Java:
  ```cmd
  taskkill /F /IM java.exe
  ```
- **Kiểm tra trạng thái:** Luôn theo dõi Eureka Dashboard để biết service nào đang gặp sự cố kết nối.

---

## 📁 Cấu trúc thư mục

```
e-commerce-microservices/
├── api-gateway/          # Gateway điều phối
├── eureka-server/        # Discovery Server
├── user-service/         # Auth & Account
├── product-catalog-service/ # Warehouse
├── order-service/        # Order & Payment
├── admin-service/        # Admin BFF
├── blog-service/         # News
├── media-service/        # Cloud Image
├── notification-service/ # Email SMTP
├── product-recommendation-service/ # AI & Rating
├── frontend/             # Next.js Application
├── db-seed.js            # Script tạo dữ liệu mẫu
└── README.md             # Tài liệu này
```
