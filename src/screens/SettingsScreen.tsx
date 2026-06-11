import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, saveSettings } from '../utils/storage';
import { scheduleWorkoutReminder } from '../utils/notifications';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<any>({});
  const [editing, setEditing] = useState(false);

  const loadData = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    await saveSettings(settings);
    setEditing(false);
    Alert.alert('Saved', 'Settings updated successfully!');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setEditing(true);
  };

  const scheduleReminder = async () => {
    await scheduleWorkoutReminder(7, 0);
    Alert.alert('Reminder Set', 'You\'ll get a workout reminder at 7:00 AM daily');
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={s.title}>Settings</Text>

      {/* Profile */}
      <Text style={s.sectionTitle}>Profile</Text>
      <View style={s.card}>
        <View style={s.field}>
          <Text style={s.label}>Name</Text>
          <TextInput
            style={s.input}
            value={settings.name || ''}
            onChangeText={(t) => updateSetting('name', t)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.label}>Age</Text>
          <TextInput
            style={s.input}
            value={settings.age?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('age', parseInt(t) || 0)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.label}>Height (cm)</Text>
          <TextInput
            style={s.input}
            value={settings.height?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('height', parseFloat(t) || 0)}
          />
        </View>
      </View>

      {/* Starting Stats */}
      <Text style={s.sectionTitle}>Starting Stats</Text>
      <View style={s.card}>
        <View style={s.field}>
          <Text style={s.label}>Start Weight (kg)</Text>
          <TextInput
            style={s.input}
            value={settings.startWeight?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('startWeight', parseFloat(t) || 0)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.label}>Start Waist (inches)</Text>
          <TextInput
            style={s.input}
            value={settings.startWaist?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('startWaist', parseFloat(t) || 0)}
          />
        </View>
      </View>

      {/* Targets */}
      <Text style={s.sectionTitle}>Targets</Text>
      <View style={s.card}>
        <View style={s.field}>
          <Text style={s.label}>Target Weight (kg)</Text>
          <TextInput
            style={s.input}
            value={settings.targetWeight?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('targetWeight', parseFloat(t) || 0)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.label}>Target Waist (inches)</Text>
          <TextInput
            style={s.input}
            value={settings.targetWaist?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('targetWaist', parseFloat(t) || 0)}
          />
        </View>
        <View style={s.field}>
          <Text style={s.label}>Daily Step Goal</Text>
          <TextInput
            style={s.input}
            value={settings.stepGoal?.toString() || ''}
            keyboardType="numeric"
            onChangeText={(t) => updateSetting('stepGoal', parseInt(t) || 6000)}
          />
        </View>
      </View>

      {/* Reminders */}
      <Text style={s.sectionTitle}>Reminders</Text>
      <View style={s.card}>
        <TouchableOpacity style={s.reminderBtn} onPress={scheduleReminder}>
          <Ionicons name="notifications" size={20} color="#f97316" />
          <Text style={s.reminderText}>Set Daily Workout Reminder (7:00 AM)</Text>
          <Ionicons name="chevron-forward" size={18} color="#666" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={s.sectionTitle}>About</Text>
      <View style={s.card}>
        <View style={s.aboutRow}>
          <Text style={s.aboutLabel}>App</Text>
          <Text style={s.aboutValue}>FitForge v1.0</Text>
        </View>
        <View style={s.aboutRow}>
          <Text style={s.aboutLabel}>Plan</Text>
          <Text style={s.aboutValue}>12-Week Body Recomposition</Text>
        </View>
        <View style={s.aboutRow}>
          <Text style={s.aboutLabel}>Started</Text>
          <Text style={s.aboutValue}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Save Button */}
      {editing && (
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#f5f5f5', marginBottom: 20 },

  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 16 },

  card: { backgroundColor: '#141414', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#333' },

  field: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  label: { fontSize: 14, color: '#999' },
  input: { width: 120, backgroundColor: '#282828', borderRadius: 8, padding: 8, color: '#f5f5f5', fontSize: 15, textAlign: 'right', borderWidth: 1, borderColor: '#333' },

  reminderBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  reminderText: { flex: 1, fontSize: 14, color: '#f5f5f5' },

  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  aboutLabel: { fontSize: 14, color: '#999' },
  aboutValue: { fontSize: 14, color: '#f5f5f5', fontWeight: '500' },

  saveBtn: { marginTop: 20, padding: 16, backgroundColor: '#f97316', borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
