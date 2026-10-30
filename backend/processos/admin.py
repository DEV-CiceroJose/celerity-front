from django.contrib import admin
from .models import ProcessosGerais, Gerais_Indeferidos, Gerais_Licenciados


@admin.register(ProcessosGerais)
class ProcessosGeraisAdmin(admin.ModelAdmin):
    readonly_fields = ('dias_contados',)
    list_display = (
        "empresa",
        "cnpj",
        "numero_processo",
        "tipo_licenca",
        "descricao",
        "nome",
        "telefone",
        "status",
        "setor",
        "responsavel",
        "data_inicio",
        "dias_contados",
    )

    search_fields = (
        "empresa",
        "cnpj",
        "numero_processo",
        "descricao",
        "nome",
    )

    list_filter = (
        "tipo_licenca",
        "status",
        "setor",
    )

    ordering = ("-data_inicio",)


@admin.register(Gerais_Indeferidos)
class GeraisIndeferidosAdmin(admin.ModelAdmin):
    readonly_fields = ('dias_contados',)
    list_display = (
        "empresa",
        "cnpj",
        "numero_processo",
        "tipo_licenca",
        "descricao",
        "nome",
        "telefone",
        "status",
        "empreendimento",
        "data_inicio",
        "dias_contados",
    )

    search_fields = (
        "empresa",
        "cnpj",
        "numero_processo",
        "descricao",
        "nome",
    )

    list_filter = (
        "tipo_licenca",
        "status",
    )

    ordering = ("-data_inicio",)


@admin.register(Gerais_Licenciados)
class GeraisLicenciadosAdmin(admin.ModelAdmin):
    readonly_fields = ('dias_contados', 'dias_restantes')
    list_display = (
        "empresa",
        "cnpj",
        "numero_processo",
        "tipo_licenca",
        "descricao",
        "nome",
        "telefone",
        "data_emissao",
        "data_vencimento",
        "dias_contados",
    )

    search_fields = (
        "empresa",
        "cnpj",
        "numero_processo",
        "descricao",
        "nome",
    )

    list_filter = (
        "tipo_licenca",
    )

    ordering = ("-data_vencimento",)