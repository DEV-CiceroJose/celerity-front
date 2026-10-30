from django.db import models
from django.conf import settings
from celerity.dates import counted_days, remaining_days


class Pocos(models.Model):
    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17, null=True, blank=True)
    numero_processo = models.CharField(max_length=11, null=True, blank=True)
    nome = models.CharField("Nome do Solicitante", max_length=100, null=True, blank=True)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)

    SITUACAO_CHOICES = [
        ("Deferido", "Deferido"),
        ("Em Análise", "Em Análise"),
        ("Em Análise sem Exigência", "Em Análise sem Exigência"),
        ("Indeferido", "Indeferido"),
        ("Paralisado", "Paralisado"),
        ("Processo Paralisado", "Processo Paralisado"),
        ("Em Exigência", "Em Exigência"),
        ("Licença Liberada", "Licença Liberada"),
        ("Minutado", "Minutado")
    ]

    situacao = models.CharField("Situação", max_length=50, choices=SITUACAO_CHOICES, default="Em Análise")
    data_entrada = models.DateField("Data de Entrada")
    responsavel = models.CharField("Responsável", max_length=30)

    PRAZO_ATENDIMENTO_EXIGENCIA_CHOICES = [
        ("Sem Exigência", "Sem Exigência"),
        ("Atendido", "Atendido")

    ]

    prazo_atendimento_exigencia = models.CharField("Prazo de Atendimento da Exigência", max_length=20, choices=PRAZO_ATENDIMENTO_EXIGENCIA_CHOICES, default="Sem Exigência")

    @property
    def tempo_setor(self):
        return counted_days(self.data_entrada)

    def __str__(self):
        return self.empresa

    class Meta:
        verbose_name = "Poço"
        verbose_name_plural = "Poços"


class PocosLicenciados(models.Model):
    LICENCAS_CHOICES = [
        ("LS", "Licença Simplificada"),
        ("LI+LO", "Regularização Ambiental"),
        ("LO", "Licença de Operação"),
    ]

    numero_processo = models.CharField(max_length=11, null=True, blank=True)
    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17, null=True, blank=True)
    nome = models.CharField("Nome do Solicitante", max_length=100, blank=True, null=True)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)
    licenca = models.CharField("Licença", max_length=20, choices=LICENCAS_CHOICES)
    data_emissao = models.DateField("Data de Emissão")
    data_vencimento = models.DateField("Data de Vencimento")


    total_licencas = models.IntegerField("Total de Licenças", default=0)


    @property
    def dias_contados(self):
        return counted_days(self.data_emissao)

    @property
    def dias_restantes(self):
        return remaining_days(self.data_vencimento)

    usuario_responsavel = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        limit_choices_to={"is_active": True}, verbose_name="Usuário responsável pelos alertas",
    )

    def __str__(self):
        return self.empresa

    class Meta:
        verbose_name = "Poço Licenciado"
        verbose_name_plural = "Poços Licenciados"


class PocosIndeferidos(models.Model):
    numero_processo = models.CharField(max_length=11, null=True, blank=True)
    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17, null=True, blank=True)
    nome = models.CharField("Nome do Solicitante", max_length=100, null=True, blank=True)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)
    data_entrada = models.DateField("Data de Entrada")
    responsavel = models.CharField("Responsável", max_length=30)


    @property
    def dias_contados(self):
        return counted_days(self.data_entrada)

    def __str__(self):
        return self.empresa


    class Meta:
        verbose_name = "Poço Indeferido"
        verbose_name_plural = "Poços Indeferidos"

class PocosEmExigencia(models.Model):
    numero_processo = models.CharField(max_length=11, null=True, blank=True)
    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17, null=True, blank=True)
    nome = models.CharField("Nome do Solicitante", max_length=100, null=True, blank=True)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)
    numero_processo = models.CharField(max_length=11)

    SITUACAO_CHOICES = [
        ("Deferido", "Deferido"),
        ("Em Análise", "Em Análise"),
        ("Em Análise sem Exigência", "Em Análise sem Exigência"),
        ("Indeferido", "Indeferido"),
        ("Paralisado", "Paralisado"),
        ("Processo Paralisado", "Processo Paralisado"),
        ("Em Exigência", "Em Exigência"),
        ("Licença Liberada", "Licença Liberada"),
        ("Minutado", "Minutado")
    ]

    situacao = models.CharField("Situação", max_length=50, default="Em Exigência")
    data_entrada = models.DateField("Data de Entrada")
    responsavel = models.CharField("Responsável", max_length=30)

    prazo_atendimento = models.DateField("Prazo para Atendimento")

    @property
    def contados(self):
        return counted_days(self.data_entrada)

    @property
    def tempo_setor(self):
        return counted_days(self.data_entrada)

    @property
    def dias_restantes(self):
        return remaining_days(self.prazo_atendimento)

    def __str__(self):
        return self.empresa

    class Meta:
        verbose_name = "Poço em Exigência"
        verbose_name_plural = "Poços em Exigência"