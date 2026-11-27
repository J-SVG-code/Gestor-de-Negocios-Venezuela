(function () {
  if (window.self === window.top) return;

  const NOISE_WORDS = [
    'cerrar sesión', 'cerrar sesion', 'salir', 'cancelar', 'cerrar',
    'aceptar', 'ok', 'guardar', 'aviso', 'eliminar', 'borrar',
    'volver', 'atrás', 'atras', 'menú', 'menu', 'siguiente', 'anterior',
    'idioma', 'español', 'english', 'português', 'configurar'
  ];

  const PRIORITY_KEYWORDS = [
    'venta', 'vender', 'inventario', 'producto', 'stock', 'caja',
    'fiado', 'deuda', 'crédito', 'credito', 'cliente', 'catálogo',
    'catalogo', 'reporte', 'resumen', 'estadística', 'estadistica',
    'suscripción', 'suscripcion', 'pago móvil', 'pago movil', 'tasa',
    'qr', 'equipo', 'negocio', 'pedido', 'factura', 'precio', 'cobro',
    'ganancia', 'perdida', 'pérdida'
  ];

  function cleanText(str) {
    return (str || '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isNoise(text) {
    const lower = text.toLowerCase();
    if (lower.length < 3 || lower.length > 42) return true;
    if (/^[0-9.,$Bs]+$/.test(lower)) return true;
    return NOISE_WORDS.some((w) => lower === w || lower.startsWith(w + ' '));
  }

  function scoreFeature(text, isNavOrTab) {
    const lower = text.toLowerCase();
    let score = isNavOrTab ? 12 : 0;
    PRIORITY_KEYWORDS.forEach((kw) => {
      if (lower.includes(kw)) score += 18;
    });
    return score;
  }

  function scanRealFeatures() {
    const map = new Map();

    const navElements = document.querySelectorAll('nav button, nav a, [role="tab"], .nav-item, .tab-btn, .bottom-nav button');
    navElements.forEach((el) => {
      const txt = cleanText(el.innerText || el.textContent);
      if (!isNoise(txt)) {
        const currentScore = map.get(txt)?.score || 0;
        const newScore = scoreFeature(txt, true);
        if (newScore >= currentScore) {
          map.set(txt, { label: txt, score: newScore });
        }
      }
    });

    const generalElements = document.querySelectorAll('button, h2, h3, .card-title, .section-title, label');
    generalElements.forEach((el) => {
      const txt = cleanText(el.innerText || el.textContent);
      if (!isNoise(txt)) {
        const currentScore = map.get(txt)?.score || 0;
        const newScore = scoreFeature(txt, false);
        if (!map.has(txt) || newScore > currentScore) {
          map.set(txt, { label: txt, score: newScore });
        }
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.label);
  }

  function getScrollableContainer() {
    const candidates = Array.from(document.querySelectorAll('main, section, div')).filter((el) => {
      const style = window.getComputedStyle(el);
      const canScroll = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 60;
      return canScroll && el.offsetParent !== null;
    });
    candidates.sort((a, b) => (b.clientHeight * b.clientWidth) - (a.clientHeight * a.clientWidth));
    return candidates[0] || null;
  }

  function smoothScrollApp() {
    const container = getScrollableContainer();
    if (container) {
      container.scrollTo({ top: Math.min(340, container.scrollHeight / 2), behavior: 'smooth' });
      setTimeout(() => container.scrollTo({ top: 0, behavior: 'smooth' }), 2400);
    } else {
      window.scrollBy({ top: 300, behavior: 'smooth' });
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 2400);
    }
  }

  function clickElementByText(targetText) {
    const cleanTarget = cleanText(targetText).toLowerCase();
    const clickables = Array.from(document.querySelectorAll('button, a, [role="tab"], .nav-item, .tab-btn'));

    let match = clickables.find((el) => {
      if (el.offsetParent === null) return false;
      const txt = cleanText(el.innerText || el.textContent).toLowerCase();
      return txt === cleanTarget || txt.includes(cleanTarget);
    });

    if (!match) {
      const menuTrigger = clickables.find((el) => {
        if (el.offsetParent === null) return false;
        const aria = (el.getAttribute('aria-label') || el.id || el.className || '').toLowerCase();
        const txt = cleanText(el.innerText || el.textContent);
        return aria.includes('menu') || aria.includes('more') || aria.includes('opciones') || txt === '⋮' || txt === '☰';
      });
      if (menuTrigger) {
        menuTrigger.click();
        setTimeout(() => {
          const retry = Array.from(document.querySelectorAll('button, a, [role="tab"], .nav-item')).find((el) => {
            const txt = cleanText(el.innerText || el.textContent).toLowerCase();
            return txt === cleanTarget || txt.includes(cleanTarget);
          });
          if (retry) retry.click();
        }, 250);
        return true;
      }
    }

    if (match) {
      match.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => match.click(), 200);
      return true;
    }
    return false;
  }

  window.addEventListener('load', () => {
    setTimeout(() => {
      window.parent.postMessage({
        type: 'PROMO_BRIDGE_READY',
        title: document.title || 'Mi Aplicación',
        features: scanRealFeatures()
      }, '*');
    }, 900);
  });

  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'PROMO_BRIDGE_ACTION') return;
    const action = event.data.action || '';

    if (action === 'scroll') {
      smoothScrollApp();
    } else if (action.startsWith('click:')) {
      const targetText = action.replace('click:', '').trim();
      const clicked = clickElementByText(targetText);
      if (!clicked) {
        smoothScrollApp();
      } else {
        setTimeout(() => smoothScrollApp(), 700);
      }
    }
  });
})();
