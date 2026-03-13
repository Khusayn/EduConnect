// ===== APP STATE =====
const APP = {
  currentPage: 'dashboard',
  user: null,
  activeTab: {},
  notifOpen: false,
  cache: {}
};

// ===== NAVIGATION =====
function navigate(page) {
  APP.currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const titles = { dashboard:'Bosh sahifa', groups:'Guruhlarim', assignments:'Topshiriqlar', archive:'Arxivim', community:'Hamjamiyat', profile:'Profil' };
  const el = document.getElementById('topbar-title');
  if (el) el.textContent = titles[page] || page;
  window.scrollTo(0, 0);
  renderPage();
}

function renderPage() {
  const renderers = {
    dashboard: renderDashboard,
    groups: renderGroups,
    assignments: renderAssignments,
    archive: renderArchive,
    community: renderCommunity,
    profile: renderProfile
  };
  const fn = renderers[APP.currentPage];
  if (fn) fn();
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `position:fixed;bottom:28px;right:28px;background:${type==='success'?'var(--accent)':'var(--accent3)'};color:${type==='success'?'#000':'#fff'};padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;z-index:9999;animation:fadeIn 0.25s ease;box-shadow:0 8px 24px rgba(0,0,0,0.3)`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== MODALS =====
function openModal(type) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  overlay.classList.add('open');

  const groups = APP.cache?.groups || [];

  const modals = {
    newGroup: {
      title: 'Yangi guruh yaratish',
      content: `
        <div class="form-group"><label class="form-label">Guruh nomi</label><input id="m-group-name" class="form-input" placeholder="9-A sinf"></div>
        <div class="grid-2" style="gap:14px">
          <div class="form-group"><label class="form-label">Fan</label>
            <select id="m-group-subject" class="form-input"><option>Matematika</option><option>Fizika</option><option>Kimyo</option><option>Tarix</option><option>Biologiya</option></select>
          </div>
          <div class="form-group"><label class="form-label">Sinf / kurs</label><input id="m-group-grade" class="form-input" placeholder="9"></div>
        </div>
        <div class="form-group"><label class="form-label">Tavsif (ixtiyoriy)</label><textarea id="m-group-desc" class="form-input" placeholder="Guruh haqida qisqacha..." rows="3"></textarea></div>`,
      onSave: saveNewGroup
    },
    newAssignment: {
      title: 'Yangi topshiriq',
      content: `
        <div class="form-group"><label class="form-label">Sarlavha</label><input id="m-a-title" class="form-input" placeholder="Topshiriq nomi..."></div>
        <div class="form-group"><label class="form-label">Tavsif / Ko'rsatma</label><textarea id="m-a-desc" class="form-input" rows="3" placeholder="O'quvchilarga ko'rsatma..."></textarea></div>
        <div class="grid-2" style="gap:14px">
          <div class="form-group"><label class="form-label">Guruh</label>
            <select id="m-a-group" class="form-input">
              ${groups.length ? groups.map(g=>`<option value="${g.id}">${g.name}</option>`).join('') : '<option value="">— Guruh yo\'q —</option>'}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Deadline</label><input id="m-a-deadline" type="date" class="form-input"></div>
        </div>
        <div class="grid-2" style="gap:14px">
          <div class="form-group"><label class="form-label">Topshiriq turi</label>
            <select id="m-a-type" class="form-input"><option value="yakka">Yakka</option><option value="guruh">Guruh</option></select>
          </div>
          <div class="form-group"><label class="form-label">Teglar</label><input id="m-a-tags" class="form-input" placeholder="algebra, tenglama, test..."></div>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Fayl biriktirish (ixtiyoriy)</label>
          <input type="file" id="m-a-file" class="form-input" accept=".pdf,.docx,.pptx,.mp4,.jpg,.png">
        </div>`,
      onSave: saveNewAssignment
    },
    newPost: {
      title: 'Yangi post yaratish',
      content: `
        <div class="form-group">
          <label class="form-label">Kanal</label>
          <select id="m-p-channel" class="form-input">
            <option>Matematika o'qituvchilari</option><option>Fizika kanali</option><option>Metodika bo'limi</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Matn</label><textarea id="m-p-body" class="form-input" rows="5" placeholder="Material haqida yozing..."></textarea></div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-label">Fayl (ixtiyoriy)</label>
          <input type="file" id="m-p-file" class="form-input" accept=".pdf,.docx,.pptx,.jpg,.png">
        </div>`,
      onSave: saveNewPost
    }
  };

  const modal = modals[type];
  if (!modal) return;

  body.innerHTML = `
    <div class="modal-header">
      <div class="modal-title">${modal.title}</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    ${modal.content}
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
      <button class="btn btn-secondary" onclick="closeModal()">Bekor qilish</button>
      <button id="modal-save-btn" class="btn btn-primary" onclick="${type === 'newPost' ? 'saveNewPost' : type === 'newGroup' ? 'saveNewGroup' : 'saveNewAssignment'}()">
        ${type === 'newPost' ? 'Ulashish' : 'Yaratish'}
      </button>
    </div>`;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ── Modal savers ───────────────────────────────────────
async function saveNewGroup() {
  const name = document.getElementById('m-group-name')?.value?.trim();
  const subject = document.getElementById('m-group-subject')?.value;
  const grade = document.getElementById('m-group-grade')?.value;
  const description = document.getElementById('m-group-desc')?.value;
  if (!name) return showToast('Guruh nomini kiriting', 'error');

  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true; btn.textContent = 'Saqlanmoqda...';
  try {
    await API.groups.create({ name, subject, grade, description });
    closeModal();
    showToast('Guruh yaratildi!');
    if (APP.currentPage === 'groups') navigate('groups');
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false; btn.textContent = 'Yaratish';
  }
}

async function saveNewAssignment() {
  const title = document.getElementById('m-a-title')?.value?.trim();
  const group_id = document.getElementById('m-a-group')?.value;
  const deadline = document.getElementById('m-a-deadline')?.value;
  if (!title || !group_id || !deadline) return showToast('Barcha maydonlarni to\'ldiring', 'error');

  const fd = new FormData();
  fd.append('title', title);
  fd.append('description', document.getElementById('m-a-desc')?.value || '');
  fd.append('group_id', group_id);
  fd.append('deadline', deadline);
  fd.append('type', document.getElementById('m-a-type')?.value || 'yakka');
  fd.append('tags', document.getElementById('m-a-tags')?.value || '');
  const file = document.getElementById('m-a-file')?.files?.[0];
  if (file) fd.append('file', file);

  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true; btn.textContent = 'Saqlanmoqda...';
  try {
    await API.assignments.create(fd);
    closeModal();
    showToast('Topshiriq yaratildi!');
    if (APP.currentPage === 'assignments') navigate('assignments');
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false; btn.textContent = 'Yaratish';
  }
}

async function saveNewPost() {
  const body = document.getElementById('m-p-body')?.value?.trim();
  const channel = document.getElementById('m-p-channel')?.value;
  if (!body) return showToast('Post matnini kiriting', 'error');

  const fd = new FormData();
  fd.append('body', body);
  fd.append('channel', channel);
  const file = document.getElementById('m-p-file')?.files?.[0];
  if (file) fd.append('file', file);

  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true; btn.textContent = 'Yuklanmoqda...';
  try {
    await API.posts.create(fd);
    closeModal();
    showToast('Post ulashildi!');
    if (APP.currentPage === 'community') navigate('community');
  } catch (e) {
    showToast(e.message, 'error');
    btn.disabled = false; btn.textContent = 'Ulashish';
  }
}

// ===== NOTIFICATIONS =====
async function toggleNotif() {
  APP.notifOpen = !APP.notifOpen;
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.classList.toggle('open', APP.notifOpen);
  if (APP.notifOpen) {
    try {
      const notifs = await API.notifications.list();
      const unread = notifs.filter(n => !n.read);
      panel.innerHTML = `
        <div class="notif-header">
          Bildirishnomalar
          <button class="btn btn-ghost btn-sm" style="font-size:12px;color:var(--accent2)" onclick="markAllNotifRead()">Barchasini o'qi</button>
        </div>
        ${notifs.slice(0,10).map(n => `
          <div class="notif-item ${n.read ? '' : 'unread'}">
            ${!n.read ? '<div class="notif-dot" style="flex-shrink:0"></div>' : '<div style="width:8px;flex-shrink:0"></div>'}
            <div>
              <div class="notif-text">${n.text}</div>
              <div class="notif-time">${timeAgo(n.created_at)}</div>
            </div>
          </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--text3);font-size:13px">Bildirishnomalar yo\'q</div>'}`;
      // Badge yangilash
      const dot = document.querySelector('.notif-dot-badge');
      if (dot && unread.length === 0) dot.remove();
    } catch(e) {}
  }
}

async function markAllNotifRead() {
  try {
    await API.notifications.readAll();
    toggleNotif();
    toggleNotif();
  } catch(e) {}
}

// ===== LOGIN =====
async function doLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const pass = document.getElementById('login-pass')?.value;
  if (!email || !pass) return showToast('Email va parol kiriting', 'error');

  const btn = document.getElementById('login-btn');
  btn.textContent = 'Kirilmoqda...';
  btn.disabled = true;

  try {
    const res = await API.auth.login(email, pass);
    TOKEN.set(res.token);
    APP.user = res.user;
    // Guruhlarni cache ga olish
    const groups = await API.groups.list().catch(() => []);
    APP.cache.groups = groups;
    mountApp();
  } catch (e) {
    showToast(e.message || 'Login xatosi', 'error');
    btn.textContent = 'Kirish →';
    btn.disabled = false;
  }
}

function showRegister() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="login-page">
      <div class="login-left">
        <div style="margin-bottom:60px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:50px">
            <div class="logo-mark" style="width:40px;height:40px;font-size:16px">EC</div>
            <div class="logo-text" style="font-size:20px">EduConnect</div>
          </div>
          <div style="font-family:'Syne',sans-serif;font-size:38px;font-weight:800;line-height:1.15;margin-bottom:20px">
            O'qituvchilar uchun<br><span style="color:var(--accent)">raqamli</span> platform
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form">
          <div class="login-title">Ro'yxatdan o'tish</div>
          <div class="login-subtitle">Yangi hisob yarating</div>
          <div class="form-group"><label class="form-label">Ism va familiya</label><input id="reg-name" class="form-input" placeholder="Dilnoza Yusupova"></div>
          <div class="form-group"><label class="form-label">Email</label><input id="reg-email" type="email" class="form-input" placeholder="email@school.uz"></div>
          <div class="form-group"><label class="form-label">Parol</label><input id="reg-pass" type="password" class="form-input" placeholder="••••••••"></div>
          <div class="grid-2" style="gap:12px">
            <div class="form-group"><label class="form-label">Fan</label>
              <select id="reg-subject" class="form-input"><option>Matematika</option><option>Fizika</option><option>Kimyo</option><option>Tarix</option><option>Biologiya</option></select>
            </div>
            <div class="form-group"><label class="form-label">Maktab</label><input id="reg-school" class="form-input" placeholder="1-sonli maktab"></div>
          </div>
          <button id="reg-btn" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:8px" onclick="doRegister()">Ro'yxatdan o'tish →</button>
          <div style="text-align:center;margin-top:20px;font-size:14px;color:var(--text3)">
            Hisobingiz bormi? <span style="color:var(--accent2);cursor:pointer" onclick="mountLogin()">Kirish</span>
          </div>
        </div>
      </div>
    </div>`;
}

async function doRegister() {
  const name = document.getElementById('reg-name')?.value?.trim();
  const email = document.getElementById('reg-email')?.value?.trim();
  const password = document.getElementById('reg-pass')?.value;
  const subject = document.getElementById('reg-subject')?.value;
  const school = document.getElementById('reg-school')?.value;
  if (!name || !email || !password) return showToast('Barcha majburiy maydonlarni to\'ldiring', 'error');

  const btn = document.getElementById('reg-btn');
  btn.textContent = 'Saqlanmoqda...'; btn.disabled = true;
  try {
    const res = await API.auth.register({ name, email, password, subject, school });
    TOKEN.set(res.token);
    APP.user = res.user;
    APP.cache.groups = [];
    mountApp();
  } catch (e) {
    showToast(e.message, 'error');
    btn.textContent = 'Ro\'yxatdan o\'tish →'; btn.disabled = false;
  }
}

function doLogout() {
  TOKEN.clear();
  APP.user = null;
  APP.cache = {};
  mountLogin();
}

// ===== APP SHELL =====
function mountApp() {
  const u = APP.user;
  document.getElementById('root').innerHTML = `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="logo-mark">EC</div>
          <div class="logo-text">EduConnect</div>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section-label">Bosh menyu</div>
          ${[
            ['dashboard','Bosh sahifa',ICONS.home],
            ['groups','Guruhlarim',ICONS.groups],
            ['assignments','Topshiriqlar',ICONS.assignments],
            ['archive','Arxivim',ICONS.archive],
            ['community','Hamjamiyat',ICONS.community],
          ].map(([id,label,icon]) => `
            <div class="nav-item ${id==='dashboard'?'active':''}" data-page="${id}" onclick="navigate('${id}')">
              <span class="nav-icon">${icon}</span>${label}
            </div>`).join('')}
          <div class="nav-section-label" style="margin-top:10px">Sozlamalar</div>
          <div class="nav-item" data-page="profile" onclick="navigate('profile')">
            <span class="nav-icon">${ICONS.profile}</span>Profil
          </div>
          <div class="nav-item" onclick="doLogout()" style="color:var(--text3)">
            <span class="nav-icon">${ICONS.logout}</span>Chiqish
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="user-mini" onclick="navigate('profile')">
            <div class="avatar">${getInitials(u.name)}</div>
            <div class="user-info">
              <div class="user-name">${u.name}</div>
              <div class="user-role">${u.subject || 'O\'qituvchi'}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main-area">
        <header class="topbar">
          <button class="icon-btn" id="menu-btn" style="display:none">${ICONS.menu}</button>
          <div class="topbar-title" id="topbar-title">Bosh sahifa</div>
          <div class="topbar-spacer"></div>
          <div style="position:relative">
            <button class="icon-btn" onclick="toggleNotif()">
              ${ICONS.bell}
              <div class="notif-dot notif-dot-badge"></div>
            </button>
            <div class="notif-panel" id="notif-panel">
              <div class="notif-header">Bildirishnomalar <span style="color:var(--text3);font-size:12px">yuklanmoqda...</span></div>
            </div>
          </div>
          <div class="avatar" style="cursor:pointer" onclick="navigate('profile')">${getInitials(u.name)}</div>
        </header>
        <main class="page-content" id="page-content"></main>
      </div>
    </div>

    <div class="modal-overlay" id="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal" id="modal-body"></div>
    </div>

    <div class="sidebar-overlay" id="sidebar-overlay"
         style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99"
         onclick="closeSidebar()"></div>`;

  attachSidebarEvents();
  APP.currentPage = 'dashboard';
  renderPage();
}

// ===== LOGIN PAGE =====
function mountLogin() {
  document.getElementById('root').innerHTML = `
    <div class="login-page">
      <div class="login-left">
        <div style="margin-bottom:60px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:50px">
            <div class="logo-mark" style="width:40px;height:40px;font-size:16px">EC</div>
            <div class="logo-text" style="font-size:20px">EduConnect</div>
          </div>
          <div style="font-family:'Syne',sans-serif;font-size:38px;font-weight:800;line-height:1.15;margin-bottom:20px">
            O'qituvchilar uchun<br><span style="color:var(--accent)">raqamli</span> platform
          </div>
          <p style="font-size:16px;color:var(--text2);line-height:1.7;max-width:440px">
            Guruhlar, topshiriqlar, arxiv va hamkasblar bilan material almashish — barchasi bir joyda.
          </p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:440px">
          ${[['📚','Guruh boshqaruvi','Barcha sinf va kurslar'],['📋','Topshiriqlar','Deadline va ko\'rganlar'],
             ['🗂️','Arxiv','Barcha materiallar'],['💬','Hamjamiyat','Hamkasblar bilan']
          ].map(([icon,title,desc]) => `
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:16px">
              <div style="font-size:24px;margin-bottom:8px">${icon}</div>
              <div style="font-size:14px;font-weight:600;margin-bottom:4px">${title}</div>
              <div style="font-size:12px;color:var(--text3)">${desc}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="login-right">
        <div class="login-form">
          <div class="login-title">Xush kelibsiz!</div>
          <div class="login-subtitle">Hisobingizga kiring</div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input id="login-email" type="email" class="form-input" placeholder="dilnoza@school.uz">
          </div>
          <div class="form-group" style="margin-bottom:24px">
            <label class="form-label">Parol</label>
            <input id="login-pass" type="password" class="form-input" placeholder="••••••••"
                   onkeydown="if(event.key==='Enter')doLogin()">
          </div>
          <button id="login-btn" class="btn btn-primary btn-lg" style="width:100%;justify-content:center" onclick="doLogin()">
            Kirish →
          </button>
          <div style="text-align:center;margin-top:20px;font-size:14px;color:var(--text3)">
            Hisobingiz yo'qmi? <span style="color:var(--accent2);cursor:pointer" onclick="showRegister()">Ro'yxatdan o'tish</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ===== SIDEBAR MOBILE =====
function attachSidebarEvents() {
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!menuBtn) return;
  if (window.innerWidth <= 768) menuBtn.style.display = 'flex';
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) { sidebar.classList.remove('open'); overlay.style.display = 'none'; menuBtn.style.display = 'none'; }
    else menuBtn.style.display = 'flex';
  });
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  const ov = document.getElementById('sidebar-overlay');
  if (ov) ov.style.display = 'none';
}

// Click outside notif panel
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  if (panel && APP.notifOpen && !e.target.closest('.icon-btn') && !e.target.closest('#notif-panel')) {
    APP.notifOpen = false;
    panel.classList.remove('open');
  }
});

// ===== INIT =====
window.addEventListener('DOMContentLoaded', async () => {
  const token = TOKEN.get();
  if (token) {
    try {
      const user = await API.auth.me();
      APP.user = user;
      const groups = await API.groups.list().catch(() => []);
      APP.cache.groups = groups;
      mountApp();
    } catch {
      TOKEN.clear();
      mountLogin();
    }
  } else {
    mountLogin();
  }
});

// Spinner CSS
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
