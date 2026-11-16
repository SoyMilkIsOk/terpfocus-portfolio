import '../styles/main.css';
import {
  GALLERY_ITEMS,
  getBrandById,
  getThumbUrl,
  getThumbWebpUrl,
  renderPicture,
} from '../data/galleryData.js';
import { createLightbox } from './lightbox.js';
import { initNav } from './nav.js';

function shuffleItems(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const lightbox = createLightbox();

  const grid = document.getElementById('archive-grid');
  const countEl = document.getElementById('archive-count');
  if (!grid) return;

  const randomizedCatalog = shuffleItems(GALLERY_ITEMS).map((item, idx) => {
    const cropPool = item.crops?.length ? item.crops : ['aspect-[4/3]'];
    const picked =
      idx > 0 && cropPool.length > 1
        ? cropPool[(Math.floor(Math.random() * cropPool.length) + idx) % cropPool.length]
        : cropPool[Math.floor(Math.random() * cropPool.length)];
    return {
      ...item,
      cropClass: picked,
    };
  });

  if (countEl) {
    countEl.textContent = `${randomizedCatalog.length} photos`;
  }

  grid.innerHTML = '';

  randomizedCatalog.forEach((item, idx) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.setAttribute('aria-label', 'Open photo in lightbox');
    card.className =
      'break-inside-avoid mb-5 block group relative w-full overflow-hidden rounded-lg border border-[#1B2029] bg-[#0B0D11] text-left transition-colors duration-200 hover:border-[#00E082]/60 focus:outline-none focus:ring-2 focus:ring-[#00E082]/60 cursor-pointer';

    const bgClass = item.bg || 'bg-black';
    const brandName = getBrandById(item.brandId)?.name;
    const imgAlt = brandName
      ? `TerpFocus cannabis photography for ${brandName}`
      : 'TerpFocus cannabis studio and macro photography';

    card.innerHTML = `
      <div class="relative w-full ${item.cropClass} overflow-hidden ${bgClass}">
        ${renderPicture({
          webp: getThumbWebpUrl(item.slug),
          fallback: getThumbUrl(item.slug),
          alt: imgAlt,
          imgClass:
            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]',
          loading: idx < 4 ? 'eager' : 'lazy',
          fetchPriority: idx < 2 ? 'high' : '',
        })}
      </div>
    `;

    card.addEventListener('click', () => lightbox.open(randomizedCatalog, idx));
    grid.appendChild(card);
  });
});
