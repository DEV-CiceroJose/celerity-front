from django.conf import settings
from django.db import models


class Perfil(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="perfil")
    empresa = models.CharField(max_length=120, blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    funcao = models.CharField(max_length=40, default="Gestor")

    def __str__(self):
        return self.usuario.get_full_name() or self.usuario.username


class RegistroIntegrado(models.Model):
    """Registro flexível usado pela interface React para cada área da operação."""

    recurso = models.CharField(max_length=30, db_index=True)
    dados = models.JSONField(default=dict)
    criado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="registros_celerity",
    )
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-atualizado_em"]
        verbose_name = "Registro integrado"
        verbose_name_plural = "Registros integrados"

    def __str__(self):
        return f"{self.recurso} #{self.pk}"


class LicenseNotice(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="license_notices")
    license_key = models.CharField(max_length=255)
    expiry_date = models.DateField()
    kind = models.CharField(max_length=16)
    number = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    href = models.CharField(max_length=255)
    read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    snooze_until = models.DateField(null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["usuario", "license_key", "expiry_date", "kind"], name="unique_user_license_notice")]
