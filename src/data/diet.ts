export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DIET_PLAN: Meal[] = [
  {
    id: 'morning',
    name: '🌅 Morning Hydration',
    time: '7:00 AM',
    foods: '1 glass warm water + lemon\n5-6 soaked almonds + 2 walnuts',
    calories: 120,
    protein: 4,
    carbs: 4,
    fat: 10,
  },
  {
    id: 'breakfast',
    name: '🍳 Breakfast',
    time: '7:30 AM',
    foods: 'Option A: 3 whole eggs + 2 egg whites (scrambled) + 1 toast + green tea\nOption B: Paneer bhurji (150g) + 1 roti\nOption C: Foodstrong shake + 1 banana + almonds',
    calories: 400,
    protein: 35,
    carbs: 30,
    fat: 18,
  },
  {
    id: 'snack1',
    name: '🍎 Mid-Morning Snack',
    time: '10:30 AM',
    foods: '1 bowl sprouts chaat (moong/masoor + onion + tomato + lemon)\nOR 1 cup curd + makhana',
    calories: 200,
    protein: 25,
    carbs: 20,
    fat: 4,
  },
  {
    id: 'lunch',
    name: '🍛 Lunch',
    time: '1:00 PM',
    foods: '2 chapatis (NOT 5-6!)\n1 bowl dal (moong/masoor)\n1 bowl sabzi (green veg)\n100g paneer/chicken/rajma\n1 small bowl rice (training days only)\nSalad: cucumber + carrot + lemon',
    calories: 550,
    protein: 45,
    carbs: 55,
    fat: 15,
  },
  {
    id: 'snack2',
    name: '💪 Pre/Post Workout',
    time: '4:00 PM',
    foods: 'Foodstrong shake (1 scoop with water) + 1 banana\nOR 2 boiled eggs + 1 apple\nOR 1 bowl chana chaat',
    calories: 200,
    protein: 25,
    carbs: 25,
    fat: 4,
  },
  {
    id: 'dinner',
    name: '🍲 Dinner',
    time: '7:30 PM',
    foods: '1 chapati\n1 bowl dal or chicken soup\n1 bowl sabzi (non-starchy: palak, lauki, tori)\n100g paneer tikka / grilled chicken / soy chunks\nNO rice at dinner',
    calories: 500,
    protein: 40,
    carbs: 40,
    fat: 18,
  },
  {
    id: 'bedtime',
    name: '🥛 Before Bed',
    time: '9:00 PM',
    foods: '1 cup warm turmeric haldi milk (low-fat)\nOR 1 cup low-fat curd with haldi',
    calories: 100,
    protein: 10,
    carbs: 8,
    fat: 4,
  },
];

export const DAILY_TARGETS = {
  calories: 1950,
  protein: 175,
  carbs: 170,
  fat: 65,
};

export const PROTEIN_SHAKE_INFO = {
  name: 'Foodstrong Daily Protein Mango',
  protein: 26,
  price: 1699,
  bloatFix: [
    'Take WITH food, never empty stomach',
    'Start with half scoop for first week',
    'Mix with water, not milk',
    'Add pinch of hing (asafoetida) or jeera',
    'Sip over 10-15 minutes',
    'Add 1 tsp ginger juice',
    'If still bloating → switch to whey isolate',
  ],
};
