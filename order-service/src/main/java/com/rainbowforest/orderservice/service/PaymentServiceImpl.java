package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.config.VNPayConfig;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private VNPayConfig vnpayConfig;

    @Override
    public String createPaymentUrl(Long orderId, long amount, HttpServletRequest request) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan don hang " + orderId;
        String vnp_OrderType = "other";
        String vnp_TxnRef = orderId + "_" + System.currentTimeMillis();
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        String vnp_TmnCode = vnpayConfig.vnpTmnCode;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", "vn");
        // Ưu tiên dùng URL đã cấu hình qua biến môi trường FRONTEND_URL
        // Ưu tiên tự động detect từ headers khi chạy qua proxy (cloudflared) để tránh "dính" URL cũ
        String rawForwardedHost = request.getHeader("X-Forwarded-Host");
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = null;

        if (rawForwardedHost != null && !rawForwardedHost.isEmpty()) {
            forwardedHost = rawForwardedHost.split(",")[0].trim();
            if (forwardedHost.contains("://")) {
                forwardedHost = forwardedHost.substring(forwardedHost.indexOf("://") + 3);
            }
        }

        String proto = "https";
        if (forwardedProto != null && !forwardedProto.isEmpty()) {
            proto = forwardedProto.split(",")[0].trim();
        }

        String vnp_ReturnUrl;
        // Nếu có X-Forwarded-Host (đang dùng tunnel/proxy), ưu tiên dùng nó luôn
        if (forwardedHost != null && !forwardedHost.isEmpty() && !forwardedHost.contains("localhost")) {
            vnp_ReturnUrl = proto + "://" + forwardedHost + "/api/payment/vnpay-return";
        } 
        // Nếu không có proxy, kiểm tra xem config có URL cố định không (và không phải localhost/tunnel cũ)
        else if (vnpayConfig.vnpReturnUrl != null 
                && !vnpayConfig.vnpReturnUrl.isEmpty() 
                && !vnpayConfig.vnpReturnUrl.contains("localhost") 
                && !vnpayConfig.vnpReturnUrl.contains("127.0.0.1")) { 
            vnp_ReturnUrl = vnpayConfig.vnpReturnUrl;
        } 
        // Cuối cùng là fallback về URL hiện tại của server
        else {
            String scheme = request.getScheme();
            String serverName = request.getServerName();
            int serverPort = request.getServerPort();
            String baseUrl = scheme + "://" + serverName;
            if ((scheme.equals("http") && serverPort != 80) || (scheme.equals("https") && serverPort != 443)) {
                baseUrl += ":" + serverPort;
            }
            vnp_ReturnUrl = baseUrl + "/api/payment/vnpay-return";
        }
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(VNPayConfig.urlEncode(fieldValue));

                query.append(VNPayConfig.urlEncode(fieldName));
                query.append('=');
                query.append(VNPayConfig.urlEncode(fieldValue));

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String hashDataStr = hashData.toString();
        if (hashDataStr.endsWith("&")) {
            hashDataStr = hashDataStr.substring(0, hashDataStr.length() - 1);
        }
        String queryParams = query.toString();
        if (queryParams.endsWith("&")) {
            queryParams = queryParams.substring(0, queryParams.length() - 1);
        }
        
        String vnp_SecureHash = VNPayConfig.hmacSHA512(vnpayConfig.vnpHashSecret, hashDataStr);
        return vnpayConfig.vnpPayUrl + "?" + queryParams + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Override
    public int verifyCallback(Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        Map<String, String> fields = new HashMap<>(queryParams);
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");
        String hashValue = VNPayConfig.hashAllFields(fields, vnpayConfig.vnpHashSecret);
        if (hashValue.equals(vnp_SecureHash)) {
            if ("00".equals(queryParams.get("vnp_ResponseCode"))) {
                return 1; // Success
            } else {
                return 0; // Failed
            }
        } else {
            return -1; // Invalid hash
        }
    }
}
