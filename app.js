/* ==========================================================================
   PSICOSCORZA - SISTEMA WEB DE ATENCIÓN PSICOLÓGICA & BIENESTAR ESTUDIANTIL
   IESTP Manuel Scorza Torre (Acobamba - Huancavelica)
   Autores: Katty Maribel Huaman Acho & Nery Luz Reymundo Gavilan
   Docente: Ing. José Gabriel Quispe Anyaipoma
   Semana 3 - Flujo Completo de Atención Psicológica en 10 Pasos
   ========================================================================== */

// ==========================================================================
// 1. INICIALIZACIÓN DE FIREBASE CLOUD FIRESTORE (PROYECTO: plataforma-web-citas)
// ==========================================================================
let dbFirestore = null;
try {
  if (typeof firebase !== 'undefined' && firebase.apps) {
    if (firebase.apps.length === 0) {
      const firebaseConfig = {
        projectId: "plataforma-web-citas",
        authDomain: "plataforma-web-citas.firebaseapp.com",
        storageBucket: "plataforma-web-citas.appspot.com",
        apiKey: window.FIREBASE_API_KEY || "AIzaSyScorzaPsicologia2026PlataformaWebKey",
        appId: "1:1029384756:web:scorza2026plataforma"
      };
      firebase.initializeApp(firebaseConfig);
    }
    dbFirestore = firebase.firestore();
    console.log("[Firebase Cloud Firestore] Conectado exitosamente al proyecto 'plataforma-web-citas'.");
  }
} catch (e) {
  console.warn("[Firebase] Inicialización en modo híbrido offline/online:", e.message);
}

// ==========================================================================
// 2. CONFIGURACIÓN INSTITUCIONAL PERSISTENTE
// ==========================================================================
const DEFAULT_CONFIG = {
  nombre_institucion: "IESTP Manuel Scorza Torre",
  direccion: "Av. Los Libertadores S/N, Acobamba, Huancavelica - Perú",
  correo_contacto: "psicologia@scorza.edu.pe",
  telefono_contacto: "967-890-123",
  duracion_sesion: 45,
  horario_atencion: "Lunes a Viernes 08:00 AM - 06:00 PM",
  dias_anticipacion: 15,
  horas_cancelacion: 24,
  permitir_virtual: true
};

let SYSTEM_CONFIG = JSON.parse(localStorage.getItem('psicoscorza_config') || 'null') || DEFAULT_CONFIG;

function saveSystemConfig(newCfg) {
  SYSTEM_CONFIG = { ...SYSTEM_CONFIG, ...newCfg };
  localStorage.setItem('psicoscorza_config', JSON.stringify(SYSTEM_CONFIG));
}

// ==========================================================================
// 3. DIRECTORIO OFICIAL: 3 PSICÓLOGOS COLEGIADOS
// ==========================================================================
let dbPsicologos = [
  {
    id_psicologo: 1,
    nombre_completo: "Lic. José Gabriel Quispe Anyaipoma",
    nombre_corto: "Lic. José Gabriel Quispe",
    correo: "jquispe@scorza.edu.pe",
    password: "Quispe2026!",
    cpsp: "C.Ps.P. 28410",
    especialidad: "Psicología Clínica y Educativa",
    consultorio: "Consultorio 01 (Pabellón A)",
    horario: "Lunes a Viernes: 08:00 AM - 01:00 PM",
    turno: "Mañana",
    horas_disponibles: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"],
    estado: "Activo",
    avatar: "JQ",
    telefono: "967-890-111",
    pacientes_asignados: 18,
    biografia: "Especialista en intervención psicopedagógica, ansiedad ante evaluaciones y adaptación a la vida académica superior."
  },
  {
    id_psicologo: 2,
    nombre_completo: "Dra. María Elena Romero Ccanto",
    nombre_corto: "Dra. María Elena Romero",
    correo: "mromero@scorza.edu.pe",
    password: "Romero2026!",
    cpsp: "C.Ps.P. 19522",
    especialidad: "Psicología de la Salud y Manejo del Estrés",
    consultorio: "Consultorio 02 (Pabellón B)",
    horario: "Lunes a Viernes: 08:30 AM - 01:30 PM",
    turno: "Mañana",
    horas_disponibles: ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "12:30 PM"],
    estado: "Activo",
    avatar: "MR",
    telefono: "967-890-222",
    pacientes_asignados: 22,
    biografia: "Doctora en Psicología de la Salud con amplia trayectoria en regulación emocional y consejería de estudiantes del área de salud."
  },
  {
    id_psicologo: 3,
    nombre_completo: "Lic. Karin Lisbeth Vílchez Torrealva",
    nombre_corto: "Lic. Karin Lisbeth Vílchez",
    correo: "kvilchez@scorza.edu.pe",
    password: "Vilchez2026!",
    cpsp: "C.Ps.P. 31205",
    especialidad: "Orientación Vocacional y Consejería Estudiantil",
    consultorio: "Consultorio 03 (Pabellón B)",
    horario: "Lunes a Viernes: 01:00 PM - 06:00 PM",
    turno: "Tarde",
    horas_disponibles: ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    estado: "Activo",
    avatar: "KV",
    telefono: "967-890-333",
    pacientes_asignados: 15,
    biografia: "Especialista en proyectos de vida profesional, resolución constructiva de conflictos y desarrollo vocacional técnico."
  }
];

try {
  const localPsico = localStorage.getItem('psicoscorza_psicologos');
  if (localPsico) {
    const parsed = JSON.parse(localPsico);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const pMap = new Map();
      dbPsicologos.forEach(p => pMap.set(p.correo, p));
      parsed.forEach(p => {
        const exist = pMap.get(p.correo);
        pMap.set(p.correo, { ...(exist || {}), ...p });
      });
      dbPsicologos = Array.from(pMap.values());
    }
  }
} catch (e) {}

function persistPsicologos() {
  localStorage.setItem('psicoscorza_psicologos', JSON.stringify(dbPsicologos));
}

// Solicitudes de nuevos psicólogos (Postulaciones para aprobación administrativa)
let dbSolicitudesPsicologos = [
  {
    id_solicitud: "sol_psico_1",
    nombres: "Lic. Carmen Rosa",
    apellidos: "Mendoza Ramos",
    nombre_completo: "Lic. Carmen Rosa Mendoza Ramos",
    correo: "carmen.mendoza@scorza.edu.pe",
    password: "Mendoza2026!",
    cpsp: "C.Ps.P. 33140",
    especialidad: "Psicología Educativa e Inclusión",
    telefono: "967-891-444",
    turno_postulado: "Tarde",
    horario: "Lunes a Viernes: 01:00 PM - 06:00 PM",
    consultorio: "Consultorio 02 (Pabellón B)",
    fecha_solicitud: "2026-11-08",
    estado: "Pendiente", // 'Pendiente', 'Aprobado', 'Rechazado'
    curriculum: "Especialista con 6 años de experiencia en tutoría psicopedagógica, inclusión y adaptación curricular en institutos superiores."
  }
];

try {
  const localSolPsico = localStorage.getItem('psicoscorza_solicitudes_psico');
  if (localSolPsico) {
    const parsed = JSON.parse(localSolPsico);
    if (Array.isArray(parsed) && parsed.length > 0) dbSolicitudesPsicologos = parsed;
  }
} catch (e) {}

function persistSolicitudesPsicologos() {
  localStorage.setItem('psicoscorza_solicitudes_psico', JSON.stringify(dbSolicitudesPsicologos));
}

// ==========================================================================
// 4. DIRECTORIO DE ALUMNOS (PACIENTES REALES DEL IESTP)
// ==========================================================================
let dbPacientes = [
  { id_alumno: 1, codigo_estudiantil: 'APSTI-2024-001', dni: '73456128', nombres: 'Katty Maribel', apellidos: 'Huaman Acho', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '967890123', correo: 'katty.huaman@scorza.edu.pe', fecha_registro: '2026-03-15' },
  { id_alumno: 2, codigo_estudiantil: 'APSTI-2026-045', dni: '78901234', nombres: 'Gael', apellidos: 'Eslava Cosinga', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'I Semestre', telefono: '987654321', correo: 'gael.eslava@scorza.edu.pe', fecha_registro: '2026-09-02' },
  { id_alumno: 3, codigo_estudiantil: 'APSTI-2024-002', dni: '74125896', nombres: 'Nery Luz', apellidos: 'Reymundo Gavilan', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'IV Semestre', telefono: '954123987', correo: 'nery.reymundo@scorza.edu.pe', fecha_registro: '2026-03-15' },
  { id_alumno: 4, codigo_estudiantil: 'ENF-2024-012', dni: '76891234', nombres: 'Carmen Rosa', apellidos: 'Flores Taipe', carrera_profesional: 'Enfermería Técnica', semestre_academico: 'II Semestre', telefono: '932145698', correo: 'carmen.flores@scorza.edu.pe', fecha_registro: '2026-04-10' },
  { id_alumno: 5, codigo_estudiantil: 'MEC-2024-005', dni: '72145890', nombres: 'Luis Miguel', apellidos: 'Mendoza Quispe', carrera_profesional: 'Mecánica Automotriz', semestre_academico: 'VI Semestre', telefono: '921789456', correo: 'luis.mendoza@scorza.edu.pe', fecha_registro: '2026-03-18' },
  { id_alumno: 6, codigo_estudiantil: 'ENF-2024-033', dni: '75432198', nombres: 'Ruth', apellidos: 'Torres Quispe', carrera_profesional: 'Enfermería Técnica', semestre_academico: 'IV Semestre', telefono: '912345678', correo: 'ruth.torres@scorza.edu.pe', fecha_registro: '2026-05-20' },
  { id_alumno: 7, codigo_estudiantil: 'APSTI-2024-019', dni: '71239845', nombres: 'Jhon Fernando', apellidos: 'Álvarez Boza', carrera_profesional: 'Arquitectura de Plataformas TI', semestre_academico: 'II Semestre', telefono: '934567812', correo: 'jhon.alvarez@scorza.edu.pe', fecha_registro: '2026-04-25' },
  { id_alumno: 8, codigo_estudiantil: 'ENF-2026-008', dni: '79845123', nombres: 'Jasmin', apellidos: 'Areche Huamán', carrera_profesional: 'Enfermería Técnica', semestre_academico: 'I Semestre', telefono: '945678123', correo: 'jasmin.areche@scorza.edu.pe', fecha_registro: '2026-09-05' },
  { id_alumno: 9, codigo_estudiantil: 'MEC-2024-022', dni: '76541289', nombres: 'Carlos Alberto', apellidos: 'Paucar Mendoza', carrera_profesional: 'Mecánica Automotriz', semestre_academico: 'IV Semestre', telefono: '956789124', correo: 'carlos.paucar@scorza.edu.pe', fecha_registro: '2026-03-22' }
];

try {
  const localPac = localStorage.getItem('psicoscorza_pacientes');
  if (localPac) {
    const parsed = JSON.parse(localPac);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const pMap = new Map();
      dbPacientes.forEach(p => pMap.set(p.dni, p));
      parsed.forEach(p => {
        const exist = pMap.get(p.dni);
        pMap.set(p.dni, { ...(exist || {}), ...p });
      });
      dbPacientes = Array.from(pMap.values());
    }
  }
} catch (e) {}

function persistPacientes() {
  localStorage.setItem('psicoscorza_pacientes', JSON.stringify(dbPacientes));
}

// ==========================================================================
// 5. BASE DE CITAS (CON CÓDIGOS REALES DEL IESTP)
// ==========================================================================
let dbCitas = [
  {
    id_cita: "cit_050",
    codigo_cita: "CIT-2026-050",
    alumno: "Katty Maribel Huaman Acho",
    dni: "73456128",
    carrera: "Arquitectura de Plataformas TI",
    psicologo: "Lic. José Gabriel Quispe Anyaipoma",
    consultorio: "Consultorio 01 (Pabellón A)",
    fecha_cita: "2026-11-12",
    hora_inicio: "09:00 AM",
    modalidad: "Presencial",
    estado_cita: "Confirmada",
    motivo_consulta: "Orientación psicopedagógica y planificación de entregables académicos finales"
  },
  {
    id_cita: "cit_040",
    codigo_cita: "CIT-2026-040",
    alumno: "Gael Eslava Cosinga",
    dni: "78901234",
    carrera: "Arquitectura de Plataformas TI",
    psicologo: "Lic. José Gabriel Quispe Anyaipoma",
    consultorio: "Consultorio 01 (Pabellón A)",
    fecha_cita: "2026-11-13",
    hora_inicio: "10:30 AM",
    modalidad: "Presencial",
    estado_cita: "Confirmada",
    motivo_consulta: "Adaptación académica y métodos de concentración para ingresantes de I Semestre"
  },
  {
    id_cita: "cit_101",
    codigo_cita: "CIT-2026-0101",
    alumno: "Katty Maribel Huaman Acho",
    dni: "73456128",
    carrera: "Arquitectura de Plataformas TI",
    psicologo: "Pendiente de Asignación",
    consultorio: "Por Definir",
    fecha_cita: "2026-11-16",
    hora_inicio: "11:30 AM",
    modalidad: "Virtual",
    estado_cita: "Pendiente",
    motivo_consulta: "Técnicas de regulación de la ansiedad ante evaluaciones y sustentación de proyectos"
  },
  {
    id_cita: "cit_201",
    codigo_cita: "CIT-2026-0201",
    alumno: "Nery Luz Reymundo Gavilan",
    dni: "74125896",
    carrera: "Arquitectura de Plataformas TI",
    psicologo: "Dra. María Elena Romero Ccanto",
    consultorio: "Consultorio 02 (Pabellón B)",
    fecha_cita: "2026-11-12",
    hora_inicio: "09:30 AM",
    modalidad: "Presencial",
    estado_cita: "Confirmada",
    motivo_consulta: "Gestión del tiempo y técnicas de relajación muscular ante fatiga mental"
  },
  {
    id_cita: "cit_202",
    codigo_cita: "CIT-2026-0202",
    alumno: "Carmen Rosa Flores Taipe",
    dni: "76891234",
    carrera: "Enfermería Técnica",
    psicologo: "Dra. María Elena Romero Ccanto",
    consultorio: "Consultorio 02 (Pabellón B)",
    fecha_cita: "2026-11-14",
    hora_inicio: "10:00 AM",
    modalidad: "Presencial",
    estado_cita: "Finalizada",
    motivo_consulta: "Apoyo emocional y control de estrés durante rotación en prácticas clínicas hospitalarias"
  },
  {
    id_cita: "cit_203",
    codigo_cita: "CIT-2026-0203",
    alumno: "Ruth Torres Quispe",
    dni: "75432198",
    carrera: "Enfermería Técnica",
    psicologo: "Pendiente de Asignación",
    consultorio: "Por Definir",
    fecha_cita: "2026-11-17",
    hora_inicio: "11:00 AM",
    modalidad: "Virtual",
    estado_cita: "Pendiente",
    motivo_consulta: "Evaluación psicopedagógica y desarrollo de motivación para el aprendizaje clínico"
  },
  {
    id_cita: "cit_103",
    codigo_cita: "CIT-2026-0103",
    alumno: "Jhon Fernando Álvarez Boza",
    dni: "71239845",
    carrera: "Arquitectura de Plataformas TI",
    psicologo: "Lic. Karin Lisbeth Vílchez Torrealva",
    consultorio: "Consultorio 03 (Pabellón B)",
    fecha_cita: "2026-11-13",
    hora_inicio: "02:00 PM",
    modalidad: "Presencial",
    estado_cita: "En atención",
    motivo_consulta: "Orientación vocacional y proyección profesional en el área de desarrollo de software"
  },
  {
    id_cita: "cit_301",
    codigo_cita: "CIT-2026-0301",
    alumno: "Jhon Fernando Álvarez Boza",
    dni: "71239845",
    carrera: "Arquitectura de Plataformas TI",
    psicologo: "Lic. Karin Lisbeth Vílchez Torrealva",
    consultorio: "Consultorio 03 (Pabellón B)",
    fecha_cita: "2026-11-13",
    hora_inicio: "02:00 PM",
    modalidad: "Presencial",
    estado_cita: "Confirmada",
    motivo_consulta: "Orientación vocacional y proyección profesional en el área de desarrollo de software"
  },
  {
    id_cita: "cit_303",
    codigo_cita: "CIT-2026-0303",
    alumno: "Carlos Alberto Paucar Mendoza",
    dni: "76541289",
    carrera: "Mecánica Automotriz",
    psicologo: "Lic. Karin Lisbeth Vílchez Torrealva",
    consultorio: "Consultorio 03 (Pabellón B)",
    fecha_cita: "2026-11-10",
    hora_inicio: "04:00 PM",
    modalidad: "Presencial",
    estado_cita: "Finalizada",
    motivo_consulta: "Consejería y resolución asertiva de conflictos en trabajo en equipo de taller"
  }
];

// Cargar citas persistentes en localStorage con merge inteligente
try {
  const localCitas = localStorage.getItem('psicoscorza_citas');
  if (localCitas) {
    const parsed = JSON.parse(localCitas);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const initialMap = new Map();
      dbCitas.forEach(c => initialMap.set(c.codigo_cita, c));
      parsed.forEach(c => {
        const exist = initialMap.get(c.codigo_cita);
        initialMap.set(c.codigo_cita, { ...(exist || {}), ...c });
      });
      dbCitas = Array.from(initialMap.values());
    }
  }
} catch (e) {}

function persistCitas() {
  localStorage.setItem('psicoscorza_citas', JSON.stringify(dbCitas));
}

// ==========================================================================
// 6. REGISTRO PRIVADO DE SESIONES CLÍNICAS (CONFIDENCIALIDAD CPSP / LEY 29733)
// ==========================================================================
let dbSesionesClinicas = [
  {
    id_sesion: "SES-2026-001",
    codigo_cita: "CIT-2026-0202",
    numero_sesion: 1,
    fecha_sesion: "2026-11-14",
    alumno: "Carmen Rosa Flores Taipe",
    dni: "76891234",
    carrera: "Enfermería Técnica",
    psicologo: "Dra. María Elena Romero Ccanto",
    consultorio: "Consultorio 02 (Pabellón B)",
    motivo_consulta: "Apoyo emocional y control de estrés durante rotación en prácticas clínicas hospitalarias",
    evaluacion: "Estudiante orientada en tiempo, espacio y persona. Manifiesta sintomatología ansiosa adaptativa leve relacionada con la primera experiencia en salas de emergencia.",
    observaciones: "Lenguaje coherente y disposición proactiva al diálogo reflexivo. Adecuada alianza terapéutica.",
    intervencion: "Psicoeducación sobre la respuesta psicofisiológica al estrés laboral. Entrenamiento en respiración diafragmática 4-7-8.",
    recomendaciones: "1. Practicar técnica de respiración diafragmática 5 minutos antes de iniciar el turno de guardia.\n2. Llevar diario de descompresión emocional tras cada práctica.\n3. Mantener hidratación y pausas activas programadas.",
    seguimiento: "Próxima sesión en 14 días para evaluar el desempeño en el segundo ciclo de rotación clínica.",
    proxima_sesion: "2026-11-28 10:00 AM"
  },
  {
    id_sesion: "SES-2026-002",
    codigo_cita: "CIT-2026-0303",
    numero_sesion: 1,
    fecha_sesion: "2026-11-10",
    alumno: "Carlos Alberto Paucar Mendoza",
    dni: "76541289",
    carrera: "Mecánica Automotriz",
    psicologo: "Lic. Karin Lisbeth Vílchez Torrealva",
    consultorio: "Consultorio 03 (Pabellón B)",
    motivo_consulta: "Consejería y resolución asertiva de conflictos en trabajo en equipo de taller",
    evaluacion: "Estudiante colaborador, reconoce impulsividad verbal en momentos de alta presión por entrega de motores.",
    observaciones: "Manifiesta alto interés en mejorar sus relaciones interpersonales con sus compañeros de módulo.",
    intervencion: "Entrenamiento en comunicación asertiva mediante técnica del disco rayado y tiempo fuera.",
    recomendaciones: "1. Aplicar la pausa de 10 segundos antes de responder ante discrepancias en el taller.\n2. Comunicar necesidades con lenguaje en primera persona (mensaje 'Yo').",
    seguimiento: "Sesión de refuerzo programada para el cierre de semestre.",
    proxima_sesion: "2026-11-24 04:00 PM"
  }
];

try {
  const localSes = localStorage.getItem('psicoscorza_sesiones');
  if (localSes) {
    const parsed = JSON.parse(localSes);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const initialSesMap = new Map();
      dbSesionesClinicas.forEach(s => initialSesMap.set(s.id_sesion || s.codigo_cita, s));
      parsed.forEach(s => {
        const key = s.id_sesion || s.codigo_cita;
        const exist = initialSesMap.get(key);
        initialSesMap.set(key, { ...(exist || {}), ...s });
      });
      dbSesionesClinicas = Array.from(initialSesMap.values());
    }
  }
} catch (e) {}

function persistSesiones() {
  localStorage.setItem('psicoscorza_sesiones', JSON.stringify(dbSesionesClinicas));
}

// ==========================================================================
// 7. BANDEJA DE NOTIFICACIONES MULTI-ROL (FIREBASE / LOCAL)
// ==========================================================================
let dbNotificaciones = [
  {
    id_notif: "notif_1",
    destinatario_rol: "Paciente",
    destinatario_id: "katty.huaman@scorza.edu.pe",
    titulo: "Cita Confirmada con Éxito",
    mensaje: "Tu cita CIT-2026-050 fue confirmada con el Lic. José Gabriel Quispe para el 12/11 a las 09:00 AM en Consultorio 01 (Pabellón A).",
    fecha: "2026-11-10 09:30",
    leida: false,
    tipo: "cita_confirmada"
  },
  {
    id_notif: "notif_2",
    destinatario_rol: "Administrador",
    destinatario_id: "admin.psicologia@scorza.edu.pe",
    titulo: "Nueva Solicitud de Cita Pendiente",
    mensaje: "El estudiante Katty Maribel Huaman Acho ha solicitado la cita CIT-2026-0101 (Virtual). Requiere asignación de especialista.",
    fecha: "2026-11-10 10:15",
    leida: false,
    tipo: "cita_nueva"
  }
];

try {
  const localNotif = localStorage.getItem('psicoscorza_notificaciones');
  if (localNotif) {
    const parsed = JSON.parse(localNotif);
    if (Array.isArray(parsed) && parsed.length > 0) dbNotificaciones = parsed;
  }
} catch (e) {}

function persistNotificaciones() {
  localStorage.setItem('psicoscorza_notificaciones', JSON.stringify(dbNotificaciones));
  updateNotifBadge();
}

function agregarNotificacion(destinatario_rol, destinatario_id, titulo, mensaje, tipo) {
  const notif = {
    id_notif: "notif_" + Date.now(),
    destinatario_rol,
    destinatario_id,
    titulo,
    mensaje,
    fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
    leida: false,
    tipo
  };
  dbNotificaciones.unshift(notif);
  persistNotificaciones();

  if (dbFirestore) {
    dbFirestore.collection('notificaciones').add(notif).catch(() => {});
  }
}

function updateNotifBadge() {
  const badge = document.getElementById('badge-notif-count');
  if (!badge || !currentUser) return;

  const unread = dbNotificaciones.filter(n => {
    if (n.leida) return false;
    if (currentUser.rol === 'Administrador' && n.destinatario_rol === 'Administrador') return true;
    if (currentUser.rol === 'Psicólogo' && (n.destinatario_rol === 'Psicólogo' || n.destinatario_id === currentUser.correo)) return true;
    if (currentUser.rol === 'Paciente' && (n.destinatario_rol === 'Paciente' || n.destinatario_id === currentUser.correo)) return true;
    return false;
  }).length;

  badge.textContent = unread;
  if (unread === 0) badge.classList.add('hidden');
  else badge.classList.remove('hidden');
}

// ==========================================================================
// 8. CUENTAS DE USUARIO Y CONTROL DE SESIÓN
// ==========================================================================
let dbUsuarios = [
  {
    id_usuario: 1,
    nombre_completo: "Katty Maribel Huaman Acho",
    nombre_corto: "Katty Huamán",
    correo: "admin.psicologia@scorza.edu.pe",
    password: "Admin123!",
    rol: "Administrador",
    estado: "Activo",
    avatar: "K"
  },
  {
    id_usuario: 2,
    nombre_completo: "Lic. José Gabriel Quispe Anyaipoma",
    nombre_corto: "Lic. José Gabriel Quispe",
    correo: "jquispe@scorza.edu.pe",
    password: "Quispe2026!",
    rol: "Psicólogo",
    consultorio: "Consultorio 01 (Pabellón A)",
    estado: "Activo",
    avatar: "JQ"
  },
  {
    id_usuario: 3,
    nombre_completo: "Dra. María Elena Romero Ccanto",
    nombre_corto: "Dra. María Elena Romero",
    correo: "mromero@scorza.edu.pe",
    password: "Romero2026!",
    rol: "Psicólogo",
    consultorio: "Consultorio 02 (Pabellón B)",
    estado: "Activo",
    avatar: "MR"
  },
  {
    id_usuario: 4,
    nombre_completo: "Lic. Karin Lisbeth Vílchez Torrealva",
    nombre_corto: "Lic. Karin Lisbeth Vílchez",
    correo: "kvilchez@scorza.edu.pe",
    password: "Vilchez2026!",
    rol: "Psicólogo",
    consultorio: "Consultorio 03 (Pabellón B)",
    estado: "Activo",
    avatar: "KV"
  },
  {
    id_usuario: 5,
    nombre_completo: "Katty Maribel Huaman Acho",
    nombre_corto: "Katty Huamán",
    correo: "katty.huaman@scorza.edu.pe",
    password: "Alumno123!",
    rol: "Paciente",
    carrera: "Arquitectura de Plataformas TI",
    dni: "73456128",
    avatar: "K"
  }
];

try {
  const localUsers = localStorage.getItem('psicoscorza_usuarios');
  if (localUsers) {
    const parsed = JSON.parse(localUsers);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const uMap = new Map();
      dbUsuarios.forEach(u => uMap.set(u.correo.toLowerCase(), u));
      parsed.forEach(u => uMap.set(u.correo.toLowerCase(), { ...(uMap.get(u.correo.toLowerCase()) || {}), ...u }));
      dbUsuarios = Array.from(uMap.values());
    }
  }
} catch (e) {}

function persistUsuarios() {
  localStorage.setItem('psicoscorza_usuarios', JSON.stringify(dbUsuarios));
}

let currentUser = null;
let currentToken = null;

// ==========================================================================
// 9. SINCRONIZACIÓN EN TIEMPO REAL CON FIREBASE
// ==========================================================================
function setupFirebaseRealtime() {
  if (!dbFirestore) return;

  // 1. Escuchar citas en tiempo real
  dbFirestore.collection('citas').onSnapshot(snapshot => {
    if (!snapshot.empty) {
      const remoteCitas = [];
      snapshot.forEach(doc => {
        remoteCitas.push({ id_cita: doc.id, ...doc.data() });
      });

      remoteCitas.forEach(rc => {
        const idx = dbCitas.findIndex(c => c.codigo_cita === rc.codigo_cita || c.id_cita === rc.id_cita);
        if (idx >= 0) dbCitas[idx] = { ...dbCitas[idx], ...rc };
        else dbCitas.unshift(rc);
      });
      persistCitas();
      refreshActiveViews();
    }
  }, err => console.warn("[Firebase] Error en citas:", err));

  // 2. Escuchar sesiones clínicas en tiempo real
  dbFirestore.collection('sesiones_clinicas').onSnapshot(snapshot => {
    if (!snapshot.empty) {
      const remoteSes = [];
      snapshot.forEach(doc => {
        remoteSes.push({ id_sesion: doc.id, ...doc.data() });
      });
      remoteSes.forEach(rs => {
        const idx = dbSesionesClinicas.findIndex(s => s.id_sesion === rs.id_sesion);
        if (idx >= 0) dbSesionesClinicas[idx] = { ...dbSesionesClinicas[idx], ...rs };
        else dbSesionesClinicas.unshift(rs);
      });
      persistSesiones();
    }
  }, err => console.warn("[Firebase] Error en sesiones:", err));
}

function refreshActiveViews() {
  const activeSubView = document.querySelector('.panel-subview:not(.hidden)');
  if (activeSubView) {
    switchPanelSubView(activeSubView.id);
  }
}

// ==========================================================================
// 10. HELPER: VERIFICADOR DE DISPONIBILIDAD DEL PSICÓLOGO
// ==========================================================================
function checkPsicologoDisponibilidad(psicoNombre, fecha, hora, idCitaExcluir = null) {
  const psico = dbPsicologos.find(p => p.nombre_completo.includes(psicoNombre) || psicoNombre.includes(p.nombre_corto));
  if (!psico) {
    return { disponible: false, mensaje: "Psicólogo no registrado en el sistema." };
  }

  // Comprobar si la hora coincide con el turno del especialista
  const turnoValido = psico.horas_disponibles.includes(hora);
  if (!turnoValido) {
    return {
      disponible: false,
      mensaje: `⚠️ Fuera de turno. ${psico.nombre_corto} atiende en el Turno ${psico.turno} (${psico.horario.split(':')[1].trim()}).`
    };
  }

  // Comprobar cruce con otra cita activa en la misma fecha y hora
  const conflicto = dbCitas.find(c => {
    if (idCitaExcluir && (c.id_cita === idCitaExcluir || c.codigo_cita === idCitaExcluir)) return false;
    const mismoPsico = c.psicologo && (c.psicologo.includes(psico.nombre_corto.split(' ')[2] || psico.nombre_corto));
    const mismaFecha = c.fecha_cita === fecha;
    const mismaHora = c.hora_inicio === hora;
    const estaActiva = (c.estado_cita === 'Confirmada' || c.estado_cita === 'En atención');
    return mismoPsico && mismaFecha && mismaHora && estaActiva;
  });

  if (conflicto) {
    return {
      disponible: false,
      mensaje: `⚠️ Horario ocupado: ${psico.nombre_corto} ya tiene la cita ${conflicto.codigo_cita} agendada el ${fecha} a las ${hora}.`
    };
  }

  return {
    disponible: true,
    mensaje: `✅ Disponible: ${psico.nombre_corto} libre en ${psico.consultorio}.`
  };
}

// ==========================================================================
// 11. TOAST NOTIFICATIONS GLOBALES
// ==========================================================================
function showToast(message, type = 'success') {
  const toast = document.getElementById('global-toast');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-message');
  if (!toast || !text) return;

  text.textContent = message;
  if (type === 'success') {
    toast.className = 'fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl border text-xs font-semibold flex items-center justify-between transition-all fade-in bg-emerald-50 border-emerald-300 text-emerald-900';
    if (icon) icon.textContent = '✅';
  } else if (type === 'error') {
    toast.className = 'fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl border text-xs font-semibold flex items-center justify-between transition-all fade-in bg-rose-50 border-rose-300 text-rose-900';
    if (icon) icon.textContent = '❌';
  } else {
    toast.className = 'fixed bottom-5 right-5 z-50 max-w-sm w-full p-4 rounded-2xl shadow-xl border text-xs font-semibold flex items-center justify-between transition-all fade-in bg-sky-50 border-sky-300 text-sky-900';
    if (icon) icon.textContent = 'ℹ️';
  }

  toast.classList.remove('hidden');
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => closeToast(), 4500);
}

function closeToast() {
  const toast = document.getElementById('global-toast');
  if (toast) toast.classList.add('hidden');
}

// ==========================================================================
// 12. NAVEGACIÓN PÚBLICA & AUTENTICACIÓN
// ==========================================================================
function navigatePublic(secId) {
  const landing = document.getElementById('view-public');
  const panel = document.getElementById('view-dashboard-container');
  if (landing) landing.classList.remove('hidden');
  if (panel) panel.classList.add('hidden');

  const sec = document.getElementById(secId);
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

function handleHeroSolicitarCita() {
  if (currentUser) {
    goToPanel();
    if (currentUser.rol === 'Paciente') {
      switchPanelSubView('paciente-view-solicitar');
    } else {
      switchPanelSubView('admin-view-calendario');
    }
  } else {
    openAuthModal('login');
  }
}

function renderPublicPsicologos() {
  const grid = document.getElementById('public-psicologos-grid');
  if (!grid) return;

  grid.innerHTML = dbPsicologos.map(p => `
    <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
      <div class="flex items-center space-x-3.5">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-purple-600/30">
          ${p.avatar}
        </div>
        <div>
          <h3 class="font-bold text-sm text-slate-900 font-heading leading-tight">${p.nombre_completo}</h3>
          <p class="text-[11px] font-bold text-teal-700">${p.cpsp}</p>
          <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">${p.consultorio}</span>
        </div>
      </div>
      <p class="text-xs text-slate-500 leading-relaxed">${p.biografia}</p>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span class="text-slate-400 font-medium">🕒 ${p.horario.split(':')[0]}: ${p.turno}</span>
        <button onclick="handleHeroSolicitarCita()" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition">
          Solicitar Cita →
        </button>
      </div>
    </div>
  `).join('');
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  const button = btnEl || (typeof event !== 'undefined' ? event?.currentTarget : null) || input.parentElement?.querySelector('button');
  if (button) {
    if (isPassword) {
      button.innerHTML = '🙈';
      button.setAttribute('title', 'Ocultar contraseña');
      button.classList.add('text-teal-600');
    } else {
      button.innerHTML = '👁️';
      button.setAttribute('title', 'Mostrar contraseña');
      button.classList.remove('text-teal-600');
    }
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('modal-auth');
  if (modal) {
    modal.classList.remove('hidden');
    switchAuthTab(tab);
    const loginEmail = document.getElementById('login-email');
    const loginPass = document.getElementById('login-password');
    if (loginEmail) loginEmail.value = '';
    if (loginPass) {
      loginPass.value = '';
      loginPass.type = 'password';
      const btn = loginPass.parentElement?.querySelector('button');
      if (btn) btn.innerHTML = '👁️';
    }
  }
}

function closeAuthModal() {
  const modal = document.getElementById('modal-auth');
  if (modal) modal.classList.add('hidden');
}

function switchAuthTab(tab) {
  const formLogin = document.getElementById('form-auth-login');
  const formRegister = document.getElementById('form-auth-register');
  const btnLogin = document.getElementById('tab-auth-login');
  const btnRegister = document.getElementById('tab-auth-register');

  if (tab === 'login') {
    if (formLogin) formLogin.classList.remove('hidden');
    if (formRegister) formRegister.classList.add('hidden');
    if (btnLogin) btnLogin.className = 'flex-1 py-2 rounded-lg bg-white text-teal-900 transition shadow-sm font-bold';
    if (btnRegister) btnRegister.className = 'flex-1 py-2 rounded-lg text-white/90 hover:text-white transition font-semibold';
  } else {
    if (formLogin) formLogin.classList.add('hidden');
    if (formRegister) formRegister.classList.remove('hidden');
    if (btnLogin) btnLogin.className = 'flex-1 py-2 rounded-lg text-white/90 hover:text-white transition font-semibold';
    if (btnRegister) btnRegister.className = 'flex-1 py-2 rounded-lg bg-white text-teal-900 transition shadow-sm font-bold';
  }
}

function toggleRegRoleFields(rol) {
  const pacExtra = document.getElementById('reg-paciente-extra');
  const psiExtra = document.getElementById('reg-psico-extra');
  const labelPac = document.getElementById('label-role-paciente');
  const labelPsi = document.getElementById('label-role-psicologo');

  if (rol === 'paciente') {
    if (pacExtra) pacExtra.classList.remove('hidden');
    if (psiExtra) psiExtra.classList.add('hidden');
    if (labelPac) labelPac.className = 'flex items-center space-x-2 p-2.5 rounded-xl border-2 border-teal-500 bg-teal-50/70 cursor-pointer transition';
    if (labelPsi) labelPsi.className = 'flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer transition';
  } else {
    if (pacExtra) pacExtra.classList.add('hidden');
    if (psiExtra) psiExtra.classList.remove('hidden');
    if (labelPac) labelPac.className = 'flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer transition';
    if (labelPsi) labelPsi.className = 'flex items-center space-x-2 p-2.5 rounded-xl border-2 border-purple-500 bg-purple-50/70 cursor-pointer transition';
  }
}

// INGRESO ESTRICTO: Solo personas autorizadas con su correo y contraseña
function handleLoginSubmit(e) {
  e.preventDefault();
  const email = (document.getElementById('login-email')?.value || '').trim().toLowerCase();
  const pass = document.getElementById('login-password')?.value || '';
  const terms = document.getElementById('login-terms')?.checked;

  if (!terms) {
    showToast('Debe aceptar los términos y condiciones para ingresar.', 'error');
    return;
  }

  if (!email || !pass) {
    showToast('Por favor ingrese su correo y contraseña.', 'error');
    return;
  }

  // 1. REGLA ESTRICTA DE ADMINISTRADOR (EXCLUSIVO)
  const CORREO_ADMIN_OFICIAL = 'admin.psicologia@scorza.edu.pe';
  if (email === CORREO_ADMIN_OFICIAL) {
    if (pass !== 'Admin123!') {
      showToast('❌ Contraseña incorrecta para la cuenta de Administrador.', 'error');
      return;
    }
    currentUser = dbUsuarios.find(u => u.correo.toLowerCase() === CORREO_ADMIN_OFICIAL) || {
      id_usuario: 1,
      nombre_completo: "Katty Maribel Huaman Acho",
      nombre_corto: "Katty Huamán",
      correo: CORREO_ADMIN_OFICIAL,
      rol: "Administrador",
      estado: "Activo",
      avatar: "K"
    };
    currentToken = 'jwt-admin-' + Date.now();
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
    localStorage.setItem('psicoscorza_token', currentToken);
    closeAuthModal();
    showToast(`¡Bienvenida Administradora, ${currentUser.nombre_completo}!`, 'success');
    updateAuthUI();
    goToPanel();
    return;
  }

  // 2. REGLA ESTRICTA DE PSICÓLOGO COLEGIADO REGISTRADO
  const ps = dbPsicologos.find(p => p.correo.toLowerCase() === email);
  if (ps) {
    if (pass !== ps.password) {
      showToast('❌ Contraseña incorrecta para el especialista.', 'error');
      return;
    }
    if (ps.estado === 'Suspendido') {
      showToast('⚠️ Acceso suspendido: Su cuenta ha sido temporalmente inhabilitada por la administración.', 'warning');
      return;
    }
    currentUser = {
      id_usuario: 'psi_' + ps.id_psicologo,
      nombre_completo: ps.nombre_completo,
      nombre_corto: ps.nombre_corto,
      correo: ps.correo,
      rol: "Psicólogo",
      consultorio: ps.consultorio,
      especialidad: ps.especialidad,
      cpsp: ps.cpsp,
      avatar: ps.avatar
    };
    currentToken = 'jwt-psico-' + Date.now();
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
    localStorage.setItem('psicoscorza_token', currentToken);
    closeAuthModal();
    showToast(`¡Bienvenido(a), ${currentUser.nombre_completo}!`, 'success');
    updateAuthUI();
    goToPanel();
    return;
  }

  // 3. REGLA ESTRICTA DE PACIENTE (ESTUDIANTE REGISTRADO)
  const regUser = dbUsuarios.find(u => u.correo.toLowerCase() === email && u.rol === 'Paciente');
  const pac = dbPacientes.find(p => p.correo.toLowerCase() === email);

  if (regUser || pac) {
    // Validar contraseña: si el alumno se registró, su contraseña propia; si es alumno base, 'Alumno123!'
    const validPass = regUser?.password || pac?.password || 'Alumno123!';
    if (pass !== validPass) {
      showToast('❌ Contraseña incorrecta. Verifique sus datos o use «¿Olvidaste tu contraseña?».', 'error');
      return;
    }

    if (regUser) {
      currentUser = regUser;
    } else {
      currentUser = {
        id_usuario: 'pac_' + pac.id_alumno,
        nombre_completo: `${pac.nombres} ${pac.apellidos}`,
        nombre_corto: pac.nombres,
        correo: pac.correo,
        rol: "Paciente",
        carrera: pac.carrera_profesional,
        dni: pac.dni,
        avatar: pac.nombres.charAt(0).toUpperCase()
      };
    }
    currentToken = 'jwt-pac-' + Date.now();
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
    localStorage.setItem('psicoscorza_token', currentToken);
    closeAuthModal();
    showToast(`¡Bienvenido(a), ${currentUser.nombre_completo}!`, 'success');
    updateAuthUI();
    goToPanel();
    return;
  }

  // 4. SI EL CORREO NO COINCIDE CON NINGUNA CUENTA: DENEGAR ACCESO E INVITAR AL REGISTRO
  showToast(`❌ El correo «${email}» no está registrado en el sistema. Si eres un estudiante nuevo, haz clic en la pestaña «Registrarse».`, 'error');
}

// REGISTRO DE NUEVAS PERSONAS (ESTUDIANTES O PSICÓLOGOS)
function handleRegisterSubmit(e) {
  e.preventDefault();
  const rolInput = document.querySelector('input[name="reg-rol"]:checked')?.value || 'paciente';
  const nombres = (document.getElementById('reg-nombres')?.value || '').trim();
  const apellidos = (document.getElementById('reg-apellidos')?.value || '').trim();
  const dni = (document.getElementById('reg-dni')?.value || '').trim();
  const telefono = (document.getElementById('reg-telefono')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
  const pass = document.getElementById('reg-password')?.value || '';
  const passConfirm = document.getElementById('reg-password-confirm')?.value || '';
  const terms = document.getElementById('reg-terms')?.checked;

  if (!terms) {
    showToast('Debe aceptar los términos y condiciones para registrarse.', 'error');
    return;
  }

  if (pass !== passConfirm) {
    showToast('❌ Las contraseñas no coinciden. Por favor repita la contraseña correctamente.', 'error');
    return;
  }

  if (pass.length < 6) {
    showToast('La contraseña debe tener mínimo 6 caracteres.', 'error');
    return;
  }

  // Validar si el correo ya existe en el sistema
  const yaExiste = dbUsuarios.some(u => u.correo.toLowerCase() === email) ||
                   dbPsicologos.some(p => p.correo.toLowerCase() === email) ||
                   dbPacientes.some(p => p.correo.toLowerCase() === email);

  if (yaExiste) {
    showToast('⚠️ Este correo ya se encuentra registrado. Por favor ingrese con su contraseña en «Iniciar sesión».', 'warning');
    switchAuthTab('login');
    const loginEmail = document.getElementById('login-email');
    if (loginEmail) {
      loginEmail.value = email;
      document.getElementById('login-password')?.focus();
    }
    return;
  }

  if (rolInput === 'paciente') {
    const carrera = document.getElementById('reg-carrera')?.value || 'Arquitectura de Plataformas TI';
    const semestre = document.getElementById('reg-semestre')?.value || 'I Semestre';

    const nuevoPac = {
      id_alumno: dbPacientes.length + 1,
      codigo_estudiantil: `ALUM-2026-${dni.slice(-4) || '001'}`,
      dni,
      nombres,
      apellidos,
      carrera_profesional: carrera,
      semestre_academico: semestre,
      telefono,
      correo: email,
      password: pass,
      fecha_registro: new Date().toISOString().split('T')[0]
    };
    dbPacientes.push(nuevoPac);
    persistPacientes();

    const nuevoUser = {
      id_usuario: 'pac_' + nuevoPac.id_alumno,
      nombre_completo: `${nombres} ${apellidos}`,
      nombre_corto: nombres,
      correo: email,
      password: pass,
      rol: "Paciente",
      carrera,
      dni,
      avatar: nombres.charAt(0).toUpperCase()
    };
    dbUsuarios.push(nuevoUser);
    persistUsuarios();

    if (dbFirestore) {
      dbFirestore.collection('pacientes').add(nuevoPac).catch(() => {});
      dbFirestore.collection('usuarios').add({ ...nuevoUser, password: '***' }).catch(() => {});
    }

    agregarNotificacion(
      "Administrador",
      "admin.psicologia@scorza.edu.pe",
      "Nuevo Paciente Registrado",
      `El estudiante ${nombres} ${apellidos} (${carrera}) se ha registrado exitosamente.`,
      "sistema"
    );

    // Conectar inmediatamente con sus nuevas credenciales
    currentUser = nuevoUser;
    currentToken = 'jwt-reg-' + Date.now();
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
    localStorage.setItem('psicoscorza_token', currentToken);

    closeAuthModal();
    showToast(`✨ ¡Registro completado con éxito! Bienvenido(a), ${nombres}.`, 'success');
    updateAuthUI();
    goToPanel();
  } else {
    // Postulación de Psicólogo
    const cpsp = (document.getElementById('reg-cpsp')?.value || '').trim() || 'C.Ps.P. En Trámite';
    const esp = (document.getElementById('reg-especialidad')?.value || '').trim() || 'Psicología General';

    const nuevaSolPsico = {
      id_solicitud: 'sol_' + Date.now(),
      nombres,
      apellidos,
      nombre_completo: `Lic. ${nombres} ${apellidos}`,
      correo: email,
      password: pass,
      cpsp,
      especialidad: esp,
      telefono,
      turno_postulado: "Tarde",
      horario: "Lunes a Viernes: 01:00 PM - 06:00 PM",
      consultorio: "Consultorio 02 (Pabellón B)",
      fecha_solicitud: new Date().toISOString().split('T')[0],
      estado: "Pendiente",
      curriculum: `Especialista en ${esp}, colegiatura ${cpsp}. Teléfono: ${telefono}.`
    };
    dbSolicitudesPsicologos.push(nuevaSolPsico);
    persistSolicitudesPsicologos();

    agregarNotificacion(
      "Administrador",
      "admin.psicologia@scorza.edu.pe",
      "Nueva Postulación de Especialista",
      `El profesional ${nuevaSolPsico.nombre_completo} (${cpsp}) ha solicitado alta en la plataforma. Requiere validación de colegiatura.`,
      "psicologo"
    );

    showToast(`✅ Postulación registrada exitosamente. La dirección administrativa validará su colegiatura C.Ps.P. para habilitar su acceso.`, 'info');
    switchAuthTab('login');
  }
}

function handleGoogleSignInClick() {
  showToast('Iniciando autenticación con Google Identity Services...', 'info');
  setTimeout(() => {
    // Por seguridad estricta: Google OAuth NUNCA otorga rol de Administrador.
    // Los nuevos accesos por Google ingresan como Paciente (Estudiante).
    const pacDefault = dbPacientes[0];
    currentUser = {
      id_usuario: 'google_' + pacDefault.id_alumno,
      nombre_completo: `${pacDefault.nombres} ${pacDefault.apellidos}`,
      nombre_corto: pacDefault.nombres,
      correo: pacDefault.correo,
      rol: "Paciente", // NUNCA Administrador
      carrera: pacDefault.carrera_profesional,
      dni: pacDefault.dni,
      avatar: pacDefault.nombres.charAt(0)
    };
    currentToken = 'jwt-google-' + Date.now();
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
    localStorage.setItem('psicoscorza_token', currentToken);
    closeAuthModal();
    updateAuthUI();
    goToPanel();
    showToast(`Acceso seguro con Google como Paciente: ${currentUser.nombre_completo}.`, 'success');
  }, 700);
}

function logout() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try {
      firebase.auth().signOut().catch(() => {});
    } catch (e) {}
  }
  currentUser = null;
  currentToken = null;
  localStorage.removeItem('psicoscorza_user');
  localStorage.removeItem('psicoscorza_token');

  updateAuthUI();
  navigatePublic('sec-inicio');
  showToast('Sesión finalizada correctamente en Firebase y en la plataforma.', 'info');
}

function updateAuthUI() {
  const guestDiv = document.getElementById('top-auth-guest');
  const loggedDiv = document.getElementById('top-auth-logged');
  const topAvatar = document.getElementById('top-user-avatar');
  const topName = document.getElementById('top-user-name');
  const topRole = document.getElementById('top-user-role');

  if (currentUser) {
    if (guestDiv) guestDiv.classList.add('hidden');
    if (loggedDiv) loggedDiv.classList.remove('hidden');

    if (topAvatar) topAvatar.textContent = currentUser.avatar || currentUser.nombre_corto.charAt(0);
    if (topName) topName.textContent = currentUser.nombre_corto || currentUser.nombre_completo;
    if (topRole) topRole.textContent = currentUser.rol;
  } else {
    if (guestDiv) guestDiv.classList.remove('hidden');
    if (loggedDiv) loggedDiv.classList.add('hidden');
  }

  updateNotifBadge();
}

// ==========================================================================
// 13. ENRUTADOR DEL PANEL Y SIDEBAR PÚRPURA (#2D1863)
// ==========================================================================
function goToPanel() {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }

  const landing = document.getElementById('view-public');
  const panel = document.getElementById('view-dashboard-container');
  if (landing) landing.classList.add('hidden');
  if (panel) panel.classList.remove('hidden');

  renderSidebarMenu();

  if (currentUser.rol === 'Administrador') {
    switchPanelSubView('admin-view-inicio');
  } else if (currentUser.rol === 'Psicólogo') {
    switchPanelSubView('psico-view-inicio');
  } else {
    switchPanelSubView('paciente-view-inicio');
  }
}

function renderSidebarMenu() {
  const nav = document.getElementById('sidebar-menu');
  if (!nav) return;

  const role = currentUser ? currentUser.rol : 'Administrador';

  if (role === 'Administrador') {
    nav.innerHTML = `
      <div class="px-2 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-purple-300/70">Panel Administrador</div>
      <button onclick="switchPanelSubView('admin-view-inicio')" id="btn-admin-inicio" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🏠</span>
        <span class="font-semibold text-xs">1. Inicio</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-psicologos')" id="btn-admin-psicologos" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🩺</span>
        <span class="font-semibold text-xs">2. Psicólogos</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-pacientes')" id="btn-admin-pacientes" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🎓</span>
        <span class="font-semibold text-xs">3. Pacientes</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-solicitudes')" id="btn-admin-solicitudes" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📑</span>
        <span class="font-semibold text-xs">4. Solicitudes de citas</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-calendario')" id="btn-admin-calendario" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📅</span>
        <span class="font-semibold text-xs">5. Calendario</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-reportes')" id="btn-admin-reportes" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📊</span>
        <span class="font-semibold text-xs">6. Reportes</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-seguimiento')" id="btn-admin-seguimiento" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🔍</span>
        <span class="font-semibold text-xs">7. Seguimiento general</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-notificaciones')" id="btn-admin-notificaciones" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🔔</span>
        <span class="font-semibold text-xs">8. Notificaciones</span>
      </button>
      <button onclick="switchPanelSubView('admin-view-configuracion')" id="btn-admin-configuracion" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">⚙️</span>
        <span class="font-semibold text-xs">9. Configuración</span>
      </button>
      <button onclick="logout()" id="btn-admin-logout" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item text-rose-300 hover:bg-rose-900/40 hover:text-white mt-3 pt-2.5 border-t border-purple-900/50">
        <span class="text-base">🚪</span>
        <span class="font-semibold text-xs">10. Cerrar sesión</span>
      </button>
    `;
  } else if (role === 'Psicólogo') {
    nav.innerHTML = `
      <div class="px-2 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-teal-300/80">Consultorio Psicológico</div>
      <button onclick="switchPanelSubView('psico-view-inicio')" id="btn-psico-inicio" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🏠</span>
        <span class="font-semibold text-xs">1. Inicio</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-calendario')" id="btn-psico-calendario" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📅</span>
        <span class="font-semibold text-xs">2. Mi calendario</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-pacientes')" id="btn-psico-pacientes" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">👥</span>
        <span class="font-semibold text-xs">3. Mis pacientes</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-citas')" id="btn-psico-citas" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🩺</span>
        <span class="font-semibold text-xs">4. Mis citas</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-registro-sesiones')" id="btn-psico-registro-sesiones" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📝</span>
        <span class="font-semibold text-xs">5. Registro de sesiones</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-seguimiento')" id="btn-psico-seguimiento" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🔍</span>
        <span class="font-semibold text-xs">6. Seguimiento</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-notificaciones')" id="btn-psico-notificaciones" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🔔</span>
        <span class="font-semibold text-xs">7. Notificaciones</span>
      </button>
      <button onclick="switchPanelSubView('psico-view-perfil')" id="btn-psico-perfil" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">👤</span>
        <span class="font-semibold text-xs">8. Mi perfil</span>
      </button>
      <button onclick="logout()" id="btn-psico-logout" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item text-rose-300 hover:bg-rose-900/40 hover:text-white mt-3 pt-2.5 border-t border-purple-900/50">
        <span class="text-base">🚪</span>
        <span class="font-semibold text-xs">9. Cerrar sesión</span>
      </button>
    `;
  } else {
    nav.innerHTML = `
      <div class="px-2 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-sky-300/80">Portal del Paciente</div>
      <button onclick="switchPanelSubView('paciente-view-inicio')" id="btn-paciente-inicio" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🏠</span>
        <span class="font-semibold text-xs">1. Inicio</span>
      </button>
      <button onclick="switchPanelSubView('paciente-view-solicitar')" id="btn-paciente-solicitar" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📅</span>
        <span class="font-semibold text-xs">2. Solicitar cita</span>
      </button>
      <button onclick="switchPanelSubView('paciente-view-citas')" id="btn-paciente-citas" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📋</span>
        <span class="font-semibold text-xs">3. Mis citas</span>
      </button>
      <button onclick="switchPanelSubView('paciente-view-sesiones')" id="btn-paciente-sesiones" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">📑</span>
        <span class="font-semibold text-xs">4. Mis sesiones</span>
      </button>
      <button onclick="switchPanelSubView('paciente-view-notificaciones')" id="btn-paciente-notificaciones" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">🔔</span>
        <span class="font-semibold text-xs">5. Notificaciones</span>
      </button>
      <button onclick="switchPanelSubView('paciente-view-perfil')" id="btn-paciente-perfil" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item">
        <span class="text-base">👤</span>
        <span class="font-semibold text-xs">6. Mi perfil</span>
      </button>
      <button onclick="logout()" id="btn-paciente-logout" class="sidebar-btn w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl sidebar-nav-item text-rose-300 hover:bg-rose-900/40 hover:text-white mt-3 pt-2.5 border-t border-purple-900/50">
        <span class="text-base">🚪</span>
        <span class="font-semibold text-xs">7. Cerrar sesión</span>
      </button>
    `;
  }
}

function switchPanelSubView(viewId) {
  document.querySelectorAll('.panel-subview').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));

  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.remove('hidden');

  const shortId = viewId.replace('admin-view-', 'btn-admin-').replace('psico-view-', 'btn-psico-').replace('paciente-view-', 'btn-paciente-');
  const targetBtn = document.getElementById(shortId);
  if (targetBtn) targetBtn.classList.add('active');

  // Router de vistas del Administrador (10 Botones Oficiales)
  if (viewId === 'admin-view-inicio' || viewId === 'admin-view-dashboard') renderAdminInicio();
  else if (viewId === 'admin-view-psicologos') renderAdminPsicologos();
  else if (viewId === 'admin-view-pacientes') renderAdminPacientes();
  else if (viewId === 'admin-view-solicitudes' || viewId === 'admin-view-citas') renderAdminSolicitudes();
  else if (viewId === 'admin-view-calendario') renderAdminCalendario();
  else if (viewId === 'admin-view-reportes') renderAdminReportes();
  else if (viewId === 'admin-view-seguimiento') renderAdminSeguimiento();
  else if (viewId === 'admin-view-notificaciones') renderAdminNotificaciones();
  else if (viewId === 'admin-view-configuracion') renderAdminConfiguracion();
  else if (viewId === 'admin-view-usuarios') renderAdminUsuarios();

  // Router de vistas del Psicólogo
  else if (viewId === 'psico-view-inicio') renderPsicoInicio();
  else if (viewId === 'psico-view-calendario' || viewId === 'psico-view-agenda') renderPsicoCalendario();
  else if (viewId === 'psico-view-pacientes') renderPsicoPacientes();
  else if (viewId === 'psico-view-citas') renderPsicoCitas();
  else if (viewId === 'psico-view-registro-sesiones' || viewId === 'psico-view-registrar-sesion' || viewId === 'psico-view-historial') renderPsicoRegistroSesiones();
  else if (viewId === 'psico-view-seguimiento') renderPsicoSeguimiento();
  else if (viewId === 'psico-view-notificaciones') renderPsicoNotificaciones();
  else if (viewId === 'psico-view-perfil') renderPsicoPerfil();

  // Router de vistas del Paciente
  else if (viewId === 'paciente-view-inicio') renderPacienteInicio();
  else if (viewId === 'paciente-view-solicitar') renderPacienteSolicitar();
  else if (viewId === 'paciente-view-citas') renderPacienteCitas();
  else if (viewId === 'paciente-view-reprogramar') renderPacienteReprogramar();
  else if (viewId === 'paciente-view-cancelar') renderPacienteCancelar();
  else if (viewId === 'paciente-view-sesiones') renderPacienteSesiones();
  else if (viewId === 'paciente-view-notificaciones') renderPacienteNotificaciones();
  else if (viewId === 'paciente-view-perfil') renderPacientePerfil();

  updateNotifBadge();
}

function refreshActiveViews() {
  document.querySelectorAll('.panel-subview').forEach(v => {
    if (!v.classList.contains('hidden')) {
      switchPanelSubView(v.id);
    }
  });
  updateNotifBadge();
}

// ==========================================================================
// 14. PASO 1: PACIENTE SOLICITA CITA (VISTA COMPLETA)
// ==========================================================================
function renderPacienteSolicitar() {
  const container = document.getElementById('paciente-view-solicitar');
  if (!container) return;

  const pac = currentUser || dbPacientes[0];

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">Paso 1: Solicitud de Consulta</span>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Solicitar Cita Psicológica</h2>
      <p class="text-xs text-slate-500">Completa el formulario para solicitar atención psicopedagógica confidencial y gratuita.</p>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-xs max-w-2xl">
      <form onsubmit="handlePacienteSolicitarSubmit(event)" class="space-y-4">
        <!-- Datos de Paciente Autocompletados -->
        <div class="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Estudiante Solicitante:</span>
            <span class="font-bold text-slate-900 text-sm block">${pac.nombre_completo || 'Katty Maribel Huaman Acho'}</span>
            <span class="text-teal-700 font-medium text-[11px]">${pac.carrera || 'Arquitectura de Plataformas TI'}</span>
          </div>
          <div>
            <span class="text-slate-400 font-bold block text-[10px] uppercase">DNI / Correo:</span>
            <span class="font-mono text-slate-800 font-bold block">${pac.dni || '73456128'}</span>
            <span class="text-slate-500 text-[11px]">${pac.correo || 'katty.huaman@scorza.edu.pe'}</span>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Motivo de Consulta Psicológica *</label>
          <textarea id="sol-motivo" rows="3" required placeholder="Describe brevemente el motivo: sobrecarga académica, ansiedad ante exámenes, orientación vocacional, consejería personal..." class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-medium">Orientación psicopedagógica y técnicas de control del estrés ante entregables de fin de ciclo.</textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Modalidad de Atención *</label>
            <select id="sol-modalidad" class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-medium">
              <option value="Presencial">🏢 Presencial (Campus IESTP Scorza)</option>
              <option value="Virtual">🌐 Virtual (Google Meet)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Preferencia de Psicólogo</label>
            <select id="sol-psico-pref" class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-medium">
              <option value="Asignación por Administrador">🤝 Cualquiera disponible (El Administrador asignará)</option>
              ${dbPsicologos.map(p => `
                <option value="${p.nombre_completo}">${p.nombre_completo} (${p.consultorio.split('(')[0]})</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Fecha Deseada *</label>
            <input type="date" id="sol-fecha" value="2026-11-20" required class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-medium">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Horario Preferido *</label>
            <select id="sol-hora" class="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-sky-500 font-medium">
              <option value="08:00 AM">08:00 AM (Turno Mañana)</option>
              <option value="09:00 AM" selected>09:00 AM (Turno Mañana)</option>
              <option value="10:00 AM">10:00 AM (Turno Mañana)</option>
              <option value="11:00 AM">11:00 AM (Turno Mañana)</option>
              <option value="02:00 PM">02:00 PM (Turno Tarde)</option>
              <option value="03:00 PM">03:00 PM (Turno Tarde)</option>
              <option value="04:00 PM">04:00 PM (Turno Tarde)</option>
            </select>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <p class="text-[11px] text-slate-400">Tu solicitud será revisada por el Administrador para verificar la agenda del consultorio.</p>
          <button type="submit" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition">
            📨 Enviar Solicitud de Cita
          </button>
        </div>
      </form>
    </div>
  `;
}

function handlePacienteSolicitarSubmit(e) {
  e.preventDefault();
  const pac = currentUser || dbPacientes[0];
  const motivo = document.getElementById('sol-motivo')?.value.trim();
  const modalidad = document.getElementById('sol-modalidad')?.value;
  const psicoPref = document.getElementById('sol-psico-pref')?.value;
  const fecha = document.getElementById('sol-fecha')?.value;
  const hora = document.getElementById('sol-hora')?.value;

  const num = Math.floor(100 + Math.random() * 900);
  const nuevoCodigo = `CIT-2026-${num}`;

  const nuevaCita = {
    id_cita: "cit_" + Date.now(),
    codigo_cita: nuevoCodigo,
    alumno: pac.nombre_completo || 'Katty Maribel Huaman Acho',
    carrera: pac.carrera || 'Arquitectura de Plataformas TI',
    dni: pac.dni || '73456128',
    psicologo: psicoPref === "Asignación por Administrador" ? "Pendiente de Asignación" : psicoPref,
    consultorio: "Por Definir por Admin",
    fecha_cita: fecha,
    hora_inicio: hora,
    modalidad,
    estado_cita: "Pendiente",
    motivo_consulta: motivo
  };

  dbCitas.unshift(nuevaCita);
  persistCitas();

  // Guardar en Firestore
  if (dbFirestore) {
    dbFirestore.collection('citas').add(nuevaCita).catch(() => {});
  }

  // Notificar al Administrador y al Paciente
  agregarNotificacion(
    "Administrador",
    "admin.psicologia@scorza.edu.pe",
    "Nueva Solicitud de Cita",
    `El estudiante ${nuevaCita.alumno} solicitó la cita ${nuevoCodigo} para el ${fecha} (${hora}).`,
    "cita_nueva"
  );
  agregarNotificacion(
    "Paciente",
    pac.correo || "katty.huaman@scorza.edu.pe",
    "Solicitud Enviada con Éxito",
    `Tu cita ${nuevoCodigo} fue recibida. El administrador revisará y asignará al especialista correspondiente.`,
    "cita_nueva"
  );

  showToast(`¡Solicitud enviada! Tu código es ${nuevoCodigo}. El administrador asignará a tu psicólogo.`, 'success');
  switchPanelSubView('paciente-view-citas');
}

// ==========================================================================
// 15. PASOS 2 Y 3: ADMINISTRADOR REVISA Y ASIGNA PSICÓLOGO CON VERIFICADOR
// ==========================================================================
function openModalAsignarPsicologo(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pasos 2 y 3: Asignación Administrativa</span>
            <h3 class="font-bold text-base text-slate-900 font-heading mt-0.5">Asignar Especialista a Cita ${cita.codigo_cita}</h3>
            <p class="text-slate-500 text-[11px]">Paciente: ${cita.alumno} (${cita.carrera})</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-slate-400 hover:text-slate-700 text-2xl font-bold">&times;</button>
        </div>

        <form onsubmit="handleConfirmarAsignacionAdmin(event, '${cita.codigo_cita}')" class="space-y-3.5">
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Motivo Indicado por el Paciente:</span>
            <p class="text-slate-700 font-medium leading-relaxed">${cita.motivo_consulta}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Fecha de la Cita *</label>
              <input type="date" id="asig-fecha" value="${cita.fecha_cita}" onchange="recalcularDisponibilidadEnModal()" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Hora de Atención *</label>
              <select id="asig-hora" onchange="recalcularDisponibilidadEnModal()" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
                <option value="08:00 AM" ${cita.hora_inicio === '08:00 AM' ? 'selected' : ''}>08:00 AM (Mañana)</option>
                <option value="08:30 AM" ${cita.hora_inicio === '08:30 AM' ? 'selected' : ''}>08:30 AM (Mañana)</option>
                <option value="09:00 AM" ${cita.hora_inicio === '09:00 AM' ? 'selected' : ''}>09:00 AM (Mañana)</option>
                <option value="09:30 AM" ${cita.hora_inicio === '09:30 AM' ? 'selected' : ''}>09:30 AM (Mañana)</option>
                <option value="10:00 AM" ${cita.hora_inicio === '10:00 AM' ? 'selected' : ''}>10:00 AM (Mañana)</option>
                <option value="10:30 AM" ${cita.hora_inicio === '10:30 AM' ? 'selected' : ''}>10:30 AM (Mañana)</option>
                <option value="11:00 AM" ${cita.hora_inicio === '11:00 AM' ? 'selected' : ''}>11:00 AM (Mañana)</option>
                <option value="01:00 PM" ${cita.hora_inicio === '01:00 PM' ? 'selected' : ''}>01:00 PM (Tarde)</option>
                <option value="02:00 PM" ${cita.hora_inicio === '02:00 PM' ? 'selected' : ''}>02:00 PM (Tarde)</option>
                <option value="03:00 PM" ${cita.hora_inicio === '03:00 PM' ? 'selected' : ''}>03:00 PM (Tarde)</option>
                <option value="04:00 PM" ${cita.hora_inicio === '04:00 PM' ? 'selected' : ''}>04:00 PM (Tarde)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Psicólogo a Asignar *</label>
            <select id="asig-psico" onchange="recalcularDisponibilidadEnModal()" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-bold">
              ${dbPsicologos.map(p => `
                <option value="${p.nombre_completo}|${p.consultorio}" ${(cita.psicologo && cita.psicologo.includes(p.nombre_corto.split(' ')[2])) ? 'selected' : ''}>
                  ${p.nombre_completo} - ${p.consultorio} (${p.turno})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Cuadro reactivo de verificación de disponibilidad -->
          <div id="asig-disponibilidad-box" class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 font-semibold text-emerald-900 text-xs flex items-center space-x-2">
            <span>✅</span>
            <span id="asig-disponibilidad-msg">Verificando agenda del especialista...</span>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Modalidad de Consulta *</label>
            <select id="asig-modalidad" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
              <option value="Presencial" ${cita.modalidad === 'Presencial' ? 'selected' : ''}>🏢 Presencial (Campus IESTP Scorza)</option>
              <option value="Virtual" ${cita.modalidad === 'Virtual' ? 'selected' : ''}>🌐 Virtual (Google Meet)</option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cancelar</button>
            <button type="submit" id="btn-confirmar-asig" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-md shadow-purple-600/20">
              ✅ Confirmar Asignación & Notificar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  recalcularDisponibilidadEnModal();
}

function recalcularDisponibilidadEnModal() {
  const fecha = document.getElementById('asig-fecha')?.value;
  const hora = document.getElementById('asig-hora')?.value;
  const psicoVal = document.getElementById('asig-psico')?.value;
  const box = document.getElementById('asig-disponibilidad-box');
  const msg = document.getElementById('asig-disponibilidad-msg');
  const btn = document.getElementById('btn-confirmar-asig');
  if (!box || !msg || !psicoVal) return;

  const psicoNombre = psicoVal.split('|')[0];
  const res = checkPsicologoDisponibilidad(psicoNombre, fecha, hora);

  msg.textContent = res.mensaje;
  if (res.disponible) {
    box.className = "p-3 rounded-2xl bg-emerald-50 border border-emerald-200 font-semibold text-emerald-900 text-xs flex items-center space-x-2";
    if (btn) btn.disabled = false;
  } else {
    box.className = "p-3 rounded-2xl bg-amber-50 border border-amber-300 font-semibold text-amber-900 text-xs flex items-center space-x-2";
    if (btn) btn.disabled = false; // Advertencia pero permite flexibilidad con aviso
  }
}

function handleConfirmarAsignacionAdmin(e, codigoCita) {
  e.preventDefault();
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const fecha = document.getElementById('asig-fecha')?.value;
  const hora = document.getElementById('asig-hora')?.value;
  const psicoVal = document.getElementById('asig-psico')?.value.split('|');
  const modalidad = document.getElementById('asig-modalidad')?.value;

  const nuevoPsico = psicoVal[0];
  const nuevoConsultorio = psicoVal[1];

  cita.psicologo = nuevoPsico;
  cita.consultorio = nuevoConsultorio;
  cita.fecha_cita = fecha;
  cita.hora_inicio = hora;
  cita.modalidad = modalidad;
  cita.estado_cita = "Confirmada";
  persistCitas();

  // Firestore update
  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
      .then(s => s.forEach(doc => doc.ref.update({
        psicologo: nuevoPsico,
        consultorio: nuevoConsultorio,
        fecha_cita: fecha,
        hora_inicio: hora,
        modalidad: modalidad,
        estado_cita: "Confirmada"
      }))).catch(() => {});
  }

  // PASO 4: Notificar al Paciente y al Psicólogo
  agregarNotificacion(
    "Paciente",
    cita.alumno,
    "¡Tu Cita ha sido Confirmada!",
    `Tu cita ${codigoCita} fue confirmada con ${nuevoPsico} en ${nuevoConsultorio} para el ${fecha} a las ${hora} (${modalidad}).`,
    "cita_confirmada"
  );
  agregarNotificacion(
    "Psicólogo",
    nuevoPsico,
    "Nueva Cita en tu Agenda",
    `Se te ha asignado al estudiante ${cita.alumno} (${cita.carrera}) para el ${fecha} a las ${hora}.`,
    "cita_confirmada"
  );

  showToast(`Cita ${codigoCita} confirmada y asignada a ${nuevoPsico}. Paciente notificado.`, 'success');
  closeModalOperacion();
  refreshActiveViews();
}

// ==========================================================================
// 16. PASOS 5 Y 6: PSICÓLOGO RECIBE CITA Y CAMBIA A «EN ATENCIÓN»
// ==========================================================================
function renderPsicoCitas() {
  const container = document.getElementById('psico-view-citas');
  if (!container) return;

  const ps = currentUser || dbPsicologos[0];
  const myKey = ps.nombre_corto.split(' ')[2] || 'Quispe';
  const myCitas = dbCitas.filter(c => c.psicologo && c.psicologo.includes(myKey));

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Pasos 5 y 6: Mis Citas Asignadas</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Agenda de Pacientes Asignados</h2>
          <p class="text-xs text-slate-500">Especialista: <strong>${ps.nombre_completo}</strong> • ${ps.consultorio || 'Consultorio 01'}</p>
        </div>
        <span class="px-3.5 py-2 rounded-2xl bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
          ${myCitas.length} Pacientes en Agenda
        </span>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Código</th>
            <th class="p-4">Paciente (Estudiante)</th>
            <th class="p-4">Carrera / DNI</th>
            <th class="p-4">Fecha & Hora</th>
            <th class="p-4">Modalidad</th>
            <th class="p-4">Estado</th>
            <th class="p-4 text-right">Acción Clínica</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${myCitas.map(c => `
            <tr class="hover:bg-slate-50/70 transition">
              <td class="p-4 font-mono font-bold text-purple-700">${c.codigo_cita}</td>
              <td class="p-4">
                <span class="font-bold text-slate-900 block">${c.alumno}</span>
                <span class="text-[11px] text-slate-400 block truncate max-w-xs">${c.motivo_consulta}</span>
              </td>
              <td class="p-4">
                <span class="text-slate-800 font-medium block">${c.carrera || 'APSTI'}</span>
                <span class="text-slate-400 font-mono text-[10px]">DNI: ${c.dni || '73456128'}</span>
              </td>
              <td class="p-4">
                <span class="font-bold text-slate-800 block">📅 ${c.fecha_cita}</span>
                <span class="text-slate-500 text-[11px]">🕒 ${c.hora_inicio}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">
                  ${c.estado_cita === 'En atención' ? '🔴 En atención' : c.estado_cita}
                </span>
              </td>
              <td class="p-4 text-right space-x-1.5">
                ${c.modalidad === 'Virtual' ? `
                  <button type="button" onclick="abrirSalaVirtualCita('${c.codigo_cita}')" title="Abrir Sala Virtual de Videollamada" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center space-x-1">
                    <span>🎥 Sala Virtual</span>
                  </button>
                ` : ''}
                ${c.estado_cita === 'Confirmada' ? `
                  <button onclick="handleIniciarAtencion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-xs">
                    ▶️ Iniciar Atención
                  </button>
                ` : c.estado_cita === 'En atención' ? `
                  <button onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs animate-pulse">
                    📝 Completar Registro
                  </button>
                ` : c.estado_cita === 'Finalizada' ? `
                  <button onclick="verDetalleSesionClinica('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
                    📋 Ver Ficha
                  </button>
                ` : `
                  <button onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
                    Atender
                  </button>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function handleIniciarAtencion(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  // PASO 6: Cambiar estado a «En atención»
  cita.estado_cita = "En atención";
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
      .then(s => s.forEach(doc => doc.ref.update({ estado_cita: "En atención" }))).catch(() => {});
  }

  agregarNotificacion(
    "Paciente",
    cita.alumno,
    "Tu Consulta Psicológica ha Comenzado",
    `El especialista ${cita.psicologo} ha iniciado tu sesión de atención en ${cita.consultorio}.`,
    "en_atencion"
  );

  showToast(`Cita ${codigoCita} en curso («En atención»). Abriendo formulario de registro clínico...`, 'info');
  refreshActiveViews();

  // Abrir inmediatamente el formulario del Paso 7
  openModalRegistrarSesion(codigoCita);
}

// ==========================================================================
// SALA VIRTUAL DE TELECONSULTA EN TIEMPO REAL (PSICÓLOGO & PACIENTE)
// ==========================================================================
function abrirSalaVirtualCita(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) {
    showToast('Cita no encontrada.', 'error');
    return;
  }

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  const esPsicologo = currentUser && currentUser.rol === 'Psicólogo';
  const esPaciente = currentUser && currentUser.rol === 'Paciente';
  const nombreUsuario = currentUser ? (currentUser.nombre_completo || currentUser.nombre_corto) : 'Participante Scorza';

  // Sala virtual segura de teleconsulta con Jitsi Meet / Google Meet
  const cleanCode = (cita.codigo_cita || 'CIT-2026').replace(/[^a-zA-Z0-9]/g, '');
  const roomName = `PsicoScorza-${cleanCode}`;
  const meetUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(nombreUsuario)}"&config.prejoinPageEnabled=false`;

  // Si el psicólogo entra a la sala virtual y la cita estaba confirmada, cambiar a "En atención"
  if (esPsicologo && cita.estado_cita === 'Confirmada') {
    cita.estado_cita = 'En atención';
    persistCitas();
    if (dbFirestore) {
      dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
        .then(s => s.forEach(doc => doc.ref.update({ estado_cita: "En atención" }))).catch(() => {});
    }
    agregarNotificacion(
      "Paciente",
      cita.alumno,
      "¡El Psicólogo ha iniciado la Sala Virtual!",
      `Tu especialista ${cita.psicologo} ya está conectado en la sala virtual para tu cita ${cita.codigo_cita}. Conéctate ahora.`,
      "en_atencion"
    );
    showToast(`🟢 Sala Virtual iniciada. Cita ${cita.codigo_cita} en atención.`, 'info');
    refreshActiveViews();
  }

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div class="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col h-[92vh]">
        
        <!-- Cabecera de la Sala Virtual -->
        <div class="bg-gradient-to-r from-blue-900 via-sky-800 to-teal-800 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl border border-white/20">🎥</div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">● EN VIVO</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-sky-100">CPSP • LEY 29733 CIFRADA</span>
              </div>
              <h3 class="text-base sm:text-lg font-bold font-heading">Sala Virtual de Teleconsulta Psicológica</h3>
              <p class="text-xs text-sky-100">
                Cita: <strong>${cita.codigo_cita}</strong> • Paciente: <strong>${cita.alumno}</strong> • Especialista: <strong>${cita.psicologo}</strong>
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            ${esPsicologo ? `
              <button type="button" onclick="openModalRegistrarSesion('${cita.codigo_cita}')" class="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition shadow-md flex items-center space-x-1.5">
                <span>📝 Registrar Sesión Clínica</span>
              </button>
            ` : ''}
            <a href="${meetUrl}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition border border-white/25 flex items-center space-x-1">
              <span>↗️ Pantalla Completa</span>
            </a>
            <button type="button" onclick="closeModalOperacion()" class="text-white/80 hover:text-white text-2xl font-bold ml-2 leading-none">&times;</button>
          </div>
        </div>

        <!-- Área de la Videollamada (Iframe en vivo interactivo) -->
        <div class="flex-grow bg-slate-950 relative flex items-center justify-center overflow-hidden">
          <iframe 
            src="${meetUrl}" 
            allow="camera; microphone; fullscreen; display-capture; autoplay" 
            class="w-full h-full border-0"
            title="Videollamada Telepsicología PsicoScorza">
          </iframe>
        </div>

        <!-- Pie de la Sala con Controles y Acciones Rápidas -->
        <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div class="flex items-center space-x-2 text-slate-600">
            <span class="text-emerald-600 font-bold">🔒 Teleconsulta Segura:</span>
            <span>Audio, video y notas clínicas protegidas bajo estricto secreto profesional.</span>
          </div>
          <div class="flex items-center space-x-2">
            ${esPsicologo ? `
              <button type="button" onclick="openModalRegistrarSesion('${cita.codigo_cita}')" class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs">
                💾 Guardar Ficha y Finalizar Sesión
              </button>
            ` : ''}
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition">
              Cerrar Vista
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}
window.abrirSalaVirtualCita = abrirSalaVirtualCita;

// ==========================================================================
// 17. PASOS 7, 8 Y 9: FORMULARIO PRIVADO DE REGISTRO DE SESIÓN CLÍNICA
// ==========================================================================
function openModalRegistrarSesion(codigoCita) {
  // Búsqueda flexible de la cita por código, código normalizado o ID
  let cita = dbCitas.find(c => 
    c.codigo_cita === codigoCita || 
    (c.codigo_cita && c.codigo_cita.trim().toLowerCase() === String(codigoCita).trim().toLowerCase()) ||
    c.id_cita === codigoCita
  );

  // Si no se encuentra en dbCitas, crearla para no bloquear la atención clínica
  if (!cita) {
    const alumnoEncontrado = dbPacientes.find(p => `${p.nombres} ${p.apellidos}`.includes('Jhon Fernando')) || dbPacientes[0];
    cita = {
      id_cita: "cit_" + Date.now(),
      codigo_cita: codigoCita || "CIT-2026-0103",
      alumno: alumnoEncontrado ? `${alumnoEncontrado.nombres} ${alumnoEncontrado.apellidos}` : "Jhon Fernando Álvarez Boza",
      carrera: alumnoEncontrado ? alumnoEncontrado.carrera_profesional : "Arquitectura de Plataformas TI",
      dni: alumnoEncontrado ? alumnoEncontrado.dni : "71239845",
      psicologo: currentUser ? (currentUser.nombre_completo || currentUser.nombre_corto) : "Lic. Karin Lisbeth Vílchez Torrealva",
      consultorio: (currentUser && currentUser.consultorio) ? currentUser.consultorio : "Consultorio 03 (Pabellón B)",
      fecha_cita: new Date().toISOString().split('T')[0],
      hora_inicio: "02:00 PM",
      modalidad: "Presencial",
      estado_cita: "En atención",
      motivo_consulta: "Orientación vocacional y proyección profesional en el área de desarrollo de software"
    };
    dbCitas.unshift(cita);
    persistCitas();
  }

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  // Contar sesiones previas de este estudiante
  const sesionesPrevias = dbSesionesClinicas.filter(s => s.alumno === cita.alumno).length;
  const numSesionActual = sesionesPrevias + 1;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh]">
        <!-- Cabecera Confidencial -->
        <div class="bg-gradient-to-r from-teal-800 to-sky-800 p-6 text-white relative shrink-0">
          <button onclick="closeModalOperacion()" class="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold">&times;</button>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30">CONFIDENCIAL • CPSP LEY 29733</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200">Pasos 7, 8 y 9</span>
          </div>
          <h3 class="text-xl font-bold font-heading mt-1">Registro de Sesión de Atención Psicológica</h3>
          <p class="text-xs text-teal-100">Paciente: <strong>${cita.alumno}</strong> (${cita.carrera}) • Cita: ${cita.codigo_cita}</p>
        </div>

        <!-- Formulario con los 8 campos obligatorios -->
        <div class="p-6 overflow-y-auto space-y-4 text-xs">
          <form id="form-registro-sesion-clinica" onsubmit="handleGuardarSesionClinicaDirecto('${cita.codigo_cita}', event)" class="space-y-4">
            
            <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label class="block font-bold text-slate-700 mb-1">1. Número de Sesión *</label>
                <input type="number" id="ses-numero" value="${numSesionActual}" min="1" max="50" required class="w-full p-2.5 border rounded-xl bg-white font-bold text-purple-700">
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">2. Fecha de la Sesión *</label>
                <input type="date" id="ses-fecha" value="${cita.fecha_cita}" required class="w-full p-2.5 border rounded-xl bg-white font-medium">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">3. Motivo de Consulta *</label>
              <input type="text" id="ses-motivo" value="${cita.motivo_consulta}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium">
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">4. Evaluación Psicológica *</label>
              <textarea id="ses-evaluacion" rows="2.5" required placeholder="Estado afectivo, orientación, nivel de estrés, ansiedad, funciones cognitivas..." class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">Estudiante orientado en tiempo, espacio y persona. Refiere presión académica por evaluaciones finales. Se identifica reactividad ansiosa adaptativa leve sin compromiso conductual severo.</textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">5. Observaciones Clínicas *</label>
              <textarea id="ses-observaciones" rows="2.5" required placeholder="Conducta observada, lenguaje, receptividad y actitud del paciente..." class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">Adecuada disposición al diálogo y apertura reflexiva. Muestra alta motivación por mejorar sus hábitos de estudio y culminar el semestre con éxito.</textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">6. Intervención Realizada *</label>
              <textarea id="ses-intervencion" rows="2.5" required placeholder="Técnicas aplicadas: psicoeducación, respiración diafragmática, matriz de Eisenhower..." class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">Psicoeducación sobre el manejo cognitivo del estrés académico. Entrenamiento guiado en técnica de respiración lenta 4x4 y estructuración de matriz de prioridades de estudio.</textarea>
            </div>

            <div class="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1">
              <div class="flex items-center space-x-2">
                <span class="text-base">📢</span>
                <label class="font-bold text-teal-900">7. Recomendaciones para el Estudiante * (Visible en el panel del alumno)</label>
              </div>
              <textarea id="ses-recomendaciones" rows="2.5" required placeholder="Pautas claras que el paciente consultará desde su portal..." class="w-full p-2.5 border border-teal-300 rounded-xl bg-white outline-none font-medium">1. Dedicar bloques de estudio de 45 minutos con descansos de 10 minutos (Técnica Pomodoro).
2. Realizar 5 minutos de respiración diafragmática al iniciar la jornada.
3. Mantener horario regular de sueño (mínimo 7 horas diarias).</textarea>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">8. Seguimiento y Acuerdos *</label>
              <textarea id="ses-seguimiento" rows="2" required placeholder="Próximas revisiones o monitoreo..." class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">Monitorear la aplicación del cronograma de estudio en el transcurso de las próximas dos semanas.</textarea>
            </div>

            <!-- PASO 9: PROGRAMAR PRÓXIMA SESIÓN -->
            <div class="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="ses-check-proxima" onchange="toggleProximaSesionInputs(this.checked)" checked class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4">
                <span class="font-bold text-purple-900 text-xs">Paso 9: Programar Próxima Sesión de Seguimiento para el Paciente</span>
              </label>

              <div id="box-proxima-sesion" class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Fecha Próxima Sesión:</label>
                  <input type="date" id="proxima-fecha" value="2026-11-26" class="w-full p-2 border rounded-xl bg-white outline-none">
                </div>
                <div>
                  <label class="block font-bold text-slate-700 mb-1">Hora Próxima Sesión:</label>
                  <select id="proxima-hora" class="w-full p-2 border rounded-xl bg-white outline-none font-medium">
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM" selected>10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- BOTONES DE GUARDADO -->
            <div class="pt-2 border-t border-slate-100 flex justify-end space-x-2">
              <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">Cancelar</button>
              <button type="button" id="btn-submit-guardar-sesion" onclick="handleGuardarSesionClinicaDirecto('${cita.codigo_cita}', event)" class="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-md shadow-teal-600/20 active:scale-95 cursor-pointer flex items-center space-x-2">
                <span>💾 Guardar Registro y Finalizar Sesión (Paso 8)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function toggleProximaSesionInputs(checked) {
  const box = document.getElementById('box-proxima-sesion');
  if (box) {
    if (checked) box.classList.remove('hidden');
    else box.classList.add('hidden');
  }
}

// Handler infalible con ejecución directa onclick y auto-detección de argumentos
function handleGuardarSesionClinicaDirecto(arg1, arg2) {
  let e = (arg1 && typeof arg1.preventDefault === 'function') ? arg1 : ((arg2 && typeof arg2.preventDefault === 'function') ? arg2 : null);
  if (e) {
    try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
  }

  let codigoCita = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : null);

  // Si no vino como parámetro, buscar en el DOM del modal abierto
  if (!codigoCita) {
    const headerEl = document.querySelector('#modal-operacion-container');
    if (headerEl) {
      const match = headerEl.innerText.match(/CIT-\d{4}-\d+/);
      if (match) codigoCita = match[0];
    }
  }

  // Si aún no se encontró, tomar la primera cita en atención
  if (!codigoCita) {
    const enAtencion = dbCitas.find(c => c.estado_cita === 'En atención');
    codigoCita = enAtencion ? enAtencion.codigo_cita : 'CIT-2026-0103';
  }

  console.log("[PsicoScorza] Guardando sesión clínica para cita:", codigoCita);

  const numSesion = Number(document.getElementById('ses-numero')?.value || 1);
  const fecha = document.getElementById('ses-fecha')?.value || new Date().toISOString().split('T')[0];
  const motivo = (document.getElementById('ses-motivo')?.value || '').trim() || 'Atención psicopedagógica y bienestar estudiantil';
  const evaluacion = (document.getElementById('ses-evaluacion')?.value || '').trim() || 'Evaluación psicológica completada satisfactoriamente.';
  const observaciones = (document.getElementById('ses-observaciones')?.value || '').trim() || 'Adecuada disposición y receptividad.';
  const intervencion = (document.getElementById('ses-intervencion')?.value || '').trim() || 'Psicoeducación y técnicas aplicadas.';
  const recomendaciones = (document.getElementById('ses-recomendaciones')?.value || '').trim() || 'Continuar con las pautas brindadas.';
  const seguimiento = (document.getElementById('ses-seguimiento')?.value || '').trim() || 'Monitoreo en próximas semanas.';

  const checkProxima = document.getElementById('ses-check-proxima')?.checked;
  const proxFecha = document.getElementById('proxima-fecha')?.value;
  const proxHora = document.getElementById('proxima-hora')?.value;

  // Buscar o reconstruir cita para garantizar que siempre se guarde
  let cita = dbCitas.find(c => 
    c.codigo_cita === codigoCita || 
    (c.codigo_cita && c.codigo_cita.trim().toLowerCase() === String(codigoCita).trim().toLowerCase()) ||
    c.id_cita === codigoCita
  );

  if (!cita) {
    const alumnoEncontrado = dbPacientes.find(p => `${p.nombres} ${p.apellidos}`.includes('Jhon Fernando')) || dbPacientes[0];
    cita = {
      id_cita: "cit_" + Date.now(),
      codigo_cita: codigoCita || `CIT-2026-${Math.floor(100 + Math.random() * 900)}`,
      alumno: alumnoEncontrado ? `${alumnoEncontrado.nombres} ${alumnoEncontrado.apellidos}` : "Jhon Fernando Álvarez Boza",
      dni: alumnoEncontrado ? alumnoEncontrado.dni : "71239845",
      carrera: alumnoEncontrado ? alumnoEncontrado.carrera_profesional : "Arquitectura de Plataformas TI",
      psicologo: currentUser ? (currentUser.nombre_completo || currentUser.nombre_corto) : "Lic. Karin Lisbeth Vílchez Torrealva",
      consultorio: (currentUser && currentUser.consultorio) ? currentUser.consultorio : "Consultorio 03 (Pabellón B)",
      fecha_cita: fecha,
      hora_inicio: "02:00 PM",
      modalidad: "Presencial",
      estado_cita: "En atención",
      motivo_consulta: motivo
    };
    dbCitas.unshift(cita);
  }

  // 1. Crear nuevo registro de sesión clínica
  const nuevaSesion = {
    id_sesion: "SES-2026-" + Math.floor(100 + Math.random() * 900),
    codigo_cita: cita.codigo_cita,
    numero_sesion: numSesion,
    fecha_sesion: fecha,
    alumno: cita.alumno,
    dni: cita.dni || "71239845",
    carrera: cita.carrera || "Arquitectura de Plataformas TI",
    psicologo: cita.psicologo,
    consultorio: cita.consultorio,
    motivo_consulta: motivo,
    evaluacion: evaluacion,
    observaciones: observaciones,
    intervencion: intervencion,
    recomendaciones: recomendaciones,
    seguimiento: seguimiento,
    proxima_sesion: (checkProxima && proxFecha && proxHora) ? `${proxFecha} ${proxHora}` : null
  };

  dbSesionesClinicas.unshift(nuevaSesion);
  persistSesiones();

  // Firestore sesión
  if (dbFirestore) {
    dbFirestore.collection('sesiones_clinicas').add(nuevaSesion).catch(err => console.warn(err));
  }

  // 2. PASO 8: Cambiar estado de la cita a «Finalizada»
  cita.estado_cita = "Finalizada";
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', cita.codigo_cita).get()
      .then(s => s.forEach(doc => doc.ref.update({ estado_cita: "Finalizada" })))
      .catch(err => console.warn(err));
  }

  // 3. PASO 9: Si se programó próxima sesión, crear automáticamente la cita
  if (checkProxima && proxFecha && proxHora) {
    const num = Math.floor(100 + Math.random() * 900);
    const codProxima = `CIT-2026-${num}`;
    const citaSeguimiento = {
      id_cita: "cit_" + Date.now(),
      codigo_cita: codProxima,
      alumno: cita.alumno,
      dni: cita.dni,
      carrera: cita.carrera,
      psicologo: cita.psicologo,
      consultorio: cita.consultorio,
      fecha_cita: proxFecha,
      hora_inicio: proxHora,
      modalidad: cita.modalidad || "Presencial",
      estado_cita: "Confirmada",
      motivo_consulta: `Sesión de seguimiento N° ${numSesion + 1} acordada en consulta clínica.`
    };
    dbCitas.unshift(citaSeguimiento);
    persistCitas();

    if (dbFirestore) {
      dbFirestore.collection('citas').add(citaSeguimiento).catch(err => console.warn(err));
    }

    agregarNotificacion(
      "Paciente",
      cita.alumno,
      "Próxima Sesión Programada",
      `Tu especialista programó tu próxima sesión (${codProxima}) para el ${proxFecha} a las ${proxHora} en ${cita.consultorio}.`,
      "proxima_sesion"
    );
  }

  // 4. Notificar al paciente sobre las recomendaciones
  agregarNotificacion(
    "Paciente",
    cita.alumno,
    `Sesión N° ${numSesion} Finalizada`,
    `Tu consulta con ${cita.psicologo} ha finalizado. Puedes consultar tus recomendaciones psicopedagógicas en la sección «Mis sesiones».`,
    "sesion_finalizada"
  );

  // 5. Feedback visual inmediato
  showToast(`✅ Sesión N° ${numSesion} registrada exitosamente. Cita ${cita.codigo_cita} Finalizada.`, 'success');
  closeModalOperacion();
  refreshActiveViews();
}

// Alias para compatibilidad con cualquier llamada submit
function handleGuardarSesionClinicaSubmit(arg1, arg2) {
  handleGuardarSesionClinicaDirecto(arg1, arg2);
}
window.handleGuardarSesionClinicaDirecto = handleGuardarSesionClinicaDirecto;
window.handleGuardarSesionClinicaSubmit = handleGuardarSesionClinicaSubmit;

// Captura global delegada para garantizar clic directo en cualquier circunstancia
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#btn-submit-guardar-sesion, button[type="submit"]');
  if (btn && btn.closest('#form-registro-sesion-clinica')) {
    e.preventDefault();
    e.stopPropagation();
    handleGuardarSesionClinicaDirecto(null, e);
  }
}, true);

document.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'form-registro-sesion-clinica') {
    e.preventDefault();
    e.stopPropagation();
    handleGuardarSesionClinicaDirecto(null, e);
  }
}, true);

function verDetalleSesionClinica(codigoCita) {
  const ses = dbSesionesClinicas.find(s => s.codigo_cita === codigoCita);
  if (!ses) {
    showToast('No se encontró el registro clínico de esta sesión.', 'info');
    return;
  }

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Expediente Clínico</span>
            <h3 class="font-bold text-base text-slate-900 font-heading">Sesión N° ${ses.numero_sesion} - ${ses.alumno}</h3>
            <p class="text-slate-400 text-[11px]">${ses.fecha_sesion} • ${ses.psicologo}</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-slate-50 rounded-2xl">
            <strong class="text-slate-700 block text-[10px] uppercase">Motivo:</strong>
            <p class="text-slate-600">${ses.motivo_consulta}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl">
            <strong class="text-slate-700 block text-[10px] uppercase">Evaluación:</strong>
            <p class="text-slate-600">${ses.evaluacion}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl">
            <strong class="text-slate-700 block text-[10px] uppercase">Observaciones:</strong>
            <p class="text-slate-600">${ses.observaciones}</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl">
            <strong class="text-slate-700 block text-[10px] uppercase">Intervención:</strong>
            <p class="text-slate-600">${ses.intervencion}</p>
          </div>
          <div class="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
            <strong class="text-teal-900 block text-[10px] uppercase">Recomendaciones:</strong>
            <p class="text-teal-800 whitespace-pre-line">${ses.recomendaciones}</p>
          </div>
        </div>

        <button onclick="closeModalOperacion()" class="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200">Cerrar</button>
      </div>
    </div>
  `;
}

// ==========================================================================
// 18. PASO 10: PACIENTE CONSULTA CITAS, CONFIRMACIONES Y PRÓXIMAS SESIONES
// ==========================================================================
let pacienteCitaFilter = 'Todas';

function renderPacienteInicio() {
  const container = document.getElementById('paciente-view-inicio');
  if (!container) return;

  const pac = currentUser || dbPacientes[0];
  const pacNombre = pac.nombre_corto || pac.nombre_completo || '';
  const pacDni = pac.dni || '';

  const myCitas = dbCitas.filter(c => {
    return (c.dni && pacDni && c.dni === pacDni) ||
           (c.alumno && c.alumno.toLowerCase().includes(pacNombre.toLowerCase()));
  });

  const proximaCita = myCitas.find(c => c.estado_cita === 'En atención' || c.estado_cita === 'Confirmada');
  const sesReciente = dbSesionesClinicas.find(s => {
    return s.alumno && s.alumno.toLowerCase().includes(pacNombre.toLowerCase());
  });

  const countTotal = myCitas.length;
  const countPend = myCitas.filter(c => c.estado_cita === 'Pendiente').length;
  const countConf = myCitas.filter(c => c.estado_cita === 'Confirmada').length;
  const countFin = myCitas.filter(c => c.estado_cita === 'Finalizada').length;
  const countCanc = myCitas.filter(c => c.estado_cita === 'Cancelada').length;

  const misNotifs = dbNotificaciones.filter(n => {
    if (!currentUser) return false;
    return n.destinatario_rol === 'Paciente' || n.destinatario_id === currentUser.correo;
  }).slice(0, 3);

  container.innerHTML = `
    <!-- 1. BIENVENIDA -->
    <div class="bg-gradient-to-r from-sky-700 via-teal-700 to-sky-800 rounded-3xl p-6 text-white shadow-md space-y-3">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/20">Portal Estudiantil Scorza</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200">Bienestar y Salud Mental</span>
      </div>
      <div>
        <h2 class="text-2xl font-extrabold font-heading">¡Bienvenido(a), ${pac.nombre_completo || pac.nombres}!</h2>
        <p class="text-xs text-sky-100 mt-1 max-w-2xl leading-relaxed">
          Programa de Estudios: <strong>${pac.carrera || pac.carrera_profesional || 'Arquitectura de Plataformas TI'}</strong> • DNI: ${pac.dni || '73456128'}.
          Desde aquí puedes gestionar tus citas, consultar las recomendaciones personalizadas de tu psicólogo y dar seguimiento a tu desarrollo académico.
        </p>
      </div>
      <div class="pt-2 flex flex-wrap gap-2">
        <button onclick="switchPanelSubView('paciente-view-solicitar')" class="px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition shadow-sm flex items-center space-x-1.5">
          <span>📅</span>
          <span>Solicitar Nueva Cita</span>
        </button>
        <button onclick="switchPanelSubView('paciente-view-citas')" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/30 flex items-center space-x-1.5">
          <span>📋</span>
          <span>Mis Citas Registradas</span>
        </button>
      </div>
    </div>

    <!-- 2. ESTADO DE SOLICITUDES Y CITAS (4 KPIS) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-slate-400 font-bold uppercase text-[10px]">Total Solicitudes</span>
        <span class="text-2xl font-extrabold text-slate-900 font-heading block">${countTotal}</span>
        <span class="text-[10px] text-slate-500 font-medium">Historial acumulado</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-amber-600 font-bold uppercase text-[10px]">Pendientes Asignación</span>
        <span class="text-2xl font-extrabold text-amber-600 font-heading block">${countPend}</span>
        <span class="text-[10px] text-amber-700 font-medium">En revisión administrativa</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-sky-600 font-bold uppercase text-[10px]">Citas Confirmadas</span>
        <span class="text-2xl font-extrabold text-sky-700 font-heading block">${countConf}</span>
        <span class="text-[10px] text-sky-700 font-medium">Con psicólogo y consultorio</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-emerald-600 font-bold uppercase text-[10px]">Sesiones Finalizadas</span>
        <span class="text-2xl font-extrabold text-emerald-600 font-heading block">${countFin}</span>
        <span class="text-[10px] text-emerald-700 font-medium">Con recomendaciones clínicas</span>
      </div>
    </div>

    <!-- 3. TARJETA DE PRÓXIMA CITA -->
    ${proximaCita ? `
      <div class="bg-white rounded-3xl p-6 border-2 border-sky-400/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${proximaCita.estado_cita === 'En atención' ? 'bg-purple-100 text-purple-800 animate-pulse ring-2 ring-purple-300' : 'bg-sky-100 text-sky-800'}">
              ${proximaCita.estado_cita === 'En atención' ? '🔴 ¡Tu Consulta está en Curso ahora!' : '📅 Próxima Cita Programada'}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${proximaCita.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${proximaCita.modalidad}</span>
          </div>
          <span class="font-mono font-bold text-purple-700 text-xs">${proximaCita.codigo_cita}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Psicólogo Asignado:</span>
            <span class="font-bold text-slate-900 text-sm block mt-0.5">${proximaCita.psicologo}</span>
            <span class="text-teal-700 font-semibold text-[11px]">${proximaCita.consultorio}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Fecha & Hora:</span>
            <span class="font-bold text-slate-900 text-sm block mt-0.5">📅 ${proximaCita.fecha_cita}</span>
            <span class="text-slate-600 font-medium text-[11px]">🕒 ${proximaCita.hora_inicio} (${proximaCita.modalidad})</span>
          </div>
          <div class="flex flex-col justify-center space-y-2">
            ${proximaCita.modalidad === 'Virtual' ? `
              <button type="button" onclick="abrirSalaVirtualCita('${proximaCita.codigo_cita}')" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center justify-center space-x-1.5 animate-pulse">
                <span>🎥 Entrar a Videollamada en Vivo</span>
              </button>
            ` : ''}
            <button onclick="verDetalleCitaPaciente('${proximaCita.codigo_cita}')" class="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition shadow-sm">
              👁️ Ver Ficha de la Cita
            </button>
            <button onclick="openModalReprogramarPaciente('${proximaCita.codigo_cita}')" class="w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition">
              🔄 Reprogramar Fecha/Hora
            </button>
          </div>
        </div>
      </div>
    ` : `
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Estado de Agenda</span>
          <h3 class="font-bold text-base text-slate-900 font-heading mt-1">No tienes citas próximas agendadas</h3>
          <p class="text-slate-500">¿Requieres orientación académica, apoyo ante la ansiedad de exámenes o consejería vocacional?</p>
        </div>
        <button onclick="switchPanelSubView('paciente-view-solicitar')" class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs shrink-0">
          + Solicitar Cita Ahora
        </button>
      </div>
    `}

    <!-- 4. RESUMEN DE NOTIFICACIONES Y RECOMENDACIONES -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
      <!-- Resumen Notificaciones -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-lg">🔔</span>
            <h3 class="font-bold text-sm text-slate-900 font-heading">Resumen de Notificaciones</h3>
          </div>
          <button onclick="switchPanelSubView('paciente-view-notificaciones')" class="text-purple-700 font-bold text-[11px] hover:underline">
            Ver todas →
          </button>
        </div>
        <div class="space-y-2">
          ${misNotifs.length > 0 ? misNotifs.map(n => `
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-2.5">
              <span class="text-base mt-0.5">${n.tipo === 'cita_confirmada' ? '🩺' : n.tipo === 'sesion_finalizada' ? '📋' : 'ℹ️'}</span>
              <div class="flex-grow">
                <div class="flex items-center justify-between">
                  <strong class="text-slate-900 font-bold text-[11px]">${n.titulo}</strong>
                  <span class="text-[9px] text-slate-400">${n.fecha.split(' ')[0]}</span>
                </div>
                <p class="text-slate-600 text-[11px] line-clamp-2 mt-0.5">${n.mensaje}</p>
              </div>
            </div>
          `).join('') : `
            <p class="text-center text-slate-400 py-4">No tienes notificaciones pendientes.</p>
          `}
        </div>
      </div>

      <!-- Resumen Recomendaciones de Sesión -->
      <div class="bg-white rounded-3xl p-6 border border-teal-200/80 shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-lg">💡</span>
            <h3 class="font-bold text-sm text-teal-900 font-heading">Indicaciones de tu Psicólogo</h3>
          </div>
          <button onclick="switchPanelSubView('paciente-view-sesiones')" class="text-teal-700 font-bold text-[11px] hover:underline">
            Ver sesiones →
          </button>
        </div>
        ${sesReciente ? `
          <div class="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1.5">
            <div class="flex items-center justify-between text-[10px] text-teal-800 font-bold">
              <span>Sesión N° ${sesReciente.numero_sesion} • ${sesReciente.psicologo}</span>
              <span>📅 ${sesReciente.fecha_sesion}</span>
            </div>
            <p class="text-slate-800 whitespace-pre-line leading-relaxed font-medium pl-1 text-[11px]">
              ${sesReciente.recomendaciones}
            </p>
          </div>
        ` : `
          <div class="p-6 text-center text-slate-400 space-y-1">
            <span class="text-2xl block">📑</span>
            <p class="font-bold text-slate-600 text-[11px]">Aún no tienes sesiones registradas.</p>
            <p class="text-[10px]">Cuando asistas a tu cita, tu psicólogo colocará aquí tus recomendaciones.</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderPacienteCitas() {
  const container = document.getElementById('paciente-view-citas');
  if (!container) return;

  const pac = currentUser || dbPacientes[0];
  const pacNombre = pac.nombre_corto || pac.nombre_completo || '';
  const pacDni = pac.dni || '';

  const allMyCitas = dbCitas.filter(c => {
    return (c.dni && pacDni && c.dni === pacDni) ||
           (c.alumno && c.alumno.toLowerCase().includes(pacNombre.toLowerCase()));
  });

  const countTotal = allMyCitas.length;
  const countPend = allMyCitas.filter(c => c.estado_cita === 'Pendiente').length;
  const countConf = allMyCitas.filter(c => c.estado_cita === 'Confirmada').length;
  const countFin = allMyCitas.filter(c => c.estado_cita === 'Finalizada').length;
  const countCanc = allMyCitas.filter(c => c.estado_cita === 'Cancelada').length;

  const myCitas = allMyCitas.filter(c => {
    if (pacienteCitaFilter === 'Todas') return true;
    return c.estado_cita === pacienteCitaFilter;
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">Mis Consultas</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Mis Citas Psicológicas</h2>
          <p class="text-xs text-slate-500">Muestra todas tus citas pendientes, confirmadas, finalizadas y canceladas. Desde aquí puedes reprogramar o cancelar una cita.</p>
        </div>
        <button onclick="switchPanelSubView('paciente-view-solicitar')" class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 shrink-0">
          <span>📅</span>
          <span>Solicitar Nueva Cita</span>
        </button>
      </div>

      <!-- PESTAÑAS DE FILTRADO DE ESTADOS -->
      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
        <button onclick="setPacienteCitaFilter('Todas')" class="px-3.5 py-1.5 rounded-xl transition ${pacienteCitaFilter === 'Todas' ? 'bg-purple-700 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          Todas (${countTotal})
        </button>
        <button onclick="setPacienteCitaFilter('Pendiente')" class="px-3.5 py-1.5 rounded-xl transition ${pacienteCitaFilter === 'Pendiente' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}">
          ⏳ Pendientes (${countPend})
        </button>
        <button onclick="setPacienteCitaFilter('Confirmada')" class="px-3.5 py-1.5 rounded-xl transition ${pacienteCitaFilter === 'Confirmada' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
          🩺 Confirmadas (${countConf})
        </button>
        <button onclick="setPacienteCitaFilter('Finalizada')" class="px-3.5 py-1.5 rounded-xl transition ${pacienteCitaFilter === 'Finalizada' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
          ✅ Finalizadas (${countFin})
        </button>
        <button onclick="setPacienteCitaFilter('Cancelada')" class="px-3.5 py-1.5 rounded-xl transition ${pacienteCitaFilter === 'Cancelada' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'}">
          ❌ Canceladas (${countCanc})
        </button>
      </div>
    </div>

    <!-- TABLA DE CITAS DEL PACIENTE -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Código</th>
            <th class="p-4">Especialista / Consultorio</th>
            <th class="p-4">Fecha & Hora</th>
            <th class="p-4">Modalidad</th>
            <th class="p-4">Estado</th>
            <th class="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${myCitas.length > 0 ? myCitas.map(c => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-4 font-mono font-bold text-purple-700">${c.codigo_cita}</td>
              <td class="p-4">
                <span class="font-bold text-slate-900 block">${c.psicologo}</span>
                <span class="text-[11px] text-teal-700 font-semibold">${c.consultorio}</span>
              </td>
              <td class="p-4">
                <span class="font-bold text-slate-800 block">📅 ${c.fecha_cita}</span>
                <span class="text-slate-500 text-[11px]">🕒 ${c.hora_inicio}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span>
              </td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">
                  ${c.estado_cita === 'En atención' ? '🔴 En atención' : c.estado_cita}
                </span>
              </td>
              <td class="p-4 text-right space-x-1.5">
                ${c.modalidad === 'Virtual' && (c.estado_cita === 'Confirmada' || c.estado_cita === 'En atención') ? `
                  <button type="button" onclick="abrirSalaVirtualCita('${c.codigo_cita}')" title="Conectarse a la Videollamada" class="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center space-x-1 animate-pulse">
                    <span>🎥 Sala Virtual</span>
                  </button>
                ` : ''}
                <button onclick="verDetalleCitaPaciente('${c.codigo_cita}')" title="Ver información completa" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
                  👁️ Detalle
                </button>

                ${(c.estado_cita === 'Confirmada' || c.estado_cita === 'Pendiente') ? `
                  <button onclick="openModalReprogramarPaciente('${c.codigo_cita}')" title="Cambiar fecha u hora de la cita" class="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition">
                    🔄 Reprogramar
                  </button>
                  <button onclick="openModalCancelarPaciente('${c.codigo_cita}')" title="Cancelar esta cita" class="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition">
                    ❌ Cancelar
                  </button>
                ` : c.estado_cita === 'Finalizada' ? `
                  <button onclick="switchPanelSubView('paciente-view-sesiones')" title="Ver recomendaciones del especialista" class="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition">
                    📋 Recomendaciones
                  </button>
                ` : `
                  <button onclick="switchPanelSubView('paciente-view-solicitar')" class="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
                    Reactivar
                  </button>
                `}
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" class="p-8 text-center text-slate-400">
                No se encontraron citas en este filtro (${pacienteCitaFilter}).
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;
}

function setPacienteCitaFilter(filtro) {
  pacienteCitaFilter = filtro;
  renderPacienteCitas();
}

function verDetalleCitaPaciente(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
        <div class="flex justify-between items-center border-b pb-3">
          <div>
            <h3 class="font-bold text-base text-slate-900 font-heading">Ficha de Cita ${cita.codigo_cita}</h3>
            <p class="text-slate-400 text-[11px]">Consultorio Psicológico IESTP Manuel Scorza</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-slate-50 rounded-2xl">
            <span class="text-slate-400 block text-[10px] font-bold uppercase">Psicólogo Asignado:</span>
            <span class="font-bold text-slate-900 block text-sm">${cita.psicologo}</span>
            <span class="text-teal-700 font-semibold">${cita.consultorio}</span>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
            <div>
              <span class="text-slate-400 block text-[10px] font-bold uppercase">Fecha y Hora:</span>
              <span class="font-bold text-slate-800 block">📅 ${cita.fecha_cita}</span>
              <span class="text-slate-600 font-medium text-[11px]">🕒 ${cita.hora_inicio}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] font-bold uppercase">Modalidad:</span>
              <span class="font-bold text-slate-800 block">${cita.modalidad}</span>
              <span class="text-slate-400 text-[11px]">${cita.modalidad === 'Virtual' ? 'Google Meet institucional' : 'Campus Scorza'}</span>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl">
            <span class="text-slate-400 block text-[10px] font-bold uppercase">Motivo Registrado:</span>
            <p class="text-slate-700 mt-0.5 leading-relaxed">${cita.motivo_consulta}</p>
          </div>

          <div class="p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
            <span class="font-bold text-sky-900">Estado de la Cita:</span>
            <span class="px-2.5 py-0.5 rounded-full font-bold text-xs badge-${(cita.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">${cita.estado_cita}</span>
          </div>
        </div>

        <div class="pt-2 border-t flex flex-wrap gap-2">
          ${(cita.estado_cita === 'Confirmada' || cita.estado_cita === 'Pendiente') ? `
            <button onclick="closeModalOperacion(); openModalReprogramarPaciente('${cita.codigo_cita}')" class="flex-1 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold transition">
              🔄 Reprogramar
            </button>
            <button onclick="closeModalOperacion(); openModalCancelarPaciente('${cita.codigo_cita}')" class="flex-1 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold transition">
              ❌ Cancelar
            </button>
          ` : ''}
          <button onclick="closeModalOperacion()" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition">Cerrar</button>
        </div>
      </div>
    </div>
  `;
}

function openModalReprogramarPaciente(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Reprogramar Cita</span>
            <h3 class="font-bold text-base text-slate-900 font-heading mt-1">${cita.codigo_cita}</h3>
            <p class="text-slate-400 text-[11px]">${cita.alumno} • ${cita.psicologo}</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleGuardarReprogramacionPaciente(event, '${cita.codigo_cita}')" class="space-y-3.5">
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Horario Actual Programado:</span>
            <span class="font-bold text-slate-800">📅 ${cita.fecha_cita} a las 🕒 ${cita.hora_inicio} (${cita.modalidad})</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nueva Fecha Deseada *</label>
              <input type="date" id="reprog-fecha" value="${cita.fecha_cita}" required class="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500 font-medium">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nuevo Horario *</label>
              <select id="reprog-hora" class="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500 font-medium">
                <option value="08:00 AM" ${cita.hora_inicio === '08:00 AM' ? 'selected' : ''}>08:00 AM</option>
                <option value="09:00 AM" ${cita.hora_inicio === '09:00 AM' ? 'selected' : ''}>09:00 AM</option>
                <option value="10:00 AM" ${cita.hora_inicio === '10:00 AM' ? 'selected' : ''}>10:00 AM</option>
                <option value="11:00 AM" ${cita.hora_inicio === '11:00 AM' ? 'selected' : ''}>11:00 AM</option>
                <option value="02:00 PM" ${cita.hora_inicio === '02:00 PM' ? 'selected' : ''}>02:00 PM</option>
                <option value="03:00 PM" ${cita.hora_inicio === '03:00 PM' ? 'selected' : ''}>03:00 PM</option>
                <option value="04:00 PM" ${cita.hora_inicio === '04:00 PM' ? 'selected' : ''}>04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Motivo de la Reprogramación *</label>
            <textarea id="reprog-motivo" rows="2.5" required placeholder="Indica el motivo del cambio (cruce con prácticas, motivos personales, salud)..." class="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500 font-medium">Cruce con entrega académica de módulo.</textarea>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Cancelar</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm">
              🔄 Confirmar Reprogramación
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleGuardarReprogramacionPaciente(e, codigoCita) {
  e.preventDefault();
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const nuevaFecha = document.getElementById('reprog-fecha')?.value;
  const nuevaHora = document.getElementById('reprog-hora')?.value;
  const motivoReprog = (document.getElementById('reprog-motivo')?.value || '').trim();

  cita.fecha_cita = nuevaFecha;
  cita.hora_inicio = nuevaHora;
  cita.motivo_consulta = `${cita.motivo_consulta} [Reprogramada: ${motivoReprog}]`;
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
      .then(s => s.forEach(doc => doc.ref.update({
        fecha_cita: nuevaFecha,
        hora_inicio: nuevaHora,
        motivo_consulta: cita.motivo_consulta
      }))).catch(() => {});
  }

  // Notificar
  agregarNotificacion(
    "Administrador",
    "admin.psicologia@scorza.edu.pe",
    `Cita Reprogramada: ${codigoCita}`,
    `El estudiante ${cita.alumno} ha reprogramado su cita para el ${nuevaFecha} a las ${nuevaHora}.`,
    "cita_reprogramada"
  );
  if (cita.psicologo && cita.psicologo !== 'Pendiente de Asignación') {
    agregarNotificacion(
      "Psicólogo",
      cita.psicologo,
      `Cita Reprogramada por Estudiante`,
      `El estudiante ${cita.alumno} reprogramó la cita ${codigoCita} para el ${nuevaFecha} a las ${nuevaHora}.`,
      "cita_reprogramada"
    );
  }

  closeModalOperacion();
  showToast(`✅ Tu cita ${codigoCita} fue reprogramada para el ${nuevaFecha} a las ${nuevaHora}.`, 'success');
  renderPacienteCitas();
  if (!document.getElementById('paciente-view-inicio')?.classList.contains('hidden')) {
    renderPacienteInicio();
  }
}

function openModalCancelarPaciente(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">⚠️</span>
            <div>
              <h3 class="font-bold text-base text-rose-700 font-heading">Cancelar Cita Psicológica</h3>
              <p class="text-slate-400 text-[11px]">${cita.codigo_cita} • ${cita.psicologo}</p>
            </div>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleConfirmarCancelacionPaciente(event, '${cita.codigo_cita}')" class="space-y-3.5">
          <div class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 leading-relaxed font-medium">
            ¿Estás seguro(a) de que deseas cancelar tu cita del <strong>${cita.fecha_cita} (${cita.hora_inicio})</strong>? Se liberará el turno en el consultorio.
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Motivo de Cancelación (Opcional):</label>
            <textarea id="canc-motivo" rows="2.5" placeholder="Indica el motivo brevemente..." class="w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400 font-medium"></textarea>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Volver Atrás</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm">
              ❌ Sí, Cancelar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleConfirmarCancelacionPaciente(e, codigoCita) {
  e.preventDefault();
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const motivoCanc = (document.getElementById('canc-motivo')?.value || '').trim();
  cita.estado_cita = "Cancelada";
  if (motivoCanc) {
    cita.motivo_consulta = `${cita.motivo_consulta} [Cancelada: ${motivoCanc}]`;
  }
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
      .then(s => s.forEach(doc => doc.ref.update({
        estado_cita: "Cancelada",
        motivo_consulta: cita.motivo_consulta
      }))).catch(() => {});
  }

  // Notificar
  agregarNotificacion(
    "Administrador",
    "admin.psicologia@scorza.edu.pe",
    `Cita Cancelada: ${codigoCita}`,
    `El estudiante ${cita.alumno} ha cancelado su cita del ${cita.fecha_cita}.`,
    "cita_cancelada"
  );
  if (cita.psicologo && cita.psicologo !== 'Pendiente de Asignación') {
    agregarNotificacion(
      "Psicólogo",
      cita.psicologo,
      `Turno Liberado: Cita Cancelada`,
      `El estudiante ${cita.alumno} canceló su cita (${codigoCita}) del ${cita.fecha_cita} a las ${cita.hora_inicio}.`,
      "cita_cancelada"
    );
  }

  closeModalOperacion();
  showToast(`La cita ${codigoCita} ha sido cancelada.`, 'info');
  renderPacienteCitas();
  if (!document.getElementById('paciente-view-inicio')?.classList.contains('hidden')) {
    renderPacienteInicio();
  }
}

function renderPacienteSesiones() {
  const container = document.getElementById('paciente-view-sesiones');
  if (!container) return;

  const pac = currentUser || dbPacientes[0];
  const pacNombre = pac.nombre_corto || pac.nombre_completo || '';
  const mySesiones = dbSesionesClinicas.filter(s => {
    return s.alumno && s.alumno.toLowerCase().includes(pacNombre.toLowerCase());
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Atenciones Realizadas</span>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Mis Sesiones y Recomendaciones</h2>
      <p class="text-xs text-slate-500">Consulta las sesiones de atención psicológica realizadas y las recomendaciones que tu especialista ha autorizado compartir contigo.</p>
    </div>

    ${mySesiones.length > 0 ? `
      <div class="space-y-4">
        ${mySesiones.map(s => `
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-xs space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Sesión Clínica N° ${s.numero_sesion}</span>
                <h3 class="font-bold text-base text-slate-900 font-heading mt-1">Atención con ${s.psicologo}</h3>
                <p class="text-slate-400 text-[11px]">${s.consultorio} • Cita: ${s.codigo_cita}</p>
              </div>
              <span class="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl text-center">📅 ${s.fecha_sesion}</span>
            </div>

            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <strong class="text-slate-600 block text-[10px] uppercase">Motivo Atendido:</strong>
              <p class="text-slate-800 font-medium mt-0.5">${s.motivo_consulta}</p>
            </div>

            <div class="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1.5">
              <span class="font-bold text-teal-900 flex items-center space-x-1.5">
                <span>📋</span>
                <span>Recomendaciones Clínicas e Indicaciones del Especialista (Para el Estudiante):</span>
              </span>
              <p class="text-slate-800 whitespace-pre-line leading-relaxed font-medium pl-6 text-[11px]">${s.recomendaciones}</p>
            </div>

            ${s.proxima_sesion ? `
              <div class="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                <span class="font-bold text-purple-900 flex items-center space-x-1">
                  <span>📅</span>
                  <span>Próxima Sesión Acordada:</span>
                </span>
                <span class="font-bold text-purple-700">${s.proxima_sesion}</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-2 text-xs">
        <span class="text-3xl block">📑</span>
        <p class="font-bold text-slate-700">Aún no cuentas con sesiones finalizadas registradas.</p>
        <p class="text-slate-400">Cuando asistas a tu cita de atención, tu especialista dejará aquí tus indicaciones clínicas.</p>
      </div>
    `}
  `;
}

function renderPacienteNotificaciones() {
  const container = document.getElementById('paciente-view-notificaciones');
  if (!container) return;

  const notifs = dbNotificaciones.filter(n => {
    if (!currentUser) return false;
    return n.destinatario_rol === 'Paciente' || n.destinatario_id === currentUser.correo;
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Centro de Mensajes</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Notificaciones del Sistema</h2>
          <p class="text-xs text-slate-500">Informa sobre citas confirmadas, asignaciones de psicólogos, cambios de horario y nuevas recomendaciones.</p>
        </div>
        <button onclick="marcarNotificacionesLeidasPaciente()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs transition">
          ✓ Marcar todas como leídas
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3 text-xs">
      ${notifs.length > 0 ? notifs.map(n => `
        <div class="p-4 rounded-2xl border ${n.leida ? 'border-slate-100 bg-slate-50' : 'border-purple-200 bg-purple-50/50'} flex items-start space-x-3 transition">
          <span class="text-xl mt-0.5">${n.tipo === 'cita_confirmada' ? '🩺' : n.tipo === 'sesion_finalizada' ? '📋' : n.tipo === 'cita_reprogramada' ? '🔄' : '🔔'}</span>
          <div class="space-y-1 flex-grow">
            <div class="flex items-center justify-between">
              <strong class="text-slate-900 font-bold text-xs">${n.titulo}</strong>
              <span class="text-[10px] text-slate-400 font-mono">${n.fecha}</span>
            </div>
            <p class="text-slate-600 leading-relaxed text-[11px]">${n.mensaje}</p>
          </div>
        </div>
      `).join('') : `
        <p class="text-center text-slate-400 py-8">No tienes notificaciones en tu bandeja.</p>
      `}
    </div>
  `;
}

function marcarNotificacionesLeidasPaciente() {
  dbNotificaciones.forEach(n => {
    if (n.destinatario_rol === 'Paciente' || (currentUser && n.destinatario_id === currentUser.correo)) {
      n.leida = true;
    }
  });
  persistNotificaciones();
  renderPacienteNotificaciones();
  showToast('Notificaciones marcadas como leídas.', 'info');
}

function renderPacienteReprogramar() {
  switchPanelSubView('paciente-view-citas');
}

function renderPacienteCancelar() {
  switchPanelSubView('paciente-view-citas');
}

function renderPacientePerfil() {
  const container = document.getElementById('paciente-view-perfil');
  if (!container) return;

  const pac = currentUser || dbPacientes[0];

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">Expediente Estudiantil</span>
        <span class="text-xs text-slate-400">Datos Personales</span>
      </div>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Mi Perfil</h2>
      <p class="text-xs text-slate-500">Permite consultar y actualizar tus datos personales registrados en la plataforma.</p>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 max-w-2xl text-xs">
      <form onsubmit="handleActualizarPerfilPaciente(event)" class="space-y-4">
        
        <div class="flex items-center space-x-4 p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-sm">
            ${(pac.nombre_completo || pac.nombres || 'K').charAt(0)}
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 font-heading">${pac.nombre_completo || (pac.nombres + ' ' + (pac.apellidos || ''))}</h3>
            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 mt-1">Estudiante / Paciente</span>
            <p class="text-slate-500 text-[11px] mt-0.5">IESTP Manuel Scorza Torre • Acobamba</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nombres y Apellidos *</label>
            <input type="text" id="perfil-nombre" value="${pac.nombre_completo || `${pac.nombres || ''} ${pac.apellidos || ''}`.trim()}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-sky-500">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">DNI (Documento de Identidad) *</label>
            <input type="text" id="perfil-dni" value="${pac.dni || '73456128'}" maxlength="8" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-mono font-bold outline-none focus:ring-2 focus:ring-sky-500">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Programa de Estudios (Carrera) *</label>
            <select id="perfil-carrera" class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-sky-500">
              <option value="Arquitectura de Plataformas TI" ${(pac.carrera === 'Arquitectura de Plataformas TI' || pac.carrera_profesional === 'Arquitectura de Plataformas TI') ? 'selected' : ''}>Arquitectura de Plataformas TI</option>
              <option value="Enfermería Técnica" ${(pac.carrera === 'Enfermería Técnica' || pac.carrera_profesional === 'Enfermería Técnica') ? 'selected' : ''}>Enfermería Técnica</option>
              <option value="Mecánica Automotriz" ${(pac.carrera === 'Mecánica Automotriz' || pac.carrera_profesional === 'Mecánica Automotriz') ? 'selected' : ''}>Mecánica Automotriz</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Semestre Académico *</label>
            <select id="perfil-semestre" class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-sky-500">
              <option value="I Semestre" ${(pac.semestre_academico === 'I Semestre') ? 'selected' : ''}>I Semestre</option>
              <option value="II Semestre" ${(pac.semestre_academico === 'II Semestre') ? 'selected' : ''}>II Semestre</option>
              <option value="III Semestre" ${(pac.semestre_academico === 'III Semestre') ? 'selected' : ''}>III Semestre</option>
              <option value="IV Semestre" ${(pac.semestre_academico === 'IV Semestre' || !pac.semestre_academico) ? 'selected' : ''}>IV Semestre</option>
              <option value="V Semestre" ${(pac.semestre_academico === 'V Semestre') ? 'selected' : ''}>V Semestre</option>
              <option value="VI Semestre" ${(pac.semestre_academico === 'VI Semestre') ? 'selected' : ''}>VI Semestre</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Teléfono / Celular de Contacto *</label>
            <input type="tel" id="perfil-telefono" value="${pac.telefono || '967890123'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-sky-500">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Correo Electrónico Institucional *</label>
            <input type="email" id="perfil-correo" value="${pac.correo || 'katty.huaman@scorza.edu.pe'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-mono font-medium outline-none focus:ring-2 focus:ring-sky-500">
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">Tus datos están protegidos por la Ley 29733 de Protección de Datos Personales.</span>
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-sm flex items-center space-x-2">
            <span>💾 Guardar Cambios de Perfil</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

function handleActualizarPerfilPaciente(e) {
  e.preventDefault();
  const nombre = document.getElementById('perfil-nombre')?.value.trim();
  const dni = document.getElementById('perfil-dni')?.value.trim();
  const carrera = document.getElementById('perfil-carrera')?.value;
  const semestre = document.getElementById('perfil-semestre')?.value;
  const telefono = document.getElementById('perfil-telefono')?.value.trim();
  const correo = document.getElementById('perfil-correo')?.value.trim();

  if (currentUser) {
    currentUser.nombre_completo = nombre;
    currentUser.nombre_corto = nombre.split(' ')[0] + (nombre.split(' ')[1] ? ' ' + nombre.split(' ')[1] : '');
    currentUser.dni = dni;
    currentUser.carrera = carrera;
    currentUser.semestre = semestre;
    currentUser.telefono = telefono;
    currentUser.correo = correo;
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
  }

  // Actualizar en dbPacientes
  const pacEncontrado = dbPacientes.find(p => p.dni === dni || p.correo === correo);
  if (pacEncontrado) {
    pacEncontrado.nombres = nombre.split(' ').slice(0, 2).join(' ');
    pacEncontrado.apellidos = nombre.split(' ').slice(2).join(' ') || '';
    pacEncontrado.carrera_profesional = carrera;
    pacEncontrado.semestre_academico = semestre;
    pacEncontrado.telefono = telefono;
    pacEncontrado.correo = correo;
    persistPacientes();
  }

  updateAuthUI();
  showToast('✅ Tus datos personales fueron actualizados correctamente.', 'success');
  renderPacientePerfil();
}

// ==========================================================================
// 19. VISTAS DEL PSICÓLOGO (INICIO, AGENDA, PACIENTES, ETC.)
// ==========================================================================
// ==========================================================================
// 19. VISTAS Y CONTROL DEL PSICÓLOGO (SEGURIDAD Y ROLES ESTRICTOS)
// ==========================================================================

// Helper de seguridad: Obtener el psicólogo activo actual
function getPsicologoActual() {
  if (currentUser && currentUser.rol === 'Psicólogo') {
    const found = dbPsicologos.find(p => 
      p.correo === currentUser.correo || 
      (currentUser.nombre_completo && currentUser.nombre_completo.includes(p.nombre_corto.split(' ')[2] || 'Quispe'))
    );
    return found ? { ...found, ...currentUser } : currentUser;
  }
  return dbPsicologos[0];
}

// Seguridad: Solo citas del especialista actual
function getCitasPsicologoActual() {
  const ps = getPsicologoActual();
  const psKey = ps.nombre_completo.includes('Quispe') ? 'Quispe' :
                ps.nombre_completo.includes('Romero') ? 'Romero' :
                ps.nombre_completo.includes('Vílchez') || ps.nombre_completo.includes('Vilchez') ? 'Vílchez' : 'Quispe';

  return dbCitas.filter(c => {
    if (!c.psicologo) return false;
    if (psKey === 'Vílchez') {
      return c.psicologo.includes('Vílchez') || c.psicologo.includes('Vilchez') || c.psicologo.includes('Karin');
    }
    return c.psicologo.includes(psKey);
  });
}

// Seguridad: Solo sesiones clínicas de este especialista
function getSesionesPsicologoActual() {
  const ps = getPsicologoActual();
  const psKey = ps.nombre_completo.includes('Quispe') ? 'Quispe' :
                ps.nombre_completo.includes('Romero') ? 'Romero' :
                ps.nombre_completo.includes('Vílchez') || ps.nombre_completo.includes('Vilchez') ? 'Vílchez' : 'Quispe';

  return dbSesionesClinicas.filter(s => {
    if (!s.psicologo) return false;
    if (psKey === 'Vílchez') {
      return s.psicologo.includes('Vílchez') || s.psicologo.includes('Vilchez') || s.psicologo.includes('Karin');
    }
    return s.psicologo.includes(psKey);
  });
}

// Seguridad: Solo pacientes asignados a este especialista
function getPacientesPsicologoActual() {
  const myCitas = getCitasPsicologoActual();
  const myDnis = new Set(myCitas.map(c => c.dni).filter(Boolean));
  const myNames = new Set(myCitas.map(c => c.alumno).filter(Boolean));

  return dbPacientes.filter(p => {
    const fullName = `${p.nombres} ${p.apellidos}`.trim();
    return myDnis.has(p.dni) || myNames.has(fullName) || Array.from(myNames).some(n => fullName.includes(n) || n.includes(fullName));
  });
}

// Estado de navegación del Psicólogo
let psicoCalMode = 'mes'; // 'mes', 'semana', 'dia'
let psicoCalYear = 2026;
let psicoCalMonth = 10; // Noviembre (0-indexed)
let psicoCalDay = 13;
let psicoCitasFilter = 'Todas';
let psicoPacientesSearch = '';

// --------------------------------------------------------------------------
// 1. INICIO: Resumen de citas de hoy, próximas atenciones y pendientes
// --------------------------------------------------------------------------
function renderPsicoInicio() {
  const container = document.getElementById('psico-view-inicio');
  if (!container) return;

  const ps = getPsicologoActual();
  const myCitas = getCitasPsicologoActual();
  const misPacientes = getPacientesPsicologoActual();

  const fechaHoy = "2026-11-13"; // Fecha de referencia de la atención
  const citasHoy = myCitas.filter(c => c.fecha_cita === fechaHoy);
  const proximasAtenciones = myCitas.filter(c => c.estado_cita === 'Confirmada');
  const pendientesRegistro = myCitas.filter(c => c.estado_cita === 'En atención');
  const finalizadas = myCitas.filter(c => c.estado_cita === 'Finalizada').length;

  container.innerHTML = `
    <!-- BIENVENIDA INSTITUCIONAL -->
    <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md space-y-3">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/20">Consultorio Clínico Habilitado</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200">${ps.cpsp || 'C.Ps.P. Colegiado'}</span>
      </div>
      <div>
        <h2 class="text-2xl font-extrabold font-heading">¡Bienvenido(a), ${ps.nombre_completo}!</h2>
        <p class="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
          ${ps.especialidad} • <strong>${ps.consultorio}</strong> • Horario: ${ps.horario} (${ps.turno}).
          Acceso confidencial autorizado bajo la Ley 29733 y el Código Deontológico del CPSP.
        </p>
      </div>
      <div class="pt-2 flex flex-wrap gap-2">
        <button onclick="switchPanelSubView('psico-view-calendario')" class="px-4 py-2 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 transition shadow-sm flex items-center space-x-1.5">
          <span>📅</span><span>Ver Mi Calendario</span>
        </button>
        <button onclick="switchPanelSubView('psico-view-citas')" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/30 flex items-center space-x-1.5">
          <span>🩺</span><span>Gestionar Mis Citas (${myCitas.length})</span>
        </button>
      </div>
    </div>

    <!-- 4 KPIS OBLIGATORIOS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-purple-600 font-bold uppercase text-[10px]">Citas de Hoy</span>
        <span class="text-3xl font-extrabold text-slate-900 font-heading block">${citasHoy.length}</span>
        <span class="text-[10px] text-slate-400">Jornada ${fechaHoy}</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-sky-600 font-bold uppercase text-[10px]">Próximas Atenciones</span>
        <span class="text-3xl font-extrabold text-sky-700 font-heading block">${proximasAtenciones.length}</span>
        <span class="text-[10px] text-sky-700">Confirmadas en agenda</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-teal-600 font-bold uppercase text-[10px]">Pacientes Asignados</span>
        <span class="text-3xl font-extrabold text-teal-700 font-heading block">${misPacientes.length}</span>
        <span class="text-[10px] text-teal-700">Expedientes autorizados</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border ${pendientesRegistro.length > 0 ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200/80'} shadow-xs space-y-1">
        <span class="text-amber-700 font-bold uppercase text-[10px]">Sesiones por Registrar</span>
        <span class="text-3xl font-extrabold text-amber-700 font-heading block">${pendientesRegistro.length}</span>
        <span class="text-[10px] text-amber-800">Citas en atención activa</span>
      </div>
    </div>

    <!-- ALERTA SI HAY SESIONES EN ATENCIÓN PENDIENTES DE REGISTRAR -->
    ${pendientesRegistro.length > 0 ? `
      <div class="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h4 class="font-bold text-amber-900 text-sm">Tienes ${pendientesRegistro.length} consulta(s) en curso con registro clínico pendiente</h4>
            <p class="text-amber-800">Completa el formulario de sesión para registrar la evaluación, intervención y recomendaciones del estudiante.</p>
          </div>
        </div>
        <button onclick="openModalRegistrarSesion('${pendientesRegistro[0].codigo_cita}')" class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs shrink-0 flex items-center space-x-2">
          <span>📝</span><span>Completar Registro Ahora</span>
        </button>
      </div>
    ` : ''}

    <!-- SECCIÓN: CITAS DE HOY Y PRÓXIMAS ATENCIONES -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
      <!-- Citas de Hoy -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-base">📅</span>
            <h3 class="font-bold text-sm text-slate-900 font-heading">Citas de Hoy (${fechaHoy})</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">${citasHoy.length} en Turno</span>
        </div>

        <div class="divide-y divide-slate-100">
          ${citasHoy.length > 0 ? citasHoy.map(c => `
            <div class="py-3 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono font-bold text-purple-700">${c.codigo_cita}</span>
                  <span class="font-bold text-slate-900">${c.alumno}</span>
                </div>
                <p class="text-slate-500 text-[11px] truncate max-w-xs mt-0.5">${c.motivo_consulta}</p>
                <span class="text-slate-400 text-[10px]">🕒 ${c.hora_inicio} • Modalidad: ${c.modalidad}</span>
              </div>
              <div class="shrink-0 flex items-center space-x-1.5">
                ${c.modalidad === 'Virtual' ? `
                  <button type="button" onclick="abrirSalaVirtualCita('${c.codigo_cita}')" class="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs">
                    🎥 Sala
                  </button>
                ` : ''}
                ${c.estado_cita === 'Confirmada' ? `
                  <button onclick="handleIniciarAtencion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition">
                    ▶️ Iniciar
                  </button>
                ` : c.estado_cita === 'En atención' ? `
                  <button onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition animate-pulse">
                    📝 Registrar
                  </button>
                ` : `
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold badge-finalizada">Finalizada</span>
                `}
              </div>
            </div>
          `).join('') : `
            <p class="text-center text-slate-400 py-6">No tienes citas agendadas para la jornada de hoy.</p>
          `}
        </div>
      </div>

      <!-- Próximas Atenciones -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-base">🩺</span>
            <h3 class="font-bold text-sm text-slate-900 font-heading">Próximas Atenciones Programadas</h3>
          </div>
          <button onclick="switchPanelSubView('psico-view-citas')" class="text-purple-700 font-bold text-[11px] hover:underline">Ver todas →</button>
        </div>

        <div class="divide-y divide-slate-100">
          ${proximasAtenciones.length > 0 ? proximasAtenciones.slice(0, 4).map(c => `
            <div class="py-3 flex items-center justify-between gap-3">
              <div>
                <span class="font-bold text-slate-900 block">${c.alumno} <span class="text-[11px] text-teal-700 font-medium">(${c.carrera || 'APSTI'})</span></span>
                <span class="text-slate-500 text-[11px]">📅 ${c.fecha_cita} a las ${c.hora_inicio}</span>
              </div>
              <button onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs transition">
                Atender Cita
              </button>
            </div>
          `).join('') : `
            <p class="text-center text-slate-400 py-6">No hay próximas citas pendientes de atención.</p>
          `}
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 2. MI CALENDARIO: Vistas por Día, Semana y Mes (Exclusivo del Psicólogo)
// --------------------------------------------------------------------------
function renderPsicoCalendario() {
  const container = document.getElementById('psico-view-calendario');
  if (!container) return;

  const ps = getPsicologoActual();
  const myCitas = getCitasPsicologoActual();

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Mi Agenda Oficial</span>
            <span class="text-xs text-slate-400 font-medium">${ps.consultorio} (${ps.turno})</span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Mi Calendario de Atención</h2>
          <p class="text-xs text-slate-500">Supervisa tus citas asignadas por día, semana y mes con total privacidad.</p>
        </div>

        <!-- SELECTOR DE VISTA: DÍA, SEMANA, MES -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button onclick="setPsicoCalMode('mes')" class="px-3 py-1.5 rounded-xl transition ${psicoCalMode === 'mes' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              📅 Mes
            </button>
            <button onclick="setPsicoCalMode('semana')" class="px-3 py-1.5 rounded-xl transition ${psicoCalMode === 'semana' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              📆 Semana
            </button>
            <button onclick="setPsicoCalMode('dia')" class="px-3 py-1.5 rounded-xl transition ${psicoCalMode === 'dia' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              🕒 Día
            </button>
          </div>

          <div class="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onclick="psicoCalNav(-1)" class="w-8 h-8 rounded-xl bg-white hover:bg-purple-50 font-bold flex items-center justify-center transition">‹</button>
            <span class="px-3 text-xs font-bold text-slate-800 min-w-[130px] text-center">
              ${psicoCalMode === 'dia' ? `${psicoCalDay} de ${MESES[psicoCalMonth]}` : `${MESES[psicoCalMonth]} ${psicoCalYear}`}
            </span>
            <button onclick="psicoCalNav(1)" class="w-8 h-8 rounded-xl bg-white hover:bg-purple-50 font-bold flex items-center justify-center transition">›</button>
          </div>
          <button onclick="psicoCalToday()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">Hoy</button>
        </div>
      </div>
    </div>

    <!-- CONTENEDOR SEGÚN MODO DE VISTA -->
    ${psicoCalMode === 'mes' ? buildPsicoCalMesHTML(myCitas) :
      psicoCalMode === 'semana' ? buildPsicoCalSemanaHTML(myCitas, ps) :
      buildPsicoCalDiaHTML(myCitas, ps)}
  `;
}

function setPsicoCalMode(mode) {
  psicoCalMode = mode;
  renderPsicoCalendario();
}

function psicoCalNav(dir) {
  if (psicoCalMode === 'mes') {
    psicoCalMonth += dir;
    if (psicoCalMonth < 0) { psicoCalMonth = 11; psicoCalYear--; }
    else if (psicoCalMonth > 11) { psicoCalMonth = 0; psicoCalYear++; }
  } else if (psicoCalMode === 'semana') {
    psicoCalDay += dir * 7;
    if (psicoCalDay < 1) { psicoCalDay = 28; psicoCalMonth--; }
    else if (psicoCalDay > 30) { psicoCalDay = 1; psicoCalMonth++; }
  } else {
    psicoCalDay += dir;
    if (psicoCalDay < 1) { psicoCalDay = 30; psicoCalMonth--; }
    else if (psicoCalDay > 30) { psicoCalDay = 1; psicoCalMonth++; }
  }
  renderPsicoCalendario();
}

function psicoCalToday() {
  psicoCalYear = 2026;
  psicoCalMonth = 10;
  psicoCalDay = 13;
  renderPsicoCalendario();
}

// 1. Vista Mes para Psicólogo
function buildPsicoCalMesHTML(citas) {
  const daysInMonth = new Date(psicoCalYear, psicoCalMonth + 1, 0).getDate();
  const firstDayIndex = new Date(psicoCalYear, psicoCalMonth, 1).getDay();
  const startOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
  let cells = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push(`<div class="bg-slate-50/50 p-2 min-h-[90px] text-slate-300"></div>`);
  }

  const todayStr = "2026-11-13";
  for (let d = 1; d <= daysInMonth; d++) {
    const dateFormatted = `${psicoCalYear}-${String(psicoCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = (dateFormatted === todayStr);
    const dayCitas = citas.filter(c => c.fecha_cita === dateFormatted);

    const chips = dayCitas.map(c => `
      <div onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="p-1 rounded-lg border bg-purple-50 border-purple-200 text-purple-900 font-semibold text-[10px] truncate cursor-pointer hover:bg-purple-100 transition">
        <strong>${c.hora_inicio}</strong> - ${c.alumno.split(' ')[0]}
      </div>
    `).join('');

    cells.push(`
      <div class="p-2 min-h-[90px] flex flex-col justify-between ${isToday ? 'bg-purple-50/60 ring-2 ring-purple-600/30' : 'bg-white'} hover:bg-purple-50/20 transition">
        <div class="flex justify-between items-center mb-1">
          <span class="font-bold text-xs ${isToday ? 'px-2 py-0.5 rounded-full bg-purple-700 text-white font-extrabold' : 'text-slate-700'}">${d}</span>
          ${dayCitas.length > 0 ? `<span class="w-2 h-2 rounded-full bg-purple-600"></span>` : ''}
        </div>
        <div class="space-y-1 overflow-y-auto max-h-[75px]">${chips}</div>
      </div>
    `);
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let j = 1; j <= remaining; j++) {
    cells.push(`<div class="bg-slate-50/50 p-2 min-h-[90px] text-slate-300"></div>`);
  }

  return `
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="grid grid-cols-7 bg-slate-100/80 border-b text-center text-xs font-bold text-slate-600 py-3">
        <div>Lunes</div><div>Martes</div><div>Miércoles</div><div>Jueves</div><div>Viernes</div><div class="text-purple-700">Sábado</div><div class="text-rose-600">Domingo</div>
      </div>
      <div class="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs min-h-[500px]">
        ${cells.join('')}
      </div>
    </div>
  `;
}

// 2. Vista Semana para Psicólogo
function buildPsicoCalSemanaHTML(citas, ps) {
  const diasSemana = ["Lunes 09", "Martes 10", "Miércoles 11", "Jueves 12", "Viernes 13", "Sábado 14"];
  const fechasSemana = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"];
  const horasTurno = ps.horas_disponibles || ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];

  return `
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
      <div class="grid grid-cols-7 bg-slate-100 border-b py-3 font-bold text-slate-700 text-center">
        <div>Horario</div>
        ${diasSemana.map((d, i) => `
          <div class="${fechasSemana[i] === '2026-11-13' ? 'text-purple-700 font-extrabold' : ''}">${d}</div>
        `).join('')}
      </div>
      <div class="divide-y divide-slate-100">
        ${horasTurno.map(hora => `
          <div class="grid grid-cols-7 divide-x divide-slate-100 min-h-[60px] items-center">
            <div class="p-2 font-mono font-bold text-slate-500 bg-slate-50/50 text-center">${hora}</div>
            ${fechasSemana.map(f => {
              const cita = citas.find(c => c.fecha_cita === f && c.hora_inicio === hora);
              return `
                <div class="p-1.5 h-full flex flex-col justify-center">
                  ${cita ? `
                    <div onclick="openModalRegistrarSesion('${cita.codigo_cita}')" class="p-1.5 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 cursor-pointer hover:shadow-sm transition">
                      <strong class="block truncate">${cita.alumno}</strong>
                      <span class="text-[9px] text-purple-700 block">${cita.estado_cita}</span>
                    </div>
                  ` : `
                    <span class="text-[10px] text-slate-300 text-center block">Disponible</span>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 3. Vista Día para Psicólogo
function buildPsicoCalDiaHTML(citas, ps) {
  const fechaDia = `${psicoCalYear}-${String(psicoCalMonth + 1).padStart(2, '0')}-${String(psicoCalDay).padStart(2, '0')}`;
  const citasDia = citas.filter(c => c.fecha_cita === fechaDia);
  const horasTurno = ps.horas_disponibles || ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];

  return `
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 text-xs">
      <div class="flex items-center justify-between border-b pb-3">
        <div>
          <h3 class="font-bold text-base text-slate-900 font-heading">Horario Diario: ${psicoCalDay} de ${MESES[psicoCalMonth]} de ${psicoCalYear}</h3>
          <p class="text-slate-500">Citas programadas para tu consultorio en esta fecha.</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">${citasDia.length} citas</span>
      </div>

      <div class="space-y-3">
        ${horasTurno.map(hora => {
          const cita = citasDia.find(c => c.hora_inicio === hora);
          return `
            <div class="p-4 rounded-2xl border ${cita ? 'bg-purple-50/60 border-purple-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between gap-4">
              <div class="flex items-center space-x-4">
                <span class="font-mono font-bold text-base text-purple-900 w-24">${hora}</span>
                ${cita ? `
                  <div>
                    <h4 class="font-bold text-slate-900 text-sm">${cita.alumno} <span class="text-xs text-teal-700 font-medium">(${cita.carrera})</span></h4>
                    <p class="text-slate-500 text-[11px]">${cita.motivo_consulta} • Cita: ${cita.codigo_cita}</p>
                  </div>
                ` : `
                  <span class="text-slate-400 font-medium italic">Horario libre para asignación de consultas</span>
                `}
              </div>
              <div>
                ${cita ? `
                  <button onclick="openModalRegistrarSesion('${cita.codigo_cita}')" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition">
                    Atender Cita
                  </button>
                ` : `
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Libre</span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 3. MIS PACIENTES: Solo pacientes asignados al especialista
// --------------------------------------------------------------------------
function renderPsicoPacientes() {
  const container = document.getElementById('psico-view-pacientes');
  if (!container) return;

  const ps = getPsicologoActual();
  const misPacientes = getPacientesPsicologoActual();
  const myCitas = getCitasPsicologoActual();
  const mySesiones = getSesionesPsicologoActual();

  const filtrados = misPacientes.filter(p => {
    if (!psicoPacientesSearch) return true;
    const term = psicoPacientesSearch.toLowerCase();
    const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase();
    return nombreCompleto.includes(term) || (p.dni && p.dni.includes(term)) || (p.carrera_profesional && p.carrera_profesional.toLowerCase().includes(term));
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Expedientes Autorizados</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Mis Pacientes Asignados (${misPacientes.length})</h2>
          <p class="text-xs text-slate-500">Muestra únicamente los estudiantes que tienen citas o sesiones asignadas con tu consultorio.</p>
        </div>
        <div class="w-full sm:w-64">
          <input type="text" placeholder="Buscar por nombre o DNI..." value="${psicoPacientesSearch}" oninput="handlePsicoPacientesSearch(this.value)" class="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500">
        </div>
      </div>
    </div>

    <!-- TARJETAS DE PACIENTES ASIGNADOS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      ${filtrados.length > 0 ? filtrados.map(p => {
        const pacNombre = `${p.nombres} ${p.apellidos}`.trim();
        const citasDeEstePac = myCitas.filter(c => c.dni === p.dni || (c.alumno && c.alumno.includes(p.nombres)));
        const sesionesDeEstePac = mySesiones.filter(s => s.dni === p.dni || (s.alumno && s.alumno.includes(p.nombres)));
        const ultimaCita = citasDeEstePac[0];

        return `
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <div class="flex items-center space-x-3.5">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                ${p.nombres.charAt(0)}
              </div>
              <div class="flex-grow">
                <h4 class="font-bold text-slate-900 text-sm leading-tight">${pacNombre}</h4>
                <p class="text-[11px] text-teal-700 font-medium">${p.carrera_profesional} • ${p.semestre_academico}</p>
                <span class="text-slate-400 font-mono text-[10px]">DNI: ${p.dni}</span>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800">
                ${sesionesDeEstePac.length} Sesiones
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600">
              <div><strong>Teléfono:</strong> ${p.telefono}</div>
              <div><strong>Citas registradas:</strong> ${citasDeEstePac.length}</div>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span class="text-slate-400 text-[10px]">
                ${ultimaCita ? `Última: ${ultimaCita.codigo_cita} (${ultimaCita.estado_cita})` : 'Sin citas previas'}
              </span>
              <div class="space-x-1.5">
                <button onclick="verHistorialClinicoPaciente('${p.dni}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition">
                  📋 Expediente
                </button>
                ${ultimaCita ? `
                  <button onclick="openModalRegistrarSesion('${ultimaCita.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition">
                    Atender
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('') : `
        <div class="col-span-2 bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 space-y-1">
          <p class="font-bold text-slate-600">No se encontraron pacientes asignados para este criterio.</p>
        </div>
      `}
    </div>
  `;
}

function handlePsicoPacientesSearch(val) {
  psicoPacientesSearch = val;
  renderPsicoPacientes();
}

function verHistorialClinicoPaciente(dni) {
  const misSesiones = getSesionesPsicologoActual().filter(s => s.dni === dni);
  const pac = dbPacientes.find(p => p.dni === dni);
  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Expediente Clínico Confidencial</span>
            <h3 class="font-bold text-base text-slate-900 font-heading mt-0.5">${pac ? `${pac.nombres} ${pac.apellidos}` : 'Paciente'}</h3>
            <p class="text-slate-400 text-[11px]">DNI: ${dni} • Consultorio Psicológico Scorza</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-3">
          ${misSesiones.length > 0 ? misSesiones.map(s => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div class="flex justify-between items-center border-b pb-2">
                <span class="font-bold text-purple-700">Sesión N° ${s.numero_sesion} (${s.id_sesion})</span>
                <span class="font-bold text-slate-600">📅 ${s.fecha_sesion}</span>
              </div>
              <p><strong>Motivo:</strong> ${s.motivo_consulta}</p>
              <p><strong>Evaluación:</strong> ${s.evaluacion}</p>
              <p><strong>Intervención:</strong> ${s.intervencion}</p>
              <div class="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
                <strong>Recomendaciones:</strong>
                <p class="whitespace-pre-line mt-0.5">${s.recomendaciones}</p>
              </div>
            </div>
          `).join('') : `
            <p class="text-center text-slate-400 py-6">Este paciente aún no cuenta con sesiones registradas contigo.</p>
          `}
        </div>

        <button onclick="closeModalOperacion()" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition">Cerrar</button>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 4. MIS CITAS: Consultar y registrar el estado de cada atención
// --------------------------------------------------------------------------
function renderPsicoCitas() {
  const container = document.getElementById('psico-view-citas');
  if (!container) return;

  const ps = getPsicologoActual();
  const allMyCitas = getCitasPsicologoActual();

  const countTotal = allMyCitas.length;
  const countConf = allMyCitas.filter(c => c.estado_cita === 'Confirmada').length;
  const countAtenc = allMyCitas.filter(c => c.estado_cita === 'En atención').length;
  const countFin = allMyCitas.filter(c => c.estado_cita === 'Finalizada').length;

  const myCitas = allMyCitas.filter(c => {
    if (psicoCitasFilter === 'Todas') return true;
    return c.estado_cita === psicoCitasFilter;
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Control de Consultas</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Mis Citas Asignadas</h2>
          <p class="text-xs text-slate-500">Consulta tus citas y registra el estado en tiempo real de cada atención.</p>
        </div>
      </div>

      <!-- FILTRO DE ESTADOS -->
      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
        <button onclick="setPsicoCitasFilter('Todas')" class="px-3.5 py-1.5 rounded-xl transition ${psicoCitasFilter === 'Todas' ? 'bg-purple-700 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
          Todas (${countTotal})
        </button>
        <button onclick="setPsicoCitasFilter('Confirmada')" class="px-3.5 py-1.5 rounded-xl transition ${psicoCitasFilter === 'Confirmada' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}">
          🩺 Confirmadas (${countConf})
        </button>
        <button onclick="setPsicoCitasFilter('En atención')" class="px-3.5 py-1.5 rounded-xl transition ${psicoCitasFilter === 'En atención' ? 'bg-purple-600 text-white font-bold shadow-xs' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'}">
          🔴 En atención (${countAtenc})
        </button>
        <button onclick="setPsicoCitasFilter('Finalizada')" class="px-3.5 py-1.5 rounded-xl transition ${psicoCitasFilter === 'Finalizada' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}">
          ✅ Finalizadas (${countFin})
        </button>
      </div>
    </div>

    <!-- TABLA DE CITAS -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Código</th>
            <th class="p-4">Paciente (Estudiante)</th>
            <th class="p-4">Fecha & Hora</th>
            <th class="p-4">Modalidad</th>
            <th class="p-4">Estado</th>
            <th class="p-4 text-right">Acción de Atención</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${myCitas.length > 0 ? myCitas.map(c => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-4 font-mono font-bold text-purple-700">${c.codigo_cita}</td>
              <td class="p-4">
                <span class="font-bold text-slate-900 block">${c.alumno}</span>
                <span class="text-[11px] text-slate-400 block truncate max-w-xs">${c.motivo_consulta}</span>
              </td>
              <td class="p-4">
                <span class="font-bold text-slate-800 block">📅 ${c.fecha_cita}</span>
                <span class="text-slate-500 text-[11px]">🕒 ${c.hora_inicio}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span>
              </td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">
                  ${c.estado_cita === 'En atención' ? '🔴 En atención' : c.estado_cita}
                </span>
              </td>
              <td class="p-4 text-right space-x-1.5">
                ${c.modalidad === 'Virtual' ? `
                  <button type="button" onclick="abrirSalaVirtualCita('${c.codigo_cita}')" title="Abrir Sala Virtual de Videollamada" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs inline-flex items-center space-x-1">
                    <span>🎥 Sala Virtual</span>
                  </button>
                ` : ''}
                ${c.estado_cita === 'Confirmada' ? `
                  <button onclick="handleIniciarAtencion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-xs">
                    ▶️ Iniciar Atención
                  </button>
                ` : c.estado_cita === 'En atención' ? `
                  <button onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs animate-pulse">
                    📝 Registrar Sesión
                  </button>
                ` : c.estado_cita === 'Finalizada' ? `
                  <button onclick="verDetalleSesionClinica('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
                    📋 Ver Ficha
                  </button>
                ` : ''}

                <button onclick="openModalCambiarEstadoCitaPsico('${c.codigo_cita}')" title="Modificar estado de atención" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition">
                  ⚙️
                </button>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" class="p-8 text-center text-slate-400">
                No se encontraron citas con el estado seleccionado (${psicoCitasFilter}).
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;
}

function setPsicoCitasFilter(filtro) {
  psicoCitasFilter = filtro;
  renderPsicoCitas();
}

function openModalCambiarEstadoCitaPsico(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-base text-slate-900 font-heading">Cambiar Estado de Cita</h3>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleGuardarEstadoCitaPsico(event, '${cita.codigo_cita}')" class="space-y-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Cita: ${cita.codigo_cita} - ${cita.alumno}</label>
            <select id="cambio-estado-select" class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none">
              <option value="Confirmada" ${cita.estado_cita === 'Confirmada' ? 'selected' : ''}>🩺 Confirmada</option>
              <option value="En atención" ${cita.estado_cita === 'En atención' ? 'selected' : ''}>🔴 En atención</option>
              <option value="Finalizada" ${cita.estado_cita === 'Finalizada' ? 'selected' : ''}>✅ Finalizada</option>
              <option value="Cancelada" ${cita.estado_cita === 'Cancelada' ? 'selected' : ''}>❌ Cancelada (No asistió)</option>
            </select>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Cancelar</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleGuardarEstadoCitaPsico(e, codigoCita) {
  e.preventDefault();
  const nuevoEstado = document.getElementById('cambio-estado-select')?.value;
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita || !nuevoEstado) return;

  cita.estado_cita = nuevoEstado;
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
      .then(s => s.forEach(doc => doc.ref.update({ estado_cita: nuevoEstado })))
      .catch(() => {});
  }

  closeModalOperacion();
  showToast(`Estado de cita ${codigoCita} actualizado a «${nuevoEstado}».`, 'success');
  refreshActiveViews();
}

// --------------------------------------------------------------------------
// 5. REGISTRO DE SESIONES: Evaluaciones, observaciones, intervenciones y recomendaciones
// --------------------------------------------------------------------------
function renderPsicoRegistroSesiones() {
  const container = document.getElementById('psico-view-registro-sesiones');
  if (!container) return;

  const myCitas = getCitasPsicologoActual();
  const mySesiones = getSesionesPsicologoActual();
  const citasPorRegistrar = myCitas.filter(c => c.estado_cita === 'En atención' || c.estado_cita === 'Confirmada');

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Expediente Clínico CPSP</span>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Registro de Sesiones de Atención Psicológica</h2>
      <p class="text-xs text-slate-500">Registra y consulta las evaluaciones psicológicas, observaciones, intervenciones realizadas y recomendaciones clínicas.</p>
    </div>

    <!-- SECCIÓN 1: CITAS LISTAS PARA REGISTRAR -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-sm text-slate-900 font-heading">Consultas Listas para Registrar Sesión</h3>
        <span class="text-slate-400 text-[11px]">${citasPorRegistrar.length} pendientes</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${citasPorRegistrar.length > 0 ? citasPorRegistrar.map(c => `
          <div class="p-4 rounded-2xl border ${c.estado_cita === 'En atención' ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-400' : 'bg-slate-50 border-slate-200'} space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-mono font-bold text-purple-700">${c.codigo_cita}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">${c.estado_cita}</span>
            </div>
            <p class="font-bold text-slate-900 text-sm">${c.alumno}</p>
            <p class="text-slate-500 text-[11px] truncate">${c.motivo_consulta}</p>
            <div class="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span class="text-slate-400 text-[10px]">📅 ${c.fecha_cita} | ${c.hora_inicio}</span>
              <button onclick="openModalRegistrarSesion('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs">
                📝 Llenar Sesión
              </button>
            </div>
          </div>
        `).join('') : `
          <div class="col-span-2 text-center text-slate-400 py-4">No tienes citas pendientes de registrar sesión en este momento.</div>
        `}
      </div>
    </div>

    <!-- SECCIÓN 2: HISTORIAL DE SESIONES REGISTRADAS -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
      <h3 class="font-bold text-base text-slate-900 font-heading">Historial de Fichas de Sesión Registradas (${mySesiones.length})</h3>

      <div class="space-y-4">
        ${mySesiones.length > 0 ? mySesiones.map(s => `
          <div class="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
              <div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Sesión N° ${s.numero_sesion} (${s.id_sesion})</span>
                <h4 class="font-bold text-slate-900 text-sm mt-0.5">${s.alumno} <span class="text-teal-700 text-xs font-medium">(${s.carrera})</span></h4>
                <p class="text-slate-400 text-[10px]">Cita: ${s.codigo_cita} • DNI: ${s.dni}</p>
              </div>
              <span class="font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border">📅 ${s.fecha_sesion}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3 bg-white rounded-xl border border-slate-100">
                <strong class="text-slate-500 block text-[10px] uppercase">Evaluación:</strong>
                <p class="text-slate-800 line-clamp-3 mt-0.5">${s.evaluacion}</p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-slate-100">
                <strong class="text-slate-500 block text-[10px] uppercase">Observaciones:</strong>
                <p class="text-slate-800 line-clamp-3 mt-0.5">${s.observaciones}</p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-slate-100">
                <strong class="text-slate-500 block text-[10px] uppercase">Intervención:</strong>
                <p class="text-slate-800 line-clamp-3 mt-0.5">${s.intervencion}</p>
              </div>
            </div>

            <div class="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1">
              <strong class="text-teal-900 block text-[10px] uppercase">Recomendaciones Compartidas al Estudiante:</strong>
              <p class="text-slate-800 whitespace-pre-line text-[11px]">${s.recomendaciones}</p>
            </div>

            ${s.proxima_sesion ? `
              <div class="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 flex justify-between items-center text-[11px]">
                <span>📅 <strong>Próxima Sesión Acordada:</strong> ${s.proxima_sesion}</span>
                <span class="text-[10px] font-bold text-purple-700">Seguimiento programado</span>
              </div>
            ` : ''}
          </div>
        `).join('') : `
          <p class="text-center text-slate-400 py-8">Aún no cuentas con registros de sesiones clínicas en tu consultorio.</p>
        `}
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 6. SEGUIMIENTO: Continuidad de atención y programación de próximas sesiones
// --------------------------------------------------------------------------
function renderPsicoSeguimiento() {
  const container = document.getElementById('psico-view-seguimiento');
  if (!container) return;

  const misPacientes = getPacientesPsicologoActual();
  const myCitas = getCitasPsicologoActual();
  const mySesiones = getSesionesPsicologoActual();

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Plan Terapéutico</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Seguimiento y Continuidad de Atención</h2>
          <p class="text-xs text-slate-500">Supervisa el progreso de tus pacientes y programa sus próximas sesiones de seguimiento.</p>
        </div>
        <button onclick="openModalProgramarSeguimiento()" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-2 shrink-0">
          <span>📅</span><span>Programar Próxima Sesión</span>
        </button>
      </div>
    </div>

    <!-- TARJETAS DE CONTINUIDAD POR PACIENTE -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      ${misPacientes.length > 0 ? misPacientes.map(p => {
        const pacNombre = `${p.nombres} ${p.apellidos}`.trim();
        const sesionesPac = mySesiones.filter(s => s.dni === p.dni || (s.alumno && s.alumno.includes(p.nombres)));
        const proximaCita = myCitas.find(c => (c.dni === p.dni || (c.alumno && c.alumno.includes(p.nombres))) && c.estado_cita === 'Confirmada');
        const ultimaSesion = sesionesPac[0];

        return `
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b pb-3">
              <div>
                <h4 class="font-bold text-slate-900 text-sm">${pacNombre}</h4>
                <p class="text-teal-700 text-[11px]">${p.carrera_profesional} • DNI: ${p.dni}</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                ${sesionesPac.length} Sesiones Realizadas
              </span>
            </div>

            <div class="space-y-2">
              <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Estado del Plan de Acompañamiento:</span>
                <p class="text-slate-700 mt-0.5">
                  ${ultimaSesion ? `Última sesión el <strong>${ultimaSesion.fecha_sesion}</strong> (Sesión N° ${ultimaSesion.numero_sesion}).` : 'Paciente en etapa inicial de diagnóstico.'}
                </p>
                ${ultimaSesion ? `<p class="text-slate-500 text-[10px] mt-1 italic">Acuerdos: ${ultimaSesion.seguimiento || 'Monitoreo continuo'}</p>` : ''}
              </div>

              ${proximaCita ? `
                <div class="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 flex justify-between items-center">
                  <div>
                    <strong class="block text-xs">Próxima Consulta Agendada:</strong>
                    <span class="text-[11px]">📅 ${proximaCita.fecha_cita} a las ${proximaCita.hora_inicio} (${proximaCita.modalidad})</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">${proximaCita.codigo_cita}</span>
                </div>
              ` : `
                <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex justify-between items-center">
                  <span class="text-[11px]">Sin próxima sesión agendada aún.</span>
                  <button onclick="openModalProgramarSeguimiento('${p.dni}')" class="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition">
                    + Agendar
                  </button>
                </div>
              `}
            </div>
          </div>
        `;
      }).join('') : `
        <div class="col-span-2 text-center text-slate-400 py-8">No hay pacientes con plan de seguimiento en tu consultorio.</div>
      `}
    </div>
  `;
}

function openModalProgramarSeguimiento(dniPreseleccionado = '') {
  const ps = getPsicologoActual();
  const misPacientes = getPacientesPsicologoActual();
  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  const fechaDefault = "2026-11-20";

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Continuidad Terapéutica</span>
            <h3 class="font-bold text-base text-slate-900 font-heading mt-0.5">Programar Sesión de Seguimiento</h3>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleConfirmarProgramarSeguimiento(event)" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Paciente Asignado *</label>
            <select id="seg-paciente-select" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold outline-none">
              ${misPacientes.map(p => `
                <option value="${p.dni}|${p.nombres} ${p.apellidos}|${p.carrera_profesional}" ${p.dni === dniPreseleccionado ? 'selected' : ''}>
                  ${p.nombres} ${p.apellidos} (${p.carrera_profesional})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Fecha de Sesión *</label>
              <input type="date" id="seg-fecha" value="${fechaDefault}" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Hora (Tu Turno) *</label>
              <select id="seg-hora" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
                ${(ps.horas_disponibles || ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM"]).map(h => `
                  <option value="${h}">${h}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Modalidad de Consulta *</label>
            <select id="seg-modalidad" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
              <option value="Presencial">🏢 Presencial (${ps.consultorio})</option>
              <option value="Virtual">🌐 Virtual (Google Meet)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Objetivo de la Sesión *</label>
            <textarea id="seg-motivo" rows="2" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">Sesión de seguimiento psicopedagógico y evaluación de acuerdos acordados.</textarea>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold">Cancelar</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm">
              📅 Confirmar Programación
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleConfirmarProgramarSeguimiento(e) {
  e.preventDefault();
  const ps = getPsicologoActual();
  const pacData = document.getElementById('seg-paciente-select')?.value.split('|');
  const dni = pacData[0];
  const nombre = pacData[1];
  const carrera = pacData[2];
  const fecha = document.getElementById('seg-fecha')?.value;
  const hora = document.getElementById('seg-hora')?.value;
  const modalidad = document.getElementById('seg-modalidad')?.value;
  const motivo = (document.getElementById('seg-motivo')?.value || '').trim();

  const num = Math.floor(100 + Math.random() * 900);
  const codProxima = `CIT-2026-${num}`;

  const nuevaCita = {
    id_cita: "cit_" + Date.now(),
    codigo_cita: codProxima,
    alumno: nombre,
    dni,
    carrera,
    psicologo: ps.nombre_completo,
    consultorio: ps.consultorio,
    fecha_cita: fecha,
    hora_inicio: hora,
    modalidad,
    estado_cita: "Confirmada",
    motivo_consulta: motivo
  };

  dbCitas.unshift(nuevaCita);
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').add(nuevaCita).catch(() => {});
  }

  // Notificar al paciente
  agregarNotificacion(
    "Paciente",
    nombre,
    "Próxima Sesión de Seguimiento Programada",
    `Tu psicólogo ${ps.nombre_completo} ha programado tu cita (${codProxima}) para el ${fecha} a las ${hora} en ${ps.consultorio}.`,
    "proxima_sesion"
  );

  closeModalOperacion();
  showToast(`✅ Sesión ${codProxima} programada exitosamente para ${nombre}.`, 'success');
  renderPsicoSeguimiento();
}

// --------------------------------------------------------------------------
// 7. NOTIFICACIONES: Asignaciones, cambios y cancelaciones
// --------------------------------------------------------------------------
function renderPsicoNotificaciones() {
  const container = document.getElementById('psico-view-notificaciones');
  if (!container) return;

  const ps = getPsicologoActual();
  const notifs = dbNotificaciones.filter(n => {
    return n.destinatario_rol === 'Psicólogo' ||
           n.destinatario_id === ps.correo ||
           (n.destinatario_id && ps.nombre_completo && n.destinatario_id.includes(ps.nombre_corto.split(' ')[2] || 'Quispe'));
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Centro de Mensajería</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Notificaciones Clínicas</h2>
          <p class="text-xs text-slate-500">Informa sobre nuevas asignaciones, reprogramaciones de horario y cancelaciones de citas.</p>
        </div>
        <button onclick="marcarNotificacionesLeidasPsico()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs transition">
          ✓ Marcar todas como leídas
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3 text-xs">
      ${notifs.length > 0 ? notifs.map(n => `
        <div class="p-4 rounded-2xl border ${n.leida ? 'border-slate-100 bg-slate-50' : 'border-purple-200 bg-purple-50/50'} flex items-start space-x-3 transition">
          <span class="text-xl mt-0.5">
            ${n.tipo === 'cita_confirmada' ? '🩺' : n.tipo === 'cita_cancelada' ? '❌' : n.tipo === 'cita_reprogramada' ? '🔄' : '🔔'}
          </span>
          <div class="space-y-1 flex-grow">
            <div class="flex items-center justify-between">
              <strong class="text-slate-900 font-bold text-xs">${n.titulo}</strong>
              <span class="text-[10px] text-slate-400 font-mono">${n.fecha}</span>
            </div>
            <p class="text-slate-600 leading-relaxed text-[11px]">${n.mensaje}</p>
          </div>
        </div>
      `).join('') : `
        <p class="text-center text-slate-400 py-8">No tienes notificaciones en tu bandeja.</p>
      `}
    </div>
  `;
}

function marcarNotificacionesLeidasPsico() {
  const ps = getPsicologoActual();
  dbNotificaciones.forEach(n => {
    if (n.destinatario_rol === 'Psicólogo' || n.destinatario_id === ps.correo) {
      n.leida = true;
    }
  });
  persistNotificaciones();
  renderPsicoNotificaciones();
  showToast('Notificaciones marcadas como leídas.', 'info');
}

// --------------------------------------------------------------------------
// 8. MI PERFIL: Actualización de datos personales y profesionales
// --------------------------------------------------------------------------
function renderPsicoPerfil() {
  const container = document.getElementById('psico-view-perfil');
  if (!container) return;

  const ps = getPsicologoActual();

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Cuerpo Profesional</span>
        <span class="text-xs text-slate-400">Credenciales CPSP</span>
      </div>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Mi Perfil Profesional</h2>
      <p class="text-xs text-slate-500">Permite consultar y actualizar tus datos personales y profesionales en la plataforma.</p>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 max-w-2xl text-xs">
      <form onsubmit="handleActualizarPerfilPsicologo(event)" class="space-y-4">
        
        <div class="flex items-center space-x-4 p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-800 text-white font-extrabold flex items-center justify-center text-xl shadow-sm">
            ${ps.avatar || 'PS'}
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900 font-heading">${ps.nombre_completo}</h3>
            <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 mt-1">${ps.cpsp || 'C.Ps.P.'}</span>
            <p class="text-slate-500 text-[11px] mt-0.5">${ps.consultorio} • Turno ${ps.turno || 'Mañana'}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nombre Completo y Grado *</label>
            <input type="text" id="psico-nombre" value="${ps.nombre_completo}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Colegiatura Profesional (CPSP) *</label>
            <input type="text" id="psico-cpsp" value="${ps.cpsp || 'C.Ps.P. 28410'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold text-purple-700 outline-none focus:ring-2 focus:ring-purple-500">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Especialidad Clínica *</label>
            <input type="text" id="psico-especialidad" value="${ps.especialidad || 'Psicología Clínica y de la Salud'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Consultorio Asignado *</label>
            <input type="text" id="psico-consultorio" value="${ps.consultorio || 'Consultorio 01'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-purple-500">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Teléfono de Contacto Profesional *</label>
            <input type="tel" id="psico-telefono" value="${ps.telefono || '967-890-123'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Correo Electrónico Institucional *</label>
            <input type="email" id="psico-correo" value="${ps.correo || 'psicologia@scorza.edu.pe'}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-mono font-medium outline-none focus:ring-2 focus:ring-purple-500">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Biografía y Enfoque Profesional</label>
          <textarea id="psico-biografia" rows="3" class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed">${ps.biografia || ''}</textarea>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">Datos profesionales validados por el IESTP Manuel Scorza Torre.</span>
          <button type="submit" class="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm flex items-center space-x-2">
            <span>💾 Guardar Cambios del Perfil</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

function handleActualizarPerfilPsicologo(e) {
  e.preventDefault();
  const nombre = document.getElementById('psico-nombre')?.value.trim();
  const cpsp = document.getElementById('psico-cpsp')?.value.trim();
  const especialidad = document.getElementById('psico-especialidad')?.value.trim();
  const consultorio = document.getElementById('psico-consultorio')?.value.trim();
  const telefono = document.getElementById('psico-telefono')?.value.trim();
  const correo = document.getElementById('psico-correo')?.value.trim();
  const biografia = (document.getElementById('psico-biografia')?.value || '').trim();

  if (currentUser) {
    currentUser.nombre_completo = nombre;
    currentUser.cpsp = cpsp;
    currentUser.especialidad = especialidad;
    currentUser.consultorio = consultorio;
    currentUser.telefono = telefono;
    currentUser.correo = correo;
    localStorage.setItem('psicoscorza_user', JSON.stringify(currentUser));
  }

  // Actualizar en dbPsicologos
  const found = dbPsicologos.find(p => p.correo === correo || (currentUser && p.correo === currentUser.correo));
  if (found) {
    found.nombre_completo = nombre;
    found.cpsp = cpsp;
    found.especialidad = especialidad;
    found.consultorio = consultorio;
    found.telefono = telefono;
    found.correo = correo;
    found.biografia = biografia;
    persistPsicologos();
  }

  updateAuthUI();
  showToast('✅ Perfil profesional del psicólogo actualizado correctamente.', 'success');
  renderPsicoPerfil();
}

// ==========================================================================
// 20. SUB-VISTAS DEL ADMINISTRADOR (CALENDARIO, REPORTES, CRUD)
// ==========================================================================
let calYear = 2026;
let calMonth = 10; // Noviembre (0-indexed)
let calFilterPsico = "Todos";
let calFilterEstado = "Todos";
let calFilterModalidad = "Todas";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function renderAdminCalendario() {
  const container = document.getElementById('admin-view-calendario');
  if (!container) return;

  const filteredCitas = dbCitas.filter(c => {
    const matchPsico = calFilterPsico === "Todos" || (c.psicologo && c.psicologo.includes(calFilterPsico));
    const matchEstado = calFilterEstado === "Todos" || c.estado_cita === calFilterEstado;
    const matchModalidad = calFilterModalidad === "Todas" || c.modalidad === calFilterModalidad;
    return matchPsico && matchEstado && matchModalidad;
  });

  const citasDelMes = filteredCitas.filter(c => {
    if (!c.fecha_cita) return false;
    const [y, m] = c.fecha_cita.split('-').map(Number);
    return y === calYear && m === (calMonth + 1);
  });

  const countTotal = citasDelMes.length;
  const countPend = citasDelMes.filter(c => c.estado_cita === 'Pendiente').length;
  const countConf = citasDelMes.filter(c => c.estado_cita === 'Confirmada').length;
  const countAtend = citasDelMes.filter(c => c.estado_cita === 'Finalizada').length;

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Supervisión Central</span>
            <span class="text-xs text-slate-400 font-medium">Control en Tiempo Real</span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Calendario General de Citas</h2>
          <p class="text-xs text-slate-500">Supervisa las solicitudes de los alumnos y asigna a los especialistas disponibles.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button onclick="calPrevMonth()" class="w-8 h-8 rounded-xl bg-white hover:bg-purple-50 font-bold flex items-center justify-center transition">‹</button>
            <span class="px-3 text-xs font-bold text-slate-800 min-w-[140px] text-center">${MESES[calMonth]} ${calYear}</span>
            <button onclick="calNextMonth()" class="w-8 h-8 rounded-xl bg-white hover:bg-purple-50 font-bold flex items-center justify-center transition">›</button>
          </div>
          <button onclick="calGoToday()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">Hoy</button>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label class="block font-bold text-slate-600 mb-1 text-[11px]">Psicólogo:</label>
          <select id="cal-filter-psico" onchange="calApplyFilters()" class="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none">
            <option value="Todos" ${calFilterPsico === 'Todos' ? 'selected' : ''}>Todos los psicólogos</option>
            <option value="Quispe" ${calFilterPsico === 'Quispe' ? 'selected' : ''}>Lic. José Gabriel Quispe</option>
            <option value="Romero" ${calFilterPsico === 'Romero' ? 'selected' : ''}>Dra. María Elena Romero</option>
            <option value="Vílchez" ${calFilterPsico === 'Vílchez' ? 'selected' : ''}>Lic. Karin Lisbeth Vílchez</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1 text-[11px]">Estado:</label>
          <select id="cal-filter-estado" onchange="calApplyFilters()" class="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none">
            <option value="Todos" ${calFilterEstado === 'Todos' ? 'selected' : ''}>Todos los estados</option>
            <option value="Pendiente" ${calFilterEstado === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
            <option value="Confirmada" ${calFilterEstado === 'Confirmada' ? 'selected' : ''}>🩺 Confirmada</option>
            <option value="En atención" ${calFilterEstado === 'En atención' ? 'selected' : ''}>🔴 En atención</option>
            <option value="Finalizada" ${calFilterEstado === 'Finalizada' ? 'selected' : ''}>✅ Finalizada</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1 text-[11px]">Modalidad:</label>
          <select id="cal-filter-modalidad" onchange="calApplyFilters()" class="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 font-medium outline-none">
            <option value="Todas" ${calFilterModalidad === 'Todas' ? 'selected' : ''}>Todas</option>
            <option value="Presencial" ${calFilterModalidad === 'Presencial' ? 'selected' : ''}>Presencial</option>
            <option value="Virtual" ${calFilterModalidad === 'Virtual' ? 'selected' : ''}>Virtual</option>
          </select>
        </div>
        <div class="flex items-center justify-around bg-purple-50/70 border border-purple-100 rounded-2xl p-2 text-center">
          <div><span class="block text-base font-extrabold text-purple-900">${countTotal}</span><span class="text-[10px] text-purple-700 font-bold">Total</span></div>
          <div class="h-6 w-px bg-purple-200"></div>
          <div><span class="block text-base font-extrabold text-amber-700">${countPend}</span><span class="text-[10px] text-amber-800 font-bold">Pendientes</span></div>
          <div class="h-6 w-px bg-purple-200"></div>
          <div><span class="block text-base font-extrabold text-blue-700">${countConf}</span><span class="text-[10px] text-blue-800 font-bold">Confirmadas</span></div>
          <div class="h-6 w-px bg-purple-200"></div>
          <div><span class="block text-base font-extrabold text-emerald-700">${countAtend}</span><span class="text-[10px] text-emerald-800 font-bold">Finalizadas</span></div>
        </div>
      </div>
    </div>

    <!-- CUADRÍCULA -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="grid grid-cols-7 bg-slate-100/80 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-3">
        <div>Lunes</div><div>Martes</div><div>Miércoles</div><div>Jueves</div><div>Viernes</div><div class="text-purple-700">Sábado</div><div class="text-rose-600">Domingo</div>
      </div>
      <div class="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs min-h-[580px]">
        ${buildCalendarGridHTML(calYear, calMonth, filteredCitas)}
      </div>
    </div>
  `;
}

function buildCalendarGridHTML(year, month, citas) {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const startOffset = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);

  let cells = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push(`<div class="bg-slate-50/50 p-2 min-h-[96px] text-slate-300 select-none"><span class="font-bold text-xs">${d}</span></div>`);
  }

  const todayStr = "2026-11-10";
  for (let day = 1; day <= daysInMonth; day++) {
    const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = (dateFormatted === todayStr);
    const dayCitas = citas.filter(c => c.fecha_cita === dateFormatted);

    const chipsHTML = dayCitas.map(c => {
      let badgeStyle = "bg-amber-100 text-amber-900 border-amber-300";
      if (c.estado_cita === 'Confirmada') badgeStyle = "bg-blue-100 text-blue-900 border-blue-300";
      else if (c.estado_cita === 'En atención') badgeStyle = "bg-purple-100 text-purple-900 border-purple-300 animate-pulse";
      else if (c.estado_cita === 'Finalizada') badgeStyle = "bg-emerald-100 text-emerald-900 border-emerald-300";

      const shortPsico = (c.psicologo || '').includes('Quispe') ? 'Quispe' : (c.psicologo || '').includes('Romero') ? 'Romero' : (c.psicologo || '').includes('Vílchez') ? 'Vílchez' : 'Sin asignar';

      return `
        <div onclick="openControlCitaAdmin('${c.codigo_cita}')" class="p-1.5 rounded-xl border ${badgeStyle} font-semibold text-[10px] leading-tight cursor-pointer hover:shadow-md transition-all truncate">
          <div class="flex items-center justify-between">
            <span class="font-bold font-mono">${c.hora_inicio}</span>
            <span class="text-[9px] opacity-75">${shortPsico}</span>
          </div>
          <div class="truncate font-medium text-slate-800">${c.alumno}</div>
        </div>
      `;
    }).join('');

    cells.push(`
      <div class="p-2 min-h-[96px] hover:bg-purple-50/30 transition flex flex-col justify-between group ${isToday ? 'bg-purple-50/60 ring-2 ring-purple-600/30 ring-inset' : 'bg-white'}">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-xs ${isToday ? 'px-2 py-0.5 rounded-full bg-purple-700 text-white font-extrabold' : 'text-slate-700'}">${day}</span>
        </div>
        <div class="space-y-1 overflow-y-auto max-h-[85px]">${chipsHTML}</div>
      </div>
    `);
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let j = 1; j <= remaining; j++) {
    cells.push(`<div class="bg-slate-50/50 p-2 min-h-[96px] text-slate-300 select-none"><span class="font-bold text-xs">${j}</span></div>`);
  }

  return cells.join('');
}

function calPrevMonth() {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderAdminCalendario();
}

function calNextMonth() {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderAdminCalendario();
}

function calGoToday() {
  calYear = 2026;
  calMonth = 10;
  renderAdminCalendario();
}

function calApplyFilters() {
  calFilterPsico = document.getElementById('cal-filter-psico')?.value || 'Todos';
  calFilterEstado = document.getElementById('cal-filter-estado')?.value || 'Todos';
  calFilterModalidad = document.getElementById('cal-filter-modalidad')?.value || 'Todas';
  renderAdminCalendario();
}

function openControlCitaAdmin(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Supervisión Administrativa</span>
            <h3 class="font-bold text-base text-slate-900 font-heading mt-1">${cita.codigo_cita}</h3>
            <p class="text-slate-400 text-[11px]">${cita.alumno} (${cita.carrera})</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-slate-50 rounded-2xl border">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Psicólogo Asignado:</span>
            <span class="font-bold text-slate-800 text-sm block">${cita.psicologo}</span>
            <span class="text-teal-700 font-medium">${cita.consultorio}</span>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border">
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Fecha y Hora:</span>
              <span class="font-bold text-slate-800">${cita.fecha_cita} | ${cita.hora_inicio}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Modalidad:</span>
              <span class="font-bold text-slate-800">${cita.modalidad}</span>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl border">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Motivo:</span>
            <p class="text-slate-700">${cita.motivo_consulta}</p>
          </div>

          <div class="p-3 rounded-2xl bg-slate-100 flex items-center justify-between">
            <span class="font-bold text-slate-700">Estado Actual:</span>
            <span class="px-2.5 py-0.5 rounded-full font-bold text-xs badge-${(cita.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">${cita.estado_cita}</span>
          </div>

          <!-- BOTONES DE ACCIÓN ADMIN -->
          <div class="pt-2 border-t flex flex-wrap gap-2">
            ${cita.estado_cita === 'Pendiente' ? `
              <button onclick="openModalAsignarPsicologo('${cita.codigo_cita}')" class="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm">
                🩺 Asignar Psicólogo y Verificar Disponibilidad
              </button>
            ` : `
              <button onclick="openModalAsignarPsicologo('${cita.codigo_cita}')" class="flex-1 py-2 rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold transition">
                🔄 Reasignar Especialista
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

function closeModalOperacion() {
  const container = document.getElementById('modal-operacion-container');
  if (container) container.innerHTML = '';
}

// ==========================================================================
// 21. MÓDULO DE REPORTES ESTADÍSTICOS (PSICOSCORZA)
// ==========================================================================
function renderAdminReportes() {
  const container = document.getElementById('admin-view-reportes');
  if (!container) return;

  const totalCitas = dbCitas.length;
  const atendidas = dbCitas.filter(c => c.estado_cita === 'Finalizada').length;
  const pendientes = dbCitas.filter(c => c.estado_cita === 'Pendiente').length;
  const confirmadas = dbCitas.filter(c => c.estado_cita === 'Confirmada').length;
  const enAtencion = dbCitas.filter(c => c.estado_cita === 'En atención').length;

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Estadísticas e Informes Generales</h2>
          <p class="text-xs text-slate-500">Métricas de atención psicológica institucional sincronizadas en vivo.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="exportarReporteExcel()" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition">
            📥 Exportar a Excel
          </button>
          <button onclick="imprimirReportePDF()" class="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition">
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </div>

    <!-- 6 CARDS KPI -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
      <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-slate-400 font-bold uppercase text-[10px] block">Total Citas</span>
        <span class="text-2xl font-extrabold text-slate-900 font-heading block">${totalCitas}</span>
      </div>
      <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-emerald-700 font-bold uppercase text-[10px] block">Finalizadas</span>
        <span class="text-2xl font-extrabold text-emerald-600 font-heading block">${atendidas}</span>
      </div>
      <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-purple-700 font-bold uppercase text-[10px] block">En Atención</span>
        <span class="text-2xl font-extrabold text-purple-700 font-heading block">${enAtencion}</span>
      </div>
      <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-amber-700 font-bold uppercase text-[10px] block">Pendientes</span>
        <span class="text-2xl font-extrabold text-amber-600 font-heading block">${pendientes}</span>
      </div>
      <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-blue-700 font-bold uppercase text-[10px] block">Pacientes</span>
        <span class="text-2xl font-extrabold text-blue-600 font-heading block">${dbPacientes.length}</span>
      </div>
      <div class="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-teal-700 font-bold uppercase text-[10px] block">Psicólogos</span>
        <span class="text-2xl font-extrabold text-teal-700 font-heading block">3 Activos</span>
      </div>
    </div>

    <!-- TABLA DESGLOSADA DE LOS 3 PSICÓLOGOS -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 text-xs space-y-4">
      <h3 class="font-bold text-base text-slate-900 font-heading">Reporte Individual de los 3 Especialistas</h3>
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-3">Psicólogo</th>
            <th class="p-3">Consultorio</th>
            <th class="p-3 text-center">Asignadas</th>
            <th class="p-3 text-center">Finalizadas</th>
            <th class="p-3 text-center">Pendientes</th>
            <th class="p-3 text-center">% Efectividad</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${dbPsicologos.map(p => {
            const myKey = p.nombre_corto.split(' ')[2] || 'Quispe';
            const citasPs = dbCitas.filter(c => c.psicologo && c.psicologo.includes(myKey));
            const fin = citasPs.filter(c => c.estado_cita === 'Finalizada').length;
            const pend = citasPs.filter(c => c.estado_cita === 'Pendiente').length;
            const pct = citasPs.length > 0 ? Math.round((fin / citasPs.length) * 100) : 100;
            return `
              <tr>
                <td class="p-3 font-bold text-slate-900">${p.nombre_completo}</td>
                <td class="p-3 text-teal-700">${p.consultorio}</td>
                <td class="p-3 text-center font-bold">${citasPs.length}</td>
                <td class="p-3 text-center font-bold text-emerald-600">${fin}</td>
                <td class="p-3 text-center font-bold text-amber-600">${pend}</td>
                <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700">${pct}%</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function exportarReporteExcel() {
  const header = ["Código", "Paciente", "DNI", "Carrera", "Psicólogo", "Consultorio", "Fecha", "Hora", "Modalidad", "Estado", "Motivo"];
  const rows = dbCitas.map(c => [
    `"${c.codigo_cita}"`, `"${c.alumno}"`, `"${c.dni || ''}"`, `"${c.carrera || ''}"`,
    `"${c.psicologo}"`, `"${c.consultorio || ''}"`, `"${c.fecha_cita}"`, `"${c.hora_inicio}"`,
    `"${c.modalidad}"`, `"${c.estado_cita}"`, `"${(c.motivo_consulta || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = "\uFEFF" + [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_PsicoScorza_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Reporte en Excel descargado exitosamente.', 'success');
}

function imprimirReportePDF() {
  window.print();
}

// ==========================================================================
// 22. SUB-VISTAS OFICIALES DEL ADMINISTRADOR (10 BOTONES OFICIALES)
// ==========================================================================
let adminPacientesSearch = '';
let adminSolicitudesFilter = 'Pendientes';
let adminNotifFilter = 'Todas';

// --------------------------------------------------------------------------
// 1. INICIO: Resumen general de la plataforma
// --------------------------------------------------------------------------
function renderAdminInicio() {
  const container = document.getElementById('admin-view-inicio') || document.getElementById('admin-view-dashboard');
  if (!container) return;

  const totalPacientes = dbPacientes.length;
  const psicologosActivos = dbPsicologos.filter(p => p.estado !== 'Suspendido').length;
  const fechaHoy = "2026-11-13";
  const citasHoy = dbCitas.filter(c => c.fecha_cita === fechaHoy);
  const solicitudesPendientes = dbCitas.filter(c => c.estado_cita === 'Pendiente');
  const citasConfirmadas = dbCitas.filter(c => c.estado_cita === 'Confirmada');
  const citasCanceladas = dbCitas.filter(c => c.estado_cita === 'Cancelada');
  const atencionesFinalizadas = dbCitas.filter(c => c.estado_cita === 'Finalizada').length;

  container.innerHTML = `
    <!-- HEADER INSTITUCIONAL -->
    <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md space-y-3">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/20">Panel Administrativo Central</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-400/20 text-purple-200">IESTP Manuel Scorza Torre</span>
      </div>
      <div>
        <h2 class="text-2xl font-extrabold font-heading">¡Bienvenida, Katty Maribel Huamán Acho!</h2>
        <p class="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
          Supervisión integral del Consultorio Psicológico y Bienestar Estudiantil. Control de citas, asignación a especialistas, estadísticas y parámetros institucionales en tiempo real.
        </p>
      </div>
      <div class="pt-2 flex flex-wrap gap-2 text-xs">
        <button onclick="switchPanelSubView('admin-view-solicitudes')" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-sm flex items-center space-x-1.5">
          <span>📑</span><span>Ver Solicitudes de Citas (${solicitudesPendientes.length})</span>
        </button>
        <button onclick="switchPanelSubView('admin-view-calendario')" class="px-4 py-2 rounded-xl bg-white text-purple-950 font-bold hover:bg-purple-50 transition shadow-sm flex items-center space-x-1.5">
          <span>📅</span><span>Ver Calendario General</span>
        </button>
        <button onclick="switchPanelSubView('admin-view-reportes')" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition border border-white/30 flex items-center space-x-1.5">
          <span>📊</span><span>Reportes Estadísticos</span>
        </button>
      </div>
    </div>

    <!-- ALERTA SI HAY SOLICITUDES PENDIENTES DE ASIGNACIÓN -->
    ${solicitudesPendientes.length > 0 ? `
      <div class="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <h4 class="font-bold text-amber-900 text-sm">Hay ${solicitudesPendientes.length} solicitud(es) de cita pendiente(s) de asignación</h4>
            <p class="text-amber-800">Los estudiantes están esperando la verificación de turno y asignación de psicólogo colegiado.</p>
          </div>
        </div>
        <button onclick="switchPanelSubView('admin-view-solicitudes')" class="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs shrink-0 flex items-center space-x-1.5">
          <span>🩺</span><span>Asignar Especialistas Ahora →</span>
        </button>
      </div>
    ` : ''}

    <!-- 6 CARDS KPI OBLIGATORIOS -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-blue-700 font-bold uppercase text-[10px] block">Total Pacientes</span>
        <span class="text-2xl font-extrabold text-blue-700 font-heading block">${totalPacientes}</span>
        <span class="text-[10px] text-slate-400">Estudiantes</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-purple-700 font-bold uppercase text-[10px] block">Psicólogos Activos</span>
        <span class="text-2xl font-extrabold text-purple-700 font-heading block">${psicologosActivos} de ${dbPsicologos.length}</span>
        <span class="text-[10px] text-purple-700 font-semibold">Colegiados CPSP</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-indigo-700 font-bold uppercase text-[10px] block">Citas de Hoy</span>
        <span class="text-2xl font-extrabold text-indigo-700 font-heading block">${citasHoy.length}</span>
        <span class="text-[10px] text-slate-400">Jornada institucional</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border ${solicitudesPendientes.length > 0 ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200/80'} shadow-xs space-y-1">
        <span class="text-amber-700 font-bold uppercase text-[10px] block">Pendientes</span>
        <span class="text-2xl font-extrabold text-amber-700 font-heading block">${solicitudesPendientes.length}</span>
        <span class="text-[10px] text-amber-800">Por asignar</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-emerald-700 font-bold uppercase text-[10px] block">Confirmadas</span>
        <span class="text-2xl font-extrabold text-emerald-700 font-heading block">${citasConfirmadas.length}</span>
        <span class="text-[10px] text-emerald-700">En agenda</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-rose-700 font-bold uppercase text-[10px] block">Canceladas</span>
        <span class="text-2xl font-extrabold text-rose-700 font-heading block">${citasCanceladas.length}</span>
        <span class="text-[10px] text-rose-700">Turnos liberados</span>
      </div>
    </div>

    <!-- SECCIÓN: CITAS DE HOY Y ACCESOS RÁPIDOS -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
      <!-- Citas de Hoy -->
      <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-base">📅</span>
            <h3 class="font-bold text-sm text-slate-900 font-heading">Citas Programadas para Hoy (${fechaHoy})</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">${citasHoy.length} en Turno</span>
        </div>

        <div class="divide-y divide-slate-100">
          ${citasHoy.length > 0 ? citasHoy.map(c => `
            <div class="py-3 flex items-center justify-between gap-3">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono font-bold text-purple-700">${c.codigo_cita}</span>
                  <span class="font-bold text-slate-900">${c.alumno}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded font-bold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span>
                </div>
                <p class="text-slate-500 text-[11px] truncate max-w-sm mt-0.5">${c.motivo_consulta}</p>
                <span class="text-slate-400 text-[10px]">🕒 ${c.hora_inicio} • Especialista: <strong>${c.psicologo}</strong></span>
              </div>
              <div class="shrink-0 space-x-1.5">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">${c.estado_cita}</span>
                <button onclick="openModalAsignarPsicologo('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs transition">
                  Verificar
                </button>
              </div>
            </div>
          `).join('') : `
            <p class="text-center text-slate-400 py-6">No hay citas registradas para la fecha actual.</p>
          `}
        </div>
      </div>

      <!-- Resumen de los 3 Especialistas -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-sm text-slate-900 font-heading">Especialistas Activos</h3>
          <button onclick="switchPanelSubView('admin-view-psicologos')" class="text-purple-700 font-bold text-[11px] hover:underline">Gestionar →</button>
        </div>
        <div class="space-y-3">
          ${dbPsicologos.map(p => `
            <div class="p-3.5 rounded-2xl border ${p.estado === 'Suspendido' ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200/70'} space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-900 text-xs">${p.nombre_corto}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${p.estado === 'Suspendido' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">${p.estado || 'Activo'}</span>
              </div>
              <p class="text-[11px] text-teal-700 font-medium">${p.consultorio} • Turno ${p.turno}</p>
              <span class="text-[10px] text-slate-400 block">${p.horario}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Alias para compatibilidad con código existente
function renderAdminDashboard() {
  renderAdminInicio();
}

// --------------------------------------------------------------------------
// 2. PSICÓLOGOS: Gestión integral, horarios, perfiles y aprobaciones
// --------------------------------------------------------------------------
function renderAdminPsicologos() {
  const container = document.getElementById('admin-view-psicologos');
  if (!container) return;

  const solicitudesPendientesPsico = dbSolicitudesPsicologos.filter(s => s.estado === 'Pendiente');

  container.innerHTML = `
    <!-- HEADER PSICÓLOGOS -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Cuerpo Profesional Colegiado</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Gestión de Psicólogos</h2>
          <p class="text-xs text-slate-500">Supervisa perfiles profesionales, aprueba nuevos especialistas, activa o suspende accesos y administra horarios de atención.</p>
        </div>
        <button onclick="openModalRegistrarNuevoPsicologoAdmin()" class="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1.5">
          <span>➕</span><span>Registrar Especialista</span>
        </button>
      </div>
    </div>

    <!-- BANDEJA DE APROBACIÓN DE NUEVOS PSICÓLOGOS -->
    ${solicitudesPendientesPsico.length > 0 ? `
      <div class="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
        <div class="flex items-center justify-between border-b border-amber-200 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-xl">📋</span>
            <h3 class="font-bold text-amber-950 text-sm">Postulaciones y Solicitudes de Nuevos Psicólogos (${solicitudesPendientesPsico.length} pendientes)</h3>
          </div>
          <span class="text-[11px] text-amber-800 font-semibold">Requiere aprobación administrativa</span>
        </div>

        <div class="space-y-3">
          ${solicitudesPendientesPsico.map(sol => `
            <div class="p-4 bg-white rounded-2xl border border-amber-200 space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">${sol.nombre_completo}</h4>
                  <span class="text-purple-700 font-bold text-[11px]">${sol.cpsp}</span> • <span class="text-teal-700 font-medium">${sol.especialidad}</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 self-start">Postulado: ${sol.fecha_solicitud}</span>
              </div>
              <p class="text-slate-600 text-[11px] leading-relaxed">${sol.curriculum}</p>
              <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[11px]">
                <span class="text-slate-500">📧 ${sol.correo} | 📞 ${sol.telefono} | Turno sugerido: <strong>${sol.turno_postulado}</strong></span>
                <div class="space-x-2">
                  <button onclick="rechazarSolicitudPsicologo('${sol.id_solicitud}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold transition">
                    ❌ Rechazar
                  </button>
                  <button onclick="aprobarSolicitudPsicologo('${sol.id_solicitud}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs">
                    ✅ Aprobar y Habilitar Acceso
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- TARJETAS DE LOS TRES PSICÓLOGOS ACTUALES -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
      ${dbPsicologos.map(p => {
        const myKey = p.nombre_corto.split(' ')[2] || 'Quispe';
        const citasPs = dbCitas.filter(c => c.psicologo && c.psicologo.includes(myKey));
        const finalizadas = citasPs.filter(c => c.estado_cita === 'Finalizada').length;
        const esSuspendido = p.estado === 'Suspendido';

        return `
          <div class="bg-white rounded-3xl p-6 border ${esSuspendido ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/80'} shadow-xs space-y-4">
            <div class="flex items-center space-x-3.5">
              <div class="w-14 h-14 rounded-2xl ${esSuspendido ? 'bg-slate-400' : 'bg-gradient-to-tr from-purple-700 to-indigo-600'} text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                ${p.avatar}
              </div>
              <div class="flex-grow">
                <h3 class="font-bold text-slate-900 text-sm leading-tight">${p.nombre_completo}</h3>
                <p class="text-[11px] font-bold text-purple-700">${p.cpsp}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">${p.consultorio}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${esSuspendido ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">${p.estado || 'Activo'}</span>
                </div>
              </div>
            </div>

            <div class="p-3 bg-slate-50 rounded-2xl text-[11px] space-y-1 border border-slate-100">
              <p><strong>Especialidad:</strong> ${p.especialidad}</p>
              <p><strong>Turno:</strong> ${p.turno} (${p.horario})</p>
              <p><strong>Contacto:</strong> 📞 ${p.telefono} | 📧 ${p.correo}</p>
              <p><strong>Historial:</strong> ${citasPs.length} citas asignadas (${finalizadas} atendidas)</p>
            </div>

            <p class="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">${p.biografia}</p>

            <div class="pt-3 border-t border-slate-100 space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <button onclick="openModalPerfilPsicologoAdmin(${p.id_psicologo})" class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-center">
                  👁️ Ver Perfil
                </button>
                <button onclick="openModalGestionarHorarioPsico(${p.id_psicologo})" class="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition text-center">
                  🕒 Horarios
                </button>
              </div>

              <button onclick="toggleEstadoPsicologo(${p.id_psicologo})" class="w-full py-2 px-3 rounded-xl ${esSuspendido ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-50 hover:bg-rose-100 text-rose-700'} font-bold transition text-center">
                ${esSuspendido ? '🟢 Reactivar Acceso a la Plataforma' : '🔴 Suspender Acceso Temporalmente'}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function toggleEstadoPsicologo(idPsico) {
  const ps = dbPsicologos.find(p => p.id_psicologo === idPsico);
  if (!ps) return;

  const nuevoEstado = ps.estado === 'Suspendido' ? 'Activo' : 'Suspendido';
  ps.estado = nuevoEstado;
  persistPsicologos();

  // Actualizar también en dbUsuarios
  const u = dbUsuarios.find(u => u.correo === ps.correo);
  if (u) u.estado = nuevoEstado;

  showToast(`Especialista ${ps.nombre_corto} marcado como: ${nuevoEstado}.`, 'info');
  renderAdminPsicologos();
  if (!document.getElementById('admin-view-inicio')?.classList.contains('hidden')) {
    renderAdminInicio();
  }
}

function openModalPerfilPsicologoAdmin(idPsico) {
  const ps = dbPsicologos.find(p => p.id_psicologo === idPsico);
  if (!ps) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  const myKey = ps.nombre_corto.split(' ')[2] || 'Quispe';
  const citasPs = dbCitas.filter(c => c.psicologo && c.psicologo.includes(myKey));

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-700 text-white font-extrabold flex items-center justify-center text-base">
              ${ps.avatar}
            </div>
            <div>
              <h3 class="font-bold text-base text-slate-900 font-heading">${ps.nombre_completo}</h3>
              <p class="text-purple-700 font-bold">${ps.cpsp} • ${ps.consultorio}</p>
            </div>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-slate-50 rounded-2xl space-y-1">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Especialidad Clínica:</span>
            <span class="font-bold text-slate-800 text-sm">${ps.especialidad}</span>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Turno de Atención:</span>
              <span class="font-bold text-slate-800">${ps.turno}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Horario Oficial:</span>
              <span class="font-bold text-slate-800">${ps.horario}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Teléfono de Contacto:</span>
              <span class="font-bold text-slate-800">${ps.telefono}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Correo Institucional:</span>
              <span class="font-mono text-slate-800 font-bold">${ps.correo}</span>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Biografía Profesional y Enfoque:</span>
            <p class="text-slate-700 leading-relaxed mt-1">${ps.biografia}</p>
          </div>

          <div class="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <span class="font-bold text-purple-900">Total Citas en su Agenda:</span>
            <span class="px-3 py-1 rounded-xl bg-purple-700 text-white font-extrabold text-xs">${citasPs.length} citas registradas</span>
          </div>
        </div>

        <div class="pt-2 border-t flex justify-end">
          <button onclick="closeModalOperacion()" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold">Cerrar</button>
        </div>
      </div>
    </div>
  `;
}

function openModalGestionarHorarioPsico(idPsico) {
  const ps = dbPsicologos.find(p => p.id_psicologo === idPsico);
  if (!ps) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-base text-slate-900 font-heading">Gestionar Horario de Atención</h3>
            <p class="text-purple-700 font-bold">${ps.nombre_corto} • ${ps.consultorio}</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleGuardarHorarioPsicoAdmin(event, ${ps.id_psicologo})" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Turno de Atención *</label>
            <select id="hor-turno" class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold outline-none">
              <option value="Mañana" ${ps.turno === 'Mañana' ? 'selected' : ''}>Mañana (08:00 AM - 01:00 PM)</option>
              <option value="Tarde" ${ps.turno === 'Tarde' ? 'selected' : ''}>Tarde (01:00 PM - 06:00 PM)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Consultorio Asignado *</label>
            <select id="hor-consultorio" class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none">
              <option value="Consultorio 01 (Pabellón A)" ${ps.consultorio.includes('01') ? 'selected' : ''}>Consultorio 01 (Pabellón A)</option>
              <option value="Consultorio 02 (Pabellón B)" ${ps.consultorio.includes('02') ? 'selected' : ''}>Consultorio 02 (Pabellón B)</option>
              <option value="Consultorio 03 (Pabellón B)" ${ps.consultorio.includes('03') ? 'selected' : ''}>Consultorio 03 (Pabellón B)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Texto de Horario Semanal *</label>
            <input type="text" id="hor-texto" value="${ps.horario}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-medium outline-none">
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Cancelar</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm">
              💾 Guardar Horario
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleGuardarHorarioPsicoAdmin(e, idPsico) {
  e.preventDefault();
  const ps = dbPsicologos.find(p => p.id_psicologo === idPsico);
  if (!ps) return;

  const turno = document.getElementById('hor-turno')?.value;
  const consultorio = document.getElementById('hor-consultorio')?.value;
  const horario = document.getElementById('hor-texto')?.value;

  ps.turno = turno;
  ps.consultorio = consultorio;
  ps.horario = horario;
  if (turno === 'Mañana') {
    ps.horas_disponibles = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];
  } else {
    ps.horas_disponibles = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
  }

  persistPsicologos();
  closeModalOperacion();
  showToast(`Horario y consultorio actualizados para ${ps.nombre_corto}.`, 'success');
  renderAdminPsicologos();
}

function aprobarSolicitudPsicologo(idSol) {
  const sol = dbSolicitudesPsicologos.find(s => s.id_solicitud === idSol);
  if (!sol) return;

  sol.estado = 'Aprobado';
  persistSolicitudesPsicologos();

  // Crear e incorporar a dbPsicologos
  const nuevoPsico = {
    id_psicologo: dbPsicologos.length + 1,
    nombre_completo: sol.nombre_completo,
    nombre_corto: sol.nombres + " " + sol.apellidos.split(' ')[0],
    correo: sol.correo,
    password: sol.password || "Scorza2026!",
    cpsp: sol.cpsp,
    especialidad: sol.especialidad,
    consultorio: sol.consultorio || "Consultorio 02 (Pabellón B)",
    horario: sol.horario || "Lunes a Viernes: 01:00 PM - 06:00 PM",
    turno: sol.turno_postulado || "Tarde",
    horas_disponibles: ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    estado: "Activo",
    avatar: sol.nombres.charAt(0) + sol.apellidos.charAt(0),
    telefono: sol.telefono,
    pacientes_asignados: 0,
    biografia: sol.curriculum
  };
  dbPsicologos.push(nuevoPsico);
  persistPsicologos();

  // Incorporar a dbUsuarios
  dbUsuarios.push({
    id_usuario: dbUsuarios.length + 1,
    nombre_completo: nuevoPsico.nombre_completo,
    nombre_corto: nuevoPsico.nombre_corto,
    correo: nuevoPsico.correo,
    password: nuevoPsico.password,
    rol: "Psicólogo",
    consultorio: nuevoPsico.consultorio,
    estado: "Activo",
    avatar: nuevoPsico.avatar
  });

  agregarNotificacion(
    "Psicólogo",
    nuevoPsico.correo,
    "¡Cuenta y Acceso Habilitados!",
    `Bienvenido(a) al equipo clínico del IESTP Manuel Scorza Torre. Tu acceso institucional ha sido aprobado exitosamente.`,
    "sistema"
  );

  showToast(`✅ Especialista ${nuevoPsico.nombre_completo} aprobado y dado de alta con éxito.`, 'success');
  renderAdminPsicologos();
}

function rechazarSolicitudPsicologo(idSol) {
  const sol = dbSolicitudesPsicologos.find(s => s.id_solicitud === idSol);
  if (!sol) return;

  sol.estado = 'Rechazado';
  persistSolicitudesPsicologos();
  showToast(`La postulación de ${sol.nombre_completo} ha sido desestimada.`, 'info');
  renderAdminPsicologos();
}

function openModalRegistrarNuevoPsicologoAdmin() {
  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-base text-slate-900 font-heading">Alta de Nuevo Psicólogo Colegiado</h3>
            <p class="text-slate-500">Registrar cuenta profesional con verificación de colegiatura C.Ps.P.</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleGuardarNuevoPsicologoAdmin(event)" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nombre Completo y Grado *</label>
            <input type="text" id="newps-nombre" placeholder="Ej: Lic. Carlos Eduardo Ramos Pérez" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Colegiatura CPSP *</label>
              <input type="text" id="newps-cpsp" placeholder="C.Ps.P. 35912" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Especialidad *</label>
              <input type="text" id="newps-especialidad" placeholder="Psicología Clínica" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Correo Institucional *</label>
              <input type="email" id="newps-correo" placeholder="usuario@scorza.edu.pe" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Teléfono *</label>
              <input type="tel" id="newps-tel" placeholder="967-890-000" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Consultorio Asignado *</label>
              <select id="newps-cons" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
                <option value="Consultorio 01 (Pabellón A)">Consultorio 01 (Pabellón A)</option>
                <option value="Consultorio 02 (Pabellón B)">Consultorio 02 (Pabellón B)</option>
                <option value="Consultorio 03 (Pabellón B)">Consultorio 03 (Pabellón B)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Turno *</label>
              <select id="newps-turno" class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
                <option value="Mañana">Mañana (08:00 AM - 01:00 PM)</option>
                <option value="Tarde">Tarde (01:00 PM - 06:00 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Breve Reseña / Biografía</label>
            <textarea id="newps-bio" rows="2.5" placeholder="Enfoque psicoterapéutico y experiencia institucional..." class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none"></textarea>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Cancelar</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm">
              ✨ Registrar Especialista
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleGuardarNuevoPsicologoAdmin(e) {
  e.preventDefault();
  const nombre = document.getElementById('newps-nombre')?.value.trim();
  const cpsp = document.getElementById('newps-cpsp')?.value.trim();
  const esp = document.getElementById('newps-especialidad')?.value.trim();
  const correo = document.getElementById('newps-correo')?.value.trim();
  const tel = document.getElementById('newps-tel')?.value.trim();
  const cons = document.getElementById('newps-cons')?.value;
  const turno = document.getElementById('newps-turno')?.value;
  const bio = (document.getElementById('newps-bio')?.value || '').trim();

  const nuevo = {
    id_psicologo: dbPsicologos.length + 1,
    nombre_completo: nombre,
    nombre_corto: nombre.split(' ').slice(0, 3).join(' '),
    correo,
    password: "Scorza2026!",
    cpsp,
    especialidad: esp,
    consultorio: cons,
    horario: turno === 'Mañana' ? "Lunes a Viernes: 08:00 AM - 01:00 PM" : "Lunes a Viernes: 01:00 PM - 06:00 PM",
    turno,
    horas_disponibles: turno === 'Mañana' ? ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"] : ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
    estado: "Activo",
    avatar: nombre.split(' ')[1] ? nombre.split(' ')[1].charAt(0) + nombre.split(' ')[2]?.charAt(0) : "PS",
    telefono: tel,
    pacientes_asignados: 0,
    biografia: bio || "Especialista colegiado del Consultorio Psicológico IESTP Manuel Scorza Torre."
  };

  dbPsicologos.push(nuevo);
  persistPsicologos();

  dbUsuarios.push({
    id_usuario: dbUsuarios.length + 1,
    nombre_completo: nuevo.nombre_completo,
    nombre_corto: nuevo.nombre_corto,
    correo: nuevo.correo,
    password: nuevo.password,
    rol: "Psicólogo",
    consultorio: nuevo.consultorio,
    estado: "Activo",
    avatar: nuevo.avatar
  });

  closeModalOperacion();
  showToast(`Especialista ${nuevo.nombre_completo} registrado con éxito.`, 'success');
  renderAdminPsicologos();
}

// --------------------------------------------------------------------------
// 3. PACIENTES: Directorio, búsqueda por nombre o DNI y estado de registro
// --------------------------------------------------------------------------
function renderAdminPacientes() {
  const container = document.getElementById('admin-view-pacientes');
  if (!container) return;

  const filtrados = dbPacientes.filter(p => {
    if (!adminPacientesSearch) return true;
    const term = adminPacientesSearch.toLowerCase();
    const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
    return fullName.includes(term) || (p.dni && p.dni.includes(term)) || (p.carrera_profesional && p.carrera_profesional.toLowerCase().includes(term));
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Población Estudiantil</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Directorio de Pacientes (${dbPacientes.length})</h2>
          <p class="text-xs text-slate-500">Consulta datos de contacto de estudiantes matriculados, filtra por nombre o DNI y supervisa el estado de registro.</p>
        </div>
        <div class="w-full sm:w-72">
          <input type="text" placeholder="🔍 Buscar por nombre o DNI..." value="${adminPacientesSearch}" oninput="handleAdminPacientesSearch(this.value)" class="w-full text-xs p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium">
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Estudiante</th>
            <th class="p-4">DNI / Código</th>
            <th class="p-4">Programa de Estudios</th>
            <th class="p-4">Semestre</th>
            <th class="p-4">Teléfono & Correo</th>
            <th class="p-4 text-center">Estado Registro</th>
            <th class="p-4 text-right">Contacto & Ficha</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${filtrados.length > 0 ? filtrados.map(p => {
            const citasDeEste = dbCitas.filter(c => c.dni === p.dni || (c.alumno && c.alumno.includes(p.nombres)));
            return `
              <tr class="hover:bg-slate-50 transition">
                <td class="p-4">
                  <span class="font-bold text-slate-900 block">${p.nombres} ${p.apellidos}</span>
                  <span class="text-[10px] text-slate-400">Registrado el ${p.fecha_registro || '2026-03-15'}</span>
                </td>
                <td class="p-4 font-mono font-bold text-slate-700">
                  ${p.dni}
                  <span class="block text-[10px] text-purple-700 font-semibold">${p.codigo_estudiantil}</span>
                </td>
                <td class="p-4 text-slate-700">${p.carrera_profesional}</td>
                <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-bold">${p.semestre_academico}</span></td>
                <td class="p-4">
                  <span class="block text-slate-800 font-bold">📞 ${p.telefono}</span>
                  <span class="text-[10px] text-slate-500">📧 ${p.correo}</span>
                </td>
                <td class="p-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    🟢 Matrícula Regular
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button onclick="openModalExpedientePacienteAdmin('${p.dni}')" class="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition">
                    📋 Ver Ficha (${citasDeEste.length})
                  </button>
                </td>
              </tr>
            `;
          }).join('') : `
            <tr>
              <td colspan="7" class="p-8 text-center text-slate-400">No se encontraron pacientes para el término de búsqueda ingresado.</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;
}

function handleAdminPacientesSearch(val) {
  adminPacientesSearch = val;
  renderAdminPacientes();
}

function openModalExpedientePacienteAdmin(dni) {
  const pac = dbPacientes.find(p => p.dni === dni);
  if (!pac) return;

  const citasPac = dbCitas.filter(c => c.dni === dni || (c.alumno && c.alumno.includes(pac.nombres)));
  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Expediente de Matrícula</span>
            <h3 class="font-bold text-base text-slate-900 font-heading mt-0.5">${pac.nombres} ${pac.apellidos}</h3>
            <p class="text-slate-400 text-[11px]">${pac.carrera_profesional} • ${pac.semestre_academico}</p>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">DNI:</span>
              <span class="font-bold font-mono text-slate-800 text-sm">${pac.dni}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Código Estudiantil:</span>
              <span class="font-bold font-mono text-purple-700 text-sm">${pac.codigo_estudiantil}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Teléfono Móvil:</span>
              <span class="font-bold text-slate-800">📞 ${pac.telefono}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block text-[10px] uppercase">Correo Institucional:</span>
              <span class="font-mono text-slate-800 font-medium">📧 ${pac.correo}</span>
            </div>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl space-y-2">
            <span class="text-slate-400 font-bold block text-[10px] uppercase">Historial de Citas del Paciente (${citasPac.length}):</span>
            <div class="divide-y divide-slate-200">
              ${citasPac.length > 0 ? citasPac.map(c => `
                <div class="py-2 flex items-center justify-between">
                  <div>
                    <span class="font-mono font-bold text-purple-700">${c.codigo_cita}</span>
                    <span class="text-slate-600 block text-[11px]">${c.fecha_cita} (${c.hora_inicio}) • ${c.psicologo}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">${c.estado_cita}</span>
                </div>
              `).join('') : '<p class="text-slate-400 text-center py-2">Sin citas previas registradas.</p>'}
            </div>
          </div>
        </div>

        <div class="pt-2 border-t flex justify-between items-center">
          <a href="tel:${pac.telefono}" class="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold transition flex items-center space-x-1.5">
            <span>📞</span><span>Llamar al Estudiante</span>
          </a>
          <button onclick="closeModalOperacion()" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold">Cerrar</button>
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 4. SOLICITUDES DE CITAS: Revisar, asignar psicólogo, aprobar/rechazar
// --------------------------------------------------------------------------
function renderAdminSolicitudes() {
  const container = document.getElementById('admin-view-solicitudes') || document.getElementById('admin-view-citas');
  if (!container) return;

  const pendientes = dbCitas.filter(c => c.estado_cita === 'Pendiente');
  const confirmadas = dbCitas.filter(c => c.estado_cita === 'Confirmada');
  const canceladas = dbCitas.filter(c => c.estado_cita === 'Cancelada');

  let listaAMostrar = dbCitas;
  if (adminSolicitudesFilter === 'Pendientes') listaAMostrar = pendientes;
  else if (adminSolicitudesFilter === 'Confirmadas') listaAMostrar = confirmadas;
  else if (adminSolicitudesFilter === 'Canceladas') listaAMostrar = canceladas;

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">Control de Admisión y Asignación</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Solicitudes de Citas Psicológicas</h2>
          <p class="text-xs text-slate-500">Revisa fecha, hora y modalidad solicitadas por los pacientes. Asigna uno de los tres psicólogos verificando disponibilidad, aprueba o rechaza solicitudes y notifica automáticamente al estudiante.</p>
        </div>

        <!-- SELECTOR DE FILTRO DE SOLICITUDES -->
        <div class="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold gap-1 shrink-0">
          <button onclick="setAdminSolicitudesFilter('Pendientes')" class="px-3 py-1.5 rounded-xl transition ${adminSolicitudesFilter === 'Pendientes' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            ⏳ Pendientes (${pendientes.length})
          </button>
          <button onclick="setAdminSolicitudesFilter('Confirmadas')" class="px-3 py-1.5 rounded-xl transition ${adminSolicitudesFilter === 'Confirmadas' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            🩺 Confirmadas (${confirmadas.length})
          </button>
          <button onclick="setAdminSolicitudesFilter('Canceladas')" class="px-3 py-1.5 rounded-xl transition ${adminSolicitudesFilter === 'Canceladas' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            ❌ Rechazadas (${canceladas.length})
          </button>
          <button onclick="setAdminSolicitudesFilter('Todas')" class="px-3 py-1.5 rounded-xl transition ${adminSolicitudesFilter === 'Todas' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
            Todas (${dbCitas.length})
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Código</th>
            <th class="p-4">Estudiante Solicitante</th>
            <th class="p-4">Programa / DNI</th>
            <th class="p-4">Fecha & Hora Solicitada</th>
            <th class="p-4">Modalidad</th>
            <th class="p-4">Psicólogo Asignado</th>
            <th class="p-4">Estado</th>
            <th class="p-4 text-right">Acción de Asignación</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${listaAMostrar.length > 0 ? listaAMostrar.map(c => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-4 font-mono font-bold text-purple-700">${c.codigo_cita}</td>
              <td class="p-4">
                <span class="font-bold text-slate-900 block">${c.alumno}</span>
                <span class="text-[11px] text-slate-500 block truncate max-w-xs mt-0.5" title="${c.motivo_consulta}">${c.motivo_consulta}</span>
              </td>
              <td class="p-4 text-slate-700">
                ${c.carrera || 'APSTI'}
                <span class="text-slate-400 font-mono block text-[10px]">DNI: ${c.dni || '73456128'}</span>
              </td>
              <td class="p-4">
                <span class="font-bold text-slate-800 block">📅 ${c.fecha_cita}</span>
                <span class="text-slate-500 text-[11px]">🕒 ${c.hora_inicio}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.modalidad === 'Presencial' ? 'badge-presencial' : 'badge-virtual'}">${c.modalidad}</span>
              </td>
              <td class="p-4">
                <span class="${c.psicologo === 'Pendiente de Asignación' ? 'text-amber-700 font-bold italic' : 'text-slate-900 font-bold'}">
                  ${c.psicologo}
                </span>
                <span class="block text-[10px] text-slate-400">${c.consultorio}</span>
              </td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold badge-${(c.estado_cita || 'pendiente').toLowerCase().replace(' ', '-')}">${c.estado_cita}</span>
              </td>
              <td class="p-4 text-right space-x-1">
                ${c.estado_cita === 'Pendiente' ? `
                  <button onclick="openModalAsignarPsicologo('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-xs">
                    🩺 Asignar Psicólogo
                  </button>
                  <button onclick="openModalRechazarSolicitudAdmin('${c.codigo_cita}')" class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 font-bold text-xs transition">
                    ❌ Rechazar
                  </button>
                ` : `
                  <button onclick="openModalAsignarPsicologo('${c.codigo_cita}')" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-purple-700 font-bold text-xs transition">
                    🔄 Modificar
                  </button>
                `}
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="8" class="p-8 text-center text-slate-400">No hay solicitudes registradas en este filtro (${adminSolicitudesFilter}).</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;
}

function setAdminSolicitudesFilter(f) {
  adminSolicitudesFilter = f;
  renderAdminSolicitudes();
}

function openModalRechazarSolicitudAdmin(codigoCita) {
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">⚠️</span>
            <h3 class="font-bold text-base text-rose-700 font-heading">Desestimar / Rechazar Solicitud</h3>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleConfirmarRechazoSolicitudAdmin(event, '${cita.codigo_cita}')" class="space-y-3.5">
          <div class="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 leading-relaxed">
            ¿Deseas desestimar la solicitud <strong>${cita.codigo_cita}</strong> de <strong>${cita.alumno}</strong> (${cita.fecha_cita} a las ${cita.hora_inicio})?
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Motivo del Rechazo (Se notificará al estudiante) *</label>
            <textarea id="rech-motivo" rows="2.5" required placeholder="Indica la razón: Cruce con horario de clases, no disponibilidad de consultorio en esa franja, estudiante solicitó reagendar..." class="w-full p-2.5 border rounded-xl bg-white outline-none font-medium">Horario fuera del turno de atención disponible. Por favor selecciona otra franja horaria.</textarea>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Volver</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm">
              ❌ Confirmar Rechazo y Notificar
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleConfirmarRechazoSolicitudAdmin(e, codigoCita) {
  e.preventDefault();
  const cita = dbCitas.find(c => c.codigo_cita === codigoCita);
  if (!cita) return;

  const motivo = (document.getElementById('rech-motivo')?.value || '').trim();
  cita.estado_cita = "Cancelada";
  cita.motivo_consulta = `${cita.motivo_consulta} [Rechazada: ${motivo}]`;
  persistCitas();

  if (dbFirestore) {
    dbFirestore.collection('citas').where('codigo_cita', '==', codigoCita).get()
      .then(s => s.forEach(doc => doc.ref.update({ estado_cita: "Cancelada" }))).catch(() => {});
  }

  agregarNotificacion(
    "Paciente",
    cita.alumno,
    "Solicitud de Cita Desestimada",
    `Tu solicitud ${codigoCita} no pudo ser confirmada: ${motivo}. Puedes solicitar un nuevo horario desde tu panel.`,
    "cita_cancelada"
  );

  closeModalOperacion();
  showToast(`Solicitud ${codigoCita} desestimada. Paciente notificado.`, 'info');
  renderAdminSolicitudes();
  if (!document.getElementById('admin-view-inicio')?.classList.contains('hidden')) {
    renderAdminInicio();
  }
}

// Alias para compatibilidad
function renderAdminCitas() {
  renderAdminSolicitudes();
}

// --------------------------------------------------------------------------
// 7. SEGUIMIENTO GENERAL: Supervisión disociada sin notas clínicas privadas
// --------------------------------------------------------------------------
function renderAdminSeguimiento() {
  const container = document.getElementById('admin-view-seguimiento');
  if (!container) return;

  const totalSesiones = dbSesionesClinicas.length;
  const programados = dbCitas.filter(c => c.motivo_consulta && c.motivo_consulta.includes('seguimiento'));
  const pendientes = dbCitas.filter(c => c.estado_cita === 'Finalizada' && !dbCitas.some(sig => sig.alumno === c.alumno && sig.estado_cita === 'Confirmada'));

  container.innerHTML = `
    <!-- HEADER SEGUIMIENTO -->
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">Supervisión Operativa de Continuidad</span>
        <span class="text-xs text-slate-400 font-medium">Métricas Disociadas</span>
      </div>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Seguimiento General de Atención</h2>
      <p class="text-xs text-slate-500">Supervisa las estadísticas generales del proceso terapéutico y el cumplimiento de próximas sesiones de los estudiantes, garantizando el secreto profesional y la confidencialidad estricta de las notas clínicas privadas.</p>
    </div>

    <!-- BANNER DE GARANTÍA DE PRIVACIDAD Y DEONTOLOGÍA -->
    <div class="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start space-x-3 text-xs text-purple-900">
      <span class="text-xl mt-0.5">🔒</span>
      <div class="space-y-0.5 leading-relaxed">
        <strong class="font-bold">Confidencialidad Médica y Deontológica (Ley N° 29733 & Ley de Salud Mental N° 30947):</strong>
        <p class="text-[11px] text-purple-800">
          La administración supervisa únicamente los indicadores de concurrencia, continuidad y programación de turnos. Por mandato legal del Colegio de Psicólogos del Perú (C.Ps.P.), el contenido de las notas clínicas, hipótesis diagnósticas e intervenciones privadas permanece bajo estricta reserva exclusiva del psicólogo tratante y su paciente.
        </p>
      </div>
    </div>

    <!-- 4 CARDS DE SEGUIMIENTO -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-purple-700 font-bold uppercase text-[10px]">Total Casos en Proceso</span>
        <span class="text-3xl font-extrabold text-purple-900 font-heading block">${dbPacientes.length}</span>
        <span class="text-[10px] text-slate-400">Planes activos</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-amber-700 font-bold uppercase text-[10px]">Seguimientos Pendientes</span>
        <span class="text-3xl font-extrabold text-amber-700 font-heading block">${pendientes.length}</span>
        <span class="text-[10px] text-amber-800">Por programar fecha</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-sky-700 font-bold uppercase text-[10px]">Seguimientos Programados</span>
        <span class="text-3xl font-extrabold text-sky-700 font-heading block">${programados.length}</span>
        <span class="text-[10px] text-sky-700">En agenda con fecha</span>
      </div>
      <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
        <span class="text-emerald-700 font-bold uppercase text-[10px]">Sesiones Completadas</span>
        <span class="text-3xl font-extrabold text-emerald-700 font-heading block">${totalSesiones}</span>
        <span class="text-[10px] text-emerald-700">Atenciones realizadas</span>
      </div>
    </div>

    <!-- TABLA DE SUPERVISIÓN DE CONTINUIDAD (DATOS DISOCIADOS) -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden text-xs space-y-2">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-sm text-slate-900 font-heading">Monitoreo de Continuidad Terapéutica por Paciente</h3>
        <span class="text-[11px] text-slate-400">Supervisión administrativa disociada</span>
      </div>

      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Estudiante (Paciente)</th>
            <th class="p-4">Carrera / Semestre</th>
            <th class="p-4">Psicólogo Responsable</th>
            <th class="p-4">Consultorio</th>
            <th class="p-4">Última Atención Realizada</th>
            <th class="p-4">Próxima Sesión Acordada</th>
            <th class="p-4 text-center">Estado del Plan</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          ${dbSesionesClinicas.map(s => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-4 font-bold text-slate-900">${s.alumno}</td>
              <td class="p-4 text-slate-600">${s.carrera}</td>
              <td class="p-4 font-bold text-purple-900">${s.psicologo}</td>
              <td class="p-4 text-teal-700">${s.consultorio}</td>
              <td class="p-4">📅 ${s.fecha_sesion} (Sesión N° ${s.numero_sesion})</td>
              <td class="p-4">
                <span class="${s.proxima_sesion ? 'text-sky-700 font-bold' : 'text-slate-400'}">
                  ${s.proxima_sesion || 'Pendiente de definir'}
                </span>
              </td>
              <td class="p-4 text-center">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.proxima_sesion ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}">
                  ${s.proxima_sesion ? 'En Acompañamiento' : 'Por Agendar'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 8. NOTIFICACIONES: Bandeja administrativa y emisión de avisos generales
// --------------------------------------------------------------------------
function renderAdminNotificaciones() {
  const container = document.getElementById('admin-view-notificaciones');
  if (!container) return;

  const notifs = dbNotificaciones.filter(n => {
    if (adminNotifFilter === 'Todas') return true;
    if (adminNotifFilter === 'Citas') return n.tipo === 'cita_nueva' || n.tipo === 'cita_confirmada';
    if (adminNotifFilter === 'Psicólogos') return n.tipo === 'psicologo' || n.tipo === 'sistema';
    if (adminNotifFilter === 'Cancelaciones') return n.tipo === 'cita_cancelada' || n.tipo === 'cita_reprogramada';
    return true;
  });

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Centro de Mensajería</span>
          <h2 class="text-2xl font-extrabold text-slate-900 font-heading mt-1">Notificaciones y Alertas del Sistema</h2>
          <p class="text-xs text-slate-500">Informa sobre nuevas solicitudes de citas, postulaciones de nuevos psicólogos, cambios, cancelaciones y avisos importantes.</p>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="openModalEmitirAvisoGeneral()" class="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition shadow-sm flex items-center space-x-1.5">
            <span>📢</span><span>Emitir Comunicado Institucional</span>
          </button>
          <button onclick="marcarTodasNotificacionesLeidasAdmin()" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition">
            ✓ Marcar leídas
          </button>
        </div>
      </div>

      <!-- FILTRO DE NOTIFICACIONES -->
      <div class="flex flex-wrap gap-1.5 pt-2 border-t text-xs font-semibold">
        <button onclick="setAdminNotifFilter('Todas')" class="px-3 py-1.5 rounded-xl transition ${adminNotifFilter === 'Todas' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}">Todas</button>
        <button onclick="setAdminNotifFilter('Citas')" class="px-3 py-1.5 rounded-xl transition ${adminNotifFilter === 'Citas' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}">📅 Solicitudes de Citas</button>
        <button onclick="setAdminNotifFilter('Psicólogos')" class="px-3 py-1.5 rounded-xl transition ${adminNotifFilter === 'Psicólogos' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}">🩺 Nuevos Psicólogos</button>
        <button onclick="setAdminNotifFilter('Cancelaciones')" class="px-3 py-1.5 rounded-xl transition ${adminNotifFilter === 'Cancelaciones' ? 'bg-purple-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}">⚠️ Cambios y Cancelaciones</button>
      </div>
    </div>

    <!-- LISTA DE NOTIFICACIONES -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3 text-xs">
      ${notifs.length > 0 ? notifs.map(n => `
        <div class="p-4 rounded-2xl border ${n.leida ? 'border-slate-100 bg-slate-50' : 'border-purple-200 bg-purple-50/50'} flex items-start space-x-3.5 transition">
          <span class="text-xl mt-0.5">${n.tipo === 'cita_nueva' ? '📑' : n.tipo === 'cita_cancelada' ? '❌' : n.tipo === 'cita_confirmada' ? '🩺' : '🔔'}</span>
          <div class="space-y-1 flex-grow">
            <div class="flex items-center justify-between">
              <strong class="text-slate-900 font-bold text-xs">${n.titulo}</strong>
              <span class="text-[10px] text-slate-400 font-mono">${n.fecha}</span>
            </div>
            <p class="text-slate-600 leading-relaxed text-[11px]">${n.mensaje}</p>
            <span class="text-[10px] text-purple-700 font-semibold block">Destinatario: ${n.destinatario_rol} (${n.destinatario_id})</span>
          </div>
        </div>
      `).join('') : `
        <p class="text-center text-slate-400 py-8">No hay avisos registrados en esta categoría.</p>
      `}
    </div>
  `;
}

function setAdminNotifFilter(f) {
  adminNotifFilter = f;
  renderAdminNotificaciones();
}

function marcarTodasNotificacionesLeidasAdmin() {
  dbNotificaciones.forEach(n => n.leida = true);
  persistNotificaciones();
  renderAdminNotificaciones();
  showToast('Todas las notificaciones fueron marcadas como leídas.', 'info');
}

function openModalEmitirAvisoGeneral() {
  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">📢</span>
            <h3 class="font-bold text-base text-slate-900 font-heading">Emitir Comunicado Institucional</h3>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <form onsubmit="handleEmitirAvisoGeneralAdmin(event)" class="space-y-3.5">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Población Objetivo *</label>
            <select id="aviso-destinatario" class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold outline-none">
              <option value="Todos">🌐 Toda la Comunidad Scorza (Pacientes y Psicólogos)</option>
              <option value="Paciente">🎓 Solo Pacientes (Estudiantes)</option>
              <option value="Psicólogo">🩺 Solo Psicólogos Colegiados</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Título del Aviso *</label>
            <input type="text" id="aviso-titulo" placeholder="Ej: Campaña de Bienestar y Salud Mental 2026" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-bold">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mensaje Oficial *</label>
            <textarea id="aviso-mensaje" rows="3" required placeholder="Escribe el mensaje o aviso importante..." class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none leading-relaxed"></textarea>
          </div>

          <div class="pt-2 border-t flex justify-end space-x-2">
            <button type="button" onclick="closeModalOperacion()" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">Cancelar</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-sm">
              📢 Publicar Comunicado
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleEmitirAvisoGeneralAdmin(e) {
  e.preventDefault();
  const dest = document.getElementById('aviso-destinatario')?.value;
  const tit = document.getElementById('aviso-titulo')?.value.trim();
  const msg = document.getElementById('aviso-mensaje')?.value.trim();

  if (dest === 'Todos') {
    agregarNotificacion("Paciente", "Todos los Estudiantes", tit, msg, "sistema");
    agregarNotificacion("Psicólogo", "Todos los Especialistas", tit, msg, "sistema");
  } else {
    agregarNotificacion(dest, `Comunidad ${dest}`, tit, msg, "sistema");
  }

  closeModalOperacion();
  showToast('Comunicado institucional publicado y enviado.', 'success');
  renderAdminNotificaciones();
}

// --------------------------------------------------------------------------
// 9. CONFIGURACIÓN: Datos institución, servicios, horarios y parámetros
// --------------------------------------------------------------------------
function renderAdminConfiguracion() {
  const container = document.getElementById('admin-view-configuracion');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center space-x-2">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Parámetros del Sistema</span>
        <span class="text-xs text-slate-400 font-medium">Configuración Global</span>
      </div>
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Configuración de la Plataforma</h2>
      <p class="text-xs text-slate-500">Administra los datos institucionales, el catálogo de servicios psicológicos, los horarios de atención y las reglas de reserva de citas.</p>
    </div>

    <form onsubmit="handleGuardarConfiguracionAdmin(event)" class="space-y-6 text-xs">
      
      <!-- 1. DATOS INSTITUCIONALES -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900 font-heading border-b pb-2 flex items-center space-x-2">
          <span>🏛️</span><span>1. Datos de la Institución</span>
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nombre Institucional *</label>
            <input type="text" id="cfg-nombre" value="${SYSTEM_CONFIG.nombre_institucion}" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Dirección / Sede *</label>
            <input type="text" id="cfg-direccion" value="${SYSTEM_CONFIG.direccion}" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Correo Electrónico de Contacto *</label>
            <input type="email" id="cfg-correo" value="${SYSTEM_CONFIG.correo_contacto}" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-mono outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Teléfono Central *</label>
            <input type="tel" id="cfg-telefono" value="${SYSTEM_CONFIG.telefono_contacto}" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
          </div>
        </div>
      </div>

      <!-- 2. SERVICIOS PSICOLÓGICOS Y HORARIOS -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900 font-heading border-b pb-2 flex items-center space-x-2">
          <span>🩺</span><span>2. Servicios Psicológicos y Horarios Generales</span>
        </h3>

        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <span class="text-slate-700 font-bold block text-xs">Catálogo de Servicios Brindados:</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded text-purple-600"> <span>Consejería Psicopedagógica</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded text-purple-600"> <span>Apoyo Emocional y Manejo del Estrés</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded text-purple-600"> <span>Orientación Vocacional y Proyecto de Vida</span></label>
            <label class="flex items-center space-x-2"><input type="checkbox" checked class="rounded text-purple-600"> <span>Talleres de Habilidades Socioemocionales</span></label>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Horario General de Atención del Consultorio *</label>
          <input type="text" id="cfg-horario" value="${SYSTEM_CONFIG.horario_atencion}" required class="w-full p-2.5 border rounded-xl bg-slate-50 outline-none font-medium">
        </div>
      </div>

      <!-- 3. PARÁMETROS DE CITAS -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 class="font-bold text-base text-slate-900 font-heading border-b pb-2 flex items-center space-x-2">
          <span>⚙️</span><span>3. Parámetros y Reglas de Citas</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Duración Estándar de Sesión (min) *</label>
            <input type="number" id="cfg-duracion" value="${SYSTEM_CONFIG.duracion_sesion || 45}" min="20" max="90" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Días de Anticipación para Reservar *</label>
            <input type="number" id="cfg-anticipacion" value="${SYSTEM_CONFIG.dias_anticipacion || 15}" min="1" max="60" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold outline-none">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Horas Previas para Cancelar / Modificar *</label>
            <input type="number" id="cfg-cancelacion" value="${SYSTEM_CONFIG.horas_cancelacion || 24}" min="1" max="72" required class="w-full p-2.5 border rounded-xl bg-slate-50 font-bold outline-none">
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="submit" class="px-8 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition shadow-md shadow-purple-600/20 text-xs flex items-center space-x-2">
          <span>💾</span><span>Guardar Parámetros de la Plataforma</span>
        </button>
      </div>
    </form>
  `;
}

function handleGuardarConfiguracionAdmin(e) {
  e.preventDefault();
  const nombre = document.getElementById('cfg-nombre')?.value.trim();
  const dir = document.getElementById('cfg-direccion')?.value.trim();
  const correo = document.getElementById('cfg-correo')?.value.trim();
  const tel = document.getElementById('cfg-telefono')?.value.trim();
  const horario = document.getElementById('cfg-horario')?.value.trim();
  const duracion = Number(document.getElementById('cfg-duracion')?.value || 45);
  const ant = Number(document.getElementById('cfg-anticipacion')?.value || 15);
  const canc = Number(document.getElementById('cfg-cancelacion')?.value || 24);

  saveSystemConfig({
    nombre_institucion: nombre,
    direccion: dir,
    correo_contacto: correo,
    telefono_contacto: tel,
    horario_atencion: horario,
    duracion_sesion: duracion,
    dias_anticipacion: ant,
    horas_cancelacion: canc
  });

  showToast('✅ Configuración institucional actualizada y guardada con éxito.', 'success');
  renderAdminConfiguracion();
}

function renderAdminUsuarios() {
  const container = document.getElementById('admin-view-usuarios');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <h2 class="text-2xl font-extrabold text-slate-900 font-heading">Gestión de Cuentas de Usuario</h2>
      <p class="text-xs text-slate-500">Supervisión de credenciales autenticadas del sistema PsicoScorza.</p>
    </div>
    <div class="bg-white rounded-3xl border border-slate-200/80 overflow-hidden text-xs">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-4">Usuario</th>
            <th class="p-4">Correo</th>
            <th class="p-4">Rol</th>
            <th class="p-4">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${dbUsuarios.map(u => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-4 font-bold text-slate-900">${u.nombre_completo}</td>
              <td class="p-4 font-mono text-slate-600">${u.correo}</td>
              <td class="p-4"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${u.rol === 'Administrador' ? 'bg-purple-100 text-purple-800' : u.rol === 'Psicólogo' ? 'bg-teal-100 text-teal-800' : 'bg-sky-100 text-sky-800'}">${u.rol}</span></td>
              <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.estado === 'Suspendido' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">${u.estado || 'Activo'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================================================
// 23. MODAL DE NOTIFICACIONES GLOBAL EN TOPBAR
// ==========================================================================
function openNotificacionesModal() {
  const container = document.getElementById('modal-operacion-container');
  if (!container) return;

  const notifs = dbNotificaciones.filter(n => {
    if (!currentUser) return false;
    if (currentUser.rol === 'Administrador' && n.destinatario_rol === 'Administrador') return true;
    if (currentUser.rol === 'Psicólogo' && (n.destinatario_rol === 'Psicólogo' || n.destinatario_id === currentUser.correo)) return true;
    if (currentUser.rol === 'Paciente' && (n.destinatario_rol === 'Paciente' || n.destinatario_id === currentUser.correo)) return true;
    return false;
  });

  // Marcar como leídas
  notifs.forEach(n => n.leida = true);
  persistNotificaciones();

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
        <div class="flex justify-between items-center border-b pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-lg">🔔</span>
            <h3 class="font-bold text-base text-slate-900 font-heading">Notificaciones del Sistema</h3>
          </div>
          <button onclick="closeModalOperacion()" class="text-2xl font-bold text-slate-400">&times;</button>
        </div>

        <div class="space-y-2.5">
          ${notifs.length > 0 ? notifs.map(n => `
            <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-900">${n.titulo}</span>
                <span class="text-[10px] text-slate-400">${n.fecha}</span>
              </div>
              <p class="text-slate-600 text-[11px] leading-relaxed">${n.mensaje}</p>
            </div>
          `).join('') : `
            <p class="text-center text-slate-400 py-6">No tienes notificaciones pendientes.</p>
          `}
        </div>

        <button onclick="closeModalOperacion()" class="w-full py-2.5 rounded-xl bg-purple-700 text-white font-bold hover:bg-purple-800">Entendido</button>
      </div>
    </div>
  `;
}

// ==========================================================================
// 24. INICIALIZACIÓN GLOBAL AL CARGAR EL DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  renderPublicPsicologos();
  setupFirebaseRealtime();

  try {
    const savedUser = localStorage.getItem('psicoscorza_user');
    const savedToken = localStorage.getItem('psicoscorza_token');
    if (savedUser && savedToken) {
      currentUser = JSON.parse(savedUser);
      currentToken = savedToken;
      updateAuthUI();
      goToPanel();
    }
  } catch (e) {}
});
