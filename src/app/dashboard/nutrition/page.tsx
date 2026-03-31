'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Salad, Droplets, Plus, Trash2, Apple, Coffee, UtensilsCrossed } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

const QUICK_FOODS = [
  { name: 'Water (250ml)', calories: 0, meal_type: 'snack', water_ml: 250 },
  { name: 'Oatmeal', calories: 150, meal_type: 'breakfast' },
  { name: 'Greek Yogurt', calories: 100, meal_type: 'breakfast' },
  { name: 'Salad', calories: 120, meal_type: 'lunch' },
  { name: 'Grilled Chicken', calories: 200, meal_type: 'lunch' },
  { name: 'Banana', calories: 105, meal_type: 'snack' },
  { name: 'Dark Chocolate', calories: 170, meal_type: 'snack' },
  { name: 'Salmon', calories: 280, meal_type: 'dinner' },
];

const WATER_GOAL = 2500;

export default function NutritionPage() {
  const [today] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', calories: '', meal_type: 'breakfast' as typeof MEAL_TYPES[number] });

  const supabase = createClient();

  useEffect(() => { fetchLog(); }, []);

  const fetchLog = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();
    setLog(data || { water_ml: 0, meals: [], calories_total: 0 });
    setLoading(false);
  };

  const saveLog = async (updates: any) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updated = { ...log, ...updates };
    updated.calories_total = (updated.meals || []).reduce((sum: number, m: any) => sum + (m.calories || 0), 0);

    const { error } = await supabase.from('nutrition_logs').upsert({
      user_id: user.id,
      date: today,
      ...updated,
    }, { onConflict: 'user_id,date' });

    if (!error) {
      setLog(updated);
      toast.success('Saved!');
    } else {
      toast.error('Failed to save');
    }
    setSaving(false);
  };

  const addWater = (ml: number) => {
    const newWater = Math.min((log?.water_ml || 0) + ml, WATER_GOAL * 1.5);
    saveLog({ water_ml: newWater });
  };

  const addMeal = () => {
    if (!newMeal.name) return;
    const meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      calories: parseInt(newMeal.calories) || 0,
      meal_type: newMeal.meal_type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const meals = [...(log?.meals || []), meal];
    saveLog({ meals });
    setNewMeal({ name: '', calories: '', meal_type: 'breakfast' });
    setShowAddMeal(false);
  };

  const removeMeal = (id: string) => {
    const meals = (log?.meals || []).filter((m: any) => m.id !== id);
    saveLog({ meals });
  };

  const waterPercent = Math.min(((log?.water_ml || 0) / WATER_GOAL) * 100, 100);
  const caloriesTotal = (log?.meals || []).reduce((s: number, m: any) => s + (m.calories || 0), 0);

  const mealsByType = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = (log?.meals || []).filter((m: any) => m.meal_type === type);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-white mb-1">Nutrition</h1>
        <p className="text-white/50 text-sm">Track meals and hydration — synced with your cycle phase</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          {/* Meals */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Today's meals</h2>
              <button onClick={() => setShowAddMeal(true)} className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add meal
              </button>
            </div>

            {/* Quick add */}
            <div className="mb-5">
              <p className="text-xs text-white/40 mb-3">Quick add</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_FOODS.map(f => (
                  <button
                    key={f.name}
                    onClick={() => {
                      if (f.water_ml) {
                        addWater(f.water_ml);
                      } else {
                        const meal = {
                          id: Date.now().toString(),
                          name: f.name,
                          calories: f.calories,
                          meal_type: f.meal_type,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        saveLog({ meals: [...(log?.meals || []), meal] });
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:border-white/25 hover:text-white/80 transition-all"
                  >
                    {f.name}
                    {f.calories > 0 && <span className="text-white/30 ml-1">{f.calories}cal</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Meals by type */}
            <div className="space-y-4">
              {MEAL_TYPES.map(type => (
                <div key={type}>
                  {mealsByType[type]?.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 capitalize mb-2 flex items-center gap-1.5">
                        <span>{MEAL_ICONS[type]}</span> {type}
                      </p>
                      <div className="space-y-2">
                        {mealsByType[type].map((meal: any) => (
                          <div key={meal.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/4 border border-white/6">
                            <div>
                              <p className="text-sm text-white">{meal.name}</p>
                              <p className="text-xs text-white/30">{meal.time}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {meal.calories > 0 && (
                                <span className="text-xs text-white/50">{meal.calories} cal</span>
                              )}
                              <button onClick={() => removeMeal(meal.id)} className="text-white/20 hover:text-rose-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(log?.meals || []).length === 0 && (
                <p className="text-sm text-white/30 text-center py-4">No meals logged yet. Add your first meal!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Water */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-violet-400" />
              <p className="text-sm font-medium text-white/70">Hydration</p>
            </div>

            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-white">{((log?.water_ml || 0) / 1000).toFixed(1)}</span>
              <span className="text-sm text-white/40 mb-1.5">/ {(WATER_GOAL / 1000).toFixed(1)} L</span>
            </div>

            {/* Wave progress */}
            <div className="relative h-24 rounded-2xl overflow-hidden bg-white/5 mb-4">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet-500/60 to-violet-400/20 transition-all duration-700"
                style={{ height: `${waterPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white drop-shadow">{Math.round(waterPercent)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[150, 250, 500].map(ml => (
                <button
                  key={ml}
                  onClick={() => addWater(ml)}
                  className="btn-ghost py-2 text-xs flex flex-col items-center gap-0.5"
                >
                  <Droplets className="w-3 h-3 text-violet-400" />
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>

          {/* Calories summary */}
          <div className="card p-5">
            <p className="text-sm font-medium text-white/70 mb-4">Calorie summary</p>
            <div className="text-4xl font-bold text-white mb-1">{caloriesTotal}</div>
            <p className="text-xs text-white/40 mb-4">calories today</p>

            <div className="space-y-2">
              {MEAL_TYPES.map(type => {
                const typeCalories = mealsByType[type]?.reduce((s: number, m: any) => s + (m.calories || 0), 0) || 0;
                return typeCalories > 0 ? (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="text-white/40 capitalize">{MEAL_ICONS[type]} {type}</span>
                    <span className="text-white/60">{typeCalories} cal</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Cycle nutrition tips */}
          <div className="card p-5"
            style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.08) 0%, rgba(217,70,239,0.08) 100%)' }}>
            <p className="text-xs text-white/40 mb-3">💜 Cycle-synced tip</p>
            <p className="text-sm text-white/70 leading-relaxed">
              During your follicular phase, focus on iron-rich foods like leafy greens, legumes, and lean meats to replenish iron lost during menstruation.
            </p>
          </div>
        </div>
      </div>

      {/* Add meal modal */}
      <AnimatePresence>
        {showAddMeal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Add meal</h3>
                <button onClick={() => setShowAddMeal(false)} className="text-white/40">✕</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Food name</label>
                  <input
                    value={newMeal.name}
                    onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Avocado toast"
                    className="input-dark w-full px-4 py-3 text-sm"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Calories</label>
                    <input
                      type="number"
                      value={newMeal.calories}
                      onChange={e => setNewMeal(p => ({ ...p, calories: e.target.value }))}
                      placeholder="0"
                      className="input-dark w-full px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Meal type</label>
                    <select
                      value={newMeal.meal_type}
                      onChange={e => setNewMeal(p => ({ ...p, meal_type: e.target.value as typeof MEAL_TYPES[number] }))}
                      className="input-dark w-full px-4 py-3 text-sm"
                    >
                      {MEAL_TYPES.map(t => <option key={t} value={t}>{MEAL_ICONS[t]} {t}</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={addMeal} className="btn-primary w-full py-3 text-sm font-medium">
                  Add meal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
