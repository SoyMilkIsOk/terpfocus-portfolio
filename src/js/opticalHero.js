import { OPTICAL_PAIRS, getFullUrl, getFullWebpUrl } from '../data/galleryData.js';

export function initOpticalHero() {
  const root = document.getElementById('optical-hero-inspector');
  if (!root) return;

  const scene = root.querySelector('[data-cube-scene]');
  const track = root.querySelector('[data-cube-track]');
  const controls = root.querySelector('[data-cube-controls]');
  const progressBars = Array.from(root.querySelectorAll('[data-face-progress]'));
  const faces = Array.from(root.querySelectorAll('[data-cube-face]'));
  const prevBtn = root.querySelector('[data-cube-prev]');
  const nextBtn = root.querySelector('[data-cube-next]');

  if (!scene || !track || faces.length !== 4) return;

  let step = 0; // Increments smoothly for right-rotating 3D cube spin
  let isDragging = false;
  let isRotating = false;
  let splitPct = 50;
  let sweepPhase = 0;
  let resumeAutoSweepAt = 0;
  let countdownElapsed = 0;
  let lastTs = performance.now();
  let fadeTimeout = null;

  const SWEEP_CENTER = 50;
  const SWEEP_AMPLITUDE = 36; // Sweeps smoothly between 14% and 86%
  const SWEEP_SPEED = 0.00105; // Radians per ms (~6.0s full cycle)
  const SWEEP_RAMP_K = 2.4; // Higher = faster across center, slower dwell at each side
  const SWEEP_TANH_K = Math.tanh(SWEEP_RAMP_K);
  const CUBE_INTERVAL_MS = 6700; // Pause between rotations

  function setFacePair(faceEl, pair) {
    const wideWebp = faceEl.querySelector('[data-face-wide-webp]');
    const wideImg = faceEl.querySelector('[data-face-wide]');
    const closeWebp = faceEl.querySelector('[data-face-close-webp]');
    const closeImg = faceEl.querySelector('[data-face-close]');

    const wideSrc = getFullUrl(pair.wideSlug);
    const wideWebpSrc = getFullWebpUrl(pair.wideSlug);
    const closeSrc = getFullUrl(pair.closeSlug);
    const closeWebpSrc = getFullWebpUrl(pair.closeSlug);

    if (wideWebp && wideWebp.getAttribute('srcset') !== wideWebpSrc) {
      wideWebp.srcset = wideWebpSrc;
    }
    if (wideImg && wideImg.getAttribute('src') !== wideSrc) {
      wideImg.src = wideSrc;
    }
    if (closeWebp && closeWebp.getAttribute('srcset') !== closeWebpSrc) {
      closeWebp.srcset = closeWebpSrc;
    }
    if (closeImg && closeImg.getAttribute('src') !== closeSrc) {
      closeImg.src = closeSrc;
    }
  }

  function applySplitToFace(faceEl, pct) {
    const closeLayer = faceEl.querySelector('[data-face-close-layer]');
    const divider = faceEl.querySelector('[data-face-divider]');
    if (closeLayer) closeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    if (divider) divider.style.left = `${pct}%`;
  }

  function applySplitAll(pct) {
    splitPct = Math.max(4, Math.min(96, pct));
    faces.forEach((face) => applySplitToFace(face, splitPct));
  }

  function getPairForStep(s) {
    const len = OPTICAL_PAIRS.length;
    return OPTICAL_PAIRS[((s % len) + len) % len];
  }

  // Cube rotates right (positive rotateY) as step increases
  function getFaceIndex(s) {
    return (((-s) % 4) + 4) % 4;
  }

  function syncCubeTransform() {
    track.style.transform = `translateZ(calc(-1 * var(--cube-z))) rotateY(${step * 90}deg)`;
  }

  function prepareAdjacentFaces() {
    setFacePair(faces[getFaceIndex(step)], getPairForStep(step));
    setFacePair(faces[getFaceIndex(step + 1)], getPairForStep(step + 1));
    setFacePair(faces[getFaceIndex(step - 1)], getPairForStep(step - 1));
  }

  function setControlsVisible(visible) {
    if (!controls) return;
    controls.classList.toggle('opacity-0', !visible);
    controls.classList.toggle('pointer-events-none', !visible);
  }

  function setProgress(fraction) {
    const clamped = Math.max(0, Math.min(1, fraction));
    progressBars.forEach((bar) => {
      bar.style.transform = `scaleX(${clamped})`;
    });
  }

  function finishRotation() {
    clearTimeout(fadeTimeout);
    isRotating = false;
    countdownElapsed = 0;
    setProgress(0);
    setControlsVisible(true);
  }

  function rotateCube(delta) {
    clearTimeout(fadeTimeout);
    isRotating = true;
    countdownElapsed = 0;
    setProgress(0);
    setControlsVisible(false);
    step += delta;
    prepareAdjacentFaces();
    syncCubeTransform();
    fadeTimeout = setTimeout(finishRotation, 1150);
  }

  track.addEventListener('transitionend', (e) => {
    if (e.target === track && e.propertyName === 'transform') {
      finishRotation();
    }
  });

  // Keep 3D cube depth matched to viewport width
  function updateCubeDepth() {
    const w = scene.getBoundingClientRect().width;
    if (w > 0) {
      scene.style.setProperty('--cube-z', `${w / 2}px`);
    }
  }

  const resizeObserver = new ResizeObserver(updateCubeDepth);
  resizeObserver.observe(scene);
  updateCubeDepth();

  // Dragging on the active face controls the split slider
  function updateSliderFromPointer(clientX) {
    const rect = scene.getBoundingClientRect();
    if (!rect.width) return;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = (x / rect.width) * 100;
    applySplitAll(pct);

    // Sync phase so auto-sweep resumes cleanly from dragged position
    const norm = Math.max(-0.999, Math.min(0.999, (splitPct - SWEEP_CENTER) / SWEEP_AMPLITUDE));
    const sinVal = Math.max(-1, Math.min(1, Math.atanh(norm * SWEEP_TANH_K) / SWEEP_RAMP_K));
    sweepPhase = Math.asin(sinVal);
  }

  scene.addEventListener('pointerdown', (e) => {
    isDragging = true;
    countdownElapsed = 0;
    if (!isRotating) setProgress(0);
    scene.setPointerCapture?.(e.pointerId);
    updateSliderFromPointer(e.clientX);
  });

  scene.addEventListener('pointermove', (e) => {
    if (isDragging) {
      updateSliderFromPointer(e.clientX);
    }
  });

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    countdownElapsed = 0;
    if (!isRotating) setProgress(0);
    resumeAutoSweepAt = performance.now() + 900;
  }

  scene.addEventListener('pointerup', stopDrag);
  scene.addEventListener('pointercancel', stopDrag);

  // Main animation loop for slider sweep & left-to-right rotation progress bar
  function tick(now) {
    const dt = Math.min(50, now - lastTs);
    lastTs = now;

    if (!isDragging && now >= resumeAutoSweepAt) {
      sweepPhase += dt * SWEEP_SPEED;
      const shaped = Math.tanh(SWEEP_RAMP_K * Math.sin(sweepPhase)) / SWEEP_TANH_K;
      const pct = SWEEP_CENTER + shaped * SWEEP_AMPLITUDE;
      applySplitAll(pct);
    }

    const lightboxOpen = !document.getElementById('optical-lightbox')?.classList.contains('hidden');
    if (!isRotating && !isDragging && !lightboxOpen && !document.hidden) {
      countdownElapsed += dt;
      const progress = countdownElapsed / CUBE_INTERVAL_MS;
      setProgress(progress);
      if (countdownElapsed >= CUBE_INTERVAL_MS) {
        rotateCube(1);
      }
    }

    requestAnimationFrame(tick);
  }

  prevBtn?.addEventListener('click', () => rotateCube(-1));
  nextBtn?.addEventListener('click', () => rotateCube(1));

  // Initial setup
  prepareAdjacentFaces();
  syncCubeTransform();
  applySplitAll(SWEEP_CENTER);
  setProgress(0);
  requestAnimationFrame(tick);
}
