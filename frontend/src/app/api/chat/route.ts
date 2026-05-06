import { NextResponse } from "next/server";

const BASE_SYSTEM_PROMPT = `Bạn là PHUOC AI, trợ lý ảo thông minh của PHUOC TECHNO.
Quy tắc trả lời:
- Xưng "mình", gọi khách là "bạn", dùng emoji thân thiện.
- TRẢ LỜI NGẮN GỌN (dưới 60 từ).
- Luôn nhắc ĐẦY ĐỦ TÊN sản phẩm bạn muốn gợi ý trong câu trả lời văn bản (Ví dụ: "Bạn tham khảo iPhone 13 và Samsung S23 nhé").
- Sau khi nhắc tên, hãy viết thêm mã #ID (Ví dụ: iPhone 13 #5) để hệ thống hiển thị thẻ sản phẩm.
- Gợi ý tối đa 10 sản phẩm PHÙ HỢP NHẤT. Nếu khách hỏi hãng nào, CHỈ ĐƯỢC gợi ý hãng đó.
- ƯU TIÊN câu hỏi mới nhất. Nếu khách đã đổi sang hỏi dòng máy khác hoặc tầm giá khác, hãy quên đi các dòng máy cũ đã nói trước đó.
- Nếu không có sản phẩm khớp yêu cầu, hãy báo KHÔNG CÓ và tuyệt đối KHÔNG gợi ý hãng khác.`;

interface ProductItem {
  id: number;
  productName: string;
  price: number;
  image?: string;
  category?: { categoryName: string };
  availability: number;
}

let productCache: { data: ProductItem[]; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchProducts(): Promise<ProductItem[]> {
  if (productCache && Date.now() - productCache.fetchedAt < CACHE_TTL) {
    return productCache.data;
  }
  try {
    const apiUrl = process.env.CATALOG_API_URL || "http://localhost:8810";
    const res = await fetch(`${apiUrl}/products?size=100&page=0`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const products = (data.content || data || []) as ProductItem[];
    productCache = { data: products, fetchedAt: Date.now() };
    return products;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

function buildProductContext(products: ProductItem[]): string {
  if (!products.length) return "Hiện chưa có sản phẩm nào trong kho.";
  return (
    "DANH SÁCH SẢN PHẨM TẠI PHUOC TECHNO (dùng #ID khi muốn gợi ý):\n" +
    products
      .map(
        (p) =>
          `ID:#${p.id} | ${p.productName} | Giá: ${Number(p.price).toLocaleString("vi-VN")}đ | ${p.category?.categoryName || "Khác"} | ${p.availability > 0 ? "Còn hàng" : "Hết hàng"}`
      )
      .join("\n")
  );
}

function extractMentionedProducts(text: string, products: ProductItem[]): ProductItem[] {
  const matches = text.match(/#(\d+)/g);
  if (!matches) return [];
  const ids = new Set(matches.map((m) => parseInt(m.slice(1))));
  return products.filter((p) => ids.has(p.id)).slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server chưa cấu hình API Key." }, { status: 500 });
    }

    const body = await req.json();
    const { messages } = body;
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const products = await fetchProducts();

    // Tìm kiếm sơ bộ để thu hẹp ngữ cảnh
    const userMessages = messages.filter((m: any) => m.sender === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.text?.toLowerCase() || "";

    // Bản đồ thương hiệu mở rộng
    const brandMap: Record<string, string[]> = {
      "apple": ["iphone", "ip", "apple", "ios", "nhà táo", "táo", "macbook", "ipad", "airpods"],
      "samsung": ["samsung", "ss", "galaxy", "sam"],
      "xiaomi": ["xiaomi", "mi", "redmi", "mì xào"],
      "pixel": ["pixel", "google"],
      "oppo": ["oppo"],
      "vivo": ["vivo"],
      "realme": ["realme"],
      "nokia": ["nokia"],
      "laptop": ["laptop", "macbook", "may tinh xach tay", "máy tính xách tay", "mtxt"],
      "smartphone": ["điện thoại", "smartphone", "dt", "đt", "phone", "di động"]
    };

    // Kiểm tra xem tin nhắn hiện tại có chứa ý định mới không (Hãng hoặc Giá)
    const hasBrandInCurrent = Object.values(brandMap).flat().some(alias => lastUserMessage.includes(alias));
    const hasPriceInCurrent = /(dưới|khoảng|tầm|hơn)\s+(\d+)\s*(triệu|củ|tr)/i.test(lastUserMessage);

    // Nếu tin nhắn hiện tại mang ý định mới, ta bỏ qua hoàn toàn lịch sử để tránh "hỏi 1 đằng trả lời 1 nẻo"
    const isVagueQuery = lastUserMessage.length < 15 || lastUserMessage.includes("khác") || lastUserMessage.includes("nữa") || lastUserMessage.includes("còn");

    const contextQuery = (hasBrandInCurrent || hasPriceInCurrent)
      ? lastUserMessage
      : (isVagueQuery ? userMessages.slice(-2).map((m: any) => m.text.toLowerCase()).join(" ") : lastUserMessage);

    // Xử lý lọc theo giá
    let maxPrice = Infinity;
    let minPrice = 0;
    const priceMatch = contextQuery.match(/(dưới|khoảng|tầm|hơn)\s+(\d+)\s*(triệu|củ|tr)/i);
    if (priceMatch) {
      const basePrice = parseInt(priceMatch[2]) * 1000000;
      const type = priceMatch[1].toLowerCase();
      if (type === "dưới") {
        maxPrice = basePrice + 1000000;
      } else if (type === "hơn") {
        minPrice = basePrice - 1000000;
      } else {
        minPrice = Math.max(0, basePrice - 1000000);
        maxPrice = basePrice + 1000000;
      }
    }

    const detectedBrands = Object.entries(brandMap)
      .filter(([_, aliases]) => aliases.some(alias => contextQuery.includes(alias)))
      .map(([brand, _]) => brand);

    let relevantProducts = products;

    // Lọc theo giá
    if (maxPrice !== Infinity || minPrice > 0) {
      relevantProducts = relevantProducts.filter(p => p.price >= minPrice && p.price <= maxPrice);
    }

    // Lọc theo thương hiệu/loại
    if (detectedBrands.length > 0) {
      relevantProducts = relevantProducts.filter(p => {
        const pName = p.productName.toLowerCase();
        const cName = p.category?.categoryName?.toLowerCase() || "";
        return detectedBrands.some(brand => {
          const aliases = brandMap[brand];
          const matchAlias = aliases.some(alias => pName.includes(alias) || cName.includes(alias));
          if (brand === "smartphone") return cName === "smartphone" || pName.includes("phone") || matchAlias;
          if (brand === "laptop") return cName === "laptop" || pName.includes("laptop") || matchAlias;
          return pName.includes(brand) || cName.includes(brand) || matchAlias;
        });
      });
    } else if (contextQuery.length >= 2) {
      const ignoreWords = ["bạn", "mình", "cho", "hỏi", "có", "không", "dưới", "cần", "mua", "thế", "nào", "thì", "sao", "cái", "khác", "còn"];
      const words = contextQuery.split(/\s+/).filter(w => w.length >= 2 && !ignoreWords.includes(w));
      if (words.length > 0) {
        relevantProducts = relevantProducts.filter(p => words.some(word => p.productName.toLowerCase().includes(word)));
      }
    }

    // Nếu khách hỏi "còn cái khác ko", ta sẽ xáo trộn danh sách để hiện sản phẩm mới
    if (lastUserMessage.includes("khác") || lastUserMessage.includes("nữa")) {
      relevantProducts = [...relevantProducts].sort(() => Math.random() - 0.5);
    }

    // AI nhận danh sách sản phẩm phù hợp nhất
    const contextProducts = (detectedBrands.length > 0 || maxPrice !== Infinity)
      ? relevantProducts.slice(0, 40)
      : products.slice(0, 20);

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${buildProductContext(contextProducts)}`;

    const chatMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages) {
      if (msg.id === "1") continue;
      chatMessages.push({
        role: msg.sender === "bot" ? "assistant" : "user",
        content: msg.text,
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        max_tokens: 400,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `API lỗi ${response.status}: ${errorData?.error?.message || "Không xác định"}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "Xin lỗi, mình chưa hiểu ý bạn.";

    // QUAN TRỌNG: Chỉ lấy sản phẩm từ contextProducts (những thứ AI thực sự thấy ở lượt này)
    const suggestedProducts = extractMentionedProducts(responseText, contextProducts);

    // Làm sạch văn bản: Xóa sạch các mã #ID để người dùng không thấy
    const cleanText = responseText
      .replace(/#\d+/g, "")
      .replace(/,\s*,/g, ",")
      .replace(/:\s*,/g, ":")
      .replace(/,\s*\./g, ".")
      .replace(/,\s*$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    return NextResponse.json({ text: cleanText, suggestedProducts });
  } catch (error: any) {
    console.error("Chat API Error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Lỗi kết nối." }, { status: 500 });
  }
}
