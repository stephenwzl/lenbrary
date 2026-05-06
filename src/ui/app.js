const pageSize = 40;

const state = {
  assets: [],
  selectedAssetId: undefined,
  offset: 0,
  hasMore: false,
  loading: false,
  filters: {
    type: '',
    favorite: '',
    camera: '',
    tag: '',
    dateFrom: '',
    dateTo: '',
    hasThumbnail: '',
    hasMetadata: '',
  },
  importQueue: [],
};

const grid = document.querySelector('#assetGrid');
const detail = document.querySelector('#detailPanel');
const statusPanel = document.querySelector('#statusPanel');
const feedbackRegion = document.querySelector('#feedbackRegion');
const resultSummary = document.querySelector('#resultSummary');
const activeFilters = document.querySelector('#activeFilters');
const loadMoreButton = document.querySelector('#loadMoreButton');
const typeFilter = document.querySelector('#typeFilter');
const cameraFilter = document.querySelector('#cameraFilter');
const tagFilter = document.querySelector('#tagFilter');
const favoriteFilter = document.querySelector('#favoriteFilter');
const dateFromFilter = document.querySelector('#dateFromFilter');
const dateToFilter = document.querySelector('#dateToFilter');
const thumbnailFilter = document.querySelector('#thumbnailFilter');
const metadataFilter = document.querySelector('#metadataFilter');
const fileInput = document.querySelector('#fileInput');
const importResults = document.querySelector('#importResults');
const importSummary = document.querySelector('#importSummary');

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return body.data ?? body;
}

function readFilters() {
  return {
    type: typeFilter.value,
    favorite: favoriteFilter.value,
    camera: cameraFilter.value.trim(),
    tag: tagFilter.value.trim(),
    dateFrom: dateFromFilter.value,
    dateTo: dateToFilter.value,
    hasThumbnail: thumbnailFilter.value,
    hasMetadata: metadataFilter.value,
  };
}

function query(offset = state.offset) {
  const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
  const filters = state.filters;
  if (filters.type) params.set('type', filters.type);
  if (filters.favorite) params.set('favorite', filters.favorite);
  if (filters.camera) params.set('camera', filters.camera);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.hasThumbnail) params.set('hasThumbnail', filters.hasThumbnail);
  if (filters.hasMetadata) params.set('hasMetadata', filters.hasMetadata);
  return params.toString();
}

async function loadAssets({ append = false } = {}) {
  state.loading = true;
  renderAssets();
  const nextOffset = append ? state.offset : 0;
  try {
    const response = await fetch(`/api/library/assets?${query(nextOffset)}`);
    const body = await response.json();
    if (!response.ok || body.success === false) {
      throw new Error(body.error || `Request failed: ${response.status}`);
    }
    const loaded = body.data || [];
    state.assets = append ? [...state.assets, ...loaded] : loaded;
    state.offset = nextOffset + loaded.length;
    state.hasMore = Boolean(body.pagination?.hasMore);
    if (!state.selectedAssetId && state.assets[0]) state.selectedAssetId = state.assets[0].id;
    renderActiveFilters();
    renderAssets();
    if (state.selectedAssetId) void loadDetail(state.selectedAssetId, false);
  } catch (error) {
    showFeedback('error', `Could not load library: ${error.message}`);
    grid.innerHTML = emptyState('Library unavailable', 'Check the server logs, then refresh the page.');
  } finally {
    state.loading = false;
    renderControls();
  }
}

function renderAssets() {
  renderControls();
  if (state.loading && state.assets.length === 0) {
    grid.innerHTML = emptyState('Loading library', 'Reading your catalog and media health state.');
    return;
  }
  grid.innerHTML = '';
  if (state.assets.length === 0) {
    const hasFilters = Object.values(state.filters).some(Boolean);
    grid.innerHTML = emptyState(
      hasFilters ? 'No results match these filters' : 'No media imported yet',
      hasFilters ? 'Clear a filter or broaden the date, tag, camera, thumbnail, or metadata criteria.' : 'Import images or videos to start building your personal catalog.',
    );
    return;
  }
  state.assets.forEach(asset => {
    const card = document.createElement('article');
    card.className = `asset-card health-${asset.processingHealth}`;
    const selected = asset.id === state.selectedAssetId ? ' aria-current="true"' : '';
    const thumb = asset.thumbnailAvailable && asset.thumbnailUrl
      ? `<img src="${asset.thumbnailUrl}" alt="">`
      : `<span>${asset.mediaType} preview unavailable</span>`;
    card.innerHTML = `
      <button type="button" data-id="${asset.id}"${selected}>
        <div class="thumb">${thumb}</div>
        <div class="asset-meta">
          <div class="asset-title">${escapeHtml(asset.originalName)}</div>
          <div class="muted">${asset.mediaType} · ${formatDate(asset.captureDate || asset.importedAt)}</div>
          <div class="health-pill ${healthClass(asset.processingHealth)}">${healthLabel(asset.processingHealth)}</div>
          <div class="tags">${asset.favorite ? '<span class="tag favorite">Favorite</span>' : ''}${asset.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        </div>
      </button>
    `;
    card.querySelector('button')?.addEventListener('click', () => void loadDetail(asset.id));
    grid.append(card);
  });
}

async function loadDetail(id, announce = true) {
  state.selectedAssetId = id;
  detail.innerHTML = emptyState('Loading detail', 'Preparing metadata, availability, and organization controls.');
  renderAssets();
  try {
    const asset = await requestJson(`/api/library/assets/${id}`);
    renderDetail(asset);
    if (announce) showFeedback('info', `Opened ${asset.originalName}.`);
  } catch (error) {
    detail.innerHTML = emptyState('Detail unavailable', error.message);
    showFeedback('error', `Could not load detail: ${error.message}`);
  }
}

function renderDetail(asset) {
  const preview = asset.thumbnailAvailable && asset.thumbnailUrl
    ? `<img src="${asset.thumbnailUrl}" alt="">`
    : `<span>${asset.mediaType} preview unavailable</span>`;
  const metadata = asset.metadata || {};
  const originalWarning = asset.fileAvailable
    ? '<p class="notice success">Original file is available.</p>'
    : '<p class="notice danger">Original file is missing. This is more serious than missing previews or metadata.</p>';
  detail.innerHTML = `
    <div class="detail-preview">${preview}</div>
    <div class="detail-heading">
      <h2>${escapeHtml(asset.originalName)}</h2>
      <span class="health-pill ${healthClass(asset.processingHealth)}">${healthLabel(asset.processingHealth)}</span>
    </div>
    ${originalWarning}
    ${section('File facts', [
      field('Type', asset.mediaType),
      field('MIME', asset.mimeType),
      field('Size', formatBytes(asset.fileSize)),
      field('Dimensions', asset.width && asset.height ? `${asset.width} x ${asset.height}` : 'Unavailable'),
      field('Imported', formatDate(asset.importedAt)),
      field('Duplicate ID', asset.duplicateIdentity || 'None'),
    ])}
    ${section('Availability', [
      field('Original', asset.fileAvailable ? 'Available' : 'Missing'),
      field('Thumbnail', asset.thumbnailAvailable ? 'Available' : 'Missing preview'),
      field('Metadata', asset.metadataAvailable ? 'Available' : 'Missing or not present in file'),
    ])}
    ${section('Metadata', [
      field('Capture date', asset.captureDate || metadata.captureDate || 'Unavailable'),
      field('Camera', [metadata.cameraMake, metadata.cameraModel].filter(Boolean).join(' ') || 'Unavailable'),
      field('Lens', metadata.lensModel || 'Unavailable'),
      field('Exposure', metadata.exposureSummary || 'Unavailable'),
      field('Video', metadata.videoDuration ? `${Math.round(metadata.videoDuration)}s · ${metadata.videoCodec || 'codec unavailable'}` : 'Unavailable'),
    ])}
    <div class="detail-actions">
      <a class="button-link" href="${asset.fileUrl}" target="_blank" rel="noreferrer">Open original</a>
      <label class="toggle"><input id="favoriteToggle" type="checkbox" ${asset.favorite ? 'checked' : ''}> Favorite</label>
    </div>
    <label class="tag-editor">Tags
      <input id="tagEditor" value="${escapeHtml(asset.tags.join(', '))}" aria-label="Comma-separated tags">
    </label>
    <div class="detail-actions">
      <button id="saveTags" type="button">Save tags</button>
      <button id="deleteAsset" class="danger-button" type="button">Delete</button>
    </div>
  `;
  detail.querySelector('#favoriteToggle')?.addEventListener('change', event => {
    const favorite = event.currentTarget.checked;
    void requestJson(`/api/library/assets/${asset.id}/favorite`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite }),
    }).then(() => {
      showFeedback('success', favorite ? 'Marked as favorite.' : 'Removed favorite marker.');
      return loadAssets({ append: false });
    });
  });
  detail.querySelector('#saveTags')?.addEventListener('click', () => {
    const tags = detail.querySelector('#tagEditor').value.split(',').map(tag => tag.trim()).filter(Boolean);
    void requestJson(`/api/library/assets/${asset.id}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    }).then(() => loadDetail(asset.id, false)).then(() => loadAssets()).then(() => showFeedback('success', 'Tags saved.'));
  });
  detail.querySelector('#deleteAsset')?.addEventListener('click', () => {
    if (!confirm(`Delete ${asset.originalName}? This removes the catalog item and stored media files.`)) return;
    void requestJson(`/api/assets/${asset.id}`, { method: 'DELETE' }).then(() => {
      showFeedback('success', `Deleted ${asset.originalName}.`);
      state.selectedAssetId = undefined;
      detail.innerHTML = emptyState('Select an asset', 'Choose a card to inspect metadata, availability, and organization controls.');
      return loadAssets();
    }).catch(error => showFeedback('error', `Delete failed: ${error.message}`));
  });
}

async function importFiles() {
  const files = [...(fileInput.files || [])];
  if (files.length === 0) {
    showFeedback('warning', 'Choose one or more images or videos before importing.');
    return;
  }
  state.importQueue = files.map((file, index) => ({ id: `${Date.now()}-${index}`, name: file.name, status: 'queued', message: 'Waiting to upload' }));
  renderImportQueue();
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    updateQueueItem(index, { status: 'uploading', message: 'Uploading and processing' });
    const form = new FormData();
    form.append('file', file);
    try {
      const response = await fetch('/api/assets/upload', { method: 'POST', body: form });
      const body = await response.json();
      const result = body.importResult || {
        inputName: file.name,
        status: body.duplicate ? 'duplicate' : (response.ok ? 'accepted' : 'failed'),
        assetId: body.data?.id,
        message: body.message || (response.ok ? 'Imported' : body.error || 'Failed'),
      };
      updateQueueItem(index, {
        status: normalizeImportStatus(result.status),
        assetId: result.assetId,
        message: result.message || result.status,
      });
    } catch (error) {
      updateQueueItem(index, { status: 'failed', message: `${error.message}. You can continue with successful files.` });
    }
  }
  showFeedback('success', 'Import review complete. Successful files are available in the library.');
  await loadAssets();
}

function updateQueueItem(index, patch) {
  state.importQueue[index] = { ...state.importQueue[index], ...patch };
  renderImportQueue();
}

function renderImportQueue() {
  importResults.innerHTML = '';
  if (state.importQueue.length === 0) {
    importSummary.textContent = '';
    return;
  }
  const counts = state.importQueue.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  importSummary.textContent = `${state.importQueue.length} selected · ${Object.entries(counts).map(([key, value]) => `${String(value)} ${key}`).join(' · ')}`;
  state.importQueue.forEach(item => {
    const row = document.createElement('div');
    row.className = `queue-item status-${item.status}`;
    row.innerHTML = `
      <span class="queue-dot"></span>
      <div>
        <div class="queue-title">${escapeHtml(item.name)}</div>
        <div class="muted">${escapeHtml(outcomeMessage(item))}</div>
      </div>
      ${item.assetId ? `<button type="button" data-asset-id="${item.assetId}">Open</button>` : ''}
    `;
    row.querySelector('button')?.addEventListener('click', event => {
      const id = Number(event.currentTarget.dataset.assetId);
      if (id) void loadDetail(id);
    });
    importResults.append(row);
  });
}

async function loadStatus() {
  try {
    const health = await requestJson('/api/library/health');
    statusPanel.hidden = false;
    statusPanel.innerHTML = `
      <div class="panel-heading">
        <div>
          <h2>Library status</h2>
          <p>Checked ${formatDate(health.checkedAt)}.</p>
        </div>
      </div>
      <div class="status-grid">
        ${statCard('Assets', `${health.assetCounts.total}`, `${health.assetCounts.image} images · ${health.assetCounts.video} videos`, 'info')}
        ${statCard('Missing originals', `${health.issueCounts.missingOriginals}`, 'Critical: source files are unavailable.', 'danger')}
        ${statCard('Missing thumbnails', `${health.issueCounts.missingThumbnails}`, 'Preview regeneration may be needed.', 'warning')}
        ${statCard('Missing metadata', `${health.issueCounts.missingMetadata}`, 'Some files may simply not contain metadata.', 'warning')}
        ${statCard('Duplicates', `${health.duplicateCount}`, 'Duplicate imports recognized by the catalog.', 'info')}
      </div>
      <p class="notice">Summary exports include catalog and metadata only. Original media files are not included.</p>
    `;
    showFeedback('info', 'Library health loaded.');
  } catch (error) {
    showFeedback('error', `Could not load status: ${error.message}`);
  }
}

function exportSummary() {
  const ok = confirm('Export a catalog/metadata summary? Original media files are not included, so this is not a backup.');
  if (!ok) return;
  showFeedback('info', 'Starting catalog export. Original media files are excluded.');
  window.location.href = '/api/library/export';
}

function renderActiveFilters() {
  activeFilters.innerHTML = '';
  const entries = filterEntries();
  if (entries.length === 0) {
    activeFilters.innerHTML = '<span class="muted">No active filters</span>';
    return;
  }
  entries.forEach(([key, label]) => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip';
    chip.type = 'button';
    chip.textContent = `${label} x`;
    chip.addEventListener('click', () => clearFilter(key));
    activeFilters.append(chip);
  });
}

function renderControls() {
  resultSummary.textContent = state.assets.length === 0
    ? 'No loaded assets'
    : `${state.assets.length} loaded${state.hasMore ? ' · more available' : ''}`;
  loadMoreButton.hidden = !state.hasMore;
  loadMoreButton.disabled = state.loading;
}

function updateFiltersAndReload() {
  state.filters = readFilters();
  state.offset = 0;
  void loadAssets();
}

function clearFilter(key) {
  const controls = {
    type: typeFilter,
    favorite: favoriteFilter,
    camera: cameraFilter,
    tag: tagFilter,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter,
    hasThumbnail: thumbnailFilter,
    hasMetadata: metadataFilter,
  };
  controls[key].value = '';
  updateFiltersAndReload();
}

function clearFilters() {
  [typeFilter, favoriteFilter, cameraFilter, tagFilter, dateFromFilter, dateToFilter, thumbnailFilter, metadataFilter].forEach(control => {
    control.value = '';
  });
  updateFiltersAndReload();
}

function filterEntries() {
  const labels = {
    type: 'Media',
    favorite: 'Favorite',
    camera: 'Camera',
    tag: 'Tag',
    dateFrom: 'From',
    dateTo: 'To',
    hasThumbnail: 'Thumbnail',
    hasMetadata: 'Metadata',
  };
  return Object.entries(state.filters)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => [key, `${labels[key]}: ${value}`]);
}

function showFeedback(kind, message) {
  feedbackRegion.innerHTML = `<div class="feedback ${kind}" role="status"><strong>${kindLabel(kind)}</strong><span>${escapeHtml(message)}</span></div>`;
}

function emptyState(title, message) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div>`;
}

function section(title, rows) {
  return `<section class="detail-section"><h3>${escapeHtml(title)}</h3>${rows.join('')}</section>`;
}

function field(label, value) {
  return `<div class="field"><span class="muted">${escapeHtml(label)}</span><span>${escapeHtml(String(value))}</span></div>`;
}

function statCard(label, value, message, kind) {
  return `<article class="stat-card ${kind}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(message)}</p></article>`;
}

function outcomeMessage(item) {
  if (item.status === 'duplicate') return item.message || 'Duplicate recognized. Open the existing library item.';
  if (item.status === 'unsupported') return item.message || 'Unsupported file type. Continue with other files.';
  if (item.status === 'failed') return item.message || 'Failed. Continue with successful imports.';
  if (item.status === 'accepted') return item.message || 'Imported.';
  if (item.status === 'uploading') return item.message || 'Uploading.';
  return item.message || item.status;
}

function normalizeImportStatus(status) {
  if (['accepted', 'duplicate', 'unsupported', 'failed', 'uploading', 'queued', 'completed'].includes(status)) return status;
  if (status === 'processing-pending') return 'accepted';
  return 'failed';
}

function healthLabel(health) {
  return {
    normal: 'Healthy',
    'missing-thumbnail': 'Missing thumbnail',
    'missing-metadata': 'Missing metadata',
    'missing-original': 'Missing original',
    'mixed-issues': 'Multiple issues',
  }[health] || health;
}

function healthClass(health) {
  if (health === 'normal') return 'success';
  if (health === 'missing-original' || health === 'mixed-issues') return 'danger';
  return 'warning';
}

function kindLabel(kind) {
  return { success: 'Done', warning: 'Check', error: 'Error', info: 'Note' }[kind] || 'Note';
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return 'Unavailable';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return 'Unavailable';
  return new Date(value).toLocaleString();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

document.querySelector('#refreshButton')?.addEventListener('click', () => void loadAssets());
document.querySelector('#clearFiltersButton')?.addEventListener('click', clearFilters);
document.querySelector('#importButton')?.addEventListener('click', () => void importFiles());
document.querySelector('#statusButton')?.addEventListener('click', () => void loadStatus());
document.querySelector('#exportButton')?.addEventListener('click', exportSummary);
loadMoreButton.addEventListener('click', () => void loadAssets({ append: true }));
[typeFilter, cameraFilter, tagFilter, favoriteFilter, dateFromFilter, dateToFilter, thumbnailFilter, metadataFilter].forEach(control => {
  control.addEventListener('change', updateFiltersAndReload);
});
detail.innerHTML = emptyState('Select an asset', 'Choose a card to inspect metadata, availability, and organization controls.');
renderActiveFilters();
renderImportQueue();
void loadAssets();
