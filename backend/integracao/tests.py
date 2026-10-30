from django.test import TestCase
from django.urls import reverse


class ApiIntegrationTests(TestCase):
    def login_demo(self):
        response = self.client.post(reverse("api-login"), data='{"email":"demo@celerityambiental.com.br","password":"Celerity@2026"}', content_type="application/json")
        self.assertEqual(response.status_code, 200)

    def test_demo_login_and_resource_crud(self):
        self.login_demo()
        create = self.client.post(reverse("api-registros", args=["processos"]), data='{"empresa":"Empresa teste","numero":"SEMACE 2026/000001","status":"Em análise","responsavel":"Mariana"}', content_type="application/json")
        self.assertEqual(create.status_code, 201)
        item_id = create.json()["id"]
        listed = self.client.get(reverse("api-registros", args=["processos"]))
        self.assertEqual(listed.json()["count"], 1)
        update = self.client.patch(reverse("api-registro", args=["processos", item_id]), data='{"empresa":"Empresa teste","numero":"SEMACE 2026/000001","status":"Deferido","responsavel":"Mariana"}', content_type="application/json")
        self.assertEqual(update.json()["status"], "Deferido")
        remove = self.client.delete(reverse("api-registro", args=["processos", item_id]))
        self.assertEqual(remove.status_code, 204)
