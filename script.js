'use strict';
console.log('Pénsum UdeA — build 2026-07-24.5');

/* ==========================================================================
   PERFIL Y PÉNSUM ACTIVOS — cada persona elige su frase y su pénsum;
   todo el almacenamiento queda separado por esa combinación.
   ========================================================================== */

const APP_NS = 'udea_pensum_app';
let activeProfile = null; // frase elegida por la persona (normalizada)
let activeProfileDisplayName = null; // como la escribio la persona, para mostrar
let activePensum = null;  // clave del PENSUM_REGISTRY

function slugifyProfile(text) {
  return (text || '')
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function pensumNsKey(base) {
  return `${APP_NS}::${activeProfile}::${activePensum}::${base}`;
}
function profileNsKey(base) {
  return `${APP_NS}::${activeProfile}::${base}`;
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); return true; } catch (e) { return false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* noop */ }
}

function knownProfiles() {
  const raw = safeGet(`${APP_NS}::known_profiles`);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}
function rememberProfile(slug, displayName) {
  const list = knownProfiles().filter(p => p.slug !== slug);
  list.unshift({ slug, displayName });
  safeSet(`${APP_NS}::known_profiles`, JSON.stringify(list.slice(0, 12)));
}

function activatePensum(pensumKey) {
  const def = PENSUM_REGISTRY[pensumKey];
  if (!def) return false;
  activePensum = pensumKey;
  COURSES = JSON.parse(JSON.stringify(def.courses));
  PROGRAM_META = JSON.parse(JSON.stringify(def.meta));
  ELECTIVE_CREDITS_REQUIRED = def.electiveCreditsRequired;
  CORE_LEVELS = def.coreLevels;
  CORE_CREDITS_TOTAL = COURSES.filter(c => c.type === 'nucleo').reduce((s, c) => s + c.credits, 0);
  PROGRAM_CREDITS_TOTAL = CORE_CREDITS_TOTAL + ELECTIVE_CREDITS_REQUIRED;
  rebuildByCode();
  const mark = document.getElementById('brand-mark');
  if (mark) mark.innerHTML = PENSUM_ICONS[pensumKey] || PENSUM_ICON_DEFAULT;
  return true;
}

function loadAllUserData() {
  progress = loadProgress();
  grades = loadGrades();
  extraGrades = loadExtraGrades();
  inProgressExtras = loadInProgressExtras();
  settings = loadSettings();
  loadElectiveOverrides();
}

/* ==========================================================================
   ESTADO GLOBAL
   ========================================================================== */

const STORAGE_KEY = 'udea_pensum_progress_v1';
const GRADES_STORAGE_KEY = 'udea_pensum_grades_v1';
const ELECTIVES_KEY = 'udea_pensum_electives_v1';
const SETTINGS_KEY = 'udea_pensum_settings_v1';
const STATES = ['no-cursada', 'en-curso', 'aprobada', 'perdida'];
const STATE_LABEL = {
  'no-cursada': 'No cursada',
  'en-curso': 'En curso',
  'aprobada': 'Aprobada',
  'perdida': 'Perdida',
};

const ACCENT_PRESETS = {
  violeta: { accent: '#7C6FF0', soft: 'rgba(124, 111, 240, 0.14)', glow: 'rgba(124, 111, 240, 0.35)', label: 'Violeta' },
  dorado:  { accent: '#E3B341', soft: 'rgba(227, 179, 65, 0.14)',  glow: 'rgba(227, 179, 65, 0.35)',  label: 'Dorado' },
  azul:    { accent: '#5AA9F9', soft: 'rgba(90, 169, 249, 0.14)',  glow: 'rgba(90, 169, 249, 0.35)',  label: 'Azul' },
  verde:   { accent: '#34D399', soft: 'rgba(52, 211, 153, 0.14)',  glow: 'rgba(52, 211, 153, 0.35)',  label: 'Verde' },
  rosa:    { accent: '#F472B6', soft: 'rgba(244, 114, 182, 0.14)', glow: 'rgba(244, 114, 182, 0.35)', label: 'Rosa' },
  coral:   { accent: '#F76C6C', soft: 'rgba(247, 108, 108, 0.14)', glow: 'rgba(247, 108, 108, 0.35)', label: 'Coral' },
};

// Cada pénsum tiene su propio logo, para diferenciarlos a simple vista.
const PENSUM_ICONS = {
  'mate-v6': `<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 19L18 5M12 19L6 5M8.5 11H15.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  'mate-v5': `<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 19L18 5M12 19L6 5M8.5 11H15.5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  'astro-v4': `<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="4.3" fill="currentColor"/><circle cx="8.7" cy="8.8" r="1.15" fill="rgba(0,0,0,0.22)"/><ellipse cx="11" cy="12.2" rx="10.2" ry="3" transform="rotate(-24 11 12.2)" stroke="currentColor" stroke-width="1.5"/><circle cx="19.5" cy="5.2" r="1" fill="currentColor"/><circle cx="4" cy="17.5" r="0.7" fill="currentColor"/></svg>`,
};
const PENSUM_ICON_DEFAULT = `<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M3.5 3.5V19.5C3.5 20.0523 3.94772 20.5 4.5 20.5H20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 15.5C7.2 6.3 12.5 5.8 14.3 11.6C16 17 19 9.5 20 6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let COURSES = [];
let PROGRAM_META = {};
let ELECTIVE_CREDITS_REQUIRED = 0;
let CORE_LEVELS = 0;

let progress = {};
let activeTab = 'dashboard';
let selectedCourse = null;
let filters = { query: '', level: 'all', status: 'all', availability: 'all' };
let treeTransform = { x: 0, y: 0, scale: 0.85 };
let worldWidth = 0;
let worldHeight = 0;
let treeBuilt = false;
let isPanning = false;
let panStart = { x: 0, y: 0 };
let transformStart = { x: 0, y: 0 };
let showAddElectiveForm = false;
let removedDefaultCodes = [];
let editedDefaults = {};
let editingElectiveCode = null;

const byCode = {};
function rebuildByCode() {
  for (const k in byCode) delete byCode[k];
  COURSES.forEach(c => { byCode[c.code] = c; });
}

/* ---- Electivas: el banco cambia cada semestre, así que son editables ---- */

function loadElectiveOverrides() {
  try {
    const raw = localStorage.getItem(pensumNsKey(ELECTIVES_KEY));
    if (!raw) return; // primera vez: se quedan las electivas oficiales tal como están en el código
    const saved = JSON.parse(raw);

    // Formato antiguo (array plano que reemplazaba TODO el banco): se descarta,
    // porque congelaba electivas viejas y tapaba correcciones futuras del pénsum oficial.
    if (Array.isArray(saved)) {
      localStorage.removeItem(pensumNsKey(ELECTIVES_KEY));
      return;
    }
    if (!saved || typeof saved !== 'object') return;

    removedDefaultCodes = Array.isArray(saved.removedDefaultCodes) ? saved.removedDefaultCodes : [];
    const customElectives = Array.isArray(saved.customElectives) ? saved.customElectives : [];
    editedDefaults = (saved.editedDefaults && typeof saved.editedDefaults === 'object') ? saved.editedDefaults : {};

    // quita las electivas oficiales que el estudiante eliminó explícitamente
    for (let i = COURSES.length - 1; i >= 0; i--) {
      if (COURSES[i].type === 'electiva' && removedDefaultCodes.includes(COURSES[i].code)) {
        COURSES.splice(i, 1);
      }
    }
    // aplica ediciones guardadas sobre electivas oficiales que siguen presentes
    Object.entries(editedDefaults).forEach(([code, patch]) => {
      const course = COURSES.find(c => c.code === code && c.type === 'electiva');
      if (!course) return;
      if (patch.name !== undefined) course.name = patch.name;
      if (patch.credits !== undefined) course.credits = patch.credits;
      if (Array.isArray(patch.prereqs)) course.prereqs = patch.prereqs;
      if (Array.isArray(patch.coreqs)) course.coreqs = patch.coreqs;
      course.prereqsUnknown = false;
    });
    // agrega las electivas personalizadas que el estudiante creó
    customElectives.forEach(e => COURSES.push({
      code: e.code, name: e.name, credits: e.credits, level: 0,
      prereqs: Array.isArray(e.prereqs) ? e.prereqs : [],
      coreqs: Array.isArray(e.coreqs) ? e.coreqs : [],
      creditGate: 0, type: 'electiva', custom: true,
    }));
    rebuildByCode();
  } catch (e) {
    console.warn('No se pudieron cargar las electivas guardadas:', e);
  }
}

function persistElectives() {
  try {
    localStorage.setItem(pensumNsKey(ELECTIVES_KEY), JSON.stringify({
      removedDefaultCodes,
      editedDefaults,
      customElectives: COURSES.filter(c => c.type === 'electiva' && c.custom)
        .map(c => ({ code: c.code, name: c.name, credits: c.credits, prereqs: c.prereqs, coreqs: c.coreqs })),
    }));
  } catch (e) {
    console.warn('No se pudieron guardar las electivas:', e);
  }
}

function generateElectiveCode() {
  let n = 1;
  let code;
  do { code = `ELEC-${n}`; n++; } while (byCode[code]);
  return code;
}

function editElective(code, { name, credits, prereqs, coreqs }) {
  const course = byCode[code];
  if (!course || course.type !== 'electiva') return false;
  name = (name || '').trim();
  credits = Number(credits);
  if (!name || !Number.isFinite(credits) || credits <= 0) {
    toast('Escribe un nombre y un número de créditos válido');
    return false;
  }
  course.name = name;
  course.credits = credits;
  course.prereqs = Array.isArray(prereqs) ? prereqs : [];
  course.coreqs = Array.isArray(coreqs) ? coreqs : [];
  course.prereqsUnknown = false;

  if (!course.custom) {
    editedDefaults[code] = { name: course.name, credits: course.credits, prereqs: course.prereqs, coreqs: course.coreqs };
  }
  rebuildByCode();
  persistElectives();
  invalidateTree();
  refreshAll();
  toast(`"${course.name}" actualizada`);
  return true;
}

function addElective(name, credits, prereqs, coreqs, customCode) {
  name = (name || '').trim();
  credits = Number(credits);
  if (!name || !Number.isFinite(credits) || credits <= 0) {
    toast('Escribe un nombre y un número de créditos válido');
    return;
  }
  let code = (customCode || '').trim();
  if (code) {
    if (byCode[code]) {
      toast(`El código ${code} ya está en uso por otra materia`);
      return;
    }
  } else {
    code = generateElectiveCode();
  }
  COURSES.push({
    code, name, credits, level: 0,
    prereqs: Array.isArray(prereqs) ? prereqs : [],
    coreqs: Array.isArray(coreqs) ? coreqs : [],
    creditGate: 0, type: 'electiva', custom: true,
  });
  rebuildByCode();
  persistElectives();
  invalidateTree();
  refreshAll();
  toast(`Electiva añadida: ${name}`);
}

function removeElective(code) {
  const course = byCode[code];
  if (!course || course.type !== 'electiva') return;
  const idx = COURSES.findIndex(c => c.code === code);
  if (idx === -1) return;
  if (!course.custom && !removedDefaultCodes.includes(code)) {
    removedDefaultCodes.push(code);
  }
  COURSES.splice(idx, 1);
  delete progress[code];
  saveProgress();
  rebuildByCode();
  persistElectives();
  invalidateTree();
  if (selectedCourse === code) closePanel();
  refreshAll();
  toast('Electiva eliminada');
}

function invalidateTree() {
  treeBuilt = false;
  if (activeTab === 'arbol') buildTree();
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(pensumNsKey(STORAGE_KEY));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (e) {
    console.warn('No se pudo leer el progreso guardado:', e);
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(pensumNsKey(STORAGE_KEY), JSON.stringify(progress));
  } catch (e) {
    console.warn('No se pudo guardar el progreso:', e);
  }
}

function getState(code) {
  return progress[code] || 'no-cursada';
}

function setState(code, state) {
  if (!STATES.includes(state)) return;
  if (state === 'no-cursada') delete progress[code];
  else progress[code] = state;
  saveProgress();
  refreshAll();
  toast(`${byCode[code].name} → ${STATE_LABEL[state]}`);
}

/* ==========================================================================
   NOTAS: nota final por materia y parciales de materias en curso
   ========================================================================== */

let grades = {};

function loadGrades() {
  try {
    const raw = localStorage.getItem(pensumNsKey(GRADES_STORAGE_KEY));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (e) {
    console.warn('No se pudieron leer las notas guardadas:', e);
    return {};
  }
}

function saveGrades() {
  try {
    localStorage.setItem(pensumNsKey(GRADES_STORAGE_KEY), JSON.stringify(grades));
  } catch (e) {
    console.warn('No se pudieron guardar las notas:', e);
  }
}

function getGradeEntry(code) {
  if (!grades[code]) grades[code] = { finalGrade: null, semester: null, partials: [] };
  if (!Array.isArray(grades[code].partials)) grades[code].partials = [];
  if (grades[code].semester === undefined) grades[code].semester = null;
  return grades[code];
}

function setFinalGrade(code, value, semester) {
  const entry = getGradeEntry(code);
  if (value === null || value === '' || Number.isNaN(Number(value))) {
    entry.finalGrade = null;
  } else {
    entry.finalGrade = Math.max(0, Math.min(5, Number(value)));
  }
  if (semester !== undefined) {
    entry.semester = semester && semester.trim() ? semester.trim() : null;
  }
  saveGrades();
}

function addPartial(code, name, weight, grade) {
  const entry = getGradeEntry(code);
  entry.partials.push({
    id: `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: name || `Parcial ${entry.partials.length + 1}`,
    weight: Math.max(0, Math.min(100, Number(weight) || 0)),
    grade: Math.max(0, Math.min(5, Number(grade) || 0)),
  });
  saveGrades();
}

function removePartial(code, partialId) {
  const entry = getGradeEntry(code);
  entry.partials = entry.partials.filter(p => p.id !== partialId);
  saveGrades();
}

function partialsWeightSum(code) {
  return getGradeEntry(code).partials.reduce((s, p) => s + p.weight, 0);
}

function partialsWeightedContribution(code) {
  return getGradeEntry(code).partials.reduce((s, p) => s + (p.weight / 100) * p.grade, 0);
}

// Promedio ponderado acumulado: suma(nota*creditos) / suma(creditos),
// sobre las materias con nota final registrada (aprobadas o perdidas),
// más las materias adicionales/homologadas agregadas manualmente.
function weightedAverage() {
  let creditSum = 0;
  let weightedSum = 0;
  const rows = [];
  COURSES.forEach(c => {
    const entry = grades[c.code];
    const st = getState(c.code);
    if (entry && entry.finalGrade !== null && (st === 'aprobada' || st === 'perdida')) {
      creditSum += c.credits;
      weightedSum += entry.finalGrade * c.credits;
      rows.push({ type: 'course', course: c, grade: entry.finalGrade, semester: entry.semester });
    }
  });
  extraGrades.forEach(ex => {
    creditSum += ex.credits;
    weightedSum += ex.grade * ex.credits;
    rows.push({ type: 'extra', extra: ex, grade: ex.grade, semester: ex.semester });
  });
  return {
    average: creditSum > 0 ? weightedSum / creditSum : null,
    creditSum,
    rows: rows.sort((a, b) => {
      const la = a.type === 'course' ? a.course.level : 99;
      const lb = b.type === 'course' ? b.course.level : 99;
      return la - lb || b.grade - a.grade;
    }),
  };
}

// Promedios por semestre: agrupa todas las filas (materias + adicionales)
// que tengan un semestre asignado y calcula el ponderado de cada uno.
function semesterAverages() {
  const { rows } = weightedAverage();
  const groups = {};
  rows.forEach(row => {
    const sem = row.semester;
    if (!sem) return; // sin semestre asignado, no se agrupa
    const credits = row.type === 'course' ? row.course.credits : row.extra.credits;
    if (!groups[sem]) groups[sem] = { creditSum: 0, weightedSum: 0, count: 0, rows: [] };
    groups[sem].creditSum += credits;
    groups[sem].weightedSum += row.grade * credits;
    groups[sem].count += 1;
    groups[sem].rows.push(row);
  });
  return Object.entries(groups)
    .map(([semester, g]) => ({
      semester,
      average: g.creditSum > 0 ? g.weightedSum / g.creditSum : null,
      creditSum: g.creditSum,
      count: g.count,
      rows: g.rows.sort((a, b) => b.grade - a.grade),
    }))
    .sort((a, b) => a.semester.localeCompare(b.semester, undefined, { numeric: true }));
}

/* ==========================================================================
   COMPLETAR / CANCELAR una materia en curso del pénsum
   ========================================================================== */

let showCompleteFormFor = new Set();

function completeCourse(course, contribution, semester) {
  if (!semester || !semester.trim()) { toast('Indica en qué semestre viste esta materia'); return; }
  const passed = contribution >= 3.0;
  setFinalGrade(course.code, contribution, semester);
  showCompleteFormFor.delete(course.code);
  setState(course.code, passed ? 'aprobada' : 'perdida'); // ya refresca todo y muestra el toast
}

function cancelCourse(course) {
  showConfirm(`¿Cancelar "${course.name}"? Volverá a "No cursada" y se perderán sus notas parciales.`, () => {
    grades[course.code] = { finalGrade: null, semester: null, partials: [] };
    saveGrades();
    showCompleteFormFor.delete(course.code);
    setState(course.code, 'no-cursada'); // ya refresca todo y muestra el toast
  });
}

/* ==========================================================================
   MATERIAS EN CURSO ADICIONALES (optativas/homologadas que se están cursando
   ahora mismo, con sus propios parciales, antes de completarse)
   ========================================================================== */

const INPROGRESS_EXTRAS_KEY = 'udea_pensum_inprogress_extras_v1';
let inProgressExtras = [];
let showAddInProgressForm = false;

function loadInProgressExtras() {
  try {
    const raw = localStorage.getItem(pensumNsKey(INPROGRESS_EXTRAS_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('No se pudieron leer las materias en curso adicionales:', e);
    return [];
  }
}

function saveInProgressExtras() {
  try {
    localStorage.setItem(pensumNsKey(INPROGRESS_EXTRAS_KEY), JSON.stringify(inProgressExtras));
  } catch (e) {
    console.warn('No se pudieron guardar las materias en curso adicionales:', e);
  }
}

function allUsedCodes() {
  return new Set([
    ...COURSES.map(c => c.code),
    ...extraGrades.map(e => e.code).filter(Boolean),
    ...inProgressExtras.map(e => e.code).filter(Boolean),
  ]);
}

function generateInProgressCode() {
  const existing = allUsedCodes();
  let n = 1;
  let code;
  do { code = `CURSO-${n}`; n++; } while (existing.has(code));
  return code;
}

function addInProgressExtra(name, credits, code) {
  name = (name || '').trim();
  credits = Number(credits);
  if (!name) { toast('Escribe un nombre para la materia'); return false; }
  if (!credits || credits <= 0) { toast('Ingresa un número de créditos válido'); return false; }
  code = (code || '').trim();
  if (!code) code = generateInProgressCode();
  inProgressExtras.push({
    id: `ip_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name, credits, code,
  });
  saveInProgressExtras();
  return true;
}

function removeInProgressExtra(id) {
  const item = inProgressExtras.find(e => e.id === id);
  if (item) delete grades[item.code];
  inProgressExtras = inProgressExtras.filter(e => e.id !== id);
  saveGrades();
  saveInProgressExtras();
}

function completeInProgressExtra(id, semester) {
  const item = inProgressExtras.find(e => e.id === id);
  if (!item) return;
  if (!semester || !semester.trim()) { toast('Indica en qué semestre cursaste esta materia'); return; }
  const contribution = partialsWeightedContribution(item.code);
  const status = contribution >= 3.0 ? 'aprobada' : 'perdida';
  extraGrades.push({
    id: `ex_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: item.name, credits: item.credits, code: item.code,
    grade: contribution, status, semester: semester.trim(),
  });
  saveExtraGrades();
  delete grades[item.code];
  saveGrades();
  inProgressExtras = inProgressExtras.filter(e => e.id !== id);
  saveInProgressExtras();
  refreshAll();
  toast(`"${item.name}" completada — nota ${contribution.toFixed(2)}`);
}

/* ==========================================================================
   MATERIAS ADICIONALES / HOMOLOGADAS (no pertenecen al pénsum oficial
   pero también cuentan en el promedio ponderado)
   ========================================================================== */

const EXTRA_GRADES_KEY = 'udea_pensum_extra_grades_v1';
let extraGrades = [];
let showAddExtraGradeForm = false;
let expandedSemesters = new Set();

function loadExtraGrades() {
  try {
    const raw = localStorage.getItem(pensumNsKey(EXTRA_GRADES_KEY));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('No se pudieron leer las materias adicionales:', e);
    return [];
  }
}

function saveExtraGrades() {
  try {
    localStorage.setItem(pensumNsKey(EXTRA_GRADES_KEY), JSON.stringify(extraGrades));
  } catch (e) {
    console.warn('No se pudieron guardar las materias adicionales:', e);
  }
}

function generateExtraCode() {
  const existing = allUsedCodes();
  let n = 1;
  let code;
  do { code = `ADIC-${n}`; n++; } while (existing.has(code));
  return code;
}

function addExtraGrade(name, credits, grade, semester, code, status) {
  name = (name || '').trim();
  credits = Number(credits);
  grade = Number(grade);
  if (!name) { toast('Escribe un nombre para la materia'); return false; }
  if (!credits || credits <= 0) { toast('Ingresa un número de créditos válido'); return false; }
  if (Number.isNaN(grade) || grade < 0 || grade > 5) { toast('Ingresa una nota entre 0.0 y 5.0'); return false; }
  code = (code || '').trim();
  if (!code) code = generateExtraCode();
  extraGrades.push({
    id: `ex_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name, credits, grade, code,
    status: status === 'perdida' ? 'perdida' : 'aprobada',
    semester: semester && semester.trim() ? semester.trim() : null,
  });
  saveExtraGrades();
  return true;
}

function removeExtraGrade(id) {
  extraGrades = extraGrades.filter(e => e.id !== id);
  saveExtraGrades();
}

/* ==========================================================================
   LÓGICA DE NEGOCIO
   ========================================================================== */

function creditsApproved() {
  return COURSES.filter(c => getState(c.code) === 'aprobada')
    .reduce((sum, c) => sum + c.credits, 0);
}

function creditsApprovedCore() {
  return COURSES.filter(c => c.type === 'nucleo' && getState(c.code) === 'aprobada')
    .reduce((sum, c) => sum + c.credits, 0);
}

function creditsApprovedElective() {
  return COURSES.filter(c => c.type === 'electiva' && getState(c.code) === 'aprobada')
    .reduce((sum, c) => sum + c.credits, 0);
}

let CORE_CREDITS_TOTAL = 0;
let PROGRAM_CREDITS_TOTAL = 0;

function prereqsMet(course) {
  const creditsOk = creditsApproved() >= course.creditGate;
  const prereqsOk = course.prereqs.every(p => getState(p) === 'aprobada');
  // Un correquisito debe estar aprobado, o estarse cursando al mismo tiempo,
  // para que la materia se considere realmente disponible para matricular.
  const coreqsOk = course.coreqs.every(c => ['aprobada', 'en-curso'].includes(getState(c)));
  return creditsOk && prereqsOk && coreqsOk;
}

function isAvailable(course) {
  const st = getState(course.code);
  if (st !== 'no-cursada') return false; // ya tiene un estado propio
  if (course.prereqsUnknown) return false; // requisitos aún no confirmados
  return prereqsMet(course);
}

// Color / estado visual efectivo de una materia (para tarjetas y nodos)
function effectiveStatus(course) {
  const st = getState(course.code);
  if (st === 'aprobada') return 'aprobada';
  if (st === 'en-curso') return 'en-curso';
  if (st === 'perdida') return 'perdida';
  if (course.prereqsUnknown) return 'sin-confirmar';
  return isAvailable(course) ? 'disponible' : 'bloqueada';
}

function unlocksOf(code) {
  return COURSES.filter(c => c.prereqs.includes(code) || c.coreqs.includes(code));
}

function countBy(predicate) {
  return COURSES.filter(predicate).length;
}

/* ==========================================================================
   UTILIDADES DOM
   ========================================================================== */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (c === null || c === undefined) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// Confirmación propia de la app: nunca depende de window.confirm(), que algunos
// navegadores silencian automáticamente después de varios cuadros seguidos.
function showConfirm(message, onConfirm) {
  const existing = document.querySelector('.confirm-backdrop');
  if (existing) existing.remove();

  const backdrop = el('div', { class: 'confirm-backdrop' });
  const box = el('div', { class: 'confirm-box' }, [
    el('p', { class: 'confirm-message' }, message),
    el('div', { class: 'confirm-actions' }, [
      el('button', { class: 'btn-ghost', onclick: () => backdrop.remove() }, 'Cancelar'),
      el('button', {
        class: 'btn-ghost btn-confirm-danger',
        onclick: () => { backdrop.remove(); onConfirm(); },
      }, 'Sí, continuar'),
    ]),
  ]);
  backdrop.appendChild(box);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  document.body.appendChild(backdrop);
}

/* ==========================================================================
   TABS
   ========================================================================== */

function setTab(tab) {
  activeTab = tab;
  $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  if (tab === 'arbol' && !treeBuilt) buildTree();
  if (tab === 'arbol') requestAnimationFrame(centerTree);
  if (tab === 'promedio') renderPromedio();
  if (tab === 'notas') renderNotas();
}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */

function renderDashboard() {
  const approved = creditsApproved();
  const pct = Math.min(100, Math.round((approved / PROGRAM_CREDITS_TOTAL) * 1000) / 10);

  $('#dash-pct').textContent = `${pct}%`;
  $('#dash-progress-fill').style.width = `${pct}%`;
  const ring = $('#hero-ring-fill');
  const circumference = 2 * Math.PI * 86;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference * (1 - pct / 100)}`;
  $('#dash-credits-approved').textContent = approved;
  $('#dash-credits-total').textContent = PROGRAM_CREDITS_TOTAL;
  $('#dash-credits-pending').textContent = Math.max(0, PROGRAM_CREDITS_TOTAL - approved);

  const stats = [
    { key: 'aprobada', label: 'Materias aprobadas' },
    { key: 'en-curso', label: 'Materias en curso' },
    { key: 'perdida', label: 'Materias perdidas' },
  ];
  $('#dash-approved-count').textContent = countBy(c => getState(c.code) === 'aprobada');
  $('#dash-progress-count').textContent = countBy(c => getState(c.code) === 'en-curso');
  $('#dash-failed-count').textContent = countBy(c => getState(c.code) === 'perdida');
  $('#dash-available-count').textContent = countBy(c => isAvailable(c));
  $('#dash-total-subjects').textContent = COURSES.length;
  $('#dash-seen-count').textContent = countBy(c => c.type === 'electiva' && getState(c.code) !== 'no-cursada');

  renderLevelProgress();
  renderLegend('#dash-legend');
}

function renderLevelProgress() {
  const wrap = $('#dash-level-progress');
  wrap.innerHTML = '';
  for (let lvl = 1; lvl <= CORE_LEVELS; lvl++) {
    const courses = COURSES.filter(c => c.level === lvl);
    const total = courses.reduce((s, c) => s + c.credits, 0);
    const approved = courses.filter(c => getState(c.code) === 'aprobada').reduce((s, c) => s + c.credits, 0);
    const pct = total ? Math.round((approved / total) * 100) : 0;
    wrap.appendChild(el('div', { class: 'level-row' }, [
      el('div', { class: 'level-row-label' }, `Nivel ${lvl}`),
      el('div', { class: 'level-row-bar' }, [
        el('div', { class: 'level-row-fill', style: `width:${pct}%` }),
      ]),
      el('div', { class: 'level-row-pct' }, `${pct}%`),
    ]));
  }
  const elecApproved = creditsApprovedElective();
  const elecComplete = elecApproved >= ELECTIVE_CREDITS_REQUIRED;
  const elecPct = Math.min(100, Math.round((elecApproved / ELECTIVE_CREDITS_REQUIRED) * 100));
  wrap.appendChild(el('div', { class: `level-row${elecComplete ? ' level-row-complete' : ''}` }, [
    el('div', { class: 'level-row-label' }, 'Electivas'),
    el('div', { class: 'level-row-bar' }, [
      el('div', { class: `level-row-fill electiva${elecComplete ? ' complete' : ''}`, style: `width:${elecPct}%` }),
    ]),
    el('div', { class: 'level-row-pct' }, elecComplete ? '✓' : `${elecPct}%`),
  ]));

  const banner = $('#electives-complete-banner');
  if (elecComplete) {
    banner.innerHTML = '';
    banner.appendChild(el('span', { class: 'electives-complete-icon' }, '✓'));
    banner.appendChild(el('span', {}, `¡Completaste tus electivas! (${elecApproved}/${ELECTIVE_CREDITS_REQUIRED} créditos)`));
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

function renderLegend(target) {
  const items = [
    ['aprobada', 'Aprobada'],
    ['en-curso', 'En curso'],
    ['perdida', 'Perdida'],
    ['disponible', 'Disponible'],
    ['bloqueada', 'Bloqueada'],
    ['sin-confirmar', 'Requisitos sin confirmar'],
  ];
  const wrap = $(target);
  if (!wrap) return;
  wrap.innerHTML = '';
  items.forEach(([key, label]) => {
    wrap.appendChild(el('div', { class: 'legend-item' }, [
      el('span', { class: `dot dot-${key}` }),
      el('span', {}, label),
    ]));
  });
}

/* ==========================================================================
   PÉNSUM (tarjetas por nivel)
   ========================================================================== */

function matchesFilters(course) {
  const q = filters.query.trim().toLowerCase();
  if (q) {
    const inName = course.name.toLowerCase().includes(q);
    const inCode = course.code.toLowerCase().includes(q);
    if (!inName && !inCode) return false;
  }
  if (filters.level !== 'all' && String(course.level) !== filters.level) return false;
  const status = effectiveStatus(course);
  if (filters.status !== 'all' && status !== filters.status) return false;
  if (filters.availability === 'disponibles' && status !== 'disponible') return false;
  if (filters.availability === 'bloqueadas' && status !== 'bloqueada') return false;
  return true;
}

function courseCard(course) {
  if (course.type === 'electiva' && editingElectiveCode === course.code) {
    return buildEditElectiveCard(course);
  }
  const status = effectiveStatus(course);
  const isElective = course.type === 'electiva';
  const card = el('div', {
    class: `course-card status-${status}`,
    'data-code': course.code,
    onclick: () => openPanel(course.code),
  }, [
    el('div', { class: 'course-card-top' }, [
      el('span', { class: 'course-code' }, course.code),
      isElective
        ? el('div', { class: 'elective-card-actions' }, [
            el('button', {
              class: 'chip-remove chip-edit',
              title: 'Editar prerrequisitos y correquisitos',
              onclick: (e) => { e.stopPropagation(); openEditElectiveForm(course); },
            }, '✎'),
            el('button', {
              class: 'chip-remove',
              title: 'Quitar esta electiva',
              onclick: (e) => { e.stopPropagation(); removeElective(course.code); },
            }, '✕'),
          ])
        : el('span', { class: `status-pill status-pill-${status}` }, statusLabel(status)),
    ]),
    el('div', { class: 'course-name' }, course.name),
    course.prereqsUnknown
      ? el('p', { class: 'elective-unknown-note' }, 'Prerrequisitos aún no confirmados — edítala para agregarlos.')
      : null,
    el('div', { class: 'course-card-bottom' }, [
      el('span', { class: 'course-credits' }, `${course.credits} créd.`),
      isElective
        ? el('span', { class: `status-pill status-pill-${status}` }, statusLabel(status))
        : el('span', { class: 'course-level' }, `Nivel ${course.level}`),
    ]),
  ]);
  return card;
}

function statusLabel(status) {
  return {
    'aprobada': 'Aprobada',
    'en-curso': 'En curso',
    'perdida': 'Perdida',
    'disponible': 'Disponible',
    'bloqueada': 'Bloqueada',
    'sin-confirmar': 'Requisitos sin confirmar',
  }[status];
}

function renderPensum() {
  const container = $('#pensum-levels');
  container.innerHTML = '';
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];

  let anyVisible = false;

  levels.forEach(lvl => {
    const rawCourses = COURSES.filter(c => c.level === lvl);
    const courses = rawCourses.filter(matchesFilters);
    const isElectiveLevel = lvl === 0;
    const showEmptyElectiveState = isElectiveLevel && rawCourses.length === 0 && !filters.query && filters.level === 'all' && filters.status === 'all' && filters.availability === 'all';
    if (courses.length === 0 && !showEmptyElectiveState) return;
    anyVisible = true;
    const title = isElectiveLevel ? 'Electivas' : `Nivel ${lvl}`;
    const sub = isElectiveLevel
      ? `Banco actual · mínimo ${ELECTIVE_CREDITS_REQUIRED} créditos exigidos · cambia cada semestre`
      : `${courses.length} materia${courses.length > 1 ? 's' : ''}`;

    const head = el('div', { class: 'level-section-head' }, [
      el('h3', {}, title),
      el('span', { class: 'level-section-sub' }, sub),
    ]);
    if (isElectiveLevel) {
      head.appendChild(el('button', {
        class: 'btn-ghost btn-add-elective',
        onclick: () => { showAddElectiveForm = !showAddElectiveForm; renderPensum(); },
      }, showAddElectiveForm ? 'Cancelar' : '+ Añadir electiva'));
    }

    const sectionChildren = [head];

    if (isElectiveLevel && showAddElectiveForm) {
      sectionChildren.push(buildAddElectiveForm());
    }

    if (courses.length > 0) {
      sectionChildren.push(el('div', { class: 'course-grid' }, courses.map(courseCard)));
    } else if (showEmptyElectiveState) {
      sectionChildren.push(el('p', { class: 'level-section-empty' }, 'No tienes electivas registradas este semestre. Añádelas con el botón de arriba.'));
    }

    container.appendChild(el('section', { class: 'level-section' }, sectionChildren));
  });

  $('#pensum-empty').style.display = anyVisible ? 'none' : 'flex';

  const levelSelect = $('#filter-level');
  if (levelSelect.options.length <= 1) {
    for (let lvl = 1; lvl <= CORE_LEVELS; lvl++) {
      levelSelect.appendChild(el('option', { value: String(lvl) }, `Nivel ${lvl}`));
    }
    levelSelect.appendChild(el('option', { value: '0' }, 'Electivas'));
  }
}

function buildCoursePicker(placeholderText, excludeCode, initialSelected) {
  let selected = Array.isArray(initialSelected) ? initialSelected.slice() : [];
  const chipsWrap = el('div', { class: 'picker-chips' });
  const resultsWrap = el('div', { class: 'picker-results' });
  const searchInput = el('input', { class: 'input-sm', type: 'text', placeholder: placeholderText });

  function renderChips() {
    chipsWrap.innerHTML = '';
    selected.forEach(code => {
      const c = byCode[code];
      chipsWrap.appendChild(el('span', {
        class: 'chip chip-picker',
        onclick: () => { selected = selected.filter(x => x !== code); renderChips(); },
      }, [
        el('span', {}, c ? `${c.code} · ${c.name}` : code),
        el('span', { class: 'chip-picker-remove' }, ' ✕'),
      ]));
    });
  }

  function renderResults(query) {
    resultsWrap.innerHTML = '';
    const q = query.trim().toLowerCase();
    if (!q) { resultsWrap.classList.remove('show'); return; }
    const matches = COURSES.filter(c =>
      c.code !== excludeCode &&
      !selected.includes(c.code) &&
      (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    ).slice(0, 8);
    if (matches.length === 0) {
      resultsWrap.appendChild(el('div', { class: 'picker-result-empty' }, 'Sin resultados'));
    } else {
      matches.forEach(c => {
        resultsWrap.appendChild(el('div', {
          class: 'picker-result-item',
          onclick: () => {
            selected.push(c.code);
            searchInput.value = '';
            resultsWrap.classList.remove('show');
            renderChips();
          },
        }, `${c.code} · ${c.name} ${c.type === 'electiva' ? '(electiva)' : `(nivel ${c.level})`}`));
      });
    }
    resultsWrap.classList.add('show');
  }

  searchInput.addEventListener('input', e => renderResults(e.target.value));
  searchInput.addEventListener('focus', e => { if (e.target.value) renderResults(e.target.value); });

  renderChips();
  const wrap = el('div', { class: 'picker-wrap' }, [searchInput, resultsWrap, chipsWrap]);
  return { wrap, getSelected: () => selected.slice() };
}

function buildAddElectiveForm() {
  const codeInput = el('input', { class: 'filter-input elective-code-input', type: 'text', placeholder: 'Código (opcional)' });
  const nameInput = el('input', { class: 'filter-input', type: 'text', placeholder: 'Nombre de la electiva' });
  const creditsInput = el('input', { class: 'filter-input elective-credits-input', type: 'number', min: '1', max: '10', placeholder: 'Créditos' });

  const prereqPicker = buildCoursePicker('Buscar materia por nombre o código…');
  const coreqPicker = buildCoursePicker('Buscar materia por nombre o código…');

  const submit = () => {
    addElective(nameInput.value, creditsInput.value, prereqPicker.getSelected(), coreqPicker.getSelected(), codeInput.value);
    showAddElectiveForm = false;
  };
  [codeInput, nameInput, creditsInput].forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));

  return el('div', { class: 'add-elective-form add-elective-form-full' }, [
    el('div', { class: 'add-elective-basic-row' }, [
      codeInput,
      nameInput,
      creditsInput,
    ]),
    el('div', { class: 'add-elective-picker-row' }, [
      el('div', { class: 'add-elective-picker-col' }, [
        el('span', { class: 'form-label' }, 'Prerrequisitos (opcional)'),
        prereqPicker.wrap,
      ]),
      el('div', { class: 'add-elective-picker-col' }, [
        el('span', { class: 'form-label' }, 'Correquisitos (opcional)'),
        coreqPicker.wrap,
      ]),
    ]),
    el('button', { class: 'btn-ghost btn-confirm btn-full', onclick: submit }, 'Agregar electiva'),
  ]);
}

function openEditElectiveForm(course) {
  editingElectiveCode = course.code;
  renderPensum();
}

function closeEditElectiveForm() {
  editingElectiveCode = null;
  renderPensum();
}

function buildEditElectiveCard(course) {
  const nameInput = el('input', { class: 'filter-input', type: 'text', placeholder: 'Nombre de la electiva', value: course.name });
  const creditsInput = el('input', { class: 'filter-input elective-credits-input', type: 'number', min: '1', max: '10', placeholder: 'Créditos', value: course.credits });

  const prereqPicker = buildCoursePicker('Buscar materia por nombre o código…', course.code, course.prereqs);
  const coreqPicker = buildCoursePicker('Buscar materia por nombre o código…', course.code, course.coreqs);

  const submit = () => {
    const ok = editElective(course.code, {
      name: nameInput.value, credits: creditsInput.value,
      prereqs: prereqPicker.getSelected(), coreqs: coreqPicker.getSelected(),
    });
    if (ok) editingElectiveCode = null;
  };

  return el('div', { class: 'add-elective-form add-elective-form-full edit-elective-card' }, [
    course.prereqsUnknown
      ? el('p', { class: 'elective-unknown-note' }, 'No conocemos los prerrequisitos oficiales de esta materia todavía. Agrégalos aquí si los tienes, o guarda sin ninguno si confirmas que no tiene.')
      : null,
    el('div', { class: 'add-elective-basic-row' }, [nameInput, creditsInput]),
    el('div', { class: 'add-elective-picker-row' }, [
      el('div', { class: 'add-elective-picker-col' }, [
        el('span', { class: 'form-label' }, 'Prerrequisitos'),
        prereqPicker.wrap,
      ]),
      el('div', { class: 'add-elective-picker-col' }, [
        el('span', { class: 'form-label' }, 'Correquisitos'),
        coreqPicker.wrap,
      ]),
    ]),
    el('div', { class: 'edit-elective-actions' }, [
      el('button', { class: 'btn-ghost', onclick: closeEditElectiveForm }, 'Cancelar'),
      el('button', { class: 'btn-ghost btn-confirm', onclick: submit }, 'Guardar cambios'),
    ]),
  ]);
}

/* ==========================================================================
   ESTADÍSTICAS
   ========================================================================== */

function renderStats() {
  const total = COURSES.length;
  const approved = countBy(c => getState(c.code) === 'aprobada');
  const inProgress = countBy(c => getState(c.code) === 'en-curso');
  const failed = countBy(c => getState(c.code) === 'perdida');
  const pending = total - approved - inProgress - failed;
  const pct = Math.round((approved / total) * 1000) / 10;

  $('#stats-pct').textContent = `${Math.min(100, Math.round((creditsApproved() / PROGRAM_CREDITS_TOTAL) * 100))}%`;
  $('#stats-approved').textContent = approved;
  $('#stats-inprogress').textContent = inProgress;
  $('#stats-failed').textContent = failed;
  $('#stats-pending').textContent = pending;
  $('#stats-credits-approved').textContent = creditsApproved();
  $('#stats-credits-remaining').textContent = Math.max(0, PROGRAM_CREDITS_TOTAL - creditsApproved());
  $('#stats-subjects-pct').textContent = `${pct}%`;

  drawDonut(approved, inProgress, failed, pending);
  renderLegend('#stats-legend-2');

  const wrap = $('#stats-level-breakdown');
  wrap.innerHTML = '';
  for (let lvl = 1; lvl <= CORE_LEVELS; lvl++) {
    const courses = COURSES.filter(c => c.level === lvl);
    const a = courses.filter(c => getState(c.code) === 'aprobada').length;
    const ic = courses.filter(c => getState(c.code) === 'en-curso').length;
    const f = courses.filter(c => getState(c.code) === 'perdida').length;
    const p = courses.length - a - ic - f;
    wrap.appendChild(el('div', { class: 'stat-level-card' }, [
      el('div', { class: 'stat-level-title' }, `Nivel ${lvl}`),
      el('div', { class: 'stat-level-bar' }, [
        a ? el('span', { class: 'seg seg-aprobada', style: `width:${a / courses.length * 100}%` }) : null,
        ic ? el('span', { class: 'seg seg-en-curso', style: `width:${ic / courses.length * 100}%` }) : null,
        f ? el('span', { class: 'seg seg-perdida', style: `width:${f / courses.length * 100}%` }) : null,
        p ? el('span', { class: 'seg seg-pendiente', style: `width:${p / courses.length * 100}%` }) : null,
      ]),
      el('div', { class: 'stat-level-nums' }, `${a}/${courses.length} aprobadas`),
    ]));
  }
}

function drawDonut(approved, inProgress, failed, pending) {
  const svg = $('#donut-svg');
  svg.innerHTML = '';
  const total = approved + inProgress + failed + pending || 1;
  const segments = [
    { value: approved, color: 'var(--c-aprobada)' },
    { value: inProgress, color: 'var(--c-en-curso)' },
    { value: failed, color: 'var(--c-perdida)' },
    { value: pending, color: 'var(--c-bloqueada)' },
  ];
  const r = 70, cx = 90, cy = 90, circumference = 2 * Math.PI * r;
  let offset = 0;
  segments.forEach(seg => {
    if (seg.value === 0) return;
    const frac = seg.value / total;
    const len = frac * circumference;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', seg.color);
    circle.setAttribute('stroke-width', 20);
    circle.setAttribute('stroke-dasharray', `${len} ${circumference - len}`);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
    circle.classList.add('donut-seg');
    svg.appendChild(circle);
    offset += len;
  });
}

/* ==========================================================================
   ÁRBOL INTERACTIVO
   ========================================================================== */

const COL_WIDTH = 250;
const ROW_HEIGHT = 118;
const NODE_W = 196;
const NODE_H = 84;
const PAD_TOP = 40;
const PAD_LEFT = 40;

function computeNodePositions() {
  const positions = {};
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
  levels.forEach((lvl, colIdx) => {
    const courses = COURSES.filter(c => c.level === lvl);
    courses.forEach((c, rowIdx) => {
      positions[c.code] = {
        x: PAD_LEFT + colIdx * COL_WIDTH,
        y: PAD_TOP + rowIdx * ROW_HEIGHT,
        course: c,
      };
    });
  });
  return positions;
}

let nodePositions = null;

function buildTree() {
  treeBuilt = true;
  nodePositions = computeNodePositions();
  const world = $('#tree-world');
  world.innerHTML = '';

  // columnas / etiquetas de nivel
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];
  const labelsLayer = el('div', { class: 'tree-col-labels' });
  levels.forEach((lvl, colIdx) => {
    labelsLayer.appendChild(el('div', {
      class: 'tree-col-label',
      style: `left:${PAD_LEFT + colIdx * COL_WIDTH}px; width:${NODE_W}px`,
    }, lvl === 0 ? 'Electivas' : `Nivel ${lvl}`));
  });
  world.appendChild(labelsLayer);

  // SVG de conexiones
  const maxRows = Math.max(...levels.map(lvl => COURSES.filter(c => c.level === lvl).length));
  const width = PAD_LEFT + levels.length * COL_WIDTH + 100;
  const height = PAD_TOP + maxRows * ROW_HEIGHT + 120;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('id', 'tree-edges');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.classList.add('tree-edges');
  world.appendChild(svg);

  // nodos
  const nodesLayer = el('div', { class: 'tree-nodes-layer' });
  COURSES.forEach(course => {
    const pos = nodePositions[course.code];
    const status = effectiveStatus(course);
    const node = el('div', {
      class: `tree-node status-${status}`,
      style: `left:${pos.x}px; top:${pos.y + 56}px; width:${NODE_W}px; height:${NODE_H}px;`,
      'data-code': course.code,
      onclick: (e) => { e.stopPropagation(); openPanel(course.code); },
    }, [
      el('div', { class: 'tree-node-code' }, course.code),
      el('div', { class: 'tree-node-name' }, course.name),
      el('div', { class: 'tree-node-credits' }, `${course.credits} créd.`),
    ]);
    nodesLayer.appendChild(node);
  });
  world.appendChild(nodesLayer);
  world.style.width = width + 'px';
  world.style.height = height + 'px';
  worldWidth = width;
  worldHeight = height;

  drawEdges();
  applyTreeTransform();
}

function edgePoint(code, side) {
  const pos = nodePositions[code];
  const y = pos.y + 56 + NODE_H / 2;
  return side === 'right' ? { x: pos.x + NODE_W, y } : { x: pos.x, y };
}

function drawEdges() {
  const svg = $('#tree-edges');
  svg.innerHTML = '';
  const svgNS = 'http://www.w3.org/2000/svg';

  COURSES.forEach(course => {
    course.prereqs.forEach(pCode => {
      if (!nodePositions[pCode]) return;
      drawEdge(svg, pCode, course.code, false);
    });
    course.coreqs.forEach(cCode => {
      if (!nodePositions[cCode]) return;
      drawEdge(svg, cCode, course.code, true);
    });
  });

  if (selectedCourse) highlightConnections(selectedCourse);
}

function drawEdge(svg, fromCode, toCode, isCoreq) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const fromLevel = byCode[fromCode].level === 0 ? 999 : byCode[fromCode].level;
  const toLevel = byCode[toCode].level === 0 ? 999 : byCode[toCode].level;
  let start, end;
  if (fromLevel <= toLevel) {
    start = edgePoint(fromCode, 'right');
    end = edgePoint(toCode, 'left');
  } else {
    start = edgePoint(fromCode, 'left');
    end = edgePoint(toCode, 'right');
  }
  const dx = Math.max(40, Math.abs(end.x - start.x) * 0.5);
  const path = document.createElementNS(svgNS, 'path');
  const d = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
  path.setAttribute('d', d);
  path.setAttribute('class', `tree-edge ${isCoreq ? 'edge-coreq' : 'edge-prereq'}`);
  path.setAttribute('data-from', fromCode);
  path.setAttribute('data-to', toCode);
  const fromApproved = getState(fromCode) === 'aprobada';
  if (fromApproved) path.classList.add('edge-active');
  svg.appendChild(path);
}

function highlightConnections(code) {
  $$('.tree-node').forEach(n => n.classList.remove('tree-node-focus', 'tree-node-dim'));
  $$('.tree-edge').forEach(edge => edge.classList.remove('edge-focus'));
  if (!code) return;
  const related = new Set([code]);
  const course = byCode[code];
  course.prereqs.forEach(p => related.add(p));
  course.coreqs.forEach(c => related.add(c));
  unlocksOf(code).forEach(c => related.add(c.code));

  $$('.tree-node').forEach(n => {
    const c = n.dataset.code;
    if (c === code) n.classList.add('tree-node-focus');
    else if (!related.has(c)) n.classList.add('tree-node-dim');
  });
  $$('.tree-edge').forEach(edge => {
    if (edge.dataset.from === code || edge.dataset.to === code) edge.classList.add('edge-focus');
  });
}

function applyTreeTransform() {
  const world = $('#tree-world');
  world.style.transform = `translate(${treeTransform.x}px, ${treeTransform.y}px) scale(${treeTransform.scale})`;
  $('#tree-zoom-label').textContent = `${Math.round(treeTransform.scale * 100)}%`;
}

function centerTree() {
  const viewport = $('#tree-viewport');
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  const scale = 0.85;
  treeTransform.scale = scale;

  if (worldWidth > 0) {
    // Centra horizontalmente el contenido real del árbol; si es más ancho
    // que el viewport, arranca alineado a la izquierda con un margen fijo.
    const scaledWidth = worldWidth * scale;
    treeTransform.x = scaledWidth < vw ? (vw - scaledWidth) / 2 : 24;
    const scaledHeight = worldHeight * scale;
    treeTransform.y = scaledHeight < vh ? (vh - scaledHeight) / 2 : 24;
  } else {
    treeTransform.x = 24;
    treeTransform.y = 24;
  }
  applyTreeTransform();
}

function zoomTree(delta, centerPoint) {
  const newScale = Math.min(1.8, Math.max(0.35, treeTransform.scale + delta));
  treeTransform.scale = newScale;
  applyTreeTransform();
}

function initTreeInteractions() {
  const viewport = $('#tree-viewport');

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    zoomTree(delta);
  }, { passive: false });

  viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.tree-node')) return;
    isPanning = true;
    viewport.classList.add('panning');
    panStart = { x: e.clientX, y: e.clientY };
    transformStart = { x: treeTransform.x, y: treeTransform.y };
  });
  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    treeTransform.x = transformStart.x + (e.clientX - panStart.x);
    treeTransform.y = transformStart.y + (e.clientY - panStart.y);
    applyTreeTransform();
  });
  window.addEventListener('mouseup', () => {
    isPanning = false;
    viewport.classList.remove('panning');
  });

  viewport.addEventListener('click', (e) => {
    if (!e.target.closest('.tree-node')) closePanel();
  });

  $('#tree-zoom-in').addEventListener('click', () => zoomTree(0.15));
  $('#tree-zoom-out').addEventListener('click', () => zoomTree(-0.15));
  $('#tree-center').addEventListener('click', centerTree);
}

/* ==========================================================================
   PANEL LATERAL
   ========================================================================== */

function openPanel(code) {
  selectedCourse = code;
  const course = byCode[code];
  const status = effectiveStatus(course);

  $('#panel-code').textContent = course.code;
  $('#panel-title').textContent = course.name;
  $('#panel-status-pill').textContent = statusLabel(status);
  $('#panel-status-pill').className = `status-pill status-pill-${status}`;
  $('#panel-credits').textContent = course.credits;
  $('#panel-level').textContent = course.type === 'electiva' ? 'Electiva' : `Nivel ${course.level}`;

  $('#panel-state-buttons').innerHTML = '';
  STATES.forEach(s => {
    const btn = el('button', {
      class: `state-btn state-btn-${s}${getState(code) === s ? ' active' : ''}`,
      onclick: () => { setState(code, s); openPanel(code); },
    }, STATE_LABEL[s]);
    $('#panel-state-buttons').appendChild(btn);
  });

  renderChipList('#panel-prereqs', course.prereqs, course.creditGate);
  renderChipList('#panel-coreqs', course.coreqs, 0);
  const unlocks = unlocksOf(code);
  renderChipListCourses('#panel-unlocks', unlocks);

  const gradeSection = $('#panel-grade-section');
  if (status === 'aprobada' || status === 'perdida') {
    gradeSection.style.display = 'block';
    const entry = getGradeEntry(code);
    $('#panel-grade-input').value = entry.finalGrade !== null ? entry.finalGrade : '';
    $('#panel-semester-input').value = entry.semester || '';
  } else {
    gradeSection.style.display = 'none';
  }

  $('#side-panel').classList.add('open');
  $('#panel-backdrop').classList.add('show');

  if (activeTab === 'arbol') highlightConnections(code);
}

function renderChipList(target, codes, creditGate) {
  const wrap = $(target);
  wrap.innerHTML = '';
  if (creditGate) {
    wrap.appendChild(el('span', { class: 'chip chip-gate' }, `≥ ${creditGate} créditos aprobados`));
  }
  if (codes.length === 0 && !creditGate) {
    wrap.appendChild(el('span', { class: 'chip chip-empty' }, 'No tiene'));
    return;
  }
  codes.forEach(code => {
    const c = byCode[code];
    if (!c) return;
    const st = effectiveStatus(c);
    wrap.appendChild(el('span', {
      class: `chip chip-${st}`,
      onclick: () => openPanel(code),
    }, `${c.code} · ${c.name}`));
  });
}

function renderChipListCourses(target, courses) {
  const wrap = $(target);
  wrap.innerHTML = '';
  if (courses.length === 0) {
    wrap.appendChild(el('span', { class: 'chip chip-empty' }, 'Ninguna'));
    return;
  }
  courses.forEach(c => {
    const st = effectiveStatus(c);
    wrap.appendChild(el('span', {
      class: `chip chip-${st}`,
      onclick: () => openPanel(c.code),
    }, `${c.code} · ${c.name}`));
  });
}

function closePanel() {
  selectedCourse = null;
  $('#side-panel').classList.remove('open');
  $('#panel-backdrop').classList.remove('show');
  if (activeTab === 'arbol') highlightConnections(null);
}

/* ==========================================================================
   BUSCADOR GLOBAL
   ========================================================================== */

function renderSearchResults() {
  const q = $('#global-search').value.trim().toLowerCase();
  const box = $('#search-results');
  if (!q) { box.classList.remove('show'); box.innerHTML = ''; return; }
  const matches = COURSES.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  ).slice(0, 8);
  box.innerHTML = '';
  if (matches.length === 0) {
    box.appendChild(el('div', { class: 'search-empty' }, 'Sin resultados'));
  } else {
    matches.forEach(c => {
      const st = effectiveStatus(c);
      box.appendChild(el('div', {
        class: 'search-result-item',
        onclick: () => { openPanel(c.code); box.classList.remove('show'); $('#global-search').value = ''; },
      }, [
        el('span', { class: `dot dot-${st}` }),
        el('span', { class: 'search-result-name' }, c.name),
        el('span', { class: 'search-result-code' }, c.code),
      ]));
    });
  }
  box.classList.add('show');
}

/* ==========================================================================
   REFRESH GLOBAL
   ========================================================================== */

function refreshAll() {
  renderDashboard();
  renderPensum();
  renderStats();
  if (activeTab === 'promedio') renderPromedio();
  if (activeTab === 'notas') renderNotas();
  if (treeBuilt) {
    $$('.tree-node').forEach(n => {
      const course = byCode[n.dataset.code];
      const status = effectiveStatus(course);
      n.className = `tree-node status-${status}` +
        (n.classList.contains('tree-node-focus') ? ' tree-node-focus' : '') +
        (n.classList.contains('tree-node-dim') ? ' tree-node-dim' : '');
    });
    drawEdges();
  }
  if (selectedCourse) {
    const status = effectiveStatus(byCode[selectedCourse]);
    $('#panel-status-pill').textContent = statusLabel(status);
    $('#panel-status-pill').className = `status-pill status-pill-${status}`;
  }
}

/* ==========================================================================
   NOTAS — promedio ponderado y parciales de materias en curso
   ========================================================================== */

function renderPromedio() {
  renderPPA();
  renderSemesterAverages();
}

function renderNotas() {
  renderInProgressGrades();
}

function extraBadge(extra) {
  const failed = extra.status === 'perdida';
  return el('span', { class: `extra-badge${failed ? ' extra-badge-fail' : ''}` }, failed ? 'Perdida' : 'Adicional Aprobada');
}

function renderPPA() {
  const { average, creditSum, rows } = weightedAverage();
  const numEl = $('#ppa-number');
  const metaEl = $('#ppa-meta');
  const tableWrap = $('#ppa-table-wrap');
  const formWrap = $('#ppa-add-form-wrap');

  formWrap.innerHTML = '';
  if (showAddExtraGradeForm) {
    formWrap.appendChild(buildAddExtraGradeForm());
  }

  if (average === null) {
    numEl.textContent = '—';
    metaEl.textContent = 'Aún no has registrado ninguna nota. Marca una materia como "Aprobada" o "Perdida" y guarda su nota final, o agrega una materia adicional.';
    tableWrap.style.display = 'none';
    return;
  }

  numEl.textContent = average.toFixed(2);
  numEl.classList.toggle('ppa-warning', average < 3);
  metaEl.textContent = `Basado en ${creditSum} crédito${creditSum === 1 ? '' : 's'} con nota registrada (${rows.length} materia${rows.length === 1 ? '' : 's'}).`;

  tableWrap.style.display = 'block';
  const tbody = $('#ppa-table-body');
  tbody.innerHTML = '';
  rows.forEach(row => {
    const semesterLabel = row.semester || '—';
    if (row.type === 'course') {
      const { course, grade } = row;
      tbody.appendChild(el('tr', {}, [
        el('td', { class: 'mono' }, course.code),
        el('td', {}, course.name),
        el('td', {}, course.type === 'electiva' ? 'Electiva' : String(course.level)),
        el('td', {}, String(course.credits)),
        el('td', { class: 'mono' }, semesterLabel),
        el('td', { class: `mono${grade < 3 ? ' grade-fail' : ''}` }, grade.toFixed(1)),
        el('td', {}, ''),
      ]));
    } else {
      const { extra, grade } = row;
      const matchedCourse = byCode[extra.code];
      const levelCell = matchedCourse
        ? (matchedCourse.type === 'electiva' ? 'Electiva' : String(matchedCourse.level))
        : '—';
      tbody.appendChild(el('tr', { class: 'row-extra' }, [
        el('td', { class: 'mono' }, extra.code || '—'),
        el('td', {}, [extra.name, extraBadge(extra)]),
        el('td', {}, levelCell),
        el('td', {}, String(extra.credits)),
        el('td', { class: 'mono' }, semesterLabel),
        el('td', { class: `mono${grade < 3 ? ' grade-fail' : ''}` }, grade.toFixed(1)),
        el('td', {}, [
          el('button', {
            class: 'icon-btn-sm', title: 'Eliminar materia adicional',
            onclick: () => { removeExtraGrade(extra.id); renderPromedio(); toast('Materia adicional eliminada'); },
          }, '✕'),
        ]),
      ]));
    }
  });
}

function renderSemesterAverages() {
  const semesters = semesterAverages();
  const card = $('#card-semesters');
  const list = $('#semester-averages-list');
  list.innerHTML = '';

  if (semesters.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';

  semesters.forEach(s => {
    const isOpen = expandedSemesters.has(s.semester);
    const wrap = el('div', { class: 'semester-block' });

    wrap.appendChild(el('button', {
      class: 'semester-row semester-row-toggle',
      onclick: () => {
        if (isOpen) expandedSemesters.delete(s.semester);
        else expandedSemesters.add(s.semester);
        renderSemesterAverages();
      },
    }, [
      el('span', { class: `semester-toggle-icon${isOpen ? ' open' : ''}` }, '+'),
      el('span', { class: 'semester-name' }, s.semester),
      el('span', { class: 'semester-count' }, `${s.count} materia${s.count === 1 ? '' : 's'} · ${s.creditSum} créd.`),
      el('span', { class: `semester-avg${s.average < 3 ? ' grade-fail' : ''}` }, s.average.toFixed(2)),
    ]));

    if (isOpen) {
      const detail = el('div', { class: 'semester-detail' });
      s.rows.forEach(row => {
        if (row.type === 'course') {
          const { course, grade } = row;
          detail.appendChild(el('div', { class: 'semester-detail-row' }, [
            el('span', { class: 'mono semester-detail-code' }, course.code),
            el('span', { class: 'semester-detail-name' }, course.name),
            el('span', { class: 'semester-detail-credits' }, `${course.credits} créd.`),
            el('span', { class: `mono semester-detail-grade${grade < 3 ? ' grade-fail' : ''}` }, grade.toFixed(1)),
          ]));
        } else {
          const { extra, grade } = row;
          detail.appendChild(el('div', { class: 'semester-detail-row' }, [
            el('span', { class: 'mono semester-detail-code' }, extra.code || '—'),
            el('span', { class: 'semester-detail-name' }, [extra.name, extraBadge(extra)]),
            el('span', { class: 'semester-detail-credits' }, `${extra.credits} créd.`),
            el('span', { class: `mono semester-detail-grade${grade < 3 ? ' grade-fail' : ''}` }, grade.toFixed(1)),
          ]));
        }
      });
      wrap.appendChild(detail);
    }

    list.appendChild(wrap);
  });
}

function buildAddExtraGradeForm() {
  const codeInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Código (opcional)' });
  const nameInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Nombre de la materia' });
  const creditsInput = el('input', { class: 'input-sm', type: 'number', min: '1', step: '1', placeholder: 'Créditos' });
  const gradeInput = el('input', { class: 'input-sm', type: 'number', min: '0', max: '5', step: '0.1', placeholder: 'Nota' });
  const semesterInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Semestre, ej. 2026-1' });
  const statusSelect = el('select', { class: 'input-sm' }, [
    el('option', { value: 'aprobada' }, 'Aprobada'),
    el('option', { value: 'perdida' }, 'Perdida'),
  ]);

  const searchInput = el('input', { class: 'input-sm extra-grade-search', type: 'text', placeholder: 'Buscar una materia del pénsum para autocompletar…' });
  const searchResults = el('div', { class: 'picker-results' });
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!q) { searchResults.classList.remove('show'); return; }
    const matches = COURSES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 8);
    if (matches.length === 0) {
      searchResults.appendChild(el('div', { class: 'picker-result-empty' }, 'Sin resultados'));
    } else {
      matches.forEach(c => {
        searchResults.appendChild(el('div', {
          class: 'picker-result-item',
          onclick: () => {
            codeInput.value = c.code;
            nameInput.value = c.name;
            creditsInput.value = c.credits;
            searchInput.value = '';
            searchResults.classList.remove('show');
            gradeInput.focus();
          },
        }, `${c.code} · ${c.name} ${c.type === 'electiva' ? '(electiva)' : `(nivel ${c.level})`}`));
      });
    }
    searchResults.classList.add('show');
  });
  searchInput.addEventListener('focus', (e) => { if (e.target.value) searchInput.dispatchEvent(new Event('input')); });

  const submit = () => {
    const ok = addExtraGrade(nameInput.value, creditsInput.value, gradeInput.value, semesterInput.value, codeInput.value, statusSelect.value);
    if (ok) {
      showAddExtraGradeForm = false;
      renderPromedio();
      toast('Materia adicional agregada');
    }
  };
  [codeInput, nameInput, creditsInput, gradeInput, semesterInput].forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));

  return el('div', { class: 'add-extra-grade-form' }, [
    el('p', { class: 'add-extra-grade-hint' }, 'Para materias homologadas, validadas, perdidas o de otro programa que también cuenten en tu promedio.'),
    el('div', { class: 'picker-wrap extra-grade-search-wrap' }, [searchInput, searchResults]),
    el('div', { class: 'partial-form' }, [
      codeInput, nameInput, creditsInput, gradeInput, statusSelect, semesterInput,
      el('button', { class: 'btn-ghost btn-confirm', onclick: submit }, 'Agregar'),
    ]),
  ]);
}

function renderInProgressGrades() {
  const wrap = $('#in-progress-grades-list');
  wrap.innerHTML = '';
  const inProgress = COURSES.filter(c => getState(c.code) === 'en-curso');
  const totalCount = inProgress.length + inProgressExtras.length;

  const formWrap = $('#inprogress-add-form-wrap');
  if (formWrap) {
    formWrap.innerHTML = '';
    if (showAddInProgressForm) formWrap.appendChild(buildAddInProgressExtraForm());
  }

  $('#in-progress-grades-empty').style.display = totalCount ? 'none' : 'flex';
  if (totalCount === 0) return;

  inProgress.forEach(course => wrap.appendChild(buildInProgressCard(course)));
  inProgressExtras.forEach(item => wrap.appendChild(buildInProgressExtraCard(item)));
}

function buildGradeTrackerCard(code, name, credits, { onCancel, onComplete }) {
  const entry = getGradeEntry(code);
  const weightSum = partialsWeightSum(code);
  const contribution = partialsWeightedContribution(code);
  const remaining = 100 - weightSum;

  const card = el('div', { class: 'grade-card' }, [
    el('div', { class: 'grade-card-head' }, [
      el('span', { class: 'panel-code' }, code),
      el('h4', {}, name),
      el('span', { class: 'course-credits' }, `${credits} créd.`),
      el('button', { class: 'icon-btn-sm grade-card-cancel', title: 'Cancelar materia', onclick: onCancel }, '✕'),
    ]),
  ]);

  const partialsList = el('div', { class: 'partials-list' });
  entry.partials.forEach(p => {
    partialsList.appendChild(el('div', { class: 'partial-row' }, [
      el('span', { class: 'partial-name' }, p.name),
      el('span', { class: 'partial-weight' }, `${p.weight}%`),
      el('span', { class: `partial-grade${p.grade < 3 ? ' grade-fail' : ''}` }, p.grade.toFixed(1)),
      el('button', {
        class: 'icon-btn-sm', title: 'Eliminar',
        onclick: () => { removePartial(code, p.id); renderInProgressGrades(); toast('Nota eliminada'); },
      }, '✕'),
    ]));
  });
  if (entry.partials.length === 0) {
    partialsList.appendChild(el('p', { class: 'empty-inline' }, 'Aún no has registrado parciales para esta materia.'));
  }
  card.appendChild(partialsList);

  // resumen + calculadora "qué necesito para aprobar"
  const summary = el('div', { class: 'grade-summary' });
  summary.appendChild(el('div', { class: 'grade-summary-row' }, [
    el('span', {}, 'Peso registrado'),
    el('span', { class: 'mono' }, `${weightSum}%`),
  ]));
  summary.appendChild(el('div', { class: 'grade-summary-row' }, [
    el('span', {}, 'Aporte acumulado a la nota final'),
    el('span', { class: 'mono' }, contribution.toFixed(2)),
  ]));

  if (remaining > 0) {
    const neededRaw = ((3.0 - contribution) / (remaining / 100));
    let message;
    if (neededRaw <= 0) {
      message = `Ya aseguraste el 3.0 sin importar lo que saques en el ${remaining}% restante.`;
    } else if (neededRaw > 5) {
      message = `Con lo registrado ya no puedes llegar a 3.0 aunque saques 5.0 en el ${remaining}% restante.`;
    } else {
      message = `Necesitas al menos ${neededRaw.toFixed(2)} en el ${remaining}% restante para aprobar con 3.0.`;
    }
    summary.appendChild(el('p', { class: 'grade-needed' }, message));
  } else {
    summary.appendChild(el('p', { class: `grade-needed${contribution < 3 ? ' grade-fail' : ' grade-ok'}` },
      `Peso completo (100%) — nota final: ${contribution.toFixed(2)}`));
  }
  card.appendChild(summary);

  // formulario para agregar parcial
  const nameInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Ej. Parcial 2' });
  const weightInput = el('input', { class: 'input-sm', type: 'number', min: '0', max: '100', step: '1', placeholder: '%' });
  const gradeInput = el('input', { class: 'input-sm', type: 'number', min: '0', max: '5', step: '0.1', placeholder: 'Nota' });
  const addBtn = el('button', {
    class: 'btn-ghost',
    onclick: () => {
      const w = Number(weightInput.value);
      const g = Number(gradeInput.value);
      if (!w || w <= 0) { toast('Ingresa un porcentaje válido'); return; }
      if (gradeInput.value === '' || Number.isNaN(g)) { toast('Ingresa una nota válida'); return; }
      addPartial(code, nameInput.value.trim(), w, g);
      renderInProgressGrades();
      toast('Nota parcial agregada');
    },
  }, '+ Agregar');

  card.appendChild(el('div', { class: 'partial-form' }, [nameInput, weightInput, gradeInput, addBtn]));

  if (weightSum === 100) {
    if (showCompleteFormFor.has(code)) {
      const semesterInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Semestre, ej. 2026-1' });
      const confirmBtn = el('button', {
        class: 'btn-ghost btn-confirm',
        onclick: () => onComplete(contribution, semesterInput.value),
      }, 'Confirmar');
      const cancelBtn = el('button', {
        class: 'btn-ghost',
        onclick: () => { showCompleteFormFor.delete(code); renderInProgressGrades(); },
      }, 'Cancelar');
      card.appendChild(el('div', { class: 'complete-form' }, [
        el('p', { class: 'complete-form-hint' }, '¿En qué semestre cursaste esta materia?'),
        el('div', { class: 'partial-form' }, [semesterInput, confirmBtn, cancelBtn]),
      ]));
    } else {
      const completeBtn = el('button', {
        class: 'btn-ghost btn-use-final',
        onclick: () => { showCompleteFormFor.add(code); renderInProgressGrades(); },
      }, 'Completar materia');
      card.appendChild(completeBtn);
    }
  }

  return card;
}

function buildInProgressCard(course) {
  return buildGradeTrackerCard(course.code, course.name, course.credits, {
    onCancel: () => cancelCourse(course),
    onComplete: (contribution, semester) => completeCourse(course, contribution, semester),
  });
}

function buildInProgressExtraCard(item) {
  return buildGradeTrackerCard(item.code, item.name, item.credits, {
    onCancel: () => {
      showConfirm(`¿Cancelar "${item.name}"? Se perderán sus notas parciales.`, () => {
        removeInProgressExtra(item.id);
        renderInProgressGrades();
        toast('Materia cancelada');
      });
    },
    onComplete: (contribution, semester) => completeInProgressExtra(item.id, semester),
  });
}

function buildAddInProgressExtraForm() {
  const codeInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Código (opcional)' });
  const nameInput = el('input', { class: 'input-sm', type: 'text', placeholder: 'Nombre de la materia' });
  const creditsInput = el('input', { class: 'input-sm', type: 'number', min: '1', step: '1', placeholder: 'Créditos' });

  const searchInput = el('input', { class: 'input-sm extra-grade-search', type: 'text', placeholder: 'Buscar una materia del pénsum para autocompletar…' });
  const searchResults = el('div', { class: 'picker-results' });
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!q) { searchResults.classList.remove('show'); return; }
    const matches = COURSES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)).slice(0, 8);
    if (matches.length === 0) {
      searchResults.appendChild(el('div', { class: 'picker-result-empty' }, 'Sin resultados'));
    } else {
      matches.forEach(c => {
        searchResults.appendChild(el('div', {
          class: 'picker-result-item',
          onclick: () => {
            codeInput.value = c.code;
            nameInput.value = c.name;
            creditsInput.value = c.credits;
            searchInput.value = '';
            searchResults.classList.remove('show');
          },
        }, `${c.code} · ${c.name} ${c.type === 'electiva' ? '(electiva)' : `(nivel ${c.level})`}`));
      });
    }
    searchResults.classList.add('show');
  });
  searchInput.addEventListener('focus', (e) => { if (e.target.value) searchInput.dispatchEvent(new Event('input')); });

  const submit = () => {
    const ok = addInProgressExtra(nameInput.value, creditsInput.value, codeInput.value);
    if (ok) {
      showAddInProgressForm = false;
      renderInProgressGrades();
      toast('Materia en curso agregada');
    }
  };
  [codeInput, nameInput, creditsInput].forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); }));

  return el('div', { class: 'add-extra-grade-form' }, [
    el('p', { class: 'add-extra-grade-hint' }, 'Para una materia optativa o adicional que estés cursando ahora mismo, con sus propios parciales.'),
    el('div', { class: 'picker-wrap extra-grade-search-wrap' }, [searchInput, searchResults]),
    el('div', { class: 'partial-form' }, [
      codeInput, nameInput, creditsInput,
      el('button', { class: 'btn-ghost btn-confirm', onclick: submit }, 'Agregar'),
    ]),
  ]);
}

/* ==========================================================================
   CONFIGURACIÓN — nombre del estudiante, tema claro/oscuro y color de acento
   ========================================================================== */

let settings = defaultSettings();

function defaultSettings() {
  return { studentName: '', theme: 'dark', accent: 'violeta' };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(profileNsKey(SETTINGS_KEY));
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...(typeof parsed === 'object' && parsed ? parsed : {}) };
  } catch (e) {
    console.warn('No se pudo leer la configuración guardada:', e);
    return defaultSettings();
  }
}

function saveSettings() {
  try {
    localStorage.setItem(profileNsKey(SETTINGS_KEY), JSON.stringify(settings));
  } catch (e) {
    console.warn('No se pudo guardar la configuración:', e);
  }
}

function applySettings() {
  document.documentElement.setAttribute('data-theme', settings.theme || 'dark');

  const preset = ACCENT_PRESETS[settings.accent] || ACCENT_PRESETS.violeta;
  document.documentElement.style.setProperty('--accent', preset.accent);
  document.documentElement.style.setProperty('--accent-soft', preset.soft);
  document.documentElement.style.setProperty('--accent-glow', preset.glow);

  const displayName = settings.studentName.trim() || activeProfileDisplayName || 'Estudiante';
  $('#meta-name').textContent = displayName;
  $('#user-avatar').textContent = initialsOf(displayName);
  $('#settings-name-input').value = settings.studentName;

  $$('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
  $$('.accent-swatch').forEach(s => s.classList.toggle('selected', s.dataset.accent === settings.accent));
}

function initialsOf(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function renderAccentSwatches() {
  const wrap = $('#accent-swatches');
  wrap.innerHTML = '';
  Object.entries(ACCENT_PRESETS).forEach(([key, preset]) => {
    wrap.appendChild(el('button', {
      class: `accent-swatch${settings.accent === key ? ' selected' : ''}`,
      style: `background:${preset.accent}`,
      title: preset.label,
      'data-accent': key,
      onclick: () => {
        settings.accent = key;
        saveSettings();
        applySettings();
      },
    }));
  });
}

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

function statusMatchesCourse(course, statusKey) {
  if (statusKey === 'disponible') return isAvailable(course);
  if (statusKey === 'electivas-vistas') return course.type === 'electiva' && getState(course.code) !== 'no-cursada';
  return getState(course.code) === statusKey;
}

function initStatTooltips() {
  const tooltip = $('#stat-tooltip');
  if (!tooltip) return;
  $$('.stat-card[data-status]').forEach(card => {
    const statusKey = card.dataset.status;
    card.addEventListener('mouseenter', () => {
      const matches = COURSES.filter(c => statusMatchesCourse(c, statusKey))
        .sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));

      tooltip.innerHTML = '';
      if (matches.length === 0) {
        tooltip.appendChild(el('p', { class: 'stat-tooltip-empty' }, 'Ninguna materia en este estado.'));
      } else {
        matches.forEach(c => {
          tooltip.appendChild(el('div', { class: 'stat-tooltip-item' }, [
            el('span', { class: 'mono stat-tooltip-code' }, c.code),
            el('span', { class: 'stat-tooltip-name' }, c.name),
          ]));
        });
      }

      const rect = card.getBoundingClientRect();
      const vw = window.innerWidth;
      let left = rect.left;
      const tooltipWidth = 260;
      if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;
      tooltip.style.left = `${Math.max(12, left)}px`;
      tooltip.style.top = `${rect.bottom + 8}px`;
      tooltip.classList.add('show');
    });
    card.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
    });
  });
}

function init() {
  $('#meta-program').textContent = `${PROGRAM_META.program} · ${PROGRAM_META.university}`;
  $('#footer-pensum-label').textContent = `Datos extraídos del pénsum oficial · Programa [${PROGRAM_META.programCode}] ${PROGRAM_META.program} · ${PROGRAM_META.university}`;
  $('#hero-program-label').textContent = `Programa [${PROGRAM_META.programCode}] ${PROGRAM_META.program}`;
  $('#switch-profile-btn').addEventListener('click', switchProfileOrPensum);

  renderAccentSwatches();
  applySettings();
  initStatTooltips();

  $('#btn-settings').addEventListener('click', (e) => {
    e.stopPropagation();
    $('#settings-panel').classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.settings-wrap')) $('#settings-panel').classList.remove('open');
  });
  $('#settings-name-input').addEventListener('input', (e) => {
    settings.studentName = e.target.value;
    saveSettings();
    applySettings();
  });
  $$('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.theme = btn.dataset.theme;
      saveSettings();
      applySettings();
    });
  });

  $$('.tab-btn').forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));

  $('#filter-query').addEventListener('input', (e) => { filters.query = e.target.value; renderPensum(); });
  $('#filter-level').addEventListener('change', (e) => { filters.level = e.target.value; renderPensum(); });
  $('#filter-status').addEventListener('change', (e) => { filters.status = e.target.value; renderPensum(); });
  $('#filter-availability').addEventListener('change', (e) => { filters.availability = e.target.value; renderPensum(); });
  $('#filter-reset').addEventListener('click', () => {
    filters = { query: '', level: 'all', status: 'all', availability: 'all' };
    $('#filter-query').value = ''; $('#filter-level').value = 'all';
    $('#filter-status').value = 'all'; $('#filter-availability').value = 'all';
    renderPensum();
  });

  $('#global-search').addEventListener('input', renderSearchResults);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) { $('#search-results').classList.remove('show'); }
    if (!e.target.closest('.picker-wrap')) { $$('.picker-results').forEach(r => r.classList.remove('show')); }
  });

  $('#panel-close').addEventListener('click', closePanel);
  $('#panel-backdrop').addEventListener('click', closePanel);
  $('#btn-add-extra-grade').addEventListener('click', () => {
    showAddExtraGradeForm = !showAddExtraGradeForm;
    renderPPA();
  });
  $('#btn-add-inprogress').addEventListener('click', () => {
    showAddInProgressForm = !showAddInProgressForm;
    renderInProgressGrades();
  });
  $('#panel-grade-save').addEventListener('click', () => {
    if (!selectedCourse) return;
    const val = $('#panel-grade-input').value;
    const semester = $('#panel-semester-input').value;
    setFinalGrade(selectedCourse, val === '' ? null : val, semester);
    toast(val === '' ? 'Nota eliminada' : `Nota guardada: ${Number(val).toFixed(1)}`);
    if (activeTab === 'promedio') renderPromedio();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  $('#reset-progress-btn').addEventListener('click', () => {
    showConfirm('¿Seguro que quieres borrar todo tu progreso guardado (estados de materias, notas, parciales y materias adicionales)? Esta acción no se puede deshacer.', () => {
      progress = {};
      grades = {};
      extraGrades = [];
      selectedCourse = null;
      closePanel();
      saveProgress();
      saveGrades();
      saveExtraGrades();
      refreshAll();
      if (treeBuilt) drawEdges();
      toast('Progreso reiniciado');
    });
  });

  initTreeInteractions();
  renderLegend('#stats-legend-2');
  renderLegend('#stats-legend');
  refreshAll();
  setTab('dashboard');
}

/* ==========================================================================
   PANTALLAS DE ENTRADA — elegir perfil y pénsum
   ========================================================================== */

function showGate(which) {
  $('#gate-profile').style.display = which === 'profile' ? 'flex' : 'none';
  $('#gate-pensum').style.display = which === 'pensum' ? 'flex' : 'none';
  $('#app-shell').style.display = 'none';
}

function enterApp() {
  $('#gate-profile').style.display = 'none';
  $('#gate-pensum').style.display = 'none';
  $('#app-shell').style.display = '';
  init();
}

function renderKnownProfilesChips() {
  const wrap = $('#gate-known-profiles');
  wrap.innerHTML = '';
  const known = knownProfiles();
  if (known.length === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  wrap.appendChild(el('span', { class: 'gate-known-label' }, 'Perfiles recientes en este navegador:'));
  known.forEach(p => {
    wrap.appendChild(el('button', {
      class: 'gate-profile-chip',
      onclick: () => selectProfile(p.slug, p.displayName),
    }, p.displayName));
  });
}

function submitProfileGate() {
  const input = $('#gate-profile-input').value;
  const slug = slugifyProfile(input);
  if (!slug) { toast('Escribe una frase o nombre para identificarte'); return; }
  selectProfile(slug, input.trim());
}

function selectProfile(slug, displayName) {
  activeProfile = slug;
  activeProfileDisplayName = displayName;
  rememberProfile(slug, displayName);
  safeSet(`${APP_NS}::last_profile_slug`, slug);
  safeSet(`${APP_NS}::last_profile_display`, displayName);
  renderPensumGateOptions();
  showGate('pensum');
}

function renderPensumGateOptions() {
  const wrap = $('#gate-pensum-options');
  wrap.innerHTML = '';
  Object.entries(PENSUM_REGISTRY).forEach(([key, def]) => {
    const nucleoCredits = def.courses.filter(c => c.type === 'nucleo').reduce((s, c) => s + c.credits, 0);
    wrap.appendChild(el('button', {
      class: 'gate-pensum-card',
      onclick: () => selectPensum(key),
    }, [
      el('h3', {}, def.label),
      el('p', {}, `${def.meta.university}`),
      el('span', { class: 'gate-pensum-meta' }, `${def.courses.length} materias · ${nucleoCredits + def.electiveCreditsRequired} créditos totales`),
    ]));
  });
}

function selectPensum(key) {
  if (!activatePensum(key)) return;
  safeSet(`${APP_NS}::last_pensum`, key);
  loadAllUserData();
  enterApp();
}

function switchProfileOrPensum() {
  showConfirm('¿Cambiar de perfil o de pénsum? No se borra ningún dato — solo vuelves a elegir.', () => {
    safeRemove(`${APP_NS}::last_profile_slug`);
    safeRemove(`${APP_NS}::last_profile_display`);
    safeRemove(`${APP_NS}::last_pensum`);
    location.reload();
  });
}

function tryAutoResume() {
  const slug = safeGet(`${APP_NS}::last_profile_slug`);
  const display = safeGet(`${APP_NS}::last_profile_display`);
  const pensumKey = safeGet(`${APP_NS}::last_pensum`);
  if (slug && display && pensumKey && PENSUM_REGISTRY[pensumKey]) {
    activeProfile = slug;
    activeProfileDisplayName = display;
    activatePensum(pensumKey);
    loadAllUserData();
    enterApp();
  } else if (slug && display) {
    activeProfile = slug;
    activeProfileDisplayName = display;
    renderPensumGateOptions();
    showGate('pensum');
  } else {
    showGate('profile');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderKnownProfilesChips();
  $('#gate-profile-continue').addEventListener('click', submitProfileGate);
  $('#gate-profile-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitProfileGate(); });
  tryAutoResume();
});
