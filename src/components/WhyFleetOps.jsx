import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function WhyFleetOps() {
  const benefits = [
    {
      title: 'Faster Fleet Coordination',
      metric: '22% Efficiency Gain',
      description: 'Streamline communications. Eliminate time-consuming dispatch calls and manually typed route plans, enabling your coordinators to manage double the fleet size without extra overhead.'
    },
    {
      title: 'Reduced Operational Downtime',
      metric: '35% Less Unplanned Maintenance',
      description: 'Resolve issues proactively. Automated diagnostics notify mechanics of engine fault codes instantly, letting you coordinate maintenance during scheduled breaks rather than mid-route.'
    },
    {
      title: 'Total Operational Visibility',
      metric: '100% Tracking Coverage',
      description: 'Centralize vehicle tracking, driver hours, and safety logs. Real-time telemetry ensures customer service teams provide precise delivery estimates without calling the driver.'
    },
    {
      title: 'Data-Driven Decision Making',
      metric: '15% Lower Cost-Per-Mile',
      description: 'Analyze performance data. High-fidelity analytics reveal fuel waste, suboptimal route combinations, and driver safety scores, providing leadership with clear levers for margin expansion.'
    }
  ];

  return (
    <section id="why-fleetops" className="bg-slate-50 py-24 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="lg:flex lg:items-end lg:justify-between mb-16">
          <div className="max-w-2xl text-left">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Business Value First</span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mt-3">
              Why Logistics Leaders Choose FleetOps
            </h2>
            <p className="mt-4 text-base text-slate-600">
              We focus on the metrics that drive margin expansion, driver safety, and contract compliance.
            </p>
          </div>
          <div className="mt-6 lg:mt-0 flex text-slate-500 text-sm font-medium items-center gap-1">
            <span>Learn how we calculate ROI</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-200 p-8 rounded-xl text-left shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Metric/Value Tag */}
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 font-mono">
                    {benefit.metric}
                  </span>
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-3">
                  {benefit.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
