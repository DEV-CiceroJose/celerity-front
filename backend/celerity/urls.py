from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("integracao.urls")),
    path("accounts/", include("accounts.urls")),
    path("pocos/", include("pocos.urls")),
    path("processos/", include("processos.urls")),
    path("outros/", include("outros.urls")),

]
