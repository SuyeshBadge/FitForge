import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Dimensions, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Circle, Text as SvgText, G, Line } from 'react-native-svg';
import { getProgress, addProgress, getSettings, getDayLog, saveDayLog } from '../utils/storage';
import { ProgressEntry, DayLog } from '../types';

const TODAY = new Date().toISOString().split('T')[0];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function MiniChart({ data, color, label, unit }: { data: { date: string; value: number }[]; color: string; label: string; unit: string }) {
  if (data.length < 2) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>Log 2+ entries to see trend</Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min || 1;

  const chartW = SCREEN_WIDTH - 64;
  const chartH = 140;
  const padding = 20;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (chartW - 2 * padding),
    y: padding + (1 - (d.value - min) / range) * (chartH - 2 * padding),
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const change = last - first;
  const changeStr = change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

  return (
    <View>
      <View style={chartStyles.header}>
        <Text style={chartStyles.label}>{label}</Text>
        <View style={[chartStyles.changeBadge, { backgroundColor: change <= 0 ? '#22c55e22' : '#ef444422' }]}>
          <Ionicons name={change <= 0 ? 'trending-down' : 'trending-up'} size={12} color={change <= 0 ? '#22c55e' : '#ef4444'} />
          <Text style={[chartStyles.changeText, { color: change <= 0 ? '#22c55e' : '#ef4444' }]}>
            {changeStr} {unit}
          </Text>
        </View>
      </View>
      <Svg width={chartW} height={chartH}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <Line
            key={i}
            x1={padding}
            y1={padding + pct * (chartH - 2 * padding)}
            x2={chartW - padding}
            y2={padding + pct * (chartH - 2 * padding)}
            stroke="#282828"
            strokeWidth={1}
          />
        ))}
        {/* Line */}
        <Path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3} fill={color} />
        ))}
        {/* Current value */}
        <SvgText
          x={points[points.length - 1].x}
          y={points[points.length - 1].y - 12}
          fontSize={13}
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
        >
          {last.toFixed(1)}
        </SvgText>
        {/* Date labels */}
        {data.length <= 10 && data.map((d, i) => (
          <SvgText
            key={i}
            x={points[i].x}
            y={chartH - 2}
            fontSize={9}
            fill="#555"
            textAnchor="middle"
          >
            {d.date.slice(5)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

export default function ProgressScreen() {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [steps, setSteps] = useState('');
  const [dayLog, setDayLog] = useState<DayLog | null>(null);

  const loadData = useCallback(async () => {
    const p = await getProgress();
    const sett = await getSettings();
    const log = await getDayLog(TODAY);
    setProgress(p);
    setSettings(sett);
    setDayLog(log);
    setSteps(log.steps?.toString() || '');
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!newWeight && !newWaist) {
      Alert.alert('Error', 'Enter at least weight or waist measurement');
      return;
    }

    const entry: ProgressEntry = {
      date: TODAY,
      weight: newWeight ? parseFloat(newWeight) : (progress.length > 0 ? progress[progress.length - 1].weight : settings.startWeight || 88),
      waist: newWaist ? parseFloat(newWaist) : (progress.length > 0 ? progress[progress.length - 1].waist : settings.startWaist || 41),
      notes: newNotes || undefined,
    };

    await addProgress(entry);
    setShowModal(false);
    setNewWeight('');
    setNewWaist('');
    setNewNotes('');
    loadData();
  };

  const handleSteps = async () => {
    if (!dayLog) return;
    const updated = { ...dayLog, steps: parseInt(steps) || 0 };
    await saveDayLog(updated);
    setDayLog(updated);
  };

  const latest = progress.length > 0 ? progress[progress.length - 1] : null;
  const startWeight = settings.startWeight || 88.1;
  const startWaist = settings.startWaist || 41;

  const weightData = progress.map(p => ({ date: p.date, value: p.weight }));
  const waistData = progress.map(p => ({ date: p.date, value: p.waist }));

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={s.header}>
        <Text style={s.title}>Progress Tracker</Text>
        <Text style={s.subtitle}>Track your transformation</Text>
      </View>

      {/* Current Stats */}
      <View style={s.statsGrid}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{latest?.weight || startWeight}</Text>
          <Text style={s.statLabel}>Current Weight (kg)</Text>
          {latest && (
            <Text style={[s.statChange, { color: latest.weight <= startWeight ? '#22c55e' : '#ef4444' }]}>
              {latest.weight - startWeight >= 0 ? '+' : ''}{(latest.weight - startWeight).toFixed(1)} from start
            </Text>
          )}
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{latest?.waist || startWaist}"</Text>
          <Text style={s.statLabel}>Waist (inches)</Text>
          {latest && (
            <Text style={[s.statChange, { color: latest.waist <= startWaist ? '#22c55e' : '#ef4444' }]}>
              {latest.waist - startWaist >= 0 ? '+' : ''}{(latest.waist - startWaist).toFixed(1)} from start
            </Text>
          )}
        </View>
      </View>

      {/* Targets */}
      <View style={s.targetCard}>
        <Text style={s.targetTitle}>🎯 Targets</Text>
        <View style={s.targetRow}>
          <View style={s.targetItem}>
            <Text style={s.targetLabel}>Weight</Text>
            <Text style={s.targetValue}>{latest?.weight || startWeight} → {settings.targetWeight || 80} kg</Text>
          </View>
          <View style={s.targetItem}>
            <Text style={s.targetLabel}>Waist</Text>
            <Text style={s.targetValue}>{latest?.waist || startWaist}" → {settings.targetWaist || 35}"</Text>
          </View>
        </View>
      </View>

      {/* Step Counter */}
      <View style={s.stepsCard}>
        <Ionicons name="footsteps" size={24} color="#3b82f6" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.stepsTitle}>Today's Steps</Text>
          <Text style={s.stepsGoal}>Goal: {(settings.stepGoal || 6000).toLocaleString()}</Text>
        </View>
        <TextInput
          style={s.stepsInput}
          placeholder="0"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={steps}
          onChangeText={setSteps}
          onBlur={handleSteps}
        />
      </View>

      {/* Charts */}
      <Text style={s.sectionTitle}>Weight Trend</Text>
      <View style={s.chartCard}>
        <MiniChart data={weightData} color="#f97316" label="Weight" unit="kg" />
      </View>

      <Text style={s.sectionTitle}>Waist Trend</Text>
      <View style={s.chartCard}>
        <MiniChart data={waistData} color="#a855f7" label="Waist" unit="inches" />
      </View>

      {/* History */}
      <Text style={s.sectionTitle}>Log History</Text>
      {progress.length === 0 ? (
        <View style={s.emptyCard}>
          <Ionicons name="analytics" size={40} color="#333" />
          <Text style={s.emptyText}>No entries yet</Text>
          <Text style={s.emptySubtext}>Tap "Log Entry" to start tracking</Text>
        </View>
      ) : (
        [...progress].reverse().slice(0, 14).map((p, i) => (
          <View key={i} style={s.historyItem}>
            <View>
              <Text style={s.historyDate}>{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              {p.notes && <Text style={s.historyNotes}>{p.notes}</Text>}
            </View>
            <View style={s.historyValues}>
              <Text style={s.historyWeight}>{p.weight} kg</Text>
              <Text style={s.historyWaist}>{p.waist}"</Text>
            </View>
          </View>
        ))
      )}

      {/* Log Entry Button */}
      <TouchableOpacity style={s.logBtn} onPress={() => setShowModal(true)}>
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={s.logBtnText}>Log Entry</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Log Progress</Text>
            <Text style={s.modalDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

            <View style={s.modalField}>
              <Text style={s.modalLabel}>Weight (kg)</Text>
              <TextInput
                style={s.modalInput}
                placeholder={latest?.weight?.toString() || startWeight.toString()}
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={newWeight}
                onChangeText={setNewWeight}
              />
            </View>

            <View style={s.modalField}>
              <Text style={s.modalLabel}>Waist (inches)</Text>
              <TextInput
                style={s.modalInput}
                placeholder={latest?.waist?.toString() || startWaist.toString()}
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={newWaist}
                onChangeText={setNewWaist}
              />
            </View>

            <View style={s.modalField}>
              <Text style={s.modalLabel}>Notes (optional)</Text>
              <TextInput
                style={[s.modalInput, { height: 60 }]}
                placeholder="How you feel, changes noticed..."
                placeholderTextColor="#555"
                multiline
                value={newNotes}
                onChangeText={setNewNotes}
              />
            </View>

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setShowModal(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={handleSave}>
                <Text style={s.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const chartStyles = StyleSheet.create({
  empty: { height: 140, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#555' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 15, fontWeight: '600', color: '#f5f5f5' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  changeText: { fontSize: 12, fontWeight: '600' },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },

  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#f5f5f5' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#141414', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#333' },
  statValue: { fontSize: 28, fontWeight: '800', color: '#f97316' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  statChange: { fontSize: 11, fontWeight: '500', marginTop: 4 },

  targetCard: { backgroundColor: '#141414', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  targetTitle: { fontSize: 15, fontWeight: '600', color: '#f5f5f5', marginBottom: 10 },
  targetRow: { flexDirection: 'row', gap: 12 },
  targetItem: { flex: 1 },
  targetLabel: { fontSize: 12, color: '#666' },
  targetValue: { fontSize: 13, color: '#ccc', marginTop: 2 },

  stepsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  stepsTitle: { fontSize: 15, fontWeight: '600', color: '#f5f5f5' },
  stepsGoal: { fontSize: 12, color: '#666', marginTop: 2 },
  stepsInput: { width: 80, backgroundColor: '#282828', borderRadius: 10, padding: 10, color: '#f5f5f5', fontSize: 16, fontWeight: '600', textAlign: 'center', borderWidth: 1, borderColor: '#333' },

  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },

  chartCard: { backgroundColor: '#141414', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center' },

  emptyCard: { backgroundColor: '#141414', borderRadius: 14, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#555', marginTop: 4 },

  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#141414', borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#333' },
  historyDate: { fontSize: 14, fontWeight: '500', color: '#f5f5f5' },
  historyNotes: { fontSize: 12, color: '#666', marginTop: 2 },
  historyValues: { flexDirection: 'row', gap: 12 },
  historyWeight: { fontSize: 14, fontWeight: '600', color: '#f97316' },
  historyWaist: { fontSize: 14, fontWeight: '600', color: '#a855f7' },

  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, padding: 16, backgroundColor: '#f97316', borderRadius: 14 },
  logBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1e1e1e', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#f5f5f5' },
  modalDate: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 20 },
  modalField: { marginBottom: 16 },
  modalLabel: { fontSize: 13, color: '#999', marginBottom: 6 },
  modalInput: { backgroundColor: '#282828', borderRadius: 10, padding: 14, color: '#f5f5f5', fontSize: 16, borderWidth: 1, borderColor: '#333' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#282828', alignItems: 'center' },
  modalCancelText: { color: '#999', fontWeight: '600' },
  modalSave: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f97316', alignItems: 'center' },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
