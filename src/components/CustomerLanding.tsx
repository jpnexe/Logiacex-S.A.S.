/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Compass, Shield, Truck, ArrowRight, UserCheck, Activity, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerLandingProps {
  onEnterBooking: () => void;
  onEnterLogin: () => void;
}

export default function CustomerLanding({ onEnterBooking, onEnterLogin }: CustomerLandingProps) {
  // Services data
  const services = [
    {
      icon: <Compass className="w-6 h-6 text-blue-500" id="icn-comp" />,
      title: 'Consultoría en Comercio Exterior',
      description: 'Asesoramiento de punta a punta para la internacionalización y colocación de mercancías en mercados de alta demanda, reduciendo costos arancelarios.',
      metric: 'Incremento del 35% en conversión de importaciones'
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-500" id="icn-shld" />,
      title: 'Aduanas & Regulación Aduanera',
      description: 'Cumplimiento normativo y trámites ágiles ante la VUCE y DIAN. Evitamos reprocesos, sanciones y retrasos en puertos nacionales.',
      metric: '99.8% de operaciones libres de demoras físicas'
    },
    {
      icon: <Truck className="w-6 h-6 text-green-500" id="icn-trck" />,
      title: 'Soluciones de Logística Integral',
      description: 'Coordinación multimodal de fletes FCL/LCL, almacenamiento aduanero pre-inspeccionado y distribución exprés de última milla.',
      metric: 'Reducción de tiempos de ciclo de flete en un 22%'
    }
  ];

  const statistics = [
    { value: '15+', label: 'Años de Experiencia Comercial' },
    { value: '98%', label: 'Índice de Conversión Satisfecha' },
    { value: '4.8M', label: 'Toneladas Métricas Despachadas' },
    { value: '24/7', label: 'Asistencia y Soporte de Trámite' }
  ];

  return (
    <div className="w-full relative overflow-hidden" id="landing-container">
      {/* Background Decorative Blur Spheres (Glassmorphism design requirement) */}
      <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full filter blur-[120px] opacity-20 dark:opacity-30 radial-glow-blue pointer-events-none" id="blur-1" />
      <div className="absolute top-[40%] right-[10%] w-80 h-80 rounded-full filter blur-[150px] opacity-20 dark:opacity-30 radial-glow-orange pointer-events-none" id="blur-2" />
      <div className="absolute bottom-10 left-[20%] w-96 h-96 rounded-full filter blur-[180px] opacity-20 dark:opacity-30 radial-glow-green pointer-events-none" id="blur-3" />

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 text-center max-w-5xl mx-auto" id="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Badge indicator */}
          <span className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 backdrop-blur-md" id="p-badge">
            <Activity className="w-3.5 h-3.5 animate-pulse" id="icn-act" />
            Especialistas en Operaciones Aduaneras e Importación
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight mt-2 max-w-4xl" id="hero-title">
            Optimiza tu Cadena de Suministro con Citas Estratégicas de <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent">Conversión Directa</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl text-center leading-relaxed" id="hero-subtitle">
            En <strong>Logiacex S.A.S.</strong> simplificamos el comercio exterior. Agenda un diagnóstico ejecutivo hoy y prevé cuellos de botella mediante control tarifario rápido. Obtén tu código de cita QR para atención prioritaria.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md" id="hero-actions">
            <button
              onClick={onEnterBooking}
              id="btn-agenda"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Agenda tu Diagnóstico
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" id="icn-arrow-r" />
            </button>

            <button
              onClick={onEnterLogin}
              id="btn-acceso"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md text-gray-800 dark:text-white border border-gray-200/50 dark:border-zinc-700/50 hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-5 h-5" id="icn-user-chk" />
              Acceder al Portal
            </button>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-12 max-w-7xl mx-auto" id="services-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
          id="services-header"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white" id="servicios-tit">
            Portafolio Estratégico Logiacex S.A.S.
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" id="servicios-sub">
            Soluciones robustas diseñadas para maximizar tus tiempos de importación y simplificar los esquemas logísticos en Colombia y plazas comerciales internacionales.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="services-grid">
          {services.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              id={`service-card-${idx}`}
              className="p-8 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 w-fit mb-6" id={`svc-icon-${idx}`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3" id={`svc-title-${idx}`}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300" id={`svc-desc-${idx}`}>
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/30 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400" id={`svc-metric-${idx}`}>
                <span>{item.metric}</span>
                <ChevronRight className="w-4 h-4 opacity-70" id={`svc-chev-${idx}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Info Stats Section */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent to-blue-500/5 dark:to-blue-950/5" id="stats-section">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-to-r from-blue-600/10 via-emerald-500/5 to-orange-500/5 backdrop-blur-md border border-white/20 dark:border-white/10 p-10 md:p-14" id="stats-card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center" id="stats-grid">
            {statistics.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center" id={`stat-item-${idx}`}>
                <span className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent" id={`stat-val-${idx}`}>
                  {stat.value}
                </span>
                <span className="mt-2 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 max-w-[150px]" id={`stat-lbl-${idx}`}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote / Pitch Segment */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center" id="trust-section">
        <p className="text-gray-400 text-xs tracking-widest uppercase font-mono mb-4" id="trust-caps">
          Seguimiento de Leads de Alta Conversión
        </p>
        <p className="text-lg md:text-xl font-medium italic text-gray-700 dark:text-gray-200" id="trust-quote">
          "Un agendamiento efectivo reduce un 40% las fricciones operativas posteriores. Capturamos la necesidad del cliente desde el minuto cero para garantizar el éxito aduanero absoluto."
        </p>
        <div className="mt-4 flex items-center justify-center gap-3" id="trust-signature">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold font-mono" id="avatar-sig">
            LX
          </div>
          <div className="text-left" id="signer-desc">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white" id="signer-name">Mesa Ejecutiva Logiacex</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400" id="signer-role">Soporte Corporativo & Comercio Exterior</p>
          </div>
        </div>
      </section>
    </div>
  );
}
