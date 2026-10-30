from django import forms
from celerity.forms import CalculatedDaysForm
from .models import (
    ProcessosGerais,
    Gerais_Licenciados,
    Gerais_Indeferidos
)


class ProcessosGeraisForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_inicio", "Dias contados", False),)
    class Meta:
        model = ProcessosGerais
        fields = ['empresa', 'cnpj', 'numero_processo', 'tipo_licenca', 'descricao', 'nome', 'telefone', 'status', 'setor', 'responsavel', 'data_inicio']
        widgets = {
            "data_inicio": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA', "type": "date"}),

        }


class GeraisLicenciadosForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_emissao", "Dias contados", False),)
    class Meta:
        model = Gerais_Licenciados
        fields = ['empresa', 'cnpj', 'numero_processo', 'tipo_licenca', 'descricao', 'nome', 'telefone', 'data_emissao', 'data_vencimento', 'usuario_responsavel']
        widgets = {
            "data_emissao": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA', "type": "date"}),
            "data_vencimento": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA', "type": "date"}),
        }


class GeraisIndeferidosForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_inicio", "Dias contados", False),)
    class Meta:
        model = Gerais_Indeferidos
        fields = ['empresa', 'cnpj', 'numero_processo', 'tipo_licenca', 'descricao', 'nome', 'telefone', 'status', 'empreendimento', 'data_inicio']
        widgets = {
            "data_inicio": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA', "type": "date"}),

        }