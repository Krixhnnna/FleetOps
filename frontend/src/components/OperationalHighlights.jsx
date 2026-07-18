import React from 'react';

export default function OperationalHighlights() {
  const highlights = [
    {
      title: 'Live Fleet Monitoring',
      description: 'Track fleet telemetry, route progress, and telemetry codes in real-time with sub-3-second latency.',
      icon: (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    },
    {
      title: 'Driver Management',
      description: 'Streamline electronic logs, shift schedules, check-ins, and performance safety scores.',
      icon: (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      title: 'Maintenance Tracking',
      description: 'Automate preventative service logs, diagnose fault codes, and minimize unplanned vehicle downtime.',
      icon: (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    {
      title: 'Operational Reports',
      description: 'Analyze driver behavior, fuel consumption, delivery times, and overall operational efficiency.',
      icon: (
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="bg-slate-50 border-y border-slate-200/80 py-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Core Operational Infrastructure
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Everything your dispatchers, fleet managers, and drivers need in a unified, high-performance platform. Engineered for real-time logistics.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((hl, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200/70 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between"
            >
              <div>
                {/* Icon Container */}
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-5 border border-blue-100">
                  {hl.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                  {hl.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  {hl.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
