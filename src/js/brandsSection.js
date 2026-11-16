import {
  BRANDS,
  getThumbUrl,
  getThumbWebpUrl,
  renderPicture,
} from '../data/galleryData.js';

const CLOSE_SVG =
  '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

function createPhotoTile(item, idx, brandImages, lightbox, extraClass, aspectClass) {
  const wrap = document.createElement('div');
  wrap.className = `shoot-tile-enter ${extraClass}`;
  wrap.style.setProperty('--tile-delay', `${idx * 80}ms`);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open shoot photo');
  btn.className = `group relative block w-full ${aspectClass} overflow-hidden rounded-xl border border-white/[0.1] ${item.bg || 'bg-black'} shadow-[0_24px_48px_-20px_rgba(0,0,0,0.92)] transition-all duration-300 hover:border-[#00E082]/60 focus:outline-none focus:ring-2 focus:ring-[#00E082]/60 cursor-pointer`;

  btn.innerHTML = renderPicture({
    webp: getThumbWebpUrl(item.slug),
    fallback: getThumbUrl(item.slug),
    alt: 'Brand shoot photograph',
    imgClass:
      'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]',
    loading: 'eager',
  });

  btn.addEventListener('click', () => lightbox?.open(brandImages, idx));
  wrap.appendChild(btn);
  return wrap;
}

function buildArtisticLayout(brand, lightbox) {
  const imgs = brand.images;
  const container = document.createElement('div');

  if (brand.id === 'clonedepot' && imgs.length >= 3) {
    container.className = 'grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-7 items-center';

    const leftTile = createPhotoTile(
      imgs[0],
      0,
      imgs,
      lightbox,
      'md:col-span-7',
      'aspect-[5/4]'
    );

    const rightStack = document.createElement('div');
    rightStack.className = 'md:col-span-5 flex flex-col gap-5 md:gap-6';
    rightStack.appendChild(
      createPhotoTile(imgs[1], 1, imgs, lightbox, 'md:pl-2', 'aspect-[5/4]')
    );
    rightStack.appendChild(
      createPhotoTile(
        imgs[2],
        2,
        imgs,
        lightbox,
        'md:w-[88%] md:self-end md:-translate-x-2',
        'aspect-[4/3]'
      )
    );

    container.appendChild(leftTile);
    container.appendChild(rightStack);
    return container;
  }

  if (brand.id === 'inhouse' && imgs.length >= 2) {
    container.className = 'grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center py-2';
    container.appendChild(
      createPhotoTile(
        imgs[0],
        0,
        imgs,
        lightbox,
        'md:col-span-7 md:-translate-y-2',
        'aspect-[3/2]'
      )
    );
    container.appendChild(
      createPhotoTile(
        imgs[1],
        1,
        imgs,
        lightbox,
        'md:col-span-5 md:translate-y-3',
        'aspect-square'
      )
    );
    return container;
  }

  if (brand.id === 'spcy' && imgs.length >= 4) {
    container.className = 'grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-6 items-center';
    container.appendChild(
      createPhotoTile(
        imgs[0],
        0,
        imgs,
        lightbox,
        'col-span-2 md:col-span-7 md:-translate-y-2',
        'aspect-[3/2]'
      )
    );
    container.appendChild(
      createPhotoTile(
        imgs[1],
        1,
        imgs,
        lightbox,
        'col-span-1 md:col-span-5 md:translate-y-3',
        'aspect-square'
      )
    );
    container.appendChild(
      createPhotoTile(
        imgs[2],
        2,
        imgs,
        lightbox,
        'col-span-1 md:col-span-5 md:col-start-2 md:-translate-y-2',
        'aspect-square'
      )
    );
    container.appendChild(
      createPhotoTile(
        imgs[3],
        3,
        imgs,
        lightbox,
        'col-span-2 max-w-[260px] mx-auto w-full md:max-w-none md:col-span-5 md:translate-y-2',
        'aspect-square'
      )
    );
    return container;
  }

  container.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5';
  imgs.forEach((item, idx) => {
    container.appendChild(createPhotoTile(item, idx, imgs, lightbox, '', 'aspect-[4/3]'));
  });
  return container;
}

/**
 * Initialize freeform brand pinboard with cleanly animated artistic shoot reveal.
 */
export function initBrandsSection(lightbox) {
  const board = document.getElementById('brand-board');
  if (!board) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  let activeBrandId = null;

  // Separate outer shell for display:none toggling so responsive md:block never overrides hidden
  const constellationShell = document.createElement('div');
  constellationShell.className = 'w-full transition-all duration-200 ease-out';

  const constellation = document.createElement('div');
  constellation.setAttribute('data-pin-constellation', '');
  constellation.className =
    'relative min-h-[360px] md:h-[390px] w-full flex flex-col items-center justify-center gap-8 py-4 md:block';

  constellationShell.appendChild(constellation);

  // Shoot reveal stage layer
  const stage = document.createElement('div');
  stage.setAttribute('data-shoot-stage', '');
  stage.className = 'hidden w-full';

  board.appendChild(constellationShell);
  board.appendChild(stage);

  function showConstellation() {
    activeBrandId = null;
    stage.classList.add('hidden');
    stage.innerHTML = '';

    constellationShell.classList.remove('hidden');
    requestAnimationFrame(() => {
      constellationShell.classList.remove('opacity-0', 'scale-[0.98]', 'pointer-events-none');
    });
  }

  function renderStage(brandId) {
    const brand = BRANDS.find((b) => b.id === brandId) || BRANDS[0];
    if (!brand) return;
    activeBrandId = brand.id;

    stage.innerHTML = '';
    stage.classList.remove('hidden');

    const shell = document.createElement('div');
    shell.className = 'shoot-stage-enter space-y-6';

    const topBar = document.createElement('div');
    topBar.className = 'flex items-center justify-between gap-3 border-b border-white/[0.07] pb-4';

    const dockList = document.createElement('div');
    dockList.className = 'flex flex-wrap items-center gap-2.5';

    BRANDS.forEach((b) => {
      const isCurrent = b.id === brand.id;
      const dockPin = document.createElement('button');
      dockPin.type = 'button';
      dockPin.setAttribute('aria-label', `Switch to ${b.name}`);
      dockPin.setAttribute('aria-pressed', String(isCurrent));
      dockPin.style.backgroundColor = b.pinBg;
      dockPin.className = isCurrent
        ? 'relative inline-flex h-11 items-center justify-center rounded-full border border-[#00E082]/70 px-3.5 shadow-[0_0_20px_-6px_rgba(0,224,130,0.4)] transition cursor-pointer'
        : 'relative inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-3.5 opacity-55 hover:opacity-100 hover:border-white/30 transition cursor-pointer';

      dockPin.innerHTML = renderPicture({
        webp: b.logoWebp,
        fallback: b.logoFallback,
        alt: b.name,
        pictureClass: 'flex h-7 items-center justify-center',
        imgClass: 'max-h-7 w-auto max-w-[92px] object-contain',
        loading: 'eager',
      });

      dockPin.addEventListener('click', () => {
        if (b.id !== activeBrandId) renderStage(b.id);
      });

      dockList.appendChild(dockPin);
    });

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', 'Back to brand pins');
    backBtn.title = 'Back to pins';
    backBtn.className =
      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-zinc-300 hover:border-[#00E082] hover:text-[#00E082] transition cursor-pointer';
    backBtn.innerHTML = CLOSE_SVG;
    backBtn.addEventListener('click', showConstellation);

    topBar.appendChild(dockList);
    topBar.appendChild(backBtn);

    const layout = buildArtisticLayout(brand, lightbox);

    shell.appendChild(topBar);
    shell.appendChild(layout);
    stage.appendChild(shell);
  }

  function openBrandPin(brandId) {
    if (prefersReducedMotion) {
      constellationShell.classList.add('hidden');
      renderStage(brandId);
      return;
    }

    constellationShell.classList.add('opacity-0', 'scale-[0.98]', 'pointer-events-none');
    setTimeout(() => {
      constellationShell.classList.add('hidden');
      renderStage(brandId);
    }, 170);
  }

  const mobileOffsets = ['self-start ml-3 sm:ml-10', 'self-end mr-3 sm:mr-10', 'self-center'];

  BRANDS.forEach((brand, index) => {
    const posWrapper = document.createElement('div');
    posWrapper.className = `md:absolute ${brand.boardPos} ${mobileOffsets[index] || ''}`;

    const floatWrap = document.createElement('div');
    floatWrap.className = 'brand-float-wrap';
    floatWrap.style.setProperty('--float-delay', `${index * 1.1}s`);

    const pin = document.createElement('button');
    pin.type = 'button';
    pin.setAttribute('aria-label', `Explore ${brand.name} shoot`);
    pin.style.backgroundColor = brand.pinBg;
    pin.className = `brand-pin group relative flex items-center justify-center ${brand.pinShape} cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00E082]/70`;

    pin.innerHTML = `
      <span
        aria-hidden="true"
        class="pointer-events-none absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full border-2 border-[#07090D] bg-[#00E082] shadow-[0_0_12px_rgba(0,224,130,0.65)] transition-transform duration-200 group-hover:scale-125"
      ></span>
      <span class="brand-logo-depth flex h-full w-full items-center justify-center">
        ${renderPicture({
          webp: brand.logoWebp,
          fallback: brand.logoFallback,
          alt: brand.name,
          pictureClass: 'flex h-full w-full items-center justify-center',
          imgClass: brand.pinImgClass,
          loading: 'eager',
        })}
      </span>
    `;

    if (hasFinePointer && !prefersReducedMotion) {
      pin.addEventListener('mousemove', (e) => {
        const rect = pin.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = (x * 10).toFixed(2);
        const rotateX = (-y * 10).toFixed(2);
        pin.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      });

      pin.addEventListener('mouseleave', () => {
        pin.style.transform = '';
      });
    }

    pin.addEventListener('click', () => openBrandPin(brand.id));

    floatWrap.appendChild(pin);
    posWrapper.appendChild(floatWrap);
    constellation.appendChild(posWrapper);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!activeBrandId) return;
    if (lightbox?.isOpen?.()) return;
    showConstellation();
  });
}
