import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Truck, Clock, Activity, AlertTriangle, Gauge, Battery, 
  MapPin, Play, Square, X, CheckCircle2, Bell, History, AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function DriverDashboard({ vehicles, setVehicles, setLogs, user }) {
  const driverEmail = user?.email || 'driver@fleetops.com';
  const [driverName, setDriverName] = useState(() => {
    const emailPrefix = user?.email ? user.email.split('@')[0] : 'Driver';
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  });

  const [activeShift, setActiveShift] = useState(false);
  const [shiftId, setShiftId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [incidentType, setIncidentType] = useState('Breakdown');
  const [incidentSeverity, setIncidentSeverity] = useState('medium');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const [localShifts, setLocalShifts] = useState([]);
  const [localIncidents, setLocalIncidents] = useState([]);

  const [liveTelemetry, setLiveTelemetry] = useState(null);
  
  const telemetryRef = useRef(null);
  telemetryRef.current = liveTelemetry;

  const currentVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Idle');
  }, [vehicles]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    let timer;
    if (activeShift) {
      timer = setInterval(() => {
        setShiftSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setShiftSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeShift]);

  useEffect(() => {
    if (!activeShift || !selectedVehicleId) return;

    if (currentVehicle) {
      setLiveTelemetry({
        speed: currentVehicle.speed || 55,
        fuel: currentVehicle.fuel || 80,
        temp: currentVehicle.telemetry?.temp || 180,
        pressure: currentVehicle.telemetry?.pressure || '95 psi',
        location: currentVehicle.location || 'Terminal Depot'
      });
    }

    const interval = setInterval(async () => {
      const currentVal = telemetryRef.current;
      if (!currentVal) return;

      const speedChange = Math.floor(Math.random() * 9) - 4; 
      const newSpeed = Math.max(30, Math.min(75, currentVal.speed + speedChange));
      
      const newFuel = Math.max(1, Math.round((currentVal.fuel - 0.2) * 10) / 10);
      
      const tempDiff = Math.floor(Math.random() * 5) - 2; 
      const newTemp = Math.max(160, Math.min(230, currentVal.temp + tempDiff));

      const updatedTelemetry = {
        speed: newSpeed,
        fuel: Math.floor(newFuel),
        temp: newTemp,
        pressure: currentVal.pressure,
        location: currentVal.location
      };

      setLiveTelemetry(updatedTelemetry);

      try {
        await api.updateVehicleStatus(selectedVehicleId, {
          status: 'En Route',
          speed: newSpeed,
          fuel: Math.floor(newFuel),
          telemetry: {
            temp: newTemp,
            load: currentVehicle?.telemetry?.load || 'General Freight',
            pressure: currentVal.pressure
          }
        });
      } catch (err) {
        console.warn('Backend sync failed, updating local state:', err.message);
        setVehicles(prev => prev.map(v => {
          if (v.id === selectedVehicleId) {
            return {
              ...v,
              status: 'En Route',
              speed: newSpeed,
              fuel: Math.floor(newFuel),
              telemetry: {
                ...v.telemetry,
                temp: newTemp
              }
            };
          }
          return v;
        }));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeShift, selectedVehicleId, currentVehicle, setVehicles]);

  const handleStartShift = async () => {
    if (!selectedVehicleId) {
      showToast('Please select a vehicle first.', 'warning');
      return;
    }

    try {
      const result = await api.startShift(driverName, selectedVehicleId);
      
      setActiveShift(true);
      setShiftId(result.shift?.id || Date.now().toString());
      
      showToast(`Shift started on vehicle ${selectedVehicleId}`, 'success');
    } catch (err) {
      console.warn('Backend offline, starting shift locally.', err.message);
      setVehicles(prev => prev.map(v => {
        if (v.id === selectedVehicleId) {
          return { ...v, driver: driverName, status: 'En Route', speed: 55 };
        }
        return v;
      }));

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog = {
        id: Date.now(),
        timestamp: time,
        vehicleId: selectedVehicleId,
        event: `Driver ${driverName} started shift. Status: En Route.`,
        type: 'success'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 19)]);
      
      setActiveShift(true);
      setShiftId(Date.now().toString());
      showToast(`Shift started locally (Offline) on ${selectedVehicleId}`, 'success');
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    const currentVehicleId = selectedVehicleId;
    const durationStr = formatTime(shiftSeconds);

    try {
      await api.endShift(shiftId);
      
      const completedShift = {
        id: shiftId,
        vehicleId: currentVehicleId,
        date: new Date().toLocaleDateString(),
        duration: durationStr,
        status: 'Completed'
      };
      setLocalShifts(prev => [completedShift, ...prev]);

      setActiveShift(false);
      setShiftId(null);
      setSelectedVehicleId('');
      setLiveTelemetry(null);

      showToast(`Shift completed! Duration: ${durationStr}`, 'success');
    } catch (err) {
      console.warn('Backend offline, ending shift locally.', err.message);
      
      setVehicles(prev => prev.map(v => {
        if (v.id === currentVehicleId) {
          return { ...v, driver: 'N/A', status: 'Idle', speed: 0 };
        }
        return v;
      }));

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog = {
        id: Date.now(),
        timestamp: time,
        vehicleId: currentVehicleId,
        event: `Driver ${driverName} ended shift. Status: Idle.`,
        type: 'info'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 19)]);

      const completedShift = {
        id: shiftId || Date.now().toString(),
        vehicleId: currentVehicleId,
        date: new Date().toLocaleDateString(),
        duration: durationStr,
        status: 'Completed'
      };
      setLocalShifts(prev => [completedShift, ...prev]);

      setActiveShift(false);
      setShiftId(null);
      setSelectedVehicleId('');
      setLiveTelemetry(null);
      
      showToast(`Shift completed locally (Offline)! Duration: ${durationStr}`, 'success');
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      showToast('You must have an active vehicle to file an incident.', 'warning');
      return;
    }
    if (!incidentDesc.trim() || !incidentLocation.trim()) {
      showToast('Please fill in location and description.', 'warning');
      return;
    }

    setIsSubmittingIncident(true);

    const incidentData = {
      vehicleId: selectedVehicleId,
      driverName: driverName,
      type: incidentType,
      severity: incidentSeverity,
      location: incidentLocation,
      description: incidentDesc
    };

    try {
      await api.reportIncident(incidentData);
      
      setLocalIncidents(prev => [
        {
          id: Date.now().toString(),
          ...incidentData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);

      setIncidentLocation('');
      setIncidentDesc('');
      setIsReporting(false);
      showToast('Incident reported successfully!', 'warning');
    } catch (err) {
      console.warn('Backend offline, reporting incident locally.', err.message);
      
      const newAlert = {
        id: 'alert-' + Date.now(),
        severity: incidentSeverity === 'high' ? 'high' : incidentSeverity === 'medium' ? 'medium' : 'low',
        type: incidentType,
        message: incidentDesc
      };

      setVehicles(prev => prev.map(v => {
        if (v.id === selectedVehicleId) {
          return {
            ...v,
            alerts: [...v.alerts, newAlert]
          };
        }
        return v;
      }));

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: time,
        vehicleId: selectedVehicleId,
        event: `Incident Reported (${incidentType}): ${incidentDesc}`,
        type: incidentSeverity === 'high' ? 'warning' : 'info'
      };
      setLogs(prev => [newLog, ...prev.slice(0, 19)]);

      setLocalIncidents(prev => [
        {
          id: Date.now().toString(),
          ...incidentData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);

      setIncidentLocation('');
      setIncidentDesc('');
      setIsReporting(false);
      showToast('Incident reported locally (Offline)', 'warning');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleToggleStatus = async (newStatus) => {
    if (!activeShift || !selectedVehicleId) return;

    try {
      const speedVal = newStatus === 'En Route' ? 55 : 0;
      await api.updateVehicleStatus(selectedVehicleId, {
        status: newStatus,
        speed: speedVal
      });

      if (liveTelemetry) {
        setLiveTelemetry(prev => ({
          ...prev,
          status: newStatus,
          speed: speedVal
        }));
      }

      showToast(`Status toggled to ${newStatus}`, 'info');
    } catch (err) {
      console.warn('Backend offline, toggling status locally:', err.message);
      const speedVal = newStatus === 'En Route' ? 55 : 0;
      setVehicles(prev => prev.map(v => {
        if (v.id === selectedVehicleId) {
          return { ...v, status: newStatus, speed: speedVal };
        }
        return v;
      }));
      if (liveTelemetry) {
        setLiveTelemetry(prev => ({
          ...prev,
          speed: speedVal
        }));
      }
      showToast(`Status toggled to ${newStatus} locally`, 'info');
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 flex flex-col font-sans antialiased relative">
      
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
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              Driver Operations Terminal
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                activeShift 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeShift ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                }`}></span>
                {activeShift ? 'On Shift' : 'Off Duty'}
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Select vehicle, toggle operation statuses, check engine diagnostics and report incidents on duty.
            </p>
          </div>

          <div className="text-right text-xs text-slate-550 font-bold bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto">
            <span className="text-slate-400 font-normal">OPERATOR: </span>
            <span className="text-slate-900 font-extrabold mr-2">{driverName}</span>
            <span className="text-blue-600 font-mono font-normal border-l border-slate-200 pl-2 select-all">{driverEmail}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                Shift Controller
              </h2>

              {!activeShift ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="driver-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Driver Name
                    </label>
                    <input
                      id="driver-name-input"
                      type="text"
                      placeholder="Enter driver name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full text-sm text-slate-950 border border-slate-300 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicle-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Assign Fleet Vehicle
                    </label>
                    <select
                      id="vehicle-select"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full text-sm text-slate-950 border border-slate-300 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 cursor-pointer"
                    >
                      <option value="">-- Choose an Available Vehicle --</option>
                      {availableVehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.id} - {v.type} ({v.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentVehicle && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 font-medium">
                      <div className="flex justify-between">
                        <span>Vehicle Class:</span>
                        <strong className="text-slate-800">{currentVehicle.type}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel/Battery Level:</span>
                        <strong className="text-slate-800">{currentVehicle.fuel}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Location:</span>
                        <strong className="text-slate-800">{currentVehicle.location}</strong>
                      </div>
                      {currentVehicle.alerts.length > 0 && (
                        <div className="border-t border-blue-200/50 pt-2 flex items-center gap-1.5 text-red-600 font-bold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{currentVehicle.alerts.length} Active System Warnings!</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleStartShift}
                    disabled={!selectedVehicleId}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-450 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Play className="w-4.5 h-4.5 fill-white" />
                    Start Shift Session
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block relative z-10">Active Duty Duration</span>
                    <span className="text-3xl font-black font-mono tracking-wider mt-1.5 block text-emerald-400 relative z-10">
                      {formatTime(shiftSeconds)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block relative z-10">Assigned Vehicle: <strong className="text-white">{selectedVehicleId}</strong></span>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Operational Status Updates</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleStatus('En Route')}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          currentVehicle?.status === 'En Route'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        En Route
                      </button>
                      <button
                        onClick={() => handleToggleStatus('Idle')}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          currentVehicle?.status === 'Idle'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Idle (At Depot)
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-5">
                    <button
                      onClick={() => setIsReporting(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 border border-red-200 rounded-xl text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4.5 h-4.5" />
                      Report Road/Vehicle Incident
                    </button>
                    <button
                      onClick={handleEndShift}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition-colors cursor-pointer"
                    >
                      <Square className="w-4.5 h-4.5 fill-white" />
                      End Shift Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <History className="w-4.5 h-4.5 text-slate-500" />
                Driver Shift Records (Session)
              </h3>
              
              <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-1">
                {localShifts.length > 0 ? (
                  localShifts.map((shift, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2.5">
                      <div>
                        <strong className="text-slate-900">{shift.vehicleId}</strong>
                        <span className="text-slate-400 block text-[10px] font-semibold mt-0.5">{shift.date}</span>
                      </div>
                      <span className="font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {shift.duration}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">No shifts completed in this session.</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            
            {activeShift && liveTelemetry ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Live Cabin Telematics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-blue-100/60 p-3 rounded-lg text-blue-600">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Current Velocity</span>
                      <strong className="text-xl font-black text-slate-900">{liveTelemetry.speed} mph</strong>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-emerald-100/60 p-3 rounded-lg text-emerald-600">
                      <Battery className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Fuel / Battery Status</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-xl font-black text-slate-900">{liveTelemetry.fuel}%</strong>
                        <div className="flex-grow bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-350/10">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              liveTelemetry.fuel < 25 ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${liveTelemetry.fuel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Engine Temperature</span>
                      <strong className={`text-xl font-black ${liveTelemetry.temp > 215 ? 'text-red-650' : 'text-slate-900'}`}>
                        {liveTelemetry.temp} °F
                      </strong>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">Payload Cargo Load</span>
                      <strong className="text-sm font-bold text-slate-800">
                        {currentVehicle?.telemetry?.load || 'General Freight'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Route Telematics Map</h3>
                  <div className="relative h-44 bg-slate-900 border border-slate-950 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    
                    <svg className="w-full h-full absolute inset-0 text-slate-700/40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 30,50 Q 150,20 200,90 T 380,120" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5, 5" />
                      <circle cx="200" cy="90" r="4" fill="#3b82f6" />
                      <circle cx="350" cy="60" r="4" fill="#f59e0b" />
                    </svg>

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <span className="relative flex h-5 w-5 mx-auto">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border-2 border-white shadow-md items-center justify-center">
                          <Truck className="w-3 h-3 text-white" />
                        </span>
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/85 backdrop-blur-xs border border-slate-800 rounded-lg p-2 flex items-center justify-between text-[10px] text-slate-350 font-semibold font-sans">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        Loc: {liveTelemetry.location}
                      </span>
                      <span>
                        Dest: {currentVehicle?.destination || 'Depot'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-full text-slate-400 mb-4">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Shift Session Active</h3>
                <p className="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed font-medium">
                  Please select an available vehicle in the Shift Controller on the left, then click Start Shift to initialize telemetry tracking.
                </p>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                My Incident Logs (Session)
              </h3>
              
              <div className="mt-4 space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {localIncidents.length > 0 ? (
                  localIncidents.map((incident, idx) => (
                    <div key={idx} className="text-xs border-b border-slate-50 pb-3 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            incident.severity === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : incident.severity === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                            {incident.severity}
                          </span>
                          <strong className="text-slate-900">{incident.type}</strong>
                        </div>
                        <p className="text-slate-650 font-semibold">{incident.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">{incident.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">No incidents reported in this session.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {isReporting && (
        <>
          <div 
            onClick={() => setIsReporting(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          />

          <div className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-650" />
                  Report Incident
                </h3>
                <p className="text-xs text-slate-405 font-semibold mt-0.5">Asset Warning Dispatcher</p>
              </div>
              <button 
                onClick={() => setIsReporting(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="flex-grow flex flex-col justify-between overflow-hidden">
              <div className="flex-grow overflow-y-auto p-6 space-y-5">
                
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Active Fleet Vehicle:</span>
                  <strong className="text-slate-900 font-mono text-sm">{selectedVehicleId}</strong>
                </div>

                <div>
                  <label htmlFor="incident-type" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Incident Type
                  </label>
                  <select
                    id="incident-type"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full text-sm text-slate-950 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Breakdown">Vehicle Breakdown / Engine Fault</option>
                    <option value="Accident">Accident / Collision</option>
                    <option value="Fuel/Refill">Refuel / Critical Recharging</option>
                    <option value="Route Block">Traffic / Road Block / Closure</option>
                    <option value="Weather Delay">Severe Weather Hazard</option>
                    <option value="Medical Alert">Medical / Crew Emergency</option>
                    <option value="Other">Other Operational Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((severity) => (
                      <button
                        key={severity}
                        type="button"
                        onClick={() => setIncidentSeverity(severity)}
                        className={`py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer uppercase text-center ${
                          incidentSeverity === severity
                            ? severity === 'high' 
                              ? 'bg-red-50 text-red-700 border-red-300 shadow-3xs'
                              : severity === 'medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-3xs'
                                : 'bg-blue-50 text-blue-700 border-blue-300 shadow-3xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="incident-location" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Current Location (City, State / Landmark)
                  </label>
                  <input
                    id="incident-location"
                    type="text"
                    required
                    placeholder="e.g. Denver, CO / Hwy 70 East"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    className="w-full text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                  />
                </div>

                <div>
                  <label htmlFor="incident-desc" className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Detailed Report / Description
                  </label>
                  <textarea
                    id="incident-desc"
                    required
                    rows="4"
                    placeholder="Provide details about the issue to alert dispatch controllers..."
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    className="w-full text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                  />
                </div>

              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="w-1/3 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIncident}
                  className="w-2/3 py-3 border border-transparent rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors cursor-pointer text-center"
                >
                  {isSubmittingIncident ? 'Submitting...' : 'Submit Alert Dispatch'}
                </button>
              </div>

            </form>

          </div>
        </>
      )}

    </div>
  );
}
