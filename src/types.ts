export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  subtitle: string;
  color: string;
  exercises: Exercise[];
  cardio: string;
}

export interface WorkoutPlan {
  name: string;
  weeks: number;
  days: WorkoutDay[];
}

export interface ExerciseLog {
  exerciseId: string;
  completed: boolean;
  weight?: string;
  notes?: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  exercises: Record<string, ExerciseLog>;
  meals: Record<string, boolean>;
  steps: number;
  weight?: number;
  waist?: number;
  notes?: string;
}

export interface ProgressEntry {
  date: string;
  weight: number;
  waist: number;
  bodyFat?: number;
  notes?: string;
}

export type TabName = 'dashboard' | 'workout' | 'diet' | 'progress' | 'settings';
