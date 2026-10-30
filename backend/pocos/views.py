from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

from .models import (
    Pocos,
    PocosLicenciados,
    PocosIndeferidos,
    PocosEmExigencia
)

from .forms import (
    PocosForm,
    PocosLicenciadosForm,
    PocosIndeferidosForm,
    PocosEmExigenciaForm
)

from .mixins import SearchMixin

# ============================
# POÇOS
# ============================

class ListaPocos(SearchMixin, ListView):
    model = Pocos
    template_name = "pocos/lista.html"
    context_object_name = "pocos"
    search_fields = ["empresa"]


class DetalhePoco(DetailView):
    model = Pocos
    template_name = "pocos/detalhe.html"
    context_object_name = "poco"


class CriarPoco(CreateView):
    model = Pocos
    form_class = PocosForm
    template_name = "pocos/form.html"
    success_url = reverse_lazy("lista_pocos")


class EditarPoco(UpdateView):
    model = Pocos
    form_class = PocosForm
    template_name = "pocos/form.html"
    success_url = reverse_lazy("lista_pocos")


class DeletarPoco(DeleteView):
    model = Pocos
    template_name = "pocos/deletar.html"
    success_url = reverse_lazy("lista_pocos")


# ============================
# LICENCIADOS
# ============================

class ListaLicenciados(SearchMixin, ListView):
    model = PocosLicenciados
    template_name = "licenciados/lista.html"
    context_object_name = "licenciados"
    search_fields = ["empresa"]


class DetalheLicenciado(DetailView):
    model = PocosLicenciados
    template_name = "licenciados/detalhe.html"
    context_object_name = "licenciado"


class CriarLicenciado(CreateView):
    model = PocosLicenciados
    form_class = PocosLicenciadosForm
    template_name = "licenciados/form.html"
    success_url = reverse_lazy("lista_licenciados")


class EditarLicenciado(UpdateView):
    model = PocosLicenciados
    form_class = PocosLicenciadosForm
    template_name = "licenciados/form.html"
    success_url = reverse_lazy("lista_licenciados")


class DeletarLicenciado(DeleteView):
    model = PocosLicenciados
    template_name = "licenciados/deletar.html"
    success_url = reverse_lazy("lista_licenciados")


# ============================
# INDEFERIDOS
# ============================

class ListaIndeferidos(SearchMixin, ListView):
    model = PocosIndeferidos
    template_name = "indeferidos/lista.html"
    context_object_name = "indeferidos"
    search_fields = ["empresa"]


class DetalheIndeferido(DetailView):
    model = PocosIndeferidos
    template_name = "indeferidos/detalhe.html"
    context_object_name = "indeferido"


class CriarIndeferido(CreateView):
    model = PocosIndeferidos
    form_class = PocosIndeferidosForm
    template_name = "indeferidos/form.html"
    success_url = reverse_lazy("lista_indeferidos")


class EditarIndeferido(UpdateView):
    model = PocosIndeferidos
    form_class = PocosIndeferidosForm
    template_name = "indeferidos/form.html"
    success_url = reverse_lazy("lista_indeferidos")


class DeletarIndeferido(DeleteView):
    model = PocosIndeferidos
    template_name = "indeferidos/deletar.html"
    success_url = reverse_lazy("lista_indeferidos")


# ============================
# EXIGÊNCIAS
# ============================

class ListaExigencias(SearchMixin, ListView):
    model = PocosEmExigencia
    template_name = "exigencias/lista.html"
    context_object_name = "exigencias"
    search_fields = ["empresa"]


class DetalheExigencia(DetailView):
    model = PocosEmExigencia
    template_name = "exigencias/detalhe.html"
    context_object_name = "exigencia"


class CriarExigencia(CreateView):
    model = PocosEmExigencia
    form_class = PocosEmExigenciaForm
    template_name = "exigencias/form.html"
    success_url = reverse_lazy("lista_exigencia")


class EditarExigencia(UpdateView):
    model = PocosEmExigencia
    form_class = PocosEmExigenciaForm
    template_name = "exigencias/form.html"
    success_url = reverse_lazy("lista_exigencia")


class DeletarExigencia(DeleteView):
    model = PocosEmExigencia
    template_name = "exigencias/deletar.html"
    success_url = reverse_lazy("lista_exigencia")