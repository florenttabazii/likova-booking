// Render the list from structured service data
function renderServicesFromData(data) {
  const container = document.getElementById('services-list');
  const overlay = document.getElementById('services-loading-overlay');
  if (!container) return;

  container.innerHTML = '';
  if (overlay) overlay.style.display = 'flex';

  if (!data || data.length === 0) {
    container.innerHTML = `
      <li class="flex-list">
        <span class="flex-list-left">—</span>
        <span class="flex-list-center">Keine Kategorien gefunden</span>
        <span class="flex-list-right">—</span>
      </li>`;
    if (overlay) overlay.style.display = 'none';
    return;
  }

  data.forEach(section => {
    const sectionRow = document.createElement('li');
    sectionRow.className = 'flex-list section-heading';
    sectionRow.innerHTML = `
      <span class="flex-list-left"></span>
      <span class="flex-list-center"><strong>${section.title}</strong></span>
      <span class="flex-list-right"></span>
    `;
    container.appendChild(sectionRow);

    if (!section.services.length) {
      const emptyRow = document.createElement('li');
      emptyRow.className = 'flex-list';
      emptyRow.innerHTML = `
        <span class="flex-list-left">—</span>
        <span class="flex-list-center">Keine Services</span>
        <span class="flex-list-right">—</span>`;
      container.appendChild(emptyRow);
    } else {
      section.services.forEach(service => {
        const item = document.createElement('li');
        item.className = 'flex-list link';
        item.innerHTML = `
          <span class="flex-list-left">${service.name}</span>
          <span class="flex-list-center">${service.duration} Minuten</span>
          <span class="flex-list-right">${Number(service.price).toFixed(2)} CHF</span>`;
        container.appendChild(item);
      });
    }
  });

  if (overlay) overlay.style.display = 'none';
}

// Fetch and cache in sessionStorage
async function fetchAndCacheServices() {
  console.log('[Services] Fetching from Supabase...');
  const { data: sections, error } = await window.supabase
    .from('service_sections')
    .select('id, section_title');

  if (error || !sections) {
    console.warn('[Services] Failed to fetch sections:', error);
    return [];
  }

  const fullData = [];

  for (const section of sections) {
    const { data: services } = await window.supabase
      .from('services')
      .select('name, price, duration')
      .eq('section_id', section.id)
      .order('created_at', { ascending: true });

    fullData.push({
      title: section.section_title,
      services: services || [],
    });
  }

  // Cache for future loads
  try {
    sessionStorage.setItem('servicesData', JSON.stringify(fullData));
  } catch (e) {
    console.warn('[Services] SessionStorage failed:', e);
  }

  return fullData;
}

// Core initializer
async function initServicesList(forceFresh = false) {
  const container = document.getElementById('services-list');
  if (!container) return;

  if (!forceFresh) {
    const cached = sessionStorage.getItem('servicesData');
    if (cached) {
      console.log('[Services] Loaded from sessionStorage');
      renderServicesFromData(JSON.parse(cached));
      return;
    }
  }

  const data = await fetchAndCacheServices();
  renderServicesFromData(data);
}

// Track load per session to prevent duplicates
let servicesAlreadyLoaded = false;

// Safe init function to call on page change
function safeInitServices() {
  const exists = document.getElementById('services-list');
  if (!exists || servicesAlreadyLoaded) return;

  servicesAlreadyLoaded = true;
  initServicesList();
}

// Load on direct visit
window.addEventListener('load', safeInitServices);

// Load on Clapat AJAX transition
document.addEventListener('clapat-page-loaded', () => {
  // Allow re-init after each AJAX load
  servicesAlreadyLoaded = false;
  setTimeout(safeInitServices, 100); // tiny delay to ensure DOM is ready
});
