import {
  getBrandById,
  getFullUrl,
  getFullWebpUrl,
  getOriginalUrl,
  getOriginalWebpUrl,
  hasNativeOriginal,
  renderPicture,
} from '../data/galleryData.js';

const ZOOM_IN_SVG =
  '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
const ZOOM_OUT_SVG =
  '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

let webpSupportPromise = null;
function supportsWebp() {
  if (!webpSupportPromise) {
    webpSupportPromise = new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(probe.width > 0 && probe.height > 0);
      probe.onerror = () => resolve(false);
      probe.src =
        'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
    });
  }
  return webpSupportPromise;
}

export function createLightbox() {
  const modal = document.createElement('div');
  modal.id = 'optical-lightbox';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.className =
    'fixed inset-0 z-[60] hidden bg-[#050608]/95 backdrop-blur-md flex-col justify-between transition-opacity duration-200 opacity-0';

  modal.innerHTML = `
    <div class="relative z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-[#050608]/90 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
      <span data-lb-counter class="text-xs font-medium text-zinc-400">1 / 1</span>
      <div class="flex items-center gap-2 shrink-0">
        <button type="button" data-lb-zoom aria-label="Zoom in" title="Zoom" class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/15 bg-white/[0.04] hover:border-[#00E082] hover:text-[#00E082] text-zinc-200 transition cursor-pointer">
          ${ZOOM_IN_SVG}
        </button>
        <button type="button" data-lb-close aria-label="Close" title="Close" class="inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/15 bg-white/[0.04] hover:border-[#00E082] hover:text-[#00E082] text-zinc-200 transition cursor-pointer">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <div data-lb-viewport class="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
      <button type="button" data-lb-prev aria-label="Previous photo" title="Previous" class="absolute left-2 sm:left-4 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/15 bg-black/70 hover:border-[#00E082] hover:text-[#00E082] text-white transition cursor-pointer">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div data-lb-stage class="lightbox-img-stage is-zoomable relative w-full h-full flex items-center justify-center p-2 sm:p-5">
        <div data-lb-spinner class="absolute inset-0 flex items-center justify-center bg-black/60 z-10 pointer-events-none">
          <div class="w-7 h-7 rounded-full border-2 border-[#00E082]/25 border-t-[#00E082] animate-spin"></div>
        </div>
        <img data-lb-img src="" alt="" decoding="async" class="shrink-0 max-h-full max-w-full w-auto h-auto object-contain rounded-lg select-none" draggable="false" />
      </div>

      <div
        data-lb-attribution
        class="pointer-events-none hidden absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-30 h-10 items-center justify-center rounded-full border border-white/15 px-3 shadow-lg backdrop-blur-md"
      ></div>

      <button type="button" data-lb-next aria-label="Next photo" title="Next" class="absolute right-2 sm:right-4 z-20 inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/15 bg-black/70 hover:border-[#00E082] hover:text-[#00E082] text-white transition cursor-pointer">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const img = modal.querySelector('[data-lb-img]');
  const viewport = modal.querySelector('[data-lb-viewport]');
  const stage = modal.querySelector('[data-lb-stage]');
  const spinner = modal.querySelector('[data-lb-spinner]');
  const attributionBubble = modal.querySelector('[data-lb-attribution]');
  const counterEl = modal.querySelector('[data-lb-counter]');
  const zoomBtn = modal.querySelector('[data-lb-zoom]');
  const closeBtn = modal.querySelector('[data-lb-close]');
  const prevBtn = modal.querySelector('[data-lb-prev]');
  const nextBtn = modal.querySelector('[data-lb-next]');

  let items = [];
  let index = 0;
  let renderToken = 0;
  const upgradedSlugs = new Set();
  let isZoomed = false;
  let baseWidth = 0;
  let baseHeight = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDidDrag = false;
  let panNormX = 0.5;
  let panNormY = 0.5;
  let dragStartNormX = 0.5;
  let dragStartNormY = 0.5;

  function captureBaseMetrics() {
    if (isZoomed) return;
    const rect = img.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      baseWidth = rect.width;
      baseHeight = rect.height;
    }
  }

  function getZoomMetrics() {
    const vpRect = viewport.getBoundingClientRect();
    const w = baseWidth || img.offsetWidth || vpRect.width;
    const h = baseHeight || img.offsetHeight || vpRect.height;

    // Expand layout box to full viewport cover scale so mobile rasterizes full native pixels cleanly
    const coverScale = w > 0 && h > 0 ? Math.max(vpRect.width / w, vpRect.height / h) : 2.2;
    const zoomScale = Math.max(2.15, coverScale * 1.12);
    const zoomedW = Math.round(w * zoomScale);
    const zoomedH = Math.round(h * zoomScale);

    const overflowX = Math.max(0, (zoomedW - vpRect.width) / 2);
    const overflowY = Math.max(0, (zoomedH - vpRect.height) / 2);

    return { zoomedW, zoomedH, overflowX, overflowY };
  }

  function applyZoomTransform(nx, ny, smooth = false) {
    panNormX = Math.max(0, Math.min(1, nx));
    panNormY = Math.max(0, Math.min(1, ny));

    img.style.transition = smooth
      ? 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
      : 'none';

    if (!isZoomed) {
      img.style.width = '';
      img.style.height = '';
      img.style.maxWidth = '';
      img.style.maxHeight = '';
      img.style.transformOrigin = 'center center';
      img.style.transform = 'translate3d(0px, 0px, 0)';
      return;
    }

    const { zoomedW, zoomedH, overflowX, overflowY } = getZoomMetrics();
    const tx = (0.5 - panNormX) * 2 * overflowX;
    const ty = (0.5 - panNormY) * 2 * overflowY;

    img.style.width = `${zoomedW}px`;
    img.style.height = `${zoomedH}px`;
    img.style.maxWidth = 'none';
    img.style.maxHeight = 'none';
    img.style.transformOrigin = 'center center';
    img.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
  }

  function setZoom(zoomed, nx = 0.5, ny = 0.5) {
    if (zoomed && !isZoomed) {
      captureBaseMetrics();
    }
    isZoomed = zoomed;
    img.classList.toggle('rounded-lg', !zoomed);
    img.classList.toggle('max-h-full', !zoomed);
    img.classList.toggle('max-w-full', !zoomed);
    stage.classList.toggle('p-2', !zoomed);
    stage.classList.toggle('sm:p-5', !zoomed);
    stage.classList.toggle('is-zoomed', zoomed);
    stage.classList.toggle('is-zoomable', !zoomed);
    stage.classList.toggle('touch-none', zoomed);
    zoomBtn.innerHTML = zoomed ? ZOOM_OUT_SVG : ZOOM_IN_SVG;
    zoomBtn.setAttribute('aria-label', zoomed ? 'Zoom out' : 'Zoom in');
    applyZoomTransform(nx, ny, false);
  }

  function renderAttributionBubble(brandId) {
    if (!attributionBubble) return;
    const brand = getBrandById(brandId);
    if (!brand) {
      attributionBubble.classList.add('hidden');
      attributionBubble.classList.remove('inline-flex');
      attributionBubble.innerHTML = '';
      return;
    }

    attributionBubble.style.backgroundColor = brand.pinBg;
    attributionBubble.setAttribute('title', brand.name);
    attributionBubble.innerHTML = renderPicture({
      webp: brand.logoWebp,
      fallback: brand.logoFallback,
      alt: brand.name,
      pictureClass: 'flex h-7 items-center justify-center',
      imgClass: 'max-h-7 w-auto max-w-[96px] object-contain',
      loading: 'eager',
    });
    attributionBubble.classList.remove('hidden');
    attributionBubble.classList.add('inline-flex');
  }

  async function upgradeToOriginal(slug, token) {
    if (!hasNativeOriginal(slug)) {
      upgradedSlugs.add(slug);
      return;
    }

    const useWebp = await supportsWebp();
    if (token !== renderToken) return;
    if (!useWebp) {
      upgradedSlugs.add(slug);
      return;
    }

    const targetUrl = getOriginalWebpUrl(slug);
    const master = new Image();
    master.decoding = 'async';
    master.onload = () => {
      upgradedSlugs.add(slug);
      if (token !== renderToken) return;
      img.src = targetUrl;
    };
    master.onerror = () => {};
    master.src = targetUrl;
  }

  async function render() {
    if (!items.length) return;
    const item = items[index];
    const token = ++renderToken;
    baseWidth = 0;
    baseHeight = 0;
    setZoom(false, 0.5, 0.5);
    spinner.classList.remove('hidden');

    renderAttributionBubble(item.brandId);
    counterEl.textContent = `${index + 1} / ${items.length}`;

    const useWebp = await supportsWebp();
    if (token !== renderToken) return;

    const alreadyFullRes = upgradedSlugs.has(item.slug) || !hasNativeOriginal(item.slug);
    const initialUrl = useWebp
      ? alreadyFullRes
        ? getOriginalWebpUrl(item.slug)
        : getFullWebpUrl(item.slug)
      : getOriginalUrl(item.slug);

    img.src = initialUrl;
    img.alt = item.brandId ? getBrandById(item.brandId)?.name || 'Gallery photo' : 'Gallery photo';

    if (alreadyFullRes || !useWebp) {
      upgradedSlugs.add(item.slug);
    } else {
      upgradeToOriginal(item.slug, token);
    }
  }

  img.addEventListener('load', () => {
    spinner.classList.add('hidden');
    captureBaseMetrics();
  });
  img.addEventListener('error', () => spinner.classList.add('hidden'));

  function open(list, startIndex = 0) {
    items = list;
    index = Math.max(0, Math.min(startIndex, list.length - 1));
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');
    });
  }

  function close() {
    renderToken++;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      img.src = '';
    }, 180);
  }

  function next() {
    if (!items.length) return;
    index = (index + 1) % items.length;
    render();
  }

  function prev() {
    if (!items.length) return;
    index = (index - 1 + items.length) % items.length;
    render();
  }

  function getViewportNorm(clientX, clientY) {
    const vpRect = viewport.getBoundingClientRect();
    if (!vpRect.width || !vpRect.height) return [0.5, 0.5];
    return [
      (clientX - vpRect.left) / vpRect.width,
      (clientY - vpRect.top) / vpRect.height,
    ];
  }

  stage.addEventListener('click', (e) => {
    if (touchDidDrag) {
      touchDidDrag = false;
      return;
    }
    const [nx, ny] = getViewportNorm(e.clientX, e.clientY);
    setZoom(!isZoomed, nx, ny);
  });

  viewport.addEventListener('mousemove', (e) => {
    if (!isZoomed) return;
    const [nx, ny] = getViewportNorm(e.clientX, e.clientY);
    applyZoomTransform(nx, ny, false);
  });

  window.addEventListener('resize', () => {
    if (modal.classList.contains('hidden')) return;
    if (!isZoomed) {
      captureBaseMetrics();
    } else {
      applyZoomTransform(panNormX, panNormY, false);
    }
  });

  zoomBtn.addEventListener('click', () => setZoom(!isZoomed, 0.5, 0.5));
  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  stage.addEventListener(
    'touchstart',
    (e) => {
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchDidDrag = false;
      dragStartNormX = panNormX;
      dragStartNormY = panNormY;
    },
    { passive: true }
  );

  stage.addEventListener(
    'touchmove',
    (e) => {
      if (!isZoomed || !e.touches.length) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      if (Math.hypot(dx, dy) > 6) touchDidDrag = true;

      // Natural 1:1 touch drag: dragging finger right/down pulls the photo right/down
      const { overflowX, overflowY } = getZoomMetrics();
      const nextNx = overflowX > 0 ? dragStartNormX - dx / (2 * overflowX) : 0.5;
      const nextNy = overflowY > 0 ? dragStartNormY - dy / (2 * overflowY) : 0.5;
      applyZoomTransform(nextNx, nextNy, false);
    },
    { passive: false }
  );

  stage.addEventListener(
    'touchend',
    (e) => {
      if (isZoomed) {
        if (touchDidDrag) {
          setTimeout(() => {
            touchDidDrag = false;
          }, 50);
        }
        return;
      }
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (diff < -50) next();
      if (diff > 50) prev();
    },
    { passive: true }
  );

  document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  return {
    open,
    close,
    isOpen: () => !modal.classList.contains('hidden'),
  };
}
