/* auth.js - NEXUS ARENA Authentication & Session Engine
   Role-based authorization, cyberpunk navigation rendering, and HUD alerts. */

const Session = {
  setSession(data) {
    const token = data.token;
    const userPayload = { _id: data._id, name: data.name, email: data.email, role: data.role };
    // Set both nexus keys and legacy ga keys for seamless interoperability
    localStorage.setItem('nexus_token', token);
    localStorage.setItem('nexus_user', JSON.stringify(userPayload));
    localStorage.setItem('ga_token', token);
    localStorage.setItem('ga_user', JSON.stringify(userPayload));
  },
  getUser() {
    const raw = localStorage.getItem('nexus_user') || localStorage.getItem('ga_user');
    return raw ? JSON.parse(raw) : null;
  },
  getToken() {
    return localStorage.getItem('nexus_token') || localStorage.getItem('ga_token');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('ga_token');
    localStorage.removeItem('ga_user');
    window.location.href = 'login.html';
  },
};

/**
 * Route protection guard. Enforces authentication and optional role requirements.
 */
function requireAuth(role = null) {
  if (!Session.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  const user = Session.getUser();
  if (role && user.role !== role) {
    showToast(`Access Restricted: This terminal requires [${role.toUpperCase()}] clearance.`, 'warning');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  }
}

/**
 * Builds the high-tech NEXUS // ARENA navigation bar.
 */
function renderNavbar(activePage = '') {
  const mount = document.getElementById('ga-navbar') || document.getElementById('nx-navbar');
  if (!mount) return;

  const user = Session.getUser();
  const loggedIn = Session.isLoggedIn();

  const dashboardLink = user
    ? `<li class="nav-item"><a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="dashboard.html"><i class="bi bi-terminal me-1"></i> Command Center</a></li>`
    : '';

  const authLinks = loggedIn
    ? `
      <li class="nav-item d-flex align-items-center me-2">
        <span class="nx-badge ${user.role === 'organizer' ? 'nx-badge-gold' : 'nx-badge-upcoming'} me-2">
          ${user.role === 'organizer' ? '★ ORGANIZER' : '⚡ PRO PLAYER'}
        </span>
      </li>
      <li class="nav-item">
        <a class="nav-link ${activePage === 'profile' ? 'active' : ''}" href="profile.html">
          <i class="bi bi-person-fill-gear text-cyan me-1"></i> ${user.name}
        </a>
      </li>
      <li class="nav-item ms-lg-2">
        <a class="btn btn-nx-outline btn-sm" href="#" onclick="Session.logout(); return false;">
          <i class="bi bi-box-arrow-right"></i> Disconnect
        </a>
      </li>
    `
    : `
      <li class="nav-item me-2">
        <a class="btn btn-nx-outline btn-sm ${activePage === 'login' ? 'active' : ''}" href="login.html">
          <i class="bi bi-key-fill me-1"></i> Access Portal
        </a>
      </li>
      <li class="nav-item">
        <a class="btn btn-nx-cyan btn-sm ${activePage === 'register' ? 'active' : ''}" href="register.html">
          <i class="bi bi-shield-plus me-1"></i> Enlist Now
        </a>
      </li>
    `;

  mount.innerHTML = `
    <nav class="navbar navbar-expand-lg nx-navbar sticky-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <i class="bi bi-shield-shaded text-cyan fs-4"></i>
          <span>NEXUS</span><span class="text-cyan">//</span><span>ARENA</span>
          <span class="nx-brand-badge d-none d-sm-inline-block">V2.4 PRO</span>
        </a>
        <button class="navbar-toggler border-0 text-cyan" type="button" data-bs-toggle="collapse" data-bs-target="#nxNav" aria-label="Toggle navigation">
          <i class="bi bi-list fs-2 text-cyan"></i>
        </button>
        <div class="collapse navbar-collapse" id="nxNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li class="nav-item"><a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">HQ</a></li>
            <li class="nav-item"><a class="nav-link ${activePage === 'tournaments' ? 'active' : ''}" href="tournaments.html">Tournaments</a></li>
            ${dashboardLink}
          </ul>
          <ul class="navbar-nav align-items-lg-center">
            ${authLinks}
          </ul>
        </div>
      </div>
    </nav>
  `;
}

/**
 * Shows an enhanced HUD toast notification.
 * type: 'success' | 'danger' | 'warning' | 'info'
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('nx-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'nx-toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = 2000;
    document.body.appendChild(container);
  }

  const iconMap = {
    success: 'bi-check-circle-fill text-emerald',
    danger: 'bi-exclamation-octagon-fill text-rose',
    warning: 'bi-exclamation-triangle-fill text-amber',
    info: 'bi-info-circle-fill text-cyan',
  };

  const borderMap = {
    success: 'border-success',
    danger: 'border-danger',
    warning: 'border-warning',
    info: 'border-info',
  };

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center nx-toast-alert ${borderMap[type] || 'border-info'} border-1`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex align-items-center p-2">
      <i class="bi ${iconMap[type] || iconMap.info} fs-5 me-2 ms-1"></i>
      <div class="toast-body font-tactical py-1" style="font-size: 1.05rem;">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  container.appendChild(toastEl);

  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/**
 * Format ISO date string into military/esports readable date.
 */
function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
}

/**
 * Format amounts with currency symbol
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Maps tournament & match statuses to cyber badge classes.
 */
function statusBadgeClass(status) {
  const map = {
    Upcoming: 'nx-badge-upcoming',
    Ongoing: 'nx-badge-ongoing',
    Completed: 'nx-badge-completed',
    Pending: 'nx-badge-upcoming',
    Approved: 'nx-badge-ongoing',
    Rejected: 'btn-nx-danger',
    Cancelled: 'nx-badge-completed',
    Scheduled: 'nx-badge-upcoming',
  };
  return map[status] || 'nx-badge-completed';
}
