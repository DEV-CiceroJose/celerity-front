from django.urls import path
from .views import *


urlpatterns = [

# POÇOS
path("pocos/", ListaPocos.as_view(), name="lista_pocos"),
path("pocos/<int:pk>/", DetalhePoco.as_view(), name="detalhe_poco"),
path("pocos/novo/", CriarPoco.as_view(), name="criar_poco"),
path("pocos/editar/<int:pk>/", EditarPoco.as_view(), name="editar_poco"),
path("pocos/deletar/<int:pk>/", DeletarPoco.as_view(), name="deletar_poco"),


# LICENCIADOS
path("licenciados/", ListaLicenciados.as_view(), name="lista_licenciados"),
path("licenciados/<int:pk>/", DetalheLicenciado.as_view(), name="detalhe_licenciado"),
path("licenciados/novo/", CriarLicenciado.as_view(), name="criar_licenciado"),
path("licenciados/editar/<int:pk>/", EditarLicenciado.as_view(), name="editar_licenciado"),
path("licenciados/deletar/<int:pk>/", DeletarLicenciado.as_view(), name="deletar_licenciado"),


# INDEFERIDOS
path("indeferidos/", ListaIndeferidos.as_view(), name="lista_indeferidos"),
path("indeferidos/<int:pk>/", DetalheIndeferido.as_view(), name="detalhe_indeferido"),
path("indeferidos/novo/", CriarIndeferido.as_view(), name="criar_indeferido"),
path("indeferidos/editar/<int:pk>/", EditarIndeferido.as_view(), name="editar_indeferido"),
path("indeferidos/deletar/<int:pk>/", DeletarIndeferido.as_view(), name="deletar_indeferido"),


# EXIGÊNCIAS
path("exigencias/", ListaExigencias.as_view(), name="lista_exigencia"),
path("exigencias/<int:pk>/", DetalheExigencia.as_view(), name="detalhe_exigencia"),
path("exigencias/novo/", CriarExigencia.as_view(), name="criar_exigencia"),
path("exigencias/editar/<int:pk>/", EditarExigencia.as_view(), name="editar_exigencia"),
path("exigencias/deletar/<int:pk>/", DeletarExigencia.as_view(), name="deletar_exigencia"),

]