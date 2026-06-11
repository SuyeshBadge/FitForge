import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DIET_PLAN, DAILY_TARGETS, PROTEIN_SHAKE_INFO } from '../data/diet';
import { getDayLog, saveDayLog } from '../utils/storage';
import { DayLog } from '../types';

const TODAY = new Date().toISOString().split('T')[0];

export default function DietScreen() {
  const [dayLog, setDayLog] = useState<DayLog>({ date: TODAY, exercises: {}, meals: {}, steps: 0 });

  const loadData = useCallback(async () => {
    const log = await getDayLog(TODAY);
    setDayLog(log);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleMeal = async (mealId: string) => {
    const updated = { ...dayLog };
    updated.meals[mealId] = !updated.meals[mealId];
    setDayLog(updated);
    await saveDayLog(updated);
  };

  // Calculate totals
  const totalCals = DIET_PLAN.filter(m => dayLog.meals[m.id]).reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = DIET_PLAN.filter(m => dayLog.meals[m.id]).reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = DIET_PLAN.filter(m => dayLog.meals[m.id]).reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = DIET_PLAN.filter(m => dayLog.meals[m.id]).reduce((sum, m) => sum + m.fat, 0);

  const mealsDone = DIET_PLAN.filter(m => dayLog.meals[m.id]).length;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Macro Summary */}
      <View style={s.macroHeader}>
        <Text style={s.macroTitle}>Today's Nutrition</Text>
        <Text style={s.macroSubtitle}>{mealsDone}/{DIET_PLAN.length} meals logged</Text>
      </View>

      <View style={s.macroRow}>
        <View style={[s.macroCard, { borderColor: '#f97316' }]}>
          <Text style={[s.macroValue, { color: '#f97316' }]}>{totalCals}</Text>
          <Text style={s.macroLabel}>/ {DAILY_TARGETS.calories}</Text>
          <Text style={s.macroUnit}>kcal</Text>
        </View>
        <View style={[s.macroCard, { borderColor: '#ef4444' }]}>
          <Text style={[s.macroValue, { color: '#ef4444' }]}>{totalProtein}g</Text>
          <Text style={s.macroLabel}>/ {DAILY_TARGETS.protein}g</Text>
          <Text style={s.macroUnit}>protein</Text>
        </View>
        <View style={[s.macroCard, { borderColor: '#3b82f6' }]}>
          <Text style={[s.macroValue, { color: '#3b82f6' }]}>{totalCarbs}g</Text>
          <Text style={s.macroLabel}>/ {DAILY_TARGETS.carbs}g</Text>
          <Text style={s.macroUnit}>carbs</Text>
        </View>
        <View style={[s.macroCard, { borderColor: '#a855f7' }]}>
          <Text style={[s.macroValue, { color: '#a855f7' }]}>{totalFat}g</Text>
          <Text style={s.macroLabel}>/ {DAILY_TARGETS.fat}g</Text>
          <Text style={s.macroUnit}>fat</Text>
        </View>
      </View>

      {/* Protein Progress */}
      <View style={s.proteinBar}>
        <View style={s.proteinBarHeader}>
          <Text style={s.proteinBarTitle}>🥩 Protein Progress</Text>
          <Text style={s.proteinBarPct}>{Math.round((totalProtein / DAILY_TARGETS.protein) * 100)}%</Text>
        </View>
        <View style={s.pBar}>
          <View style={[s.pFill, {
            width: `${Math.min(100, (totalProtein / DAILY_TARGETS.protein) * 100)}%`,
            backgroundColor: totalProtein >= DAILY_TARGETS.protein ? '#22c55e' : '#ef4444',
          }]} />
        </View>
        <Text style={s.proteinBarDetail}>{totalProtein}g of {DAILY_TARGETS.protein}g target</Text>
      </View>

      {/* Meals */}
      <Text style={s.sectionTitle}>Meals</Text>
      {DIET_PLAN.map(meal => {
        const done = dayLog.meals[meal.id] || false;
        return (
          <TouchableOpacity
            key={meal.id}
            style={[s.mealCard, done && s.mealDone]}
            onPress={() => toggleMeal(meal.id)}
            activeOpacity={0.7}
          >
            <View style={s.mealHeader}>
              <View style={s.mealCheck}>
                <View style={[s.checkbox, done && { backgroundColor: '#22c55e', borderColor: '#22c55e' }]}>
                  {done && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <View>
                  <Text style={s.mealName}>{meal.name}</Text>
                  <Text style={s.mealTime}>{meal.time}</Text>
                </View>
              </View>
              <View style={s.mealCalBadge}>
                <Text style={s.mealCal}>{meal.calories}</Text>
                <Text style={s.mealCalUnit}>kcal</Text>
              </View>
            </View>
            
            <Text style={s.mealFoods}>{meal.foods}</Text>
            
            <View style={s.mealMacros}>
              <View style={s.macro}>
                <Text style={[s.macroDot, { backgroundColor: '#ef4444' }]} />
                <Text style={s.macroText}>{meal.protein}g protein</Text>
              </View>
              <View style={s.macro}>
                <Text style={[s.macroDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={s.macroText}>{meal.carbs}g carbs</Text>
              </View>
              <View style={s.macro}>
                <Text style={[s.macroDot, { backgroundColor: '#a855f7' }]} />
                <Text style={s.macroText}>{meal.fat}g fat</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Protein Shake Info */}
      <View style={s.shakeCard}>
        <View style={s.shakeHeader}>
          <Text style={s.shakeTitle}>🥤 Protein Shake Fix</Text>
          <Text style={s.shakeName}>{PROTEIN_SHAKE_INFO.name}</Text>
        </View>
        <Text style={s.shakeSubtitle}>Bloating Fix (try in order):</Text>
        {PROTEIN_SHAKE_INFO.bloatFix.map((fix, i) => (
          <View key={i} style={s.fixItem}>
            <Text style={s.fixNum}>{i + 1}.</Text>
            <Text style={s.fixText}>{fix}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },

  macroHeader: { marginBottom: 12 },
  macroTitle: { fontSize: 22, fontWeight: '700', color: '#f5f5f5' },
  macroSubtitle: { fontSize: 14, color: '#999', marginTop: 2 },

  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  macroCard: { flex: 1, backgroundColor: '#141414', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  macroValue: { fontSize: 20, fontWeight: '700' },
  macroLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  macroUnit: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },

  proteinBar: { backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  proteinBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  proteinBarTitle: { fontSize: 14, fontWeight: '600', color: '#f5f5f5' },
  proteinBarPct: { fontSize: 14, fontWeight: '700', color: '#ef4444' },
  pBar: { height: 8, backgroundColor: '#282828', borderRadius: 4, overflow: 'hidden' },
  pFill: { height: '100%', borderRadius: 4 },
  proteinBarDetail: { fontSize: 12, color: '#666', marginTop: 6 },

  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

  mealCard: { backgroundColor: '#141414', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  mealDone: { borderColor: '#22c55e33' },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mealCheck: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
  mealName: { fontSize: 15, fontWeight: '600', color: '#f5f5f5' },
  mealTime: { fontSize: 12, color: '#666', marginTop: 2 },
  mealCalBadge: { alignItems: 'center' },
  mealCal: { fontSize: 18, fontWeight: '700', color: '#f97316' },
  mealCalUnit: { fontSize: 10, color: '#666' },

  mealFoods: { fontSize: 13, color: '#999', marginTop: 10, lineHeight: 20 },

  mealMacros: { flexDirection: 'row', gap: 14, marginTop: 10 },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroDot: { width: 6, height: 6, borderRadius: 3 },
  macroText: { fontSize: 11, color: '#666' },

  shakeCard: { backgroundColor: '#141414', borderRadius: 14, padding: 16, marginTop: 8, borderWidth: 1, borderColor: '#333' },
  shakeHeader: { marginBottom: 10 },
  shakeTitle: { fontSize: 16, fontWeight: '600', color: '#f5f5f5' },
  shakeName: { fontSize: 13, color: '#f97316', marginTop: 2 },
  shakeSubtitle: { fontSize: 13, fontWeight: '500', color: '#999', marginBottom: 8 },
  fixItem: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  fixNum: { fontSize: 13, color: '#f97316', fontWeight: '600', width: 20 },
  fixText: { fontSize: 13, color: '#ccc', flex: 1, lineHeight: 18 },
});
