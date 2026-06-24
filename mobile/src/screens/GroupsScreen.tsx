import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ScrollView, TextInput,
} from 'react-native';
import { useTheme } from '../theme/useTheme';

type C = ReturnType<typeof useTheme>['colors'];
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupsAPI, type Group } from '../services/api/groupsAPI';
import { FilterSheet, type FilterOption } from '../components/FilterSheet';
import { SkeletonCard } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { SearchIcon, FilterIcon } from '../components/icons';
import { formatCurrency } from '../utils/upi';

const CATEGORY: Record<string, { emoji: string; color: string }> = {
  home:   { emoji: '🏠', color: '#0EA5E9' },
  trip:   { emoji: '✈️', color: '#F59E0B' },
  couple: { emoji: '💑', color: '#EF4444' },
  work:   { emoji: '💼', color: '#64748B' },
  event:  { emoji: '📅', color: '#8B5CF6' },
  other:  { emoji: '🎉', color: '#1B4332' },
};

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All groups', value: 'all' },
  { label: 'Outstanding', value: 'outstanding' },
  { label: 'Settled', value: 'settled' },
];

const CATEGORY_PILLS = [
  { value: 'all', label: 'All', emoji: '📋' },
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'trip', label: 'Trip', emoji: '✈️' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'event', label: 'Event', emoji: '📅' },
  { value: 'other', label: 'Other', emoji: '🎉' },
];

function avatarInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function MemberDots({ count, color, s }: { count: number; color: string; s: ReturnType<typeof createStyles> }) {
  const dots = Math.min(count, 4);
  return (
    <View style={s.dots}>
      {Array.from({ length: dots }).map((_, i) => (
        <View key={i} style={[s.dot, { backgroundColor: color, marginLeft: i === 0 ? 0 : -8, zIndex: dots - i }]}>
          <Text style={s.dotText}>{String.fromCharCode(65 + i)}</Text>
        </View>
      ))}
      {count > 4 && (
        <View style={[s.dot, { backgroundColor: '#9CA3AF', marginLeft: -8 }]}>
          <Text style={s.dotText}>+{count - 4}</Text>
        </View>
      )}
    </View>
  );
}

export const GroupsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = createStyles(colors);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const { data: groups = [], isLoading, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsAPI.getGroups,
  });

  const filtered = useMemo(() => {
    let list = groups as Group[];
    const q = search.toLowerCase();
    if (q) list = list.filter((g) => g.name.toLowerCase().includes(q));
    if (filter === 'outstanding') list = list.filter((g) => Math.abs(g.your_balance) > 0.01);
    else if (filter === 'settled') list = list.filter((g) => Math.abs(g.your_balance) <= 0.01);
    if (categoryFilter !== 'all') list = list.filter((g) => g.category === categoryFilter);
    return list;
  }, [groups, search, filter, categoryFilter]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <View style={s.topBarSide} />
        <Text style={s.title}>Groups</Text>
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('CreateGroup')}>
          <Text style={s.iconBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <View style={s.searchIcon}>
            <SearchIcon color={colors.textMuted} size={18} />
          </View>
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search groups"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={[s.filterSquare, filter !== 'all' && s.filterSquareActive]}
          onPress={() => setShowFilter(true)}
          activeOpacity={0.8}
        >
          <FilterIcon color={filter !== 'all' ? '#1B4332' : colors.sectionLabel} size={20} />
          {filter !== 'all' && <View style={s.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsRow}>
        {CATEGORY_PILLS.map((pill) => (
          <TouchableOpacity
            key={pill.value}
            style={[s.pill, categoryFilter === pill.value && s.pillActive]}
            onPress={() => setCategoryFilter(pill.value)}
          >
            <Text style={s.pillEmoji}>{pill.emoji}</Text>
            <Text style={[s.pillLabel, categoryFilter === pill.value && s.pillLabelActive]}>{pill.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} height={80} />)}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#1B4332" />}
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon={search || filter !== 'all' || categoryFilter !== 'all' ? '🔍' : '🏝️'}
                title={search || filter !== 'all' || categoryFilter !== 'all' ? 'No results' : 'No groups yet'}
                subtitle="Create a group to start splitting with friends"
                actionLabel={!search && filter === 'all' && categoryFilter === 'all' ? 'Create group' : undefined}
                onAction={!search && filter === 'all' && categoryFilter === 'all' ? () => navigation.navigate('CreateGroup') : undefined}
              />
            ) : null
          }
          renderItem={({ item: g }) => {
            const cat = CATEGORY[g.category] ?? CATEGORY.other;
            const settled = Math.abs(g.your_balance) < 0.01;
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => navigation.navigate('GroupDetail', { groupId: g.id })}
                activeOpacity={0.8}
              >
                <View style={[s.catBadge, { backgroundColor: cat.color + '22' }]}>
                  <Text style={s.catEmoji}>{cat.emoji}</Text>
                </View>
                <View style={s.cardBody}>
                  <Text style={s.groupName}>{g.name}</Text>
                  <View style={s.cardMeta}>
                    <MemberDots count={g.member_count} color={cat.color} s={s} />
                    <Text style={s.memberCount}>{g.member_count} member{g.member_count !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                {settled ? (
                  <View style={s.settledChip}><Text style={s.settledText}>Settled</Text></View>
                ) : g.your_balance > 0 ? (
                  <View style={s.owedChip}><Text style={s.owedText}>+{formatCurrency(g.your_balance)}</Text></View>
                ) : (
                  <View style={s.oweChip}><Text style={s.oweText}>-{formatCurrency(Math.abs(g.your_balance))}</Text></View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter Groups"
        options={FILTER_OPTIONS}
        selected={filter}
        onSelect={setFilter}
      />
    </SafeAreaView>
  );
};

function createStyles(c: C) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 },
  topBarSide: { width: 38 },
  title: { fontSize: 22, fontWeight: '800', color: c.text, fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1B4332', alignItems: 'center', justifyContent: 'center', shadowColor: '#1B4332', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.24, shadowRadius: 10, elevation: 5 },
  iconBtnText: { color: '#FFFFFF', fontSize: 24, lineHeight: 26, fontWeight: '300' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginTop: 8, marginBottom: 12 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBg, borderRadius: 15, borderWidth: 1, borderColor: c.inputBorder, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: c.text },
  filterSquare: { width: 48, height: 46, borderRadius: 15, backgroundColor: c.inputBg, borderWidth: 1, borderColor: c.inputBorder, alignItems: 'center', justifyContent: 'center' },
  filterSquareActive: { backgroundColor: '#F0FDF4', borderColor: '#1B4332' },
  filterSquareText: { color: c.sectionLabel, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  filterSquareTextActive: { color: '#1B4332' },
  filterDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B35' },
  pillsRow: { paddingLeft: 20, marginBottom: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  pillActive: { backgroundColor: '#F0FDF4', borderColor: '#1B4332' },
  pillEmoji: { fontSize: 14 },
  pillLabel: { fontSize: 12, fontWeight: '600', color: c.textSub },
  pillLabelActive: { color: '#1B4332' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, padding: 14, marginBottom: 10, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  catBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  catEmoji: { fontSize: 22 },
  cardBody: { flex: 1 },
  groupName: { fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dots: { flexDirection: 'row' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: c.bg },
  dotText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  memberCount: { fontSize: 12, color: c.textSub },
  settledChip: { backgroundColor: c.pillBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  settledText: { fontSize: 11, fontWeight: '700', color: c.textSub },
  owedChip: { backgroundColor: '#F0FDF4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  owedText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  oweChip: { backgroundColor: '#FEF2F2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  oweText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: c.textSub, textAlign: 'center', maxWidth: 260, marginBottom: 24 },
  emptyBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  });
}
