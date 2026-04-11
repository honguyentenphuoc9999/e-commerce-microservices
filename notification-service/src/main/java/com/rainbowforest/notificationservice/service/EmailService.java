package com.rainbowforest.notificationservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(String toEmail, String userName, Long orderId, Double totalAmount) throws MessagingException {
        sendHtmlEmail(toEmail, "🌈 Xác Nhận Đơn Hàng #" + orderId, buildOrderEmail(userName, orderId, totalAmount));
    }

    public void sendForgotPassword(String toEmail, String userName, String resetToken) throws MessagingException {
        sendHtmlEmail(toEmail, "🔑 Đặt Lại Mật Khẩu", buildForgotPasswordEmail(userName, resetToken));
    }

    public void sendPromotion(String toEmail, String userName, String voucherCode, String discount) throws MessagingException {
        sendHtmlEmail(toEmail, "🎁 Quà Tặng Đặc Biệt: Giảm " + discount + "!", buildPromotionEmail(userName, voucherCode, discount));
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom("newsletter@rainbowforest.com");
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    private String buildOrderEmail(String userName, Long orderId, Double totalAmount) {
        return "<html><body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;'>" +
                "<div style='text-align: center; margin-bottom: 20px;'><h1 style='color: #2e7d32; margin: 0;'>🌈 RAINBOW FOREST</h1><p style='color: #666; margin: 5px 0;'>Cảm ơn bạn đã tin tưởng chúng tôi!</p></div>" +
                "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
                "<h3>Chào " + userName + ",</h3>" +
                "<p>Chúc mừng! Đơn hàng <strong>#" + orderId + "</strong> của bạn đã được xác nhận thành công.</p>" +
                "<p><strong>Tổng thanh toán:</strong> <span style='color: #d32f2f; font-size: 18px;'>" + String.format("%,.0f", totalAmount) + " VNĐ</span></p></div>" +
                "<div style='text-align: center;'><a href='#' style='background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Xem chi tiết đơn hàng</a></div>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />" +
                "<p style='font-size: 12px; color: #999; text-align: center;'>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ hỗ trợ tại support@rainbowforest.com</p></body></html>";
    }

    private String buildForgotPasswordEmail(String userName, String resetToken) {
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        return "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;'>" +
                "<h2 style='color: #1976d2; text-align: center;'>🔒 Đặt Lại Mật Khẩu</h2>" +
                "<p>Chào <strong>" + userName + "</strong>,</p>" +
                "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để tiếp tục:</p>" +
                "<div style='text-align: center; margin: 30px 0;'><a href='" + resetLink + "' style='background-color: #1976d2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Đổi Mật Khẩu Ngay</a></div>" +
                "<p style='color: #d32f2f; font-size: 13px;'>* Liên kết này sẽ hết hạn sau 15 phút vì lý do bảo mật.</p>" +
                "<p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p></body></html>";
    }

    private String buildPromotionEmail(String userName, String voucherCode, String discount) {
        return "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fffde7; border: 2px dashed #fbc02d; border-radius: 15px; text-align: center;'>" +
                "<h1 style='color: #f57f17;'>🎁 QUÀ TẶNG BẤT NGỜ! 🎁</h1>" +
                "<p>Chào <strong>" + userName + "</strong>, chúng tôi dành riêng cho bạn ưu đãi đặc biệt này:</p>" +
                "<div style='font-size: 30px; color: #d84315; margin: 20px 0; font-weight: bold;'>GIẢM GIÁ " + discount + "</div>" +
                "<div style='background-color: white; border: 1px solid #fbc02d; padding: 10px; display: inline-block; font-size: 20px; letter-spacing: 2px;'>CODE: <strong>" + voucherCode + "</strong></div>" +
                "<p style='margin-top: 20px;'>Nhanh tay sử dụng trước khi hết hạn bạn nhé!</p>" +
                "<a href='http://localhost:3000' style='display: inline-block; margin-top: 10px; background-color: #fbc02d; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>MUA SẮM NGAY</a>" +
                "</body></html>";
    }
}
