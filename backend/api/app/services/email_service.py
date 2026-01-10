import os
import smtplib
import html
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from app.core.config import get_settings

class EmailService:
    def __init__(self):
        self.settings = get_settings()
        self.smtp_server = self.settings.smtp_server if hasattr(self.settings, 'smtp_server') else "smtp.gmail.com"
        self.smtp_port = int(self.settings.smtp_port) if hasattr(self.settings, 'smtp_port') else 587
        self.smtp_username = self.settings.smtp_username if hasattr(self.settings, 'smtp_username') else None
        self.smtp_password = self.settings.smtp_password.get_secret_value() if hasattr(self.settings, 'smtp_password') and self.settings.smtp_password else None
        self.from_email = self.settings.from_email if hasattr(self.settings, 'from_email') else "noreply@yourapp.com"

        # Alternative: Use services like SendGrid, Mailgun, etc.
        self.sendgrid_api_key = self.settings.sendgrid_api_key.get_secret_value() if hasattr(self.settings, 'sendgrid_api_key') and self.settings.sendgrid_api_key else None
        self.resend_api_key = self.settings.resend_api_key.get_secret_value() if hasattr(self.settings, 'resend_api_key') and self.settings.resend_api_key else None

        self.service_available = self._check_service_availability()

    def _check_service_availability(self) -> bool:
        """Check if email service is configured"""
        return bool(
            (self.smtp_username and self.smtp_password) or
            self.sendgrid_api_key or
            self.resend_api_key
        )

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email using the configured service

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML body
            text_content: Plain text alternative (optional)

        Returns:
            True if sent successfully, False otherwise
        """
        try:
            # Try SendGrid first (most reliable for production)
            if self.sendgrid_api_key:
                return self._send_via_sendgrid(to_email, subject, html_content, text_content)

            # Try Resend (simple API)
            if self.resend_api_key:
                return self._send_via_resend(to_email, subject, html_content, text_content)

            # Fall back to SMTP
            if self.smtp_username and self.smtp_password:
                return self._send_via_smtp(to_email, subject, html_content, text_content)

            print("⚠️ No email service configured")
            return False

        except Exception as e:
            print(f"❌ Email send failed: {e}")
            return False

    def send_business_welcome_email(self, to_email: str, business_name: str) -> bool:
        """Send welcome email to new business"""
        safe_name = html.escape(business_name)
        subject = f"Welcome to Voice AI, {business_name}!"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Welcome to Voice AI!</h1>
            <p>Hi {safe_name},</p>
            <p>We're thrilled to have you on board. Your AI receptionist is being set up and will be ready to handle calls shortly.</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Next Steps:</h3>
                <ul>
                    <li>Complete your business profile</li>
                    <li>Set up your business hours</li>
                    <li>Configure call handling rules</li>
                </ul>
            </div>
            <p>If you have any questions, our support team is here to help.</p>
            <p>Best regards,<br>The Voice AI Team</p>
        </div>
        """
        
        text_content = f"""
        Welcome to Voice AI, {business_name}!
        
        We're thrilled to have you on board. Your AI receptionist is being set up.
        
        Next Steps:
        - Complete your business profile
        - Set up your business hours
        - Configure call handling rules
        
        Best regards,
        The Voice AI Team
        """
        
        print(f"📧 Sending welcome email to {to_email}")
        return self.send_email(to_email, subject, html_content, text_content)

    def _send_via_sendgrid(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email via SendGrid API"""
        try:
            import requests

            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "personalizations": [{
                    "to": [{"email": to_email}]
                }],
                "from": {"email": self.from_email},
                "subject": subject,
                "content": [
                    {
                        "type": "text/html",
                        "value": html_content
                    }
                ]
            }

            if text_content:
                payload["content"].append({
                    "type": "text/plain",
                    "value": text_content
                })

            response = requests.post(url, json=payload, headers=headers)
            return response.status_code == 202

        except Exception as e:
            print(f"SendGrid error: {e}")
            return False

    def _send_via_resend(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email via Resend API"""
        try:
            import requests

            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }

            if text_content:
                payload["text"] = text_content

            response = requests.post(url, json=payload, headers=headers)
            return response.status_code == 200

        except Exception as e:
            print(f"Resend error: {e}")
            return False

    def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email via SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Add text content
            if text_content:
                msg.attach(MIMEText(text_content, 'plain'))

            # Add HTML content
            msg.attach(MIMEText(html_content, 'html'))

            # Send via SMTP
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.sendmail(self.from_email, to_email, msg.as_string())
            server.quit()

            return True

        except Exception as e:
            print(f"SMTP error: {e}")
            return False

    def send_business_welcome_email(self, business_email: str, business_name: str) -> bool:
        """Send welcome email to business"""
        subject = f"Welcome to Voice AI - {business_name}"

        html_content = f"""
        <html>
        <body>
            <h1>Welcome to Voice AI!</h1>
            <p>Dear {business_name} team,</p>
            <p>Thank you for setting up your AI receptionist! Your business is now ready to receive calls.</p>
            <p>Here are some next steps:</p>
            <ul>
                <li>Configure your business hours</li>
                <li>Add your services and pricing</li>
                <li>Set up urgent call handling</li>
                <li>Test your AI receptionist</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Voice AI Team</p>
        </body>
        </html>
        """

        text_content = f"""
        Welcome to Voice AI!

        Dear {business_name} team,

        Thank you for setting up your AI receptionist! Your business is now ready to receive calls.

        Next steps:
        - Configure your business hours
        - Add your services and pricing
        - Set up urgent call handling
        - Test your AI receptionist

        If you have any questions, feel free to reach out to our support team.

        Best regards,
        The Voice AI Team
        """

        return self.send_email(business_email, subject, html_content, text_content)

    def send_phone_number_notification(self, business_email: str, business_name: str, phone_number: str) -> bool:
        """Send notification when phone number is activated"""
        subject = f"Phone Number Activated - {phone_number}"

        html_content = f"""
        <html>
        <body>
            <h1>Phone Number Activated!</h1>
            <p>Hi {business_name},</p>
            <p>Your new phone number <strong>{phone_number}</strong> has been successfully activated!</p>
            <p>Your AI receptionist is now ready to answer calls on this number.</p>
            <p>You can start receiving calls immediately. Don't forget to:</p>
            <ul>
                <li>Update your business listings with the new number</li>
                <li>Inform your customers about the AI receptionist</li>
                <li>Monitor call quality and adjust settings as needed</li>
            </ul>
            <p>Best,<br>The Voice AI Team</p>
        </body>
        </html>
        """

        text_content = f"""
        Phone Number Activated!

        Hi {business_name},

        Your new phone number {phone_number} has been successfully activated!

        Your AI receptionist is now ready to answer calls on this number.

        Next steps:
        - Update your business listings with the new number
        - Inform your customers about the AI receptionist
        - Monitor call quality and adjust settings as needed

        Best,
        The Voice AI Team
        """

        return self.send_email(business_email, subject, html_content, text_content)