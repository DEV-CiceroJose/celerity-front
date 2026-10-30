from django.db.models import Q


class SearchMixin:
    search_param = "q"
    search_fields = []

    def get_search_query(self):
        return self.request.GET.get(self.search_param, "")

    def get_queryset(self):
        queryset = super().get_queryset()
        query = self.get_search_query()

        if query and self.search_fields:
            filters = Q()
            for field in self.search_fields:
                filters |= Q(**{f"{field}__icontains": query})
            queryset = queryset.filter(filters)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["q"] = self.get_search_query()
        return context