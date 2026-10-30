from django.urls import reverse_lazy
from django.views.generic import (
    ListView,
    CreateView,
    UpdateView,
    DeleteView,
)

from .models import (
    ControleMensal,
    AguardandoPagamento,
    Assessoria,
)

from .forms import (
    ControleMensalForm,
    AguardandoPagamentoForm,
    AssessoriaForm,
)

####################################################
# CONTROLE MENSAL
####################################################

class ControleMensalListView(ListView):
    model = ControleMensal
    template_name = "controle/controlemensal_list.html"
    context_object_name = "objetos"
    paginate_by = 10

    def get_queryset(self):
        queryset = ControleMensal.objects.all().order_by("nome_empresa")
        pesquisa = self.request.GET.get("q")

        if pesquisa:
            queryset = queryset.filter(nome_empresa__icontains=pesquisa)

        return queryset


class ControleMensalCreateView(CreateView):
    model = ControleMensal
    form_class = ControleMensalForm
    template_name = "controle/form.html"
    success_url = reverse_lazy("controle-list")


class ControleMensalUpdateView(UpdateView):
    model = ControleMensal
    form_class = ControleMensalForm
    template_name = "controle/form.html"
    success_url = reverse_lazy("controle-list")


class ControleMensalDeleteView(DeleteView):
    model = ControleMensal
    template_name = "controle/delete.html"
    success_url = reverse_lazy("controle-list")


####################################################
# AGUARDANDO PAGAMENTO
####################################################

class AguardandoPagamentoListView(ListView):
    model = AguardandoPagamento
    template_name = "controle/aguardando_list.html"
    context_object_name = "objetos"
    paginate_by = 10

    def get_queryset(self):
        queryset = AguardandoPagamento.objects.all().order_by("nome_empresa")
        pesquisa = self.request.GET.get("q")

        if pesquisa:
            queryset = queryset.filter(nome_empresa__icontains=pesquisa)

        return queryset


class AguardandoPagamentoCreateView(CreateView):
    model = AguardandoPagamento
    form_class = AguardandoPagamentoForm
    template_name = "controle/form.html"
    success_url = reverse_lazy("aguardando-list")


class AguardandoPagamentoUpdateView(UpdateView):
    model = AguardandoPagamento
    form_class = AguardandoPagamentoForm
    template_name = "controle/form.html"
    success_url = reverse_lazy("aguardando-list")


class AguardandoPagamentoDeleteView(DeleteView):
    model = AguardandoPagamento
    template_name = "controle/delete.html"
    success_url = reverse_lazy("aguardando-list")


####################################################
# ASSESSORIA
####################################################

class AssessoriaListView(ListView):
    model = Assessoria
    template_name = "controle/assessoria_list.html"
    context_object_name = "objetos"
    paginate_by = 10

    def get_queryset(self):
        queryset = Assessoria.objects.all().order_by("nome_empresa")
        pesquisa = self.request.GET.get("q")

        if pesquisa:
            queryset = queryset.filter(nome_empresa__icontains=pesquisa)

        return queryset


class AssessoriaCreateView(CreateView):
    model = Assessoria
    form_class = AssessoriaForm
    template_name = "controle/form.html"
    success_url = reverse_lazy("assessoria-list")


class AssessoriaUpdateView(UpdateView):
    model = Assessoria
    form_class = AssessoriaForm
    template_name = "controle/form.html"
    success_url = reverse_lazy("assessoria-list")


class AssessoriaDeleteView(DeleteView):
    model = Assessoria
    template_name = "controle/delete.html"
    success_url = reverse_lazy("assessoria-list")