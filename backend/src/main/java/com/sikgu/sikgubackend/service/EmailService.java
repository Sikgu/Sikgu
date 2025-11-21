package com.sikgu.sikgubackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 비밀번호 재설정 링크가 포함된 이메일을 전송
     * @param toEmail 수신자 이메일 주소
     * @param resetUrl 재설정 링크 (프론트엔드 URL + 토큰)
     */
    public void sendResetPasswordEmail(String toEmail, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("[Sikgu] 비밀번호 재설정 링크 안내");

        String text = "안녕하세요. Sikgu입니다.\n"
                + "비밀번호를 재설정하려면 아래 링크를 클릭해주세요 (30분 유효).\n"
                + "링크: " + resetUrl + "\n\n"
                + "본인이 요청하지 않았다면 이 메일을 무시하셔도 됩니다.";

        message.setText(text);

        try {
            mailSender.send(message);
            log.info("EMAIL SUCCESS: Password reset link sent to {}.", toEmail);
        } catch (Exception e) {
            // 외부 시스템(SMTP 서버) 오류이므로 ERROR 레벨로 기록
            log.error("EMAIL FAILURE: Failed to send reset email to {}. Reason: {}", toEmail, e.getMessage(), e);
            // 이메일 전송 실패는 사용자에게는 "링크가 전송되었습니다"라고 알리는 비동기 작업이므로
        }
    }
}