const grid = document.querySelector('#assetGrid');
const detail = document.querySelector('#detailPanel');
const statusPanel = document.querySelector('#statusPanel');
const typeFilter = document.querySelector('#typeFilter');
const cameraFilter = document.querySelector('#cameraFilter');
const tagFilter = document.querySelector('#tagFilter');
const favoriteFilter = document.querySelector('#favoriteFilter');
const fileInput = document.querySelector('#fileInput');
const importResults = document.querySelector('#importResults');

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return body.data ?? body;
}

function query() {
  const params = new URLSearchParams({ limit: '80', offset: '0' });
  if (typeFilter.value) params.set('type', typeFilter.value);
  if (cameraFilter.value.trim()) params.set('camera', cameraFilter.value.trim());
  if (tagFilter.value.trim()) params.set('tag', tagFilter.value.trim());
  if (favoriteFilter.checked) params.set('favorite', 'true');
  return params.toString();
}

async function loadAssets() {
  const assets = await requestJson(`/api/library/assets?${query()}`);
  renderAssets(assets);
}

function renderAssets(assets) {
  grid.innerHTML = '';
  if (assets.length === 0) {
    grid.innerHTML = '<p class="muted">No assets match these filters.</p>';
    return;
  }
  assets.forEach(asset => {
    const card = document.createElement('article');
    card.className = 'asset-card';
    const thumb = asset.thumbnailAvailable && asset.thumbnailUrl
      ? `<img src="${asset.thumbnailUrl}" alt="">`
      : `<span>${asset.mediaType} preview unavailable</span>`;
    card.innerHTML = `
      <button type="button" data-id="${asset.id}">
        <div class="thumb">${thumb}</div>
        <div class="asset-meta">
          <div class="asset-title">${escapeHtml(asset.originalName)}</div>
          <div class="muted">${asset.mediaType} · ${new Date(asset.importedAt).toLocaleString()}</div>
          <div class="muted">${asset.processingHealth}</div>
          <div class="tags">${asset.favorite ? '<span class="tag">Favorite</span>' : ''}${asset.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        </div>
      </button>
    `;
    card.querySelector('button')?.addEventListener('click', () => void loadDetail(asset.id));
    grid.append(card);
  });
}

async function loadDetail(id) {
  const asset = await requestJson(`/api/library/assets/${id}`);
  const preview = asset.thumbnailAvailable && asset.thumbnailUrl
    ? `<img src="${asset.thumbnailUrl}" alt="">`
    : `<span>${asset.mediaType} preview unavailable</span>`;
  detail.innerHTML = `
    <div class="detail-preview">${preview}</div>
    <h2>${escapeHtml(asset.originalName)}</h2>
    ${field('Type', asset.mediaType)}
    ${field('MIME', asset.mimeType)}
    ${field('Size', `${asset.fileSize} bytes`)}
    ${field('Imported', new Date(asset.importedAt).toLocaleString())}
    ${field('Health', asset.processingHealth)}
    ${field('Metadata', asset.metadataAvailable ? 'Available' : 'Unavailable')}
    ${field('Duplicate ID', asset.duplicateIdentity || 'None')}
    <p><a href="${asset.fileUrl}" target="_blank" rel="noreferrer">Open original</a></p>
    <label><input id="favoriteToggle" type="checkbox" ${asset.favorite ? 'checked' : ''}> Favorite</label>
    <div class="field"><span>Tags</span><input id="tagEditor" value="${escapeHtml(asset.tags.join(', '))}"></div>
    <button id="saveTags" type="button">Save tags</button>
    <button id="deleteAsset" type="button">Delete</button>
  `;
  detail.querySelector('#favoriteToggle')?.addEventListener('change', event => {
    const favorite = event.currentTarget.checked;
    void requestJson(`/api/library/assets/${asset.id}/favorite`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite }),
    }).then(loadAssets);
  });
  detail.querySelector('#saveTags')?.addEventListener('click', () => {
    const tags = detail.querySelector('#tagEditor').value.split(',');
    void requestJson(`/api/library/assets/${asset.id}/tags`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags }),
    }).then(() => loadDetail(asset.id)).then(loadAssets);
  });
  detail.querySelector('#deleteAsset')?.addEventListener('click', () => {
    if (!confirm(`Delete ${asset.originalName}?`)) return;
    void requestJson(`/api/assets/${asset.id}`, { method: 'DELETE' }).then(() => {
      detail.innerHTML = '';
      return loadAssets();
    });
  });
}

async function importFiles() {
  const files = [...(fileInput.files || [])];
  importResults.innerHTML = '';
  for (const file of files) {
    const form = new FormData();
    form.append('file', file);
    try {
      const response = await fetch('/api/assets/upload', { method: 'POST', body: form });
      const body = await response.json();
      const result = body.importResult || { inputName: file.name, status: body.duplicate ? 'duplicate' : 'accepted', message: body.message || 'Imported' };
      addImportResult(`${result.inputName}: ${result.message || result.status}`);
    } catch (error) {
      addImportResult(`${file.name}: ${error.message}`);
    }
  }
  await loadAssets();
}

function addImportResult(text) {
  const row = document.createElement('div');
  row.className = 'result';
  row.textContent = text;
  importResults.append(row);
}

async function loadStatus() {
  const health = await requestJson('/api/library/health');
  statusPanel.hidden = false;
  statusPanel.innerHTML = `
    <h2>Library status</h2>
    ${field('Assets', `${health.assetCounts.total} total · ${health.assetCounts.image} images · ${health.assetCounts.video} videos`)}
    ${field('Issues', `${health.issueCounts.missingOriginals} missing originals · ${health.issueCounts.missingThumbnails} missing thumbnails · ${health.issueCounts.missingMetadata} missing metadata`)}
    ${field('Duplicates', String(health.duplicateCount))}
    <p class="muted">Original media files are not included in summary exports.</p>
  `;
}

function exportSummary() {
  window.location.href = '/api/library/export';
}

function field(label, value) {
  return `<div class="field"><span class="muted">${label}</span><span>${escapeHtml(value)}</span></div>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

document.querySelector('#refreshButton')?.addEventListener('click', () => void loadAssets());
document.querySelector('#importButton')?.addEventListener('click', () => void importFiles());
document.querySelector('#statusButton')?.addEventListener('click', () => void loadStatus());
document.querySelector('#exportButton')?.addEventListener('click', exportSummary);
[typeFilter, cameraFilter, tagFilter, favoriteFilter].forEach(control => control.addEventListener('change', () => void loadAssets()));
void loadAssets();
