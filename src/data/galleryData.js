export const getThumbUrl = (slug) => `/media/thumbs/${slug}.jpg`;
export const getThumbWebpUrl = (slug) => `/media/thumbs/${slug}.webp`;
export const getFullUrl = (slug) => `/media/full/${slug}.jpg`;
export const getFullWebpUrl = (slug) => `/media/full/${slug}.webp`;

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render a responsive <picture> element with WebP primary source and JPEG/PNG fallback.
 */
export function renderPicture({
  webp,
  fallback,
  alt = '',
  imgClass = '',
  pictureClass = 'block h-full w-full',
  loading = 'lazy',
  fetchPriority = '',
  draggable = true,
}) {
  const priorityAttr = fetchPriority ? ` fetchpriority="${escapeAttr(fetchPriority)}"` : '';
  const dragAttr = draggable ? '' : ' draggable="false"';
  return `<picture class="${escapeAttr(pictureClass)}"><source srcset="${escapeAttr(webp)}" type="image/webp" /><img src="${escapeAttr(fallback)}" alt="${escapeAttr(alt)}" class="${escapeAttr(imgClass)}" loading="${escapeAttr(loading)}" decoding="async"${priorityAttr}${dragAttr} /></picture>`;
}

export const OPTICAL_PAIRS = [
  {
    id: 'dsxuog-4',
    wideSlug: 'dsxuog-4',
    closeSlug: 'dsxuog-4-closeup',
  },
  {
    id: 'dab-2',
    wideSlug: 'dab-2',
    closeSlug: 'dab-2-closeup',
  },
  {
    id: 'ltxpm-5-2',
    wideSlug: 'ltxpm-5-2',
    closeSlug: 'ltxpm-5-2-closeup',
  },
];

export const BRANDS = [
  {
    id: 'clonedepot',
    name: 'The Clone Depot',
    logoWebp: '/media/brands/clonedepot.webp',
    logoFallback: '/media/brands/clonedepot.jpg',
    pinBg: '#0d0d0d',
    pinShape: 'rounded-full h-36 w-36 sm:h-44 sm:w-44 p-3',
    pinImgClass: 'h-full w-full object-contain rounded-full',
    boardPos: 'md:top-[12%] md:left-[10%] md:-rotate-2',
    images: [
      { slug: 'clonedepot1', brandId: 'clonedepot', bg: 'bg-black' },
      { slug: 'clonedepot2', brandId: 'clonedepot', bg: 'bg-black' },
      { slug: 'clonedepot3', brandId: 'clonedepot', bg: 'bg-black' },
    ],
  },
  {
    id: 'inhouse',
    name: 'In-House',
    logoWebp: '/media/brands/inhouse.webp',
    logoFallback: '/media/brands/inhouse.png',
    pinBg: '#090C11',
    pinShape: 'rounded-[2rem] h-32 w-40 sm:h-40 sm:w-48 p-5',
    pinImgClass: 'max-h-full max-w-full object-contain',
    boardPos: 'md:top-[14%] md:right-[11%] md:rotate-2',
    images: [
      { slug: 'inhouse1', brandId: 'inhouse', bg: 'bg-black' },
      { slug: 'inhouse2', brandId: 'inhouse', bg: 'bg-black' },
    ],
  },
  {
    id: 'spcy',
    name: 'SPCY Canna',
    logoWebp: '/media/brands/spcy.webp',
    logoFallback: '/media/brands/spcy.jpg',
    pinBg: '#000000',
    pinShape: 'rounded-full h-28 w-52 sm:h-32 sm:w-64 px-7 py-4',
    pinImgClass: 'max-h-full max-w-full object-contain',
    boardPos: 'md:bottom-[10%] md:left-1/2 md:-translate-x-1/2 md:-rotate-1',
    images: [
      { slug: 'spcy1', brandId: 'spcy', bg: 'bg-white' },
      { slug: 'spcy2', brandId: 'spcy', bg: 'bg-white' },
      { slug: 'spcy3', brandId: 'spcy', bg: 'bg-white' },
      { slug: 'spcy4', brandId: 'spcy', bg: 'bg-white' },
    ],
  },
];

export function getBrandById(brandId) {
  if (!brandId) return null;
  return BRANDS.find((b) => b.id === brandId) || null;
}

// Unique, non-repeating full gallery items (shuffled in galleryPage.js with varied crops)
export const GALLERY_ITEMS = [
  {
    slug: 'clonedepot1',
    brandId: 'clonedepot',
    crops: ['aspect-[5/4]', 'aspect-square', 'aspect-[4/5]'],
  },
  {
    slug: 'clonedepot2',
    brandId: 'clonedepot',
    crops: ['aspect-[5/4]', 'aspect-square', 'aspect-[4/5]'],
  },
  {
    slug: 'clonedepot3',
    brandId: 'clonedepot',
    crops: ['aspect-[5/4]', 'aspect-square', 'aspect-[4/5]'],
  },
  {
    slug: 'inhouse1',
    brandId: 'inhouse',
    crops: ['aspect-[3/2]', 'aspect-[5/4]', 'aspect-[4/3]'],
  },
  {
    slug: 'inhouse2',
    brandId: 'inhouse',
    crops: ['aspect-square', 'aspect-[5/4]', 'aspect-[4/5]'],
  },
  {
    slug: 'spcy1',
    brandId: 'spcy',
    bg: 'bg-white',
    crops: ['aspect-[3/2]', 'aspect-[4/3]'],
  },
  {
    slug: 'spcy2',
    brandId: 'spcy',
    bg: 'bg-white',
    crops: ['aspect-square'],
  },
  {
    slug: 'spcy3',
    brandId: 'spcy',
    bg: 'bg-white',
    crops: ['aspect-square'],
  },
  {
    slug: 'spcy4',
    brandId: 'spcy',
    bg: 'bg-white',
    crops: ['aspect-square'],
  },
  {
    slug: 'pbg-nug1',
    brandId: null,
    crops: ['aspect-[4/5]', 'aspect-square', 'aspect-[3/2]'],
  },
  {
    slug: 'dsxuog-5',
    brandId: null,
    crops: ['aspect-[4/5]', 'aspect-square', 'aspect-[3/2]'],
  },
  {
    slug: 'dab-10',
    brandId: 'clonedepot',
    crops: ['aspect-[3/2]', 'aspect-[5/4]', 'aspect-square'],
  },
  {
    slug: 'ltxpm-5-2',
    brandId: null,
    crops: ['aspect-[4/5]', 'aspect-square', 'aspect-[3/2]'],
  },
];
