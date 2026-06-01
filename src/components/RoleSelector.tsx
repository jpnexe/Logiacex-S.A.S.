/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, ShieldAlert, ArrowRight, User, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { RoleType } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: RoleType) => void;
  onLogout: () => void;
  currentUserEmail: string;
}

export default function RoleSelector({ onSelectRole, onLogout, currentUserEmail }: RoleSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[70vh]" id="role-selector-root">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
        id="selector-hdr-wrapper"
      >
        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" id="session-lbl">
          Sesión Activa: {currentUserEmail}
        </span>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-4" id="select-profile-tit">
          Selección de Perfil Operativo
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto" id="select-profile-sub">
          Estás autenticado en el hub corporativo Logiacex. Selecciona el perfil con el que deseas interactuar para esta sesión.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl" id="role-cards-grid">
        {/* Visitor / Lead Role Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => onSelectRole('VISITOR')}
          id="card-role-visitor"
          className="p-8 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 w-fit mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all" id="visitor-icon-box">
              <User className="w-8 h-8" id="icn-r-visitor" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" id="visitor-title">
              Visitante / Cliente
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed" id="visitor-description">
              Espacio autogestionado para el registro de solicitudes de diagnóstico comercial, generación automática de tiquetes QR y seguimiento de agendamiento.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-450 list-inside list-disc" id="visitor-specs">
              <li>Formulario inteligente de captura de datos</li>
              <li>Generación instantánea de comprobante QR</li>
              <li>Visualización histórica de solicitudes</li>
            </ul>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm font-bold text-blue-600 dark:text-blue-400" id="visitor-action-bar">
            <span>Acceder como Visitante</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" id="visitor-arrow-r" />
          </div>
        </motion.div>

        {/* Administrator Role Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6, scale: 1.01 }}
          onClick={() => onSelectRole('ADMIN')}
          id="card-role-admin"
          className="p-8 rounded-[2rem] bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 hover:border-orange-500/50 dark:hover:border-orange-400/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="p-4 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 w-fit mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all" id="admin-icon-box">
              <Users className="w-8 h-8" id="icn-r-admin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" id="admin-title">
              Administrador Comercial
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed" id="admin-description">
              Bandeja operativa central para comerciales. Aprueba, reprograma o rechaza citas, consulta auditorías de logs y visualiza KPIs en un panel avanzado.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-450 list-inside list-disc" id="admin-specs">
              <li>Control operativo total (Bandeja de Entrada)</li>
              <li>Auditoría transaccional de logs operativa</li>
              <li>Visualización con analíticas avanzadas</li>
            </ul>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm font-bold text-orange-600 dark:text-orange-400" id="admin-action-bar">
            <span>Control Administrativo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" id="admin-arrow-r" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
        id="role-logout-wrapper"
      >
        <button
          onClick={onLogout}
          id="btn-logout-sel"
          className="px-6 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/15 backdrop-blur-md transition-all cursor-pointer"
        >
          Cerrar Sesión Corporativa
        </button>
      </motion.div>
    </div>
  );
}
