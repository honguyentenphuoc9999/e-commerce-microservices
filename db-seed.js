const GATEWAY_URL = 'http://localhost:8900/api';

async function seed() {
  console.log("🌱 ĐANG BƠM DỮ LIỆU TỔNG LỰC CHO HỆ THỐNG...");

  // 1. TẠO TÀI KHOẢN (Admin & Customers)
  const users = [
    { userName: "admin_tong", userPassword: "Password123@", roleId: 2, email: "admin@techshop.com", first: "Tran", last: "Admin" },
    { userName: "khachhang99", userPassword: "Password123@", roleId: 1, email: "khach99@gmail.com", first: "Nguyen", last: "Khach" },
    { userName: "minh_hi-end", userPassword: "Password123@", roleId: 1, email: "minh@gmail.com", first: "Le", last: "Minh" }
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
      else if (res.status === 409 || res.status === 400) console.log(`   ⚠️ User [${u.userName}] có thể đã tồn tại hoặc không khớp chính sách mật khẩu.`);
      else console.log(`   ❌ Lỗi đăng ký [${u.userName}]: ${res.status}`);
    }).catch(err => console.log(`   ❌ Lỗi kết nối tài khoản: ${err.message}`));
  }

  // 2. ĐĂNG NHẬP ADMIN ĐỂ LẤY TOKEN
  console.log("\n2. Lấy Token Admin...");
  const loginRes = await fetch(`${GATEWAY_URL}/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName: "admin_tong", userPassword: "Password123@" })
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
    if (res.ok) {
      const data = await res.json();
      currentCats = Array.isArray(data) ? data : (data?.content || []);
    }
  } catch (e) { }

  const categories = [
    { name: "LAPTOP & PC", desc: "Máy tính xách tay hi-end", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776529894/rainbow-forest/products/file_ffcmue.jpg" },
    { name: "SMARTPHONE", desc: "Flagship đời mới", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776530008/rainbow-forest/products/file_gnrflv.jpg" },
    { name: "LINH KIỆN PC", desc: "RTX 4090, CPU i9...", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776529324/rainbow-forest/products/file_jppbsp.jpg" },
    { name: "PHỤ KIỆN", desc: "Bàn phím cơ, Tai nghe", img: "http://res.cloudinary.com/de0de4yum/image/upload/v1776529869/rainbow-forest/products/file_pgmtlw.jpg" }
  ];

  for (let c of categories) {
    const categoriesArray = Array.isArray(currentCats) ? currentCats : (currentCats?.content || []);
    if (categoriesArray.some(existing => existing.categoryName === c.name)) {
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
    const res = await fetch(`${GATEWAY_URL}/admin-bff/categories?size=1000`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      catData = Array.isArray(data) ? data : (data?.content || []);
    }
  } catch (e) {
    console.log("   ⚠️ Không thể lấy danh sách Danh mục cập nhật.");
  }
  const getCatId = (name) => {
    const categoriesArray = Array.isArray(catData) ? catData : (catData?.content || []);
    return categoriesArray.find(c => c.categoryName === name)?.id || null;
  };

  // 4. TẠO SẢN PHẨM
  console.log("\n4. Tạo Sản phẩm...");
  let currentProds = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/admin-bff/products?size=1000`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      currentProds = Array.isArray(data) ? data : (data?.content || []);
    }
  } catch (e) { }

  const products = [
    {
      name: "MacBook Pro M3 Max", price: 87500000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528037/rainbow-forest/products/file_v8jget.jpg",
      images: [
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528037/rainbow-forest/products/file_v8jget.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528039/rainbow-forest/products/file_n1s2yb.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528041/rainbow-forest/products/file_owkl5o.jpg"
      ]
    },
    {
      name: "iPhone 15 Pro", price: 27500000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528110/rainbow-forest/products/file_cjxgak.jpg",
      images: [
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528110/rainbow-forest/products/file_cjxgak.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528112/rainbow-forest/products/file_oiyxdg.png",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528114/rainbow-forest/products/file_eep7ol.png"
      ]
    },
    {
      name: "ROG Strix RTX 4090", price: 50000000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528134/rainbow-forest/products/file_b3lysz.jpg",
      images: [
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528134/rainbow-forest/products/file_b3lysz.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528136/rainbow-forest/products/file_jp7mhz.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528138/rainbow-forest/products/file_sc7ou2.webp"
      ]
    },
    {
      name: "Keychron Q3 Max", price: 5750000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528156/rainbow-forest/products/file_s0nntg.jpg",
      images: [
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528156/rainbow-forest/products/file_s0nntg.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528158/rainbow-forest/products/file_cdzah3.jpg",
        "https://res.cloudinary.com/de0de4yum/image/upload/v1776528160/rainbow-forest/products/file_ni2xpk.jpg"
      ]
    },
    {
      name: "iPhone 15 Pro Max", price: 34500000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Samsung Galaxy S24 Ultra", price: 29990000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "iPad Pro M4", price: 28900000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Dell XPS 13 Plus", price: 45000000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Sony WH-1000XM5", price: 6490000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Razer DeathAdder V3", price: 3250000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Logitech G Pro X Superlight", price: 3500000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "SteelSeries Arctis Nova Pro", price: 8900000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Intel Core i9-14900K", price: 15500000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Samsung 990 Pro 2TB", price: 4850000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Nvidia RTX 4080 Super", price: 32000000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "AMD Ryzen 9 7950X", price: 14500000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Google Pixel 8 Pro", price: 21500000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Xiaomi 14 Ultra", price: 25990000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "ASUS ROG Zephyrus G14", price: 42500000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "MacBook Air M3", price: 27900000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },

    // ===== SẢN PHẨM GIÁ RẺ MỚI =====

    // --- SMARTPHONE GIÁ RẺ ---
    {
      name: "Xiaomi Redmi Note 13", price: 4490000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Samsung Galaxy A55", price: 8990000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "OPPO Reno11 F", price: 6990000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Vivo Y38", price: 3990000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Realme C67", price: 3490000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Nokia G42", price: 2990000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "iPhone 13 128GB", price: 14900000, cat: "SMARTPHONE",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },

    // --- LAPTOP GIÁ RẺ ---
    {
      name: "Acer Aspire 5 A515", price: 12990000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Lenovo IdeaPad Slim 3i", price: 10990000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "ASUS VivoBook 15 X1504", price: 11490000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "HP 240 G10 Notebook", price: 9990000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "MSI Modern 14 C12MO", price: 13490000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Acer Nitro V15 ANV15", price: 17990000, cat: "LAPTOP & PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },

    // --- LINH KIỆN GIÁ RẺ ---
    {
      name: "AMD Ryzen 5 7600X", price: 5490000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Intel Core i5-14400F", price: 4290000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Nvidia RTX 4060 8GB", price: 9490000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Kingston Fury Beast 16GB DDR5", price: 1290000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "WD Blue SN580 1TB NVMe", price: 1490000, cat: "LINH KIỆN PC",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },

    // --- PHỤ KIỆN GIÁ RẺ ---
    {
      name: "Chuột Logitech G102", price: 350000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Bàn phím cơ Akko 3087", price: 890000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Tai nghe HyperX Cloud Stinger 2", price: 990000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Webcam Logitech C920 HD", price: 1890000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Loa Edifier R1280T", price: 1490000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Màn hình LG 24MR400 24 inch FHD", price: 2990000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Túi chống sốc laptop 15.6 inch", price: 199000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    },
    {
      name: "Hub USB-C 7 in 1 Ugreen", price: 590000, cat: "PHỤ KIỆN",
      img: "https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg",
      images: ["https://res.cloudinary.com/de0de4yum/image/upload/v1776780161/vnvnvn_uzshym.jpg"]
    }
  ];

  for (let p of products) {
    const productsArray = Array.isArray(currentProds) ? currentProds : (currentProds?.content || []);
    if (productsArray.some(existing => existing.productName.trim() === p.name.trim())) {
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
  let finalProds = null;
  try {
    const res = await fetch(`${GATEWAY_URL}/admin-bff/products?size=1000`, { headers: authHeader });
    if (res.ok) finalProds = await res.json();
  } catch (e) { }

  if (finalProds) {
    const productsForReview = Array.isArray(finalProds) ? finalProds : (finalProds.content || []);
    const userIds = [2, 3];
    for (let p of productsForReview) {
      for (let uId of userIds) {
        // Kiểm tra xem user này đã đánh giá sản phẩm này chưa
        const checkRes = await fetch(`${GATEWAY_URL}/review/${uId}/recommendations/${p.id}`, { headers: authHeader });
        if (checkRes.status === 200) {
          // console.log(`   ⚠️ User ${uId} đã đánh giá cho SP: ${p.productName}`);
          continue;
        }

        let rating = Math.floor(Math.random() * 2) + 4;
        await fetch(`${GATEWAY_URL}/review/${uId}/recommendations/${p.id}?rating=${rating}`, {
          method: 'POST', headers: authHeader
        }).then(res => {
          if (res.ok) console.log(`   ⭐ Đã đánh giá cho SP: ${p.productName}`);
        }).catch(() => { });
      }
    }
  }

  // 6. TẠO VOUCHER
  console.log("\n6. Tạo Voucher...");
  let currentVouchers = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/shop/vouchers/admin/all?size=1000`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      currentVouchers = Array.isArray(data) ? data : (data?.content || []);
    }
  } catch (e) { }

  const vouchersToSeed = [
    { code: "TECH-PRO", type: "DISCOUNT", amount: 500000, min: 5000000 },
    { code: "FREE-SHIP", type: "FREESHIP", amount: 20000, min: 1000000 }
  ];

  for (let v of vouchersToSeed) {
    const vouchersArray = Array.isArray(currentVouchers) ? currentVouchers : (currentVouchers?.content || []);
    if (!vouchersArray.some(existing => existing.code.trim() === v.code.trim())) {
      await fetch(`${GATEWAY_URL}/shop/vouchers/admin/create`, {
        method: 'POST', headers: authHeader,
        body: JSON.stringify({
          code: v.code,
          type: v.type,
          discountAmount: v.amount,
          minOrderValue: v.min,
          usageLimit: 100,
          expirationDate: "2026-12-31"
        })
      }).then(res => {
        if (res.ok) console.log(`   ✅ Đã tạo Voucher: ${v.code}`);
        else console.log(`   ❌ Lỗi tạo Voucher [${v.code}]: ${res.status}`);
      });
    } else {
      console.log(`   ⚠️ Voucher [${v.code}] đã tồn tại.`);
    }
  }

  // 7. TẠO TIN TỨC BLOG
  console.log("\n7. Tạo Tin tức Blog...");
  let currentBlogs = [];
  try {
    const res = await fetch(`${GATEWAY_URL}/blog/admin/articles?size=1000`, { headers: authHeader });
    if (res.ok) {
      const data = await res.json();
      currentBlogs = Array.isArray(data) ? data : (data?.content || []);
    }
  } catch (e) { }

  const blogsToSeed = [
    {
      title: "Apple ra mắt MacBook M3",
      summary: "Thế hệ chip M3 series mới nhất mang lại hiệu năng vượt trội cho dân đồ họa chuyên nghiệp.",
      content: "Apple công bố dòng MacBook Pro mới với chip M3Vào sự kiện rạng sáng nay, Apple đã chính thức ra mắt dòng MacBook Pro mới nhất của hãng được trang bị bộ vi xử lý M3, M3 Pro và M3 Max. Đây là thế hệ chip máy tính đầu tiên trên thế giới được sản xuất bằng tiến trình 3nm, hứa hẹn mang lại hiệu suất vượt trội và thời lượng pin lâu hơn bao giờ hết. Hiệu năng đỉnh cao. Đặc biệt là phiên bản M3 Max, phù hợp cho các tác vụ nặng như render video 8K, giả lập môi trường 3D...",
      thumbnailUrl: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528037/rainbow-forest/products/file_v8jget.jpg",
      status: "PUBLISHED"
    },
    {
      title: "RTX 5090 chuẩn bị ra mắt",
      summary: "Thông tin rò rỉ cho biết Nvidia sẽ sớm giới thiệu dòng card đồ họa Blackwell mới vào cuối năm nay.",
      content: "Nvidia rục rịch ra mắt dòng GPU RTX 50-series.  Các tin đồn mới nhất trong giới công nghệ cho thấy Nvidia đang hoàn thiện thế hệ card đồ họa mới mang kiến trúc Blackwell, với mẫu flagship RTX 5090 dự kiến sẽ có sức mạnh vượt xa người tiền nhiệm RTX 4090. Với dung lượng VRAM GDDR7 tốc độ cao và số lượng nhân CUDA khổng lồ, RTX 5090 hứa hẹn sẽ phá vỡ mọi kỷ lục hiệu năng trước đây.Giá bán dự kiến:$2,000 USD. Tuy nhiên, mức giá của dòng card này được cho là sẽ không hề rẻ, có thể lên tới hơn $2,000 USD.",
      thumbnailUrl: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528134/rainbow-forest/products/file_b3lysz.jpg",
      status: "PUBLISHED"
    },
    {
      title: "Bí quyết chọn mua Bàn phím cơ",
      summary: "Hướng dẫn người mới nhập môn cách phân biệt các loại switch, layout và keycap cơ bản.",
      content: "Cẩm nang chọn bàn phím cơ cho người mới. Bạn muốn mua một chiếc bàn phím cơ nhưng lại choáng ngợp trước hàng tá thông số kỹ thuật? Bài viết này sẽ giúp bạn hiểu rõ hơn về các loại switch (Blue, Red, Brown), các kích cỡ bàn phím phổ biến (Full-size, TKL, 60%), và cách chọn keycap phù hợp với sở thích cá nhân.Switch Blue: Có tiếng clicky rõ ràng, phù hợp cho gõ văn bản nhưng khá ồn.Switch Red:Lực ấn nhẹ, trơn tru, không có khấc, lý tưởng cho chơi game. Switch Brown: Cân bằng giữa gõ phím và chơi game, có khác nhưng không phát ra tiếng clicky.",
      thumbnailUrl: "https://res.cloudinary.com/de0de4yum/image/upload/v1776528156/rainbow-forest/products/file_s0nntg.jpg",
      status: "PUBLISHED"
    }
  ];

  for (let b of blogsToSeed) {
    const blogsArray = Array.isArray(currentBlogs) ? currentBlogs : (currentBlogs?.content || []);
    if (!blogsArray.some(existing => existing.title === b.title)) {
      await fetch(`${GATEWAY_URL}/blog/admin/articles`, {
        method: 'POST', headers: authHeader,
        body: JSON.stringify(b)
      }).then(res => {
        if (res.ok) console.log(`   ✅ Đã tạo Blog Post: ${b.title}`);
        else console.log(`   ❌ Lỗi tạo Blog Post [${b.title}]: ${res.status}`);
      });
    } else {
      console.log(`   ⚠️ Blog Post [${b.title}] đã tồn tại.`);
    }
  }

  // 8. CẤU HÌNH HỆ THỐNG (SMTP, Thông tin Shop)
  console.log("\n8. Cấu hình hệ thống (SMTP, Email)...");
  const systemConfigs = {
    "STORE_NAME": "Phuoc Techno",
    "ADMIN_EMAIL": "admin@phuoctechno.com",
    "SMTP_HOST": "smtp.gmail.com",
    "SMTP_PORT": "587",
    "SMTP_USERNAME": "phuoctechno@gmail.com",
    "SMTP_PASSWORD": "qqqc qphc cysi wrsw"
  };

  try {
    const configRes = await fetch(`${GATEWAY_URL}/notification/api/configs/batch`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(systemConfigs)
    });
    if (configRes.ok) console.log("   ✅ Đã cập nhật cấu hình hệ thống thành công.");
    else console.log(`   ❌ Lỗi cập nhật cấu hình: ${configRes.status}`);
  } catch (e) {
    console.log("   ⚠️ Lỗi kết nối khi cập nhật cấu hình hệ thống.");
  }

  console.log("\n🎉 ✅ TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC BƠM VÀO CÁC BẢNG THÀNH CÔNG!");
}

seed();
