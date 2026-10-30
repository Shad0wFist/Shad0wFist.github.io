/* scene-preview.js — интерактивное превью сцены Screwdriver прямо в браузере.
   Мини-«движок»: ECS-подобный цикл, фиксированный шаг физики, HUD с FPS.
   Инициализируется на <canvas data-scene="...">. Без зависимостей. */
(function () {
  function Demo(canvas) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var running = true;
    var showColliders = true;
    var last = performance.now();
    var acc = 0;
    var FIXED = 1 / 120;
    var frames = 0, fpsTime = 0, fps = 0;
    var t = 0;

    // «сущности» (ECS): компонент Transform + RigidBody + Sprite
    var ball = { x: W * 0.66, y: 60, vx: 0, vy: 0, r: 14 };
    var player = { x: 40, dir: 1, speed: 90 };
    var crates = [
      { x: W * 0.22, y: H - 64, s: 34 },
      { x: W * 0.34, y: H - 64, s: 26 },
      { x: W * 0.80, y: H - 64, s: 40 }
    ];
    var ground = H - 30;

    function physicsStep(dt) {
      // гравитация + отскок (как Bolt.step())
      ball.vy += 620 * dt;
      ball.y += ball.vy * dt;
      ball.x += ball.vx * dt;
      if (ball.y + ball.r > ground) { ball.y = ground - ball.r; ball.vy = -ball.vy * 0.78; if (Math.abs(ball.vy) < 40) ball.vy = -320; }
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx = -ball.vx;
      // игрок патрулирует
      player.x += player.dir * player.speed * dt;
      if (player.x > W - 60) player.dir = -1;
      if (player.x < 30) player.dir = 1;
      t += dt;
    }

    function drawGrid() {
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#16233b';
      ctx.lineWidth = 1;
      for (var x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
      for (var y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
    }

    function draw() {
      drawGrid();
      // земля
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, ground, W, H - ground);
      ctx.strokeStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(0, ground + .5); ctx.lineTo(W, ground + .5); ctx.stroke();
      // ящики
      crates.forEach(function (c) {
        ctx.fillStyle = '#7c4a12';
        ctx.fillRect(c.x - c.s / 2, c.y - c.s / 2, c.s, c.s);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(c.x - c.s / 2 + .5, c.y - c.s / 2 + .5, c.s - 1, c.s - 1);
        ctx.beginPath();
        ctx.moveTo(c.x - c.s / 2, c.y - c.s / 2); ctx.lineTo(c.x + c.s / 2, c.y + c.s / 2);
        ctx.moveTo(c.x + c.s / 2, c.y - c.s / 2); ctx.lineTo(c.x - c.s / 2, c.y + c.s / 2);
        ctx.strokeStyle = 'rgba(245,158,11,.5)';
        ctx.stroke();
        if (showColliders) {
          ctx.strokeStyle = '#22c55e';
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(c.x - c.s / 2 - 3, c.y - c.s / 2 - 3, c.s + 6, c.s + 6);
          ctx.setLineDash([]);
        }
      });
      // игрок (капсула)
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(player.x - 8, ground - 40, 16, 40, 8) : ctx.rect(player.x - 8, ground - 40, 16, 40);
      ctx.fill();
      // raycast от игрока
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(player.x, ground - 20); ctx.lineTo(player.x + 70 * player.dir, ground - 20); ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(player.x + 70 * player.dir, ground - 20, 3, 0, 7); ctx.fill();
      // мяч
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath(); ctx.arc(ball.x - 4, ball.y - 5, 4, 0, 7); ctx.fill();
      if (showColliders) {
        ctx.strokeStyle = '#22c55e';
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r + 4, 0, 7); ctx.stroke();
        ctx.setLineDash([]);
      }
      // HUD
      ctx.fillStyle = 'rgba(5,8,15,.75)';
      ctx.fillRect(8, 8, 168, 58);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(8.5, 8.5, 168, 58);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '600 11px ui-monospace, Consolas, monospace';
      ctx.fillText('SCREWDRIVER RUNTIME', 16, 24);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('FPS ' + fps + '   entities 6', 16, 40);
      ctx.fillText('draw calls 4   tris 1.2k', 16, 56);
    }

    function loop(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frames++; fpsTime += dt;
      if (fpsTime >= 0.5) { fps = Math.round(frames / fpsTime); frames = 0; fpsTime = 0; }
      if (running) {
        acc += dt;
        while (acc >= FIXED) { physicsStep(FIXED); acc -= FIXED; }
      }
      draw();
      requestAnimationFrame(loop);
    }

    this.toggle = function () { running = !running; return running; };
    this.colliders = function () { showColliders = !showColliders; return showColliders; };
    requestAnimationFrame(loop);
  }

  function init() {
    document.querySelectorAll('canvas[data-scene]').forEach(function (cv) {
      var demo = new Demo(cv);
      var wrap = cv.closest('.scene-wrap');
      if (!wrap) return;
      var play = wrap.querySelector('[data-act="play"]');
      var coll = wrap.querySelector('[data-act="colliders"]');
      var fpsEl = wrap.querySelector('.fps');
      if (play) play.addEventListener('click', function () {
        var on = demo.toggle();
        play.textContent = on ? 'Пауза' : 'Пуск';
      });
      if (coll) coll.addEventListener('click', function () {
        var on = demo.colliders();
        coll.textContent = on ? 'Коллайдеры: вкл' : 'Коллайдеры: выкл';
      });
      if (fpsEl) setInterval(function () { fpsEl.textContent = 'fixed-step 120 Hz'; }, 1000);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
