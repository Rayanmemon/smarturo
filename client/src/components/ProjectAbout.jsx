import React from 'react';
import { Info, Code, Server, Database, CheckCircle2 } from 'lucide-react';

export function ProjectAbout() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Project Abstract & Architecture</h2>
          <p className="text-xs text-slate-500">
            SmartUro: Urinalysis Records Management & Decision Support Dashboard
          </p>
        </div>
      </div>

      <div className="text-sm text-slate-700 leading-relaxed space-y-3">
        <p>
          <strong>Project Summary:</strong> Urinalysis is one of the most frequently ordered diagnostic screening tests in clinical medicine, but manual paper logs and visual dipstick interpretation often suffer from transcription lag and subjective variability. <strong>SmartUro</strong> was built as an academic final year capstone project to demonstrate a lightweight, centralized records management and decision-support web application for clinical urinalysis.
        </p>
        <p>
          The system stores patient urine test readings in a <strong>MongoDB</strong> database, automatically evaluates each analyte against standardized reference ranges via an <strong>Express & Node.js</strong> deterministic rule engine, and provides clinicians with an intuitive web dashboard to review flagged abnormal tests and submit new records.
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Full-Stack Technology Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
              <Code className="w-4 h-4" />
              <span>Frontend (Client)</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>• React 18 & Vite build tool</li>
              <li>• Tailwind CSS for clean layout</li>
              <li>• Lucide React icons</li>
              <li>• Axios for REST API communication</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-semibold">
              <Server className="w-4 h-4" />
              <span>Backend (API Server)</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>• Node.js runtime environment</li>
              <li>• Express.js REST API framework</li>
              <li>• Pure deterministic flag evaluation engine</li>
              <li>• CORS & structured error handling</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold">
              <Database className="w-4 h-4" />
              <span>Database (Persistence)</span>
            </div>
            <ul className="space-y-1.5 text-slate-600">
              <li>• MongoDB NoSQL database</li>
              <li>• Mongoose ODM schemas & validation</li>
              <li>• 500-record urinalysis clinical dataset</li>
              <li>• In-memory MongoDB fallback support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-slate-800">Department of Computer Science & Engineering</span>
          <div className="text-slate-500">Major Capstone Project • Clinical Decision Support Systems</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-medium">B.Tech Project</span>
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-medium">Academic Prototype</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectAbout;
