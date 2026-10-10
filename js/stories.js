/**
 * Hidden Bangladesh - Stories & Journal Controller
 * Topic Filter, Search & Card Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.HB_DATA || !window.HB_DATA.stories) return;
  initStoriesDirectory();
});

function initStoriesDirectory() {
  const container = document.getElementById('storiesGrid');
  const searchInput = document.getElementById('storySearchInput');
  const topicPills = document.querySelectorAll('[data-story-topic]');

  let activeTopic = 'all';
  let searchQuery = '';

  function filterAndRender() {
    let items = [...window.HB_DATA.stories];

    if (activeTopic !== 'all') {
      items = items.filter(s => s.category.toLowerCase().includes(activeTopic.toLowerCase()));
    }

    if (searchQuery) {
      items = items.filter(s =>
        s.title.toLowerCase().includes(searchQuery) ||
        s.subtitle.toLowerCase().includes(searchQuery) ||
        s.excerpt.toLowerCase().includes(searchQuery) ||
        s.author.name.toLowerCase().includes(searchQuery)
      );
    }

    renderStories(items, container);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterAndRender();
    });
  }

  topicPills.forEach(pill => {
    pill.addEventListener('click', () => {
      topicPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeTopic = pill.getAttribute('data-story-topic');
      filterAndRender();
    });
  });

  filterAndRender();
}

function renderStories(stories, container) {
  if (!container) return;

  if (stories.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <h3>No articles found</h3>
        <p style="color: var(--color-text-muted);">Try a different topic or keyword search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = stories.map(story => `
    <article class="story-card">
      <div class="story-media">
        <img src="${story.coverImage}" alt="${story.title}" loading="lazy">
        <span class="badge badge-white" style="position: absolute; top: 1rem; left: 1rem; z-index: 2;">${story.category}</span>
      </div>
      <div class="story-body">
        <div class="story-meta">
          <span>${story.date}</span>
          <span>•</span>
          <span>${story.readTime}</span>
        </div>
        <a href="story-detail.html?id=${story.id}" style="text-decoration: none;">
          <h3 class="story-title">${story.title}</h3>
        </a>
        <p class="story-excerpt">${story.excerpt}</p>
        <div class="story-author-row">
          <div class="author-pill">
            <img src="${story.author.avatar}" alt="${story.author.name}" class="author-avatar">
            <div>
              <div class="author-name">${story.author.name}</div>
              <div class="author-role">${story.author.role}</div>
            </div>
          </div>
          <a href="story-detail.html?id=${story.id}" style="color: var(--color-forest); font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;">
            <span>Read Story</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
        </div>
      </div>
    </article>
  `).join('');
}
