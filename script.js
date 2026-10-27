// Service worker bootstrap for the redesigned inline application.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.info('PWA aktif:', registration.scope);
      })
      .catch((error) => {
        console.error('Service worker gagal didaftarkan:', error);
      });
  });
}
