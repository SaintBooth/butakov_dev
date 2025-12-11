from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ContactSubmission
from .services import send_telegram_notification
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ContactSubmission)
def notify_telegram_on_contact_submission(sender, instance, created, **kwargs):
    """
    Send Telegram notification when a new contact submission is created.
    """
    if created:
        try:
            send_telegram_notification(instance)
        except Exception as e:
            # Log error but don't break the save operation
            logger.error(f"Error in Telegram notification signal: {str(e)}")

