from django.db import models


class ReminderDelivery(models.Model):
    license_key = models.CharField(max_length=255)
    expiry_date = models.DateField()
    recipient = models.EmailField()
    kind = models.CharField(max_length=16)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(
            fields=["license_key", "expiry_date", "recipient", "kind"],
            name="unique_license_reminder_delivery",
        )]
