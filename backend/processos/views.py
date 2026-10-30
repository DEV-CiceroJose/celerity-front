from django.urls import reverse_lazy
from django.views.generic import (
    ListView,
    CreateView,
    UpdateView,
    DeleteView,
    DetailView
)

from .models import (
    ProcessosGerais,
    Gerais_Licenciados,
    Gerais_Indeferidos
)

from .forms import (
    ProcessosGeraisForm,
    GeraisLicenciadosForm,
    GeraisIndeferidosForm
)

from .mixins import SearchMixin


# ===============================
# PROCESSOS GERAIS
# ===============================

class ProcessosGeraisListView(SearchMixin, ListView):
    model = ProcessosGerais
    template_name = "processos/list.html"
    context_object_name = "processos"
    paginate_by = 10

    search_fields = [
        "empresa",
        "cnpj",
        "numero_processo",
        "tipo_licenca",
        "nome",
        "responsavel",
    ]


class ProcessosGeraisDetailView(DetailView):
    model = ProcessosGerais
    template_name = "processos/detail.html"


class ProcessosGeraisCreateView(CreateView):
    model = ProcessosGerais
    form_class = ProcessosGeraisForm
    template_name = "processos/form.html"
    success_url = reverse_lazy("processos_list")


class ProcessosGeraisUpdateView(UpdateView):
    model = ProcessosGerais
    form_class = ProcessosGeraisForm
    template_name = "processos/form.html"
    success_url = reverse_lazy("processos_list")


class ProcessosGeraisDeleteView(DeleteView):
    model = ProcessosGerais
    template_name = "processos/delete.html"
    success_url = reverse_lazy("processos_list")


# ===============================
# LICENCIADOS
# ===============================

class LicenciadosListView(SearchMixin, ListView):
    model = Gerais_Licenciados
    template_name = "licenciados/list.html"
    context_object_name = "licenciados"

    search_fields = [
        "empresa",
        "cnpj",
        "numero_processo",
        "tipo_licenca",
        "nome",
    ]


class LicenciadosCreateView(CreateView):
    model = Gerais_Licenciados
    form_class = GeraisLicenciadosForm
    template_name = "licenciados/form.html"
    success_url = reverse_lazy("licenciados_list")


class LicenciadosUpdateView(UpdateView):
    model = Gerais_Licenciados
    form_class = GeraisLicenciadosForm
    template_name = "licenciados/form.html"
    success_url = reverse_lazy("licenciados_list")


class LicenciadosDeleteView(DeleteView):
    model = Gerais_Licenciados
    template_name = "licenciados/delete.html"
    success_url = reverse_lazy("licenciados_list")


# ===============================
# INDEFERIDOS
# ===============================

class IndeferidosListView(SearchMixin, ListView):
    model = Gerais_Indeferidos
    template_name = "indeferidos/list.html"
    context_object_name = "indeferidos"

    search_fields = [
        "empresa",
        "cnpj",
        "numero_processo",
        "tipo_licenca",
        "nome",
        "empreendimento",
    ]


class IndeferidosCreateView(CreateView):
    model = Gerais_Indeferidos
    form_class = GeraisIndeferidosForm
    template_name = "indeferidos/form.html"
    success_url = reverse_lazy("indeferidos_list")


class IndeferidosUpdateView(UpdateView):
    model = Gerais_Indeferidos
    form_class = GeraisIndeferidosForm
    template_name = "indeferidos/form.html"
    success_url = reverse_lazy("indeferidos_list")


class IndeferidosDeleteView(DeleteView):
    model = Gerais_Indeferidos
    template_name = "indeferidos/delete.html"
    success_url = reverse_lazy("indeferidos_list")