import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Truck, Users, Wrench, Clock, Search, Activity, 
  Battery, Gauge, MapPin, AlertTriangle, 
  TrendingUp, X, Play, Square, Bell, CheckCircle2, ChevronRight
} from 'lucide-react';
import { api } from '../api';

export default function ManagerDashboard({ vehicles, setVehicles, logs, setLogs }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toasts, setToasts] = useState([]);

  
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  
  const stats = useMemo(() => {
    const total = vehicles.length;
    const enRoute = vehicles.filter(v => v.status === 'En Route').length;
    const idle = vehicles.filter(v => v.status === 'Idle').length;
    const maintenance = vehicles.filter(v => v.status === 'Maintenance').length;
    const activeAlerts = vehicles.reduce((sum, v) => sum + v.alerts.length, 0);
    const avgFuel = Math.round(vehicles.reduce((sum, v) => sum + v.fuel, 0) / total);

    return { total, enRoute, idle, maintenance, activeAlerts, avgFuel };
  }, [vehicles]);

  
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        v.id.toLowerCase().includes(query) ||
        v.driver.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query) ||
        v.location.toLowerCase().includes(query) ||
        v.destination.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [vehicles, filterStatus, searchQuery]);

  
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  
  const addLog = useCallback((vehicleId, event, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: Date.now() + Math.random(), timestamp: time, vehicleId, event, type },
      ...prev.slice(0, 19) 
    ]);
  }, [setLogs]);

  
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      
      const randomIndex = Math.floor(Math.random() * vehicles.length);
      const vehicle = vehicles[randomIndex];
      
      let updatedStatus = vehicle.status;
      let updatedFuel = Math.max(0, vehicle.fuel - Math.floor(Math.random() * 3));
      let updatedSpeed = vehicle.speed;
      let updatedAlerts = [...vehicle.alerts];
      let eventMsg = '';
      let logType = 'info';

      
      const isMajor = Math.random() < 0.3;

      if (isMajor) {
        
        const coin = Math.random();
        if (coin < 0.33 && vehicle.status !== 'Maintenance') {
          
          updatedStatus = vehicle.status === 'En Route' ? 'Idle' : 'En Route';
          updatedSpeed = updatedStatus === 'En Route' ? Math.floor(Math.random() * 25) + 40 : 0;
          eventMsg = `Transitioned to ${updatedStatus}. Speed: ${updatedSpeed} mph.`;
          logType = 'info';
        } else if (coin < 0.66 && updatedFuel < 20 && !vehicle.alerts.some(a => a.type === 'Low Fuel')) {
          
          updatedAlerts.push({ id: 'f1', severity: 'medium', type: 'Low Fuel', message: `Fuel level critical: ${updatedFuel}% remaining` });
          eventMsg = `Fuel warning triggered at ${updatedFuel}%`;
          logType = 'warning';
          showToast(`Critical Low Fuel Alert on ${vehicle.id}`, 'warning');
        } else if (coin >= 0.66 && vehicle.alerts.length > 0) {
          
          const alertToResolve = vehicle.alerts[0];
          updatedAlerts = vehicle.alerts.filter(a => a.id !== alertToResolve.id);
          eventMsg = `Resolved alert: ${alertToResolve.type}`;
          logType = 'success';
          showToast(`Resolved alert on ${vehicle.id}: ${alertToResolve.type}`, 'success');
          
          if (vehicle.status === 'Maintenance') {
            updatedStatus = 'Idle';
            eventMsg += ' - Vehicle marked Idle (Ready for Dispatch)';
          }
        }
      } else {
        
        if (vehicle.status === 'En Route') {
          
          const speedDiff = Math.floor(Math.random() * 9) - 4; 
          updatedSpeed = Math.max(30, Math.min(75, vehicle.speed + speedDiff));
          eventMsg = `Telemetry update: Speed adjusted to ${updatedSpeed} mph.`;
          logType = 'info';
        } else if (vehicle.status === 'Idle' && Math.random() < 0.2) {
          
          updatedStatus = 'En Route';
          updatedSpeed = 45;
          eventMsg = `Dispatched. Currently heading towards Bellevue.`;
          logType = 'success';
          showToast(`${vehicle.id} dispatched from Depot.`, 'success');
        }
      }

      
      const syncSimulation = async () => {
        try {
          await api.updateVehicleStatus(vehicle.id, {
            status: updatedStatus,
            fuel: updatedFuel,
            speed: updatedSpeed,
            alerts: updatedAlerts
          });
          if (eventMsg) {
            await api.addLog(vehicle.id, eventMsg, logType);
          }
        } catch (err) {
          console.warn('Backend simulation sync failed:', err.message);
        }
      };
      syncSimulation();

      
      setVehicles(prev => prev.map((v, i) => {
        if (i === randomIndex) {
          return {
            ...v,
            status: updatedStatus,
            fuel: updatedFuel,
            speed: updatedSpeed,
            alerts: updatedAlerts
          };
        }
        return v;
      }));

      if (eventMsg) {
        addLog(vehicle.id, eventMsg, logType);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulating, vehicles, addLog, setVehicles]);

  
  const handleUpdateStatus = (vehicleId, newStatus) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    let updatedSpeed = newStatus === 'En Route' ? 55 : 0;
    let updatedAlerts = [...vehicle.alerts];

    if (newStatus === 'Maintenance' && !vehicle.alerts.some(a => a.type === 'Diagnostics Required')) {
      updatedAlerts.push({
        id: 'manual-diag',
        severity: 'medium',
        type: 'Diagnostics Required',
        message: 'Checked into service bay by operations manager.'
      });
    } else if (newStatus !== 'Maintenance') {
      updatedAlerts = vehicle.alerts.filter(a => a.id !== 'manual-diag');
    }

    
    const updateApi = async () => {
      try {
        await api.updateVehicleStatus(vehicleId, {
          status: newStatus,
          speed: updatedSpeed,
          alerts: updatedAlerts
        });
      } catch (err) {
        console.warn('Backend offline, updating local manager state only:', err.message);
      }
    };
    updateApi();

    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        return { ...v, status: newStatus, speed: updatedSpeed, alerts: updatedAlerts };
      }
      return v;
    }));

    addLog(vehicleId, `Manual status change override to ${newStatus}`, 'info');
    showToast(`Status updated: ${vehicleId} is now ${newStatus}`, 'info');
  };

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 flex flex-col font-sans antialiased relative">
      
      {}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`p-3.5 rounded-xl border shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-250 backdrop-blur-md pointer-events-auto ${
              toast.type === 'warning' 
                ? 'bg-red-50/95 border-red-200 text-red-900' 
                : toast.type === 'success'
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
                  : 'bg-blue-50/95 border-blue-200 text-blue-950'
            }`}
          >
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-75">
                {toast.type === 'warning' ? 'Alert System' : toast.type === 'success' ? 'System Success' : 'Notification'}
              </p>
              <p className="text-sm font-semibold mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              Fleet Operations Control
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
                Console Active
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Real-time fleet diagnostics, telematics, and active status tracking panel.
            </p>
          </div>

          {}
          <div className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Live Telemetry Simulation</p>
                <p className="text-[10px] text-slate-400 font-medium">{isSimulating ? 'Generating dynamic telemetry' : 'Simulation paused'}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsSimulating(!isSimulating);
                showToast(isSimulating ? 'Live telemetry simulator stopped.' : 'Live telemetry simulator activated.', isSimulating ? 'info' : 'success');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isSimulating 
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isSimulating ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-red-700" />
                  Stop Live
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-emerald-700" />
                  Start Live
                </>
              )}
            </button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fleet Size</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total} Vehicles</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> 
                100% capacity tracked
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          {}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active (En Route)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                {stats.enRoute}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                {Math.round((stats.enRoute / stats.total) * 100)}% active utilization
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Idle (Available)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.idle} Depot</h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">
                Ready for route dispatch
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Under Maintenance</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                {stats.maintenance}
                {stats.activeAlerts > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {stats.activeAlerts} Issue{stats.activeAlerts > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-red-500 font-semibold mt-1">
                Critical workshop bay diagnostics
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-slate-500 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
            
            {}
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              {}
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search fleet, drivers, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-slate-900 placeholder-slate-400 pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {}
              <div className="flex flex-wrap items-center gap-1.5">
                {['All', 'En Route', 'Idle', 'Maintenance'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

            </div>

            {}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle ID</th>
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Operator / Type</th>
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Fuel / Battery</th>
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Speed / Location</th>
                    <th className="py-3.5 px-5 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => {
                      const isSelected = selectedVehicleId === vehicle.id;
                      return (
                        <tr 
                          key={vehicle.id}
                          onClick={() => setSelectedVehicleId(vehicle.id)}
                          className={`hover:bg-slate-50/60 transition-colors cursor-pointer group select-none ${
                            isSelected ? 'bg-blue-50/40 hover:bg-blue-50/50' : ''
                          }`}
                        >
                          {}
                          <td className="py-4 px-5 align-middle">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                              {vehicle.id}
                            </span>
                            {vehicle.alerts.length > 0 && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                !
                              </span>
                            )}
                          </td>

                          {}
                          <td className="py-4 px-5 align-middle">
                            <div className="font-semibold text-sm text-slate-800">{vehicle.driver}</div>
                            <div className="text-xs text-slate-400 font-medium">{vehicle.type}</div>
                          </td>

                          {}
                          <td className="py-4 px-5 align-middle">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              vehicle.status === 'En Route' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                                : vehicle.status === 'Idle'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                  : 'bg-red-50 text-red-700 border-red-200/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                vehicle.status === 'En Route' 
                                  ? 'bg-emerald-500 animate-pulse' 
                                  : vehicle.status === 'Idle'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`}></span>
                              {vehicle.status}
                            </span>
                          </td>

                          {}
                          <td className="py-4 px-5 align-middle">
                            <div className="flex items-center gap-2">
                              <Battery className={`w-4.5 h-4.5 shrink-0 ${
                                vehicle.fuel < 20 
                                  ? 'text-red-500 animate-pulse' 
                                  : vehicle.fuel < 50
                                    ? 'text-amber-500'
                                    : 'text-emerald-500'
                              }`} />
                              <div>
                                <span className="font-semibold text-sm text-slate-800">{vehicle.fuel}%</span>
                                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-200/20">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      vehicle.fuel < 20 ? 'bg-red-500' : vehicle.fuel < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${vehicle.fuel}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>

                          {}
                          <td className="py-4 px-5 align-middle">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                              <Gauge className="w-3.5 h-3.5 text-slate-400" />
                              {vehicle.speed > 0 ? `${vehicle.speed} mph` : 'Stopped'}
                            </div>
                            <div className="text-xs text-slate-400 font-medium flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {vehicle.location}
                            </div>
                          </td>

                          {}
                          <td className="py-4 px-5 text-right align-middle">
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                        No active vehicles match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Showing {filteredVehicles.length} of {vehicles.length} tracked assets</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Autopoll Status: Active
              </span>
            </div>

          </div>

          {}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 flex flex-col h-[520px]">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-blue-600" />
                  Live Event Feed
                </h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {logs.length} Logged
                </span>
              </div>

              {}
              <div className="flex-grow overflow-y-auto mt-4 space-y-3.5 pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="text-xs border-b border-slate-50 pb-3 flex items-start gap-2.5 group">
                    <span className="font-bold text-slate-400 bg-slate-50 border border-slate-100/50 px-1.5 py-0.5 rounded scale-95 uppercase text-[9px] mt-0.5 select-none font-mono">
                      {log.timestamp}
                    </span>
                    <div className="flex-grow">
                      <p className="text-slate-800 font-medium">
                        <span className="font-bold text-slate-950 hover:underline cursor-pointer" onClick={() => setSelectedVehicleId(log.vehicleId)}>
                          {log.vehicleId}
                        </span>
                        : {log.event}
                      </p>
                    </div>
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.type === 'warning'
                        ? 'bg-red-500'
                        : log.type === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                    }`} />
                  </div>
                ))}
              </div>

              {}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Updated in real-time</span>
                <button 
                  onClick={() => {
                    setLogs([{ id: 100, timestamp: 'Now', vehicleId: 'System', event: 'Cleared log terminal history', type: 'info' }]);
                    showToast('Log history cleared', 'info');
                  }}
                  className="hover:text-red-600 transition-colors focus:outline-none cursor-pointer"
                >
                  Clear Feed
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {}
      {selectedVehicle && (
        <>
          {}
          <div 
            onClick={() => setSelectedVehicleId(null)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {}
          <div className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
            
            {}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-950">{selectedVehicle.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedVehicle.status === 'En Route' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : selectedVehicle.status === 'Idle'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Asset Telemetry Diagnostics</p>
              </div>
              <button 
                onClick={() => setSelectedVehicleId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {}
              <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Driver</span>
                    <h4 className="text-base font-bold text-slate-900">{selectedVehicle.driver}</h4>
                  </div>
                  <div className="bg-white border border-slate-200 p-2 rounded-xl text-slate-600 shadow-2xs">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="border-t border-slate-200/60 pt-3 flex justify-between text-xs text-slate-500 font-semibold">
                  <span>Class type:</span>
                  <span className="text-slate-800">{selectedVehicle.type}</span>
                </div>
              </div>

              {}
              {selectedVehicle.alerts.length > 0 && (
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4.5 space-y-2.5">
                  <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                    Active Warning Codes
                  </h4>
                  {selectedVehicle.alerts.map(alert => (
                    <div key={alert.id} className="text-xs bg-white border border-red-100 p-3 rounded-xl shadow-3xs">
                      <div className="font-bold text-red-700 uppercase tracking-wider text-[9px]">{alert.type}</div>
                      <p className="text-slate-700 mt-1 font-semibold">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manager Quick Override</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['En Route', 'Idle', 'Maintenance'].map((status) => {
                    const isActive = selectedVehicle.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedVehicle.id, status)}
                        className={`py-2 text-[11px] font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          isActive
                            ? status === 'En Route' 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : status === 'Idle'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engine Diagnostic Telematics</h4>
                
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Fuel</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block flex items-center gap-1.5">
                      <Battery className="w-5 h-5 text-emerald-500" />
                      {selectedVehicle.fuel}%
                    </span>
                  </div>

                  {}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Speed</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block flex items-center gap-1.5">
                      <Gauge className="w-5 h-5 text-blue-500" />
                      {selectedVehicle.speed} mph
                    </span>
                  </div>

                  {}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coolant Temp</span>
                    <span className={`text-base font-black mt-1 block ${selectedVehicle.telemetry.temp > 210 ? 'text-red-600' : 'text-slate-900'}`}>
                      {selectedVehicle.telemetry.temp}°F
                    </span>
                  </div>

                  {}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tire Pressure</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">
                      {selectedVehicle.telemetry.pressure}
                    </span>
                  </div>

                </div>

                {}
                <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cargo Load Weight</span>
                  <span className="text-sm font-bold text-slate-900 mt-1 block">
                    {selectedVehicle.telemetry.load}
                  </span>
                </div>

              </div>

              {}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telemetry Routing Map</h4>
                <div className="relative h-44 bg-slate-900 border border-slate-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                  {}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  {}
                  <svg className="w-full h-full absolute inset-0 text-slate-700/40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 30,50 Q 150,20 200,90 T 380,120" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5, 5" />
                    <path d="M 50,150 C 120,80 280,160 350,60" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="200" cy="90" r="4" fill="#3b82f6" />
                    <circle cx="350" cy="60" r="4" fill="#f59e0b" />
                  </svg>

                  {}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="relative flex h-5 w-5 mx-auto">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border-2 border-white shadow-md items-center justify-center">
                        <Truck className="w-3 h-3 text-white" />
                      </span>
                    </span>
                  </div>

                  {}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-lg p-2 flex items-center justify-between text-[10px] text-slate-300 font-semibold">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      Loc: {selectedVehicle.location}
                    </span>
                    <span className="text-right text-slate-400">
                      Dest: {selectedVehicle.destination}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <span>Last polled: Just now</span>
              <button 
                onClick={() => {
                  showToast(`Diagnostics log generated for ${selectedVehicle.id}`, 'success');
                }}
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline focus:outline-none cursor-pointer"
              >
                Export Diagnostics
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
