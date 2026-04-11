package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.config.VietQRConfig;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private com.rainbowforest.orderservice.repository.PaymentConfigRepository paymentConfigRepository;

    @Autowired
    private VietQRConfig vietQRConfig;

    @Override
    public String createPaymentUrl(Long orderId, long amount, HttpServletRequest request) {
        try {
            // Encode các giá trị truyền vào URL để tránh ký tự lạ
            String description = URLEncoder.encode("Thanh toan don hang " + orderId, StandardCharsets.UTF_8);
            
            // ƯU TIÊN: Đọc cấu hình ngân hàng từ Database trước (Nếu có Admin chỉnh sửa)
            com.rainbowforest.orderservice.domain.PaymentConfig dbConfig = paymentConfigRepository.findFirstByActiveTrue().orElse(null);
            
            String bankId, accountNo, accountName, template;
            if (dbConfig != null) {
                bankId = dbConfig.getBankId();
                accountNo = dbConfig.getAccountNo();
                accountName = URLEncoder.encode(dbConfig.getAccountName(), StandardCharsets.UTF_8);
                template = dbConfig.getTemplate();
            } else {
                // Dùng mặc định từ file .properties nếu DB chưa có
                bankId = vietQRConfig.bankId;
                accountNo = vietQRConfig.accountNo;
                accountName = URLEncoder.encode(vietQRConfig.accountName, StandardCharsets.UTF_8);
                template = vietQRConfig.template;
            }

            // Xây dựng đường link hiển thị mã QR dựa trên VietQR.io
            return String.format("https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                    bankId, accountNo, template, amount, description, accountName
            );

        } catch (Exception e) {
            return "Error generating VietQR: " + e.getMessage();
        }
    }

    @Override
    public int verifyCallback(Map<String, String> queryParams) {
        // VietQR trả về kết quả qua app Ngân hàng nên chúng ta mô phỏng thành công
        return 1; 
    }
}
