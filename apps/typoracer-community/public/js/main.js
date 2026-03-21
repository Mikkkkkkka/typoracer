(function () {
  window.addEventListener('load', function () {
    renderLoadMetrics();
    applyNavbarConditionalStyles();
  });
})();

function renderLoadMetrics() {
  const time_load = this.performance.now() / 1000;
  const load_metrics = this.document.getElementById('load-metrics');

  if (load_metrics) {
    load_metrics.textContent = `Time to load page: ${time_load} с.`;
  }
}

function applyNavbarConditionalStyles() {
  const nav_links = this.document.querySelectorAll('.nav-bar__link');
  const current_path = this.document.location.pathname;

  for (let link of nav_links) {
    if (link.pathname === current_path) {
      link.classList.add('nav-bar__link--active');
    }
  }
}
