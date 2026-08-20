// ============================================================
// React Native (Expo) 版
// 依存: expo-linear-gradient
//
// 注意: 「メインストーリー」「イベント」「スタイル管理」等の gameData は
// すべてサンプル（架空）データです。script.js と内容が重複しているため、
// 共通モジュールへの切り出しを推奨します（例: data/gameData.js）。
//
// 「キャラクター一覧」「スタイル図鑑」タブのみ、Web版と同じバックエンドAPI
// （backend/app/main.py）から data/characters.csv 由来の実データを取得する。
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  Image,
  Modal,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// バックエンド(FastAPI)のアドレス。
// - iOSシミュレータ / Web(w) : localhost でOK
// - Androidエミュレータ      : 10.0.2.2 が実機のlocalhostを指すエイリアス
// - 実機(Expo Goアプリ)      : スマホからは localhost に届かないので、
//                              PCのLAN IP (例: http://192.168.1.10:8000) に書き換える
const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

const MAX_LIMIT_BREAK = 5;

function characterImageUrl(characterName) {
  return `${API_BASE_URL}/images/characters/${encodeURIComponent(characterName)}.png`;
}

function styleImageUrl(characterName, styleName) {
  return `${API_BASE_URL}/images/styles/${encodeURIComponent(characterName + '_' + styleName)}.png`;
}

function rarityColor(rank) {
  if (rank === 'SS') return '#ffd700';
  if (rank === 'S') return '#c0c0c0';
  if (rank === 'A') return '#cd7f32';
  return '#AD2155';
}

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
    { id: 'chapter5_3', name: '第5章 後編 (未実装)', completed: false },
  ],
  events: [
    { id: 'event_sample_1', name: 'サンプルイベント1', type: 'seasonal', completed: true },
    { id: 'event_sample_2', name: 'サンプルイベント2', type: 'story', completed: true },
    { id: 'event_sample_3', name: 'サンプルイベント3', type: 'story', completed: false },
    { id: 'collab_sample_1', name: 'サンプルコラボ1', type: 'collaboration', completed: true },
    { id: 'collab_sample_2', name: 'サンプルコラボ2', type: 'collaboration', completed: false },
  ],
  styles: [
    { id: 'style_sample_1', character: 'キャラA', name: '【サンプル】キャラA', rarity: 'SS', lb: 3, maxLb: 3, completed: true },
    { id: 'style_sample_2', character: 'キャラB', name: '【サンプル】キャラB', rarity: 'SS', lb: 1, maxLb: 3, completed: false },
    { id: 'style_sample_3', character: 'キャラC', name: '【サンプル】キャラC', rarity: 'S', lb: 3, maxLb: 3, completed: true },
    { id: 'style_sample_4', character: 'キャラD', name: '【サンプル】キャラD', rarity: 'SS', lb: 0, maxLb: 3, completed: false },
    { id: 'style_sample_5', character: 'キャラE', name: '【サンプル】キャラE', rarity: 'S', lb: 2, maxLb: 3, completed: false },
  ],
  interactions: [
    { id: 'interaction_sample_1', character: 'キャラA', name: 'キャラA - 交流エピソード', completed: true },
    { id: 'interaction_sample_2', character: 'キャラB', name: 'キャラB - 交流エピソード', completed: true },
    { id: 'interaction_sample_3', character: 'キャラC', name: 'キャラC - 交流エピソード', completed: false },
    { id: 'interaction_sample_4', character: 'キャラD', name: 'キャラD - 交流エピソード', completed: false },
  ],
  memories: [
    { id: 'memory_sample_1', character: 'キャラA', name: 'キャラA - 記憶修復', completed: true },
    { id: 'memory_sample_2', character: 'キャラB', name: 'キャラB - 記憶修復', completed: false },
    { id: 'memory_sample_3', character: 'キャラC', name: 'キャラC - 記憶修復', completed: false },
  ],
  badges: [
    { id: 'badge_sample_1', name: 'サンプルバッジ1', category: 'story', completed: true },
    { id: 'badge_sample_2', name: 'サンプルバッジ2', category: 'story', completed: false },
    { id: 'badge_sample_3', name: 'サンプルバッジ3', category: 'battle', completed: false },
    { id: 'badge_sample_4', name: 'サンプルバッジ4', category: 'collection', completed: false },
  ],
  battles: [
    { id: 'live_sample_1', name: 'サンプル楽曲1', type: 'live', completed: true },
    { id: 'live_sample_2', name: 'サンプル楽曲2', type: 'live', completed: true },
    { id: 'live_sample_3', name: 'サンプル楽曲3', type: 'live', completed: false },
    { id: 'arena_sample_1', name: 'アリーナ - サンプル', type: 'arena', completed: true },
    { id: 'dungeon_sample_1', name: 'ダンジョン - サンプル', type: 'dungeon', completed: false },
  ],
};

const tabs = [
  { id: 'dashboard', name: 'ダッシュボード', icon: '📊' },
  { id: 'characters', name: 'キャラクター一覧', icon: '👤' },
  { id: 'style-catalog', name: 'スタイル図鑑', icon: '🎴' },
  { id: 'main-story', name: 'メインストーリー', icon: '📖' },
  { id: 'events', name: 'イベント', icon: '🎭' },
  { id: 'interactions', name: '交流・メモリー', icon: '💖' },
  { id: 'styles', name: 'スタイル管理', icon: '💫' },
  { id: 'badges', name: '称号バッジ', icon: '🏅' },
  { id: 'battles', name: 'ライブ・バトル', icon: '🎵' },
];

// 画像URLの読み込みに失敗したら頭文字アイコンにフォールバックする
const CardImage = ({ uri, label, style }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !uri) {
    return (
      <View style={[style, cardStyles.avatarPlaceholder]}>
        <Text style={cardStyles.avatarPlaceholderText}>{label ? label.charAt(0) : '?'}</Text>
      </View>
    );
  }

  return <Image source={{ uri }} style={style} onError={() => setFailed(true)} />;
};

const Tag = ({ text }) => (
  <View style={cardStyles.tag}>
    <Text style={cardStyles.tagText}>{text}</Text>
  </View>
);

const OwnedCheckbox = ({ owned, onPress }) => (
  <TouchableOpacity style={cardStyles.ownedRow} onPress={onPress}>
    <View style={[cardStyles.checkbox, owned && cardStyles.checkboxChecked]}>
      {owned && <Text style={cardStyles.checkmark}>✓</Text>}
    </View>
    <Text style={cardStyles.ownedLabel}>所持している</Text>
  </TouchableOpacity>
);

const LimitBreakDots = ({ limitBreak, onSetLimitBreak }) => (
  <View style={cardStyles.lbRow}>
    <Text style={cardStyles.lbLabel}>凸 {limitBreak}/{MAX_LIMIT_BREAK}</Text>
    <View style={cardStyles.lbDots}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onSetLimitBreak(limitBreak === n ? n - 1 : n)}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <View style={[cardStyles.lbDot, n <= limitBreak && cardStyles.lbDotFilled]} />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// キャラクター一覧のカード
const CharacterCard = ({ character, onPress }) => {
  const pct = character.styleCount > 0
    ? Math.round((character.ownedCount / character.styleCount) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[cardStyles.characterCard, character.fullyOwned && cardStyles.fullyOwnedCard]}
      onPress={() => onPress(character)}
      activeOpacity={0.85}
    >
      <CardImage
        uri={characterImageUrl(character.name)}
        label={character.name}
        style={cardStyles.characterPortrait}
      />
      <Text style={cardStyles.characterName} numberOfLines={1}>{character.name}</Text>
      <View style={cardStyles.miniProgressBar}>
        <View style={[cardStyles.miniProgressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={cardStyles.characterMeta}>
        所持 {character.ownedCount}/{character.styleCount}　凸合計 {character.totalLimitBreak}/{character.maxLimitBreak}
      </Text>
    </TouchableOpacity>
  );
};

// スタイル図鑑のカード（画像+名前タップで詳細、チェックボックスはカード内で直接トグル）
const StyleCard = ({ style, onPress, onToggleOwned, onSetLimitBreak }) => (
  <View style={[cardStyles.styleCard, style.owned && cardStyles.ownedStyleCard]}>
    <TouchableOpacity onPress={() => onPress(style)} activeOpacity={0.85}>
      <View>
        <CardImage
          uri={styleImageUrl(style.characterName, style.styleName)}
          label={style.characterName}
          style={cardStyles.stylePortrait}
        />
        {!!style.rarityRank && (
          <View style={[cardStyles.rarityBadge, { borderColor: rarityColor(style.rarityRank) }]}>
            <Text style={[cardStyles.rarityBadgeText, { color: rarityColor(style.rarityRank) }]}>
              {style.rarityRank}
            </Text>
          </View>
        )}
      </View>
      <View style={cardStyles.styleInfo}>
        <Text style={cardStyles.styleName} numberOfLines={1}>{style.styleName}</Text>
        <Text style={cardStyles.styleCharacterName} numberOfLines={1}>{style.characterName}</Text>
      </View>
    </TouchableOpacity>

    <OwnedCheckbox owned={style.owned} onPress={() => onToggleOwned(style)} />
    <LimitBreakDots
      limitBreak={style.limitBreak}
      onSetLimitBreak={(n) => onSetLimitBreak(style, n)}
    />
  </View>
);

// スタイル詳細モーダル
const StyleDetailModal = ({ style, visible, onClose, onToggleOwned, onSetLimitBreak }) => {
  if (!style) return null;

  const attrs = [style.mainAttribute, style.subAttribute].filter(Boolean).join(' / ');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <CardImage
              uri={styleImageUrl(style.characterName, style.styleName)}
              label={style.characterName}
              style={modalStyles.heroImage}
            />
            <Text style={modalStyles.title}>{style.styleName}</Text>
            <Text style={modalStyles.subtitle}>{style.characterName}</Text>

            <View style={cardStyles.tagRow}>
              {!!style.role && <Tag text={style.role} />}
              {!!attrs && <Tag text={attrs} />}
              {!!style.unison && <Tag text="ユニゾン" />}
              {!!style.newOrRerun && <Tag text={style.newOrRerun} />}
            </View>

            <Text style={modalStyles.metaLine}>
              {style.releaseDate || '-'}{style.gachaName ? ` ・ ${style.gachaName}` : ''}
            </Text>

            {!!style.notes && <Text style={modalStyles.notes}>📝 {style.notes}</Text>}

            <OwnedCheckbox owned={style.owned} onPress={() => onToggleOwned(style)} />
            <LimitBreakDots
              limitBreak={style.limitBreak}
              onSetLimitBreak={(n) => onSetLimitBreak(style, n)}
            />

            {style.referenceLinks.map((url) => (
              <TouchableOpacity key={url} onPress={() => Linking.openURL(url)}>
                <Text style={modalStyles.link}>公式投稿を見る ↗</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// キャラクター詳細モーダル（所持スタイル一覧。行タップでスタイル詳細へドリルダウン）
const CharacterDetailModal = ({ character, visible, onClose, onToggleOwned, onSetLimitBreak, onSelectStyle }) => {
  if (!character) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <CardImage
              uri={characterImageUrl(character.name)}
              label={character.name}
              style={modalStyles.heroImageRound}
            />
            <Text style={modalStyles.title}>{character.name}</Text>
            <Text style={modalStyles.metaLine}>
              所持 {character.ownedCount}/{character.styleCount} スタイル　凸合計 {character.totalLimitBreak}/{character.maxLimitBreak}
            </Text>

            {character.styles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={modalStyles.styleRow}
                onPress={() => onSelectStyle(style)}
                activeOpacity={0.8}
              >
                <CardImage
                  uri={styleImageUrl(style.characterName, style.styleName)}
                  label={style.characterName}
                  style={modalStyles.styleRowImage}
                />
                <View style={modalStyles.styleRowInfo}>
                  <Text style={modalStyles.styleRowName} numberOfLines={1}>{style.styleName}</Text>
                  <Text style={modalStyles.styleRowMeta}>凸 {style.limitBreak}/{MAX_LIMIT_BREAK}</Text>
                </View>
                <TouchableOpacity
                  style={[cardStyles.checkbox, style.owned && cardStyles.checkboxChecked]}
                  onPress={() => onToggleOwned(style)}
                >
                  {style.owned && <Text style={cardStyles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
            <Text style={modalStyles.closeButtonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// プログレスバーコンポーネント
const ProgressBar = ({ progress, title, subtitle }) => {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.progressCard}>
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,240,248,0.9)']}
        style={styles.progressCardGradient}
      >
        <Text style={styles.progressTitle}>{title}</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.progressText}>
          <Text style={styles.progressSubtitle}>{subtitle}</Text>
          <Text style={styles.progressPercentage}>{progress}%</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// チェックリストアイテムコンポーネント
const ChecklistItem = ({ item, onToggle }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle(item.id);
  };

  return (
    <Animated.View style={[styles.checklistItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.checklistItemInner, item.completed && styles.checklistItemCompleted]}
        onPress={handlePress}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// メインアプリコンポーネント
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(gameData);

  // キャラクター一覧・スタイル図鑑（CSV/API連携）
  const [characters, setCharacters] = useState([]);
  const [stylesList, setStylesList] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [selectedStyleId, setSelectedStyleId] = useState(null);

  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
      const [charsRes, stylesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/characters`),
        fetch(`${API_BASE_URL}/api/styles`),
      ]);
      if (!charsRes.ok || !stylesRes.ok) {
        throw new Error(`APIの取得に失敗しました (characters: ${charsRes.status}, styles: ${stylesRes.status})`);
      }
      setCharacters(await charsRes.json());
      setStylesList(await stylesRes.json());
      setCatalogError(null);
    } catch (err) {
      setCatalogError(
        `${err.message}\n\nバックエンド(uvicorn)が起動しているか、API_BASE_URL(${API_BASE_URL})が正しいか確認してください。`
      );
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const updateStyleProgress = useCallback(async (styleId, payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/styles/${styleId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ? JSON.stringify(body.detail) : `更新に失敗しました (${res.status})`);
      }
      await fetchCatalog();
    } catch (err) {
      Alert.alert('更新に失敗しました', err.message || String(err));
    }
  }, [fetchCatalog]);

  const handleToggleOwned = (style) => updateStyleProgress(style.id, { owned: !style.owned });
  const handleSetLimitBreak = (style, n) => updateStyleProgress(style.id, { limitBreak: n });

  const selectedCharacter = characters.find((c) => c.id === selectedCharacterId) || null;
  const selectedStyle = stylesList.find((s) => s.id === selectedStyleId) || null;

  const toggleItem = (itemId) => {
    setData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((category) => {
        next[category] = next[category].map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
      });
      return next;
    });
  };

  const calculateProgress = (category) => {
    const items = data[category] || [];
    const completed = items.filter((item) => item.completed).length;
    return items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
  };

  const countText = (category) =>
    `${data[category].filter((i) => i.completed).length}/${data[category].length}`;

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.dashboardGrid}>
        <ProgressBar
          progress={calculateProgress('mainStory')}
          title="🏛️ メインストーリー"
          subtitle={`${countText('mainStory')} 完了`}
        />
        <ProgressBar
          progress={calculateProgress('events')}
          title="🎭 イベントストーリー"
          subtitle={`${countText('events')} 完了`}
        />
        <ProgressBar
          progress={calculateProgress('styles')}
          title="💫 スタイルコレクション"
          subtitle={`${countText('styles')} 管理済み`}
        />
        <ProgressBar
          progress={calculateProgress('badges')}
          title="🏅 称号バッジ"
          subtitle={`${countText('badges')} 取得`}
        />
        <ProgressBar
          progress={calculateProgress('interactions')}
          title="💖 キャラクター交流"
          subtitle={`${countText('interactions')} 完了`}
        />
        <ProgressBar
          progress={calculateProgress('battles')}
          title="🎵 ライブ・バトル"
          subtitle={`${countText('battles')} クリア`}
        />
      </View>
    </ScrollView>
  );

  const renderCatalogStatus = () => {
    if (catalogLoading) {
      return (
        <View style={cardStyles.statusBox}>
          <ActivityIndicator color="#AD2155" />
          <Text style={cardStyles.statusText}>読み込み中...</Text>
        </View>
      );
    }
    if (catalogError) {
      return (
        <View style={cardStyles.statusBox}>
          <Text style={cardStyles.statusErrorText}>{catalogError}</Text>
          <TouchableOpacity style={cardStyles.retryButton} onPress={fetchCatalog}>
            <Text style={cardStyles.retryButtonText}>再読み込み</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderCharacterList = () => (
    <ScrollView style={styles.tabContent}>
      <View style={cardStyles.headerRow}>
        <Text style={styles.sectionTitle}>👤 キャラクター一覧</Text>
        <TouchableOpacity onPress={fetchCatalog}>
          <Text style={cardStyles.refreshText}>⟳ 更新</Text>
        </TouchableOpacity>
      </View>
      {renderCatalogStatus()}
      <View style={cardStyles.grid}>
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} onPress={(c) => setSelectedCharacterId(c.id)} />
        ))}
      </View>
    </ScrollView>
  );

  const renderStyleCatalog = () => (
    <ScrollView style={styles.tabContent}>
      <View style={cardStyles.headerRow}>
        <Text style={styles.sectionTitle}>🎴 スタイル図鑑</Text>
        <TouchableOpacity onPress={fetchCatalog}>
          <Text style={cardStyles.refreshText}>⟳ 更新</Text>
        </TouchableOpacity>
      </View>
      {renderCatalogStatus()}
      <View style={cardStyles.grid}>
        {stylesList.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            onPress={(s) => setSelectedStyleId(s.id)}
            onToggleOwned={handleToggleOwned}
            onSetLimitBreak={handleSetLimitBreak}
          />
        ))}
      </View>
    </ScrollView>
  );

  const renderChecklist = (category, title) => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.checklistSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data[category].map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={toggleItem} />
        ))}
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'characters':
        return renderCharacterList();
      case 'style-catalog':
        return renderStyleCatalog();
      case 'main-story':
        return renderChecklist('mainStory', '📖 メインストーリー進行状況');
      case 'events':
        return renderChecklist('events', '🎪 イベントストーリー');
      case 'interactions':
        return (
          <ScrollView style={styles.tabContent}>
            <View style={styles.checklistSection}>
              <Text style={styles.sectionTitle}>💕 キャラクター交流</Text>
              {data.interactions.map((item) => (
                <ChecklistItem key={item.id} item={item} onToggle={toggleItem} />
              ))}
            </View>
            <View style={styles.checklistSection}>
              <Text style={styles.sectionTitle}>🧠 メモリーストーリー</Text>
              {data.memories.map((item) => (
                <ChecklistItem key={item.id} item={item} onToggle={toggleItem} />
              ))}
            </View>
          </ScrollView>
        );
      case 'styles':
        return renderChecklist('styles', '⭐ スタイル管理');
      case 'badges':
        return renderChecklist('badges', '🏆 称号バッジ');
      case 'battles':
        return renderChecklist('battles', '🎵 ライブ・バトル');
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ffffff', '#ffe0ec', '#ffc0d9']} style={styles.background}>
        <LinearGradient
          colors={['rgba(173,33,85,0.9)', 'rgba(255,105,180,0.8)']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>HEAVEN BURNS RED</Text>
          <Text style={styles.headerSubtitle}>PROGRESS TRACKER</Text>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContainerContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.mainContent}>{renderTabContent()}</View>

        <CharacterDetailModal
          character={selectedCharacter}
          visible={!!selectedCharacter}
          onClose={() => setSelectedCharacterId(null)}
          onToggleOwned={handleToggleOwned}
          onSetLimitBreak={handleSetLimitBreak}
          onSelectStyle={(style) => {
            setSelectedCharacterId(null);
            setSelectedStyleId(style.id);
          }}
        />
        <StyleDetailModal
          style={selectedStyle}
          visible={!!selectedStyle}
          onClose={() => setSelectedStyleId(null)}
          onToggleOwned={handleToggleOwned}
          onSetLimitBreak={handleSetLimitBreak}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#AD2155',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(173,33,85,0.2)',
    flexGrow: 0,
  },
  tabContainerContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tab: {
    backgroundColor: 'rgba(173,33,85,0.1)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#AD2155',
    alignItems: 'center',
    minWidth: 80,
  },
  tabActive: {
    backgroundColor: '#AD2155',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    color: '#AD2155',
    fontWeight: '700',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  mainContent: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    width: width * 0.45,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#AD2155',
  },
  progressCardGradient: {
    padding: 15,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#AD2155',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(173,33,85,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#AD2155',
    borderRadius: 4,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtitle: {
    fontSize: 11,
    color: '#AD2155',
    opacity: 0.8,
  },
  progressPercentage: {
    fontSize: 11,
    color: '#AD2155',
    fontWeight: '700',
  },
  checklistSection: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#AD2155',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#AD2155',
    textAlign: 'center',
  },
  checklistItem: {
    marginBottom: 8,
  },
  checklistItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
  },
  checklistItemCompleted: {
    backgroundColor: 'rgba(173,33,85,0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#AD2155',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#AD2155',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#AD2155',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checklistText: {
    flex: 1,
    fontSize: 14,
    color: '#AD2155',
  },
  checklistTextCompleted: {
    opacity: 0.8,
  },
});

const cardStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshText: {
    color: '#AD2155',
    fontWeight: '700',
    fontSize: 13,
  },
  statusBox: {
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    color: '#AD2155',
    marginTop: 8,
  },
  statusErrorText: {
    color: '#AD2155',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#AD2155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarPlaceholder: {
    backgroundColor: '#AD2155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
  },
  // キャラクターカード
  characterCard: {
    width: width * 0.45,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#AD2155',
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 10,
    alignItems: 'center',
  },
  fullyOwnedCard: {
    borderColor: '#ffd700',
    borderWidth: 2,
  },
  characterPortrait: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  characterName: {
    fontWeight: '700',
    color: '#AD2155',
    marginBottom: 6,
  },
  miniProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(173,33,85,0.2)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#AD2155',
  },
  characterMeta: {
    fontSize: 11,
    color: '#AD2155',
    opacity: 0.8,
    textAlign: 'center',
  },
  // スタイルカード
  styleCard: {
    width: width * 0.45,
    marginBottom: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#AD2155',
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  ownedStyleCard: {
    borderWidth: 2,
    borderColor: '#ff69b4',
  },
  stylePortrait: {
    width: '100%',
    height: 110,
  },
  rarityBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rarityBadgeText: {
    fontWeight: '900',
    fontSize: 11,
  },
  styleInfo: {
    padding: 8,
    paddingBottom: 4,
  },
  styleName: {
    fontWeight: '700',
    color: '#AD2155',
    fontSize: 13,
  },
  styleCharacterName: {
    fontSize: 11,
    color: '#AD2155',
    opacity: 0.8,
  },
  ownedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  ownedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AD2155',
  },
  lbRow: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  lbLabel: {
    fontSize: 11,
    color: '#AD2155',
    fontWeight: '700',
    marginBottom: 4,
  },
  lbDots: {
    flexDirection: 'row',
  },
  lbDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#AD2155',
    marginRight: 6,
  },
  lbDotFilled: {
    backgroundColor: '#AD2155',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: 'rgba(173,33,85,0.4)',
    backgroundColor: 'rgba(173,33,85,0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#AD2155',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff5f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 12,
  },
  heroImageRound: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#AD2155',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#AD2155',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  metaLine: {
    fontSize: 12,
    color: '#AD2155',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  notes: {
    fontSize: 13,
    color: '#AD2155',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  link: {
    color: '#AD2155',
    fontWeight: '700',
    marginTop: 8,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#AD2155',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  styleRowImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 10,
  },
  styleRowInfo: {
    flex: 1,
  },
  styleRowName: {
    fontWeight: '700',
    color: '#AD2155',
    fontSize: 13,
  },
  styleRowMeta: {
    fontSize: 11,
    color: '#AD2155',
    opacity: 0.8,
  },
});
