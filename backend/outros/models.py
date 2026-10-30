from django.db import models
from celerity.dates import counted_days, remaining_days


class ControleMensal(models.Model):

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
            ("REG", "Regularização"),
        ]


    SITUACAO_CHOICES = [
                ("SIM", "SIM"),
                ("NÃO", "NÃO"),
    ]


    nome_empresa = models.CharField(max_length=50, verbose_name="Nome da Empresa")
    numero_processo = models.CharField(max_length=10, verbose_name="Número do Processo")
    tipo_licenca = models.CharField(max_length=40, choices=TIPO_DE_LICENCAS_CHOICES, verbose_name="Tipo de Licença")
    data_entrada = models.DateField(verbose_name="Data de Entrada")
    poco = models.CharField(max_length=5, choices=SITUACAO_CHOICES, verbose_name="Poço")
    geral = models.CharField(max_length=5, choices=SITUACAO_CHOICES, verbose_name="Geral")
    protocolo = models.CharField(max_length=5, choices=SITUACAO_CHOICES, verbose_name="Protocolo")
    licenca = models.CharField(max_length=5, choices=SITUACAO_CHOICES, verbose_name="Licença")
    data_emissao = models.DateField(verbose_name="Data de Emissão")


    @property
    def dias_contados(self):
        return counted_days(self.data_entrada)

    def __str__(self):
        return self.nome_empresa


    class Meta:
        verbose_name = "Controle Mensal"
        verbose_name_plural = "Controles Mensais"


class AguardandoPagamento(models.Model):

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
                ("REG", "Regularização"),
            ]


    SITUACAO_CHOICES = [
                    ("PAGO", "PAGO"),
                    ("AGUARDANDO PAGAMENTO", "AGUARDANDO PAGAMENTO"),
                    ("PRAZO EXCEDIDO", "PRAZO EXCEDIDO"),
        ]


    nome_empresa = models.CharField(max_length=50, verbose_name="Nome da Empresa")
    cnpj = models.CharField(max_length=18, verbose_name="CNPJ")
    numero_solicitacao = models.CharField(max_length=7, verbose_name="Número da Solicitação")
    situacao = models.CharField(max_length=40, choices=SITUACAO_CHOICES, verbose_name="Situação")
    tipo_processo = models.CharField(max_length=40, choices=TIPO_DE_LICENCAS_CHOICES, verbose_name="Tipo de Processo")
    vencimento_boleto = models.DateField(verbose_name="Vencimento do Boleto")


    @property
    def dias_pagamento(self):
        return remaining_days(self.vencimento_boleto)

    def __str__(self):
        return self.nome_empresa


    class Meta:
        verbose_name = "Aguardando Pagamento"
        verbose_name_plural = "Aguardando Pagamentos"


class Assessoria(models.Model):

    nome_empresa = models.CharField(max_length=50, verbose_name="Nome da Empresa")
    cnpj = models.CharField(max_length=18, verbose_name="CNPJ")
    exigencia = models.CharField(max_length=30, verbose_name="Exigência constantes nas licenças")
    numero_licenca = models.CharField(max_length=20, verbose_name="Número da Licença")
    data_emissao = models.DateField(verbose_name="Data de Emissão")


    @property
    def dias_contados(self):
        return counted_days(self.data_emissao)

    def __str__(self):
        return self.nome_empresa


    class Meta:
        verbose_name = "Assessoria"
        verbose_name_plural = "Assessorias"
