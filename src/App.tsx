/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, BookOpen, Sun, Moon, Lock, Info, Activity, ShieldCheck, LogOut, Terminal, Users } from 'lucide-react';
import { RoleType, DashboardStats } from './types';
import CustomerLanding from './components/CustomerLanding';
import RoleSelector from './components/RoleSelector';
import VisitorModule from './components/VisitorModule';
import AdminDashboard from './components/AdminDashboard';
import ApiSpecModal from './components/ApiSpecModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('logiacex-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // High contrast Slate dark by default for luxury looks
  });

  // Navigation states
  const [sessionEmail, setSessionEmail] = useState<string | null>(() => {
    return localStorage.getItem('logiacex-session') || null;
  });
  const [currentRole, setCurrentRole] = useState<RoleType | null>(() => {
    const saved = localStorage.getItem('logiacex-role');
    if (saved === 'ADMIN' || saved === 'VISITOR') return saved as RoleType;
    return null;
  });

  // State to track if user clicked "Agendar Cita" without registering account (Instant booking flow)
  const [visitedBookingInstant, setVisitedBookingInstant] = useState(false);

  // Authentication Login form state inputs
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Technical Specification Drawer open/close state
  const [isSpecDrawerOpen, setIsSpecDrawerOpen] = useState(false);

  // Dashboard stats fetched live from REST mock server
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    pendingValidation: 0,
    approvedLeads: 0,
    conversionRate: 0,
    byStatus: { PENDING: 0, APPROVED: 0, RESCHEDULED: 0, REJECTED: 0 },
    monthlyProgress: []
  });

  // Fetch metrics helper
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error('Error loading dashboard stats', e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentRole]);

  // Dynamic Theme application to document node
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0A0E17'; // Elegant Dark Canvas background
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#fafafa'; // Warm premium off-white
    }
    localStorage.setItem('logiacex-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Perform Admin Login mapping
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail) {
      setLoginError('Por favor complete su correo electrónico corporativo.');
      return;
    }

    // Capture inputs. If administrator domain is used or any email for demonstration purposes, authorize:
    const finalRole: RoleType = loginEmail.includes('admin') ? 'ADMIN' : 'VISITOR';
    
    localStorage.setItem('logiacex-session', loginEmail);
    localStorage.setItem('logiacex-role', finalRole);
    
    setSessionEmail(loginEmail);
    setCurrentRole(finalRole);
    setShowLoginModal(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // Autologin Admin for direct testing click
  const triggerDemoAdminLogin = () => {
    const targetEmail = 'admin@logiacex.com';
    localStorage.setItem('logiacex-session', targetEmail);
    localStorage.setItem('logiacex-role', 'ADMIN');
    setSessionEmail(targetEmail);
    setCurrentRole('ADMIN');
    setShowLoginModal(false);
  };

  // General Logout
  const handleLogout = () => {
    localStorage.removeItem('logiacex-session');
    localStorage.removeItem('logiacex-role');
    setSessionEmail(null);
    setCurrentRole(null);
    setVisitedBookingInstant(false);
  };

  return (
    <div className={`min-h-screen font-sans antialiased text-slate-800 dark:text-slate-200 transition-colors duration-300 relative ${theme === 'dark' ? 'dark bg-[#0A0E17]' : 'bg-[#fafafa]'}`} id="main-app-frame">
      
      {/* Decorative Blur Spheres for Elegant Dark design */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        </>
      )}

      {/* Visual Navigation Header with Glassmorphic texture */}
      <header className="sticky top-0 z-40 w-full px-6 py-4 bg-white/60 dark:bg-white/5 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 transition-all" id="app-nav-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between" id="header-inner">
          
          {/* Logo Brand Title with corporate style matching the template exactly */}
          <div className="flex items-center gap-3 cursor-pointer z-10" onClick={() => { setCurrentRole(null); setVisitedBookingInstant(false); }} id="brand-logo-grp">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/10" id="brand-logo-box">
              L
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white" id="brand-title">
                LOGIACEX <span className="text-blue-500 dark:text-blue-400">S.A.S.</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-slate-500" id="brand-ticker">
                Corporate Appointment System
              </p>
            </div>
          </div>

          {/* Right Header Interaction buttons */}
          <div className="flex items-center gap-4.5 z-10" id="header-action-row">
            
            {/* Spec Sheet floating button */}
            <button
              onClick={() => setIsSpecDrawerOpen(true)}
              id="btn-specs-floating"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 shadow-sm transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              Especificaciones Técnicas
            </button>

            {/* Dark Mode toggle switcher */}
            <button
              onClick={toggleTheme}
              id="btn-theme-switcher"
              className="p-2 rounded-xl bg-gray-150/40 dark:bg-white/5 hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-all border border-gray-200/20 dark:border-white/5 cursor-pointer"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-zinc-700" />}
            </button>

            {/* Session Indicator pill */}
            {sessionEmail ? (
              <div className="flex items-center gap-3 bg-zinc-900/10 dark:bg-white/5 border border-gray-200/30 dark:border-white/10 p-1.5 pl-3 rounded-full" id="session-info-header">
                <div>
                  <span className="hidden sm:inline text-xs font-bold text-gray-900 dark:text-white" id="session-user-lbl">{sessionEmail}</span>
                  <span className="block text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-widest leading-none mt-0.5 text-right shrink-0" id="session-role-lbl">
                    {currentRole === 'ADMIN' ? 'Coordinador' : 'Visitante'}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  id="btn-logout-header"
                  className="p-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" id="icn-logout" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                id="btn-access-header"
                className="px-4 py-2 text-xs font-bold ring-2 ring-gray-900/10 dark:ring-white/10 hover:bg-zinc-950 dark:hover:bg-white text-gray-900 dark:text-white hover:text-white dark:hover:text-[#0A0E17] rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Acceder
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Orchestrator Canvas */}
      <main className="relative py-8 min-h-[80vh] flex flex-col justify-start z-10" id="main-content-canvas">
        <AnimatePresence mode="wait">
          {!currentRole && !visitedBookingInstant ? (
            /* Part 1: Landing presentation */
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CustomerLanding
                onEnterBooking={() => {
                  setVisitedBookingInstant(true);
                }}
                onEnterLogin={() => {
                  setShowLoginModal(true);
                }}
              />
            </motion.div>
          ) : currentRole && !visitedBookingInstant && !sessionEmail ? (
            /* Part 2: Role selection if session initialized but no specific view chosen */
            <motion.div
              key="role_selector"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <RoleSelector
                currentUserEmail={sessionEmail || 'demo_user@logiacex.com'}
                onSelectRole={(role) => {
                  setCurrentRole(role);
                  if (role === 'VISITOR') {
                    setVisitedBookingInstant(true);
                  }
                }}
                onLogout={handleLogout}
              />
            </motion.div>
          ) : visitedBookingInstant || currentRole === 'VISITOR' ? (
            /* Part 3: Visitor autogestion client booking form */
            <motion.div
              key="visitor_module"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <VisitorModule
                onBack={() => {
                  setVisitedBookingInstant(false);
                  if (!sessionEmail) {
                    setCurrentRole(null);
                  }
                }}
                onRefreshStats={fetchStats}
              />
            </motion.div>
          ) : (
            /* Part 4: Admin dashboard monitoring metrics and requests */
            <motion.div
              key="admin_module"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard
                stats={stats}
                onRefreshData={fetchStats}
                onBack={() => {
                  handleLogout();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Corporate Glassmorphism Clean Footer */}
      <footer className="py-12 border-t border-gray-200/40 dark:border-white/10 bg-zinc-950/5 dark:bg-black/30 backdrop-blur-md text-xs text-gray-500 text-center flex flex-col items-center gap-4" id="app-footer">
        <div className="flex gap-6 text-gray-400 dark:text-slate-400 font-medium" id="footer-links">
          <span className="hover:text-blue-500 cursor-pointer">Políticas de Privacidad (Habeas Data)</span>
          <span>•</span>
          <span className="hover:text-amber-500 cursor-pointer">Términos del Servicio</span>
          <span>•</span>
          <span onClick={() => setIsSpecDrawerOpen(true)} className="hover:text-emerald-400 text-emerald-500 font-bold cursor-pointer">
            Ficha de Entrega Técnica
          </span>
        </div>
        <p id="footer-credit" className="dark:text-slate-500">
          &copy; 2026 <strong>Logiacex S.A.S.</strong> • Todos los derechos reservados. Nit: 900.245.892-1.
        </p>
      </footer>

      {/* User Login Authenticator Modal (Role switcher gateway setup) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs" id="login-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 rounded-[2rem] bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl relative"
            id="login-modal-card"
          >
            {/* Close button */}
            <button
              onClick={() => setShowLoginModal(false)}
              id="btn-close-login"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6" id="login-header">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-orange-600 dark:text-orange-400 border border-amber-500/15 mb-2 inline-block">
                Portal Corporativo Logiacex
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">Ingresar al Sistema Hub</h3>
              <p className="text-xs text-gray-500 mt-1">Elige ingresar como Coordinador Comercial o simular acceso.</p>
            </div>

            {loginError && (
              <div className="p-3 mb-4 rounded-xl text-rose-600 bg-rose-500/10 text-xs font-semibold border border-rose-500/15" id="login-error-msg">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4" id="login-form">
              <div className="space-y-1" id="login-email-grp">
                <label className="text-xs font-semibold text-gray-750 dark:text-zinc-300">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Ej. admin@logiacex.com (Para Coordinador)"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-1" id="login-pass-grp">
                <label className="text-xs font-semibold text-gray-750 dark:text-zinc-300">Contraseña Corporativa</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/40 dark:bg-white/5 text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                id="btn-login-auth"
                className="w-full py-3 px-4 font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all h-11 flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 shadow-blue-500/10"
              >
                Autenticar & Continuar
              </button>

              {/* Instant Developer/Reviewer Bypass (Strict multi-tenant selection) */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-white/10 text-center" id="demo-bypass-grp">
                <p className="text-[10px] text-gray-400 font-semibold mb-2 uppercase tracking-wide">Acceso Rápido para Pruebas (Demo Reviewer)</p>
                <div className="grid grid-cols-2 gap-3" id="demo-bypass-grid">
                  <button
                    type="button"
                    onClick={triggerDemoAdminLogin}
                    id="btn-bypass-admin"
                    className="py-2.5 px-3.5 rounded-xl text-xs font-black bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer hover:border-blue-500/40 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Rol Administrador
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('logiacex-session', 'visitante.demo@gmail.com');
                      localStorage.setItem('logiacex-role', 'VISITOR');
                      setSessionEmail('visitante.demo@gmail.com');
                      setCurrentRole('VISITOR');
                      setVisitedBookingInstant(true);
                      setShowLoginModal(false);
                    }}
                    id="btn-bypass-visitor"
                    className="py-2.5 px-3.5 rounded-xl text-xs font-black bg-orange-500/10 hover:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer hover:border-orange-500/40 transition-colors"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Rol Visitante
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Developer Ficha Técnica specifications Drawer */}
      <ApiSpecModal isOpen={isSpecDrawerOpen} onClose={() => setIsSpecDrawerOpen(false)} />

    </div>
  );
}
