// ===== PAGE RENDERERS =====

function renderDashboard() {
  const u = MOCK.user;
  return `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Xush kelibsiz, ${u.name.split(' ')[0]}! 👋</h1>
        <p>Bugun: ${new Date().toLocaleDateString('uz-UZ', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary btn-sm" onclick="openModal('newGroup')">${ICONS.plus} Yangi guruh</button>
        <button class="btn btn-primary btn-sm" onclick="openModal('newAssignment')">${ICONS.plus} Topshiriq qo'sh</button>
      </div>
    </div>

    <div class="stats-grid">
      ${MOCK.stats.map(s => `
        <div class="stat-card ${s.color}">
          <div class="stat-icon ${s.color}">${s.icon}</div>
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
          <div class="stat-change up">${s.change}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2" style="gap:20px">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3 style="font-family:Syne,sans-serif;font-size:16px;font-weight:700">So'nggi topshiriqlar</h3>
          <button class="btn btn-ghost btn-sm" onclick="navigate('assignments')">Barchasi →</button>
        </div>
        ${MOCK.assignments.slice(0,4).map(a => renderAssignmentMini(a)).join('')}
      </div>

      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h3 style="font-family:Syne,sans-serif;font-size:16px;font-weight:700">Guruhlarim</h3>
          <button class="btn btn-ghost btn-sm" onclick="navigate('groups')">Barchasi →</button>
        </div>
        ${MOCK.groups.slice(0,4).map(g => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s;margin-bottom:4px" 
               onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background='transparent'"
               onclick="navigate('groups')">
            <div style="width:36px;height:36px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${g.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:500;color:var(--text)">${g.name}</div>
              <div style="font-size:12px;color:var(--text3)">${g.students} o'quvchi · ${g.assignments} topshiriq</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div style="margin-top:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="font-family:Syne,sans-serif;font-size:16px;font-weight:700">So'nggi faollik</h3>
      </div>
      <div class="card card-sm">
        ${MOCK.recentActivity.map(a => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:18px">${a.icon}</span>
            <span style="flex:1;font-size:14px;color:var(--text2)">${a.text}</span>
            <span style="font-size:12px;color:var(--text3);white-space:nowrap">${a.time}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderAssignmentMini(a) {
  const isPast = new Date(a.deadline) < new Date();
  const pct = Math.round((a.views / a.total) * 100);
  return `
    <div class="assignment-card" style="margin-bottom:10px" onclick="navigate('assignments')">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
        <div style="flex:1">
          <div class="assignment-title">${a.title}</div>
          <div class="assignment-meta">
            <span class="badge badge-gray" style="font-size:11px">${a.group}</span>
            <span class="deadline-badge ${isPast ? 'overdue' : ''}">${ICONS.clock} ${a.deadline}</span>
          </div>
        </div>
        ${fileTypeBadge(a.fileType)}
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="progress-wrap" style="flex:1"><div class="progress-bar" style="width:${pct}%"></div></div>
        <span style="font-size:12px;color:var(--text3);white-space:nowrap">${a.views}/${a.total} ko'rdi</span>
      </div>
    </div>`;
}

function fileTypeBadge(type) {
  if (!type) return '';
  const map = { pdf:'badge-orange', pptx:'badge-gold', docx:'badge-blue', video:'badge-purple', img:'badge-green' };
  const labels = { pdf:'PDF', pptx:'PPTX', docx:'DOCX', video:'VIDEO', img:'RASM' };
  return `<span class="badge ${map[type] || 'badge-gray'}">${labels[type] || type.toUpperCase()}</span>`;
}

function fileIcon(type) {
  const map = { pdf:'📄', pptx:'📊', docx:'📝', video:'🎬', img:'🖼️' };
  return map[type] || '📎';
}

// ===== GROUPS PAGE =====
function renderGroups() {
  return `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Guruhlarim</h1>
        <p>${MOCK.groups.length} ta faol guruh</p>
      </div>
      <button class="btn btn-primary" onclick="openModal('newGroup')">${ICONS.plus} Yangi guruh</button>
    </div>

    <div class="grid-auto">
      ${MOCK.groups.map(g => `
        <div class="group-card fade-in">
          <div class="group-icon" style="background:var(--bg3)">${g.icon}</div>
          <div class="group-name">${g.name}</div>
          <div class="group-subject">${g.subject} · ${g.grade}-sinf</div>
          <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
            <span class="badge badge-gray">${g.students} o'quvchi</span>
            <span class="badge badge-blue">${g.assignments} topshiriq</span>
          </div>
          <div class="group-footer">
            <span style="display:flex;align-items:center;gap:5px">${ICONS.copy} ${g.code}</span>
            <button class="btn btn-secondary btn-sm" onclick="navigate('assignments')" style="padding:4px 12px;font-size:12px">Topshiriqlar</button>
          </div>
        </div>`).join('')}

      <div class="group-card" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-height:180px;cursor:pointer;background:transparent"
           onclick="openModal('newGroup')"
           onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;color:var(--text3)">${ICONS.plus}</div>
        <span style="font-size:14px;color:var(--text3)">Yangi guruh qo'shish</span>
      </div>
    </div>`;
}

// ===== ASSIGNMENTS PAGE =====
function renderAssignments() {
  const state = APP.activeTab.assignments || 'all';
  let filtered = MOCK.assignments;
  if (state === 'active') filtered = filtered.filter(a => new Date(a.deadline) >= new Date());
  if (state === 'past') filtered = filtered.filter(a => new Date(a.deadline) < new Date());

  return `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Topshiriqlar</h1>
        <p>Jami ${MOCK.assignments.length} ta topshiriq</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary btn-sm">${ICONS.filter} Filter</button>
        <button class="btn btn-primary" onclick="openModal('newAssignment')">${ICONS.plus} Yangi topshiriq</button>
      </div>
    </div>

    <div class="tabs">
      <div class="tab ${state==='all'?'active':''}" onclick="setTab('assignments','all');renderPage()">Barcha (${MOCK.assignments.length})</div>
      <div class="tab ${state==='active'?'active':''}" onclick="setTab('assignments','active');renderPage()">Faol (${MOCK.assignments.filter(a=>new Date(a.deadline)>=new Date()).length})</div>
      <div class="tab ${state==='past'?'active':''}" onclick="setTab('assignments','past');renderPage()">O'tgan (${MOCK.assignments.filter(a=>new Date(a.deadline)<new Date()).length})</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${filtered.map(a => {
        const isPast = new Date(a.deadline) < new Date();
        const pct = Math.round((a.views / a.total) * 100);
        return `
          <div class="card" style="display:flex;align-items:center;gap:16px;padding:16px 20px">
            <div style="width:42px;height:42px;border-radius:8px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">${a.fileType ? fileIcon(a.fileType) : '📋'}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                <span style="font-size:15px;font-weight:600;color:var(--text)">${a.title}</span>
                ${fileTypeBadge(a.fileType)}
                <span class="badge ${a.type==='guruh'?'badge-purple':'badge-blue'}">${a.type}</span>
              </div>
              <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
                <span style="font-size:12px;color:var(--text3)">${a.group}</span>
                <span class="deadline-badge ${isPast?'overdue':''}">${ICONS.clock} ${a.deadline}</span>
                <span style="font-size:12px;color:var(--text3);display:flex;align-items:center;gap:4px">${ICONS.eye} ${a.views}/${a.total}</span>
              </div>
              <div style="margin-top:8px;display:flex;align-items:center;gap:8px">
                <div class="progress-wrap" style="width:160px"><div class="progress-bar ${isPast?'orange':''}" style="width:${pct}%"></div></div>
                <span style="font-size:12px;color:var(--text3)">${pct}% ko'rdi</span>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button class="icon-btn" title="Tahrirlash">${ICONS.edit}</button>
              <button class="icon-btn" title="O'chirish" style="color:var(--accent3)">${ICONS.trash}</button>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ===== ARCHIVE PAGE =====
function renderArchive() {
  const state = APP.activeTab.archive || 'all';
  const folders = [...new Set(MOCK.archive.map(f => f.folder))];
  const types = ['pdf', 'pptx', 'docx', 'video', 'img'];
  let filtered = MOCK.archive;
  if (state !== 'all' && folders.includes(state)) filtered = filtered.filter(f => f.folder === state);

  return `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Arxivim</h1>
        <p>${MOCK.archive.length} ta fayl · ${(MOCK.archive.reduce((a,f) => a + parseFloat(f.size), 0)).toFixed(1)} MB jami</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-secondary btn-sm">${ICONS.filter} Filter</button>
        <button class="btn btn-primary">${ICONS.upload} Fayl yuklash</button>
      </div>
    </div>

    <div class="grid-2" style="gap:20px">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="font-family:Syne,sans-serif;font-size:15px;font-weight:700">Papkalar</h3>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:24px">
          <div class="file-row ${state==='all'?'':'hover'}" 
               style="${state==='all'?'background:var(--bg3);border-radius:8px':''}"
               onclick="setTab('archive','all');renderPage()">
            <div class="file-icon docx">📁</div>
            <div><div class="file-name">Barcha fayllar</div><div class="file-meta">${MOCK.archive.length} ta fayl</div></div>
            <span class="badge badge-gray" style="margin-left:auto">${MOCK.archive.length}</span>
          </div>
          ${folders.map(folder => {
            const count = MOCK.archive.filter(f => f.folder === folder).length;
            return `
              <div class="file-row" style="${state===folder?'background:var(--bg3);border-radius:8px':''}"
                   onclick="setTab('archive','${folder}');renderPage()">
                <div class="file-icon docx">📂</div>
                <div><div class="file-name">${folder}</div><div class="file-meta">${count} ta fayl</div></div>
                <span class="badge badge-gray" style="margin-left:auto">${count}</span>
              </div>`;
          }).join('')}
        </div>

        <h3 style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;margin-bottom:14px">Fayl turlari</h3>
        ${types.map(t => {
          const cnt = MOCK.archive.filter(f => f.type === t).length;
          if (!cnt) return '';
          const pct = Math.round((cnt / MOCK.archive.length) * 100);
          const icons = { pdf:'📄', pptx:'📊', docx:'📝', video:'🎬', img:'🖼️' };
          return `
            <div style="margin-bottom:12px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
                <span style="font-size:13px;color:var(--text2)">${icons[t]} ${t.toUpperCase()}</span>
                <span style="font-size:12px;color:var(--text3)">${cnt} ta</span>
              </div>
              <div class="progress-wrap"><div class="progress-bar ${t==='pdf'?'orange':t==='pptx'?'':t==='docx'?'blue':''}" style="width:${pct}%"></div></div>
            </div>`;
        }).join('')}
      </div>

      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <h3 style="font-family:Syne,sans-serif;font-size:15px;font-weight:700">${state === 'all' ? 'Barcha fayllar' : state}</h3>
          <span style="font-size:13px;color:var(--text3)">${filtered.length} ta</span>
        </div>
        <div class="card card-sm" style="padding:8px 0">
          ${filtered.map(f => `
            <div class="file-row">
              <div class="file-icon ${f.type}">${fileIcon(f.type)}</div>
              <div style="flex:1;min-width:0">
                <div class="file-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</div>
                <div class="file-meta">${f.size} · ${f.date}</div>
              </div>
              <div style="display:flex;gap:4px;flex-shrink:0">
                ${f.tags.map(t => `<span class="badge badge-gray" style="font-size:10px">${t}</span>`).join('')}
              </div>
              <button class="icon-btn" title="Yuklab olish" style="margin-left:8px;flex-shrink:0">${ICONS.download}</button>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ===== COMMUNITY PAGE =====
function renderCommunity() {
  const channels = ['Matematika o\'qituvchilari', 'Fizika kanali', 'Tarix va Ijtimoiy', 'Metodika bo\'limi'];
  const activeCh = APP.activeTab.community || channels[0];

  return `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Hamjamiyat</h1>
        <p>Hamkasblar bilan material almashing</p>
      </div>
      <button class="btn btn-primary" onclick="openModal('newPost')">${ICONS.plus} Post yaratish</button>
    </div>

    <div class="grid-2" style="gap:24px;grid-template-columns:220px 1fr">
      <div>
        <div style="font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">Kanallar</div>
        ${channels.map(ch => `
          <div class="nav-item ${activeCh===ch?'active':''}" style="padding:9px 12px;border-radius:8px;margin-bottom:2px"
               onclick="setTab('community','${ch}');renderPage()">
            <span style="font-size:14px">#</span>
            <span style="font-size:13px">${ch.split(' ')[0]}</span>
          </div>`).join('')}

        <div style="margin-top:20px;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--text3);margin-bottom:10px">Faol a'zolar</div>
        ${['Aziz K.', 'Malika T.', 'Sherzod N.', 'Nodira X.'].map((name, i) => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:8px;margin-bottom:2px;cursor:pointer"
               onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background='transparent'">
            <div class="avatar" style="width:26px;height:26px;font-size:10px">${name.split(' ').map(w=>w[0]).join('')}</div>
            <span style="font-size:13px;color:var(--text2)">${name}</span>
            <div style="width:6px;height:6px;border-radius:50%;background:var(--accent);margin-left:auto;flex-shrink:0"></div>
          </div>`).join('')}
      </div>

      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div class="avatar md">${MOCK.user.initials}</div>
            <input type="text" class="form-input" placeholder="Nimani ulashmoqchisiz? Material, taklif, savol..." style="flex:1" onclick="openModal('newPost')">
          </div>
          <div style="display:flex;gap:8px;padding-top:10px;border-top:1px solid var(--border)">
            <button class="btn btn-ghost btn-sm">📎 Fayl biriktirish</button>
            <button class="btn btn-ghost btn-sm">🖼️ Rasm</button>
            <button class="btn btn-ghost btn-sm">🔗 Havola</button>
            <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="openModal('newPost')">Ulashish</button>
          </div>
        </div>

        ${MOCK.posts.map(p => renderPost(p)).join('')}
      </div>
    </div>`;
}

function renderPost(p) {
  const colorMap = { blue: 'var(--accent2)', purple: 'var(--accent4)', green: 'var(--accent)', orange: 'var(--accent3)' };
  return `
    <div class="post-card fade-in">
      <div class="post-header">
        <div class="avatar md" style="background:${colorMap[p.authorColor]||'var(--accent)'}">${p.authorInitials}</div>
        <div>
          <div class="post-author">${p.author}</div>
          <div class="post-meta">${p.channel} · ${p.time}</div>
        </div>
        <span class="badge badge-gray" style="margin-left:auto;font-size:11px">${p.subject}</span>
      </div>
      <div class="post-body">${p.body}</div>
      ${p.file ? `
        <div class="post-attachment">
          <div class="file-icon ${p.fileType}" style="width:34px;height:34px">${fileIcon(p.fileType)}</div>
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--text)">${p.file}</div>
            <div style="font-size:11px;color:var(--text3)">${p.fileSize} · ${p.fileType.toUpperCase()}</div>
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-left:auto">${ICONS.download}</button>
        </div>` : ''}
      <div class="post-actions">
        <button class="post-action-btn ${p.liked ? 'liked' : ''}" onclick="toggleLike(${p.id})">
          ${ICONS.heart} <span id="likes-${p.id}">${p.likes}</span>
        </button>
        <button class="post-action-btn">${ICONS.comment} ${p.comments}</button>
        <button class="post-action-btn ${p.saved ? 'liked' : ''}" onclick="toggleSave(${p.id})" style="${p.saved?'color:var(--accent4)':''}">
          ${ICONS.bookmark} <span id="saves-${p.id}">${p.saves}</span>
        </button>
        <button class="post-action-btn" style="margin-left:auto">${ICONS.share} Ulashish</button>
      </div>
    </div>`;
}

// ===== PROFILE PAGE =====
function renderProfile() {
  const u = MOCK.user;
  return `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Profil & Sozlamalar</h1>
        <p>Shaxsiy ma'lumotlaringizni boshqaring</p>
      </div>
      <button class="btn btn-primary">Saqlash</button>
    </div>

    <div class="grid-2" style="gap:24px;align-items:start">
      <div>
        <div class="card card-lg" style="margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--border)">
            <div class="avatar lg">${u.initials}</div>
            <div>
              <div style="font-family:Syne,sans-serif;font-size:20px;font-weight:800">${u.name}</div>
              <div style="font-size:14px;color:var(--text2)">${u.subject} o'qituvchisi</div>
              <div style="font-size:13px;color:var(--text3);margin-top:4px">${u.school}</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="margin-left:auto">Foto o'zgartirish</button>
          </div>
          <div class="form-group">
            <label class="form-label">Ism va familiya</label>
            <input class="form-input" value="${u.name}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" value="${u.email}">
          </div>
          <div class="grid-2" style="gap:14px">
            <div class="form-group">
              <label class="form-label">Fan yo'nalishi</label>
              <input class="form-input" value="${u.subject}">
            </div>
            <div class="form-group">
              <label class="form-label">Ish staji (yil)</label>
              <input class="form-input" type="number" value="${u.experience}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Maktab / Tashkilot</label>
            <input class="form-input" value="${u.school}">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Bio</label>
            <textarea class="form-input">${u.bio}</textarea>
          </div>
        </div>

        <div class="card">
          <div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;margin-bottom:16px">Maxfiylik</div>
          ${[
            ['Profil ommaviy ko\'rinsin', true],
            ['Hamjamiyatda ko\'rinayin', true],
            ['Email bildirishnomalari', true],
            ['Telegram bildirishnomalari', false]
          ].map(([label, checked]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
              <span style="font-size:14px;color:var(--text2)">${label}</span>
              <div style="width:40px;height:22px;border-radius:11px;background:${checked?'var(--accent)':'var(--bg4)'};cursor:pointer;transition:background 0.2s;position:relative">
                <div style="width:16px;height:16px;border-radius:50%;background:#fff;position:absolute;top:3px;${checked?'right:3px':'left:3px'};transition:all 0.2s"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div>
        <div class="card" style="margin-bottom:20px">
          <div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;margin-bottom:16px">Statistika</div>
          ${[
            ['Jami guruhlar', MOCK.groups.length, '📚'],
            ['Jami topshiriqlar', MOCK.assignments.length, '📋'],
            ['Arxivdagi fayllar', MOCK.archive.length, '🗂️'],
            ['Hamjamiyat postlari', MOCK.posts.length, '💬'],
            ['Ish tajribasi', u.experience + ' yil', '⭐']
          ].map(([label, val, icon]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border)">
              <span style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text2)">${icon} ${label}</span>
              <span style="font-family:Syne,sans-serif;font-weight:700;color:var(--text)">${val}</span>
            </div>`).join('')}
        </div>

        <div class="card">
          <div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;margin-bottom:16px">Xavfsizlik</div>
          <div class="form-group">
            <label class="form-label">Joriy parol</label>
            <input class="form-input" type="password" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">Yangi parol</label>
            <input class="form-input" type="password" placeholder="••••••••">
          </div>
          <div class="form-group" style="margin-bottom:16px">
            <label class="form-label">Tasdiqlash</label>
            <input class="form-input" type="password" placeholder="••••••••">
          </div>
          <button class="btn btn-secondary" style="width:100%">Parolni yangilash</button>
        </div>
      </div>
    </div>`;
}
