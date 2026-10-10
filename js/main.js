/**
 * Global Image Fallback & Self-Healing Engine
 * Automatically recovers any broken or failed image in real-time
 */
const GLOBAL_IMAGE_FALLBACKS = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80"
];

let fallbackCounter = 0;

window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    const img = e.target;
    if (!img.dataset.hasRecovered) {
      img.dataset.hasRecovered = "true";
      const fallbackUrl = GLOBAL_IMAGE_FALLBACKS[fallbackCounter % GLOBAL_IMAGE_FALLBACKS.length];
      fallbackCounter++;
      img.src = fallbackUrl;
    }
  }
}, true);

// Apply persisted theme as early as possible to minimise flash
applyTheme(getStoredTheme());

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNav();
  initGlobalSearch();
  initNewsletterForms();
  initAmbientSound();
  updateFavoritesCounter();
  initThemeToggles();
});

/* -------------------------------------------------------------------------
   0. Theme (Dark Mode) Controller
   ------------------------------------------------------------------------- */
const THEME_MOON_SVG = `<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const THEME_SUN_SVG = `<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

function getStoredTheme() {
  try {
    const stored = localStorage.getItem('hb_theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (e) { /* storage blocked */ }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  if (typeof window.__hbMapSetTiles === 'function') {
    window.__hbMapSetTiles(theme);
  }
}

window.toggleTheme = function () {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  try { localStorage.setItem('hb_theme', next); } catch (e) { /* ignore */ }
  applyTheme(next);
  if (typeof window.showToast === 'function') {
    window.showToast(next === 'dark' ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️');
  }
};

function initThemeToggles() {
  // Desktop / sub-page navbar button
  const actions = document.querySelector('.nav-actions');
  if (actions && !actions.querySelector('.theme-toggle-btn')) {
    const btn = document.createElement('button');
    btn.className = 'nav-action-btn theme-toggle-btn';
    btn.setAttribute('data-action', 'toggle-theme');
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle dark mode');
    btn.innerHTML = THEME_MOON_SVG + THEME_SUN_SVG;
    btn.addEventListener('click', window.toggleTheme);

    const mobileToggle = actions.querySelector('.mobile-toggle');
    if (mobileToggle) actions.insertBefore(btn, mobileToggle);
    else actions.appendChild(btn);
  }

  // Mobile drawer button
  const drawer = document.querySelector('.mobile-drawer');
  const mobileMenu = drawer ? drawer.querySelector('.mobile-menu') : null;
  if (mobileMenu && !mobileMenu.querySelector('.mobile-theme-toggle')) {
    const mBtn = document.createElement('button');
    mBtn.className = 'mobile-theme-toggle';
    mBtn.setAttribute('aria-label', 'Toggle dark mode');
    mBtn.innerHTML = THEME_MOON_SVG + THEME_SUN_SVG + '<span>Appearance</span>';
    mBtn.addEventListener('click', window.toggleTheme);
    mobileMenu.appendChild(mBtn);
  }
}

/* -------------------------------------------------------------------------
   1. Navbar Scroll Effect
   ------------------------------------------------------------------------- */
function initNavbarScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* -------------------------------------------------------------------------
   2. Mobile Drawer Navigation
   ------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.mobile-drawer-close');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  // Close when clicking nav link inside mobile drawer
  drawer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* -------------------------------------------------------------------------
   3. Global Search Modal (Ctrl/Cmd + K or Click)
   ------------------------------------------------------------------------- */
function initGlobalSearch() {
  const searchTriggers = document.querySelectorAll('[data-action="open-search"]');
  const searchModal = document.getElementById('searchModal');
  if (!searchModal) return;

  const searchInput = searchModal.querySelector('.search-modal-input');
  const closeBtn = searchModal.querySelector('.search-close-btn');
  const resultsContainer = searchModal.querySelector('.search-results-list');

  const openSearch = () => {
    searchModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (searchInput) {
      searchInput.value = '';
      setTimeout(() => searchInput.focus(), 100);
      renderSearchResults('', resultsContainer);
    }
  };

  const closeSearch = () => {
    searchModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  searchTriggers.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  }));

  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Keyboard shortcut Ctrl/Cmd + K & Esc
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchModal.classList.contains('active')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  // Close on outside backdrop click
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  // Search input live filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.trim().toLowerCase(), resultsContainer);
    });
  }
}

function renderSearchResults(query, container) {
  if (!container || !window.HB_DATA) return;

  if (!query) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: var(--color-text-subtle);">
        <p style="font-size: 0.9rem;">Type to search destinations, photo essays, and travel stories...</p>
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
          <span class="badge badge-forest" style="cursor: pointer;" onclick="searchTag('Sajek')">Sajek</span>
          <span class="badge badge-forest" style="cursor: pointer;" onclick="searchTag('Haor')">Tanguar Haor</span>
          <span class="badge badge-forest" style="cursor: pointer;" onclick="searchTag('Sundarbans')">Sundarbans</span>
          <span class="badge badge-forest" style="cursor: pointer;" onclick="searchTag('Sonargaon')">Sonargaon</span>
        </div>
      </div>
    `;
    return;
  }

  const results = [];

  // Match destinations
  window.HB_DATA.destinations.forEach(dest => {
    if (
      dest.name.toLowerCase().includes(query) ||
      dest.region.toLowerCase().includes(query) ||
      dest.district.toLowerCase().includes(query) ||
      dest.shortDescription.toLowerCase().includes(query)
    ) {
      results.push({
        type: 'Destination',
        title: dest.name,
        subtitle: `${dest.district}, ${dest.region}`,
        url: `destination-detail.html?id=${dest.id}`,
        image: dest.coverImage
      });
    }
  });

  // Match stories
  window.HB_DATA.stories.forEach(story => {
    if (
      story.title.toLowerCase().includes(query) ||
      story.subtitle.toLowerCase().includes(query) ||
      story.category.toLowerCase().includes(query)
    ) {
      results.push({
        type: 'Story',
        title: story.title,
        subtitle: `${story.category} • by ${story.author.name}`,
        url: `story-detail.html?id=${story.id}`,
        image: story.coverImage
      });
    }
  });

  // Match photos
  window.HB_DATA.photos.forEach(photo => {
    if (
      photo.title.toLowerCase().includes(query) ||
      photo.location.toLowerCase().includes(query) ||
      photo.category.toLowerCase().includes(query)
    ) {
      results.push({
        type: 'Photography',
        title: photo.title,
        subtitle: `${photo.location} • ${photo.photographer}`,
        url: `photography.html?photo=${photo.id}`,
        image: photo.url
      });
    }
  });

  if (results.length === 0) {
    container.innerHTML = `
      <div style="padding: 2.5rem; text-align: center; color: var(--color-text-subtle);">
        <p style="font-size: 1rem; color: var(--color-forest-deep); margin-bottom: 0.5rem;">No results found for "${query}"</p>
        <p style="font-size: 0.85rem;">Try searching for "Sundarbans", "Bandarban", "Tea", or "Monsoon".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(item => `
    <a href="${item.url}" class="search-result-item">
      <img src="${item.image}" alt="${item.title}" class="search-result-thumb">
      <div class="search-result-info">
        <div style="font-size: 0.72rem; color: var(--color-gold); font-weight: 600; text-transform: uppercase;">${item.type}</div>
        <h4 style="margin: 0; font-size: 0.98rem; color: var(--color-forest-deep);">${item.title}</h4>
        <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-muted);">${item.subtitle}</p>
      </div>
    </a>
  `).join('');
}

window.searchTag = function(tag) {
  const searchInput = document.querySelector('.search-modal-input');
  if (searchInput) {
    searchInput.value = tag;
    searchInput.dispatchEvent(new Event('input'));
  }
};

/* -------------------------------------------------------------------------
   4. Favorites Drawer & Badges
   ------------------------------------------------------------------------- */
function updateFavoritesCounter() {
  const favs = getFavorites();
  const badges = document.querySelectorAll('.fav-counter-badge');
  badges.forEach(badge => {
    badge.textContent = favs.length;
    badge.style.display = favs.length > 0 ? 'flex' : 'none';
  });
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('hb_favorites') || '[]');
  } catch (e) {
    return [];
  }
}

function toggleFavorite(id, type, title, image, meta) {
  let favs = getFavorites();
  const existingIdx = favs.findIndex(f => f.id === id);

  if (existingIdx > -1) {
    favs.splice(existingIdx, 1);
    showToast(`Removed "${title}" from your saved places`);
  } else {
    favs.push({ id, type, title, image, meta, addedAt: new Date().toISOString() });
    showToast(`Saved "${title}" to your Travel Wishlist! ✨`);
  }

  localStorage.setItem('hb_favorites', JSON.stringify(favs));
  updateFavoritesCounter();
  renderFavoritesDrawer();

  // Sync heart buttons on page
  document.querySelectorAll(`[data-fav-id="${id}"]`).forEach(btn => {
    btn.classList.toggle('favorited', existingIdx === -1);
  });
}

function renderFavoritesDrawer() {
  const drawerList = document.querySelector('.favorites-list');
  if (!drawerList) return;

  const favs = getFavorites();
  if (favs.length === 0) {
    drawerList.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-subtle);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.6;">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        <p style="font-size: 1.05rem; font-weight: 600; color: var(--color-forest-deep); margin-bottom: 0.35rem;">Your Wishlist is Empty</p>
        <p style="font-size: 0.85rem;">Click the bookmark heart on any destination or story to save it for your journey.</p>
      </div>
    `;
    return;
  }

  drawerList.innerHTML = favs.map(item => `
    <div class="fav-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="fav-item-details">
        <a href="${item.type === 'destination' ? 'destination-detail.html?id=' + item.id : 'story-detail.html?id=' + item.id}" style="text-decoration: none;">
          <div style="font-size: 0.7rem; color: var(--color-gold); text-transform: uppercase; font-weight: 600;">${item.type}</div>
          <div class="fav-item-title">${item.title}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-subtle);">${item.meta || ''}</div>
        </a>
        <button class="fav-remove-btn" onclick="removeFavoriteItem('${item.id}', '${item.title.replace(/'/g, "\\'")}')">Remove</button>
      </div>
    </div>
  `).join('');
}

window.removeFavoriteItem = function(id, title) {
  toggleFavorite(id, '', title, '', '');
};

// Wire drawer toggle
const favTriggers = document.querySelectorAll('[data-action="open-favorites"]');
const favDrawer = document.getElementById('favoritesDrawer');
const favOverlay = document.getElementById('favoritesOverlay');
const favClose = document.querySelector('.favorites-close-btn');

if (favDrawer && favOverlay) {
  const openFavs = () => {
    renderFavoritesDrawer();
    favDrawer.classList.add('active');
    favOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  const closeFavs = () => {
    favDrawer.classList.remove('active');
    favOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  favTriggers.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openFavs();
  }));
  if (favClose) favClose.addEventListener('click', closeFavs);
  favOverlay.addEventListener('click', closeFavs);
}

// Global expose
window.toggleFavorite = toggleFavorite;
window.getFavorites = getFavorites;
window.updateFavoritesCounter = updateFavoritesCounter;

/* -------------------------------------------------------------------------
   5. Toast Notification System
   ------------------------------------------------------------------------- */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

/* -------------------------------------------------------------------------
   6. Newsletter Subscription Forms
   ------------------------------------------------------------------------- */
function initNewsletterForms() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Thank you! ${input.value} is subscribed to Hidden Bengal Dispatches.`);
        input.value = '';
      }
    });
  });
}

/* -------------------------------------------------------------------------
   7. Ambient Soundscape (Web Audio API Synthesized River & Breeze)
   ------------------------------------------------------------------------- */
let audioCtx = null;
let isSoundPlaying = false;
let noiseNode = null;
let filterNode = null;
let gainNode = null;

function initAmbientSound() {
  const soundBtns = document.querySelectorAll('[data-action="toggle-sound"]');

  function updateSoundUI(playing) {
    soundBtns.forEach(btn => {
      const isHeroBtn = btn.classList.contains('btn-ambient-hero');
      if (playing) {
        if (isHeroBtn) {
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <span>Pause Soundscape</span>
          `;
          btn.style.borderColor = 'var(--color-gold)';
          btn.style.color = 'var(--color-gold)';
        } else {
          btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          `;
        }
        btn.setAttribute('title', 'Pause river soundscape');
      } else {
        if (isHeroBtn) {
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
            <span>Listen to Soundscape</span>
          `;
          btn.style.borderColor = '';
          btn.style.color = '';
        } else {
          btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          `;
        }
        btn.setAttribute('title', 'Listen to atmospheric river soundscape');
      }
    });
  }

  soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isSoundPlaying) {
        startAtmosphericAudio();
        updateSoundUI(true);
        showToast('Playing atmospheric river & rain soundscape 🌊');
      } else {
        stopAtmosphericAudio();
        updateSoundUI(false);
        showToast('Soundscape paused');
      }
    });
  });
}

function startAtmosphericAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Generate gentle pink noise buffer for river/rainfall ambience
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(450, audioCtx.currentTime);

    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 1.5);

    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
    isSoundPlaying = true;
  } catch (e) {
    console.warn('Web Audio not supported or blocked:', e);
  }
}

function stopAtmosphericAudio() {
  if (gainNode && audioCtx) {
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
      }
      isSoundPlaying = false;
    }, 550);
  } else {
    isSoundPlaying = false;
  }
}
