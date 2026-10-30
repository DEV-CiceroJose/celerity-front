from django.urls import path
from . import views

urlpatterns = [

    # Controle Mensal
    path("", views.ControleMensalListView.as_view(), name="controle-list"),
    path("novo/", views.ControleMensalCreateView.as_view(), name="controle-add"),
    path("editar/<int:pk>/", views.ControleMensalUpdateView.as_view(), name="controle-edit"),
    path("excluir/<int:pk>/", views.ControleMensalDeleteView.as_view(), name="controle-delete"),

    # Aguardando Pagamento
    path("aguardando/", views.AguardandoPagamentoListView.as_view(), name="aguardando-list"),
    path("aguardando/novo/", views.AguardandoPagamentoCreateView.as_view(), name="aguardando-add"),
    path("aguardando/editar/<int:pk>/", views.AguardandoPagamentoUpdateView.as_view(), name="aguardando-edit"),
    path("aguardando/excluir/<int:pk>/", views.AguardandoPagamentoDeleteView.as_view(), name="aguardando-delete"),

    # Assessoria
    path("assessoria/", views.AssessoriaListView.as_view(), name="assessoria-list"),
    path("assessoria/novo/", views.AssessoriaCreateView.as_view(), name="assessoria-add"),
    path("assessoria/editar/<int:pk>/", views.AssessoriaUpdateView.as_view(), name="assessoria-edit"),
    path("assessoria/excluir/<int:pk>/", views.AssessoriaDeleteView.as_view(), name="assessoria-delete"),
]