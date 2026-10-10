/**
 * Hidden Bangladesh - Destination Detail Page Controller
 * Dynamic loading based on query parameter `?id=...`
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.HB_DATA || !window.HB_DATA.destinations) return;
  loadDestinationDetail();
});

function loadDestinationDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  let destId = urlParams.get('id');

  // Fallback to first destination if not specified or not found
  let dest = window.HB_DATA.destinations.find(d => d.id === destId);
  if (!dest) {
    dest = window.HB_DATA.destinations[0]; // Sajek Valley
    destId = dest.id;
  }

  // Update page title
  document.title = `${dest.name} (${dest.bengaliName}) — Hidden Bangladesh`;

  // Render Breadcrumb
  const breadcrumbName = document.getElementById('destBreadcrumbName');
  if (breadcrumbName) breadcrumbName.textContent = dest.name;

  // Render Hero
  renderHero(dest);

  // Render Action Toolbar
  renderToolbar(dest);

  // Render Quick Facts
  renderQuickFacts(dest);

  // Render Overview
  renderOverview(dest);

  // Render Itinerary
  renderItinerary(dest);

  // Render Highlights
  renderHighlights(dest);

  // Render Travel Tips & Responsible Tourism
  renderTravelTips(dest);

  // Render Photo Gallery
  renderGallery(dest);

  // Render Map & Location info
  renderMapSection(dest);

  // Render Related Destinations
  renderRelatedDestinations(dest);
}

function renderHero(dest) {
  const heroBg = document.getElementById('destHeroBg');
  const heroBadge = document.getElementById('destHeroBadge');
  const heroTitle = document.getElementById('destHeroTitle');
  const heroBengali = document.getElementById('destHeroBengali');
  const heroSubtitle = document.getElementById('destHeroSubtitle');
  const heroLocation = document.getElementById('destHeroLocation');

  if (heroBg) heroBg.src = dest.coverImage;
  if (heroBadge) heroBadge.textContent = dest.badge;
  if (heroTitle) heroTitle.textContent = dest.name;
  if (heroBengali) heroBengali.textContent = dest.bengaliName;
  if (heroSubtitle) heroSubtitle.textContent = dest.subtitle;
  if (heroLocation) heroLocation.textContent = `${dest.district}, ${dest.region}`;
}

function renderToolbar(dest) {
  const toolbarContainer = document.getElementById('destActionToolbar');
  if (!toolbarContainer) return;

  const savedIds = window.getFavorites ? window.getFavorites().map(f => f.id) : [];
  const isFavorited = savedIds.includes(dest.id);

  toolbarContainer.innerHTML = `
    <button
      class="btn ${isFavorited ? 'btn-gold' : 'btn-outline'}"
      id="detailFavBtn"
      onclick="toggleDetailFavorite('${dest.id}')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span>${isFavorited ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
    </button>
    <button class="btn btn-outline" onclick="shareCurrentDestination('${dest.name.replace(/'/g, "\\'")}')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      <span>Share Guide</span>
    </button>
    <a href="https://maps.google.com/?q=${dest.mapQuery}" target="_blank" rel="noopener" class="btn btn-outline">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
        <line x1="8" y1="2" x2="8" y2="18"></line>
        <line x1="16" y1="6" x2="16" y2="22"></line>
      </svg>
      <span>Google Maps</span>
    </a>
  `;
}

window.toggleDetailFavorite = function(id) {
  const dest = window.HB_DATA.destinations.find(d => d.id === id);
  if (!dest) return;
  window.toggleFavorite(dest.id, 'destination', dest.name, dest.coverImage, dest.region);
  renderToolbar(dest);
};

window.shareCurrentDestination = function(name) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      window.showToast(`Link to ${name} copied to clipboard! 📋`);
    });
  } else {
    window.showToast(`Share link: ${window.location.href}`);
  }
};

function renderQuickFacts(dest) {
  const container = document.getElementById('destQuickFacts');
  if (!container) return;

  const facts = [
    { label: "Region & Division", value: `${dest.district}, ${dest.region}`, icon: "map-pin" },
    { label: "Optimal Season", value: dest.bestSeason, icon: "sun" },
    { label: "Suggested Duration", value: dest.duration, icon: "clock" },
    { label: "Elevation / Setting", value: dest.altitude, icon: "compass" },
    { label: "Travel Style", value: dest.travelStyle, icon: "send" },
    { label: "Trail Difficulty", value: dest.difficulty, icon: "shield" }
  ];

  container.innerHTML = facts.map(fact => `
    <div style="background: var(--color-white); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--color-sand-border); display: flex; flex-direction: column;">
      <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-subtle); letter-spacing: 0.08em; font-weight: 600; margin-bottom: 0.35rem;">${fact.label}</span>
      <span style="font-size: 1.05rem; font-weight: 600; color: var(--color-forest-deep);">${fact.value}</span>
    </div>
  `).join('');
}

function renderOverview(dest) {
  const overviewEl = document.getElementById('destOverviewText');
  if (overviewEl) overviewEl.textContent = dest.overview;
}

function renderItinerary(dest) {
  const itineraryContainer = document.getElementById('destItineraryList');
  if (!itineraryContainer) return;

  itineraryContainer.innerHTML = dest.itinerary.map((item, idx) => `
    <div style="display: flex; gap: 1.5rem; position: relative; padding-bottom: 2rem;">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--color-forest); color: var(--color-white); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; z-index: 2; box-shadow: 0 4px 12px rgba(24,55,38,0.25);">
          0${idx + 1}
        </div>
        ${idx < dest.itinerary.length - 1 ? '<div style="width: 2px; flex-grow: 1; background: var(--color-sand-border); margin-top: 0.5rem;"></div>' : ''}
      </div>
      <div style="flex-grow: 1; background: var(--color-white); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--color-sand-border); box-shadow: var(--shadow-subtle);">
        <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--color-gold); margin-bottom: 0.25rem;">${item.day}</div>
        <h4 style="font-size: 1.25rem; margin-bottom: 0.65rem; color: var(--color-forest-deep);">${item.title}</h4>
        <p style="color: var(--color-text-muted); font-size: 0.95rem; line-height: 1.65;">${item.description}</p>
      </div>
    </div>
  `).join('');
}

function renderHighlights(dest) {
  const highlightsContainer = document.getElementById('destHighlightsList');
  if (!highlightsContainer) return;

  highlightsContainer.innerHTML = dest.highlights.map(item => `
    <div style="display: flex; align-items: flex-start; gap: 0.85rem; padding: 1rem; background: var(--color-sand-light); border-radius: var(--radius-md); border: 1px solid var(--color-sand-border);">
      <div style="color: var(--color-gold); margin-top: 0.2rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
        </svg>
      </div>
      <p style="font-size: 0.95rem; color: var(--color-text-main); font-weight: 500;">${item}</p>
    </div>
  `).join('');
}

function renderTravelTips(dest) {
  const tipsContainer = document.getElementById('destTipsList');
  if (!tipsContainer) return;

  tipsContainer.innerHTML = dest.travelTips.map(tip => `
    <li style="margin-bottom: 1rem; display: flex; align-items: flex-start; gap: 0.75rem;">
      <span style="color: var(--color-forest); font-weight: bold;">✦</span>
      <span style="font-size: 0.95rem; color: var(--color-text-muted); line-height: 1.6;">${tip}</span>
    </li>
  `).join('');
}

function renderGallery(dest) {
  const galleryGrid = document.getElementById('destGalleryGrid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = dest.gallery.map((imgUrl, idx) => `
    <div style="border-radius: var(--radius-md); overflow: hidden; height: 260px; cursor: pointer; box-shadow: var(--shadow-subtle); position: relative;" onclick="openDetailImageModal('${imgUrl}', '${dest.name}')">
      <img src="${imgUrl}" alt="${dest.name} gallery image ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-normal);" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%);"></div>
    </div>
  `).join('');
}

window.openDetailImageModal = function(url, title) {
  const lightbox = document.getElementById('lightboxModal');
  if (!lightbox) return;
  const img = lightbox.querySelector('.lightbox-image-wrap img');
  const titleEl = lightbox.querySelector('.lightbox-info h3');
  const captionEl = lightbox.querySelector('.lightbox-info p');
  if (img) img.src = url;
  if (titleEl) titleEl.textContent = title;
  if (captionEl) captionEl.textContent = "High-resolution dispatch from Hidden Bangladesh archive";
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function renderMapSection(dest) {
  const coordEl = document.getElementById('destCoordinates');
  const mapLink = document.getElementById('destMapDirectLink');
  if (coordEl) coordEl.textContent = dest.coordinates;
  if (mapLink) mapLink.href = `https://maps.google.com/?q=${dest.mapQuery}`;
}

function renderRelatedDestinations(currentDest) {
  const relatedGrid = document.getElementById('destRelatedGrid');
  if (!relatedGrid) return;

  const related = window.HB_DATA.destinations
    .filter(d => d.id !== currentDest.id)
    .slice(0, 3);

  relatedGrid.innerHTML = related.map(dest => `
    <article class="card-dest">
      <div class="card-dest-media">
        <img src="${dest.coverImage}" alt="${dest.name}">
        <span class="badge badge-white card-dest-badge">${dest.badge}</span>
      </div>
      <div class="card-dest-body">
        <div class="dest-meta-top">
          <span>${dest.district}, ${dest.region}</span>
        </div>
        <div class="dest-name-row">
          <h3>${dest.name}</h3>
        </div>
        <p class="dest-snippet">${dest.shortDescription}</p>
        <a href="destination-detail.html?id=${dest.id}" class="dest-footer-btn">
          <span>Read Itinerary & Tips</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `).join('');
}
