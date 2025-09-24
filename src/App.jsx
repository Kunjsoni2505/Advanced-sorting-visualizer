// Replace your src/App.jsx with this file's content
// Tailwind CSS is used for styling. Works with Vite React template.

import React, { useEffect, useMemo, useRef, useState } from "react";

/*****************************************
 * Icons
 *****************************************/
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const StepIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="4" x2="6" y2="20"></line><polygon points="12,12 20,18 20,6"></polygon></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M21 21v-5h-5"></path></svg>;
const RandomizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>;

/*****************************************
 * Theming Engine
 *****************************************/
const themes = {
  synthwave: {
    name: 'Synthwave',
    bg: 'bg-[#0d0221] text-cyan-300 font-mono',
    headerBorder: 'border-purple-500/30',
    panelBg: 'bg-black/30 border border-purple-600/40 backdrop-blur-sm',
    controlBg: 'bg-black/20 border-purple-500/30',
    textSecondary: 'text-pink-400',
    button: {
      primary: 'bg-pink-500 hover:bg-pink-400 text-white',
      secondary: 'bg-cyan-500 hover:bg-cyan-400 text-black',
      special: 'bg-yellow-400 hover:bg-yellow-300 text-black',
    },
    barColors: {
      default: 'bg-cyan-400',
      compare: 'bg-yellow-400',
      pivot: 'bg-pink-500',
      sorted: 'bg-lime-400',
    },
    grid: true,
  },
  dark: {
    name: 'Dark',
    bg: 'bg-gray-950 text-white font-sans',
    headerBorder: 'border-white/10',
    panelBg: 'bg-gray-800/50 border border-white/10',
    controlBg: 'bg-gray-900/50 border-white/10',
    textSecondary: 'text-gray-300',
    button: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      secondary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      special: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    barColors: {
      default: 'bg-sky-400',
      compare: 'bg-red-500',
      pivot: 'bg-yellow-400',
      sorted: 'bg-green-500',
    },
    grid: false,
  },
  light: {
    name: 'Light',
    bg: 'bg-gray-100 text-gray-800 font-sans',
    headerBorder: 'border-gray-300',
    panelBg: 'bg-white/80 border border-gray-200 shadow-lg',
    controlBg: 'bg-white/70 border-gray-200 shadow-md',
    textSecondary: 'text-gray-600',
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      special: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
     barColors: {
      default: 'bg-blue-400',
      compare: 'bg-orange-500',
      pivot: 'bg-purple-500',
      sorted: 'bg-emerald-500',
    },
    grid: false,
  },
};

/*****************************************
 * Utilities & Hooks
 *****************************************/
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const useBeep = () => {
  const ctxRef = useRef(null);
  const enabledRef = useRef(true);
  const setEnabled = (v) => (enabledRef.current = v);
  const ensureCtx = () => {
    if (!ctxRef.current) { try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { console.error("Web Audio API is not supported in this browser."); } }
    return ctxRef.current;
  };
   const beep = (freq = 220, dur = 0.5, vol = 0.5) => {
    if (!enabledRef.current) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Master Gain (Envelope)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(vol * 0.8, now + 0.01);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    // Reverb/Delay Effect
    const delay = ctx.createDelay(0.5);
    const feedback = ctx.createGain();
    const wetLevel = ctx.createGain();
    delay.delayTime.value = 0.18;
    feedback.gain.value = 0.35;
    wetLevel.gain.value = 0.4;
    
    // Routing
    masterGain.connect(ctx.destination); // Dry signal
    masterGain.connect(delay);
    delay.connect(wetLevel);
    wetLevel.connect(ctx.destination); // Wet signal
    delay.connect(feedback);
    feedback.connect(delay); // Feedback loop

    // Oscillators
    const harmonics = [1, 2, 3, 5];
    const harmonicGains = [1, 0.4, 0.2, 0.1];
    harmonics.forEach((harmonic, index) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * harmonic, now);
        const gainNode = ctx.createGain();
        gainNode.gain.value = harmonicGains[index];
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start(now);
        osc.stop(now + dur);
    });
  };
  return { beep, setEnabled };
};

const generateArray = (type, n, min = 20, max = 400) => {
    const arr = Array.from({ length: n }, (_, i) => min + Math.floor(((max - min) / n) * i));
    switch (type) {
        case 'random': return arr.sort(() => Math.random() - 0.5);
        case 'nearly-sorted': for (let i = 0; i < Math.floor(n / 10); i++) { const idx1 = Math.floor(Math.random() * n); const idx2 = Math.floor(Math.random() * n);[arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]]; } return arr;
        case 'reversed': return arr.reverse();
        case 'few-unique': const uniqueCount = Math.max(2, Math.floor(Math.sqrt(n) / 2)); const uniqueValues = Array.from({ length: uniqueCount }, () => min + Math.floor(Math.random() * (max - min))); return Array.from({ length: n }, () => uniqueValues[Math.floor(Math.random() * uniqueCount)]);
        default: return generateArray('random', n, min, max);
    }
};

// --- Musical Scale Mapping ---
const C_MAJOR_PENTATONIC = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const mapValueToMidi = (value, minVal, maxVal, scale) => {
    const percentage = (value - minVal) / (maxVal - minVal);
    const index = Math.round(percentage * (scale.length - 1));
    return scale[index];
};

/*****************************************
 * Sorting Algorithms -> Step Recorders
 * (No changes to algorithm logic)
 *****************************************/
const recordBubble = (arr) => { const a = arr.slice(); const steps = []; const n = a.length; for (let i = 0; i < n; i++) { for (let j = 0; j < n - i - 1; j++) { steps.push({ type: "compare", i: j, j: j + 1 }); if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; steps.push({ type: "swap", i: j, j: j + 1, array: a.slice() }); } } steps.push({ type: "mark", idx: n - i - 1 }); } steps.push({ type: "done" }); return steps; };
const recordSelection = (arr) => { const a = arr.slice(); const steps = []; const n = a.length; for (let i = 0; i < n; i++) { let min = i; for (let j = i + 1; j < n; j++) { steps.push({ type: "compare", i: min, j }); if (a[j] < a[min]) min = j; } if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; steps.push({ type: "swap", i, j: min, array: a.slice() }); } steps.push({ type: "mark", idx: i }); } steps.push({ type: "done" }); return steps; };
const recordInsertion = (arr) => { const a = arr.slice(); const steps = []; for (let i = 1; i < a.length; i++) { let key = a[i]; steps.push({ type: "pivot", idx: i }); let j = i - 1; while (j >= 0) { steps.push({ type: "compare", i: j, j: i, value: key }); if(a[j] > key) { a[j + 1] = a[j]; steps.push({ type: "set", idx: j + 1, value: a[j], array: a.slice() }); j--; } else { break; } } a[j + 1] = key; steps.push({ type: "set", idx: j + 1, value: key, array: a.slice() }); } for (let i = 0; i < a.length; i++) steps.push({ type: "mark", idx: i }); steps.push({ type: "done" }); return steps; };
const recordMerge = (arr) => { const a = arr.slice(); const steps = []; const mergeSort = (l, r) => { if (l >= r) return; const m = Math.floor((l + r) / 2); mergeSort(l, m); mergeSort(m + 1, r); let i = l, j = m + 1; const temp = []; while (i <= m && j <= r) { steps.push({ type: "compare", i, j }); if (a[i] <= a[j]) temp.push(a[i++]); else temp.push(a[j++]); } while (i <= m) temp.push(a[i++]); while (j <= r) temp.push(a[j++]); for (let t = 0; t < temp.length; t++) { a[l + t] = temp[t]; steps.push({ type: "set", idx: l + t, value: a[l + t], array: a.slice() }); } }; mergeSort(0, a.length - 1); for (let i = 0; i < a.length; i++) steps.push({ type: "mark", idx: i }); steps.push({ type: "done" }); return steps; };
const recordQuick = (arr) => { const a = arr.slice(); const steps = []; const partition = (low, high) => { const pivot = a[high]; steps.push({ type: "pivot", idx: high }); let i = low - 1; for (let j = low; j < high; j++) { steps.push({ type: "compare", i: j, j: high }); if (a[j] < pivot) { i++;[a[i], a[j]] = [a[j], a[i]]; if (i !== j) steps.push({ type: "swap", i, j, array: a.slice() }); } } [a[i + 1], a[high]] = [a[high], a[i + 1]]; if (i + 1 !== high) steps.push({ type: "swap", i: i + 1, j: high, array: a.slice() }); steps.push({ type: "mark", idx: i + 1 }); return i + 1; }; const qsort = (low, high) => { if (low < high) { const pi = partition(low, high); qsort(low, pi - 1); qsort(pi + 1, high); } }; qsort(0, a.length - 1); for (let i = 0; i < a.length; i++) steps.push({ type: "mark", idx: i }); steps.push({ type: "done" }); return steps; };
const recordHeap = (arr) => { const a = arr.slice(); const steps = []; const heapify = (n, i) => { let largest = i; const l = 2 * i + 1; const r = 2 * i + 2; if (l < n) steps.push({ type: "compare", i: l, j: largest }); if (l < n && a[l] > a[largest]) largest = l; if (r < n) steps.push({ type: "compare", i: r, j: largest }); if (r < n && a[r] > a[largest]) largest = r; if (largest !== i) { [a[i], a[largest]] = [a[largest], a[i]]; steps.push({ type: "swap", i, j: largest, array: a.slice() }); heapify(n, largest); } }; const n = a.length; for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i); for (let i = n - 1; i > 0; i--) { [a[0], a[i]] = [a[i], a[0]]; steps.push({ type: "swap", i: 0, j: i, array: a.slice() }); steps.push({ type: "mark", idx: i }); heapify(i, 0); } steps.push({ type: "mark", idx: 0 }); steps.push({ type: "done" }); return steps; };
const recordRadix = (arr) => { let a = arr.slice(); const steps = []; const max = Math.max(...a); for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) { const buckets = Array.from({ length: 10 }, () => []); for (let i = 0; i < a.length; i++) { const digit = Math.floor(a[i] / exp) % 10; buckets[digit].push(a[i]); steps.push({ type: 'pivot', idx: i, value: digit }); } let idx = 0; const newArr = []; for (let i = 0; i < 10; i++) { for (let j = 0; j < buckets[i].length; j++) { newArr[idx] = buckets[i][j]; idx++; } } a = newArr; steps.push({ type: 'set', array: a.slice() }); } for (let i = 0; i < a.length; i++) steps.push({ type: "mark", idx: i }); steps.push({ type: "done" }); return steps; }

const ALGORITHMS = { Bubble: { fn: recordBubble, complexity: { time: "O(n²)", space: "O(1)" } }, Selection: { fn: recordSelection, complexity: { time: "O(n²)", space: "O(1)" } }, Insertion: { fn: recordInsertion, complexity: { time: "O(n²)", space: "O(1)" } }, Merge: { fn: recordMerge, complexity: { time: "O(n log n)", space: "O(n)" } }, Quick: { fn: recordQuick, complexity: { time: "O(n log n)", space: "O(log n)" } }, Heap: { fn: recordHeap, complexity: { time: "O(n log n)", space: "O(1)" } }, Radix: { fn: recordRadix, complexity: { time: "O(nk)", space: "O(n+k)" } }, };
const ALGO_NAMES = Object.keys(ALGORITHMS);
const ARRAY_TYPES = ["random", "nearly-sorted", "reversed", "few-unique"];

/*****************************************
 * Main Sorting Panel Logic Hook
 *****************************************/
const useSortingPanel = (baseArray, algo, beepFn) => {
    const [arr, setArr] = useState(baseArray);
    const [steps, setSteps] = useState([]);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [highlights, setHighlights] = useState(new Set());
    const [pivot, setPivot] = useState(null);
    const [sorted, setSorted] = useState(new Set());
    const [stats, setStats] = useState({ comparisons: 0, mutations: 0, steps: 0 });
    const [timeMs, setTimeMs] = useState(0);
    const startTimeRef = useRef(0);
    const isDone = useMemo(() => currentStepIdx >= steps.length && steps.length > 0, [currentStepIdx, steps.length]);
    const valueRange = useMemo(() => ({ min: Math.min(...baseArray), max: Math.max(...baseArray) }), [baseArray]);

    useEffect(() => {
        const newSteps = ALGORITHMS[algo].fn(baseArray);
        setSteps(newSteps); setArr(baseArray.slice()); setCurrentStepIdx(0); setHighlights(new Set()); setPivot(null); setSorted(new Set()); setStats({ comparisons: 0, mutations: 0, steps: 0 }); setTimeMs(0); startTimeRef.current = 0;
    }, [algo, baseArray]);

    const playSoundForStep = (step) => {
        if (!beepFn) return;
        let midiNote;
        if (step.type === "compare") {
            const avgValue = (arr[step.i] + arr[step.j]) / 2;
            midiNote = mapValueToMidi(avgValue, valueRange.min, valueRange.max, C_MAJOR_PENTATONIC);
            beepFn(midiToFreq(midiNote), 0.3);
        } else if (step.type === "set" && step.value) {
            midiNote = mapValueToMidi(step.value, valueRange.min, valueRange.max, C_MAJOR_PENTATONIC);
            beepFn(midiToFreq(midiNote), 0.3);
        } else if (step.type === "swap") {
            beepFn(midiToFreq(C_MAJOR_PENTATONIC[0]), 0.4, 0.4); // Play a low root note for swaps
        }
    };

    const applyStep = (step) => {
        if (!step) return;
        setStats((s) => ({ ...s, steps: s.steps + 1 }));
        playSoundForStep(step);
        if (step.type === "compare") { setHighlights(new Set([step.i, step.j])); setStats((s) => ({ ...s, comparisons: s.comparisons + 1 })); }
        else if (step.type === "pivot") { setPivot(step.idx); setHighlights(new Set([step.idx])); }
        else if (step.type === "swap") { setHighlights(new Set([step.i, step.j])); setArr(step.array); setStats((s) => ({ ...s, mutations: s.mutations + 1 })); }
        else if (step.type === "set") { if (step.array) { setArr(step.array); } else { setHighlights(new Set([step.idx])); setArr(prev => { const newArr = prev.slice(); newArr[step.idx] = step.value; return newArr; }); } setStats((s) => ({ ...s, mutations: s.mutations + 1 })); }
        else if (step.type === "mark") { setSorted((st) => new Set(st).add(step.idx)); }
        else if (step.type === "done") { setPivot(null); setHighlights(new Set()); if (startTimeRef.current > 0) { setTimeMs(performance.now() - startTimeRef.current); startTimeRef.current = -1; } }
    };

    const stepForward = () => { if (isDone) return; if (startTimeRef.current === 0) { startTimeRef.current = performance.now(); } const step = steps[currentStepIdx]; applyStep(step); setCurrentStepIdx(i => i + 1); };
    return { arr, highlights, pivot, sorted, stats, timeMs, isDone, stepForward, };
};

/*****************************************
 * UI Components
 *****************************************/
function Panel({ title, arr: array, highlights, pivot: pivotIdx, sorted: sortedSet, algo, theme }) {
  const complexity = ALGORITHMS[algo]?.complexity;
  const barColors = theme.barColors;
  return (
    <div className={`flex-1 rounded-2xl p-4 shadow-xl transition-colors duration-500 ${theme.panelBg}`}>
      <div className="flex items-center justify-between mb-3 h-12">
        <h3 className={`text-xl font-semibold tracking-wider ${theme.textSecondary}`}>{title}</h3>
        {complexity && ( <div className="text-right text-xs"><p>Time: <span className="font-mono">{complexity.time}</span></p><p>Space: <span className="font-mono">{complexity.space}</span></p></div> )}
      </div>
      <div className="relative flex items-end gap-px h-[340px] w-full overflow-hidden rounded-md bg-black/20 p-1">
        {array.map((v, idx) => {
          const isCompared = highlights?.has(idx); const isPivot = pivotIdx === idx; const isSorted = sortedSet?.has(idx);
          const color = isPivot ? barColors.pivot : isCompared ? barColors.compare : isSorted ? barColors.sorted : barColors.default;
          const glow = isPivot || isCompared;
          return (
            <div key={idx} className={`w-full transition-all duration-150 rounded-t ${color} ${glow ? 'shadow-[0_0_8px_var(--glow-color)]' : ''}`} style={{ height: `${(v / 400) * 100}%`, '--glow-color': color.replace('bg-', 'var(--tw-color-') }} title={String(v)}/>
          );
        })}
      </div>
    </div>
  );
}

function Stats({ stats, timeMs, theme }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries({ Comparisons: stats.comparisons, "Swaps/Sets": stats.mutations, Steps: stats.steps, "Time (ms)": Math.round(timeMs) }).map(([key, value]) =>(
            <div key={key} className={`rounded-xl p-3 text-center transition-colors duration-500 ${theme.panelBg}`}>
                <div className="text-xs opacity-70">{key}</div>
                <div className="text-xl font-bold font-mono tracking-tighter">{value}</div>
            </div>
        ))}
    </div>
  );
}

/*****************************************
 * Main App Component
 *****************************************/
export default function App() {
  const [themeKey, setThemeKey] = useState('synthwave');
  const currentTheme = themes[themeKey];

  const [size, setSize] = useState(60);
  const [speed, setSpeed] = useState(50);
  const [useBeeps, setUseBeeps] = useState(false);
  const { beep, setEnabled } = useBeep();
  const [arrayType, setArrayType] = useState('random');
  const [baseArray, setBaseArray] = useState(() => generateArray(arrayType, size));
  
  const regenerate = () => setBaseArray(generateArray(arrayType, size));
  useEffect(() => { regenerate(); }, [size, arrayType]);

  const [dualMode, setDualMode] = useState(true);
  const [algoLeft, setAlgoLeft] = useState("Quick");
  const [algoRight, setAlgoRight] = useState("Heap");

  const panelLeft = useSortingPanel(baseArray, algoLeft, beep);
  const panelRight = useSortingPanel(baseArray, algoRight, beep);

  const [playing, setPlaying] = useState(false);
  
  useEffect(() => { setEnabled(useBeeps); }, [useBeeps]);

  const stepBoth = () => {
      if (dualMode) { if (!panelLeft.isDone) panelLeft.stepForward(); if (!panelRight.isDone) panelRight.stepForward(); }
      else { if (!panelLeft.isDone) panelLeft.stepForward(); }
  };

  useEffect(() => {
    if (!playing) return;
    const isFinished = (!dualMode && panelLeft.isDone) || (dualMode && panelLeft.isDone && panelRight.isDone);
    if (isFinished) { setPlaying(false); return; }
    const delay = 500 / Math.max(1, speed);
    const timerId = setTimeout(stepBoth, delay);
    return () => clearTimeout(timerId);
  }, [playing, speed, dualMode, panelLeft, panelRight]);

  const handleReset = () => { setPlaying(false); setBaseArray(arr => [...arr]); };

  return (
    <>
      {currentTheme.grid && <div className="fixed top-0 left-0 w-full h-full bg-[linear-gradient(to_right,rgba(139,103,229,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,103,229,0.2)_1px,transparent_1px)] bg-[size:40px_40px] -z-10 animate-[pulse_8s_ease-in-out_infinite]"></div>}
      <div className={`min-h-screen transition-colors duration-500 ${currentTheme.bg}`}>
        <header className={`px-6 py-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between border-b transition-colors duration-500 ${currentTheme.headerBorder}`}>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Sorting Visualizer</h1>
          <div className={`flex flex-wrap gap-3 text-sm ${currentTheme.textSecondary}`}>
              <span className="inline-flex items-center gap-2"><i className={`w-3 h-3 ${currentTheme.barColors.default} rounded-sm`}/> Default</span>
              <span className="inline-flex items-center gap-2"><i className={`w-3 h-3 ${currentTheme.barColors.compare} rounded-sm`}/> Comparing</span>
              <span className="inline-flex items-center gap-2"><i className={`w-3 h-3 ${currentTheme.barColors.pivot} rounded-sm`}/> Pivot</span>
              <span className="inline-flex items-center gap-2"><i className={`w-3 h-3 ${currentTheme.barColors.sorted} rounded-sm`}/> Sorted</span>
          </div>
        </header>
        
        <section className={`p-4 grid gap-4 lg:grid-cols-3 items-start ${currentTheme.controlBg} border-b ${currentTheme.headerBorder}`}>
          <div className={`${currentTheme.panelBg} p-3 rounded-lg`}>
            <h3 className="font-bold text-sm mb-2">Array Generation</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select className="bg-black/20 rounded-md px-3 py-2 text-sm w-full" value={arrayType} onChange={(e) => setArrayType(e.target.value)} disabled={playing}>
                {ARRAY_TYPES.map(t => <option key={t} value={t}>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
              </select>
              <button className={`px-3 py-2 text-sm rounded-md disabled:opacity-50 flex-1 flex items-center justify-center gap-2 ${currentTheme.button.special}`} onClick={regenerate} disabled={playing}>
                  <RandomizeIcon /> New Array
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2"><span className="text-sm">Size</span><input type="range" min={10} max={150} step={5} value={size} onChange={(e) => setSize(+e.target.value)} disabled={playing} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-black/20"/> <span className="w-10 text-right text-sm">{size}</span></div>
          </div>

          <div className={`${currentTheme.panelBg} p-3 rounded-lg`}>
             <h3 className="font-bold text-sm mb-2">Playback</h3>
             <div className="grid grid-cols-3 gap-2">
                  <button className={`p-2 rounded-md flex items-center justify-center gap-2 ${playing ? currentTheme.button.special : currentTheme.button.primary}`} onClick={() => setPlaying(p => !p)}>
                      {playing ? <PauseIcon /> : <PlayIcon />} {playing ? 'Pause' : 'Play'}
                  </button>
                  <button className={`p-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 ${currentTheme.button.secondary}`} onClick={stepBoth} disabled={playing}><StepIcon /> Step</button>
                  <button className={`p-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 ${currentTheme.button.secondary}`} onClick={handleReset} disabled={playing}><ResetIcon /> Reset</button>
             </div>
             <div className="flex items-center gap-2 mt-2"><span className="text-sm">Speed</span><input type="range" min={1} max={100} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-black/20"/></div>
          </div>

          <div className={`${currentTheme.panelBg} p-3 rounded-lg`}>
            <h3 className="font-bold text-sm mb-2">Settings</h3>
            <div className="flex flex-wrap items-center gap-2">
               <select className="bg-black/20 rounded-md px-3 py-2 text-sm flex-1" value={algoLeft} onChange={(e) => setAlgoLeft(e.target.value)} disabled={playing}>{ALGO_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}</select>
               {dualMode && (<select className="bg-black/20 rounded-md px-3 py-2 text-sm flex-1" value={algoRight} onChange={(e) => setAlgoRight(e.target.value)} disabled={playing}>{ALGO_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}</select>)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dualMode} onChange={(e) => setDualMode(e.target.checked)} />Dual Mode</div>
              <div className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useBeeps} onChange={(e) => setUseBeeps(e.target.checked)} />Sound</div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10">
                <div className="text-sm mb-1">Theme</div>
                <div className="flex gap-2">{Object.keys(themes).map(key => <button key={key} onClick={() => setThemeKey(key)} className={`flex-1 text-sm py-1 rounded-md ${themeKey === key ? 'ring-2 ring-offset-2 ring-offset-current' : ''} ${themes[key].button.secondary}`}>{themes[key].name}</button>)}</div>
            </div>
          </div>
        </section>
        
        <main className="px-4 py-6 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4"><Panel title={`${algoLeft} Sort`} {...panelLeft} algo={algoLeft} theme={currentTheme}/><Stats stats={panelLeft.stats} timeMs={panelLeft.timeMs} theme={currentTheme} /></div>
          {dualMode && ( <div className="grid gap-4"><Panel title={`${algoRight} Sort`} {...panelRight} algo={algoRight} theme={currentTheme} /><Stats stats={panelRight.stats} timeMs={panelRight.timeMs} theme={currentTheme} /></div> )}
        </main>

        <footer className={`px-6 py-4 text-center text-xs opacity-60 border-t ${currentTheme.headerBorder} mt-8`}>
          <p>Tip: Use Dual Mode to compare algorithms. Observe how performance changes with different array types (e.g., Quick Sort on a 'Reversed' array).</p>
        </footer>
      </div>
    </>
  );
}

