/* theme.js — переключатель тёмной/светлой темы.
   Тема хранится в localStorage под ключом screw-theme; по умолчанию тёмная.
   Начальное значение ставится инлайн-скриптом в <head> (без мигания),
   здесь только привязка кнопки и синхронизация подписи. */
(function () {
  var KEY = 'screw-theme';

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function label(t) {
    return t === 'dark' ? '☀ Светлая' : '🌙 Тёмная';
  }

  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) { /* приватный режим / sandbox iframe */ }
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.textContent = label(t);
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.title = t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
    });
  }

  function init() {
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    });
    apply(current());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
