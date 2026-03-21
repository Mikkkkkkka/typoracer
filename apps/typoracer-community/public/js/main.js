(function () {
  window.addEventListener('load', function () {
    const time_load = this.performance.now() / 1000;
    const load_metrics = this.document.getElementById('load-metrics');

    if (load_metrics) {
      load_metrics.textContent = `Время загрузки страницы ${time_load} с.`;
    }

    const nav_links = this.document.querySelectorAll('.nav-bar__link');
    const current_path = this.document.location.pathname;

    nav_links.forEach((link) => {
      if (link.pathname === current_path) {
        link.classList.add('nav-bar__link--active');
      }
    });
  });
})();
