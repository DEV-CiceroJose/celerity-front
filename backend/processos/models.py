from django.db import models
from django.conf import settings
from celerity.dates import counted_days, remaining_days


class ProcessosGerais(models.Model):
    TIPO_DE_LICENCAS_CHOICES = [
        ("LP", "Licença Prévia"),
        ("LI", "Licença de Instalação"),
        ("LO", "Licença de Operação"),
        ('LS', 'Licença Simplificada'),
        ("ASV", "Autorização de Supressão Vegetal"),
        ("AUT", "Autorização Ambiental"),
        ("RLO", "Renovação de Licença de Operação"),
        ("LI+LO", "Licença de Instalação + Licença de Operação"),
        ("LP+LI", "Licença Prévia + Licença de Instalação"),
        ("LP+LI+LO", "Licença Prévia + Licença de Instalação + Licença de Operação"),
    ]


    STATUS_CHOICES = [
        ("Em Andamento", "Em Andamento"),
        ("Deferido", "Deferido"),
        ("Indeferido", "Indeferido"),
        ("Prazo Expirado", "Prazo Expirado"),
        ("Em Análise", "Em Análise"),
        ("Licença Liberada", "Licença Liberada"),
        ("Minutado", "Minutado")
    ]


    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17)
    numero_processo = models.CharField(max_length=11)
    tipo_licenca = models.CharField("Tipo de Licença", max_length=40, choices=TIPO_DE_LICENCAS_CHOICES)
    descricao = models.CharField("Descrição da Licença", max_length=30)
    nome = models.CharField("Nome do Solicitante", max_length=50)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)
    status = models.CharField("Status do Processo", max_length=20, choices=STATUS_CHOICES, default="Em Andamento")
    setor = models.CharField("Setor", max_length=10)
    responsavel = models.CharField("Responsável", max_length=30)
    data_inicio = models.DateField("Data de Início")


    @property
    def dias_contados(self):
        return counted_days(self.data_inicio)

    def __str__(self):
        return self.empresa

    class Meta:
        verbose_name = "Processo Geral"
        verbose_name_plural = "Processos Gerais"


class Gerais_Licenciados(models.Model):

    TIPO_DE_LICENCAS_CHOICES = [
        ("LP", "Licença Prévia"),
        ("LI", "Licença de Instalação"),
        ("LO", "Licença de Operação"),
        ('LS', 'Licença Simplificada'),
        ("ASV", "Autorização de Supressão Vegetal"),
        ("AUT", "Autorização Ambiental"),
        ("RLO", "Renovação de Licença de Operação"),
        ("LI+LO", "Licença de Instalação + Licença de Operação"),
        ("LP+LI", "Licença Prévia + Licença de Instalação"),
        ("LP+LI+LO", "Licença Prévia + Licença de Instalação + Licença de Operação"),
    ]


    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17)
    numero_processo = models.CharField(max_length=11)
    tipo_licenca = models.CharField("Tipo de Licença", max_length=40, choices=TIPO_DE_LICENCAS_CHOICES)
    descricao = models.CharField("Descrição da Licença", max_length=30)
    nome = models.CharField("Nome do Solicitante", max_length=50)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)
    data_emissao = models.DateField("Data de Emissão")
    data_vencimento = models.DateField("Data de Vencimento")

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
        verbose_name = "Geral Licenciado"
        verbose_name_plural = "Gerais Licenciados"



class Gerais_Indeferidos(models.Model):

    TIPO_DE_LICENCAS_CHOICES = [
        ("LP", "Licença Prévia"),
        ("LI", "Licença de Instalação"),
        ("LO", "Licença de Operação"),
        ('LS', 'Licença Simplificada'),
        ("ASV", "Autorização de Supressão Vegetal"),
        ("AUT", "Autorização Ambiental"),
        ("RLO", "Renovação de Licença de Operação"),
        ("LI+LO", "Licença de Instalação + Licença de Operação"),
        ("LP+LI", "Licença Prévia + Licença de Instalação"),
        ("LP+LI+LO", "Licença Prévia + Licença de Instalação + Licença de Operação"),
    ]


    STATUS_CHOICES = [
        ("LS Cancelado", "LS Cancelado"),
        ("Indeferido", "Indeferido"),
    ]


    empresa = models.CharField("Empresa", max_length=100)
    cnpj = models.CharField("CNPJ", max_length=17)
    numero_processo = models.CharField(max_length=11)
    tipo_licenca = models.CharField("Tipo de Licença", max_length=40, choices=TIPO_DE_LICENCAS_CHOICES)
    descricao = models.CharField("Descrição da Licença", max_length=30)
    nome = models.CharField("Nome do Solicitante", max_length=50)
    telefone = models.CharField("Telefone do Solicitante", max_length=11, null=True, blank=True)
    status = models.CharField("Status do Processo", max_length=20, choices=STATUS_CHOICES, default="Em Andamento")
    empreendimento = models.CharField("Empreendimento", max_length=30)
    data_inicio = models.DateField("Data de Início")


    class Meta:
        verbose_name = "Geral Indeferido"
        verbose_name_plural = "Gerais Indeferidos"


    @property
    def dias_contados(self):
        return counted_days(self.data_inicio)

    def __str__(self):
        return self.empresa
