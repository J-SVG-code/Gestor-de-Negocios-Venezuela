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
    'ganancia', 'perdida', 'pérdida', 'gasto', 'proveedor'
  ];

  function cleanText(str) {
    return (str || '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isNoise(text) {
    const lower = text.toLowerCase();
    if (lower.length < 2 || lower.length > 45) return true;
    if (/^[0-9.,$Bs]+$/.test(lower)) return true;
    return NOISE_WORDS.some((w) => lower === w || lower.startsWith(w + ' '));
  }

  function scoreFeature(text, isNavOrTab) {
    const lower = text.toLowerCase();
    let score = isNavOrTab ? 15 : 0;
    PRIORITY_KEYWORDS.forEach((kw) => {
      if (lower.includes(kw)) score += 20;
    });
    return score;
  }

  function scanRealFeatures() {
    const map = new Map();
    const navElements = document.querySelectorAll('nav button, nav a, [role="tab"], .nav-item, .tab-btn, .bottom-nav button, header button');
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

    const generalElements = document.querySelectorAll('button, [role="button"], h1, h2, h3, .card-title, .section-title, label');
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
      .slice(0, 8)
      .map((item) => item.label);
  }

  function highlightElement(el, color = '#10b981') {
    if (!el) return;
    const prevOutline = el.style.outline;
    const prevBoxShadow = el.style.boxShadow;
    el.style.outline = `2.5px solid ${color}`;
    el.style.boxShadow = `0 0 16px ${color}`;
    setTimeout(() => {
      el.style.outline = prevOutline;
      el.style.boxShadow = prevBoxShadow;
    }, 1500);
  }

  function fireRealClick(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlightElement(el, '#6366f1');
    setTimeout(() => {
      try {
        el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        el.click();
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      } catch (e) {}
    }, 220);
  }

  function clickElementByText(targetText) {
    const cleanTarget = cleanText(targetText).toLowerCase();
    if (!cleanTarget) return false;

    const clickables = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="button"], .nav-item, .tab-btn'));

    let match = clickables.find((el) => {
      if (el.offsetParent === null) return false;
      const txt = cleanText(el.innerText || el.textContent).toLowerCase();
      return txt === cleanTarget;
    });

    if (!match) {
      match = clickables.find((el) => {
        if (el.offsetParent === null) return false;
        const txt = cleanText(el.innerText || el.textContent).toLowerCase();
        return txt.includes(cleanTarget) || cleanTarget.includes(txt);
      });
    }

    if (match) {
      fireRealClick(match);
      return true;
    }

    const menuTrigger = clickables.find((el) => {
      if (el.offsetParent === null) return false;
      const aria = (el.getAttribute('aria-label') || el.id || el.className || '').toLowerCase();
      const txt = cleanText(el.innerText || el.textContent);
      return aria.includes('menu') || aria.includes('more') || aria.includes('opciones') || txt === '⋮' || txt === '☰';
    });

    if (menuTrigger) {
      fireRealClick(menuTrigger);
      setTimeout(() => {
        const retry = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="button"], .nav-item')).find((el) => {
          const txt = cleanText(el.innerText || el.textContent).toLowerCase();
          return txt === cleanTarget || txt.includes(cleanTarget);
        });
        if (retry) fireRealClick(retry);
      }, 350);
      return true;
    }

    return false;
  }

  function fillSampleValue(inputEl, index = 0) {
    const type = (inputEl.type || 'text').toLowerCase();
    const labelHint = ((inputEl.placeholder || '') + ' ' + (inputEl.name || '') + ' ' + (inputEl.id || '')).toLowerCase();

    let sample = 'Demo Pro';
    if (type === 'number' || labelHint.includes('precio') || labelHint.includes('monto') || labelHint.includes('cantidad') || labelHint.includes('stock')) {
      sample = index === 0 ? '25' : '10';
    } else if (labelHint.includes('cliente') || labelHint.includes('nombre')) {
      sample = 'Cliente Demo';
    } else if (labelHint.includes('producto') || labelHint.includes('articulo') || labelHint.includes('artículo')) {
      sample = 'Producto Demo';
    } else if (labelHint.includes('referencia') || labelHint.includes('pago')) {
      sample = '984120';
    }

    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(inputEl, sample);
    } else {
      inputEl.value = sample;
    }
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function useVisibleFunctionNow() {
    const visibleInputs = Array.from(
      document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea')
    ).filter((el) => el.offsetParent !== null && !el.disabled && !el.readOnly);

    if (visibleInputs.length > 0) {
      visibleInputs.slice(0, 2).forEach((inp, idx) => {
        setTimeout(() => {
          inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
          highlightElement(inp, '#10b981');
          inp.focus();
          if (inp.tagName === 'SELECT') {
            if (inp.options.length > 1) {
              inp.selectedIndex = (inp.selectedIndex + 1) % inp.options.length;
              inp.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            fillSampleValue(inp, idx);
          }
        }, idx * 550);
      });

      setTimeout(() => {
        const actionButtons = Array.from(document.querySelectorAll('button, [role="button"]')).filter((btn) => {
          if (btn.offsetParent === null || btn.disabled) return false;
          const t = cleanText(btn.innerText || btn.textContent).toLowerCase();
          return (
            t.includes('agregar') || t.includes('añadir') || t.includes('registrar') ||
            t.includes('guardar') || t.includes('calcular') || t.includes('generar') ||
            t.includes('crear') || t.includes('vender') || t.includes('cobrar') || t.includes('buscar')
          );
        });
        if (actionButtons.length > 0) {
          fireRealClick(actionButtons[0]);
        }
      }, 1350);

      return true;
    }

    const actionCandidates = Array.from(document.querySelectorAll('button, [role="button"]')).filter((btn) => {
      if (btn.offsetParent === null || btn.disabled) return false;
      const t = cleanText(btn.innerText || btn.textContent).toLowerCase();
      if (!t || t.length > 35) return false;
      return !NOISE_WORDS.some((w) => t === w || t.startsWith(w + ' '));
    });

    if (actionCandidates.length > 0) {
      const chosen = actionCandidates[Math.floor(Math.random() * Math.min(actionCandidates.length, 4))];
      fireRealClick(chosen);
      return true;
    }

    return false;
  }

  function executeFunctionAction(rawAction) {
    const action = (rawAction || '').trim();
    const lower = action.toLowerCase();

    if (lower === 'use' || lower === 'interact') {
      if (!useVisibleFunctionNow()) {
        window.scrollBy({ top: 180, behavior: 'smooth' });
      }
      return;
    }

    if (lower.startsWith('click:')) {
      const target = action.slice(6).trim();
      const parts = target.split('->').map((p) => p.trim()).filter(Boolean);

      if (parts.length > 1) {
        clickElementByText(parts[0]);
        setTimeout(() => {
          clickElementByText(parts[1]);
          setTimeout(() => useVisibleFunctionNow(), 600);
        }, 700);
        return;
      }

      const clicked = clickElementByText(target);
      setTimeout(() => {
        useVisibleFunctionNow();
      }, clicked ? 850 : 150);
      return;
    }

    const clicked = clickElementByText(action);
    setTimeout(() => {
      useVisibleFunctionNow();
    }, clicked ? 850 : 150);
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
    executeFunctionAction(event.data.action);
  });
})();
