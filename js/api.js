// ===== API SERVICE =====
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

const Auth = {
  getToken: () => localStorage.getItem('edu_token'),
  setToken: (t) => localStorage.setItem('edu_token', t),
  removeToken: () => localStorage.removeItem('edu_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('edu_user')); } catch { return null; } },
  setUser: (u) => localStorage.setItem('edu_user', JSON.stringify(u)),
  removeUser: () => localStorage.removeItem('edu_user'),
  isLoggedIn: () => !!localStorage.getItem('edu_token')
};

async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body === 'object') options.body = JSON.stringify(options.body);
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) { Auth.removeToken(); Auth.removeUser(); window.location.reload(); return; }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Server xatosi');
  return data;
}

const AuthAPI = {
  async login(email, password) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
    Auth.setToken(data.token); Auth.setUser(data.user); return data.user;
  },
  async register(fields) {
    const data = await apiFetch('/auth/register', { method: 'POST', body: fields });
    Auth.setToken(data.token); Auth.setUser(data.user); return data.user;
  },
  async me() { const u = await apiFetch('/auth/me'); Auth.setUser(u); return u; },
  async updateMe(fields) { const u = await apiFetch('/auth/me', { method: 'PUT', body: fields }); Auth.setUser(u); return u; },
  logout() { Auth.removeToken(); Auth.removeUser(); }
};

const GroupsAPI = {
  getAll: () => apiFetch('/groups'),
  get: (id) => apiFetch(`/groups/${id}`),
  create: (d) => apiFetch('/groups', { method: 'POST', body: d }),
  update: (id, d) => apiFetch(`/groups/${id}`, { method: 'PUT', body: d }),
  delete: (id) => apiFetch(`/groups/${id}`, { method: 'DELETE' }),
  addMember: (gid, name) => apiFetch(`/groups/${gid}/members`, { method: 'POST', body: { name } }),
  removeMember: (gid, mid) => apiFetch(`/groups/${gid}/members/${mid}`, { method: 'DELETE' })
};

const AssignmentsAPI = {
  getAll: (p = {}) => apiFetch('/assignments?' + new URLSearchParams(p)),
  get: (id) => apiFetch(`/assignments/${id}`),
  create: (fd) => apiFetch('/assignments', { method: 'POST', body: fd }),
  update: (id, d) => apiFetch(`/assignments/${id}`, { method: 'PUT', body: d }),
  delete: (id) => apiFetch(`/assignments/${id}`, { method: 'DELETE' })
};

const ArchiveAPI = {
  getAll: (p = {}) => apiFetch('/archive?' + new URLSearchParams(p)),
  getFolders: () => apiFetch('/archive/folders'),
  upload: (fd) => apiFetch('/archive', { method: 'POST', body: fd }),
  delete: (id) => apiFetch(`/archive/${id}`, { method: 'DELETE' })
};

const PostsAPI = {
  getAll: (p = {}) => apiFetch('/posts?' + new URLSearchParams(p)),
  create: (fd) => apiFetch('/posts', { method: 'POST', body: fd }),
  delete: (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
  like: (id) => apiFetch(`/posts/${id}/like`, { method: 'POST' }),
  save: (id) => apiFetch(`/posts/${id}/save`, { method: 'POST' }),
  getComments: (id) => apiFetch(`/posts/${id}/comments`),
  addComment: (id, body) => apiFetch(`/posts/${id}/comments`, { method: 'POST', body: { body } })
};

const StatsAPI = { get: () => apiFetch('/stats') };
const NotifsAPI = {
  getAll: () => apiFetch('/notifications'),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' })
};

function fileUrl(filename) {
  if (!filename) return null;
  const base = API_URL.replace('/api', '');
  return `${base}/uploads/${filename}`;
}
