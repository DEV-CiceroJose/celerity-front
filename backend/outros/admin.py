from django.contrib import admin
from .models import ControleMensal, AguardandoPagamento, Assessoria

@admin.register(ControleMensal)
class ControleMensalAdmin(admin.ModelAdmin):
    list_display = (
        "nome_empresa",
        "numero_processo",
        "tipo_licenca",
        "data_entrada",
        "data_emissao",
        "poco",
        "geral",
        "protocolo",
        "licenca",
    )

    list_filter = (
        "tipo_licenca",
        "poco",
        "geral",
        "protocolo",
        "licenca",
        "data_entrada",
        "data_emissao",
    )

    search_fields = (
        "nome_empresa",
        "numero_processo",
    )

    ordering = ("nome_empresa",)
    list_per_page = 20


@admin.register(AguardandoPagamento)
class AguardandoPagamentoAdmin(admin.ModelAdmin):
    readonly_fields = ('dias_pagamento',)
    list_display = (
        "nome_empresa",
        "cnpj",
        "numero_solicitacao",
        "situacao",
        "tipo_processo",
        "vencimento_boleto",
        "dias_pagamento",
    )

    list_filter = (
        "situacao",
        "tipo_processo",
        "vencimento_boleto",
    )

    search_fields = (
        "nome_empresa",
        "cnpj",
        "numero_solicitacao",
    )

    ordering = ("nome_empresa",)
    list_per_page = 20


@admin.register(Assessoria)
class AssessoriaAdmin(admin.ModelAdmin):
    readonly_fields = ('dias_contados',)
    list_display = (
        "nome_empresa",
        "cnpj",
        "numero_licenca",
        "exigencia",
        "data_emissao",
        "dias_contados",
    )

    list_filter = (
        "data_emissao",
    )

    search_fields = (
        "nome_empresa",
        "cnpj",
        "numero_licenca",
    )

    ordering = ("nome_empresa",)
    list_per_page = 20