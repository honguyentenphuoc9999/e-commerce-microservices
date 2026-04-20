const GATEWAY_URL = 'http://localhost:8900/api';

async function seed() {
  console.log("🌱 ĐANG BƠM DỮ LIỆU TỔNG LỰC CHO HỆ THỐNG...");

  // 1. TẠO TÀI KHOẢN (Admin & Customers)
  const users = [
    { userName: "admin_tong", userPassword: "Password123", roleId: 2, email: "admin@techshop.com", first: "Tran", last: "Admin" },
    { userName: "khachhang99", userPassword: "Password123", roleId: 1, email: "khach99@gmail.com", first: "Nguyen", last: "Khach" },
    { userName: "minh_hi-end", userPassword: "Password123", roleId: 1, email: "minh@gmail.com", first: "Le", last: "Minh" }
  ];

  console.log("\n1. Đăng ký các tài khoản...");
  for (let u of users) {
    await fetch(`${GATEWAY_URL}/accounts/registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: u.userName, userPassword: u.userPassword, active: 1,
        userDetails: { firstName: u.first, lastName: u.last, email: u.email },
        role: { id: u.roleId }
      })
    }).then(res => {
      if (res.ok) console.log(`   ✅ Đã đăng ký: ${u.userName}`);
      else if (res.status === 409 || res.status === 500) console.log(`   ⚠️ User [${u.userName}] có thể đã tồn tại hoặc lỗi hệ thống nhẹ.`);
      else console.log(`   ❌ Lỗi đăng ký [${u.userName}]: ${res.status}`);
    }).catch(err => console.log(`   ❌ Lỗi kết nối tài khoản: ${err.message}`));
  }

  // 2. ĐĂNG NHẬP ADMIN ĐỂ LẤY TOKEN
  console.log("\n2. Lấy Token Admin...");
  const loginRes = await fetch(`${GATEWAY_URL}/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: "admin_tong", userPassword: "Password123" })
  });
  if (!loginRes.ok) return console.log("❌ Lỗi login Admin, dừng seed.");

  let adminToken = await loginRes.text();
  try { const j = JSON.parse(adminToken); adminToken = j.token || j.accessToken || adminToken; } catch (e) { }
  const authHeader = { 'Authorization': `Bearer ${adminToken.trim()}`, 'Content-Type': 'application/json' };
  console.log("   🔑 Đã lấy Token thành công.");

  // 3. TẠO DANH MỤC CÔNG NGHỆ
  console.log("\n3. Tạo Danh mục...");
  // Lấy list hiện tại để tránh trùng
  let currentCats = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/admin-bff/categories`, { headers: authHeader });
    if (res.ok) currentCats = await res.json();
  } catch (e) {}

  const categories = [
    { name: "LAPTOP & PC", desc: "Máy tính xách tay hi-end", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776529894/rainbow-forest/products/file_ffcmue.jpg" },
    { name: "SMARTPHONE", desc: "Flagship đời mới", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776530008/rainbow-forest/products/file_gnrflv.jpg" },
    { name: "LINH KIỆN PC", desc: "RTX 4090, CPU i9...", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776529324/rainbow-forest/products/file_jppbsp.jpg" },
    { name: "PHỤ KIỆN", desc: "Bàn phím cơ, Tai nghe", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776529869/rainbow-forest/products/file_pgmtlw.jpg" }
  ];

  for (let c of categories) {
    if (currentCats.some(existing => existing.categoryName === c.name)) {
      console.log(`   ⚠️ Danh mục [${c.name}] đã tồn tại.`);
      continue;
    }
    await fetch(`${GATEWAY_URL}/admin-bff/categories`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ categoryName: c.name, description: c.desc, image: c.img })
    }).then(async res => {
      if (res.ok) console.log(`   ✅ Đã tạo Danh mục: ${c.name}`);
      else console.log(`   ❌ Lỗi tạo Danh mục [${c.name}]: ${res.status}`);
    });
  }

  // Reload categories list to get IDs
  let catData = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/admin-bff/categories`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) catData = data;
    }
  } catch (e) {
    console.log("   ⚠️ Không thể lấy danh sách Danh mục cập nhật.");
  }
  const getCatId = (name) => Array.isArray(catData) ? catData.find(c => c.categoryName === name)?.id : null;

  // 4. TẠO SẢN PHẨM
  console.log("\n4. Tạo Sản phẩm...");
  let currentProds = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/admin-bff/products`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) currentProds = data;
    }
  } catch (e) {}

  const products = [
    { name: "MacBook Pro M3 Max", price: 87500000, cat: "LAPTOP & PC", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776528037/rainbow-forest/products/file_v8jget.jpg", images: ["http://res.cloudinary.com/de0de4yum/image/upload/v1776528037/rainbow-forest/products/file_v8jget.jpg"] },
    { name: "iPhone 15 Pro", price: 27500000, cat: "SMARTPHONE", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776528110/rainbow-forest/products/file_cjxgak.jpg", images: ["http://res.cloudinary.com/de0de4yum/image/upload/v1776528110/rainbow-forest/products/file_cjxgak.jpg"] },
    { name: "ROG Strix RTX 4090", price: 50000000, cat: "LINH KIỆN PC", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776528134/rainbow-forest/products/file_b3lysz.jpg", images: ["http://res.cloudinary.com/de0de4yum/image/upload/v1776528134/rainbow-forest/products/file_b3lysz.jpg"] },
    { name: "Keychron Q3 Max", price: 5750000, cat: "PHỤ KIỆN", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776528156/rainbow-forest/products/file_s0nntg.jpg", images: ["http://res.cloudinary.com/de0de4yum/image/upload/v1776528156/rainbow-forest/products/file_s0nntg.jpg"] }
  ];

  for (let p of products) {
    if (currentProds.some(existing => existing.productName === p.name)) {
      console.log(`   ⚠️ Sản phẩm [${p.name}] đã tồn tại.`);
      continue;
    }
    const catId = getCatId(p.cat);
    await fetch(`${GATEWAY_URL}/admin-bff/products`, {
      method: 'POST', headers: authHeader,
      body: JSON.stringify({ productName: p.name, price: p.price, availability: 100, category: { id: catId }, image: p.img, images: p.images })
    }).then(res => {
      if (res.ok) console.log(`   ✅ Đã tạo Sản phẩm: ${p.name}`);
      else console.log(`   ❌ Lỗi tạo SP [${p.name}]: ${res.status}`);
    });
  }

  // 5. TẠO ĐÁNH GIÁ (Chỉ tạo nếu chưa có)
  console.log("\n5. Tạo Đánh giá...");
  const finalProds = await (await fetch(`${GATEWAY_URL}/admin-bff/products`, { headers: authHeader })).json();
  const userIds = [2, 3];
  for (let p of finalProds) {
    for (let uId of userIds) {
      // Ở đây có thể thêm logic check review tồn tại nếu cần, tạm thời catch error
      let rating = Math.floor(Math.random() * 2) + 4;
      await fetch(`${GATEWAY_URL}/review/${uId}/recommendations/${p.id}?rating=${rating}`, {
        method: 'POST', headers: authHeader
      }).then(res => {
        if (res.ok) console.log(`   ⭐ Đã đánh giá cho SP: ${p.productName}`);
      }).catch(() => { });
    }
  }

  // 6. TẠO VOUCHER
  console.log("\n6. Tạo Voucher...");
  let currentVouchers = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/shop/vouchers`, { headers: authHeader });
    if (res.ok) currentVouchers = await res.json();
  } catch (e) {}

  const voucherCode = "TECH-PRO";
  if (!currentVouchers.some(v => v.code === voucherCode)) {
    await fetch(`${GATEWAY_URL}/shop/vouchers/admin/create`, {
      method: 'POST', headers: authHeader,
      body: JSON.stringify({ code: voucherCode, type: "DISCOUNT", discountAmount: 500000, minOrderValue: 5000000, usageLimit: 100, expirationDate: "2026-12-31" })
    }).then(res => {
      if (res.ok) console.log(`   ✅ Đã tạo Voucher: ${voucherCode}`);
      else console.log(`   ❌ Lỗi tạo Voucher: ${res.status}`);
    }).catch(() => { });
  } else {
    console.log(`   ⚠️ Voucher [${voucherCode}] đã tồn tại.`);
  }

  console.log("\n🎉 ✅ TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC BƠM VÀO CÁC BẢNG THÀNH CÔNG!");
}

seed();
