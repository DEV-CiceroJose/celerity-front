from django import forms
from celerity.forms import CalculatedDaysForm
from .models import (
    Pocos,
    PocosLicenciados,
    PocosIndeferidos,
    PocosEmExigencia
)


class PocosForm(CalculatedDaysForm):
    day_fields = (("tempo_setor", "data_entrada", "Dias contados", False),)
    class Meta:
        model = Pocos
        fields = ['empresa', 'cnpj', 'numero_processo', 'nome', 'telefone', 'situacao', 'data_entrada', 'responsavel', 'prazo_atendimento_exigencia']
        widgets = {
            "data_entrada": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA', "type": "date"})
        }


class PocosLicenciadosForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_emissao", "Dias contados", False),)
    class Meta:
        model = PocosLicenciados
        fields = ['numero_processo', 'empresa', 'cnpj', 'nome', 'telefone', 'licenca', 'data_emissao', 'data_vencimento', 'total_licencas', 'usuario_responsavel']
        widgets = {
            "data_emissao": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA',"type": "date"}),
            "data_vencimento": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA',"type": "date"})
        }


class PocosIndeferidosForm(CalculatedDaysForm):
    day_fields = (("dias_contados", "data_entrada", "Dias contados", False),)
    class Meta:
        model = PocosIndeferidos
        fields = ['numero_processo', 'empresa', 'cnpj', 'nome', 'telefone', 'data_entrada', 'responsavel']
        widgets = {
            "data_entrada": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA',"type": "date"})
        }


class PocosEmExigenciaForm(CalculatedDaysForm):
    day_fields = (("contados", "data_entrada", "Dias contados", False),)
    class Meta:
        model = PocosEmExigencia
        fields = ['numero_processo', 'empresa', 'cnpj', 'nome', 'telefone', 'numero_processo', 'situacao', 'data_entrada', 'responsavel', 'prazo_atendimento']
        widgets = {
            "data_entrada": forms.DateInput(attrs={'placeholder': 'DD/MM/AAAA',"type": "date"}),
            "prazo_atendimento": forms.DateInput(attrs={"type": "date"})
        }
