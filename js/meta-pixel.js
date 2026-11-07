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

  var consent = readConsent();
  if (consent === 'granted') {
    loadPixel();
  } else if (consent !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
