// ============================================================
// React Native (Expo) 版
// 依存: expo-linear-gradient
//
// 注意: gameData はすべてサンプル（架空）データです。
// script.js と内容が重複しているため、共通モジュールへの
// 切り出しを推奨します（例: data/gameData.js）。
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  { id: 'main-story', name: 'メインストーリー', icon: '📖' },
  { id: 'events', name: 'イベント', icon: '🎭' },
  { id: 'interactions', name: '交流・メモリー', icon: '💖' },
  { id: 'styles', name: 'スタイル管理', icon: '💫' },
  { id: 'badges', name: '称号バッジ', icon: '🏅' },
  { id: 'battles', name: 'ライブ・バトル', icon: '🎵' },
];

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
    marginBottom: 15,
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
