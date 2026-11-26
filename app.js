(() => {
  const screens = [...document.querySelectorAll('[data-screen]')];
  const navItems = [...document.querySelectorAll('[data-nav]')];
  const installButton = document.getElementById('installButton');
  const toast = document.getElementById('toast');
  let deferredInstallPrompt = null;
  let toastTimer = null;

  function showScreen(name, updateHash = true) {
    const safeName = screens.some(s => s.dataset.screen === name) ? name : 'home';
    screens.forEach(screen => {
      const active = screen.dataset.screen === safeName;
      screen.classList.toggle('active', active);
      screen.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    navItems.forEach(item => {
      const active = item.dataset.nav === safeName || (safeName === 'more' && item.dataset.nav === 'more');
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    if (updateHash && location.hash !== `#${safeName}`) history.pushState({screen:safeName}, '', `#${safeName}`);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  navItems.forEach(item => item.addEventListener('click', () => showScreen(item.dataset.nav)));
  document.querySelectorAll('[data-screen-link]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); showScreen(link.dataset.screenLink);
  }));

  // Open live EDHR services in the same app/browser context.
  document.querySelectorAll('[data-external]').forEach(link => {
    link.addEventListener('click', () => {
      link.setAttribute('rel', 'noopener');
    });
  });

  window.addEventListener('popstate', () => showScreen((location.hash || '#home').slice(1), false));
  const initial = (location.hash || '#home').slice(1);
  showScreen(initial, false);

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    installButton.hidden = true;
    showToast('EDHR has been added to your home screen.');
  });
  installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      showToast('Use your browser menu and choose “Add to Home Screen”.');
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
})();
