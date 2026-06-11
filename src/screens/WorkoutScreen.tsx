import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WORKOUT_PLAN } from '../data/workouts';
import { getDayLog, saveDayLog } from '../utils/storage';
import { DayLog, ExerciseLog } from '../types';

const TODAY = new Date().toISOString().split('T')[0];
const DAY_INDEX = [6, 0, 1, 2, 3, 4, 5][new Date().getDay()];
const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function WorkoutScreen() {
  const [selectedDay, setSelectedDay] = useState(DAY_INDEX);
  const [dayLog, setDayLog] = useState<DayLog>({ date: TODAY, exercises: {}, meals: {}, steps: 0 });
  const [expandedEx, setExpandedEx] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const log = await getDayLog(TODAY);
    setDayLog(log);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleExercise = async (exId: string) => {
    const updated = { ...dayLog };
    const current = updated.exercises[exId] as ExerciseLog | undefined;
    updated.exercises[exId] = {
      exerciseId: exId,
      completed: !current?.completed,
      weight: current?.weight || '',
      notes: current?.notes || '',
    };
    setDayLog(updated);
    await saveDayLog(updated);
  };

  const updateWeight = async (exId: string, weight: string) => {
    const updated = { ...dayLog };
    const current = updated.exercises[exId] || { exerciseId: exId, completed: false };
    updated.exercises[exId] = { ...current, weight };
    setDayLog(updated);
    await saveDayLog(updated);
  };

  const day = WORKOUT_PLAN.days[selectedDay];
  const completed = day.exercises.filter(ex => dayLog.exercises[ex.id]?.completed).length;
  const pct = day.exercises.length > 0 ? Math.round((completed / day.exercises.length) * 100) : 0;

  return (
    <View style={s.container}>
      {/* Day Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsContent}>
        {WORKOUT_PLAN.days.map((d, i) => (
          <TouchableOpacity
            key={d.id}
            style={[s.tab, selectedDay === i && { backgroundColor: d.color }]}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={[s.tabDay, selectedDay === i && { color: '#fff' }]}>{DAYS_SHORT[i]}</Text>
            <Text style={[s.tabName, selectedDay === i && { color: '#fff' }]} numberOfLines={1}>
              {d.subtitle === 'REST DAY' ? '🧘' : d.subtitle === 'Recovery' ? '😴' : d.name.split(' ')[0]}
            </Text>
            {i === DAY_INDEX && <View style={[s.todayDot, selectedDay === i && { backgroundColor: '#fff' }]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Day Header */}
        <View style={[s.dayHeader, { borderLeftColor: day.color }]}>
          <Text style={s.dayTitle}>{day.name}</Text>
          <Text style={s.daySubtitle}>{day.subtitle}</Text>
          <View style={s.progressRow}>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: day.color }]} />
            </View>
            <Text style={s.progressText}>{completed}/{day.exercises.length}</Text>
          </View>
        </View>

        {/* Exercises */}
        {day.exercises.map((ex, idx) => {
          const log = dayLog.exercises[ex.id];
          const done = log?.completed || false;
          const expanded = expandedEx === ex.id;

          return (
            <TouchableOpacity
              key={ex.id}
              style={[s.exerciseCard, done && s.exerciseDone]}
              onPress={() => setExpandedEx(expanded ? null : ex.id)}
              activeOpacity={0.7}
            >
              <View style={s.exerciseMain}>
                <TouchableOpacity
                  style={[s.checkCircle, done && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}
                  onPress={() => toggleExercise(ex.id)}
                >
                  {done && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>

                <View style={s.exerciseInfo}>
                  <Text style={[s.exerciseName, done && { textDecorationLine: 'line-through', color: '#666' }]}>
                    {idx + 1}. {ex.name}
                  </Text>
                  <Text style={s.exerciseMeta}>{ex.sets} sets × {ex.reps} · {ex.rest} rest</Text>
                </View>

                {log?.weight ? (
                  <View style={s.weightBadge}>
                    <Text style={s.weightText}>{log.weight} kg</Text>
                  </View>
                ) : null}

                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
              </View>

              {expanded && (
                <View style={s.exerciseExpanded}>
                  {ex.notes ? <Text style={s.exerciseNotes}>💡 {ex.notes}</Text> : null}
                  <View style={s.weightInput}>
                    <Text style={s.weightLabel}>Weight (kg):</Text>
                    <TextInput
                      style={s.weightField}
                      placeholder="0"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      value={log?.weight || ''}
                      onChangeText={(t) => updateWeight(ex.id, t)}
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Cardio */}
        <View style={s.cardioCard}>
          <Ionicons name="walk" size={20} color="#3b82f6" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.cardioTitle}>Cardio Finisher</Text>
            <Text style={s.cardioDetail}>{day.cardio}</Text>
          </View>
        </View>

        {/* Complete Day Button */}
        {pct === 100 && (
          <TouchableOpacity style={s.completeBtn}>
            <Ionicons name="trophy" size={20} color="#fff" />
            <Text style={s.completeBtnText}>🎉 Day Complete! Great work!</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  
  tabsScroll: { maxHeight: 70 },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: { backgroundColor: '#1e1e1e', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, minWidth: 64, alignItems: 'center', borderWidth: 1, borderColor: '#333', position: 'relative' },
  tabDay: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 0.5 },
  tabName: { fontSize: 10, color: '#666', marginTop: 2 },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#f97316', position: 'absolute', bottom: 4 },

  dayHeader: { padding: 16, borderLeftWidth: 3, marginLeft: 16, marginRight: 16, marginBottom: 12, backgroundColor: '#141414', borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  dayTitle: { fontSize: 22, fontWeight: '700', color: '#f5f5f5' },
  daySubtitle: { fontSize: 14, color: '#999', marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  progressBar: { flex: 1, height: 6, backgroundColor: '#282828', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 13, color: '#999', fontWeight: '600' },

  exerciseCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#141414', borderRadius: 12, borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  exerciseDone: { borderColor: '#22c55e33' },
  exerciseMain: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 14, fontWeight: '500', color: '#f5f5f5' },
  exerciseMeta: { fontSize: 12, color: '#999', marginTop: 2 },
  weightBadge: { backgroundColor: '#f9731622', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  weightText: { fontSize: 12, color: '#f97316', fontWeight: '600' },
  exerciseExpanded: { padding: 14, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  exerciseNotes: { fontSize: 13, color: '#999', marginBottom: 12, lineHeight: 18 },
  weightInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weightLabel: { fontSize: 13, color: '#999' },
  weightField: { flex: 1, backgroundColor: '#282828', borderRadius: 8, padding: 10, color: '#f5f5f5', fontSize: 15, textAlign: 'center', borderWidth: 1, borderColor: '#333' },

  cardioCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, padding: 14, backgroundColor: '#141414', borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  cardioTitle: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  cardioDetail: { fontSize: 12, color: '#999', marginTop: 2 },

  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 16, padding: 16, backgroundColor: '#22c55e', borderRadius: 14 },
  completeBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
