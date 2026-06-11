import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WORKOUT_PLAN } from '../data/workouts';
import { DIET_PLAN, DAILY_TARGETS } from '../data/diet';
import { getDayLog, calculateStreak, getSettings, getProgress } from '../utils/storage';
import { DayLog } from '../types';

const { width } = Dimensions.get('window');
const TODAY = new Date().toISOString().split('T')[0];
const DAY_INDEX = new Date().getDay(); // 0=Sun
const DAY_MAP = [6, 0, 1, 2, 3, 4, 5]; // Sun→index 6, Mon→0, etc.
const ACTUAL_DAY = DAY_MAP[DAY_INDEX];

export default function DashboardScreen({ navigation }: any) {
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [streak, setStreak] = useState(0);
  const [settings, setSettings] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const log = await getDayLog(TODAY);
    const s = await calculateStreak();
    const sett = await getSettings();
    setDayLog(log);
    setStreak(s);
    setSettings(sett);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', loadData);
    return unsub;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const todayWorkout = WORKOUT_PLAN.days[ACTUAL_DAY];
  const completedExercises = dayLog
    ? Object.values(dayLog.exercises).filter(e => e.completed).length
    : 0;
  const totalExercises = todayWorkout.exercises.length;
  const workoutPct = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  const completedMeals = dayLog ? Object.values(dayLog.meals).filter(Boolean).length : 0;
  const totalMeals = DIET_PLAN.length;
  const mealPct = Math.round((completedMeals / totalMeals) * 100);

  const steps = dayLog?.steps || 0;
  const stepGoal = settings.stepGoal || 6000;
  const stepPct = Math.min(100, Math.round((steps / stepGoal) * 100));

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hey, {settings.name || 'Suyesh'} 👋</Text>
          <Text style={s.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          style={s.streakBadge}
          onPress={() => navigation.navigate('progress')}
        >
          <Text style={s.streakFire}>🔥</Text>
          <Text style={s.streakNum}>{streak}</Text>
        </TouchableOpacity>
      </View>

      {/* Streak Card */}
      <View style={s.streakCard}>
        <Text style={s.streakCardTitle}>Current Streak</Text>
        <Text style={s.streakBig}>{streak}</Text>
        <Text style={s.streakDays}>consecutive days</Text>
        <Text style={s.streakMsg}>
          {streak === 0 ? "Start today! Every journey begins with one step." :
           streak < 7 ? "Keep going! You're building the habit." :
           streak < 30 ? "Strong! You're forming a real routine." :
           "Unstoppable! 💪"}
        </Text>
      </View>

      {/* Today's Stats */}
      <Text style={s.sectionTitle}>Today's Progress</Text>
      <View style={s.statsRow}>
        <TouchableOpacity style={s.statCard} onPress={() => navigation.navigate('workout')}>
          <View style={[s.statRing, { borderColor: '#f97316' }]}>
            <Text style={[s.statPct, { color: '#f97316' }]}>{workoutPct}%</Text>
          </View>
          <Text style={s.statLabel}>Workout</Text>
          <Text style={s.statDetail}>{completedExercises}/{totalExercises}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.statCard} onPress={() => navigation.navigate('diet')}>
          <View style={[s.statRing, { borderColor: '#22c55e' }]}>
            <Text style={[s.statPct, { color: '#22c55e' }]}>{mealPct}%</Text>
          </View>
          <Text style={s.statLabel}>Diet</Text>
          <Text style={s.statDetail}>{completedMeals}/{totalMeals}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.statCard} onPress={() => navigation.navigate('progress')}>
          <View style={[s.statRing, { borderColor: '#3b82f6' }]}>
            <Text style={[s.statPct, { color: '#3b82f6' }]}>{stepPct}%</Text>
          </View>
          <Text style={s.statLabel}>Steps</Text>
          <Text style={s.statDetail}>{steps.toLocaleString()}</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Workout Preview */}
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('workout')}
      >
        <View style={s.cardHeader}>
          <View style={[s.dayDot, { backgroundColor: todayWorkout.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{todayWorkout.name}</Text>
            <Text style={s.cardSubtitle}>{todayWorkout.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${workoutPct}%`, backgroundColor: '#f97316' }]} />
        </View>
        <Text style={s.cardDetail}>
          {completedExercises}/{totalExercises} exercises completed
        </Text>
        {todayWorkout.exercises.slice(0, 3).map(ex => {
          const done = dayLog?.exercises[ex.id]?.completed;
          return (
            <View key={ex.id} style={s.exPreview}>
              <Ionicons
                name={done ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={done ? '#22c55e' : '#555'}
              />
              <Text style={[s.exPreviewText, done && { color: '#666', textDecorationLine: 'line-through' }]}>
                {ex.name}
              </Text>
              <Text style={s.exPreviewSets}>{ex.sets}×{ex.reps}</Text>
            </View>
          );
        })}
        {todayWorkout.exercises.length > 3 && (
          <Text style={s.moreExercises}>+{todayWorkout.exercises.length - 3} more exercises</Text>
        )}
      </TouchableOpacity>

      {/* Today's Diet Preview */}
      <TouchableOpacity
        style={s.card}
        onPress={() => navigation.navigate('diet')}
      >
        <View style={s.cardHeader}>
          <Ionicons name="restaurant" size={20} color="#22c55e" />
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>Diet Plan</Text>
            <Text style={s.cardSubtitle}>Hit your protein target: {DAILY_TARGETS.protein}g</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${mealPct}%`, backgroundColor: '#22c55e' }]} />
        </View>
        <Text style={s.cardDetail}>
          {completedMeals}/{totalMeals} meals logged
        </Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsRow}>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('progress')}>
          <Ionicons name="scale" size={24} color="#a855f7" />
          <Text style={s.actionText}>Log Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('workout')}>
          <Ionicons name="barbell" size={24} color="#f97316" />
          <Text style={s.actionText}>Start Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('settings')}>
          <Ionicons name="settings" size={24} color="#6b7280" />
          <Text style={s.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#f5f5f5' },
  date: { fontSize: 14, color: '#999', marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#333' },
  streakFire: { fontSize: 20 },
  streakNum: { fontSize: 18, fontWeight: '700', color: '#f97316', marginLeft: 4 },

  streakCard: { backgroundColor: '#141414', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  streakCardTitle: { fontSize: 13, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  streakBig: { fontSize: 56, fontWeight: '800', color: '#f97316', marginVertical: 4 },
  streakDays: { fontSize: 14, color: '#666' },
  streakMsg: { fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center' },

  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#141414', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  statRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statPct: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  statDetail: { fontSize: 11, color: '#666', marginTop: 2 },

  card: { backgroundColor: '#141414', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dayDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#f5f5f5' },
  cardSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
  cardDetail: { fontSize: 12, color: '#666', marginTop: 8 },

  progressBar: { height: 4, backgroundColor: '#282828', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  exPreview: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  exPreviewText: { flex: 1, fontSize: 13, color: '#ccc' },
  exPreviewSets: { fontSize: 12, color: '#f97316', fontWeight: '500' },
  moreExercises: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: '#141414', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  actionText: { fontSize: 11, color: '#999', marginTop: 6, fontWeight: '500' },
});
