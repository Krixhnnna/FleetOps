import { ArrowRight } from 'lucide-react';

export default function Hero({ onNavigate }) {
  // Mock data for the realistic dashboard preview
  const stats = [
    { label: 'Deliveries Completed', value: '1,424', total: 'today' },
    { label: 'On-Time Delivery Rate', value: '99.42%', total: 'SLA target 98%' },
    { label: 'Customer CSAT', value: '4.95', total: 'out of 5.0' }
  ];



  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Subtle grid pattern background for technical feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Manage Every Mile. <br />
              <span className="text-blue-600">Deliver With Confidence.</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              A centralized platform for managing fleets, tracking operations, and keeping logistics teams connected.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => onNavigate('login')}
                className="inline-flex items-center justify-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer group"
              >
                Login to Console
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-lg shadow-sm hover:shadow transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
              >
                Explore Platform
              </button>
            </div>
          </div>

          {/* Right Column: High Fidelity Dashboard Preview */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-lg p-1.5 md:p-3 overflow-hidden select-none">
              
              {/* Fake Application Frame Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-xs mb-3">
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-700 tracking-tight">fleetops-control-tower</span>
                  </div>
                  <span className="hidden sm:inline text-xs text-slate-400">|</span>
                  {/* Fake Breadcrumb */}
                  <span className="hidden sm:inline text-xs font-mono text-slate-400">HQ-Logistics-West</span>
                </div>
                {/* Window Actions */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
              </div>

              {/* Stats Grid inside the preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 text-left shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        {stat.value}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">
                        / {stat.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
