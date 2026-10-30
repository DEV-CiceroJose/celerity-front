from django import forms
from .dates import counted_days, remaining_days


class CalculatedDaysForm(forms.ModelForm):
    """Campos calculados de consulta, posicionados depois das datas de referência."""
    day_fields = ()

    class Media:
        js = ("celerity/calculated-days.js",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, date_field, label, remaining in self.day_fields:
            value = self.data.get(date_field) if self.is_bound else self.initial.get(date_field, getattr(self.instance, date_field, None))
            days = remaining_days(value) if remaining else counted_days(value)
            self.fields[name] = forms.IntegerField(label=label, required=False, disabled=True, initial=days,
                help_text="Calculado automaticamente pelo dia atual em Brasília.",
                widget=forms.NumberInput(attrs={"data-reference-field": date_field, "data-count-mode": "remaining" if remaining else "elapsed"}))
        order = []
        computed = {item[0] for item in self.day_fields}
        for name in self.fields:
            if name in computed:
                continue
            order.append(name)
            order.extend(item[0] for item in self.day_fields if item[1] == name)
        self.order_fields(order)
