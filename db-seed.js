const GATEWAY_URL = 'http://localhost:8900/api';

async function seed() {
  console.log("🌱 Bắt đầu tạo dữ liệu Seed (DB Seed) cho E-commerce Microservices...");

  const adminCredentials = { userName: "admin_tong", userPassword: "Password123" };

  // 1. Tạo Admin
  console.log("1. Đăng ký Admin (admin_tong)...");
  await fetch(`${GATEWAY_URL}/accounts/registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: adminCredentials.userName,
      userPassword: adminCredentials.userPassword,
      active: 1,
      userDetails: { firstName: "Tran", lastName: "Admin", email: "admin@example.com" },
      role: { id: 2 }
    })
  })
    .then(res => {
      if (res.ok) console.log("✅ Đăng ký Admin hoàn tất.");
      else if (res.status === 409 || res.status === 400) console.log("⚠️ User admin có thể đã tồn tại. Bỏ qua.");
      else console.log(`❌ Lỗi đăng ký Admin: ${res.status}`);
    })
    .catch(() => console.log("⚠️ Lỗi kết nối khi đăng ký Admin. Hãy kiểm tra API Gateway."));

  // 2. Tạo User Khách
  console.log("2. Đăng ký Khách Hàng (khachhang99)...");
  await fetch(`${GATEWAY_URL}/accounts/registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: "khachhang99",
      userPassword: "Password123",
      active: 1,
      userDetails: { firstName: "Nguyen", lastName: "Khach", email: "khach@gmail.com" },
      role: { id: 1 }
    })
  }).catch(() => { });

  // 3. Đăng nhập lấy Token
  console.log("3. Đang chờ lấy Token Admin từ Server...");
  const loginRes = await fetch(`${GATEWAY_URL}/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminCredentials)
  });

  if (!loginRes.ok) {
    console.error(`\n❌ Lỗi đăng nhập Admin! Code: ${loginRes.status}`);
    console.error("Hãy đảm bảo bạn CÓ CHẠY CÁC DỊCH VỤ (nhất là API Gateway cổng 8900 và User Service) trước khi chạy lệnh này.");
    return;
  }

  let token = await loginRes.text();
  try { // Spring Boot có thể trả về Plain String hoặc Object
    const jsonToken = JSON.parse(token);
    token = jsonToken.token || jsonToken.accessToken || token;
  } catch (e) { }

  console.log("🔑 Đã lấy Token Admin thành công.");

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.trim()}`
  };

  // 4. Tạo danh mục (Categories)
  console.log("4. Bơm danh sách Danh mục sản phẩm (Categories)...");
  const categories = [
    { name: "ĐIỆN TOÁN", desc: "Máy tính xách tay và máy trạm" },
    { name: "ÂM THANH", desc: "Thiết bị Audiophile" },
    { name: "NGOẠI VI", desc: "Phụ kiện độc bản cho sáng tạo" },
    { name: "THIẾT BỊ ĐEO", desc: "Thời trang công nghệ đẳng cấp" },
    { name: "NỘI THẤT", desc: "Ghế công thái học và Setup tối giản" }
  ];

  for (let cat of categories) {
    await fetch(`${GATEWAY_URL}/admin-bff/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ categoryName: cat.name, description: cat.desc })
    }).then(res => {
      if (!res.ok) console.log(`   ❌ Lỗi tạo Danh mục [${cat.name}]: ${res.status}`);
      else console.log(`   ✅ Đã tạo Danh mục: ${cat.name}`);
    }).catch(err => console.log(`   ❌ Lỗi kết nối khi tạo Danh mục: ${err.message}`));
  }

  // 5. Lấy danh sách ID để nạp Sản phẩm ứng với đúng Ngành hàng
  const catRes = await fetch(`${GATEWAY_URL}/admin-bff/categories`, { headers: authHeaders }).catch(() => null);
  let catData = [];
  if (catRes && catRes.ok) {
    catData = await catRes.json();
  } else {
    console.log("⚠️ Không lấy được danh sách Category từ Backend Service.");
  }

  const getCatId = (name) => {
    const found = catData.find(c => c.categoryName?.toUpperCase() === name.toUpperCase());
    return found ? found.id : null;
  };

  // 6. Tạo Sản phẩm
  console.log("5. Bơm Sản phẩm mẫu...");
  const products = [
    { name: "Stealth Tactile", price: 349, cat: "NGOẠI VI", desc: "Bàn phím cơ giới hạn, switches nảy êm ru." },
    { name: "Void ANC Gen 2", price: 599, cat: "ÂM THANH", desc: "Tai nghe chống ồn chủ động lọc tạp âm tuyệt đối." },
    { name: "Zenith Air Pro", price: 2499, cat: "ĐIỆN TOÁN", desc: "Máy tính mỏng 12mm với hiệu năng card rời tối tân." },
    { name: "Orbit Chrono", price: 899, cat: "THIẾT BỊ ĐEO", desc: "Đồng hồ sinh học tích hợp vệ tinh định vị riêng." },
    { name: "Ghế Obsidian Lounge", price: 2450, cat: "NỘI THẤT", desc: "Ghế văn phòng chuẩn công thái học cao cấp." },
    { name: "Đèn bàn Auric", price: 890, cat: "NỘI THẤT", desc: "Đèn điều chỉnh nhiệt độ màu vàng chanh bảo vệ mắt." }
  ];

  for (let p of products) {
    const catId = getCatId(p.cat);
    if (!catId) {
      console.log(`   ❌ Không tìm thấy ID cho Danh mục [${p.cat}]. Không thể thêm SP [${p.name}].`);
      continue;
    }

    await fetch(`${GATEWAY_URL}/admin-bff/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        productName: p.name,
        price: p.price,
        discription: p.desc,
        availability: 20,
        category: { id: catId }
      })
    }).then(res => {
      if (!res.ok) console.log(`   ❌ Lỗi tạo Sản phẩm [${p.name}]: Status ${res.status}`);
      else console.log(`   ✅ Đã tạo Sản phẩm: ${p.name}`);
    }).catch(err => console.log(`   ❌ Lỗi kết nối khi tạo Sản phẩm: ${err.message}`));
  }

  // 7. Tạo Voucher
  console.log("6. Tạo Mã Vouchers...");
  await fetch(`${GATEWAY_URL}/shop/vouchers/admin/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: "GIAM50K", type: "DISCOUNT", discountAmount: 50000,
      minOrderValue: 100000, usageLimit: 1000, expirationDate: "2026-12-31"
    })
  }).catch(() => { });

  await fetch(`${GATEWAY_URL}/shop/vouchers/admin/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: "FREESHIP", type: "FREESHIP", discountAmount: 30000,
      minOrderValue: 0, usageLimit: 1000, expirationDate: "2026-12-31"
    })
  }).catch(() => { });

  console.log("\n🎉 HOÀN TẤT QUÁ TRÌNH SEED!");
}

seed();
