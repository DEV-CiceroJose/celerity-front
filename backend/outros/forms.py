from django import forms
from celerity.forms import CalculatedDaysForm
from .models import ControleMensal, AguardandoPagamento, Assessoria


class ControleMensalForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_entrada", "Dias contados", False),)
    class Meta:
        model = ControleMensal
        fields = ['nome_empresa', 'numero_processo', 'tipo_licenca', 'data_entrada', 'poco', 'geral', 'protocolo', 'licenca', 'data_emissao']

        widgets = {
            "data_entrada": forms.DateInput(attrs={"type": "date"}),
            "data_emissao": forms.DateInput(attrs={"type": "date"}),
        }


class AguardandoPagamentoForm(CalculatedDaysForm):
    day_fields = (("dias_pagamento", "vencimento_boleto", "Dias restantes para pagamento", True),)
    class Meta:
        model = AguardandoPagamento
        fields = ['nome_empresa', 'cnpj', 'numero_solicitacao', 'situacao', 'tipo_processo', 'vencimento_boleto']

        widgets = {
            "vencimento_boleto": forms.DateInput(attrs={"type": "date"}),
        }


class AssessoriaForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_emissao", "Dias contados", False),)
    class Meta:
        model = Assessoria
        fields = ['nome_empresa', 'cnpj', 'exigencia', 'numero_licenca', 'data_emissao']

        widgets = {
            "data_emissao": forms.DateInput(attrs={"type": "date"}),
        }