/**
 * Hidden Bangladesh - Story Detail Reader Controller
 * Longform reader, reading progress bar, table of contents scrollspy, share dialog
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!window.HB_DATA || !window.HB_DATA.stories) return;
  loadStoryDetail();
  initReadingProgressBar();
});

function loadStoryDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  let storyId = urlParams.get('id');

  let story = window.HB_DATA.stories.find(s => s.id === storyId);
  if (!story) {
    story = window.HB_DATA.stories[0]; // Default to Tanguar Haor
    storyId = story.id;
  }

  document.title = `${story.title} — Hidden Bangladesh Editorial`;

  // Render Header Details
  const titleEl = document.getElementById('storyTitle');
  const subtitleEl = document.getElementById('storySubtitle');
  const catEl = document.getElementById('storyCategory');
  const dateEl = document.getElementById('storyDate');
  const readTimeEl = document.getElementById('storyReadTime');
  const coverImg = document.getElementById('storyCoverImg');
  const authorAvatar = document.getElementById('storyAuthorAvatar');
  const authorName = document.getElementById('storyAuthorName');
  const authorRole = document.getElementById('storyAuthorRole');

  if (titleEl) titleEl.textContent = story.title;
  if (subtitleEl) subtitleEl.textContent = story.subtitle;
  if (catEl) catEl.textContent = story.category;
  if (dateEl) dateEl.textContent = story.date;
  if (readTimeEl) readTimeEl.textContent = story.readTime;
  if (coverImg) coverImg.src = story.coverImage;
  if (authorAvatar) authorAvatar.src = story.author.avatar;
  if (authorName) authorName.textContent = story.author.name;
  if (authorRole) authorRole.textContent = story.author.role;

  // Render Longform Content & Table of Contents
  renderStoryContent(story);

  // Render Related Stories
  renderRelatedStories(story);
}

function renderStoryContent(story) {
  const contentContainer = document.getElementById('storyArticleBody');
  const tocContainer = document.getElementById('storyTableOfContents');
  if (!contentContainer) return;

  let tocHtml = '<ul style="display: flex; flex-direction: column; gap: 0.75rem;">';
  let bodyHtml = '';

  story.content.forEach((block, index) => {
    if (block.heading) {
      const sectionId = `section-${index}`;
      tocHtml += `
        <li>
          <a href="#${sectionId}" class="toc-link" data-target="${sectionId}" style="color: var(--color-text-muted); font-size: 0.88rem; transition: color var(--transition-fast); display: block;">
            ${block.heading}
          </a>
        </li>
      `;
      bodyHtml += `
        <div id="${sectionId}" class="story-section" style="margin-bottom: 2.5rem; scroll-margin-top: 100px;">
          <h2 style="font-size: 1.85rem; margin-bottom: 1rem; color: var(--color-forest-deep);">${block.heading}</h2>
          <p style="font-size: 1.12rem; line-height: 1.85; color: var(--color-text-main); font-weight: 300;">${block.text}</p>
        </div>
      `;
    } else if (block.quote) {
      bodyHtml += `
        <blockquote style="margin: 3rem 0; padding: 2rem 2.5rem; background: var(--color-forest-mist); border-left: 4px solid var(--color-gold); border-radius: 0 var(--radius-md) var(--radius-md) 0;">
          <p style="font-family: var(--font-serif); font-style: italic; font-size: 1.35rem; color: var(--color-forest-deep); line-height: 1.6; margin: 0;">
            “${block.quote}”
          </p>
        </blockquote>
      `;
    }
  });

  tocHtml += '</ul>';

  if (tocContainer) tocContainer.innerHTML = tocHtml;
  contentContainer.innerHTML = bodyHtml;

  initScrollSpy();
}

function initReadingProgressBar() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('.story-section');
  const links = document.querySelectorAll('.toc-link');

  const onScroll = () => {
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= 140) {
        currentId = sec.getAttribute('id');
      }
    });

    links.forEach(link => {
      if (link.getAttribute('data-target') === currentId) {
        link.style.color = 'var(--color-gold)';
        link.style.fontWeight = '700';
      } else {
        link.style.color = 'var(--color-text-muted)';
        link.style.fontWeight = '400';
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function renderRelatedStories(currentStory) {
  const container = document.getElementById('relatedStoriesGrid');
  if (!container) return;

  const related = window.HB_DATA.stories
    .filter(s => s.id !== currentStory.id)
    .slice(0, 2);

  container.innerHTML = related.map(story => `
    <article class="story-card">
      <div class="story-media">
        <img src="${story.coverImage}" alt="${story.title}">
        <span class="badge badge-white" style="position: absolute; top: 1rem; left: 1rem;">${story.category}</span>
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
        <a href="story-detail.html?id=${story.id}" class="dest-footer-btn">
          <span>Read Full Story</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `).join('');
}

window.copyArticleLink = function() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      window.showToast("Article link copied to clipboard! 📋");
    });
  } else {
    window.showToast(`Link: ${window.location.href}`);
  }
};
