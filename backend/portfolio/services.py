import os
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def send_telegram_notification(submission):
    """
    Send Telegram notification when a contact form is submitted.
    
    Args:
        submission: ContactSubmission instance
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    
    if not bot_token or not chat_id:
        logger.warning("Telegram bot token or chat ID not configured. Skipping notification.")
        return False
    
    try:
        message = f"""
🔔 New Contact Form Submission

👤 Name: {submission.name}
📧 Email: {submission.email}
📞 Phone: {submission.phone or 'Not provided'}
💬 Message: {submission.message[:500]}{'...' if len(submission.message) > 500 else ''}

📅 Submitted: {submission.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}
🌐 IP: {submission.ip_address or 'Not available'}
✅ Consent: {'Yes' if submission.consent_given else 'No'}
"""
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        
        logger.info(f"Telegram notification sent successfully for submission {submission.id}")
        return True
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send Telegram notification: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending Telegram notification: {str(e)}")
        return False

