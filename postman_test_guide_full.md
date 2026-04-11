# 🚀 E-COMMERCE MICROSERVICES - FULL POSTMAN TEST GUIDE (37 COMMANDS)

## 🛠️ PHẦN 1: CHUẨN BỊ PHẦN MỀM & MÔI TRƯỜNG

1. **Java:** Cài đặt JDK 23 (Đường dẫn mặc định: `C:\Program Files\Java\jdk-23`). ($env:JAVA_HOME="C:\Program Files\Java\jdk-23")
2. **Database:** Cài đặt MySQL (Port 3306), tạo database tên `users`.
3. **Caching:** Cài đặt Redis (Port 6379).
4. **Công cụ test:** Cài đặt Postman.
5. **Dịch vụ:** Đảm bảo toàn bộ 7 Microservices đã được tải về.

lệnh tắt các tiến trình java chạy ngầm
taskkill /F /IM java.exe


---

## 💻 HƯỚNG DẪN DI CHUYỂN & CHẠY TRÊN MÁY MỚI

Khi bạn sao chép mã nguồn này sang một máy tính khác, hãy làm theo các bước sau:

1.  **Cơ sở dữ liệu (XAMPP & Redis):**
    - Mở **XAMPP Control Panel**, khởi động (Start) **MySQL**. Đảm bảo Port là **3306**.
    - Tạo một database trống tên là `users`.
    - Khởi động **Redis Server** (Port **6379**). Bạn có thể dùng thư mục `redis_installed` có sẵn trong dự án.
2.  **Chạy Backend (Microservices):**
    - Mở Terminal tại từng thư mục dịch vụ (ví dụ: `user-service`, `order-service`,...) và chạy lệnh:
      `.\mvnw.cmd spring-boot:run`
      `.\mvnw.cmd clean spring-boot:run`
3.  **Chạy Frontend:**
    - Mở Terminal tại thư mục `frontend`.
    - Chạy `npm install` (để cài đặt lại các thư viện đã dọn dẹp).
    - Sau đó chạy `npm run dev` để khởi động giao diện.

> **📌 Tóm tắt:** Khi sang máy mới, bạn chỉ cần mở terminal tại các thư mục tương ứng và chạy lệnh build/run (ví dụ: `mvnw spring-boot:run` cho backend hoặc `npm install && npm run dev` cho frontend).

---

## 🏗️ PHẦN 2: THỨ TỰ KHỞI ĐỘNG HỆ THỐNG (CHUẨN NHẤT)

Hãy mở 8 cửa sổ Terminal riêng biệt và khởi động theo đúng trình tự dưới đây để đảm bảo các dịch vụ không bị lỗi kết nối:

### 🚦 BƯỚC 1: HẠ TẦNG & TRUNG TÂM (BẮT BUỘC CHẠY TRƯỚC)
1. **Redis Server:** Chạy trước tiên (Đợi 5 giây).
2. **Eureka Server (Port 8761):** Chạy và đợi khoảng 15 giây (Cho đến khi truy cập được giao diện Web Eureka).
3. **User Service (Port 8811):** Chạy và đợi 10 giây (Dịch vụ cốt lõi để xác thực Token).

### 🚀 BƯỚC 2: CỔNG KẾT NỐI (GATEWAY)
4. **API Gateway (Port 8900):** Chạy và đợi 5 giây (Mọi lệnh Postman đều gọi qua đây).

### 💼 BƯỚC 3: DỊCH VỤ NGHIỆP VỤ & QUẢN TRỊ (CHẠY ĐỒNG THỜI)
Bạn có thể chạy các dịch vụ này cùng lúc hoặc theo thứ tự bất kỳ:
5. **Admin Service (Port 8090):** Xử lý khóa/mở khóa tài khoản.
6. **Product Catalog Service (Port 8810):** Quản lý danh mục sản phẩm.
7. **Recommendation Service (Port 8812):** Quản lý đánh giá & bình luận.
8. **Order Service (Port 8813):** Quản lý giỏ hàng & đặt hàng.

> **💡 Mẹo:** Khi tất cả đã hiện chữ **"Started..."** trong Terminal, hãy đợi thêm 10 giây cuối cùng để Eureka cập nhật đầy đủ danh bạ trước khi bắt đầu Test Postman.
> 
> **⚠️ Xử lý lỗi Port bị treo (Khi đổi máy/Khởi động lại):** 
> Nếu gặp thông báo "Port already in use" (VD: 8813), hãy chạy lệnh sau trong PowerShell để giải phóng: 
> `Get-NetTCPConnection -LocalPort 8813 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`
>
> **🔄 CẦN CHẠY LẠI CÁC DỊCH VỤ SAU (SAU KHI FIX BUG):**
> 1. **Product Catalog Service (8810):** Chạy lại để cập nhật logic Category mới.
> 2. **Recommendation Service (8812):** Chạy lại để cập nhật Logic loại bỏ JSON dư thừa.


---

## 🧪 PHẦN 3: CHI TIẾT 37 LỆNH TEST POSTMAN

> **Lưu ý:** Tất cả request đều gửi qua Gateway: `http://localhost:8900`

### 👑 PHÂN ĐOẠN 1: QUẢN TRỊ & DANH MỤC (LỆNH 1-9)

**1. Tạo tài khoản Admin**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/accounts/registration`
- **Body:**
```json
{
    "userName": "admin_tong",
    "userPassword": "Password123",
    "active": 1,
    "userDetails": { "firstName": "Tran", "lastName": "Admin", "email": "admin@example.com" },
    "role": { "id": 2 }
}
```

**2. Đăng nhập Admin (Lấy TOKEN_ADMIN)**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/accounts/login`
- **Body:** `{ "userName": "admin_tong", "userPassword": "Password123" }`

**3. Thêm Danh mục 1 (Laptop)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/categories`
- **Body:** `{ "categoryName": "Laptop", "description": "Laptops & Ultrabooks" }`

**4. Thêm Danh mục 2 (Phone)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/categories`
- **Body:** `{ "categoryName": "Phone", "description": "Smartphones" }`

**5. Xem tất cả Danh mục**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/admin-bff/categories`

**6. Xem 1 Danh mục theo ID (ID=1)**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/admin-bff/categories/1`

**7. Cập nhật Danh mục (ID=1)**
- **Method:** `PUT` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/categories/1`
- **Body:** `{ "categoryName": "Laptop Gaming", "description": "High performance" }`

**8. Xóa Danh mục (ID=2)**
- **Method:** `DELETE` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/categories/2`

**9. Thêm SP mới (Dùng Category ID=1)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/products`
- **Body:**
```json
{
    "productName": "Laptop Dell XPS 15",
    "price": 28000000,
    "discription": "Laptop Gaming",
    "category": { "id": 1 },
    "availability": 50
}
```

---

### 🛒 PHÂN ĐOẠN 2: KHÁCH HÀNG & MUA SẮM (LỆNH 10-20)

**10. Tạo tài khoản Khách (Đăng ký tự do)**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/accounts/registration`
- **Body:**
```json
{
    "userName": "khachhang99",
    "userPassword": "Password123",
    "active": 1,
    "userDetails": { "firstName": "Nguyen", "lastName": "Khach", "email": "khach@gmail.com" },
    "role": { "id": 1 }
}
```

**11. Đăng nhập Khách (Lấy TOKEN_KHACH)**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/accounts/login`
- **Body:** `{ "userName": "khachhang99", "userPassword": "Password123" }`

**12. Xem tất cả SP (Public)**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/catalog/products`

**13. Xem SP theo ID (ID=1)**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/catalog/products/1`

**14. Tìm SP theo tên ("Dell")**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/catalog/products?name=Dell`

**15. Tìm SP theo tên Danh mục ("Laptop Gaming")**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/catalog/products?category=Laptop Gaming`

**16. Thêm vào Giỏ (SP=1, SL=2)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_KHACH` | **Header:** `Cookie: 123`
- **URL:** `http://localhost:8900/api/shop/cart?productId=1&quantity=2`

**17. Xem Giỏ hàng**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_KHACH` | **Header:** `Cookie: 123`
- **URL:** `http://localhost:8900/api/shop/cart`

**18. Xóa SP khỏi Giỏ (ID=1)**
- **Method:** `DELETE` | **Header:** `Cookie: 123`
- **URL:** `http://localhost:8900/api/shop/cart?productId=1`

**19. Đặt hàng (Checkout cho User=2)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_KHACH` | **Header:** `Cookie: 123`
- **URL:** `http://localhost:8900/api/shop/order/2`

**20. Xem Lịch sử Đơn hàng (User 2)**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/shop/orders/user/2`

---

### ⭐ PHÂN ĐOẠN 3: ĐÁNH GIÁ & QUẢN TRỊ BFF (LỆNH 21-32)

**21. Viết đánh giá mới (MỚI - Chỉ dùng 1 lần)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/review/2/recommendations/1?rating=5`
- **Body:** `None` (Không cần gửi JSON body, mọi thứ đã có ở URL và Param).
- **Lưu ý:** Nếu gửi lại lần 2 sẽ báo lỗi `409 Conflict`.

**22. Cập nhật đánh giá (MỚI - Dùng để sửa)**
- **Method:** `PUT` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/review/2/recommendations/1?rating=4`
- **Body:** `None` (Chỉ cần gửi rating qua Query Param).
- **Lưu ý:** Chỉ dùng được khi đã có đánh giá trước đó.

**23. Lấy đánh giá cụ thể (MỚI)**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/review/2/recommendations/1`

**24. Xem đánh giá theo tên SP (Tất cả)**
- **Method:** `GET`
- **URL:** `http://localhost:8900/api/review/recommendations?name=Laptop Dell XPS 15`

**25. Xóa đánh giá (ID=1)**
- **Method:** `DELETE` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/review/recommendations/1`

**26. Admin xem tất cả Đơn hàng (BFF)**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/orders`

**27. Duyệt Đơn hàng (Status = SHIPPED)**
- **Cách 1 (Query Param):** `PUT` | `http://localhost:8900/api/admin-bff/orders/1/status?status=SHIPPED`
- **Cách 2 (JSON Body - Recommended):** `PUT` | `http://localhost:8900/api/admin-bff/orders/1` | Body: `{ "orderStatus": "SHIPPED" }`

**28. Admin xem tất cả Users (BFF)**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/users`

**29. Admin xem 1 User (BFF)**
- **Method:** `GET` | **URL:** `http://localhost:8900/api/admin-bff/users/2`

**30. Khóa tài khoản User (active=0)**
- **Method:** `PUT` | **URL:** `http://localhost:8900/api/admin-bff/users/2`
- **Body:** `{ "userName": "khachhang99", "active": 0, "userDetails": { "email": "khach@gmail.com" } }`

**31. Xóa User (BFF)**
- **Method:** `DELETE` | **URL:** `http://localhost:8900/api/admin-bff/users/2`

**32. Admin xem tất cả SP (BFF)**
- **Method:** `GET` | **URL:** `http://localhost:8900/api/admin-bff/products`

**33. Admin sửa Sản phẩm (BFF)**
- **Method:** `PUT` | **URL:** `http://localhost:8900/api/admin-bff/products/1`
- **Body:** `{ "productName": "Dell XPS Updated", "category": {"id": 1}, "price": 27000000 }`

**34. Admin xóa Sản phẩm (BFF)**
- **Method:** `DELETE` | **URL:** `http://localhost:8900/api/admin-bff/products/1`

---

## 🔒 PHẦN 4: TEST TÍNH NĂNG KHÓA/MỞ KHÓA TÀI KHOẢN (REAL-TIME)

Đây là tính năng đặc biệt sử dụng Redis để vô hiệu hóa Token ngay lập tức khi trạng thái tài khoản thay đổi.

### 🧪 KỊCH BẢN 1: KHÓA TÀI KHOẢN (ADMIN THỰC HIỆN)

**B1. Lấy Token cũ (V1):** Đăng nhập `khachhang99` (Lệnh 11) -> Lưu lại `TOKEN_KHACH_V1`.
**B2. Admin thực hiện KHÓA (active=0):** 
- **Method:** `PUT` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/accounts/users/2` (ID của khách)
- **Body:** `{ "userName": "khachhang99", "active": 0 }`
**B3. Kiểm tra lệnh ghi bằng Token V1:** Dùng `TOKEN_KHACH_V1` thực hiện Lệnh 16 (Thêm vào giỏ).
- **Kết quả mong đợi:** `403 Forbidden` (Ưu tiên báo lỗi tài khoản bị khóa).
**B4. Thử đăng nhập lại:** Đăng nhập lại với tài khoản `khachhang99`.
- **Kết quả mong đợi:** `403 Forbidden` (Đăng nhập cũng bị khóa theo yêu cầu).
**B5. Kiểm tra lệnh XEM:** Dùng `TOKEN_KHACH_V1` thực hiện Lệnh 12 (Xem SP) hoặc xem giỏ (Lệnh 17).
- **Xem SP (Public):** `200 OK` (Bỏ qua check bảo mật).
- **Xem Giỏ (Secure GET):** `401 Unauthorized` (Token V1 đã bị hủy do version đổi, không cho xem thông tin cá nhân/giỏ hàng).

### 🧪 KỊCH BẢN 2: MỞ KHÓA TÀI KHOẢN

**B1. Admin thực hiện MỞ KHÓA (active=1):**
- **Method:** `PUT` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/accounts/users/2`
- **Body:** `{ "userName": "khachhang99", "active": 1 }`
**B2. Kiểm tra Token V2:** Dùng `TOKEN_KHACH_V2` (Token lúc đang bị khóa).
- **Kết quả mong đợi:** `401 Unauthorized` (Token lại bị hủy tiếp để bắt buộc đăng nhập lại sau khi khôi phục).
**B3. Đăng nhập lần cuối (V3):** Đăng nhập để lấy `TOKEN_KHACH_V3`.
- **Kết quả mong đợi:** Mọi tính năng (Giỏ hàng, Đặt hàng, Đánh giá) hoạt động bình thường trở lại. ✅

---

### ❌ PHẦN 5: TEST BẢO MẬT (SECURITY) (LỆNH 35-41)

**35. Thử thêm SP bằng Token Khách (403)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/admin-bff/products`

**36. Thử xem đơn hàng bằng Token Khách (403)**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/admin-bff/orders`

**37. Truy cập API cần bảo mật không Token (401)**
- **Method:** `GET` 
- **URL:** `http://localhost:8900/api/shop/cart`

**38. Dùng Token giả mạo (401)**
- **Method:** `GET` | **Auth:** `Bearer fake_token_999`
- **URL:** `http://localhost:8900/api/shop/orders/user/2`

**39. Truy cập vào Service lẻ không qua Gateway (Bị chặn xem tất cả)**
- **Method:** `GET`
- **URL:** `http://localhost:8811/users`
- **Auth:** `No Auth` , `Token giả` và `Token người dùng`
- **Kết quả mong đợi:** Trả về `403 Forbidden` (Bị chặn vì không có quyền Admin). 🎯🔒

**40. User tự xem thông tin cá nhân (Thành công - Secure)**
- **Method:** `GET`
- **URL:** `http://localhost:8811/users/{id_của_chính_bạn}`
- **Auth:** `Bearer TOKEN_USER_A`
- **Kết quả mong đợi:** Trả về `200 OK` và thông tin của bạn. ✅👤

**41. User xem trộm thông tin người khác qua ID (Bị chặn 403)**
- **Method:** `GET`
- **URL:** `http://localhost:8811/users/{id_của_người_khác}`
- **Auth:** `Bearer TOKEN_USER_A`
- **Kết quả mong đợi:** Trả về `403 Forbidden` (Bị chặn vì ID không khớp với Token). 🎯🛡️🔥

---

## 🎟️ PHẦN 6: HỆ THỐNG VOUCHER & SIÊU KHUYẾN MÃI (VOUCHER ENGINE)

**42. Tạo Mã GIẢM GIÁ Gốc (Admin quyền năng)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/shop/vouchers/admin/create`
- **Body (raw - JSON):**
```json
{
  "code": "GIAM50K",
  "type": "DISCOUNT",
  "discountAmount": 50000,
  "minOrderValue": 100000,
  "usageLimit": 1000,
  "expirationDate": "2026-12-31"
}
```

**43. Tạo Mã MIỄN PHÍ SHIP (Admin)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/shop/vouchers/admin/create`
- **Body (raw - JSON):**
```json
{
  "code": "FREESHIP",
  "type": "FREESHIP",
  "discountAmount": 30000,
  "minOrderValue": 0,
  "usageLimit": 1000,
  "expirationDate": "2026-12-31"
}
```

**44. Khách LƯU MÃ vào Ví (Ví dụ Khách mang ID=2)**
- **Method:** `POST` (Sử dụng URL Param) | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/shop/vouchers/wallet/save?userId=2&code=GIAM50K`
*(Tùy chọn: Chạy thêm 1 lần nữa sửa lại `code=FREESHIP` để lưu thêm 1 thẻ nữa vào ví)*

**45. Xem "Ví" Voucher của Khách (User ID=2)**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/shop/vouchers/wallet/2`

**46. Cú Đặt Hàng Ép 2 Mã (Kép)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_KHACH` | **Header:** `Cookie: 123`
- **URL:** `http://localhost:8900/api/shop/order/2?voucherCodes=GIAM50K,FREESHIP`
*(Điều kiện: Trong giỏ phải có đồ)*

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY DỊCH VỤ EMAIL (NOTIFICATION-SERVICE)

Để tính năng Gửi Email hoạt động, bạn cần thực hiện 3 bước sau:

### 1. Cấu hình Tài khoản Gửi (SMTP)
Mở file: `notification-service/src/main/resources/application.properties`
- Nếu dùng **Mailtrap** (Khuyên dùng khi Dev): Điền `username` và `password` từ trang Mailtrap.io.
- Nếu dùng **Gmail** thật: Điền Email của bạn và **App Password** (Mật khẩu ứng dụng 16 số).

### 2. Các Service CẦN CHẠY LẠI (Restart):
Vì ta đã thay đổi Cấu hình và Code, hãy tắt (Ctrl + C) và chạy lại các lệnh sau theo thứ tự:

1.  **API Gateway (Cổng 8900):** Để nhận diện Route mới `/api/notification/**`.
    `mvn spring-boot:run -pl api-gateway`
2.  **Order Service (Cổng 8844):** Để kích hoạt lệnh gửi Mail sau khi chốt đơn.
    `mvn spring-boot:run -pl order-service`
3.  **Notification Service (Cổng 8085 - MỚI):** Máy chủ đảm nhận việc gửi thư.
    `mvn spring-boot:run -pl notification-service`

### 3. Lệnh TEST Dịch vụ Email (Đa năng):

**47. Test Gửi Mail Xác Nhận Đơn Hàng**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/notification/send-order-email`
- **Body (JSON):** 
```json
{
  "toEmail": "EMAIL_CỦA_BẠN@gmail.com",
  "userName": "TÊN_USER",
  "orderId": 12345,
  "totalAmount": 500000.0
}
```

**48. Test Gửi Mail Quên Mật Khẩu**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/notification/send-forgot-password`
- **Body (JSON):** 
```json
{
  "toEmail": "EMAIL_CỦA_BẠN@gmail.com",
  "userName": "TÊN_USER",
  "resetToken": "abc-xyz-123"
}
```

**49. Test Gửi Mail Khuyến Mãi (Voucher)**
- **Method:** `POST`
- **URL:** `http://localhost:8900/api/notification/send-promotion`
- **Body (JSON):** 
```json
{
  "toEmail": "EMAIL_CỦA_BẠN@gmail.com",
  "userName": "TÊN_USER",
  "voucherCode": "GIAM_GIA_50",
  "discount": "50%"
}
```

---

## 🎭 PHẦN 7: THANH TOÁN VIETQR & CẤU HÌNH ADMIN (LỆNH 50-52)

Đây là phương thức thanh toán mới nhất, ổn định 100% và không cần tài khoản Sandbox phức tạp.

**50. Tạo Link Thanh Toán VietQR (Dành cho Khách)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_KHACH`
- **URL:** `http://localhost:8900/api/payment/create-vietqr-payment/{orderId}`
- **Kết quả mong đợi:** Trả về `paymentUrl` (Link ảnh QR). Hãy dán link này vào trình duyệt để thấy mã QR VIB của bạn. 🏦

**51. Giả lập Xác nhận đã chuyển khoản (Dành cho Admin/Demo)**
- **Method:** `GET` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/payment/vietqr-callback?orderId={orderId}`
- **Kết quả mong đợi:** `payment_status` của đơn hàng chuyển sang **PAID**. 💳✅

**52. Admin cập nhật tài khoản nhận tiền (Thay đổi tức thì)**
- **Method:** `PUT` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/payment/admin/config`
- **Body (JSON):**
```json
{
  "bankId": "MB",
  "accountNo": "9999999999",
  "accountName": "NGUYEN VAN B",
  "template": "qr_only"
}
```
- **Kết quả mong đợi:** Kể từ giây phút này, mọi mã QR tạo ra ở lệnh 50 sẽ tự động đổi sang ngân hàng MB mà không cần sửa code. 🚀🔥💎

---

## ☁️ PHẦN 8: QUẢN LÝ ẢNH CLOUDINARY (LỆNH 53)

Thay vì dùng ảnh mẫu, hãy upload ảnh thật từ máy tính của bạn lên Cloudinary để hiển thị trên Web.

**53. Upload ảnh cho Sản phẩm (Dùng Product ID=1)**
- **Method:** `POST` | **Auth:** `Bearer TOKEN_ADMIN`
- **URL:** `http://localhost:8900/api/admin-bff/products/upload-image/1`
- **Body Type:** `form-data` (Trong Postman, chọn tab Body -> form-data)
- **Key:** `image` (Chọn kiểu là **File** thay vì Text)
- **Value:** Chọn 1 tấm ảnh `.jpg` hoặc `.png` từ máy tính của bạn.
- **Kết quả mong đợi:** Trả về đường link ảnh dạng `https://res.cloudinary.com/...` và tự động cập nhật vào CSDL sản phẩm. 📸☁️✨

---

## 🚦 CÁC LƯU Ý QUAN TRỌNG KHI TEST

1. **Token:** Hãy luôn cập nhật `TOKEN_ADMIN` và `TOKEN_KHACH` sau khi đăng nhập vì Token có thời hạn.
2. **Dữ liệu:** Luôn đảm bảo bạn đã tạo tài khoản (Lệnh 1, 10) trước khi thực hiện các lệnh mua sắm.
3. **Thứ tự:** Không thể "Đặt hàng" (Lệnh 19) nếu "Giỏ hàng" (Lệnh 17) đang trống.

---
**CHÚC BẠN TEST HỆ THỐNG THÀNH CÔNG! ✅🏆🔥**

