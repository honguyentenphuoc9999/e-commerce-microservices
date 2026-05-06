package com.rainbowforest.notificationservice.service;

import com.rainbowforest.notificationservice.entity.EmailLog;
import com.rainbowforest.notificationservice.repository.EmailLogRepository;
import com.rainbowforest.notificationservice.repository.SystemConfigRepository;
import jakarta.mail.MessagingException;
import java.util.List;
import java.util.Map;
import com.rainbowforest.notificationservice.controller.EmailController.OrderItemDTO;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Properties;

@Service
public class EmailService {

    @Autowired
    private EmailLogRepository emailLogRepository;

    @Autowired
    private SystemConfigRepository configRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private JavaMailSenderImpl getDynamicMailSender() {
        String host = configRepository.findById("SMTP_HOST").map(c -> c.getConfigValue()).orElse("smtp.gmail.com");
        String portStr = configRepository.findById("SMTP_PORT").map(c -> c.getConfigValue()).orElse("587");
        String username = configRepository.findById("SMTP_USERNAME").map(c -> c.getConfigValue()).orElse("YOUR_GMAIL@gmail.com");
        String password = configRepository.findById("SMTP_PASSWORD").map(c -> c.getConfigValue()).orElse("YOUR_APP_PASSWORD");

        if ("YOUR_GMAIL@gmail.com".equals(username) || "YOUR_APP_PASSWORD".equals(password)) {
            System.err.println("CRITICAL: SMTP is not configured in DB. Using placeholder credentials which WILL FAIL.");
            throw new RuntimeException("Hệ thống chưa cấu hình Email (SMTP). Vui lòng liên hệ quản trị viên.");
        }

        System.out.println("DEBUG: Sending email via " + host + ":" + portStr + " as " + username);

        JavaMailSenderImpl mailSenderImpl = new JavaMailSenderImpl();
        mailSenderImpl.setHost(host);
        mailSenderImpl.setPort(Integer.parseInt(portStr));
        mailSenderImpl.setUsername(username);
        mailSenderImpl.setPassword(password);

        Properties props = mailSenderImpl.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");
        // Add timeout to prevent long hanging connection
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSenderImpl;
    }

    public void sendOrderConfirmation(String toEmail, String userName, Long orderId, Double totalAmount, String overriddenFrontendUrl, List<OrderItemDTO> items, String shippingAddress, String paymentMethod, String status) throws MessagingException {
        String subject = "PAID".equalsIgnoreCase(status) ? "🧾 Hóa đơn điện tử - Đơn hàng #" + orderId : "🌈 Xác Nhận Đơn Hàng #" + orderId;
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildOrderEmail(userName, orderId, totalAmount, currentFrontendUrl, items, shippingAddress, paymentMethod, status);
        sendHtmlEmail(toEmail, subject, content, "ORDER_CONFIRMATION");
    }

    public void sendPaymentFailed(String toEmail, String userName, Long orderId, Double totalAmount, String reason) throws MessagingException {
        String subject = "❌ Thanh toán thất bại - Đơn hàng #" + orderId;
        String content = buildPaymentFailedEmail(userName, orderId, totalAmount, reason);
        sendHtmlEmail(toEmail, subject, content, "PAYMENT_FAILED");
    }

    public void sendForgotPassword(String toEmail, String userName, String resetToken, String overriddenFrontendUrl) throws MessagingException {
        String subject = "🔑 Đặt Lại Mật Khẩu";
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildForgotPasswordEmail(userName, resetToken, currentFrontendUrl);
        sendHtmlEmail(toEmail, subject, content, "FORGOT_PASSWORD");
    }

    public void sendPromotion(String toEmail, String userName, String voucherCode, String discount, String overriddenFrontendUrl) throws MessagingException {
        String subject = "🎁 Quà Tặng Đặc Biệt: Giảm " + discount + "!";
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildPromotionEmail(userName, voucherCode, discount, currentFrontendUrl);
        sendHtmlEmail(toEmail, subject, content, "PROMOTION");
    }

    public void sendAccountRecovery(String toEmail, String userName, String overriddenFrontendUrl) throws MessagingException {
        String subject = "🛡️ Khôi Phục Tài Khoản";
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildAccountRecoveryEmail(userName, currentFrontendUrl);
        sendHtmlEmail(toEmail, subject, content, "ACCOUNT_RECOVERY");
    }

    public void sendOrderCancellation(String toEmail, String userName, Long orderId, String reason, String overriddenFrontendUrl) throws MessagingException {
        String subject = "🚫 Thông báo hủy đơn hàng #" + orderId;
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildOrderCancellationEmail(userName, orderId, reason, currentFrontendUrl);
        sendHtmlEmail(toEmail, subject, content, "ORDER_CANCELLATION");
    }

    public void sendOrderCompletion(String toEmail, String userName, Long orderId, String overriddenFrontendUrl) throws MessagingException {
        String subject = "✨ Giao hàng thành công - Cảm ơn bạn đã đồng hành cùng PHUOC TECHNO! #" + orderId;
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildOrderCompletionEmail(userName, orderId, currentFrontendUrl);
        sendHtmlEmail(toEmail, subject, content, "ORDER_COMPLETION");
    }

    public void sendRefundConfirmation(String toEmail, String userName, Long orderId, String overriddenFrontendUrl) throws MessagingException {
        String subject = "✅ Xác nhận hoàn tiền thành công - Đơn hàng #" + orderId;
        String currentFrontendUrl = (overriddenFrontendUrl != null && !overriddenFrontendUrl.isEmpty()) ? overriddenFrontendUrl : frontendUrl;
        String content = buildRefundConfirmationEmail(userName, orderId, currentFrontendUrl);
        sendHtmlEmail(toEmail, subject, content, "REFUND_CONFIRMATION");
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent, String type) throws MessagingException {
        JavaMailSenderImpl dynamicSender = getDynamicMailSender();
        
        MimeMessage message = dynamicSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(dynamicSender.getUsername());
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        dynamicSender.send(message);

        // Log email to database
        EmailLog log = new EmailLog(toEmail, subject, htmlContent, type);
        emailLogRepository.save(log);
    }

    private String buildOrderEmail(String userName, Long orderId, Double totalAmount, String currentFrontendUrl, List<OrderItemDTO> items, String shippingAddress, String paymentMethod, String status) {
        boolean isPaid = "PAID".equalsIgnoreCase(status);
        StringBuilder itemsHtml = new StringBuilder();
        if (items != null && !items.isEmpty()) {
            itemsHtml.append("<table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>");
            itemsHtml.append("<tr style='background-color: #f2f2f2;'><th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Sản phẩm</th><th style='padding: 10px; border: 1px solid #ddd; text-align: center;'>SL</th><th style='padding: 10px; border: 1px solid #ddd; text-align: right;'>Giá</th></tr>");
            for (OrderItemDTO item : items) {
                itemsHtml.append("<tr>");
                itemsHtml.append("<td style='padding: 10px; border: 1px solid #ddd;'>").append(item.getProductName()).append("</td>");
                itemsHtml.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: center;'>").append(item.getQuantity()).append("</td>");
                itemsHtml.append("<td style='padding: 10px; border: 1px solid #ddd; text-align: right;'>").append(String.format("%,.0f", item.getPrice())).append(" VNĐ</td>");
                itemsHtml.append("</tr>");
            }
            itemsHtml.append("</table>");
        }

        String infoSection = String.format(
            "<div style='margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 12px; background-color: #fafafa;'>" +
            "<p style='margin: 8px 0; font-size: 14px;'><strong>📍 Địa chỉ giao hàng:</strong> %s</p>" +
            "<p style='margin: 8px 0; font-size: 14px;'><strong>💳 Phương thức:</strong> %s</p>" +
            "<p style='margin: 8px 0; font-size: 14px;'><strong>📝 Trạng thái:</strong> <span style='color: %s; font-weight: 900; letter-spacing: 1px;'>%s</span></p>" +
            "</div>",
            shippingAddress != null ? shippingAddress : "Chưa cập nhật",
            paymentMethod != null ? paymentMethod : "Chưa xác định",
            isPaid ? "#e9c349" : "#f57c00",
            isPaid ? "ĐÃ THANH TOÁN THÀNH CÔNG" : "ĐANG CHỜ THANH TOÁN"
        );

        String supportSection = 
            "<div style='margin-top: 20px; padding: 15px; border-left: 4px solid #2e7d32; background-color: #e8f5e9; font-size: 14px;'>" +
            "<p style='margin: 0; font-weight: bold; color: #2e7d32;'>🛠️ Xử lý sự cố & Hỗ trợ:</p>" +
            "<p style='margin: 5px 0;'>Nếu bạn đã bị trừ tiền nhưng hệ thống chưa cập nhật, vui lòng gửi ảnh chụp màn hình giao dịch tới <strong>support@rainbowforest.com</strong> hoặc gọi hotline <strong>1900-xxxx</strong>.</p>" +
            "</div>";

        String refundSection = isPaid ? 
            "<div style='margin-top: 10px; padding: 15px; border-left: 4px solid #1976d2; background-color: #e3f2fd; font-size: 14px;'>" +
            "<p style='margin: 0; font-weight: bold; color: #1976d2;'>🔄 Chính sách hoàn tiền:</p>" +
            "<p style='margin: 5px 0;'>Trong trường hợp giao dịch lỗi hoặc cần hoàn tiền, quy trình sẽ được xử lý trong 3-5 ngày làm việc. Xem chi tiết thủ tục tại <a href='" + currentFrontendUrl + "/policy/refund'>đây</a>.</p>" +
            "</div>" : "";

        String logoUrl = "https://res.cloudinary.com/de0de4yum/image/upload/v1777141182/phuoctechno_hwcqll.png";
        String vatInfo = isPaid ? 
            "<p style='font-size: 12px; color: #94a3b8; margin-top: 10px; text-align: center;'>* Đây là bản sao hóa đơn điện tử (VAT) tạm thời. Hóa đơn chính thức sẽ được gửi sau khi giao hàng thành công.</p>" : "";

        return "<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head>" +
                "<body style='font-family: \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 15px; background-color: #f9f9f9;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eee; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);'>" +
                "<div style='text-align: center; margin-bottom: 30px;'>" +
                "<img src='" + logoUrl + "' alt='PHUOC TECHNO' style='width: 90px; margin-bottom: 15px;' />" +
                "<h1 style='color: #0f172a; margin: 0; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-size: 24px;'>PHUOC TECHNO</h1>" +
                "<p style='color: #e9c349; margin: 5px 0; font-weight: 900; letter-spacing: 4px; font-size: 11px;'>" + (isPaid ? "HÓA ĐƠN ĐIỆN TỬ" : "XÁC NHẬN ĐƠN HÀNG") + "</p></div>" +
                "<div style='background-color: #0f172a; color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);'>" +
                "<h3 style='margin-top: 0; color: #e9c349; font-size: 18px;'>Chào " + userName + ",</h3>" +
                "<p style='font-size: 14px; opacity: 0.9; margin-bottom: 15px;'>" + (isPaid ? "Thanh toán của bạn đã được xác thực thành công. Dưới đây là chi tiết hóa đơn điện tử cho đơn hàng của bạn." : "Đơn hàng của bạn đã được tiếp nhận và đang chờ thanh toán để được xử lý.") + "</p>" +
                "<p style='margin: 15px 0; font-size: 13px; opacity: 0.7;'>Mã đơn hàng: <strong style='color: #e9c349;'>#" + orderId + "</strong></p>" +
                "<div style='font-size: 28px; font-weight: 900; color: #e9c349; margin: 10px 0;'>" + String.format("%,.0f", totalAmount) + " <span style='font-size: 14px;'>VNĐ</span></div></div>" +
                "<div style='overflow-x: auto;'>" +
                itemsHtml.toString() +
                "</div>" +
                infoSection +
                (isPaid ? "<p style='font-size: 13px; color: #e9c349; font-weight: bold; margin-top: 20px; text-align: center;'>✨ Chúc mừng! Bạn vừa tích lũy thêm " + String.format("%,.0f", totalAmount/1000) + " điểm VIP.</p>" : "") +
                vatInfo +
                supportSection.replace("support@rainbowforest.com", "contact@phuoctechno.com") +
                refundSection +
                "<div style='text-align: center; margin-top: 40px; margin-bottom: 20px;'><a href='" + currentFrontendUrl + "/profile/orders/" + orderId + "' style='background-color: #e9c349; color: #0f172a; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; box-shadow: 0 4px 6px -1px rgba(233, 195, 73, 0.2); display: inline-block;'>Theo dõi hành trình</a></div>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 30px 0;' />" +
                "<p style='font-size: 10px; color: #94a3b8; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>PHUOC TECHNO - Đột phá công nghệ, nâng tầm cuộc sống.</p>" +
                "</div></body></html>";
    }

    private String buildOrderCompletionEmail(String userName, Long orderId, String currentFrontendUrl) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;'>" +
                "<div style='text-align: center; margin-bottom: 20px;'><h1 style='color: #1a237e; margin: 0;'>✨ PHUOC TECHNO ✨</h1>" +
                "<p style='color: #666; margin: 5px 0;'>GIAO HÀNG THÀNH CÔNG</p></div>" +
                "<div style='background-color: #e8eaf6; padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center;'>" +
                "<h2 style='color: #1a237e;'>Cảm ơn " + userName + "!</h2>" +
                "<p>Đơn hàng <strong>#" + orderId + "</strong> đã chính thức được giao tới tay bạn.</p>" +
                "<p>Chúng tôi hy vọng bạn hài lòng với sản phẩm và dịch vụ của PHUOC TECHNO.</p></div>" +
                "<div style='padding: 15px; border-left: 4px solid #1a237e; background-color: #f5f5f5; font-size: 14px;'>" +
                "<p style='margin: 0; font-weight: bold; color: #1a237e;'>🎁 Đặc quyền của bạn:</p>" +
                "<p style='margin: 5px 0;'>Bạn đã nhận được điểm thưởng cho đơn hàng này. Sử dụng điểm để giảm giá cho lần mua sắm tiếp theo nhé!</p></div>" +
                "<div style='text-align: center; margin-top: 30px;'><a href='" + currentFrontendUrl + "' style='background-color: #1a237e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Tiếp tục mua sắm</a></div>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 30px 0;' />" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>Đội ngũ PHUOC TECHNO chân thành cảm ơn.</p></body></html>";
    }

    private String buildPaymentFailedEmail(String userName, Long orderId, Double totalAmount, String reason) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffcdd2; border-radius: 10px;'>" +
                "<div style='text-align: center; margin-bottom: 20px;'><h1 style='color: #d32f2f; margin: 0;'>⚠️ THANH TOÁN THẤT BẠI</h1></div>" +
                "<p>Chào <strong>" + userName + "</strong>,</p>" +
                "<p>Rất tiếc, giao dịch thanh toán cho đơn hàng <strong>#" + orderId + "</strong> của bạn không thành công.</p>" +
                "<div style='background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;'>" +
                "<p style='margin: 0;'><strong>Lý do:</strong> " + (reason != null ? reason : "Giao dịch bị từ chối hoặc hết hạn.") + "</p>" +
                "<p style='margin: 5px 0;'><strong>Số tiền cần thanh toán:</strong> " + String.format("%,.0f", totalAmount) + " VNĐ</p></div>" +
                "<p>Bạn có thể thử lại bằng cách truy cập vào lịch sử đơn hàng và nhấn 'Thanh toán lại'.</p>" +
                "<div style='padding: 15px; border-left: 4px solid #d32f2f; background-color: #fff9c4; font-size: 14px; margin-top: 20px;'>" +
                "<p style='margin: 0; font-weight: bold;'>🆘 Bạn đã bị trừ tiền?</p>" +
                "<p style='margin: 5px 0;'>Nếu tài khoản của bạn đã bị trừ tiền nhưng nhận được thông báo này, đừng lo lắng! Vui lòng liên hệ hỗ trợ ngay để được kiểm tra và hoàn tiền tự động.</p></div>" +
                "<div style='text-align: center; margin-top: 30px;'><a href='" + frontendUrl + "/profile/orders' style='background-color: #d32f2f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Quay lại đơn hàng</a></div>" +
                "</body></html>";
    }

    private String buildForgotPasswordEmail(String userName, String resetToken, String currentFrontendUrl) {
        String resetLink = currentFrontendUrl + "/reset-password?token=" + resetToken;
        String logoUrl = "https://res.cloudinary.com/de0de4yum/image/upload/v1777141182/phuoctechno_hwcqll.png";
        
        return "<html><body style='font-family: \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px; background-color: #ffffff;'>" +
                "<div style='text-align: center; margin-bottom: 30px;'>" +
                "<img src='" + logoUrl + "' alt='PHUOC TECHNO' style='width: 100px; margin-bottom: 15px;' />" +
                "<h1 style='color: #0f172a; margin: 0; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;'>PHUOC TECHNO</h1>" +
                "<p style='color: #e9c349; margin: 5px 0; font-weight: 900; letter-spacing: 4px; font-size: 12px;'>BẢO MẬT TÀI KHOẢN</p></div>" +
                "<div style='background-color: #0f172a; color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);'>" +
                "<h3 style='margin-top: 0; color: #e9c349;'>Chào " + userName + ",</h3>" +
                "<p style='font-size: 15px; opacity: 0.9;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên hệ thống PHUOC TECHNO. Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới.</p>" +
                "</div>" +
                "<div style='text-align: center; margin: 40px 0;'>" +
                "<a href='" + resetLink + "' style='background-color: #e9c349; color: #0f172a; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; box-shadow: 0 4px 6px -1px rgba(233, 195, 73, 0.2); display: inline-block;'>ĐẶT LẠI MẬT KHẨU NGAY</a>" +
                "</div>" +
                "<div style='margin-top: 30px; padding: 15px; border-left: 4px solid #ef4444; background-color: #fef2f2; font-size: 14px; border-radius: 0 8px 8px 0;'>" +
                "<p style='margin: 0; font-weight: bold; color: #ef4444;'>⚠️ Lưu ý quan trọng:</p>" +
                "<p style='margin: 5px 0; color: #7f1d1d;'>Liên kết này sẽ <strong>hết hạn sau 15 phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và kiểm tra lại bảo mật tài khoản.</p>" +
                "</div>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 40px 0;' />" +
                "<p style='font-size: 11px; color: #94a3b8; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;'>PHUOC TECHNO - Đột phá công nghệ, nâng tầm cuộc sống.</p></body></html>";
    }

    private String buildPromotionEmail(String userName, String voucherCode, String discount, String currentFrontendUrl) {
        return "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fffde7; border: 2px dashed #fbc02d; border-radius: 15px; text-align: center;'>" +
                "<h1 style='color: #f57f17;'>🎁 QUÀ TẶNG BẤT NGỜ! 🎁</h1>" +
                "<p>Chào <strong>" + userName + "</strong>, chúng tôi dành riêng cho bạn ưu đãi đặc biệt này:</p>" +
                "<div style='font-size: 30px; color: #d84315; margin: 20px 0; font-weight: bold;'>GIẢM GIÁ " + discount + "</div>" +
                "<div style='background-color: white; border: 1px solid #fbc02d; padding: 10px; display: inline-block; font-size: 20px; letter-spacing: 2px;'>CODE: <strong>" + voucherCode + "</strong></div>" +
                "<p style='margin-top: 20px;'>Nhanh tay sử dụng trước khi hết hạn bạn nhé!</p>" +
                "<a href='" + currentFrontendUrl + "' style='display: inline-block; margin-top: 10px; background-color: #fbc02d; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>MUA SẮM NGAY</a>" +
                "</body></html>";
    }

    private String buildAccountRecoveryEmail(String userName, String currentFrontendUrl) {
        return "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;'>" +
                "<h2 style='color: #2e7d32; text-align: center;'>🛡️ Khôi Phục Tài Khoản</h2>" +
                "<p>Chào <strong>" + userName + "</strong>,</p>" +
                "<p>Tài khoản của bạn đã được khôi phục thành công sau thời gian tạm khóa. Bây giờ bạn có thể đăng nhập lại và tiếp tục mua sắm.</p>" +
                "<div style='text-align: center; margin: 30px 0;'><a href='" + currentFrontendUrl + "/login' style='background-color: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Đăng Nhập Ngay</a></div>" +
                "<p>Nếu bạn gặp bất kỳ khó khăn nào, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>" +
                "<p>Trân trọng,<br/>Đội ngũ PHUOC TECHNO</p></body></html>";
    }

    private String buildOrderCancellationEmail(String userName, Long orderId, String reason, String currentFrontendUrl) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffcdd2; border-radius: 10px;'>" +
                "<div style='text-align: center; margin-bottom: 20px;'><h1 style='color: #d32f2f; margin: 0;'>🚫 THÔNG BÁO HỦY ĐƠN HÀNG</h1></div>" +
                "<p>Chào <strong>" + userName + "</strong>,</p>" +
                "<p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#" + orderId + "</strong> của bạn đã bị hủy bởi hệ thống/quản trị viên.</p>" +
                "<div style='background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #d32f2f;'>" +
                "<p style='margin: 0; font-weight: bold; color: #d32f2f;'>Lý do hủy đơn:</p>" +
                "<p style='margin: 5px 0; font-style: italic;'>" + (reason != null ? reason : "PHUOC TECHNO không thể đáp ứng đơn hàng vào lúc này.") + "</p></div>" +
                "<p>Nếu bạn đã thanh toán cho đơn hàng này, số tiền sẽ được hoàn trả vào tài khoản của bạn trong vòng 3-5 ngày làm việc theo chính sách của ngân hàng.</p>" +
                "<p>Mọi thắc mắc xin vui lòng liên hệ hotline <strong>1900-xxxx</strong> để được hỗ trợ nhanh nhất.</p>" +
                "<div style='text-align: center; margin-top: 30px;'><a href='" + currentFrontendUrl + "' style='background-color: #d32f2f; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Quay lại cửa hàng</a></div>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 30px 0;' />" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>PHUOC TECHNO xin lỗi vì sự bất tiện này.</p></body></html>";
    }

    private String buildRefundConfirmationEmail(String userName, Long orderId, String currentFrontendUrl) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c8e6c9; border-radius: 10px;'>" +
                "<div style='text-align: center; margin-bottom: 20px;'><h1 style='color: #2e7d32; margin: 0;'>✅ HOÀN TIỀN THÀNH CÔNG</h1></div>" +
                "<p>Chào <strong>" + userName + "</strong>,</p>" +
                "<p>Chúng tôi xác nhận đã thực hiện hoàn trả số tiền giao dịch cho đơn hàng <strong>#" + orderId + "</strong> thành công.</p>" +
                "<div style='background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #2e7d32;'>" +
                "<p style='margin: 0; font-weight: bold; color: #2e7d32;'>Trạng thái: Đã hoàn tất hoàn tiền</p>" +
                "<p style='margin: 5px 0;'>Số tiền sẽ được ghi có vào tài khoản/thẻ bạn đã dùng để thanh toán. Thời gian hiển thị số dư tùy thuộc vào quy trình của ngân hàng phát hành (thường từ 2-7 ngày làm việc).</p></div>" +
                "<p>Cảm ơn bạn đã thông cảm cho sự bất tiện này. Hy vọng sẽ được phục vụ bạn trong những lần mua sắm tới.</p>" +
                "<div style='text-align: center; margin-top: 30px;'><a href='" + currentFrontendUrl + "' style='background-color: #2e7d32; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Tiếp tục mua sắm</a></div>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 30px 0;' />" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>Trân trọng, Đội ngũ PHUOC TECHNO.</p></body></html>";
    }
}
