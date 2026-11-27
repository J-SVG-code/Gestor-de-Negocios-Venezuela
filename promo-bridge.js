(function () {
  // Solo se activa si la app está siendo abierta dentro de PromoStudio
  if (window.self === window.top) return;

  function scanRealFeatures() {
    const features = [];
    const candidates = document.querySelectorAll('button, [role="tab"], .nav-item, h2, h3');
    candidates.forEach((el) => {
      const text = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
      if (text.length >= 3 && text.length <= 35 && !features.includes(text)) {
        features.push(text);
      }
    });
    return features.slice(0, 8);
  }

  // Avisar a PromoStudio que la app cargó y enviar sus funciones reales
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.parent.postMessage({
        type: 'PROMO_BRIDGE_READY',
        title: document.title || 'Mi Aplicación',
        features: scanRealFeatures()
      }, '*');
    }, 800);
  });

  // Ejecutar acciones reales cuando PromoStudio lo ordene durante el video
  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'PROMO_BRIDGE_ACTION') return;
    const action = event.data.action || '';

    if (action === 'scroll') {
      window.scrollBy({ top: 240, behavior: 'smooth' });
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 2200);
    } else if (action.startsWith('click:')) {
      const targetText = action.replace('click:', '').trim().toLowerCase();
      const clickables = Array.from(document.querySelectorAll('button, a, [role="tab"], .nav-item'));
      const match = clickables.find(el =>
        (el.innerText || el.textContent || '').toLowerCase().includes(targetText)
      );
      if (match) {
        match.click();
      } else {
        window.scrollBy({ top: 180, behavior: 'smooth' });
      }
    }
  });
})();
