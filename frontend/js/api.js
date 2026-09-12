/* api.js - NEXUS ARENA API Client
   High-performance REST API connector for tournaments, matches, and authentication. */

// Base endpoint for the Nexus Arena backend API (Supports any port, LiveServer & production)
const API_BASE_URL = (() => {
  if (typeof window === 'undefined') return '/api';
  // If opened directly via file:// in browser, default to port 5001
  if (window.location.protocol === 'file:') return 'http://localhost:5001/api';

  // If opened via a typical separate frontend dev server (VS Code Live Server 5500, Vite 5173, etc.)
  const devServerPorts = ['5500', '5501', '3000', '8080', '5173'];
  if (devServerPorts.includes(window.location.port)) {
    return 'http://localhost:5001/api';
  }

  // When served by the Express backend on ANY port (5001, 5002, etc.), use relative '/api'
  return '/api';
})();

/**
 * Generic request helper with automatic JWT token attachment and error handling.
 */
async function apiRequest(endpoint, { method = 'GET', body = null, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('nexus_token') || localStorage.getItem('ga_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch (networkError) {
    const err = new Error(`Unable to establish neural link with Nexus servers. Ensure backend is running on port ${BACKEND_PORT}.`);
    err.isNetworkError = true;
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const err = new Error((data && data.message) || 'Request failed. Please verify competitive parameters.');
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* ---------------- System Health Endpoints ---------------- */
const HealthAPI = {
  check: () => apiRequest('/health', { auth: false }),
  reconnect: () => apiRequest('/health/reconnect', { method: 'POST', auth: false }),
};

/* ---------------- Auth Endpoints ---------------- */
const AuthAPI = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me'),
};

/* ---------------- User Profile ---------------- */
const UserAPI = {
  updateProfile: (payload) => apiRequest('/users/profile', { method: 'PUT', body: payload }),
  getById: (id) => apiRequest(`/users/${id}`),
};

/* ---------------- Tournament Management ---------------- */
const TournamentAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tournaments${query ? `?${query}` : ''}`, { auth: false });
  },
  getById: (id) => apiRequest(`/tournaments/${id}`, { auth: false }),
  create: (payload) => apiRequest('/tournaments', { method: 'POST', body: payload }),
  update: (id, payload) => apiRequest(`/tournaments/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiRequest(`/tournaments/${id}`, { method: 'DELETE' }),
  mine: () => apiRequest('/tournaments/organizer/mine'),
};

/* ---------------- Competitor Registrations ---------------- */
const RegistrationAPI = {
  join: (tournamentId) => apiRequest(`/registrations/${tournamentId}`, { method: 'POST' }),
  cancel: (id) => apiRequest(`/registrations/cancel/${id}`, { method: 'PUT' }),
  approve: (id) => apiRequest(`/registrations/${id}/approve`, { method: 'PUT' }),
  reject: (id) => apiRequest(`/registrations/${id}/reject`, { method: 'PUT' }),
  forTournament: (tournamentId) => apiRequest(`/registrations/tournament/${tournamentId}`),
  mine: () => apiRequest('/registrations/mine'),
};

/* ---------------- Match Coordination ---------------- */
const MatchAPI = {
  create: (payload) => apiRequest('/matches', { method: 'POST', body: payload }),
  forTournament: (tournamentId) => apiRequest(`/matches/tournament/${tournamentId}`, { auth: false }),
  updateSchedule: (id, payload) => apiRequest(`/matches/${id}`, { method: 'PUT', body: payload }),
  updateResult: (id, payload) => apiRequest(`/matches/${id}/result`, { method: 'PUT', body: payload }),
};

/* ---------------- Dynamic Leaderboard ---------------- */
const LeaderboardAPI = {
  forTournament: (tournamentId) => apiRequest(`/leaderboard/${tournamentId}`, { auth: false }),
};

/* ---------------- Hall of Fame / Results ---------------- */
const ResultAPI = {
  publish: (tournamentId) => apiRequest(`/results/${tournamentId}/publish`, { method: 'POST' }),
  getResult: (tournamentId) => apiRequest(`/results/${tournamentId}`, { auth: false }),
};

/* ---------------- Command Center Dashboard ---------------- */
const DashboardAPI = {
  organizer: () => apiRequest('/dashboard/organizer'),
  player: () => apiRequest('/dashboard/player'),
};
