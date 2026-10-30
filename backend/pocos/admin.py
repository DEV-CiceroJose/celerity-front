from django.contrib import admin
from .models import (
    Pocos,
    PocosLicenciados,
    PocosIndeferidos,
    PocosEmExigencia
)

# =====================================
# POCOS
# =====================================

class PocosAdmin(admin.ModelAdmin):
    readonly_fields = ('tempo_setor',)

    list_display = (
        "empresa",
        "numero_processo",
        "situacao",
        "responsavel",
        "data_entrada",
        "tempo_setor",
        "prazo_atendimento_exigencia"
    )

    list_filter = (
        "situacao",
        "responsavel",
        "prazo_atendimento_exigencia"
    )

    search_fields = (
        "empresa",
        "numero_processo"
    )

    ordering = (
        "-data_entrada",
    )


# =====================================
# POCOS LICENCIADOS
# =====================================

class PocosLicenciadosAdmin(admin.ModelAdmin):
    readonly_fields = ('dias_contados', 'dias_restantes')

    list_display = (
        "empresa",
        "cnpj",
        "licenca",
        "data_emissao",
        "data_vencimento",
        "dias_contados",
        "total_licencas"
    )

    list_filter = (
        "licenca",
        "data_emissao"
    )

    search_fields = (
        "empresa",
        "cnpj"
    )

    ordering = (
        "-data_emissao",
    )


# =====================================
# POCOS INDEFERIDOS
# =====================================

class PocosIndeferidosAdmin(admin.ModelAdmin):

    list_display = (
        "empresa",
        "numero_processo",
        "cnpj",
        "data_entrada",
        "responsavel"
    )

    list_filter = (
        "responsavel",
        "data_entrada"
    )

    search_fields = (
        "empresa",
        "numero_processo",
        "cnpj"
    )

    ordering = (
        "-data_entrada",
    )


# =====================================
# POCOS EM EXIGENCIA
# =====================================

class PocosEmExigenciaAdmin(admin.ModelAdmin):
    readonly_fields = ('tempo_setor', 'contados', 'dias_restantes')

    list_display = (
        "empresa",
        "numero_processo",
        "situacao",
        "responsavel",
        "data_entrada",
        "prazo_atendimento",
        "contados"
    )

    list_filter = (
        "situacao",
        "responsavel"
    )

    search_fields = (
        "empresa",
        "numero_processo"
    )

    ordering = (
        "-data_entrada",
    )


admin.site.register(Pocos, PocosAdmin)
admin.site.register(PocosLicenciados, PocosLicenciadosAdmin)
admin.site.register(PocosIndeferidos, PocosIndeferidosAdmin)
admin.site.register(PocosEmExigencia, PocosEmExigenciaAdmin)