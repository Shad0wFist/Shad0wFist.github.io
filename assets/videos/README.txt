Каталог видеоматериалов документации.

demo.gif  — анимированный ролик рантайм-кадра (36 кадров, сгенерирован
            автоматически, играет в <img> без внешних зависимостей).

Как добавить настоящее видео (по желанию):
  1) Запишите ролик редактора (Windows: Win+G -> запись, или OBS Studio).
  2) Сохраните как demo.mp4 в этот каталог.
  3) На главной замените тег <img src="assets/videos/demo.gif"> на:
       <video controls preload="metadata" poster="assets/images/screenshots/editor-viewport.jpg">
         <source src="assets/videos/demo.mp4" type="video/mp4">
       </video>
