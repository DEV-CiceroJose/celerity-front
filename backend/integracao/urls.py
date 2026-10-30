from django.urls import path

from . import views
from .test_email import local_email_test

urlpatterns = [
    path("teste-local/email/", local_email_test, name="api-local-email-test"),
    path("config/", views.configuration, name="api-config"),
    path("notificacoes/", views.notifications, name="api-notifications"),
    path("notificacoes/<int:pk>/", views.notification, name="api-notification"),
    path("csrf/", views.csrf, name="api-csrf"),
    path("auth/login/", views.entrar, name="api-login"),
    path("auth/register/", views.cadastrar, name="api-register"),
    path("auth/logout/", views.sair, name="api-logout"),
    path("auth/session/", views.sessao, name="api-session"),
    path("dashboard/summary/", views.resumo, name="api-dashboard"),
    path("<str:recurso>/", views.registros, name="api-registros"),
    path("<str:recurso>/<str:pk>/", views.registro, name="api-registro"),
]
