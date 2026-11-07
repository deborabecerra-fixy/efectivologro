/* Meta Pixel de EfectivoLogro (ID 2122901484986797).
   - Se carga una sola vez por página, aunque el script se incluya dos veces.
   - No se activa hasta que la persona acepta las cookies de medición.
   - Solo envía PageView: sin datos personales, montos ni resultados del simulador.
   - autoConfig desactivado para que Meta no lea textos de botones (incluyen montos). */
(function () {
  if (window.__elMetaPixel) return;
  window.__elMetaPixel = true;

  var PIXEL_ID = '2122901484986797';
  var KEY = 'el_consent_meta';

  function readConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function loadPixel() {
    if (window.fbq) return;
    /* Código base oficial de Meta Pixel */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('set', 'autoConfig', false, PIXEL_ID);
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  function showBanner() {
    var css =
      '.el-consent{position:fixed;z-index:80;left:16px;bottom:16px;max-width:400px;padding:16px 18px;' +
      'border-radius:14px;background:#6A0A0F;color:#fff;font:14px/1.45 Inter,system-ui,sans-serif;' +
      'box-shadow:0 16px 40px rgba(40,0,6,.35)}' +
      '.el-consent p{margin:0 0 12px}' +
      '.el-consent a{color:#F3D400;text-decoration:underline}' +
      '.el-consent-actions{display:flex;gap:8px}' +
      '.el-consent button{flex:1;padding:9px 12px;border:0;border-radius:8px;font:700 14px Inter,system-ui,sans-serif;cursor:pointer}' +
      '.el-consent .ok{background:#F3D400;color:#6A0A0F}' +
      '.el-consent .no{background:rgba(255,255,255,.12);color:#fff}' +
      '@media (max-width:560px){.el-consent{right:16px;max-width:none}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.className = 'el-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Preferencias de cookies');
    box.innerHTML =
      '<p>Usamos cookies de Meta para medir las visitas y mejorar nuestros anuncios. ' +
      '<a href="privacidad.html">Más información</a></p>' +
      '<div class="el-consent-actions"><button type="button" class="no">Rechazar</button>' +
      '<button type="button" class="ok">Aceptar</button></div>';
    document.body.appendChild(box);

    box.querySelector('.ok').addEventListener('click', function () {
      saveConsent('granted');
      box.remove();
      loadPixel();
    });
    box.querySelector('.no').addEventListener('click', function () {
      saveConsent('denied');
      box.remove();
    });
  }

  /* ===== Eventos de conversión =====
     Solo se envían si la persona aceptó (el píxel existe únicamente en ese caso).
     Nunca se envían montos, plazos, cuotas ni datos personales. */
  function track(kind, name, params, eventId) {
    if (readConsent() !== 'granted' || typeof window.fbq !== 'function') return false;
    if (eventId) window.fbq(kind, name, params || {}, { eventID: eventId });
    else window.fbq(kind, name, params || {});
    return true;
  }

  /* Dónde está el botón: solo la sección, para saber qué llamado funciona */
  function placement(el) {
    if (el.closest('.nav')) return 'navbar';
    if (el.closest('.drawer')) return 'menu_mobile';
    if (el.classList.contains('wa-fab')) return 'boton_flotante';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.simulator-section')) return 'simulador';
    if (el.closest('.branches-section')) return 'sucursales';
    if (el.closest('.faq-section')) return 'preguntas';
    if (el.closest('.final-cta')) return 'cta_final';
    return 'otro';
  }

  /* Links de contacto comercial: WhatsApp directo o el Linktree de contacto.
     Los links de redes del footer no cuentan como contacto. */
  var CONTACT_RE = /^https:\/\/(linktr\.ee\/efectivologro|wa\.me\/|api\.whatsapp\.com\/|(www\.)?whatsapp\.com\/)/i;
  var lastFired = new WeakMap();

  /* La combinación elegida se usa solo acá, para no repetir eventos; nunca se envía a Meta */
  var simulated = new Set();
  function simulationKey() {
    var amount = document.querySelector('.amount-btn.active');
    var plan = document.querySelector('.plan-btn.active');
    return amount && plan ? amount.dataset.amount + '|' + plan.dataset.weeks : '';
  }
  var lastSimulation = null;
  document.addEventListener('DOMContentLoaded', function () { lastSimulation = simulationKey(); });

  document.addEventListener('click', function (e) {
    var target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    // Contact + SeleccionSucursal
    var link = target.closest('a[href]');
    if (link && CONTACT_RE.test(link.href) && !link.closest('footer')) {
      var now = Date.now();
      if (now - (lastFired.get(link) || 0) < 1000) return; // un clic = un evento
      lastFired.set(link, now);
      // Contact es la única conversión por clic. SeleccionSucursal es informativo:
      // comparte el mismo eventID para poder cruzarlos y no debe marcarse como conversión.
      var card = link.closest('.branch-card');
      var name = card && card.querySelector('.branch-ribbon span');
      var params = { ubicacion: placement(link) };
      if (name) params.sucursal = name.textContent.trim();
      var eventId = 'c' + now.toString(36) + Math.random().toString(36).slice(2, 7);
      track('track', 'Contact', params, eventId);
      if (name) track('trackCustom', 'SeleccionSucursal', { sucursal: params.sucursal }, eventId);
      return;
    }

    // SimulacionCredito: cada combinación nueva de monto + plan que la persona elige.
    // Este listener corre después del simulador, así que los botones activos ya están actualizados.
    if (target.closest('.amount-btn, .plan-btn')) {
      var key = simulationKey();
      if (!key || key === lastSimulation) return;       // clic sin cambio: no es una simulación nueva
      lastSimulation = key;
      if (simulated.has(key)) return;                    // misma combinación ya registrada en esta visita
      if (track('trackCustom', 'SimulacionCredito')) simulated.add(key);
    }
  });

  var consent = readConsent();
  if (consent === 'granted') {
    loadPixel();
  } else if (consent !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
