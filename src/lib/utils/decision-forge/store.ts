import { writable, derived } from 'svelte/store';
import type { DecisionMatrixState } from './types';
import { v4 as uuidv4 } from 'uuid';

const initialState: DecisionMatrixState = {
  name: 'New Decision',
  criteria: [
    { id: uuidv4(), name: 'Cost', weight: 8 },
    { id: uuidv4(), name: 'Quality', weight: 9 },
    { id: uuidv4(), name: 'Ease of Use', weight: 6 }
  ],
  options: [
    { id: uuidv4(), name: 'Option A', scores: {} },
    { id: uuidv4(), name: 'Option B', scores: {} }
  ]
};

function createMatrixStore() {
  const { subscribe, set, update } = writable<DecisionMatrixState>(JSON.parse(JSON.stringify(initialState)));

  return {
    subscribe,
    set,
    update,
    reset: () => set(JSON.parse(JSON.stringify(initialState))),
    load: (matrix: DecisionMatrixState) => set(JSON.parse(JSON.stringify(matrix))),
    updateName: (name: string) => update(s => ({ ...s, name })),
    addCriterion: () => update(s => ({
      ...s,
      criteria: [...s.criteria, { id: uuidv4(), name: 'New Criterion', weight: 5 }]
    })),
    removeCriterion: (id: string) => update(s => ({
      ...s,
      criteria: s.criteria.filter(c => c.id !== id),
      // Clean up scores
      options: s.options.map(o => {
        const newScores = { ...o.scores };
        delete newScores[id];
        return { ...o, scores: newScores };
      })
    })),
    updateCriterion: (id: string, updates: Partial<{name: string, weight: number}>) => update(s => ({
      ...s,
      criteria: s.criteria.map(c => c.id === id ? { ...c, ...updates } : c)
    })),
    addOption: () => update(s => ({
      ...s,
      options: [...s.options, { id: uuidv4(), name: 'New Option', scores: {} }]
    })),
    removeOption: (id: string) => update(s => ({
      ...s,
      options: s.options.filter(o => o.id !== id)
    })),
    updateOptionName: (id: string, name: string) => update(s => ({
      ...s,
      options: s.options.map(o => o.id === id ? { ...o, name } : o)
    })),
    updateScore: (optionId: string, criterionId: string, score: number) => update(s => ({
      ...s,
      options: s.options.map(o => {
        if (o.id === optionId) {
          return { ...o, scores: { ...o.scores, [criterionId]: score } };
        }
        return o;
      })
    }))
  };
}

export const matrixStore = createMatrixStore();

export const weightedScores = derived(matrixStore, ($matrix) => {
  return $matrix.options.map(option => {
    let totalScore = 0;
    let maxPossibleScore = 0;

    $matrix.criteria.forEach(criterion => {
      const rawScore = option.scores[criterion.id] || 0;
      totalScore += rawScore * criterion.weight;
      maxPossibleScore += 10 * criterion.weight;
    });

    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    return {
      ...option,
      totalScore,
      percentage
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
});
