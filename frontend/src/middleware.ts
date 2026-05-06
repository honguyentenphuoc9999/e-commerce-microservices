import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Đảm bảo X-Forwarded-Host và X-Forwarded-Proto luôn có giá trị SẠCH
// khi Next.js proxy API requests đến Spring Boot (qua cloudflared).
// Ghi đè hoàn toàn để tránh proxy chain ghép nhiều giá trị vào header.
export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)

    // Luôn set x-forwarded-host = hostname gốc (Host header, không có protocol)
    const host = request.headers.get('host')
    if (host) {
        requestHeaders.set('x-forwarded-host', host)
    }

    // Set x-forwarded-proto: lấy từ cloudflare nếu có, fallback https
    const proto = request.headers.get('x-forwarded-proto') || 'https'
    requestHeaders.set('x-forwarded-proto', proto)

    return NextResponse.next({
        request: { headers: requestHeaders },
    })
}

export const config = {
    matcher: '/api/:path*',
}
