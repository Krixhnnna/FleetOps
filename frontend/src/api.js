export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api');

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('fleetops_token');
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('fleetops_token', data.token);
    }
    return data;
  },

  logout() {
    localStorage.removeItem('fleetops_token');
  },

  async getVehicles() {
    const response = await fetch(`${API_BASE}/vehicles`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async updateVehicleStatus(id, data) {
    const response = await fetch(`${API_BASE}/vehicles/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async selectVehicle(id, driverName) {
    const response = await fetch(`${API_BASE}/vehicles/${id}/select`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ driverName })
    });
    return handleResponse(response);
  },

  async deselectVehicle(id) {
    const response = await fetch(`${API_BASE}/vehicles/${id}/deselect`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getShifts() {
    const response = await fetch(`${API_BASE}/shifts`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async startShift(driverName, vehicleId) {
    const response = await fetch(`${API_BASE}/shifts/start`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ driverName, vehicleId })
    });
    return handleResponse(response);
  },

  async endShift(shiftId) {
    const response = await fetch(`${API_BASE}/shifts/end`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ shiftId })
    });
    return handleResponse(response);
  },

  async getLogs() {
    const response = await fetch(`${API_BASE}/logs`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async addLog(vehicleId, event, type = 'info') {
    const response = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ vehicleId, event, type })
    });
    return handleResponse(response);
  },

  async reportIncident(incidentData) {
    const response = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(incidentData)
    });
    return handleResponse(response);
  }
};
