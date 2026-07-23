/* ==========================================================================
   DATA.JS — Registro de pénsums disponibles (Universidad de Antioquia)
   Cada estudiante elige cuál de estos pénsums quiere trabajar.
   ========================================================================== */

const PENSUM_REGISTRY = {
  'mate-v6': {
    label: 'Matemáticas (v6)',
    meta: {
  studentName: 'Carlos Andrés Mantilla Angulo',
  studentId: '1098803745',
  program: 'Matemáticas (v6)',
  programCode: '213',
  university: 'Universidad de Antioquia',
  extractedOn: '18/07/2026',
},
    electiveCreditsRequired: 15,
    coreLevels: 10,
    courses: [

  // ----------------------------- NIVEL 1 -----------------------------
  { code: '303001', name: 'Álgebra y Trigonometría', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303006', name: 'Geometría Básica', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303117', name: 'Fundamentos de Matemáticas', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305001', name: 'Fundamentación en Ciencia', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305190', name: 'Español Académico', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 2 -----------------------------
  { code: '303002', name: 'Cálculo Diferencial', credits: 3, level: 2, prereqs: ['303001'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303008', name: 'Lógica', credits: 3, level: 2, prereqs: ['303117'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303010', name: 'Álgebra Lineal', credits: 3, level: 2, prereqs: ['303001', '303006'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305450', name: 'Cátedra de Formación Ciudadana y Constitucional', credits: 1, level: 2, prereqs: ['305190'], coreqs: [], creditGate: 10, type: 'nucleo' },
  { code: '314029', name: 'Fundamentos de Programación', credits: 3, level: 2, prereqs: ['303117'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003101', name: 'English 1', credits: 2, level: 2, prereqs: [], coreqs: [], creditGate: 10, type: 'nucleo' },

  // ----------------------------- NIVEL 3 -----------------------------
  { code: '302270', name: 'Física Básica I', credits: 4, level: 3, prereqs: ['303002', '303006'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303005', name: 'Cálculo Integral', credits: 3, level: 3, prereqs: ['303002'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303011', name: 'Teoría de Conjuntos', credits: 3, level: 3, prereqs: ['303008'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303258', name: 'Teoría de Números y Combinatoria', credits: 3, level: 3, prereqs: [], coreqs: ['303011'], creditGate: 0, type: 'nucleo' },
  { code: '9003102', name: 'English 2', credits: 2, level: 3, prereqs: ['9003101'], coreqs: [], creditGate: 20, type: 'nucleo' },

  // ----------------------------- NIVEL 4 -----------------------------
  { code: '302391', name: 'Física Básica II', credits: 4, level: 4, prereqs: ['302270'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303009', name: 'Cálculo Vectorial', credits: 3, level: 4, prereqs: ['303005', '303010'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303304', name: 'Álgebra I', credits: 3, level: 4, prereqs: ['303010', '303258'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303313', name: 'Probabilidad', credits: 3, level: 4, prereqs: [], coreqs: ['303009'], creditGate: 0, type: 'nucleo' },
  { code: '314069', name: 'Métodos Numéricos I', credits: 3, level: 4, prereqs: ['314029', '303005'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 5 -----------------------------
  { code: '303013', name: 'Ecuaciones Diferenciales Ordinarias', credits: 3, level: 5, prereqs: ['303005', '303010'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303065', name: 'Métodos Numéricos II', credits: 3, level: 5, prereqs: ['314069'], coreqs: ['303013'], creditGate: 0, type: 'nucleo' },
  { code: '303354', name: 'Álgebra II', credits: 3, level: 5, prereqs: ['303304'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305002', name: 'Historia, Política y Estética', credits: 2, level: 5, prereqs: ['305450'], coreqs: [], creditGate: 40, type: 'nucleo' },
  { code: '314070', name: 'Inferencia Estadística', credits: 4, level: 5, prereqs: ['303313'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003103', name: 'English 3', credits: 2, level: 5, prereqs: ['9003102'], coreqs: [], creditGate: 40, type: 'nucleo' },

  // ----------------------------- NIVEL 6 -----------------------------
  { code: '303252', name: 'Análisis I', credits: 3, level: 6, prereqs: ['303011', '303009'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303404', name: 'Álgebra Multilineal', credits: 3, level: 6, prereqs: ['303354'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305003', name: 'Cátedra Ambiental UdeA', credits: 2, level: 6, prereqs: ['305002'], coreqs: [], creditGate: 50, type: 'nucleo' },
  { code: '9003104', name: 'English 4', credits: 2, level: 6, prereqs: ['9003103'], coreqs: [], creditGate: 50, type: 'nucleo' },

  // ----------------------------- NIVEL 7 -----------------------------
  { code: '303015', name: 'Historia de las Matemáticas', credits: 3, level: 7, prereqs: ['303304', '314070', '303252'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303302', name: 'Análisis II', credits: 3, level: 7, prereqs: ['303252'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303412', name: 'Topología', credits: 3, level: 7, prereqs: ['303252'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305004', name: 'Desarrollo Humano', credits: 1, level: 7, prereqs: ['305003'], coreqs: [], creditGate: 60, type: 'nucleo' },
  { code: '9003105', name: 'English 5', credits: 2, level: 7, prereqs: ['9003104'], coreqs: [], creditGate: 60, type: 'nucleo' },

  // ----------------------------- NIVEL 8 -----------------------------
  { code: '303029', name: 'Introducción a la Investigación', credits: 3, level: 8, prereqs: ['303015'], coreqs: [], creditGate: 80, type: 'nucleo' },
  { code: '303352', name: 'Análisis III', credits: 3, level: 8, prereqs: ['303302'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303402', name: 'Variable Compleja', credits: 3, level: 8, prereqs: ['303302'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305005', name: 'Ética e Integridad Científica', credits: 1, level: 8, prereqs: ['305004'], coreqs: [], creditGate: 70, type: 'nucleo' },

  // ----------------------------- NIVEL 9 -----------------------------
  { code: '303452', name: 'Teoría de la Medida', credits: 3, level: 9, prereqs: ['303302'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303459', name: 'Geometría Diferencial', credits: 3, level: 9, prereqs: ['303352'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303527', name: 'Ecuaciones Diferenciales Parciales', credits: 3, level: 9, prereqs: ['302391', '303013', '303352'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '314044', name: 'Seminario de Trabajo de Grado', credits: 6, level: 9, prereqs: ['303029'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 10 -----------------------------
  { code: '303552', name: 'Análisis Funcional', credits: 3, level: 10, prereqs: ['303412', '303452'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '314045', name: 'Trabajo de Grado', credits: 10, level: 10, prereqs: ['314044'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // --------------------------- ELECTIVAS ------------------------------
  { code: '314076', name: 'Lógica Computacional', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '303047', name: 'Probabilidad II', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '314075', name: 'Teoría de Categorías para el Aprendizaje de la Inteligencia Artificial', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
],
  },
  'mate-v5': {
    label: 'Matemáticas (v5)',
    meta: {
  studentName: 'José David Palacio Arias',
  studentId: '1018227891',
  program: 'Matemáticas (v5)',
  programCode: '213',
  university: 'Universidad de Antioquia',
  extractedOn: '23/07/2026',
},
    electiveCreditsRequired: 15,
    coreLevels: 10,
    courses: [

  // ----------------------------- NIVEL 1 (16 créditos) -----------------------------
  { code: '303001', name: 'Álgebra y Trigonometría', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303002', name: 'Cálculo Diferencial', credits: 3, level: 1, prereqs: [], coreqs: ['303001'], creditGate: 0, type: 'nucleo' },
  { code: '303006', name: 'Geometría Básica', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303117', name: 'Fundamentos de Matemáticas', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305115', name: 'Fundamentación en Ciencias', credits: 4, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 2 (16 créditos) -----------------------------
  { code: '303005', name: 'Cálculo Integral', credits: 3, level: 2, prereqs: ['303002', '303001'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303008', name: 'Lógica', credits: 3, level: 2, prereqs: ['303117'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303010', name: 'Álgebra Lineal', credits: 3, level: 2, prereqs: ['303001', '303006'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303158', name: 'Programación', credits: 3, level: 2, prereqs: ['303117'], coreqs: [], creditGate: 6, type: 'nucleo' },
  { code: '305120', name: 'Cátedra Universitaria I', credits: 2, level: 2, prereqs: [], coreqs: [], creditGate: 6, type: 'nucleo' },
  { code: '9003101', name: 'English 1', credits: 2, level: 2, prereqs: [], coreqs: [], creditGate: 6, type: 'nucleo' },

  // ----------------------------- NIVEL 3 (15 créditos) -----------------------------
  { code: '303009', name: 'Cálculo Vectorial', credits: 3, level: 3, prereqs: ['303005', '303010'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303011', name: 'Teoría de Conjuntos', credits: 3, level: 3, prereqs: ['303008'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303258', name: 'Teoría de Números y Combinatoria', credits: 3, level: 3, prereqs: [], coreqs: ['303011'], creditGate: 0, type: 'nucleo' },
  { code: '303313', name: 'Probabilidad', credits: 3, level: 3, prereqs: [], coreqs: ['303009'], creditGate: 0, type: 'nucleo' },
  { code: '305121', name: 'Cátedra Universitaria II', credits: 1, level: 3, prereqs: ['305120'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003102', name: 'English 2', credits: 2, level: 3, prereqs: ['9003101'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 4 (15 créditos) -----------------------------
  { code: '303013', name: 'Ecuaciones Diferenciales Ordinarias', credits: 3, level: 4, prereqs: ['303009'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303209', name: 'Geometría I', credits: 3, level: 4, prereqs: ['303008'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303304', name: 'Álgebra I', credits: 3, level: 4, prereqs: ['303258', '303010', '303011'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303363', name: 'Inferencia Estadística', credits: 3, level: 4, prereqs: ['303313'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305122', name: 'Cátedra Universitaria III', credits: 1, level: 4, prereqs: ['305121'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003103', name: 'English 3', credits: 2, level: 4, prereqs: ['9003102'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 5 (17 créditos) -----------------------------
  { code: '302270', name: 'Física Básica I', credits: 4, level: 5, prereqs: ['303005'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303012', name: 'Análisis Numérico', credits: 3, level: 5, prereqs: ['303158', '303013'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303252', name: 'Análisis I', credits: 3, level: 5, prereqs: ['303009', '303011'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303354', name: 'Álgebra II', credits: 3, level: 5, prereqs: ['303304'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305123', name: 'Cátedra Universitaria IV', credits: 2, level: 5, prereqs: ['305122'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003104', name: 'English 4', credits: 2, level: 5, prereqs: ['9003103'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 6 (15 créditos) -----------------------------
  { code: '302391', name: 'Física Básica II', credits: 4, level: 6, prereqs: ['302270'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303014', name: 'Metodología de las Matemáticas', credits: 3, level: 6, prereqs: ['303252', '303304', '303363'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303302', name: 'Análisis II', credits: 3, level: 6, prereqs: ['303252'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303404', name: 'Álgebra Multilineal', credits: 3, level: 6, prereqs: ['303354'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003105', name: 'English 5', credits: 2, level: 6, prereqs: ['9003104'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 7 (14 créditos) -----------------------------
  { code: '303015', name: 'Historia de las Matemáticas', credits: 3, level: 7, prereqs: ['303014'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303352', name: 'Análisis III', credits: 3, level: 7, prereqs: ['303302'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303402', name: 'Variable Compleja', credits: 3, level: 7, prereqs: ['303302'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303412', name: 'Topología', credits: 3, level: 7, prereqs: ['303252'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305124', name: 'Cátedra Universitaria V', credits: 2, level: 7, prereqs: ['305123'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 8 (10 créditos) -----------------------------
  { code: '303029', name: 'Introducción a la Investigación', credits: 3, level: 8, prereqs: ['303015', '303352'], coreqs: [], creditGate: 80, type: 'nucleo' },
  { code: '303452', name: 'Teoría de la Medida', credits: 3, level: 8, prereqs: ['303302'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303459', name: 'Geometría Diferencial', credits: 3, level: 8, prereqs: ['303352', '303209'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305125', name: 'Cátedra Universitaria VI', credits: 1, level: 8, prereqs: ['305124'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 9 (8 créditos) -----------------------------
  { code: '303016', name: 'Seminario de Trabajo de Grado', credits: 4, level: 9, prereqs: ['303029'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303527', name: 'Ecuaciones Diferenciales Parciales', credits: 3, level: 9, prereqs: ['302391', '303352', '303013'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '305126', name: 'Cátedra Universitaria VII', credits: 1, level: 9, prereqs: ['305125'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 10 (7 créditos) -----------------------------
  { code: '303017', name: 'Trabajo de Grado', credits: 4, level: 10, prereqs: ['303016'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '303552', name: 'Análisis Funcional', credits: 3, level: 10, prereqs: ['303452', '303412'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // --------------------------- ELECTIVAS MATEMÁTICAS V5 (4 materias) ------------------------------
  // Se exigen 15 créditos electivos.
  { code: '314076', name: 'Lógica Computacional', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '303047', name: 'Probabilidad II', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '314075', name: 'Teoría de Categorías para el Aprendizaje de la Inteligencia Artificial', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '303033', name: 'Topología Algebraica', credits: 3, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva' },
],
  },
  'astro-v4': {
    label: 'Astronomía (v4)',
    meta: {
  studentName: 'Astronomía',
  studentId: '',
  program: 'Astronomía (v4)',
  programCode: '211',
  university: 'Universidad de Antioquia',
  extractedOn: '22/07/2026',
},
    electiveCreditsRequired: 8,
    coreLevels: 10,
    courses: [

  // ----------------------------- NIVEL 1 (17 créditos) -----------------------------
  { code: '0303001', name: 'Álgebra y Trigonometría', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0303006', name: 'Geometría Básica', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0305001', name: 'Fundamentación en Ciencia', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0305190', name: 'Español Académico', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311150', name: 'Fundamentación en Astronomía', credits: 3, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003101', name: 'English 1', credits: 2, level: 1, prereqs: [], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 2 (16 créditos) -----------------------------
  { code: '0302712', name: 'Fundamentos en Computación', credits: 3, level: 2, prereqs: ['0303001', '0303006'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0303002', name: 'Cálculo Diferencial', credits: 3, level: 2, prereqs: ['0303001'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0303010', name: 'Álgebra Lineal', credits: 3, level: 2, prereqs: ['0303001', '0303006'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0305002', name: 'Historia, Política y Estética', credits: 2, level: 2, prereqs: ['0305190'], coreqs: [], creditGate: 10, type: 'nucleo' },
  { code: '0311152', name: 'Introducción a la Astronomía Práctica', credits: 3, level: 2, prereqs: ['0311150', '0303001'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003102', name: 'English 2', credits: 2, level: 2, prereqs: ['9003101'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 3 (17 créditos) -----------------------------
  { code: '0302270', name: 'Física Básica I', credits: 4, level: 3, prereqs: ['0303002'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0302271', name: 'Física Experimental I', credits: 2, level: 3, prereqs: ['0303002', '0311152'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0302713', name: 'Métodos Computacionales', credits: 3, level: 3, prereqs: ['0303002', '0303010', '0302712'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0303005', name: 'Cálculo Integral', credits: 3, level: 3, prereqs: ['0303002'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311153', name: 'Astronomía de Posición', credits: 3, level: 3, prereqs: ['0303002', '0311150', '0302712'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003103', name: 'English 3', credits: 2, level: 3, prereqs: ['9003102'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 4 (17 créditos) -----------------------------
  { code: '0302391', name: 'Física Básica II', credits: 4, level: 4, prereqs: ['0302270', '0303005'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0302392', name: 'Física Experimental II', credits: 2, level: 4, prereqs: ['0302271', '0302270'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0303009', name: 'Cálculo Vectorial', credits: 3, level: 4, prereqs: ['0303005'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0303013', name: 'Ecuaciones Diferenciales Ordinarias', credits: 3, level: 4, prereqs: ['0303005', '0303010'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311154', name: 'Astronomía Práctica I', credits: 3, level: 4, prereqs: ['0302271', '0302712'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003104', name: 'English 4', credits: 2, level: 4, prereqs: ['9003103'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 5 (17 créditos) -----------------------------
  { code: '0302401', name: 'Física Básica III', credits: 4, level: 5, prereqs: ['0302391', '0303009'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0302402', name: 'Física Experimental III', credits: 2, level: 5, prereqs: ['0302392', '0302391'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311155', name: 'Cálculo Avanzado', credits: 4, level: 5, prereqs: ['0303009'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311156', name: 'Mecánica Celeste', credits: 4, level: 5, prereqs: ['0302713', '0303013', '0311153'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311502', name: 'Ciencias Planetarias', credits: 3, level: 5, prereqs: ['0302391'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 6 (16 créditos) -----------------------------
  { code: '0302576', name: 'Física Matemática I', credits: 4, level: 6, prereqs: ['0303013', '0311155'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311157', name: 'Astroestadística', credits: 4, level: 6, prereqs: ['0302713'], coreqs: ['0302576'], creditGate: 0, type: 'nucleo' },
  { code: '0311158', name: 'Astrofísica Moderna', credits: 4, level: 6, prereqs: ['0311156'], coreqs: ['0302576'], creditGate: 0, type: 'nucleo' },
  { code: '0311610', name: 'Astronomía Práctica II', credits: 2, level: 6, prereqs: ['0302401', '0311154'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '9003105', name: 'English 5', credits: 2, level: 6, prereqs: ['9003104'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 7 (16 créditos) -----------------------------
  { code: '0302715', name: 'Termodinámica', credits: 3, level: 7, prereqs: ['0302401', '0303013'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0302719', name: 'Electrodinámica I', credits: 4, level: 7, prereqs: ['0302576'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0305450', name: 'Cátedra de Formación Ciudadana y Constitucional', credits: 1, level: 7, prereqs: [], coreqs: [], creditGate: 70, type: 'nucleo' },
  { code: '0311703', name: 'Relatividad y Gravitación', credits: 4, level: 7, prereqs: ['0311158'], coreqs: ['0302719'], creditGate: 0, type: 'nucleo' },
  { code: '0311704', name: 'Astrofísica Estelar', credits: 4, level: 7, prereqs: ['0311156', '0311157'], coreqs: ['0302715'], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 8 (15 créditos) -----------------------------
  { code: '0302716', name: 'Mecánica Cuántica I', credits: 4, level: 8, prereqs: ['0311158', '0302719'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0305004', name: 'Desarrollo Humano', credits: 1, level: 8, prereqs: [], coreqs: [], creditGate: 100, type: 'nucleo' },
  { code: '0311015', name: 'Astrofísica Galáctica y Extragaláctica', credits: 4, level: 8, prereqs: ['0311704'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311159', name: 'Mecánica de Medios Continuos', credits: 4, level: 8, prereqs: ['0311156', '0302713'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311710', name: 'Astronomía Práctica III', credits: 2, level: 8, prereqs: ['0311610', '0311158'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 9 (7 créditos) -----------------------------
  { code: '0305003', name: 'Cátedra Ambiental UdeA', credits: 2, level: 9, prereqs: [], coreqs: [], creditGate: 110, type: 'nucleo' },
  { code: '0311160', name: 'Comunicación y Didáctica de las Ciencias', credits: 2, level: 9, prereqs: ['0311015'], coreqs: [], creditGate: 0, type: 'nucleo' },
  { code: '0311161', name: 'Seminario de Trabajo de Grado', credits: 3, level: 9, prereqs: ['0311015', '0302716'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // ----------------------------- NIVEL 10 (8 créditos) -----------------------------
  { code: '0305005', name: 'Ética e Integridad Científica', credits: 1, level: 10, prereqs: [], coreqs: [], creditGate: 130, type: 'nucleo' },
  { code: '0311162', name: 'Trabajo de Grado', credits: 7, level: 10, prereqs: ['0311161'], coreqs: [], creditGate: 0, type: 'nucleo' },

  // --------------------- ELECTIVA 9001 · CICLO DE PROFUNDIZACIÓN (23 materias) ---------------------
  // Se exigen 8 créditos (2 electivas de 4 créditos) del siguiente banco.
  // Prerrequisitos según tabla verificada por el estudiante.
  { code: '0311022', name: 'Astrobiología', credits: 4, level: 0, prereqs: ['0311502'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311023', name: 'Astrodinámica', credits: 4, level: 0, prereqs: ['0311156'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311904', name: 'Astrofísica Computacional', credits: 4, level: 0, prereqs: ['0302713'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311027', name: 'Astronomía Observacional', credits: 4, level: 0, prereqs: ['0311153'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311997', name: 'Atmósferas Planetarias', credits: 4, level: 0, prereqs: ['0302401', '0303009'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311910', name: 'Construcción y Uso de Telescopios Astronómicos', credits: 4, level: 0, prereqs: ['0311150'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311017', name: 'Cosmología I', credits: 4, level: 0, prereqs: ['0311703'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311018', name: 'Cosmología II', credits: 4, level: 0, prereqs: ['0311017'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311998', name: 'Cosmología Moderna', credits: 4, level: 0, prereqs: ['0311155'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311604', name: 'Cuerpos Pequeños del Sistema Solar', credits: 4, level: 0, prereqs: ['0311502', '0311156'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311020', name: 'Cúmulos Estelares', credits: 4, level: 0, prereqs: ['0311156', '0311610'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311605', name: 'Espectroscopía Estelar', credits: 4, level: 0, prereqs: ['0311704'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311102', name: 'Espectroscopía Estelar y Galáctica', credits: 4, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva', prereqsUnknown: true },
  { code: '0311909', name: 'Exoplanetas', credits: 4, level: 0, prereqs: ['0302401', '0302713'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0302157', name: 'Física Subatómica', credits: 4, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva', prereqsUnknown: true },
  { code: '0311021', name: 'Geofísica', credits: 4, level: 0, prereqs: [], coreqs: [], creditGate: 0, type: 'electiva', prereqsUnknown: true },
  { code: '0311122', name: 'Inteligencia Artificial: Otra Mirada al Universo de los Datos', credits: 4, level: 0, prereqs: ['0302713', '0303009'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311995', name: 'Medio Interestelar', credits: 4, level: 0, prereqs: ['0311158'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311606', name: 'Métodos Geofísicos', credits: 4, level: 0, prereqs: ['0303013'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311151', name: 'Minería de Datos en Astronomía', credits: 4, level: 0, prereqs: ['0302401', '0302713'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311024', name: 'Radioastronomía', credits: 4, level: 0, prereqs: ['0311158'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311026', name: 'Tópicos Avanzados en Cosmología y Gravitación', credits: 4, level: 0, prereqs: ['0311703', '0311998'], coreqs: [], creditGate: 0, type: 'electiva' },
  { code: '0311028', name: 'Universo Temprano', credits: 4, level: 0, prereqs: ['0302719'], coreqs: [], creditGate: 0, type: 'electiva' },
],
  },
};
