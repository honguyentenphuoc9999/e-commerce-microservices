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
        else if (res.status === 409) console.log(`   ⚠️ User [${u.userName}] đã tồn tại.`);
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
  try { const j = JSON.parse(adminToken); adminToken = j.token || j.accessToken || adminToken; } catch(e){}
  const authHeader = { 'Authorization': `Bearer ${adminToken.trim()}`, 'Content-Type': 'application/json' };
  console.log("   🔑 Đã lấy Token thành công.");

  // 3. TẠO DANH MỤC CÔNG NGHỆ
  console.log("\n3. Tạo Danh mục...");
  const categories = [
    { name: "LAPTOP & PC", desc: "Máy tính xách tay hi-end" },
    { name: "SMARTPHONE", desc: "Flagship đời mới" },
    { name: "LINH KIỆN PC", desc: "RTX 4090, CPU i9..." },
    { name: "PHỤ KIỆN", desc: "Bàn phím cơ, Tai nghe" }
  ];
  for (let c of categories) {
    await fetch(`${GATEWAY_URL}/admin-bff/categories`, { 
        method: 'POST', 
        headers: authHeader, 
        body: JSON.stringify({ categoryName: c.name, description: c.desc }) 
    }).then(res => {
        if (res.ok) console.log(`   ✅ Đã tạo Danh mục: ${c.name}`);
        else console.log(`   ❌ Lỗi tạo Danh mục [${c.name}]: ${res.status}`);
    });
  }

  // Lấy list ID Category vừa tạo
  const catRes = await fetch(`${GATEWAY_URL}/admin-bff/categories`, { headers: authHeader });
  if (!catRes.ok) {
      console.log(`   ❌ Lỗi lấy danh mục để lấy Product ID: ${catRes.status}`);
      return;
  }
  const catData = await catRes.json();
  const getCatId = (name) => catData.find(c => c.categoryName === name)?.id;

  // 4. TẠO SẢN PHẨM (Kèm Link Cloudinary)
  console.log("\n4. Tạo Sản phẩm...");
  const products = [
    { name: "MacBook Pro M3 Max", price: 3500, cat: "LAPTOP & PC", img: "https://res.cloudinary.com/djbeun7v0/image/upload/v171456789/tech-shop/macbook.jpg" },
    { name: "iPhone 15 Pro", price: 1100, cat: "SMARTPHONE", img: "https://res.cloudinary.com/djbeun7v0/image/upload/v171456789/tech-shop/iphone15.jpg" },
    { name: "ROG Strix RTX 4090", price: 2000, cat: "LINH KIỆN PC", img: "https://res.cloudinary.com/djbeun7v0/image/upload/v171456789/tech-shop/rtx4090.jpg" },
    { name: "Keychron Q3 Max", price: 230, cat: "PHỤ KIỆN", img: "https://res.cloudinary.com/djbeun7v0/image/upload/v171456789/tech-shop/keychron.jpg" }
  ];
  for (let p of products) {
    const catId = getCatId(p.cat);
    await fetch(`${GATEWAY_URL}/admin-bff/products`, {
      method: 'POST', headers: authHeader,
      body: JSON.stringify({ productName: p.name, price: p.price, availability: 100, category: { id: catId }, image: p.img })
    }).then(res => {
        if (res.ok) console.log(`   ✅ Đã tạo Sản phẩm: ${p.name}`);
        else console.log(`   ❌ Lỗi tạo SP [${p.name}]: ${res.status}`);
    });
  }

  // Lấy list ID Product vừa tạo
  const prodData = await (await fetch(`${GATEWAY_URL}/admin-bff/products`, { headers: authHeader })).json();

  // 5. TẠO ĐÁNH GIÁ (REVIEWS)
  console.log("\n5. Tạo Đánh giá...");
  const userIds = [2, 3]; // Theo logic đăng ký ở mục 1
  for (let p of prodData) {
    for (let uId of userIds) {
        let rating = Math.floor(Math.random() * 2) + 4;
        await fetch(`${GATEWAY_URL}/review/${uId}/recommendations/${p.id}?rating=${rating}`, { 
            method: 'POST', 
            headers: authHeader 
        }).then(res => {
            if (res.ok) console.log(`   ⭐ Đã đánh giá ${rating} sao cho SP: ${p.productName}`);
        }).catch(() => {});
    }
  }

  // 6. TẠO VOUCHER
  console.log("\n6. Tạo Voucher...");
  await fetch(`${GATEWAY_URL}/shop/vouchers/admin/create`, { 
    method: 'POST', headers: authHeader, 
    body: JSON.stringify({ code: "TECH-PRO", type: "DISCOUNT", discountAmount: 100, minOrderValue: 500, usageLimit: 100, expirationDate: "2026-12-31" }) 
  }).then(res => {
      if (res.ok) console.log("   ✅ Đã tạo Voucher: TECH-PRO");
  }).catch(() => {});


  console.log("\n🎉 ✅ TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC BƠM VÀO CÁC BẢNG THÀNH CÔNG!");
}

seed();
