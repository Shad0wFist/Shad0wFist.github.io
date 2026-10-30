/* sidebar.js — мобильное меню + подсветка активного пункта. Без зависимостей. */
(function () {
  function init() {
    var toggle = document.querySelector('.nav-toggle');
    var sidebar = document.querySelector('.sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        toggle.setAttribute('aria-expanded', sidebar.classList.contains('open') ? 'true' : 'false');
      });
    }
    // подсветка активного пункта: сравниваем пути
    var here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    document.querySelectorAll('.sidebar a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var target = href.replace(/index\.html$/, '').replace(/\/$/, '');
      // приводим к абсолютному относительно корня сайта
      var abs = a.pathname ? a.pathname.replace(/index\.html$/, '').replace(/\/$/, '') : target;
      if (abs === here || (here !== '/' && abs === here + '/')) {
        a.classList.add('active');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
