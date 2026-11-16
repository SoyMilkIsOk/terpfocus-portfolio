import '../styles/main.css';
import { createLightbox } from './lightbox.js';
import { initOpticalHero } from './opticalHero.js';
import { initBrandsSection } from './brandsSection.js';
import { initInquiryForm } from './inquiryForm.js';
import { initNav } from './nav.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  const lightbox = createLightbox();
  initOpticalHero(lightbox);
  initBrandsSection(lightbox);
  initInquiryForm();
});
