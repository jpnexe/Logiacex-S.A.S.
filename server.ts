/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Appointment, AppointmentStatus, AuditLog, DashboardStats } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate unique ID helper
function generateId(): string {
  return 'LCX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Seed Data helper
function getSeedData() {
  const appointments: Appointment[] = [
    {
      id: 'LCX-B94A1F',
      visitorName: 'Jaider Silva Guerrero',
      visitorPhone: '+57 301 234 5678',
      visitorEmail: 'jaider.sg6003@gmail.com',
      notes: 'Interés en consultoría logística de importación y optimización de cadena de suministro.',
      status: 'APPROVED',
      date: '2026-06-02',
      time: '14:30',
      assignedUser: 'Coordinador Comercial Logiacex',
      createdAt: '2026-05-28T10:15:00Z',
      qrCodeData: 'LCX-B94A1F|Jaider Silva Guerrero|2026-06-02-14:30|APPROVED'
    },
    {
      id: 'LCX-C10A92',
      visitorName: 'Sofía Martínez Rincón',
      visitorPhone: '+57 312 987 6543',
      visitorEmail: 'sofia.martinez@gmail.com',
      notes: 'Solicitud de presupuesto de fletes internacionales de carga consolidada LCL.',
      status: 'PENDING',
      date: '2026-06-04',
      time: '09:00',
      createdAt: '2026-05-30T16:22:00Z',
      qrCodeData: 'LCX-C10A92|Sofía Martínez Rincón|2026-06-04-09:00|PENDING'
    },
    {
      id: 'LCX-R78C21',
      visitorName: 'Carlos Mario Restrepo',
      visitorPhone: '+57 320 445 1251',
      visitorEmail: 'carlos.mario@co-industrias.com',
      notes: 'Asesoría en aduanas terrestres y cruce de fronteras Colombo-Venezolanas.',
      status: 'RESCHEDULED',
      date: '2026-06-05',
      time: '11:00',
      assignedUser: 'Coordinador Comercial Logiacex',
      createdAt: '2026-05-25T08:44:00Z',
      qrCodeData: 'LCX-R78C21|Carlos Mario Restrepo|2026-06-05-11:00|RESCHEDULED'
    },
    {
      id: 'LCX-T89D42',
      visitorName: 'Empresa Alimentos del Caribe',
      visitorPhone: '+57 300 555 4321',
      visitorEmail: 'contacto@alimentoscaribe.co',
      notes: 'Reunión exploratoria para distribución nacional y almacenamiento en frío.',
      status: 'APPROVED',
      date: '2026-06-03',
      time: '16:00',
      assignedUser: 'Coordinador Comercial Logiacex',
      createdAt: '2026-05-20T11:00:00Z',
      qrCodeData: 'LCX-T89D42|Empresa Alimentos del Caribe|2026-06-03-16:00|APPROVED'
    },
    {
      id: 'LCX-E56Y12',
      visitorName: 'Andrés Felipe Valencia',
      visitorPhone: '+57 315 222 9911',
      visitorEmail: 'felipe.valencia@logisticaglobal.com',
      notes: 'Inspección previa en puerto de Cartagena.',
      status: 'REJECTED',
      date: '2026-05-29',
      time: '15:00',
      assignedUser: 'Coordinador Comercial Logiacex',
      createdAt: '2026-05-21T09:30:00Z',
      qrCodeData: 'LCX-E56Y12|Andrés Felipe Valencia|2026-05-29-15:00|REJECTED'
    },
    {
      id: 'LCX-H33M88',
      visitorName: 'Diana Carolina Torres',
      visitorPhone: '+57 318 666 4455',
      visitorEmail: 'diana.torres@importacionesdt.com',
      notes: 'Trámite urgente de licencias de importación ante el VUCE.',
      status: 'APPROVED',
      date: '2026-06-01',
      time: '10:30',
      assignedUser: 'Coordinador Comercial Logiacex',
      createdAt: '2026-05-27T14:10:00Z',
      qrCodeData: 'LCX-H33M88|Diana Carolina Torres|2026-06-01-10:30|APPROVED'
    }
  ];

  const logs: AuditLog[] = [
    {
      id: generateId(),
      actor: 'Sistema',
      action: 'Sembrado de Base de Datos',
      details: 'Base de datos inicializada con 6 registros para fines demostrativos de Logiacex S.A.S.',
      timestamp: '2026-05-31T23:00:00Z'
    },
    {
      id: generateId(),
      actor: 'Coordinador Comercial Logiacex',
      action: 'Aprobación de Cita',
      details: 'Cita LCX-B94A1F de Jaider Silva Guerrero aprobada exitosamente y asignada a seguimiento.',
      timestamp: '2026-05-28T14:00:00Z'
    }
  ];

  return { appointments, logs };
}

// Read database from file or generate initial database
function readDb(): { appointments: Appointment[]; logs: AuditLog[] } {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading DB, re-initializing...', error);
  }
  const seed = getSeedData();
  writeDb(seed);
  return seed;
}

// Write database to file
function writeDb(data: { appointments: Appointment[]; logs: AuditLog[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing DB to file', error);
  }
}

// Helper to append action to audit log
function addAuditLog(actor: string, action: string, details: string) {
  const db = readDb();
  const log: AuditLog = {
    id: generateId(),
    actor,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.logs.unshift(log); // Newer logs first
  writeDb(db);
}

// --- API ENDPOINTS ---

// 1. GET Stats (Dashboard KPIs)
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const appointments = db.appointments;

  const totalLeads = appointments.length;
  const pendingValidation = appointments.filter(a => a.status === 'PENDING').length;
  const approvedLeads = appointments.filter(a => a.status === 'APPROVED').length;
  const rescheduledLeads = appointments.filter(a => a.status === 'RESCHEDULED').length;
  const rejectedLeads = appointments.filter(a => a.status === 'REJECTED').length;

  const conversionRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;

  // Let's create beautiful progressive trends for the months
  // We've seed dates in April, May and June 2026
  const monthlyProgress = [
    { month: 'Marzo', received: 12, converted: 8 },
    { month: 'Abril', received: 18, converted: 12 },
    { month: 'Mayo', received: totalLeads, converted: approvedLeads }
  ];

  const stats: DashboardStats = {
    totalLeads,
    pendingValidation,
    approvedLeads,
    conversionRate,
    byStatus: {
      PENDING: pendingValidation,
      APPROVED: approvedLeads,
      RESCHEDULED: rescheduledLeads,
      REJECTED: rejectedLeads
    },
    monthlyProgress
  };

  res.json(stats);
});

// 2. GET Appointments
app.get('/api/appointments', (req, res) => {
  const db = readDb();
  res.json(db.appointments);
});

// 3. POST Create Appointment
app.post('/api/appointments', (req, res) => {
  const { visitorName, visitorPhone, visitorEmail, notes, date, time } = req.body;

  if (!visitorName || !visitorPhone || !visitorEmail || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos mandatorios para estructurar la cita.' });
  }

  const db = readDb();
  const uid = generateId();

  const newAppointment: Appointment = {
    id: uid,
    visitorName,
    visitorPhone,
    visitorEmail,
    notes: notes || 'Sin notas adicionales.',
    status: 'PENDING',
    date,
    time,
    createdAt: new Date().toISOString(),
    qrCodeData: `${uid}|${visitorName}|${date}-${time}|PENDING`
  };

  db.appointments.unshift(newAppointment); // Newer first
  writeDb(db);

  addAuditLog(
    'Visitante Externo',
    'Creación de Cita',
    `Nueva cita pre-registrada para ${visitorName} (${visitorEmail}) programada para el ${date} a las ${time}. ID: ${uid}`
  );

  res.status(201).json(newAppointment);
});

// 4. PATCH Update Appointment (Status approval, rescheduling, and rejection)
app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status, date, time, notes, assignedUser } = req.body;

  const db = readDb();
  const index = db.appointments.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cita no encontrada.' });
  }

  const appt = db.appointments[index];
  const oldStatus = appt.status;

  if (status) {
    appt.status = status as AppointmentStatus;
  }
  if (date) {
    appt.date = date;
  }
  if (time) {
    appt.time = time;
  }
  if (notes) {
    appt.notes = notes;
  }
  if (assignedUser) {
    appt.assignedUser = assignedUser;
  } else if (!appt.assignedUser) {
    appt.assignedUser = 'Coordinador Comercial Logiacex';
  }

  // Update dynamic QR data reflecting state changes
  appt.qrCodeData = `${appt.id}|${appt.visitorName}|${appt.date}-${appt.time}|${appt.status}`;

  db.appointments[index] = appt;
  writeDb(db);

  addAuditLog(
    assignedUser || 'Coordinador Comercial Logiacex',
    `Cambio de Estado (${oldStatus} -> ${status})`,
    `Cita ${id} de ${appt.visitorName} actualizada. Fecha: ${appt.date} ${appt.time}. Observación: ${notes || 'Estado modificado.'}`
  );

  res.json(appt);
});

// 5. GET Audit Logs
app.get('/api/logs', (req, res) => {
  const db = readDb();
  res.json(db.logs);
});

// 6. POST Reset DB to seed state
app.post('/api/reset', (req, res) => {
  const seed = getSeedData();
  writeDb(seed);
  addAuditLog('Administrador', 'Anulación y Reinicio', 'Base de datos restaurada al estado de fábrica.');
  res.json({ message: 'Base de datos restaurada con éxito.' });
});

// --- PLATFORM DEV INTEGRATION & CO-SERVING VITE ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server executing successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
