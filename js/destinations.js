/**
 * Hidden Bangladesh - Destinations Directory Controller
 * Interactive Search, Region/Season Filter, Sorting, Wishlist sync
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.HB_DATA || !window.HB_DATA.destinations) return;
  initDestinationsDirectory();
});

function initDestinationsDirectory() {
  const container = document.getElementById('destinationsGrid');
  const countDisplay = document.getElementById('destinationCount');
  const searchInput = document.getElementById('destSearchInput');
  const regionPills = document.querySelectorAll('[data-region-filter]');
  const seasonSelect = document.getElementById('seasonFilter');
  const sortSelect = document.getElementById('sortSelect');

  let activeRegion = 'all';
  let activeSeason = 'all';
  let searchQuery = '';
  let activeSort = 'recommended';
  let activeView = 'grid';
  let lastItems = [];

  function filterAndRender() {
    let items = [...window.HB_DATA.destinations];

    // Filter by Region
    if (activeRegion !== 'all') {
      items = items.filter(d => d.region.toLowerCase().includes(activeRegion.toLowerCase()));
    }

    // Filter by Season
    if (activeSeason !== 'all') {
      items = items.filter(d => d.bestSeason.toLowerCase().includes(activeSeason.toLowerCase()));
    }

    // Filter by Search Query
    if (searchQuery) {
      items = items.filter(d =>
        d.name.toLowerCase().includes(searchQuery) ||
        d.district.toLowerCase().includes(searchQuery) ||
        d.region.toLowerCase().includes(searchQuery) ||
        d.shortDescription.toLowerCase().includes(searchQuery) ||
        d.travelStyle.toLowerCase().includes(searchQuery)
      );
    }

    // Sort
    if (activeSort === 'name-asc') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeSort === 'name-desc') {
      items.sort((a, b) => b.name.localeCompare(a.name));
    }

    // Update Counter
    if (countDisplay) {
      countDisplay.textContent = `Showing ${items.length} ${items.length === 1 ? 'Destination' : 'Destinations'}`;
    }

    // Render Cards
    renderDestinationCards(items, container);

    // Keep the map in sync when it is the active view
    lastItems = items;
    if (activeView === 'map') {
      updateMapMarkers(items);
    }
  }

  // Grid / Map view switching
  const viewToggleBtns = document.querySelectorAll('#destViewToggle .view-toggle-btn');
  const gridEl = document.getElementById('destinationsGrid');
  const mapEl = document.getElementById('destinationsMap');

  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeView = btn.getAttribute('data-view');
      viewToggleBtns.forEach(b => b.classList.toggle('active', b === btn));

      if (activeView === 'map') {
        if (gridEl) gridEl.style.display = 'none';
        if (mapEl) mapEl.style.display = 'block';
        initDestinationMap();
        updateMapMarkers(lastItems);
        // Leaflet needs a size recalculation once the container is visible
        setTimeout(() => { if (window.hbMap) window.hbMap.invalidateSize(); }, 80);
      } else {
        if (gridEl) gridEl.style.display = '';
        if (mapEl) mapEl.style.display = 'none';
      }
    });
  });

  // Event Listeners for Filters
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterAndRender();
    });
  }

  regionPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      regionPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeRegion = pill.getAttribute('data-region-filter');
      filterAndRender();
    });
  });

  if (seasonSelect) {
    seasonSelect.addEventListener('change', (e) => {
      activeSeason = e.target.value;
      filterAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndRender();
    });
  }

  // Handle URL parameters (e.g., destinations.html?region=Sylhet&season=winter&style=Highland)
  const urlParams = new URLSearchParams(window.location.search);
  const regionParam = urlParams.get('region');
  const seasonParam = urlParams.get('season');
  const styleParam = urlParams.get('style');

  if (regionParam && regionParam !== 'all') {
    const targetPill = Array.from(regionPills).find(p =>
      p.getAttribute('data-region-filter').toLowerCase().includes(regionParam.toLowerCase())
    );
    if (targetPill) {
      regionPills.forEach(p => p.classList.remove('active'));
      targetPill.classList.add('active');
      activeRegion = targetPill.getAttribute('data-region-filter');
    }
  }

  if (seasonParam && seasonSelect && seasonParam !== 'all') {
    seasonSelect.value = seasonParam;
    activeSeason = seasonParam;
  }

  if (styleParam && styleParam !== 'all') {
    searchQuery = styleParam.toLowerCase();
    if (searchInput) searchInput.value = styleParam;
  }

  filterAndRender();
}

function renderDestinationCards(items, container) {
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-forest-deep);">No destinations match your criteria</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Try resetting your search query or region filter to discover more places.</p>
        <button class="btn btn-outline" onclick="resetFilters()">View All Destinations</button>
      </div>
    `;
    return;
  }

  const savedIds = window.getFavorites ? window.getFavorites().map(f => f.id) : [];

  container.innerHTML = items.map(dest => {
    const isFavorited = savedIds.includes(dest.id);
    return `
      <article class="card-dest">
        <div class="card-dest-media">
          <img src="${dest.coverImage}" alt="${dest.name} - ${dest.subtitle}" loading="lazy">
          <span class="badge badge-white card-dest-badge">${dest.badge}</span>
          <button
            class="card-favorite-btn ${isFavorited ? 'favorited' : ''}"
            data-fav-id="${dest.id}"
            title="${isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}"
            onclick="window.toggleFavorite('${dest.id}', 'destination', '${dest.name.replace(/'/g, "\\'")}', '${dest.coverImage}', '${dest.region}')"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div class="card-dest-body">
          <div class="dest-meta-top">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${dest.district}, ${dest.region}</span>
          </div>
          <div class="dest-name-row">
            <h3>${dest.name} <span class="bengali-script">${dest.bengaliName}</span></h3>
          </div>
          <p class="dest-snippet">${dest.shortDescription}</p>
          <div class="dest-quick-facts">
            <span class="dest-quick-fact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${dest.duration}
            </span>
            <span class="dest-quick-fact">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              ${dest.travelStyle}
            </span>
          </div>
          <a href="destination-detail.html?id=${dest.id}" class="dest-footer-btn">
            <span>Explore Complete Guide</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </article>
    `;
  }).join('');
}

window.resetFilters = function() {
  const searchInput = document.getElementById('destSearchInput');
  const regionPills = document.querySelectorAll('[data-region-filter]');
  if (searchInput) searchInput.value = '';
  regionPills.forEach(p => p.classList.remove('active'));
  const allPill = document.querySelector('[data-region-filter="all"]');
  if (allPill) allPill.classList.add('active');
  const seasonSelect = document.getElementById('seasonFilter');
  if (seasonSelect) seasonSelect.value = 'all';
  initDestinationsDirectory();
};

/* -------------------------------------------------------------------------
   Interactive Leaflet Map Engine
   ------------------------------------------------------------------------- */
function parseDestinationCoordinates(str) {
  if (!str) return null;
  const match = String(str).match(/([\d.]+)\s*°?\s*([NS])[^0-9]+([\d.]+)\s*°?\s*([EW])/i);
  if (!match) return null;
  let lat = parseFloat(match[1]);
  let lng = parseFloat(match[3]);
  if (match[2].toUpperCase() === 'S') lat = -lat;
  if (match[4].toUpperCase() === 'W') lng = -lng;
  return [lat, lng];
}

function initDestinationMap() {
  const mapEl = document.getElementById('destinationsMap');
  if (!mapEl || !window.L || window.hbMap) return;

  window.hbMap = L.map(mapEl, { scrollWheelZoom: true, zoomControl: true })
    .setView([23.685, 90.3563], 7);

  window.hbMapMarkers = L.layerGroup().addTo(window.hbMap);

  // Allow the theme controller to swap tile styles
  window.__hbMapSetTiles = function (theme) {
    applyMapTiles(theme === 'dark' ? 'dark' : 'light');
  };
  applyMapTiles(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
}

function applyMapTiles(theme) {
  const map = window.hbMap;
  if (!map) return;
  if (map.__hbTiles) map.removeLayer(map.__hbTiles);

  const url = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  map.__hbTiles = L.tileLayer(url, {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
  map.__hbTiles.bringToBack();
}

const HB_MAP_PIN_ICON = window.L ? L.divIcon({
  className: 'hb-map-pin',
  html: '<span></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 20],
  popupAnchor: [0, -18]
}) : null;

function updateMapMarkers(items) {
  if (!window.hbMap) return;
  const group = window.hbMapMarkers;
  if (!group) return;
  group.clearLayers();

  if (!items || items.length === 0) return;

  const bounds = [];
  items.forEach(dest => {
    const coords = parseDestinationCoordinates(dest.coordinates);
    if (!coords) return;
    bounds.push(coords);

    const marker = L.marker(coords, HB_MAP_PIN_ICON ? { icon: HB_MAP_PIN_ICON } : {})
      .addTo(group);

    marker.bindPopup(`
      <div class="hb-map-popup">
        <img src="${dest.coverImage}" alt="${dest.name}">
        <div class="hb-map-popup-body">
          <h4>${dest.name}</h4>
          <div class="meta">${dest.district}, ${dest.region}</div>
          <a href="destination-detail.html?id=${dest.id}">Explore guide &rarr;</a>
        </div>
      </div>
    `);
  });

  if (bounds.length) {
    window.hbMap.fitBounds(bounds, { padding: [45, 45], maxZoom: 9 });
  }
}
