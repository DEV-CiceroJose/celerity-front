from django.urls import path
from .views import *


urlpatterns = [

    # Processos
    path("processos/", ProcessosGeraisListView.as_view(), name="processos_list"),
    path("processos/<int:pk>/", ProcessosGeraisDetailView.as_view(), name="processos_detail"),
    path("processos/novo/", ProcessosGeraisCreateView.as_view(), name="processos_create"),
    path("processos/<int:pk>/editar/", ProcessosGeraisUpdateView.as_view(), name="processos_update"),
    path("processos/<int:pk>/deletar/", ProcessosGeraisDeleteView.as_view(), name="processos_delete"),

    # Licenciados
    path("licenciados/", LicenciadosListView.as_view(), name="licenciados_list"),
    path("licenciados/novo/", LicenciadosCreateView.as_view(), name="licenciados_create"),
    path("licenciados/<int:pk>/editar/", LicenciadosUpdateView.as_view(), name="licenciados_update"),
    path("licenciados/<int:pk>/deletar/", LicenciadosDeleteView.as_view(), name="licenciados_delete"),

    # Indeferidos
    path("indeferidos/", IndeferidosListView.as_view(), name="indeferidos_list"),
    path("indeferidos/novo/", IndeferidosCreateView.as_view(), name="indeferidos_create"),
    path("indeferidos/<int:pk>/editar/", IndeferidosUpdateView.as_view(), name="indeferidos_update"),
    path("indeferidos/<int:pk>/deletar/", IndeferidosDeleteView.as_view(), name="indeferidos_delete"),
]