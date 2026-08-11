// Canvas Engine & Preloader Configuration
const TOTAL_FRAMES = 240;
const FRAME_PATH = (index) => `/frames/frame_${String(index).padStart(6, '0')}.webp`;

const state = {
  images: [],
  loadedCount: 0,
  currentFrame: 0,
  targetFrame: 0,
  isLoaded: false,
  fitMode: 'cover',
};

// DOM Elements
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const preloader = document.getElementById('preloader');
const progressFill = document.getElementById('loader-progress-fill');
const loaderPercent = document.getElementById('loader-percent');
const loaderFrameCount = document.getElementById('loader-frame-count');
const scrollProgressLine = document.getElementById('scroll-progress-line');

// Controls & Menu
const btnFitMode = document.getElementById('btn-fit-mode');
const lblFitMode = document.getElementById('lbl-fit-mode');
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');

// Modal Elements
const modal = document.getElementById('project-modal');
const modalClose = document.getElementById('modal-close');
const btnViewSofaloom = document.getElementById('btn-view-sofaloom');
const btnOpenModalCard = document.getElementById('btn-open-modal-card');

/**
 * Preload 240 WebP Canvas Background Frames
 */
function preloadFrames() {
  return new Promise((resolve) => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);

      img.onload = () => {
        state.loadedCount++;
        updateLoaderProgress();
        if (state.loadedCount === TOTAL_FRAMES) {
          state.isLoaded = true;
          resolve();
        }
      };

      img.onerror = () => {
        setTimeout(() => { img.src = FRAME_PATH(i); }, 400);
      };

      state.images[i] = img;
    }
  });
}

function updateLoaderProgress() {
  const percent = Math.round((state.loadedCount / TOTAL_FRAMES) * 100);
  progressFill.style.width = `${percent}%`;
  loaderPercent.textContent = `${percent}%`;
  loaderFrameCount.textContent = `${state.loadedCount} / ${TOTAL_FRAMES} Frames`;
}

/**
 * Handle Window Resize & Canvas High-DPI Scaling
 */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.scale(dpr, dpr);

  if (state.isLoaded) {
    drawFrame(Math.round(state.currentFrame));
  }
}

/**
 * Draw background frame onto canvas
 */
function drawFrame(frameIndex) {
  const img = state.images[frameIndex];
  if (!img || !img.complete) return;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const imgWidth = img.naturalWidth || 1280;
  const imgHeight = img.naturalHeight || 720;

  const imgAspect = imgWidth / imgHeight;
  const viewportAspect = viewportWidth / viewportHeight;

  let drawWidth, drawHeight;

  if (state.fitMode === 'cover') {
    if (viewportAspect > imgAspect) {
      drawWidth = viewportWidth;
      drawHeight = viewportWidth / imgAspect;
    } else {
      drawHeight = viewportHeight;
      drawWidth = viewportHeight * imgAspect;
    }
  } else {
    if (viewportAspect < imgAspect) {
      drawWidth = viewportWidth;
      drawHeight = viewportWidth / imgAspect;
    } else {
      drawHeight = viewportHeight;
      drawWidth = viewportHeight * imgAspect;
    }
  }

  const offsetX = (viewportWidth - drawWidth) / 2;
  const offsetY = (viewportHeight - drawHeight) / 2;

  if (state.fitMode === 'contain') {
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

/**
 * Calculate target frame based on page scroll
 */
function updateScrollPosition() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;

  const scrollY = Math.max(0, window.scrollY);
  const scrollFraction = Math.min(1, Math.max(0, scrollY / maxScroll));

  scrollProgressLine.style.width = `${scrollFraction * 100}%`;

  state.targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

  updateActiveNavLink();
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;

  sections.forEach((section) => {
    const top = section.offsetTop - 200;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);

    if (scrollY >= top && scrollY < top + height) {
      document.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
      if (link) link.classList.add('active');
    }
  });
}

/**
 * Main Animation Loop (RAF) with Smooth Lerp Easing
 */
function renderLoop() {
  if (state.isLoaded) {
    // Smooth Lerp Interpolation
    const lerpFactor = 0.08;
    const delta = state.targetFrame - state.currentFrame;

    if (Math.abs(delta) > 0.001) {
      state.currentFrame += delta * lerpFactor;
    } else {
      state.currentFrame = state.targetFrame;
    }

    const activeIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(state.currentFrame))
    );
    drawFrame(activeIndex);
  }

  requestAnimationFrame(renderLoop);
}

/**
 * Modal Open & Close Handlers
 */
function initModal() {
  if (btnViewSofaloom) {
    btnViewSofaloom.addEventListener('click', openModal);
  }
  if (btnOpenModalCard) {
    btnOpenModalCard.addEventListener('click', openModal);
  }
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function openModal() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}


/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
  }
}

/**
 * Initialize Event Listeners
 */
function initEvents() {
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', updateScrollPosition, { passive: true });

  // Fit Mode Toggle
  if (btnFitMode) {
    btnFitMode.addEventListener('click', () => {
      state.fitMode = state.fitMode === 'cover' ? 'contain' : 'cover';
      lblFitMode.textContent = state.fitMode === 'cover' ? 'Cover' : 'Contain';
      drawFrame(Math.round(state.currentFrame));
    });
  }
}

/**
 * App Initialization Sequence
 */
async function init() {
  resizeCanvas();
  initEvents();
  initModal();
  initMobileMenu();

  await preloadFrames();

  preloader.classList.add('fade-out');

  updateScrollPosition();
  state.currentFrame = state.targetFrame;
  drawFrame(Math.round(state.currentFrame));

  requestAnimationFrame(renderLoop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
