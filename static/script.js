// ============================================================
// 注意: 以下の gameData はすべてサンプル（架空）データです。
// スタイル名・イベント名・称号バッジ名・楽曲名・章の日数は
// 実際のゲーム内容と一致しません。実データに差し替えてください。
// ============================================================

const gameData = {
    mainStory: [
        { id: 'prologue', name: 'プロローグ (Day 1-7)', completed: true },
        { id: 'chapter1', name: '第1章 (Day 1-14)', completed: true },
        { id: 'chapter2', name: '第2章 (Day 1-16)', completed: true },
        { id: 'chapter3', name: '第3章 (Day 1-18)', completed: true },
        { id: 'chapter4_1', name: '第4章 前編 (Day 1-10)', completed: true },
        { id: 'chapter4_2', name: '第4章 後編 (Day 1-12)', completed: true },
        { id: 'chapter5_1', name: '第5章 前編 (Day 1-14)', completed: true },
        { id: 'chapter5_2', name: '第5章 中編 (Day 1-16)', completed: false },
        { id: 'chapter5_3', name: '第5章 後編 (未実装)', completed: false }
    ],
    events: [
        { id: 'event_sample_1', name: 'サンプルイベント1', type: 'seasonal', completed: true },
        { id: 'event_sample_2', name: 'サンプルイベント2', type: 'story', completed: true },
        { id: 'event_sample_3', name: 'サンプルイベント3', type: 'story', completed: false },
        { id: 'collab_sample_1', name: 'サンプルコラボ1', type: 'collaboration', completed: true },
        { id: 'collab_sample_2', name: 'サンプルコラボ2', type: 'collaboration', completed: false }
    ],
    styles: [
        { id: 'style_sample_1', character: 'キャラA', name: '【サンプル】キャラA', rarity: 'SS', lb: 3, maxLb: 3, completed: true },
        { id: 'style_sample_2', character: 'キャラB', name: '【サンプル】キャラB', rarity: 'SS', lb: 1, maxLb: 3, completed: false },
        { id: 'style_sample_3', character: 'キャラC', name: '【サンプル】キャラC', rarity: 'S', lb: 3, maxLb: 3, completed: true },
        { id: 'style_sample_4', character: 'キャラD', name: '【サンプル】キャラD', rarity: 'SS', lb: 0, maxLb: 3, completed: false },
        { id: 'style_sample_5', character: 'キャラE', name: '【サンプル】キャラE', rarity: 'S', lb: 2, maxLb: 3, completed: false }
    ],
    interactions: [
        { id: 'interaction_sample_1', character: 'キャラA', name: 'キャラA - 交流エピソード', completed: true },
        { id: 'interaction_sample_2', character: 'キャラB', name: 'キャラB - 交流エピソード', completed: true },
        { id: 'interaction_sample_3', character: 'キャラC', name: 'キャラC - 交流エピソード', completed: false },
        { id: 'interaction_sample_4', character: 'キャラD', name: 'キャラD - 交流エピソード', completed: false }
    ],
    memories: [
        { id: 'memory_sample_1', character: 'キャラA', name: 'キャラA - 記憶修復', completed: true },
        { id: 'memory_sample_2', character: 'キャラB', name: 'キャラB - 記憶修復', completed: false },
        { id: 'memory_sample_3', character: 'キャラC', name: 'キャラC - 記憶修復', completed: false }
    ],
    badges: [
        { id: 'badge_sample_1', name: 'サンプルバッジ1', category: 'story', completed: true },
        { id: 'badge_sample_2', name: 'サンプルバッジ2', category: 'story', completed: false },
        { id: 'badge_sample_3', name: 'サンプルバッジ3', category: 'battle', completed: false },
        { id: 'badge_sample_4', name: 'サンプルバッジ4', category: 'collection', completed: false }
    ],
    battles: [
        { id: 'live_sample_1', name: 'サンプル楽曲1', type: 'live', completed: true },
        { id: 'live_sample_2', name: 'サンプル楽曲2', type: 'live', completed: true },
        { id: 'live_sample_3', name: 'サンプル楽曲3', type: 'live', completed: false },
        { id: 'arena_sample_1', name: 'アリーナ - サンプル', type: 'arena', completed: true },
        { id: 'dungeon_sample_1', name: 'ダンジョン - サンプル', type: 'dungeon', completed: false }
    ]
};

// パーティクル生成
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// タブ切り替え
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            contents.forEach(function (c) { c.classList.remove('active'); });

            tab.classList.add('active');

            const targetTab = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetTab);

            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// チェックボックス機能
function initCheckboxes() {
    const checklistItems = document.querySelectorAll('.checklist-item');

    checklistItems.forEach(function (item) {
        item.addEventListener('click', function () {
            const checkbox = item.querySelector('.checkbox');

            if (checkbox.classList.contains('checked')) {
                checkbox.classList.remove('checked');
                item.classList.remove('completed');
            } else {
                checkbox.classList.add('checked');
                item.classList.add('completed');
                createCompletionEffect(item);
            }

            updateProgress();
        });
    });
}

// 動的コンテンツ生成
function generateContentFromData() {
    generateMainStory();
    generateEvents();
    generateInteractions();
    generateStyles();
    generateBadges();
    generateBattles();
}

function generateMainStory() {
    const container = document.querySelector('#main-story .checklist-section');
    const items = gameData.mainStory.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    container.innerHTML = '<div class="checklist-header"><h3>📖 メインストーリー進行状況</h3></div>' + items;
}

function generateEvents() {
    const container = document.getElementById('events');
    const seasonalEvents = gameData.events.filter(function (e) { return e.type === 'seasonal' || e.type === 'story'; });
    const collabEvents = gameData.events.filter(function (e) { return e.type === 'collaboration'; });

    const seasonalItems = seasonalEvents.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    const collabItems = collabEvents.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    container.innerHTML =
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>🎪 期間限定イベント</h3></div>' +
        seasonalItems +
        '</div>' +
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>🤝 コラボレーションイベント</h3></div>' +
        collabItems +
        '</div>';
}

function generateInteractions() {
    const container = document.getElementById('interactions');
    const interactionItems = gameData.interactions.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    const memoryItems = gameData.memories.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    container.innerHTML =
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>💕 キャラクター交流</h3></div>' +
        interactionItems +
        '</div>' +
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>🧠 メモリーストーリー</h3></div>' +
        memoryItems +
        '</div>';
}

function generateStyles() {
    const container = document.getElementById('styles');
    const ssStyles = gameData.styles.filter(function (s) { return s.rarity === 'SS'; });
    const sStyles = gameData.styles.filter(function (s) { return s.rarity === 'S'; });

    const ssItems = ssStyles.map(function (style) {
        const displayName = style.name + ' - 限界突破' + style.lb + '/' + style.maxLb;
        return createStyleItem(style.id, displayName, style.completed, style.rarity);
    }).join('');

    const sItems = sStyles.map(function (style) {
        const displayName = style.name + ' - 限界突破' + style.lb + '/' + style.maxLb;
        return createStyleItem(style.id, displayName, style.completed, style.rarity);
    }).join('');

    container.innerHTML =
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>⭐ SSスタイル</h3></div>' +
        ssItems +
        '</div>' +
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>🌟 Sスタイル</h3></div>' +
        sItems +
        '</div>';
}

function generateBadges() {
    const container = document.getElementById('badges');
    const storyBadges = gameData.badges.filter(function (b) { return b.category === 'story'; });
    const battleBadges = gameData.badges.filter(function (b) { return b.category === 'battle' || b.category === 'collection'; });

    const storyItems = storyBadges.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    const battleItems = battleBadges.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    container.innerHTML =
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>🏆 ストーリー系バッジ</h3></div>' +
        storyItems +
        '</div>' +
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>⚔️ 戦闘系バッジ</h3></div>' +
        battleItems +
        '</div>';
}

function generateBattles() {
    const container = document.getElementById('battles');
    const liveBattles = gameData.battles.filter(function (b) { return b.type === 'live'; });
    const otherBattles = gameData.battles.filter(function (b) { return b.type !== 'live'; });

    const liveItems = liveBattles.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    const otherItems = otherBattles.map(function (item) {
        return createChecklistItem(item.id, item.name, item.completed);
    }).join('');

    container.innerHTML =
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>🎵 ライブモード</h3></div>' +
        liveItems +
        '</div>' +
        '<div class="checklist-section">' +
        '<div class="checklist-header"><h3>⚔️ その他バトルコンテンツ</h3></div>' +
        otherItems +
        '</div>';
}

function createChecklistItem(id, name, completed) {
    const checkedClass = completed ? 'checked' : '';
    const completedClass = completed ? 'completed' : '';

    return '<div class="checklist-item ' + completedClass + '" data-id="' + id + '">' +
        '<div class="checkbox ' + checkedClass + '"></div>' +
        '<span>' + name + '</span>' +
        '</div>';
}

function createStyleItem(id, name, completed, rarity) {
    const checkedClass = completed ? 'checked' : '';
    const completedClass = completed ? 'completed' : '';
    const rarityClass = 'rarity-' + rarity.toLowerCase();

    return '<div class="style-card ' + rarityClass + '">' +
        '<div class="checklist-item ' + completedClass + '" data-id="' + id + '">' +
        '<div class="checkbox ' + checkedClass + '"></div>' +
        '<span>' + name + '</span>' +
        '</div>' +
        '</div>';
}

// 完了エフェクト
function createCompletionEffect(element) {
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.top = '50%';
    effect.style.left = '50%';
    effect.style.transform = 'translate(-50%, -50%)';
    effect.style.width = '20px';
    effect.style.height = '20px';
    effect.style.background = 'radial-gradient(circle, #AD2155, transparent)';
    effect.style.borderRadius = '50%';
    effect.style.animation = 'completionPulse 0.8s ease-out';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '1000';

    element.style.position = 'relative';
    element.appendChild(effect);

    setTimeout(function () {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 800);
}

// 進捗更新
function updateProgress() {
    const progressData = {
        'main-story': calculateTabProgress('main-story'),
        'events': calculateTabProgress('events'),
        'interactions': calculateTabProgress('interactions'),
        'styles': calculateTabProgress('styles'),
        'badges': calculateTabProgress('badges'),
        'battles': calculateTabProgress('battles')
    };

    updateDashboardProgress(progressData);
}

// タブごとの進捗計算
function calculateTabProgress(tabId) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return { completed: 0, total: 0, percentage: 0 };

    const allItems = tabContent.querySelectorAll('.checklist-item');
    const completedItems = tabContent.querySelectorAll('.checklist-item.completed');

    const total = allItems.length;
    const completed = completedItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed: completed, total: total, percentage: percentage };
}

// ダッシュボードのプログレスバー更新
// TODO: nth-child 依存をやめ、data-category 属性でのマッピングに変更する
function updateDashboardProgress(progressData) {
    const cardMappings = [
        {
            selector: '.progress-card:nth-child(1)',
            data: progressData['main-story'],
            format: function (data) { return data.completed + '/' + data.total + ' 完了'; }
        },
        {
            selector: '.progress-card:nth-child(2)',
            data: progressData['events'],
            format: function (data) { return data.completed + '/' + data.total + ' 完了'; }
        },
        {
            selector: '.progress-card:nth-child(3)',
            data: progressData['styles'],
            format: function (data) { return data.completed + '/' + data.total + ' 管理済み'; }
        },
        {
            selector: '.progress-card:nth-child(4)',
            data: progressData['badges'],
            format: function (data) { return data.completed + '/' + data.total + ' 取得'; }
        },
        {
            selector: '.progress-card:nth-child(5)',
            data: progressData['interactions'],
            format: function (data) { return data.completed + '/' + data.total + ' 完了'; }
        },
        {
            selector: '.progress-card:nth-child(6)',
            data: progressData['battles'],
            format: function (data) { return data.completed + '/' + data.total + ' クリア'; }
        }
    ];

    cardMappings.forEach(function (mapping) {
        const card = document.querySelector(mapping.selector);
        if (!card || !mapping.data) return;

        const progressFill = card.querySelector('.progress-fill');
        const progressTexts = card.querySelectorAll('.progress-text span');

        if (progressFill) {
            progressFill.style.width = mapping.data.percentage + '%';
        }

        if (progressTexts.length >= 2) {
            progressTexts[0].textContent = mapping.format(mapping.data);
            progressTexts[1].textContent = mapping.data.percentage + '%';
        }

        if (mapping.data.percentage === 100) {
            card.classList.add('completed-section');
            setTimeout(function () {
                card.classList.remove('completed-section');
            }, 2000);
        }
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    generateContentFromData();
    initTabs();
    initCheckboxes();
    updateProgress();
});

// ウィンドウリサイズ時のパーティクル再生成
window.addEventListener('resize', function () {
    const particlesContainer = document.getElementById('particles');
    particlesContainer.innerHTML = '';
    createParticles();
});
