# Hidden Bangladesh — Discover the Bangladesh You've Never Seen

An editorial travel and photography web platform inspired by the visual style and immersive storytelling of **Unseen Bangladesh**, **Kinfolk**, and **National Geographic Traveler**.

---

## 🌿 Overview

**Hidden Bangladesh** is a modern, high-aesthetic web experience crafted with pure **HTML5, modern CSS3, and modular Vanilla JavaScript**. It showcases the hidden beauty, living cultural heritage, mist-shrouded mountain summits, serene freshwater wetlands, and forgotten historical monuments across the Bengal delta.

### Key Highlights
- **Cinematic Visual Identity:** Forest green (`#0e2017`), warm sand beige (`#f4eee2`), off-white (`#faf7f2`), terracotta earth (`#8f5334`), and golden ochre (`#c59b27`).
- **Typography:** Serif editorial headers (*Playfair Display*) paired with clean modern grotesque body (*Plus Jakarta Sans*) and authentic Bengali script (*Noto Serif Bengali*).
- **Zero Build Step:** Runs immediately in any modern browser by double-clicking `index.html` or running any local HTTP server (Live Server, Python `http.server`, etc.).
- **100% Responsive:** Desktop, tablet, and mobile layouts with custom drawers and fluid typography.

---

## 📁 Project Structure

```
d:\unseenbd\
├── index.html                   # Homepage (Hero, Stats, Hidden Gems, Culture, Photostories)
├── destinations.html            # Searchable & Filterable Destination Directory
├── destination-detail.html      # Dynamic Destination Guide (Itineraries, Maps, Facts)
├── photography.html             # Masonry Visual Gallery with Fullscreen Lightbox
├── stories.html                 # Editorial Journal & Dispatches
├── story-detail.html            # Longform Reader with Progress Bar & Sticky TOC
├── about.html                   # Mission, Ethical Travel Charter, Team, FAQ
├── contact.html                 # Inquiries, Local Guide Coordination, Gem Submissions
├── privacy.html                 # Privacy Policy, Artist Rights, Responsible Tourism Code
├── css/
│   ├── style.css                # Design system tokens, variables, typography, reset
│   └── components.css           # Cards, Modals, Lightbox, Drawers, Navigation, Footer
└── js/
    ├── data.js                  # Central authentic dataset (Destinations, Photos, Stories)
    ├── main.js                  # Global controller: sticky nav, search modal, soundscape, toasts
    ├── destinations.js          # Search, region/season filters, sorting, wishlist sync
    ├── destination-detail.js    # Query-param loader (?id=...), itineraries, map previews
    ├── photography.js           # Masonry layout, category tabs, keyboard-nav lightbox
    ├── stories.js               # Editorial topic filters & search
    └── story-detail.js          # Reading progress, TOC scrollspy, clipboard sharing
```

---

## ✨ Features & Functionality

### 1. Dynamic Destination Explorer (`destinations.html` & `destination-detail.html`)
- **Interactive Multi-Filter:** Filter by Region (*Chittagong Hill Tracts, Sylhet & Haor, Coastal & Islands, Heritage & Plains, Mangrove*) and Season (*Winter, Monsoon, Year-Round*).
- **Instant Search:** Real-time client-side search across destinations, districts, and travel styles.
- **Deep Destination Guides:** Each destination page loads via URL parameter (e.g., `destination-detail.html?id=sajek-valley` or `?id=tanguar-haor`) featuring:
  - High-res cover photo and Bengali script title.
  - Quick facts: Altitude, Optimal Season, Trail Difficulty, Nearest Hub.
  - Multi-day structured itinerary with step-by-step guidance.
  - Key highlights and cultural etiquette checklist.
  - Responsible tourism principles (Leave No Trace, community guides).
  - High-resolution gallery connected to lightbox.
  - Direct GPS coordinates and Google Maps integration.

### 2. Photography Portfolio & Lightbox (`photography.html`)
- Masonry grid layout supporting varied portrait and landscape aspect ratios.
- 9 distinct category filters (*Nature, Rivers & Wetlands, Mountains, Culture, Village Life, Wildlife, Architecture, Sunset*).
- Fullscreen Lightbox with:
  - Previous / Next navigation controls.
  - Keyboard shortcuts (`ArrowLeft`, `ArrowRight`, `Escape`).
  - Photographer copyright credit and camera / EXIF technical details.

### 3. Editorial Journal & Story Reader (`stories.html` & `story-detail.html`)
- Magazine-style article layouts with author bios and estimated reading times.
- Top-of-screen **reading progress bar** tracking scroll position.
- **Sticky Table of Contents** with active section scrollspy.
- Drop caps, stylized blockquotes, and one-click social share dialog with toast feedback.

### 4. Interactive Delights
- **Global Search Modal (`Ctrl+K` / `Cmd+K`):** Searches destinations, stories, and photographs simultaneously from any page.
- **Travel Wishlist Drawer:** Bookmark destinations or stories with the heart button; items persist across sessions in `localStorage`.
- **Atmospheric Nature Soundscape:** Click the sound icon in the navbar to experience a synthesized gentle river and rain soundscape via browser-native Web Audio API (no external MP3 download required).
- **Toast Notifications:** Instant feedback for bookmarks, newsletter signups, and link copying.

---

## 🚀 How to Run the Website

### Option 1: Direct File Opening
Double-click `index.html` in Windows Explorer to open directly in Google Chrome, Microsoft Edge, Brave, or Firefox.

### Option 2: Local HTTP Server (Recommended)
If you have Python or VS Code installed:

**Using Python:**
```bash
cd d:\unseenbd
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using VS Code:**
Install the "Live Server" extension, open `d:\unseenbd`, and click **Go Live**.

---

## 🌐 Connecting to a CMS or Backend API (Production Roadmap)
The architecture is decoupled: all content resides in `js/data.js` and can be switched to API calls:
1. Replace `window.HB_DATA` in `js/data.js` with `fetch('/api/destinations')` or GraphQL queries to a headless CMS such as **Strapi**, **Sanity.io**, or **Ghost**.
2. Connect `contact.html` and the newsletter form to a serverless endpoint (e.g., Cloudflare Workers, Node.js Express, Supabase, or Formspree).
