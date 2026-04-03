package com.fyp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@skillsync.com}")
    private String fromEmail;

    @Value("${app.name:SkillSync}")
    private String appName;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Async
    public void sendVerificationOTP(String toEmail, String otpCode) {
        String subject = "Verify your email for SkillSync";
        String htmlContent = buildOTPEmailTemplate(otpCode, toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String subject = "Reset your SkillSync password";
        String htmlContent = buildPasswordResetTemplate(resetToken, toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String message) {
        sendSimpleEmail(toEmail, subject, message);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        String subject = "Welcome to SkillSync!";
        String htmlContent = buildWelcomeTemplate(userName);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    /**
     * Send OTP for sensitive action verification (2FA)
     */
    @Async
    public void sendOtpEmail(String toEmail, String otpCode, String action) {
        String actionDescription = getActionDescription(action);
        String subject = "Verify your action: " + actionDescription;
        String htmlContent = buildActionOTPEmailTemplate(otpCode, toEmail, actionDescription);
        sendHtmlEmail(toEmail, subject, htmlContent);
        log.info("OTP email sent for action {} to {}", action, toEmail);
    }

    private String getActionDescription(String action) {
        return switch (action.toUpperCase()) {
            case "PROJECT_SUBMIT" -> "Project Submission";
            case "MENTOR_REQUEST" -> "Mentor Request";
            case "TEAM_DELETE" -> "Team Deletion";
            case "PROFILE_UPDATE" -> "Profile Update";
            default -> "Sensitive Action";
        };
    }

    @Async
    public void sendTeamInvitationEmail(String toEmail, String inviteeName, String teamName, String inviterName,
            String inviteToken) {
        String subject = "You've been invited to join " + teamName;
        String htmlContent = buildTeamInvitationTemplate(inviteeName, teamName, inviterName, inviteToken, toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendMentorRequestEmail(String toEmail, String mentorName, String teamName, String projectTitle,
            String requestId) {
        String subject = "Mentorship Request from team: " + teamName;
        String htmlContent = buildMentorRequestTemplate(mentorName, teamName, projectTitle, requestId, toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendTaskAssignedEmail(String toEmail, String assigneeName, String taskTitle, String projectName,
            String dueDate, String taskId) {
        String subject = "New Task Assigned: " + taskTitle;
        String htmlContent = buildTaskAssignedTemplate(assigneeName, taskTitle, projectName, dueDate, taskId, toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendDocumentGeneratedEmail(String toEmail, String userName, String documentType, String projectTitle) {
        String subject = documentType + " generated for project: " + projectTitle;
        String htmlContent = buildDocumentGeneratedTemplate(userName, documentType, projectTitle, toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendMeetingScheduledEmail(String toEmail, String userName, String meetingTitle, String dateStr,
            String timeStr, String meetingLink) {
        String subject = "Meeting Scheduled: " + meetingTitle;
        String htmlContent = buildMeetingScheduledTemplate(userName, meetingTitle, dateStr, timeStr, meetingLink,
                toEmail);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    private String buildActionOTPEmailTemplate(String otpCode, String email, String actionDescription) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Action</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <!-- Header with Logo -->
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Security Icon -->
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #dbeafe; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #3b82f6; font-family: monospace;">Sec</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">Verify your action</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280;">Enter this code to confirm: <strong style="color: #3b82f6;">%s</strong></p>
                                        </td>
                                    </tr>

                                    <!-- OTP Code Box -->
                                    <tr>
                                        <td style="padding: 0 40px 32px;">
                                            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; padding: 24px; text-align: center;">
                                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #ffffff; font-family: 'Courier New', monospace;">%s</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Info Text -->
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">This code will expire in <strong style="color: #3b82f6;">10 minutes</strong></p>
                                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">If you didn't request this code, please ignore this email and your account will remain secure.</p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 SkillSync. All rights reserved.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, actionDescription, otpCode, email);
    }

    private void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: {}", to, e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: {}", to, e);
        }
    }

    private String buildOTPEmailTemplate(String otpCode, String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verify Your Email</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <!-- Header with Logo -->
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">Verify your email</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280;">Enter this code to complete your sign-up</p>
                                        </td>
                                    </tr>

                                    <!-- OTP Code Box -->
                                    <tr>
                                        <td style="padding: 0 40px 32px;">
                                            <div style="background: linear-gradient(135deg, #ff5754, #ff9a76); border-radius: 16px; padding: 24px; text-align: center;">
                                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #ffffff; font-family: 'Courier New', monospace;">%s</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Info Text -->
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">This code will expire in <strong style="color: #ff5754;">5 minutes</strong></p>
                                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">If you didn't request this code, you can safely ignore this email.</p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 SkillSync. All rights reserved.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, otpCode, email);
    }

    private String buildPasswordResetTemplate(String resetToken, String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Reset Your Password</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <!-- Header with Logo -->
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Icon -->
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #fef3c7; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #ca8a04; font-family: monospace;">Key</span>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 0 40px 24px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">Reset your password</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">We received a request to reset the password for your account.</p>
                                        </td>
                                    </tr>

                                    <!-- Button -->
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <a href="%s/auth/reset-password?token=%s" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);">Reset Password</a>
                                        </td>
                                    </tr>

                                    <!-- Info Text -->
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">This link will expire in <strong style="color: #ff5754;">1 hour</strong></p>
                                            <p style="margin: 0; font-size: 13px; color: #9ca3af;">If you didn't request this, you can safely ignore this email.</p>
                                        </td>
                                    </tr>

                                    <!-- Divider -->
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 SkillSync. All rights reserved.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, frontendUrl, resetToken, email);
    }

    private String buildWelcomeTemplate(String userName) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to SkillSync</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <!-- Gradient Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #ff5754, #ff9a76); padding: 48px 40px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <div style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 32px; font-weight: 800; color: #ffffff; text-align: center; letter-spacing: -1px; margin: 0 auto;">SkillSync</div>
                                                    </td>
                                                </tr>
                                            </table>
                                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white;">Welcome aboard!</h1>
                                        </td>
                                    </tr>

                                    <!-- Main Content -->
                                    <tr>
                                        <td style="padding: 40px;">
                                            <p style="margin: 0 0 24px; font-size: 16px; color: #1b1b1b; line-height: 1.6;">Hi <strong>%s</strong>,</p>
                                            <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.7;">Your account is now verified and ready to go! Here's what you can do with SkillSync:</p>

                                            <!-- Features -->
                                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                                <tr>
                                                    <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 36px;"><span style="font-size: 20px; color: #3b82f6; font-family: monospace;">#</span></td>
                                                                <td style="font-size: 14px; color: #374151; font-weight: 500;">Create and manage FYP project ideas</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 36px;"><span style="font-size: 20px; color: #3b82f6; font-family: monospace;">+</span></td>
                                                                <td style="font-size: 14px; color: #374151; font-weight: 500;">Form teams and invite collaborators</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 36px;"><span style="font-size: 20px; color: #3b82f6; font-family: monospace;">*</span></td>
                                                                <td style="font-size: 14px; color: #374151; font-weight: 500;">Request mentors for expert guidance</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 14px 0;">
                                                        <table cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td style="width: 36px;"><span style="font-size: 20px; color: #3b82f6; font-family: monospace;">&gt;</span></td>
                                                                <td style="font-size: 14px; color: #374151; font-weight: 500;">Track progress with visual Kanban boards</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Button -->
                                            <div style="text-align: center;">
                                                <a href="%s/auth/login" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);">Get Started</a>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 24px 40px 32px; text-align: center; background: #fafafa; border-top: 1px solid #f3f4f6;">
                                            <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Need help? Reply to this email or visit our support center.</p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 SkillSync. All rights reserved.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, userName);
    }

    private String buildTeamInvitationTemplate(String inviteeName, String teamName, String inviterName,
            String inviteToken, String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Team Invitation</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #dbeafe; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #3b82f6; font-family: monospace;">Inv</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 24px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">You're Invited!</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Hi %s,</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;"><strong>%s</strong> has invited you to join their team, <strong>%s</strong>.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <a href="%s/student/invitations?token=%s" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);">View Invitation</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2026 SkillSync. All rights reserved.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, inviteeName, inviterName, teamName, frontendUrl, inviteToken, email);
    }

    private String buildMentorRequestTemplate(String mentorName, String teamName, String projectTitle, String requestId,
            String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mentorship Request</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #fef3c7; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #ca8a04; font-family: monospace;">Men</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 24px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">Mentorship Request</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Hi %s,</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Team <strong>%s</strong> has requested your mentorship for their project: <em>%s</em>.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <a href="%s/mentor/requests?id=%s" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);">Review Request</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, mentorName, teamName, projectTitle, frontendUrl, requestId, email);
    }

    private String buildTaskAssignedTemplate(String assigneeName, String taskTitle, String projectName, String dueDate,
            String taskId, String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Task Assigned</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #dcfce7; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #16a34a; font-family: monospace;">Tas</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 24px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">New Task Assigned</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Hi %s,</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;">A new task <strong>%s</strong> for project <strong>%s</strong> has been assigned to you.</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #ff5754; font-weight: 600;">Due: %s</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <a href="%s/student/tasks?taskId=%s" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px;">View Task</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, assigneeName, taskTitle, projectName, dueDate, frontendUrl, taskId, email);
    }

    private String buildDocumentGeneratedTemplate(String userName, String documentType, String projectTitle,
            String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document Generated</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #e0e7ff; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #4f46e5; font-family: monospace;">Doc</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 24px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">Document Ready</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Hi %s,</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;">The <strong>%s</strong> for projecting <strong>%s</strong> has been successfully generated and is ready for download/review.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <a href="%s/student/projects" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px;">View Documents</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, userName, documentType, projectTitle, frontendUrl, email);
    }

    private String buildMeetingScheduledTemplate(String userName, String meetingTitle, String dateStr, String timeStr,
            String meetingLink, String email) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Meeting Scheduled</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #e8e7ff;">
                    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" cellpadding="0" cellspacing="0" style="max-width: 480px; background: #ffffff; border-radius: 24px; box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08); overflow: hidden;">
                                    <tr>
                                        <td style="padding: 40px 40px 24px; text-align: center;">
                                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                <tr>
                                                    <td style="text-align: center;">
                                                        <img src="%s/assets/images/skillsync-logo.svg" alt="SkillSync" style="height: 48px; display: block; margin: 0 auto; border: 0;" />
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 0 40px 16px;">
                                            <div style="width: 72px; height: 72px; background: #ddd6fe; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                                                <span style="font-size: 36px; color: #7c3aed; font-family: monospace;">Cal</span>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 24px; text-align: center;">
                                            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1b1b1b;">Meeting Scheduled</h1>
                                            <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.6;">Hi %s,</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #6b7280; line-height: 1.6;">A new meeting <strong>%s</strong> has been scheduled.</p>
                                            <p style="margin: 8px 0 0; font-size: 15px; color: #1b1b1b; font-weight: 600;">Date: %s</p>
                                            <p style="margin: 4px 0 0; font-size: 15px; color: #1b1b1b; font-weight: 600;">Time: %s</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px 32px; text-align: center;">
                                            <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #ff5754, #ff9a76); color: white; text-decoration: none; padding: 16px 40px; border-radius: 28px; font-weight: 700; font-size: 15px;">Join Meeting</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 0 40px;">
                                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 24px 40px; text-align: center;">
                                            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">This email was sent to <span style="color: #6b7280;">%s</span></p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(frontendUrl, userName, meetingTitle, dateStr, timeStr, meetingLink, email);
    }
}
