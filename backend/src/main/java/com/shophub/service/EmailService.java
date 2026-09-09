package com.shophub.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${shophub.mail.from:no-reply@shophub.com}")
    private String from;

    @Value("${shophub.mail.enabled:false}")
    private boolean mailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        if (!mailEnabled) {
            log.info("Email disabled - would have sent welcome email to {}", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("Welcome to ShopHub! 🎉");

            String html = """
                    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
                      <div style="background:#3b6cf6;padding:24px;text-align:center">
                        <h1 style="color:#fff;margin:0;font-size:22px">Welcome to ShopHub 🛍️</h1>
                      </div>
                      <div style="padding:28px;color:#374151;line-height:1.6">
                        <p>Hi <b>%s</b>,</p>
                        <p>Your ShopHub account was created successfully. You can now:</p>
                        <ul>
                          <li>Browse our full product catalog</li>
                          <li>Add items to your cart</li>
                          <li>Place orders with COD or UPI</li>
                          <li>Track your order history</li>
                        </ul>
                        <p style="margin-top:24px">
                          <a href="https://shophub-demo.vercel.app" style="background:#3b6cf6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">Start Shopping</a>
                        </p>
                        <p style="margin-top:24px;font-size:13px;color:#9ca3af">If you didn't create this account, you can safely ignore this email.</p>
                      </div>
                    </div>
                    """.formatted(firstName);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Welcome email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
        }
    }
}