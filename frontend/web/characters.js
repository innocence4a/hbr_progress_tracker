// キャラクター一覧 / スタイル図鑑ページ
// データは data/characters.csv を読み込むバックエンドAPI（/api/characters, /api/styles）から取得する。
// 所持・凸数の変更は PATCH /api/styles/{id}/progress で保存される（data/progress.json）。

const MAX_LIMIT_BREAK = 5;
const RARITY_LABELS = { SS: 'SS', S: 'S', A: 'A' };

let charactersCache = [];
let stylesCache = [];

function characterImageUrl(characterName) {
    return `/images/characters/${encodeURIComponent(characterName)}.png`;
}

function styleImageUrl(characterName, styleName) {
    return `/images/styles/${encodeURIComponent(characterName + '_' + styleName)}.png`;
}

function withImageFallback(imgHtml, fallbackHtml) {
    return imgHtml.replace('__FALLBACK__', fallbackHtml.replace(/"/g, '&quot;'));
}

function avatarPlaceholder(name) {
    const initial = name ? name.charAt(0) : '?';
    return `<div class="avatar-placeholder">${initial}</div>`;
}

async function fetchJson(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `リクエストに失敗しました (${res.status})`);
    }
    return res.json();
}

async function loadCharacters() {
    charactersCache = await fetchJson('/api/characters');
}

async function loadStyles() {
    stylesCache = await fetchJson('/api/styles');
}

async function refreshAll() {
    await Promise.all([loadCharacters(), loadStyles()]);
    applyCharacterFilters();
    applyStyleFilters();
}

// ---------- キャラクター一覧 ----------

function characterCardHtml(character) {
    const imgSrc = characterImageUrl(character.name);
    const fallback = avatarPlaceholder(character.name);
    const pct = character.styleCount > 0
        ? Math.round((character.ownedCount / character.styleCount) * 100)
        : 0;

    return `
        <div class="character-card ${character.fullyOwned ? 'fully-owned' : ''}" data-character-id="${character.id}">
            <div class="character-portrait">
                <img src="${imgSrc}" alt="${character.name}" onerror="this.replaceWith(Object.assign(document.createElement('div'), {className: 'avatar-placeholder', textContent: '${character.name.charAt(0)}'}))">
            </div>
            <div class="character-info">
                <h4>${character.name}</h4>
                <div class="progress-bar character-progress-bar">
                    <div class="progress-fill" style="width: ${pct}%"></div>
                </div>
                <div class="progress-text">
                    <span>所持 ${character.ownedCount}/${character.styleCount} スタイル</span>
                    <span>${pct}%</span>
                </div>
                <div class="character-stats">
                    <span>凸合計 ${character.totalLimitBreak}/${character.maxLimitBreak}</span>
                </div>
                <button class="view-styles-btn" data-character-id="${character.id}" data-character-name="${character.name}">
                    スタイルを見る →
                </button>
            </div>
        </div>
    `;
}

function applyCharacterFilters() {
    const keyword = (document.getElementById('char-search')?.value || '').trim();
    const ownedFilter = document.getElementById('char-owned-filter')?.value || 'all';

    let filtered = charactersCache.filter((c) => c.name.includes(keyword));

    if (ownedFilter === 'complete') {
        filtered = filtered.filter((c) => c.fullyOwned);
    } else if (ownedFilter === 'partial') {
        filtered = filtered.filter((c) => c.ownedCount > 0 && !c.fullyOwned);
    } else if (ownedFilter === 'none') {
        filtered = filtered.filter((c) => c.ownedCount === 0);
    }

    renderCharacters(filtered);
}

function renderCharacters(characters) {
    const grid = document.getElementById('character-grid');
    const summary = document.getElementById('char-summary');
    if (!grid) return;

    const totalStyles = charactersCache.reduce((sum, c) => sum + c.styleCount, 0);
    const ownedStyles = charactersCache.reduce((sum, c) => sum + c.ownedCount, 0);
    const fullyOwnedChars = charactersCache.filter((c) => c.fullyOwned).length;

    if (summary) {
        summary.innerHTML = `
            <span>👤 キャラ数 ${charactersCache.length}</span>
            <span>💯 全スタイル所持 ${fullyOwnedChars}人</span>
            <span>⭐ スタイル所持 ${ownedStyles}/${totalStyles}</span>
        `;
    }

    grid.innerHTML = characters.length
        ? characters.map(characterCardHtml).join('')
        : '<p class="empty-message">該当するキャラクターがいません</p>';

    grid.querySelectorAll('.view-styles-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-character-name');
            const searchInput = document.getElementById('style-search');
            if (searchInput) searchInput.value = name;

            document.querySelector('.tab[data-tab="style-catalog"]')?.click();
            applyStyleFilters();
        });
    });
}

// ---------- スタイル図鑑 ----------

function limitBreakDotsHtml(style) {
    let dots = '';
    for (let i = 1; i <= MAX_LIMIT_BREAK; i++) {
        const filled = i <= style.limitBreak ? 'filled' : '';
        dots += `<span class="lb-dot ${filled}" data-style-id="${style.id}" data-lb="${i}" title="限界突破 ${i}"></span>`;
    }
    return `<div class="lb-dots">${dots}</div>`;
}

// カードは「画像 + 情報（スタイル名・凸数・リリース日）」のみのシンプル構成。
// 所持チェックは画像左上のバッジで、それ以外の詳細情報（属性・ロール・ガシャ名等）は
// カードには出さない。
function styleCardHtml(style) {
    const imgSrc = styleImageUrl(style.characterName, style.styleName);
    const rarityClass = 'rarity-' + (style.rarityRank || '').toLowerCase();

    return `
        <div class="style-card style-catalog-card ${rarityClass} ${style.owned ? 'owned' : ''}" data-style-id="${style.id}">
            <div class="style-portrait">
                <img src="${imgSrc}" alt="${style.styleName}" onerror="this.replaceWith(Object.assign(document.createElement('div'), {className: 'avatar-placeholder', textContent: '${style.characterName.charAt(0)}'}))">
                ${style.rarityRank ? `<span class="rarity-badge ${rarityClass}">${style.rarityRank}</span>` : ''}
                <label class="owned-badge" title="所持している">
                    <input type="checkbox" class="owned-checkbox" data-style-id="${style.id}" ${style.owned ? 'checked' : ''}>
                    <span class="owned-badge-mark">✓</span>
                </label>
            </div>
            <div class="style-info">
                <h4 class="style-name" title="${style.styleName}">${style.styleName}</h4>
                <div class="style-quickmeta">
                    <span class="style-release-date">${style.releaseDate || '-'}</span>
                    <span class="style-lb-count">凸 ${style.limitBreak}/${MAX_LIMIT_BREAK}</span>
                </div>
                ${limitBreakDotsHtml(style)}
            </div>
        </div>
    `;
}

function applyStyleFilters() {
    const keyword = (document.getElementById('style-search')?.value || '').trim();
    const rarityFilter = document.getElementById('style-rarity-filter')?.value || 'all';
    const ownedFilter = document.getElementById('style-owned-filter')?.value || 'all';

    let filtered = stylesCache.filter((s) =>
        s.characterName.includes(keyword) || s.styleName.includes(keyword)
    );

    if (rarityFilter !== 'all') {
        filtered = filtered.filter((s) => s.rarityRank === rarityFilter);
    }
    if (ownedFilter === 'owned') {
        filtered = filtered.filter((s) => s.owned);
    } else if (ownedFilter === 'unowned') {
        filtered = filtered.filter((s) => !s.owned);
    }

    renderStyles(filtered);
}

function renderStyles(styles) {
    const grid = document.getElementById('style-grid');
    const summary = document.getElementById('style-summary');
    if (!grid) return;

    const ownedCount = stylesCache.filter((s) => s.owned).length;

    if (summary) {
        summary.innerHTML = `
            <span>🎴 スタイル数 ${stylesCache.length}</span>
            <span>✅ 所持 ${ownedCount}/${stylesCache.length}</span>
        `;
    }

    grid.innerHTML = styles.length
        ? styles.map(styleCardHtml).join('')
        : '<p class="empty-message">該当するスタイルがありません</p>';

    grid.querySelectorAll('.owned-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', (e) => {
            const styleId = checkbox.getAttribute('data-style-id');
            handleProgressUpdate(styleId, { owned: e.target.checked });
        });
    });

    grid.querySelectorAll('.lb-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
            const styleId = dot.getAttribute('data-style-id');
            const clickedValue = Number(dot.getAttribute('data-lb'));
            const style = stylesCache.find((s) => s.id === styleId);
            // 同じ凸数の●をもう一度押すと0に戻す（トグル）
            const nextValue = style && style.limitBreak === clickedValue ? clickedValue - 1 : clickedValue;
            handleProgressUpdate(styleId, { limitBreak: nextValue });
        });
    });
}

async function handleProgressUpdate(styleId, payload) {
    try {
        await fetchJson(`/api/styles/${styleId}/progress`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        await refreshAll();
    } catch (err) {
        alert('更新に失敗しました: ' + err.message);
    }
}

// ---------- 初期化 ----------

function initCharacterFilters() {
    ['char-search', 'char-owned-filter'].forEach((id) => {
        document.getElementById(id)?.addEventListener('input', applyCharacterFilters);
        document.getElementById(id)?.addEventListener('change', applyCharacterFilters);
    });

    ['style-search', 'style-rarity-filter', 'style-owned-filter'].forEach((id) => {
        document.getElementById(id)?.addEventListener('input', applyStyleFilters);
        document.getElementById(id)?.addEventListener('change', applyStyleFilters);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initCharacterFilters();
    try {
        await refreshAll();
    } catch (err) {
        const grid = document.getElementById('character-grid');
        if (grid) {
            grid.innerHTML = `<p class="empty-message">データの読み込みに失敗しました: ${err.message}<br>APIサーバー（uvicorn）が起動しているか確認してください。</p>`;
        }
    }
});
