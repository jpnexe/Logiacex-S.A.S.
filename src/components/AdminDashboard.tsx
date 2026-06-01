/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, RefreshCw, Eye, Search, Filter, ShieldCheck, FileSpreadsheet, Activity, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, DashboardStats, AuditLog, AppointmentStatus } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
  stats: DashboardStats;
  onRefreshData: () => void;
}

export default function AdminDashboard({ onBack, stats, onRefreshData }: AdminDashboardProps) {
  // Inbox search and filter options
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Interactive Rescheduling States
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // Tab section state (Appointments List vs Audit Logs and Specs)
  const [activeTab, setActiveTab] = useState<'INBOX' | 'AUDIT_LOGS'>('INBOX');

  // Load all dashboard records
  const loadRecords = async () => {
    setLoading(true);
    try {
      const respAppts = await fetch('/api/appointments');
      const respLogs = await fetch('/api/logs');
      if (respAppts.ok && respLogs.ok) {
        setAppointments(await respAppts.json());
        setAuditLogs(await respLogs.json());
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Handle direct actions
  const handleUpdateStatus = async (id: string, status: AppointmentStatus, date?: string, time?: string, notes?: string) => {
    setSavingAction(true);
    try {
      const resp = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          date,
          time,
          notes: notes || `Operación comercial llevada a cabo. Cita configurada como ${status}.`,
          assignedUser: 'Coordinador Comercial Logiacex'
        })
      });

      if (resp.ok) {
        await loadRecords();
        onRefreshData(); // updates top KPI count
        setReschedulingAppt(null); // close reschedule drawer if open
        setActionNotes('');
      } else {
        alert('Ocurrió un error al intentar actualizar el estado de la cita.');
      }
    } catch (e) {
      console.error('Error updating status', e);
    } finally {
      setSavingAction(false);
    }
  };

  // Factory reset database
  const handleResetDatabase = async () => {
    if (!window.confirm('¿Está seguro de restaurar el estado original del sistema Logiacex? Esta acción reiniciará los registros.')) {
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/reset', { method: 'POST' });
      if (resp.ok) {
        await loadRecords();
        onRefreshData();
      }
    } catch (e) {
      console.error('Error resetting db', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search computation
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      a.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.visitorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.visitorPhone.includes(searchTerm) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'ALL' || a.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats for SVG Gauge/Line graphs
  const statsApproved = stats.byStatus.APPROVED;
  const statsPending = stats.byStatus.PENDING;
  const statsRescheduled = stats.byStatus.RESCHEDULED;
  const statsRejected = stats.byStatus.REJECTED;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8" id="admin-dashboard-root">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8" id="admin-header-controls">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5" id="adm-main-tit">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Panel Ejecutivo Logiacex S.A.S.
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-1" id="adm-main-sub">
            Mesa centralizada para la captación, evaluación, agendamiento de citas y conversión comercial de clientes potenciales.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto" id="adm-header-buttons">
          <button
            onClick={loadRecords}
            disabled={loading}
            id="btn-refresh-adm"
            className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-150/40 dark:hover:bg-zinc-800/40 border border-gray-200/20 active:scale-95 transition-all cursor-pointer"
            title="Recargar Información"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleResetDatabase}
            id="btn-factory-reset"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-orange-600 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 transition-all cursor-pointer"
          >
            🔄 Resetear Base de Datos
          </button>

          <button
            onClick={onBack}
            id="btn-back-adm"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            Volver a Portada
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="kpis-section">
        {/* Total Captured Leads Card */}
        <div className="p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10" id="kpi-leads">
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Leads Recibidos</span>
          <div className="flex items-baseline gap-2 mt-2" id="kpi-val-leads">
            <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{stats.totalLeads}</span>
            <span className="text-xs text-gray-400">Prospectos totales</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Canalizado desde el formulario de visitante.</p>
        </div>

        {/* Lead Conversion Rate */}
        <div className="p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10" id="kpi-conversion">
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Tasa de Conversión</span>
          <div className="flex items-baseline gap-2 mt-2" id="kpi-val-conv">
            <span className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.conversionRate}%</span>
            <span className="text-xs text-emerald-500">↑ Alto rendimiento</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Efectividad de citas aprobadas sobre recibidas.</p>
        </div>

        {/* Pending Validation */}
        <div className="p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10" id="kpi-pending">
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Citas Pendientes</span>
          <div className="flex items-baseline gap-2 mt-2" id="kpi-val-pending">
            <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">{stats.pendingValidation}</span>
            <span className="text-xs text-gray-400">Por validar</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Requiere revisión y contacto prioritario.</p>
        </div>

        {/* Approved Leads */}
        <div className="p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10" id="kpi-approved">
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Convertidos (Aprobadas)</span>
          <div className="flex items-baseline gap-2 mt-2" id="kpi-val-appr">
            <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">{stats.approvedLeads}</span>
            <span className="text-xs text-gray-400">Citas en agenda</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Asesoría comercial en aduanas/puertos activa.</p>
        </div>
      </div>

      {/* Visual Analytics with Glassmorphism SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8" id="analytics-section">
        
        {/* Left Interactive SVG Chart - Funnel and Volume Conversion Trend */}
        <div className="lg:col-span-8 p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 flex flex-col justify-between" id="chart-volume">
          <div className="mb-4" id="cv-header">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rendimiento Histórico y Filtro de Conversión</h4>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Flujo Mensual: Citas Recibidas vs Cerradas</h3>
          </div>

          {/* Clean Interactive SVG Multi-line Chart representing Recharts but fully responsive and bulletproof */}
          <div className="mt-2 w-full h-56 relative flex items-center justify-center bg-gray-550/5 rounded-xl border border-gray-200/10" id="svg-chart-container">
            <svg viewBox="0 0 500 220" className="w-full h-full text-xs font-mono" id="canvas-multi-chart">
              {/* Grid Lines */}
              <line x1="50" y1="30" x2="450" y2="30" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3,3" />
              <line x1="50" y1="80" x2="450" y2="80" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3,3" />
              <line x1="50" y1="130" x2="450" y2="130" stroke="rgba(148, 163, 184, 0.1)" strokeDasharray="3,3" />
              <line x1="50" y1="180" x2="450" y2="180" stroke="rgba(148, 163, 184, 0.2)" />

              {/* X Axes labels */}
              <text x="70" y="200" fill="currentColor" textAnchor="middle" className="text-[10px] text-gray-400">Marzo</text>
              <text x="250" y="200" fill="currentColor" textAnchor="middle" className="text-[10px] text-gray-400">Abril</text>
              <text x="430" y="200" fill="currentColor" textAnchor="middle" className="text-[10px] text-gray-400">Mayo (Actual)</text>

              {/* Y Axes labels */}
              <text x="35" y="34" fill="currentColor" textAnchor="end" className="text-[9px] text-gray-400">20 Citas</text>
              <text x="35" y="84" fill="currentColor" textAnchor="end" className="text-[9px] text-gray-400">10 Citas</text>
              <text x="35" y="134" fill="currentColor" textAnchor="end" className="text-[9px] text-gray-400">5 Citas</text>
              <text x="35" y="184" fill="currentColor" textAnchor="end" className="text-[9px] text-gray-400">0 Citas</text>

              {/* Received Line Gradient Area (Blue) */}
              <path d="M 70 140 L 250 90 L 430 40 L 430 180 L 70 180 Z" fill="url(#blue-area-gradient)" opacity="0.1" />

              {/* Converted Line Gradient Area (Emerald) */}
              <path d="M 70 155 L 250 110 L 430 75 L 430 180 L 70 180 Z" fill="url(#green-area-gradient)" opacity="0.1" />

              {/* Definition of gradients */}
              <defs>
                <linearGradient id="blue-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="green-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Received Line (Blue) */}
              <path d="M 70 140 L 250 90 L 430 40" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              <circle cx="70" cy="140" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="250" cy="90" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="430" cy="40" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />

              {/* Converted Line (Emerald) */}
              <path d="M 70 155 L 250 110 L 430 75" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <circle cx="70" cy="155" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="250" cy="110" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="430" cy="75" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

              {/* Data tooltips inside SVG */}
              <text x="70" y="125" fill="#3b82f6" textAnchor="middle" fontSize="10" fontWeight="bold">12</text>
              <text x="70" y="172" fill="#10b981" textAnchor="middle" fontSize="10" fontWeight="bold">8</text>

              <text x="250" y="75" fill="#3b82f6" textAnchor="middle" fontSize="10" fontWeight="bold">18</text>
              <text x="250" y="128" fill="#10b981" textAnchor="middle" fontSize="10" fontWeight="bold">12</text>

              <text x="430" y="25" fill="#3b82f6" textAnchor="middle" fontSize="10" fontWeight="bold">{stats.totalLeads}</text>
              <text x="430" y="93" fill="#10b981" textAnchor="middle" fontSize="10" fontWeight="bold">{stats.approvedLeads}</text>
            </svg>
          </div>

          <div className="mt-3 flex gap-6 text-xs text-gray-500 font-medium justify-center" id="chart-legend">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              Citas / Leads Recibidos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Diagnósticos Aprobados (Cerrados)
            </span>
          </div>
        </div>

        {/* Right Gauge Widget - Status Distribution breakdown */}
        <div className="lg:col-span-4 p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 flex flex-col justify-between" id="chart-distribution">
          <div id="dist-header">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Distribución</h4>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estado Operativo de Citas</h3>
          </div>

          {/* Dynamic SVG Donut Chart representing statuses */}
          <div className="flex justify-center my-4 relative" id="svg-donut-container">
            <svg viewBox="0 0 160 160" className="w-40 h-40">
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="18" />
              
              {/* Sliced calculation based on dynamic counts */}
              {/* For simple demo representation, we can draw beautifully static or dynamic proportional dash arrays */}
              {/* APPROVED, PENDING, RESCHEDULED, REJECTED */}
              {/* Total leads = 6 base, let's create high quality visuals */}
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#10b981" strokeWidth="18"
                strokeDasharray={`${statsApproved * 25} 377`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f59e0b" strokeWidth="18"
                strokeDasharray={`${statsPending * 25} 377`}
                strokeDashoffset={`-${statsApproved * 25}`}
                strokeLinecap="round"
              />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#6366f1" strokeWidth="18"
                strokeDasharray={`${statsRescheduled * 25} 377`}
                strokeDashoffset={`-${(statsApproved + statsPending) * 25}`}
                strokeLinecap="round"
              />
              <circle cx="80" cy="80" r="60" fill="transparent" stroke="#ef4444" strokeWidth="18"
                strokeDasharray={`${statsRejected * 25} 377`}
                strokeDashoffset={`-${(statsApproved + statsPending + statsRescheduled) * 25}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center" id="donut-labels">
              <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalLeads}</span>
              <span className="text-[10px] text-gray-400 font-medium">Citas totales</span>
            </div>
          </div>

          {/* Key Indicators breakdown with dots */}
          <div className="grid grid-cols-2 gap-2 text-xs" id="distribution-legend">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Aprobadas ({statsApproved})
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/15">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Pendientes ({statsPending})
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-700 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Reagendadas ({statsRescheduled})
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-700 dark:text-rose-450">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Rechazadas ({statsRejected})
            </div>
          </div>
        </div>

      </div>

      {/* Tabs selectors for Inbox and Logs */}
      <div className="flex items-center gap-4 border-b border-gray-200/30 dark:border-zinc-800/40 mb-6" id="dashboard-tab-selectors">
        <button
          onClick={() => setActiveTab('INBOX')}
          id="btn-tab-inbox"
          className={`pb-3 text-sm font-bold border-b-2 px-1 cursor-pointer transition-all ${
            activeTab === 'INBOX'
              ? 'border-blue-500 text-blue-600 dark:text-blue-450'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Bandeja de Entrada ({filteredAppointments.length})
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          id="btn-tab-logs"
          className={`pb-3 text-sm font-bold border-b-2 px-1 cursor-pointer transition-all ${
            activeTab === 'AUDIT_LOGS'
              ? 'border-blue-500 text-blue-600 dark:text-blue-450'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Historial de Auditoría Real ({auditLogs.length})
        </button>
      </div>

      {/* Search and Advanced filter for Inbox list */}
      {activeTab === 'INBOX' && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6" id="filters-container">
          <div className="relative w-full md:w-1/3" id="search-box-wrapper">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, nombre, email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto" id="filter-buttons-wrapper">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-500/90 mr-2">Filtrar:</span>
            
            <div className="flex flex-wrap gap-1.5" id="btn-filters-row">
              {['ALL', 'PENDING', 'APPROVED', 'RESCHEDULED', 'REJECTED'].map((filterVal) => (
                <button
                  key={filterVal}
                  onClick={() => setSelectedStatusFilter(filterVal)}
                  id={`btn-filter-${filterVal}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStatusFilter === filterVal
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                      : 'bg-white/40 dark:bg-zinc-850/40 border border-gray-200/50 dark:border-zinc-700/50 text-gray-700 dark:text-zinc-350 hover:bg-white/60 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {filterVal === 'ALL' ? 'Todos' :
                   filterVal === 'PENDING' ? 'Pendiente' :
                   filterVal === 'APPROVED' ? 'Aprobada' :
                   filterVal === 'RESCHEDULED' ? 'Reagendada' :
                   'Rechazada'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Render */}
      <AnimatePresence mode="wait">
        {activeTab === 'INBOX' ? (
          /* Table Inbox List */
          <motion.div
            key="inbox"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto rounded-xl border border-gray-200/20 dark:border-zinc-800/20 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-md"
            id="inbox-table-box"
          >
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-gray-500" id="empty-inbox">
                <p className="text-sm font-bold text-gray-750 dark:text-gray-300">Ningún registro coincide con los filtros</p>
                <p className="text-xs text-gray-500/80 mt-1">Recarga la base de datos o crea una nueva cita para ver entradas.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse" id="inbox-table-element">
                <thead>
                  <tr className="border-b border-gray-200/40 dark:border-zinc-800/40 bg-gray-550/5 text-gray-500 text-xs font-mono tracking-wider uppercase" id="tbl-row-hdr">
                    <th className="p-4" id="th-id">ID Reservación</th>
                    <th className="p-4" id="th-info">Cliente Potencial</th>
                    <th className="p-4" id="th-schedule">Horario</th>
                    <th className="p-4" id="th-notes">Detalles</th>
                    <th className="p-4" id="th-status">Estado</th>
                    <th className="p-4 text-center" id="th-actions">Operaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/10 dark:divide-zinc-800/20 text-sm text-gray-800 dark:text-zinc-300" id="tbl-body">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-500/5 group transition-colors" id={`tbl-row-${appt.id}`}>
                      {/* Booking Code ID */}
                      <td className="p-4 font-mono font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:underline" id={`td-id-${appt.id}`}>
                        {appt.id}
                      </td>

                      {/* Lead description info */}
                      <td className="p-4" id={`td-info-${appt.id}`}>
                        <div className="font-bold text-gray-900 dark:text-white" id={`td-name-${appt.id}`}>
                          {appt.visitorName}
                        </div>
                        <div className="text-xs text-gray-500 space-y-0.5" id={`td-subinfo-${appt.id}`}>
                          <div>{appt.visitorEmail}</div>
                          <div>{appt.visitorPhone}</div>
                        </div>
                      </td>

                      {/* Schedule info */}
                      <td className="p-4" id={`td-sch-${appt.id}`}>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold" id={`td-date-${appt.id}`}>
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {appt.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 mt-1" id={`td-time-${appt.id}`}>
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {appt.time}
                        </div>
                      </td>

                      {/* Notes/Inquiry detail */}
                      <td className="p-4 max-w-xs text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed" id={`td-notes-${appt.id}`} title={appt.notes}>
                        {appt.notes}
                      </td>

                      {/* Status indicator pill */}
                      <td className="p-4" id={`td-status-${appt.id}`}>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          appt.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                          appt.status === 'PENDING' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                          appt.status === 'RESCHEDULED' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' :
                          'bg-rose-500/15 text-rose-600 dark:text-rose-450 border border-rose-500/20'
                        }`} id={`td-span-status-${appt.id}`}>
                          {appt.status === 'APPROVED' ? 'Aprobada' :
                           appt.status === 'PENDING' ? 'Pendiente' :
                           appt.status === 'RESCHEDULED' ? 'Reagendada' :
                           'Rechazada'}
                        </span>
                      </td>

                      {/* Transaction Action buttons */}
                      <td className="p-4" id={`td-actions-${appt.id}`}>
                        <div className="flex items-center justify-center gap-2" id={`cell-actions-${appt.id}`}>
                          {appt.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'APPROVED')}
                              id={`btn-approve-${appt.id}`}
                              className="p-1.5 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 hover:shadow shadow-zinc-950/20 transition-all cursor-pointer"
                              title="Aprobar Solicitud"
                            >
                              Aprobar
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setReschedulingAppt(appt);
                              setNewDate(appt.date);
                              setNewTime(appt.time);
                            }}
                            id={`btn-resched-init-${appt.id}`}
                            className="p-1.5 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer"
                            title="Reagendar Cita"
                          >
                            Reagendar
                          </button>

                          {appt.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'REJECTED')}
                              id={`btn-reject-${appt.id}`}
                              className="p-1.5 px-3 rounded-lg text-xs font-bold text-gray-850 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-all cursor-pointer"
                              title="Rechazar Cita"
                            >
                              Rechazar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        ) : (
          /* Audit Logs list */
          <motion.div
            key="audit_logs"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10"
            id="logs-box"
          >
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4" id="logs-tit">
              <Activity className="w-5 h-5 text-emerald-500" />
              Sello del Tiempo y Log de Auditoría Operativa (Cumplimiento Comercial)
            </h4>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3" id="logs-list">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-gray-250/30 dark:border-zinc-805/40 bg-white/5 dark:bg-zinc-950/20" id={`log-${log.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" id={`log-upper-${log.id}`}>
                    <div className="flex items-center gap-2.5" id={`log-meta-${log.id}`}>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15" id={`log-actor-${log.id}`}>
                        {log.actor}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white" id={`log-action-${log.id}`}>
                        {log.action}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-gray-500" id={`log-time-${log.id}`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans" id={`log-det-${log.id}`}>
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over interactive Panel for Rescheduling Citas */}
      {reschedulingAppt && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" id="reschedule-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-left shadow-2xl relative"
            id="reschedule-modal-card"
          >
            <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2" id="resch-hdr">
              <Edit3 className="w-5 h-5 text-blue-500" />
              Reagendar & Reprogramar Cita
            </h4>
            <p className="text-xs text-gray-500 mb-6" id="resch-sub">
              ID Reservación: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{reschedulingAppt.id}</span>
            </p>

            <div className="space-y-4" id="resch-inputs">
              <div id="resch-client">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Cliente</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{reschedulingAppt.visitorName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4" id="resch-grid">
                <div className="space-y-1" id="resch-date-grp">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nueva Fecha</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200/50 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1" id="resch-time-grp">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Nueva Hora</label>
                  <select
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200/50 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Elige franja --</option>
                    <option value="08:00">08:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:30">03:30 PM</option>
                    <option value="16:30">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1" id="resch-notes-grp">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Observación / Motivo del Cambio</label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Ej. Cambio de horario tras conversación comercial por incompatibilidad horaria del cliente en el puerto."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200/50 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end" id="resch-buttons">
              <button
                type="button"
                onClick={() => setReschedulingAppt(null)}
                id="btn-reschedule-cancel"
                className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingAction}
                id="btn-reschedule-save"
                onClick={() => handleUpdateStatus(reschedulingAppt.id, 'RESCHEDULED', newDate, newTime, actionNotes)}
                className="px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all cursor-pointer"
              >
                {savingAction ? 'Salvando...' : 'Confirmar Reprogramación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
