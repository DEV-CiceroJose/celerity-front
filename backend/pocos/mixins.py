from django.db.models import Q


class SearchMixin:

    search_param = "search"
    search_fields = []

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.GET.get(self.search_param)

        if search:
            query = Q()

            for field in self.search_fields:
                query |= Q(**{f"{field}__icontains": search})

            queryset = queryset.filter(query)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["search"] = self.request.GET.get(self.search_param, "")
        return context