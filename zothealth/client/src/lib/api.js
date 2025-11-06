const API_BASE = '/api';
export function setAuthToken(token){ localStorage.setItem('accessToken', token || ''); }
export function getAuthHeaders(){ const t = localStorage.getItem('accessToken'); return t ? { Authorization: `Bearer ${t}` } : {}; }
async function handle(res){ if(!res.ok){ const err = await res.json().catch(()=>({})); throw new Error(err.message || `HTTP ${res.status}`);} return res.json().catch(()=>({})); }
export const auth = {
  register:(data)=> fetch(`${API_BASE}/auth/register`,{ method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(data)}).then(handle),
  login:(data)=> fetch(`${API_BASE}/auth/login`,{ method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify(data)}).then(handle),
  refresh:()=> fetch(`${API_BASE}/auth/refresh`,{ method:'POST', credentials:'include' }).then(handle),
  logout:()=> fetch(`${API_BASE}/auth/logout`,{ method:'POST', credentials:'include' }).then(handle)
};
export const users = {
  me:()=> fetch(`${API_BASE}/users/me`, { headers: getAuthHeaders() }).then(handle),
  updateMe:(data)=> fetch(`${API_BASE}/users/me`, { method:'PUT', headers:{ 'Content-Type':'application/json', ...getAuthHeaders() }, body: JSON.stringify(data) }).then(handle)
};
export const workouts = {
  list:()=> fetch(`${API_BASE}/workouts`, { headers: getAuthHeaders() }).then(handle),
  create:(data)=> fetch(`${API_BASE}/workouts`, { method:'POST', headers:{ 'Content-Type':'application/json', ...getAuthHeaders() }, body: JSON.stringify(data) }).then(handle)
};
export const meals = {
  list:(date)=> fetch(`${API_BASE}/meals${date?`?date=${encodeURIComponent(date)}`:''}`, { headers: getAuthHeaders() }).then(handle),
  create:(data)=> fetch(`${API_BASE}/meals`, { method:'POST', headers:{ 'Content-Type':'application/json', ...getAuthHeaders() }, body: JSON.stringify(data) }).then(handle),
  dailySummary:(date)=> fetch(`${API_BASE}/meals/daily/summary?date=${encodeURIComponent(date)}`, { headers: getAuthHeaders() }).then(handle)
};
export const ai = { generatePlan:(data)=> fetch(`${API_BASE}/ai/generate-plan`, { method:'POST', headers:{ 'Content-Type':'application/json', ...getAuthHeaders() }, body: JSON.stringify(data) }).then(handle) };
export const search = { diningHall:()=> fetch(`${API_BASE}/search/dining-hall`, { headers: getAuthHeaders() }).then(handle) };
