// =============================================
//  DoOr – Shared Shell (Navbar + Sidebar + Toast)
//  Inject into every authenticated page.
// =============================================

export function injectShell() {
  document.body.insertAdjacentHTML('afterbegin', `
    <!-- NAVBAR -->
    <nav class="navbar" id="nav-bar">
      <a href="dashboard.html" class="nav-logo">
        <div class="logo-dot"></div>
        <span>Do<span style="color:var(--red)">Or</span></span>
      </a>
      <div class="nav-actions">
        <span class="user-location-display text-slate font-mono" style="font-size:0.72rem;" id="nav-location"></span>
        <div class="nav-user">
          <div class="avatar user-avatar-char">A</div>
          <span class="user-name-display" style="font-size:0.88rem;font-weight:500;">User</span>
        </div>
        <button class="btn btn-ghost btn-sm" id="sign-out-btn">Sign Out</button>
      </div>
    </nav>

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
      <nav class="sidebar-nav">
        <a href="dashboard.html" class="sidebar-item" data-page="dashboard">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a href="blood.html" class="sidebar-item" data-page="blood">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6 8 4 12.5 4 15a8 8 0 0 0 16 0c0-2.5-2-7-8-13z"/></svg>
          Blood Locator
        </a>
        <a href="organ.html" class="sidebar-item" data-page="organ">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Organ Request
        </a>
        <a href="directory.html" class="sidebar-item" data-page="directory">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Medical Directory
        </a>
        <a href="professional.html" class="sidebar-item" data-page="professional">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Professionals
        </a>
        <a href="profile.html" class="sidebar-item" data-page="profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          My Profile
        </a>
      </nav>
      <div class="sidebar-footer">
        <div style="font-size:0.72rem;color:var(--slate);text-align:center;">
          <div style="margin-bottom:0.3rem;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
            <div class="status-dot online"></div> Live · 3km Radius Active
          </div>
          <div class="user-location-display font-mono" style="font-size:0.68rem;"></div>
        </div>
      </div>
    </aside>

    <!-- TOAST CONTAINER -->
    <div class="toast-container" id="toast-container"></div>

    <!-- EMERGENCY NOTIFICATION OVERLAY -->
    <div class="notif-overlay hidden" id="notif-overlay">
      <div class="notif-popup">
        <div class="notif-icon">🚨</div>
        <div class="notif-title" id="notif-title">Emergency Request</div>
        <div class="notif-body" id="notif-body">An emergency blood request has been sent to you.</div>
        <div class="notif-actions">
          <button class="btn btn-outline btn-full" onclick="closeNotif()">Decline</button>
          <button class="btn btn-primary btn-full" onclick="acceptRequest()">✅ Accept & Chat</button>
        </div>
      </div>
    </div>

    <!-- FLOATING CHAT PANEL -->
    <div id="chat-panel" style="position:fixed;right:1.5rem;bottom:1.5rem;z-index:8000;width:340px;display:none;">
      <div class="chat-window" style="box-shadow:0 16px 48px rgba(0,0,0,0.6);">
        <div class="chat-header">
          <div class="status-dot online"></div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:0.9rem;" id="chat-person-name">Anonymous User</div>
            <div style="font-size:0.72rem;color:var(--green);">🔒 End-to-end encrypted · Masked identity</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="closeChat()" style="padding:0.3rem;">✕</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-row">
          <input class="chat-input" id="chat-input" type="text" placeholder="Type a message…" />
          <button class="btn btn-primary btn-sm" onclick="sendChatMsg()">Send</button>
        </div>
      </div>
    </div>
  `);

  // Mark active sidebar item
  const page = document.body.dataset.page;
  document.querySelectorAll('.sidebar-item').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}

// ─── Toast helper (globally accessible) ──────
window.showToast = function(msg, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
};

window.closeNotif = function() {
  document.getElementById('notif-overlay').classList.add('hidden');
};

window.acceptRequest = function() {
  closeNotif();
  const panel = document.getElementById('chat-panel');
  panel.style.display = 'block';
  document.getElementById('chat-person-name').textContent = '🔒 Emergency Coordinator';
  showToast('Request accepted! Chat opened.', 'success');
};

window.closeChat = function() {
  document.getElementById('chat-panel').style.display = 'none';
};

// Active chat room tracking
let _activeChatRoom = null;
let _chatListener   = null;

window.openChat = async function(name, roomId) {
  const panel = document.getElementById('chat-panel');
  panel.style.display = 'block';
  document.getElementById('chat-person-name').textContent = '🔒 ' + name.split(' ')[0] + ' (Anonymous)';

  // Unsubscribe from previous room
  if (_chatListener) { _chatListener(); _chatListener = null; }

  _activeChatRoom = roomId || ('room_' + Date.now());
  const area = document.getElementById('chat-messages');
  area.innerHTML = '<div style="text-align:center;color:var(--slate);font-size:0.8rem;padding:1rem;">Loading messages…</div>';

  try {
    // Dynamic import to avoid circular deps
    const { getFirestore, collection, query, orderBy, limit, onSnapshot }
      = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const { getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const db = getFirestore(getApps()[0]);

    const q = query(
      collection(db, 'messages', _activeChatRoom, 'msgs'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    _chatListener = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => d.data());
      if (msgs.length === 0) {
        // Fallback: show 3 default starter messages
        area.innerHTML = [
          { cls:'recv', text:'Hello! I received your request. How can I help?', t:'3 min ago' },
          { cls:'recv', text:'Please share the patient details so I can coordinate.', t:'2 min ago' },
          { cls:'recv', text:'I am ready to assist. Which hospital should I come to?', t:'1 min ago' },
        ].map(m => `<div class="msg ${m.cls}">${m.text}<div class="msg-time">${m.t}</div></div>`).join('');
      } else {
        area.innerHTML = msgs.map(m => {
          const sent = window._currentUid && m.senderId === window._currentUid;
          const t = m.timestamp?.toDate
            ? m.timestamp.toDate().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
            : '';
          return `<div class="msg ${sent?'sent':'recv'}">${m.text}<div class="msg-time">${t}</div></div>`;
        }).join('');
      }
      area.scrollTop = area.scrollHeight;
    });
  } catch(e) {
    // Fallback messages if Firebase unavailable
    area.innerHTML = [
      { cls:'recv', text:'Hello! I received your emergency request.', t:'Just now' },
      { cls:'recv', text:'Can you share the exact location of the patient?', t:'Just now' },
      { cls:'recv', text:'I am on my way. Please stay calm.', t:'Just now' },
    ].map(m => `<div class="msg ${m.cls}">${m.text}<div class="msg-time">${m.t}</div></div>`).join('');
    area.scrollTop = area.scrollHeight;
  }
};

window.sendChatMsg = async function() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';

  const area = document.getElementById('chat-messages');
  const t    = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Optimistic UI update
  area.insertAdjacentHTML('beforeend', `<div class="msg sent">${text}<div class="msg-time">${t}</div></div>`);
  area.scrollTop = area.scrollHeight;

  // Write to Firestore if room active
  if (_activeChatRoom) {
    try {
      const { getFirestore, collection, addDoc, serverTimestamp }
        = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const { getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const db = getFirestore(getApps()[0]);
      await addDoc(collection(db, 'messages', _activeChatRoom, 'msgs'), {
        senderId:  window._currentUid || 'anon',
        text,
        timestamp: serverTimestamp(),
      });
    } catch(e) { console.warn('msg write failed', e); }
  } else {
    // No room — simulate reply
    setTimeout(() => {
      const replies = ['Understood, I\'ll be there shortly.', 'Can you share the exact location?',
        'I\'m on my way. Stay calm.', 'Please stay calm, help is coming.',
        'Coordinating with the medical team now.', 'What is the patient\'s current condition?'];
      area.insertAdjacentHTML('beforeend',
        `<div class="msg recv">${replies[Math.floor(Math.random()*replies.length)]}<div class="msg-time">${t}</div></div>`);
      area.scrollTop = area.scrollHeight;
    }, 1200);
  }
};

// Wire Enter key on chat input via event delegation (input is dynamically injected)
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target && e.target.id === 'chat-input') window.sendChatMsg();
});

export function updateLocationDisplay(coords) {
  document.querySelectorAll('.user-location-display').forEach(el => {
    el.textContent = coords[0].toFixed(4) + '°N, ' + coords[1].toFixed(4) + '°E';
  });
}

export function initMap(containerId, center) {
  const map = L.map(containerId, { center, zoom: 14, zoomControl: true, attributionControl: false });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
  L.circle(center, { radius: 3000, color: '#E8192C', fillColor: '#E8192C', fillOpacity: 0.06, weight: 1.5, dashArray: '8 6' }).addTo(map);
  const userIcon = L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#E8192C;border:3px solid white;box-shadow:0 0 16px rgba(232,25,44,0.8);animation:pulse-css 2s infinite;"></div>`,
    iconSize: [18,18], iconAnchor: [9,9], className: '',
  });
  L.marker(center, { icon: userIcon }).bindPopup('<b>📍 Your Location</b><br><small>Live tracking active</small>', { className: 'dark-popup' }).addTo(map);
  return map;
}
