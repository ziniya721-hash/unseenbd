/**
 * Hidden Bangladesh - Photography Gallery Controller
 * Masonry Layout, Category Filters & Fullscreen Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.HB_DATA || !window.HB_DATA.photos) return;
  initPhotographyGallery();
});

let currentPhotoList = [];
let currentLightboxIdx = 0;

function initPhotographyGallery() {
  const gridContainer = document.getElementById('photoMasonryGrid');
  const filterPills = document.querySelectorAll('[data-photo-category]');
  const lightbox = document.getElementById('lightboxModal');

  let activeCategory = 'all';

  function filterAndRender() {
    let items = [...window.HB_DATA.photos];
    if (activeCategory !== 'all') {
      items = items.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }
    currentPhotoList = items;
    renderPhotos(items, gridContainer);
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.getAttribute('data-photo-category');
      filterAndRender();
    });
  });

  // Check URL query param e.g. ?photo=p3
  const urlParams = new URLSearchParams(window.location.search);
  const photoParam = urlParams.get('photo');

  filterAndRender();

  if (photoParam) {
    const idx = currentPhotoList.findIndex(p => p.id === photoParam);
    if (idx > -1) {
      openLightbox(idx);
    }
  }

  initLightboxControls(lightbox);
}

function renderPhotos(photos, container) {
  if (!container) return;

  if (photos.length === 0) {
    container.innerHTML = `
      <div style="column-span: all; text-align: center; padding: 4rem 1rem;">
        <h3>No photographs in this collection yet</h3>
        <p style="color: var(--color-text-muted);">Please select another category or view all.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = photos.map((photo, index) => `
    <div class="masonry-item" onclick="openLightbox(${index})">
      <img src="${photo.url}" alt="${photo.title} by ${photo.photographer}" loading="lazy">
      <div class="photo-overlay">
        <span class="badge badge-white" style="align-self: flex-start; margin-bottom: 0.5rem; font-size: 0.7rem;">${photo.category}</span>
        <h3 class="photo-title">${photo.title}</h3>
        <div class="photo-credits">
          <span>${photo.location}</span>
          <span style="color: var(--color-gold); font-weight: 600;">© ${photo.photographer}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function initLightboxControls(lightbox) {
  if (!lightbox) return;

  const closeBtn = lightbox.querySelector('.lightbox-close-btn');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  const close = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  const prev = () => {
    if (currentPhotoList.length === 0) return;
    currentLightboxIdx = (currentLightboxIdx - 1 + currentPhotoList.length) % currentPhotoList.length;
    updateLightboxContent();
  };

  const next = () => {
    if (currentPhotoList.length === 0) return;
    currentLightboxIdx = (currentLightboxIdx + 1) % currentPhotoList.length;
    updateLightboxContent();
  };

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Close when clicking outside content wrap
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightboxModal');
  if (!lightbox || !currentPhotoList[index]) return;

  currentLightboxIdx = index;
  updateLightboxContent();

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
window.openLightbox = openLightbox;

function updateLightboxContent() {
  const lightbox = document.getElementById('lightboxModal');
  if (!lightbox) return;

  const photo = currentPhotoList[currentLightboxIdx];
  if (!photo) return;

  const img = lightbox.querySelector('.lightbox-image-wrap img');
  const title = lightbox.querySelector('.lightbox-info h3');
  const caption = lightbox.querySelector('.lightbox-info p');
  const techSpecs = lightbox.querySelector('.lightbox-tech-specs');

  if (img) img.src = photo.url;
  if (title) title.textContent = photo.title;
  if (caption) caption.textContent = `${photo.caption} • ${photo.location}`;
  if (techSpecs) {
    techSpecs.innerHTML = `
      <div>© ${photo.photographer}</div>
      <div style="font-size: 0.75rem; opacity: 0.85; margin-top: 0.2rem;">${photo.camera}</div>
    `;
  }
}
