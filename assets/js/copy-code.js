/* copy-code.js — кнопка «Копировать» у каждого блока кода. Без зависимостей. */
(function () {
  function init() {
    document.querySelectorAll('.codeblock').forEach(function (block) {
      var btn = block.querySelector('.copy-btn');
      var pre = block.querySelector('pre');
      if (!btn || !pre) return;
      btn.addEventListener('click', function () {
        var text = pre.innerText;
        function done() {
          btn.textContent = 'Скопировано ✓';
          btn.classList.add('done');
          setTimeout(function () {
            btn.textContent = 'Копировать';
            btn.classList.remove('done');
          }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(); });
        } else {
          fallback();
        }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
