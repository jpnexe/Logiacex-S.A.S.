/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, ArrowLeft, QrCode, ClipboardList, Info, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Appointment } from '../types';

interface VisitorModuleProps {
  onBack: () => void;
  onRefreshStats?: () => void;
}

export default function VisitorModule({ onBack, onRefreshStats }: VisitorModuleProps) {
  // Booking state
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Status handlers
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successAppointment, setSuccessAppointment] = useState<Appointment | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // History state of citations scheduled in this tab
  const [localHistory, setLocalHistory] = useState<Appointment[]>([]);
  const [selectedHistoricalAppt, setSelectedHistoricalAppt] = useState<Appointment | null>(null);

  // Auto-fill button for fast demonstration
  const handleDemoFill = () => {
    setVisitorName('Alejandro Giraldo Ospina');
    setVisitorPhone('+57 310 740 8593');
    setVisitorEmail('alejandro.giraldo@import-col.com');
    setDate('2026-06-12');
    setTime('10:00');
    setNotes('Importación de maquinarias industriales desde China. Requerimos consultoría sobre liberación en Buenaventura.');
  };

  // Fetch local history from localStorage or DB
  const loadAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data: Appointment[] = await res.json();
        const emailToMatch = visitorEmail || 'alejandro.giraldo@import-col.com';
        // Filter those booked by visitor in this specific session (or general list for simple display)
        setLocalHistory(data);
      }
    } catch (e) {
      console.error('Error fetching appointments', e);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [successAppointment]);

  // Generate QR Code URI helper
  const generateQRCode = async (text: string) => {
    try {
      const url = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR code generation failed', err);
    }
  };

  // Submit booking logic
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone || !visitorEmail || !date || !time) {
      setErrorStatus('Por favor complete todos los campos mandatorios.');
      return;
    }

    setLoading(true);
    setErrorStatus(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName,
          visitorPhone,
          visitorEmail,
          notes,
          date,
          time
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al procesar la solicitud.');
      }

      const appt: Appointment = await res.json();
      setSuccessAppointment(appt);
      setSelectedHistoricalAppt(null);

      // Render the QR code based on the detailed appointment metadata
      await generateQRCode(appt.qrCodeData);

      // Trigger Confetti!
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (onRefreshStats) {
        onRefreshStats();
      }
    } catch (err: any) {
      setErrorStatus(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form to book another
  const handleResetForm = () => {
    setSuccessAppointment(null);
    setSelectedHistoricalAppt(null);
    setVisitorName('');
    setVisitorPhone('');
    setVisitorEmail('');
    setNotes('');
    setDate('');
    setTime('');
    setQrCodeUrl('');
  };

  // Display QR for a historical record
  const handleViewHistoricalQR = async (appt: Appointment) => {
    setSelectedHistoricalAppt(appt);
    setSuccessAppointment(null);
    await generateQRCode(appt.qrCodeData);
  };

  const activeDisplayTicket = successAppointment || selectedHistoricalAppt;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8" id="visitor-module-root">
      {/* Go Back Header */}
      <div className="flex items-center justify-between mb-8" id="visitor-top-nav">
        <button
          onClick={onBack}
          id="btn-back-visitor"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200/40 dark:hover:bg-zinc-805/40 border border-gray-200/20 dark:border-zinc-800/10 backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" id="icn-back" />
          Volver al Inicio
        </button>

        <span className="text-xs font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/15" id="lead-conv-indicator">
          Logiacex S.A.S. • Módulo Auto-agendamiento
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="visitor-main-layout">
        
        {/* Left Column: Form / Ticket Display */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="visitor-left-col">
          {!activeDisplayTicket ? (
            /* Booking Form Container */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 shadow-xl shadow-slate-900/5"
              id="booking-form-box"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" id="form-hdr">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white" id="booking-title">
                    Agendar Diagnóstico Comercial
                  </h3>
                  <p className="text-xs text-gray-505 dark:text-gray-400 mt-1" id="booking-subtitle">
                    Captura tus datos para recibir atención ejecutiva prioritaria.
                  </p>
                </div>
                
                {/* Fast demo fill */}
                <button
                  type="button"
                  onClick={handleDemoFill}
                  id="btn-demo-fill"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-650 dark:text-orange-400 bg-orange-505/10 hover:bg-orange-505/15 border border-orange-505/20 transition-all cursor-pointer shadow-sm fill-orange-550"
                >
                  ⚡ Auto-completar Demo
                </button>
              </div>

              {errorStatus && (
                <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-450 text-xs font-medium border border-rose-500/20 mb-6 flex items-center gap-2" id="form-error">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  {errorStatus}
                </div>
              )}

              <form onSubmit={handleBookAppointment} className="space-y-5" id="form-booking">
                {/* Full name field */}
                <div className="space-y-1.5" id="grp-name">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="Ej. Alejandro Giraldo Ospina"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="grp-phone-email">
                  {/* Phone number */}
                  <div className="space-y-1.5" id="grp-phone">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-orange-500" />
                      Teléfono Móvil <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="Ej. +57 321 000 0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5" id="grp-email">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-green-500" />
                      Correo Electrónico <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="Ej. alejandro@empresa.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="grp-date-time">
                  {/* Date selection */}
                  <div className="space-y-1.5" id="grp-date">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Fecha Conveniente <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Time choice */}
                  <div className="space-y-1.5" id="grp-time">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      Hora Disponible <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">-- Elige una franja --</option>
                      <option value="08:00">08:00 AM (Disponibilidad Comercial)</option>
                      <option value="09:30">09:30 AM (Disponibilidad Comercial)</option>
                      <option value="10:00">10:00 AM (Diagnóstico Prioritario)</option>
                      <option value="11:30">11:30 AM (Disponibilidad Comercial)</option>
                      <option value="14:00">02:00 PM (Reunión Corporativa)</option>
                      <option value="14:30">02:30 PM (Diagnóstico Prioritario)</option>
                      <option value="15:30">03:30 PM (Disponibilidad Comercial)</option>
                      <option value="16:30">04:30 PM (Cierre de Cronograma)</option>
                    </select>
                  </div>
                </div>

                {/* Notes/Lead details */}
                <div className="space-y-1.5" id="grp-notes">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-green-500" />
                    Detalles Operacionales de la Cita / Consultas Especiales
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Interés en régimen aduanero especial, fletes marítimos consolidados, etc. Esto nos ayuda a asignar el especialista comercial ideal para tu videollamada comercial o presencial."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200/50 dark:border-zinc-800/10 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-sm text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  id="btn-submit-booking"
                  className="w-full py-4 px-6 mt-6 rounded-xl text-white font-extrabold bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-md shadow-blue-500/20 hover:shadow-lg disabled:opacity-50 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? 'Procesando tu Solicitud...' : 'Confirmar Cita & Generar Ticket QR'}
                  {!loading && <CheckCircle2 className="w-5 h-5" />}
                </button>
              </form>
            </motion.div>
          ) : (
            /* Ticket Receipt generated layout */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6"
              id="ticket-outer-wrapper"
            >
              {/* Ticket Outer layout resembling airline boarding pass */}
              <div
                className="relative rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl shadow-slate-950/50 text-white overflow-hidden"
                id="ticket-boarding-pass"
              >
                {/* Highlight band */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-orange-500" id="ticket-band" />

                {/* Ticket Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40" id="ticket-hdr">
                  <div>
                    <h4 className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400" id="t-category">
                      Comprobante de Cita Digital
                    </h4>
                    <h3 className="text-xl font-extrabold tracking-tight text-white mt-1" id="t-corp">
                      LOGIACEX S.A.S.
                    </h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold ${
                    activeDisplayTicket.status === 'APPROVED' ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' :
                    activeDisplayTicket.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    activeDisplayTicket.status === 'RESCHEDULED' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`} id="t-status-lbl">
                    {activeDisplayTicket.status === 'APPROVED' ? 'APROBADA' :
                     activeDisplayTicket.status === 'PENDING' ? 'EN VALIDACIÓN' :
                     activeDisplayTicket.status === 'RESCHEDULED' ? 'REPROGRAMADA' :
                     'RECHAZADA'}
                  </span>
                </div>

                {/* Ticket Body Content */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center" id="ticket-body">
                  {/* Left Metadata Side */}
                  <div className="md:col-span-7 space-y-4" id="ticket-info">
                    <div id="t-id">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">ID Reservación Única</span>
                      <p className="text-lg font-mono font-bold text-blue-400">{activeDisplayTicket.id}</p>
                    </div>

                    <div id="t-name">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Cliente Potencial (Lead)</span>
                      <p className="text-base font-bold text-white">{activeDisplayTicket.visitorName}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{activeDisplayTicket.visitorEmail} • {activeDisplayTicket.visitorPhone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4" id="t-datetime">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Fecha de Atención</span>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          {activeDisplayTicket.date}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Hora Pactada</span>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          {activeDisplayTicket.time}
                        </p>
                      </div>
                    </div>

                    <div id="t-agent">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Especialista de Seguimiento</span>
                      <p className="text-xs font-semibold text-zinc-200 mt-0.5">
                        {activeDisplayTicket.assignedUser || 'Por asignar por mesa de control Logiacex'}
                      </p>
                    </div>

                    <div id="t-ref">
                      <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Objetivo de Conversión</span>
                      <p className="text-xs text-zinc-400 leading-relaxed mt-1 italic max-w-sm">
                        "{activeDisplayTicket.notes}"
                      </p>
                    </div>
                  </div>

                  {/* Right QR Code Side */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800" id="ticket-qr-side">
                    {qrCodeUrl ? (
                      <div className="p-3 bg-white rounded-xl shadow-lg shadow-zinc-950/50" id="qr-container">
                        <img src={qrCodeUrl} alt="Cita QR Logiacex" className="w-36 h-36" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-36 h-36 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center" id="qr-fallback">
                        <QrCode className="w-10 h-10 text-zinc-600 animate-spin" />
                      </div>
                    )}
                    <span className="text-[9px] font-mono font-semibold tracking-wider text-zinc-500 uppercase mt-3 text-center">
                      Escanee para verificar metadata
                    </span>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="relative flex items-center justify-between px-4 py-1" id="perforated-div">
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border-r border-zinc-850" />
                  <div className="w-full border-t border-dashed border-zinc-800" />
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#f8fafc] dark:bg-zinc-950 border-l border-zinc-850" />
                </div>

                {/* Ticket Footer Instructions */}
                <div className="p-6 md:p-8 bg-zinc-900/20 text-zinc-400 text-xs flex gap-3.5 items-start" id="ticket-ftr">
                  <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>¿Qué sigue?</strong> Presente este código QR digital o impreso al ingresar o durante su cita comercial virtual de comercio exterior. Nuestro sistema ha guardado la solicitud y un auditor comercial analizará su requerimiento aduanero en un plazo no mayor a 2 horas hábiles.
                  </p>
                </div>
              </div>

              {/* Action buttons under ticket receipt */}
              <div className="flex flex-col sm:flex-row gap-4" id="ticket-actions">
                <button
                  onClick={handleResetForm}
                  id="btn-new-ticket"
                  className="w-full sm:w-1/2 py-3 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Agendar otra cita
                </button>

                <button
                  onClick={() => window.print()}
                  id="btn-print-ticket"
                  className="w-full sm:w-1/2 py-3 px-6 rounded-xl font-bold bg-white/40 dark:bg-zinc-850/40 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200/50 dark:border-zinc-700/50 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  🖨️ Guardar o Imprimir Tiquete
                </button>
              </div>

            </motion.div>
          )}
        </div>

        {/* Right Column: Historical citations booked */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="visitor-right-col">
          <div className="p-6 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 flex flex-col h-full min-h-[400px]" id="visitor-history-box">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4" id="h-title">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Tus Consultas Recientes ({localHistory.length})
            </h4>

            {localHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500" id="empty-history-vis">
                <HelpCircle className="w-10 h-10 text-gray-400 mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ningún agendamiento previo</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mt-1">Completa el formulario de la izquierda para registrar tu primer lead.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[480px] p-1 pr-2" id="history-scroller">
                {localHistory.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => handleViewHistoricalQR(appt)}
                    id={`hist-item-${appt.id}`}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      activeDisplayTicket?.id === appt.id
                        ? 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/80 shadow-md shadow-blue-500/5'
                        : 'bg-white/40 dark:bg-zinc-950/20 hover:bg-white/60 dark:hover:bg-zinc-950/40 border-gray-200/50 dark:border-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5" id={`hist-upper-${appt.id}`}>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400" id={`hist-id-${appt.id}`}>
                        {appt.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        appt.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                        appt.status === 'PENDING' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        appt.status === 'RESCHEDULED' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20' :
                        'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`} id={`hist-status-${appt.id}`}>
                        {appt.status === 'APPROVED' ? 'Aprobada' :
                         appt.status === 'PENDING' ? 'Pendiente' :
                         appt.status === 'RESCHEDULED' ? 'Reagendada' :
                         'Rechazada'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1" id={`hist-name-${appt.id}`}>
                      {appt.visitorName}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 font-mono" id={`hist-meta-${appt.id}`}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {appt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {appt.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
