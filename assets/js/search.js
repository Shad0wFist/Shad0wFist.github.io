/* search.js — клиентский поиск по search-index.json. Без зависимостей.
   Корень сайта берётся из data-root у контейнера .search-box. */
(function () {
  var INDEX = null;
  var loading = null;

  function root() {
    var box = document.querySelector('.search-box');
    return box ? (box.getAttribute('data-root') || '') : '';
  }

  function load() {
    if (INDEX) return Promise.resolve(INDEX);
    if (loading) return loading;
    loading = fetch(root() + 'search-index.json')
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) { INDEX = data; return data; })
      .catch(function () { INDEX = false; return false; });
    return loading;
  }

  function snippet(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return text.slice(0, 90) + '…';
    var start = Math.max(0, i - 40);
    var end = Math.min(text.length, i + q.length + 60);
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function run(query, box) {
    var res = box.querySelector('.search-results');
    query = query.trim().toLowerCase();
    if (query.length < 2) { res.classList.remove('open'); res.innerHTML = ''; return; }
    load().then(function (data) {
      if (!data) {
        res.innerHTML = '<div class="none">Индекс поиска не загрузился. Откройте сайт через локальный сервер или GitHub Pages (не двойным кликом по файлу).</div>';
        res.classList.add('open');
        return;
      }
      var terms = query.split(/\s+/);
      var scored = [];
      data.forEach(function (page) {
        var title = (page.title || '').toLowerCase();
        var text = (page.text || '').toLowerCase();
        var score = 0;
        terms.forEach(function (t) {
          if (title.indexOf(t) >= 0) score += 5;
          var idx = text.indexOf(t);
          if (idx >= 0) score += 2 + Math.min(3, (text.split(t).length - 1) / 4);
        });
        if (score > 0) scored.push({ page: page, score: score, first: terms[0] });
      });
      scored.sort(function (a, b) { return b.score - a.score; });
      var top = scored.slice(0, 8);
      if (!top.length) {
        res.innerHTML = '<div class="none">Ничего не найдено по запросу «' + esc(query) + '»</div>';
      } else {
        res.innerHTML = top.map(function (it) {
          var href = root() + it.page.path;
          return '<a href="' + href + '"><span class="t">' + esc(it.page.title) + '</span>' +
                 '<span class="s">' + esc(snippet(it.page.text, it.first)) + '</span></a>';
        }).join('');
      }
      res.classList.add('open');
    });
  }

  function init() {
    var box = document.querySelector('.search-box');
    if (!box) return;
    var input = box.querySelector('input');
    var res = document.createElement('div');
    res.className = 'search-results';
    box.appendChild(res);
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { run(input.value, box); }, 150);
    });
    input.addEventListener('focus', function () { if (input.value.trim()) run(input.value, box); });
    document.addEventListener('click', function (e) {
      if (!box.contains(e.target)) res.classList.remove('open');
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') res.classList.remove('open');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
