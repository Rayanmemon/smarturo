import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Users,
  ClipboardCheck,
  PlusCircle,
  Stethoscope,
} from 'lucide-react';

export function NavBar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Activity },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/review', label: 'Review Queue', icon: ClipboardCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Stethoscope className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-300 via-teal-100 to-white bg-clip-text text-transparent">
                SmartUro
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-teal-400/80 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                Rule-Based Engine
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Action Button: New Reading */}
            <NavLink
              to="/readings/new"
              className="ml-2 sm:ml-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 shadow-md shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400 transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Reading</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
