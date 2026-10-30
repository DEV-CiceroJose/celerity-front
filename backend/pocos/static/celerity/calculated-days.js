(() => {
  let offset = 0;
  const formatter = new Intl.DateTimeFormat('en-US', {timeZone:'America/Sao_Paulo', year:'numeric', month:'2-digit', day:'2-digit'});
  function refresh() {
    const parts = formatter.formatToParts(new Date(Date.now() + offset));
    const get = type => parts.find(part => part.type === type).value;
    const today = Date.parse(`${get('year')}-${get('month')}-${get('day')}T00:00:00Z`);
    document.querySelectorAll('[data-reference-field]').forEach(input => {
      const source = input.form?.elements[input.dataset.referenceField];
      const start = source?.value ? Date.parse(`${source.value}T00:00:00Z`) : NaN;
      input.value = Number.isFinite(start) ? input.dataset.countMode === 'remaining' ? Math.round((start-today)/86400000) : Math.max(0, Math.round((today-start)/86400000)) : '';
    });
  }
  const ready = () => {
    refresh();
    document.addEventListener('change', refresh);
    document.addEventListener('visibilitychange', refresh);
    setInterval(refresh, 1000);
    fetch('/api/config/').then(response => response.ok ? response.json() : Promise.reject()).then(data => { offset = Date.parse(data.serverNow) - Date.now(); refresh(); }).catch(() => {});
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
