/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Code2, Workflow, Copy, Check, Terminal, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ARCHITECTURE_DATA } from '../architectureData';

interface ApiSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiSpecModal({ isOpen, onClose }: ApiSpecModalProps) {
  const [activeTab, setActiveTab] = useState<'ARCH' | 'SQL' | 'API'>('ARCH');
  const [copied, setCopied] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(ARCHITECTURE_DATA.sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-xs transition-opacity" id="developer-drawer-overlay">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-3xl h-full bg-[#0A0E17] border-l border-white/10 flex flex-col shadow-2xl relative text-slate-100"
        id="developer-drawer-card"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50" id="spec-header">
          <div className="flex items-center gap-2.5" id="spec-title-group">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-lg font-extrabold text-white">Especificaciones de Arquitectura Senior</h3>
              <p className="text-[11px] text-slate-400">Entregables de Base de Datos, Flujo e Integración para Logiacex S.A.S.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="btn-close-specs"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Menu Selector tabs */}
        <div className="flex bg-slate-950 text-xs font-semibold px-4 border-b border-slate-800" id="spec-tabs">
          <button
            onClick={() => setActiveTab('ARCH')}
            id="spec-tab-arch"
            className={`flex items-center gap-2 px-4 py-3 border-b-2 tracking-wide cursor-pointer transition-all ${
              activeTab === 'ARCH' ? 'border-emerald-400 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            Arquitectura Técnica
          </button>

          <button
            onClick={() => setActiveTab('SQL')}
            id="spec-tab-sql"
            className={`flex items-center gap-2 px-4 py-3 border-b-2 tracking-wide cursor-pointer transition-all ${
              activeTab === 'SQL' ? 'border-emerald-400 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Script de Base de Datos (SQL)
          </button>

          <button
            onClick={() => setActiveTab('API')}
            id="spec-tab-api"
            className={`flex items-center gap-2 px-4 py-3 border-b-2 tracking-wide cursor-pointer transition-all ${
              activeTab === 'API' ? 'border-emerald-400 text-emerald-400 bg-slate-900/50' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Endpoints de la API
          </button>
        </div>

        {/* Drawer Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0A0E17]/95" id="spec-body-scroller">
          {activeTab === 'ARCH' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
              id="spec-content-arch"
            >
              <div className="space-y-2 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400">1. Arquitectura de Sistemas</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para Logiacex S.A.S. se ha implementado un esquema full-stack responsivo de alto rendimiento. El frontend gestiona las transiciones fluidas de los clientes y visitantes, renderizando en tiempo real la metadata en formato QR, mientras la base de datos relacional simulada asegura consistencia durable de citas en disco de manera síncrona.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Frontend Stack</h5>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {ARCHITECTURE_DATA.frontend}
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/20">
                  <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Backend Stack</h5>
                  <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {ARCHITECTURE_DATA.backend}
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400">2. Esfuerzo en Conversión</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cada cita captada inicializa un hilo comercial en estado <code className="font-mono text-amber-300 text-[11px] bg-slate-900 px-1 py-0.5 rounded">PENDING</code>. Al ser evaluada por un comercial desde el dashboard, se audita transaccionalmente el log. La tasa de conversión se mide con indicadores operacionales vivos, facilitando el análisis visual por rango mensual.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'SQL' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
              id="spec-content-sql"
            >
              <div className="flex items-center justify-between" id="sql-controls">
                <div>
                  <h4 className="text-sm font-bold text-emerald-450">Script de Control Relacional Relación 3NF</h4>
                  <p className="text-xs text-slate-400">Migración SQL compatible con Postgres, MySQL o SQL Server.</p>
                </div>

                <button
                  onClick={handleCopySql}
                  id="btn-copy-sql"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar Script SQL'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 font-mono text-[11px] text-slate-300 relative overflow-x-auto max-h-[460px] leading-relaxed" id="sql-block">
                <pre>{ARCHITECTURE_DATA.sqlScript}</pre>
              </div>

              <div className="text-xs text-slate-400 whitespace-pre-line bg-slate-950/20 p-4 rounded-xl border border-slate-800">
                {ARCHITECTURE_DATA.database}
              </div>
            </motion.div>
          )}

          {activeTab === 'API' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
              id="spec-content-api"
            >
              <div id="api-hdr">
                <h4 className="text-sm font-bold text-emerald-450">Endpoints RESTful del Servidor Express</h4>
                <p className="text-xs text-slate-400">Garantizan las operaciones operativas e integraciones del sistema.</p>
              </div>

              <div className="space-y-4" id="endpoints-list">
                {ARCHITECTURE_DATA.endpoints.map((route, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/30 font-sans" id={`api-route-${idx}`}>
                    <div className="flex items-center gap-2.5 mb-2" id={`api-route-hdr-${idx}`}>
                      <span className={`px-2 py-0.5 rounded font-mono font-black text-xs ${
                        route.method === 'GET' ? 'bg-blue-900/50 text-blue-400 border border-blue-800/30' :
                        route.method === 'POST' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/30' :
                        'bg-purple-900/50 text-purple-400 border border-purple-800/30'
                      }`} id={`api-method-${idx}`}>
                        {route.method}
                      </span>
                      <code className="font-mono font-bold text-white text-xs" id={`api-path-${idx}`}>{route.path}</code>
                    </div>

                    <p className="text-xs text-slate-350 leading-relaxed" id={`api-desc-${idx}`}>
                      {route.description}
                    </p>

                    {route.payload && (
                      <div className="mt-2.5" id={`api-payroll-${idx}`}>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Payload Requerido:</span>
                        <code className="block mt-1 p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto">
                          {route.payload}
                        </code>
                      </div>
                    )}

                    <div className="mt-2.5" id={`api-response-${idx}`}>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Estructura Retorno:</span>
                      <code className="block mt-1 p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto">
                        {route.response}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Drawer Footer info indicator */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 text-center text-[10.5px] text-slate-400 font-mono" id="spec-ftr">
          Logiacex S.A.S. • Control de Calidad Tecnológico • Mayo 2026
        </div>
      </motion.div>
    </div>
  );
}
