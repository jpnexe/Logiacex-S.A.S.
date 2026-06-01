/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArchitectureProposal } from './types';

export const ARCHITECTURE_DATA: ArchitectureProposal = {
  frontend: `**Frontend Stack:**
- **React (v19) + TypeScript:** Componentes funcionales eficientes y tipado estricto.
- **Vite:** Empaquetador ultra-rápido configurado con server local.
- **Tailwind CSS (v4):** Estilizado responsivo con soporte nativo de variables CSS y Glassmorphism mediante efectos de desenfoque de fondo (\`backdrop-blur\`).
- **Framer Motion / Motion:** Animaciones de entrada fluidas, micro-interacciones sutiles y transiciones de estado de alta gama.
- **Lucide React:** Set consistente de íconos vectoriales modernos de alta legibilidad.
- **QRCode HTML5 Renderer:** Renderizado local dinámico de códigos QR para tickets.`,

  backend: `**Backend Stack:**
- **Node.js + Express + TypeScript:** Servidor escalable con enrutado ágil para APIs RESTful.
- **TSX & ESBuild:** Transpilación y ejecución directa en desarrollo y empaquetado de alto rendimiento para producción.
- **Sistema de Persistencia de Archivos:** Base de datos estructurada en formato JSON relacional con lecturas y escrituras atómicas en disco, garantizando persistencia durable entre reinicios de contenedores Cloud Run sin añadir latencia de red.
- **Logger de Auditoría:** Registro transaccional de operaciones operativas (RBAC / Logs de auditoría).`,

  database: `**Modelo de Base de Datos Relacional Propuesto:**
El sistema sigue un modelo relacional de tercera forma normal (3NF) que garantiza la integridad referencial de los datos mediante llaves foráneas y restricciones lógicas.

Las tablas clave son:
1. **roles**: Define los roles de acceso (Administrador y Cliente/Visitante) en base al control operativo RBAC.
2. **users**: Almacena credenciales y asignación de roles.
3. **appointments**: Almacena las citas con metadata del cliente potencial, estado operacional, detalles del QR y asignación de atención comercial.
4. **audit_logs**: Tabla de logs de auditoría transaccionales para monitorear cada operación de cambio de rol, aprobación o reagendamiento de citas.`,

  sqlScript: `-- ==========================================
-- SCRIPT DE BASE DE DATOS / MIGRACIÓN SQL (POSTGRESQL / MYSQL COMPATIBLE)
-- Empresa: Logiacex S.A.S. - Sistema de Citas & Leads
-- ==========================================

-- 1. Creación de Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Creación de Tabla de Usuarios (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Almacenado con hash seguro (bcrypt)
    role_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- 3. Creación de Tabla de Citas (Appointments / Leads)
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(50) PRIMARY KEY,
    visitor_name VARCHAR(150) NOT NULL,
    visitor_phone VARCHAR(50) NOT NULL,
    visitor_email VARCHAR(150) NOT NULL,
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'RESCHEDULED', 'REJECTED')),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    assigned_user_id VARCHAR(50),
    qr_code_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Creación de Tabla de Logs de Auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    actor VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATOS SEMILLA / INICIALIZACIÓN
-- ==========================================

-- Insertar Roles predefinidos
INSERT INTO roles (id, name, description) VALUES
('ADMIN', 'Administrador', 'Acceso completo al control de citas, asignación y KPIs comerciales.'),
('VISITOR', 'Visitante', 'Acceso simplificado para auto-agendamiento de citas y leads.');

-- Insertar Usuario Administrador de Prueba
INSERT INTO users (id, name, email, password_hash, role_id) VALUES
('admin-01', 'Coordinador Comercial Logiacex', 'admin@logiacex.com', '$2b$10$EixZaYVK1fsY1W9SP2.79oFwGLyiXzI9S5V3Z9O6zW6kXv2t4V3T.', 'ADMIN');

-- Índices de optimización de búsquedas para conversión de leads
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_email ON appointments(visitor_email);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);`,

  endpoints: [
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Calcula y devuelve métricas consolidadas (KPIs) para el Dashboard, incluyendo tasa de conversión y acumulados históricos.',
      response: 'DashboardStats (JSON object)'
    },
    {
      method: 'GET',
      path: '/api/appointments',
      description: 'Obtiene el listado completo de citas recibidas en el sistema (Ordenadas por fecha de creación desc).',
      response: 'Appointment[] (JSON list)'
    },
    {
      method: 'POST',
      path: '/api/appointments',
      description: 'Crea una nueva cita desde el módulo de visitante. Genera el identificador QR y la metadata cifrada.',
      payload: '{ visitorName: string, visitorPhone: string, visitorEmail: string, notes: string, date: string, time: string }',
      response: 'Appointment (La cita creada con QR)'
    },
    {
      method: 'PATCH',
      path: '/api/appointments/:id',
      description: 'Modifica el estado de una cita (Aprobar, Reagendar, Rechazar) y registra la transacción en auditoría.',
      payload: '{ status: AppointmentStatus, date?: string, time?: string, notes?: string }',
      response: 'Appointment (La cita actualizada)'
    },
    {
      method: 'GET',
      path: '/api/logs',
      description: 'Recupera el historial completo de auditoría operativa para control de cumplimiento.',
      response: 'AuditLog[] (JSON list)'
    }
  ]
};
