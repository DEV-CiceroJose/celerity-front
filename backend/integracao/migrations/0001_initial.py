from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="Perfil",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("empresa", models.CharField(blank=True, max_length=120)),
                ("telefone", models.CharField(blank=True, max_length=20)),
                ("funcao", models.CharField(default="Gestor", max_length=40)),
                ("usuario", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="perfil", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="RegistroIntegrado",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("recurso", models.CharField(db_index=True, max_length=30)),
                ("dados", models.JSONField(default=dict)),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("atualizado_em", models.DateTimeField(auto_now=True)),
                ("criado_por", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="registros_celerity", to=settings.AUTH_USER_MODEL)),
            ],
            options={"verbose_name": "Registro integrado", "verbose_name_plural": "Registros integrados", "ordering": ["-atualizado_em"]},
        ),
    ]
