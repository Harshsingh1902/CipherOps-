import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function getDayOfCycle(periodStart: string, today = new Date()) {
  const start = parseISO(periodStart);
  return differenceInDays(today, start) + 1;
}

export function predictNextPeriod(lastStart: string, avgCycleLength = 28) {
  return addDays(parseISO(lastStart), avgCycleLength);
}

export function predictOvulation(lastStart: string, avgCycleLength = 28) {
  return addDays(parseISO(lastStart), avgCycleLength - 14);
}

export function getFertileWindow(ovulationDate: Date) {
  return {
    start: addDays(ovulationDate, -5),
    end: addDays(ovulationDate, 1),
  };
}

export function getCyclePhase(dayOfCycle: number, cycleLength = 28): {
  phase: string;
  description: string;
  color: string;
} {
  if (dayOfCycle <= 5) {
    return {
      phase: 'Menstrual',
      description: 'Your body is shedding the uterine lining. Rest and gentle movement are key.',
      color: '#ff6b8a',
    };
  } else if (dayOfCycle <= 13) {
    return {
      phase: 'Follicular',
      description: 'Energy rises as estrogen climbs. Great time for new projects and social activities.',
      color: '#a78bfa',
    };
  } else if (dayOfCycle <= 16) {
    return {
      phase: 'Ovulatory',
      description: 'Peak energy, confidence, and communication skills. You\'re at your best!',
      color: '#34d399',
    };
  } else {
    return {
      phase: 'Luteal',
      description: 'Focus inward. Prioritize self-care, nutrition, and quality sleep.',
      color: '#fb923c',
    };
  }
}

export function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
