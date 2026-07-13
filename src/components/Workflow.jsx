import React from 'react';

export default function Workflow() {
  const steps = [
    {
      number: '01',
      title: 'Driver Dispatch',
      role: 'Driver',
      description: 'Driver logs on via mobile, submits pre-trip logs, and receives dynamic route assignments.'
    },
    {
      number: '02',
      title: 'Real-time Coordination',
      role: 'Fleet Manager',
      description: 'Fleet managers monitor ETAs, route progress, and address exceptions as they occur.'
    },
    {
      number: '03',
      title: 'Control Center Operations',
      role: 'Operations Dashboard',
      description: 'Centralized telemetry aggregates systemic alerts, delays, and critical maintenance warnings.'
    },
    {
      number: '04',
      title: 'Strategic Audits',
      role: 'Reports & Analytics',
      description: 'Operational metrics generate cost analysis, fuel audit records, and performance scores.'
    }
  ];

  return (
    <section className="bg-white py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Integrated Operations Flow
          </h2>
          <p className="mt-4 text-base text-slate-600">
            A single operational loop connecting vehicles on the road with analysts and managers at HQ.
          </p>
        </div>

        {/* Horizontal timeline container */}
        <div className="relative">
          {/* Timeline background line - hidden on mobile, visible on desktop */}
          <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-slate-200" />
          
          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left group">
                
                {/* Timeline Circle Node */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm mb-6 transition-all group-hover:border-blue-600 group-hover:ring-4 group-hover:ring-blue-50/50">
                  <span className="text-sm font-mono font-bold text-slate-800 group-hover:text-blue-600">
                    {step.number}
                  </span>
                </div>
                
                {/* Role indicator */}
                <div className="inline-flex text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded mb-3">
                  {step.role}
                </div>
                
                {/* Text Content */}
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                  {step.description}
                </p>
                
                {/* Arrow indicator between steps for mobile/tablet */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden mt-8 text-slate-300">
                    <svg className="w-5 h-5 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
