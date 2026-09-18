/**
 * INSIGHTLY - Analytics Dashboard Logic
 * Vanilla JavaScript (No Frameworks)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     APP STATE & DEMO DATA
     ========================================================================== */
  
  const AppState = {
    theme: localStorage.getItem('insightly_theme') || 'system',
    sidebarCollapsed: localStorage.getItem('insightly_sidebar') === 'true',
    currentDateRange: '30days',
    notifications: [
      { id: 1, title: 'Revenue target reached', desc: 'Monthly revenue exceeded $100k.', time: '10 mins ago', read: false, type: 'success' },
      { id: 2, title: 'New team member', desc: 'Sarah joined your workspace.', time: '2 hours ago', read: false, type: 'info' },
      { id: 3, title: 'Report ready', desc: 'Weekly analytics report is ready to download.', time: '1 day ago', read: true, type: 'warning' }
    ]
  };

  const DemoData = {
    kpis: {
      today: { rev: '$4,230', revChange: 2.4, users: '842', usersChange: 1.2, tx: '156', txChange: 4.1, growth: '0.8%', growthChange: 0.1 },
      '7days': { rev: '$28,430', revChange: 5.2, users: '5,892', usersChange: 3.4, tx: '1,421', txChange: -1.2, growth: '4.2%', growthChange: 1.1 },
      '30days': { rev: '$128,430', revChange: 12.8, users: '24,892', usersChange: 8.4, tx: '8,421', txChange: 15.2, growth: '18.6%', growthChange: 4.7 },
      '90days': { rev: '$384,120', revChange: 24.5, users: '72,104', usersChange: 14.2, tx: '25,340', txChange: 18.9, growth: '42.1%', growthChange: 8.2 },
      year: { rev: '$1.42M', revChange: 45.2, users: '284k', usersChange: 32.1, tx: '104k', txChange: 28.4, growth: '124%', growthChange: 15.4 }
    },
    revenueChart: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon2', 'Tue2', 'Wed2', 'Thu2', 'Fri2', 'Sat2', 'Sun2'],
      values: [1200, 1900, 1500, 2200, 1800, 2800, 2400, 2100, 2900, 3100, 2800, 3500, 3200, 4100]
    },
    usersChart: [
      { new: 60, returning: 40, label: 'W1' }, { new: 55, returning: 65, label: 'W2' },
      { new: 75, returning: 80, label: 'W3' }, { new: 90, returning: 85, label: 'W4' },
      { new: 85, returning: 100, label: 'W5' }, { new: 110, returning: 95, label: 'W6' }
    ],
    traffic: [
      { source: 'Direct', value: 45 }, { source: 'Organic Search', value: 28 },
      { source: 'Social', value: 15 }, { source: 'Referral', value: 8 }, { source: 'Email', value: 4 }
    ],
    devices: [ { type: 'Desktop', percent: 45, color: 'var(--primary)' }, { type: 'Mobile', percent: 30, color: 'var(--success)' }, { type: 'Tablet', percent: 25, color: 'var(--warning)' } ],
    transactions: [
      { id: 'TRX-48291', customer: 'Acme Corp', date: '2026-09-17', amount: '$1,200.00', status: 'completed', method: 'Credit Card' },
      { id: 'TRX-48290', customer: 'Jane Doe', date: '2026-09-17', amount: '$149.99', status: 'completed', method: 'PayPal' },
      { id: 'TRX-48289', customer: 'TechFlow Inc', date: '2026-09-16', amount: '$4,500.00', status: 'pending', method: 'Bank Transfer' },
      { id: 'TRX-48288', customer: 'John Smith', date: '2026-09-16', amount: '$24.99', status: 'failed', method: 'Credit Card' },
      { id: 'TRX-48287', customer: 'Global Sys', date: '2026-09-15', amount: '$850.00', status: 'completed', method: 'Credit Card' },
      { id: 'TRX-48286', customer: 'Sarah Connor', date: '2026-09-15', amount: '$99.00', status: 'refunded', method: 'PayPal' }
    ],
    activities: [
      { type: 'user', title: 'New user registered', desc: 'Sarah joined your workspace', time: '2 mins ago' },
      { type: 'transaction', title: 'New transaction completed', desc: 'Order #TRX-48291 for $1,200.00', time: '8 mins ago' },
      { type: 'report', title: 'Report generated', desc: 'Monthly performance report', time: '24 mins ago' },
      { type: 'user', title: 'Project updated', desc: 'Analytics website redesign', time: '1 hour ago' }
    ]
  };

  let currentSort = { column: 'date', order: 'desc' };
  let currentPage = 1;
  const itemsPerPage = 5;
  let filteredTransactions = [...DemoData.transactions];

  /* ==========================================================================
     DOM REFERENCES
     ========================================================================== */
  
  const DOM = {
    body: document.body,
    html: document.documentElement,
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    collapseBtn: document.getElementById('collapseSidebarBtn'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    themeToggle: document.getElementById('themeToggleBtn'),
    dateSelect: document.getElementById('dateRangeSelect'),
    kpiContainer: document.getElementById('kpiContainer'),
    navItems: document.querySelectorAll('.nav-item[data-view]'),
    views: document.querySelectorAll('.view-section'),
    pageTitle: document.getElementById('pageTitleText'),
    
    // Header dropdowns
    headerProfileBtn: document.getElementById('headerProfileBtn'),
    profileDropdown: document.getElementById('profileDropdown'),
    headerNotifBtn: document.getElementById('headerNotifBtn'),
    navNotificationsBtn: document.getElementById('navNotificationsBtn'),
    notificationPanel: document.getElementById('notificationPanel'),
    
    // Modals
    searchModal: document.getElementById('searchModal'),
    searchInput: document.getElementById('globalSearchInput'),
    searchResults: document.getElementById('searchResults'),
    settingsModal: document.getElementById('settingsModal'),
    txModal: document.getElementById('txModal'),
    
    // Buttons
    openSearchBtn: document.getElementById('openSearchBtn'),
    navSettingsBtn: document.getElementById('navSettingsBtn'),
    dropdownSettingsBtn: document.getElementById('dropdownSettingsBtn'),
    
    // Tables & Search
    txTableBody: document.getElementById('txTableBody'),
    txSearchInput: document.getElementById('txSearchInput'),
    thSortable: document.querySelectorAll('th[data-sort]'),
    btnPrevPage: document.getElementById('prevPage'),
    btnNextPage: document.getElementById('nextPage'),
    
    // Exports
    exportTableBtn: document.getElementById('exportTableBtn'),
    exportChartBtn: document.getElementById('exportChartBtn'),
    
    toastContainer: document.getElementById('toastContainer')
  };

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */
  
  function init() {
    applyTheme(AppState.theme);
    if (AppState.sidebarCollapsed) DOM.body.classList.add('sidebar-collapsed');
    
    setupEventListeners();
    updateNotificationBadges();
    
    // Simulate Loading state then render
    setTimeout(() => {
      renderDashboardData();
    }, 800);
  }

  /* ==========================================================================
     EVENT LISTENERS
     ========================================================================== */
  
  function setupEventListeners() {
    // Theme
    DOM.themeToggle?.addEventListener('click', () => {
      const isDark = DOM.html.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Theme updated to ${newTheme}`, 'info');
    });

    // Sidebar
    DOM.collapseBtn?.addEventListener('click', () => {
      DOM.body.classList.toggle('sidebar-collapsed');
      AppState.sidebarCollapsed = DOM.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('insightly_sidebar', AppState.sidebarCollapsed);
      setTimeout(renderCharts, 300); // Redraw charts after transition
    });

    DOM.mobileMenuBtn?.addEventListener('click', () => {
      DOM.body.classList.add('sidebar-open');
    });
    DOM.sidebarOverlay?.addEventListener('click', () => {
      DOM.body.classList.remove('sidebar-open');
    });

    // Navigation View Switching
    DOM.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = item.getAttribute('data-view');
        
        // Update Nav Active State
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Close mobile drawer if open
        DOM.body.classList.remove('sidebar-open');
        
        // Handle views
        DOM.views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(`view-${viewId}`);
        if(targetView) {
          targetView.classList.add('active');
          DOM.pageTitle.textContent = item.querySelector('.nav-text').textContent + (viewId === 'overview' ? ' Overview' : '');
          if(viewId === 'overview') setTimeout(renderCharts, 100);
        } else {
          // Safe fallback if a future route is added without a matching view.
          const fallback = document.getElementById('view-reports');
          if (fallback) fallback.classList.add('active');
          DOM.pageTitle.textContent = item.querySelector('.nav-text')?.textContent || 'Dashboard';
        }
      });
    });

    // Date Range
    DOM.dateSelect.addEventListener('change', (e) => {
      AppState.currentDateRange = e.target.value;
      // Simulate reload
      DOM.kpiContainer.innerHTML = '<div class="kpi-card skeleton"><div class="skeleton-bone title"></div><div class="skeleton-bone value"></div><div class="skeleton-bone stat"></div></div>'.repeat(4);
      setTimeout(() => {
        renderKPIs();
        renderCharts();
        showToast('Data refreshed for selected period', 'success');
      }, 500);
    });

    // Profile Dropdown
    DOM.headerProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.profileDropdown.classList.toggle('show');
    });

    // Notifications
    const toggleNotifs = (e) => {
      e.preventDefault(); e.stopPropagation();
      DOM.notificationPanel.classList.toggle('show');
      if(DOM.notificationPanel.classList.contains('show')) renderNotifications();
    };
    DOM.headerNotifBtn.addEventListener('click', toggleNotifs);
    DOM.navNotificationsBtn.addEventListener('click', toggleNotifs);
    
    document.getElementById('markAllReadBtn').addEventListener('click', () => {
      AppState.notifications.forEach(n => n.read = true);
      updateNotificationBadges();
      renderNotifications();
      showToast('All notifications marked as read', 'success');
    });

    // Global Click (Close dropdowns)
    document.addEventListener('click', (e) => {
      if(!e.target.closest('.profile-menu-container')) DOM.profileDropdown.classList.remove('show');
      if(!e.target.closest('.notification-panel') && !e.target.closest('.notification-btn') && !e.target.closest('#navNotificationsBtn')) {
        DOM.notificationPanel.classList.remove('show');
      }
    });

    // Modals Open/Close
    const setupModalClose = (modalId) => {
      const modal = document.getElementById(modalId);
      modal.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modalId));
      });
    };
    setupModalClose('searchModal');
    setupModalClose('settingsModal');
    setupModalClose('txModal');

    // Settings Modal Open
    const openSettings = (e) => { e.preventDefault(); openModal('settingsModal'); DOM.profileDropdown.classList.remove('show'); };
    DOM.navSettingsBtn.addEventListener('click', openSettings);
    DOM.dropdownSettingsBtn.addEventListener('click', openSettings);

    // Settings Tabs
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.settings-content .tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
      });
    });

    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      const themePref = document.querySelector('input[name="theme_pref"]:checked')?.value;
      if(themePref) { applyTheme(themePref); }
      closeModal('settingsModal');
      showToast('Settings saved successfully', 'success');
    });

    // Command Center (Cmd+K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal('searchModal');
        setTimeout(() => DOM.searchInput.focus(), 100);
      }
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(m => closeModal(m.id));
      }
    });
    DOM.openSearchBtn.addEventListener('click', () => {
      openModal('searchModal');
      setTimeout(() => DOM.searchInput.focus(), 100);
    });
    
    // Search input simulation
    DOM.searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      if(val.length > 1) {
        DOM.searchResults.style.display = 'block';
        DOM.searchResults.innerHTML = `
          <div class="search-result-item" onclick="document.getElementById('navSettingsBtn').click();"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4..."></path></svg><span class="search-result-text">Go to Settings</span></div>
          <div class="search-result-item" data-close-search-result><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg><span class="search-result-text">View Monthly Report for ${val}</span></div>
        `;
      } else {
        DOM.searchResults.style.display = 'none';
      }
    });

    DOM.searchResults.addEventListener('click', (e) => {
      const result = e.target.closest('[data-close-search-result]');
      if (result) closeModal('searchModal');
    });

    // Transaction Table Sort
    DOM.thSortable.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if(currentSort.column === col) {
          currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.column = col;
          currentSort.order = 'asc';
        }
        sortTransactions();
        renderTable();
      });
    });

    // Transaction Table Search
    DOM.txSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      filteredTransactions = DemoData.transactions.filter(t => 
        t.customer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      );
      currentPage = 1;
      renderTable();
    });

    // Pagination
    DOM.btnPrevPage.addEventListener('click', () => { if(currentPage > 1) { currentPage--; renderTable(); }});
    DOM.btnNextPage.addEventListener('click', () => { if(currentPage * itemsPerPage < filteredTransactions.length) { currentPage++; renderTable(); }});

    // Exports
    DOM.exportTableBtn.addEventListener('click', () => exportCSV(filteredTransactions, 'transactions.csv'));
    DOM.exportChartBtn.addEventListener('click', () => exportCSV([{ date: '2026-09-17', revenue: 128430 }], 'revenue_summary.csv'));
    
    // Receipt Download mock
    document.getElementById('txDownloadReceipt').addEventListener('click', () => {
      showToast('Receipt downloaded', 'success');
      closeModal('txModal');
    });

    // Resize observer for chart
    window.addEventListener('resize', debounce(renderCharts, 250));
  }

  /* ==========================================================================
     CORE FUNCTIONS
     ========================================================================== */

  function renderDashboardData() {
    renderKPIs();
    renderCharts();
    renderBreakdown();
    renderActivity();
    renderTable();
    renderReports();
  }

  function applyTheme(theme) {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      DOM.html.classList.toggle('dark', prefersDark);
    } else {
      DOM.html.classList.toggle('dark', theme === 'dark');
    }
    AppState.theme = theme;
    localStorage.setItem('insightly_theme', theme);
    // Sync settings radio if open
    const radio = document.querySelector(`input[name="theme_pref"][value="${theme}"]`);
    if(radio) radio.checked = true;
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = {
      success: '<svg class="toast-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      info: '<svg class="toast-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `
      ${icons[type]}
      <span class="toast-message">${message}</span>
      <svg class="toast-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    `;
    
    DOM.toastContainer.appendChild(toast);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('closing');
      setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
      if(document.body.contains(toast)) {
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  function updateNotificationBadges() {
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    document.querySelectorAll('.unread-badge').forEach(b => {
      b.textContent = unreadCount;
      b.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    });
  }

  function renderNotifications() {
    const list = document.getElementById('notificationList');
    if (AppState.notifications.length === 0) {
      list.innerHTML = '<div class="notif-empty">No new notifications</div>';
      return;
    }
    list.innerHTML = AppState.notifications.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-icon"></div>
        <div class="notif-content">
          <h4>${n.title}</h4>
          <p>${n.desc}</p>
          <span class="notif-time">${n.time}</span>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.getAttribute('data-id'));
        const notif = AppState.notifications.find(n => n.id === id);
        if(notif && !notif.read) {
          notif.read = true;
          updateNotificationBadges();
          renderNotifications();
        }
      });
    });
  }

  /* ==========================================================================
     DATA RENDERING (DOM INJECTIONS)
     ========================================================================== */

  function renderKPIs() {
    const data = DemoData.kpis[AppState.currentDateRange];
    
    const makeCard = (title, icon, value, change, textStr) => {
      const isUp = change >= 0;
      const changeClass = isUp ? 'up' : 'down';
      const changeIcon = isUp ? '<polyline points="18 15 12 9 6 15"></polyline>' : '<polyline points="6 9 12 15 18 9"></polyline>';
      const sign = isUp ? '+' : '';
      
      return `
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">${title}</span>
            <div class="kpi-icon">${icon}</div>
          </div>
          <div class="kpi-value">${value}</div>
          <div class="kpi-stat">
            <span class="kpi-change ${changeClass}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${changeIcon}</svg>
              ${sign}${change}%
            </span>
            <span class="kpi-compare">vs prev period</span>
          </div>
        </div>
      `;
    };

    DOM.kpiContainer.innerHTML = 
      makeCard('Revenue', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>', data.rev, data.revChange) +
      makeCard('Users', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', data.users, data.usersChange) +
      makeCard('Transactions', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>', data.tx, data.txChange) +
      makeCard('Growth', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>', data.growth, data.growthChange);
  }

  function renderCharts() {
    renderMainSVGChart();
    renderCSSBarChart();
  }

  function renderMainSVGChart() {
    const container = document.getElementById('revenueChartContainer');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width === 0) return; // Hidden
    
    const data = DemoData.revenueChart.values;
    const labels = DemoData.revenueChart.labels;
    const max = Math.max(...data) * 1.1; // 10% padding top
    const min = 0;
    
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    const getX = i => padding.left + (i * (chartW / (data.length - 1)));
    const getY = val => padding.top + chartH - ((val - min) / (max - min) * chartH);

    let pathD = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      // Smooth curve approximation
      const cp1X = getX(i - 0.5);
      const cp1Y = getY(data[i - 1]);
      const cp2X = getX(i - 0.5);
      const cp2Y = getY(data[i]);
      pathD += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${getX(i)} ${getY(data[i])}`;
    }

    const areaD = `${pathD} L ${getX(data.length - 1)} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

    // Grid lines (3 horizontal)
    let gridLines = '';
    for(let i=0; i<=3; i++) {
      const y = padding.top + (chartH / 3) * i;
      const val = Math.round(max - ((max/3) * i));
      gridLines += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-grid-line" />
                    <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" class="chart-text">${val > 1000 ? (val/1000).toFixed(1)+'k' : val}</text>`;
    }

    // X Labels
    let xLabels = '';
    data.forEach((_, i) => {
      if(i % 2 === 0) { // skip every other label for space
        xLabels += `<text x="${getX(i)}" y="${height - 5}" text-anchor="middle" class="chart-text">${labels[i]}</text>`;
      }
    });

    // Points
    let points = '';
    data.forEach((val, i) => {
      points += `<circle cx="${getX(i)}" cy="${getY(val)}" r="4" class="chart-point" data-val="$${val.toLocaleString()}" data-label="${labels[i]}" />`;
    });

    container.innerHTML = `
      <div class="chart-tooltip" id="chartTooltip"></div>
      <svg class="line-chart" viewBox="0 0 ${width} ${height}">
        ${gridLines}
        ${xLabels}
        <path d="${areaD}" class="chart-area" />
        <path d="${pathD}" class="chart-path" />
        ${points}
      </svg>
    `;

    // Tooltip logic
    const tooltip = container.querySelector('#chartTooltip');
    container.querySelectorAll('.chart-point').forEach(pt => {
      pt.addEventListener('mouseenter', (e) => {
        const b = pt.getBoundingClientRect();
        const cb = container.getBoundingClientRect();
        tooltip.innerHTML = `<strong>${pt.getAttribute('data-label')}</strong><br/>${pt.getAttribute('data-val')}`;
        tooltip.style.left = `${b.left - cb.left - 30}px`;
        tooltip.style.top = `${b.top - cb.top - 40}px`;
        tooltip.style.opacity = '1';
      });
      pt.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
    });
  }

  function renderCSSBarChart() {
    const container = document.getElementById('usersChartContainer');
    const data = DemoData.usersChart;
    const maxVal = Math.max(...data.map(d => d.new + d.returning));

    let html = '<div class="bar-chart-wrapper">';
    data.forEach(d => {
      const h1 = (d.new / maxVal) * 100;
      const h2 = (d.returning / maxVal) * 100;
      html += `
        <div class="bar-group" title="New: ${d.new} | Returning: ${d.returning}">
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: flex-end; width: 100%; gap: 2px;">
            <div class="bar secondary" style="height: ${h2}%"></div>
            <div class="bar primary" style="height: ${h1}%"></div>
          </div>
          <span class="bar-label">${d.label}</span>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function renderBreakdown() {
    // Traffic
    const tList = document.getElementById('trafficSourcesList');
    tList.innerHTML = DemoData.traffic.map(t => `
      <div class="progress-item">
        <div class="progress-header"><span>${t.source}</span><span>${t.value}%</span></div>
        <div class="progress-track"><div class="progress-bar" style="width: 0%"></div></div>
      </div>
    `).join('');
    
    // Animate bars
    setTimeout(() => {
      tList.querySelectorAll('.progress-bar').forEach((bar, i) => {
        bar.style.width = DemoData.traffic[i].value + '%';
      });
    }, 100);

    // Devices (Legend only, CSS handles Donut)
    const dLegend = document.getElementById('deviceLegend');
    dLegend.innerHTML = DemoData.devices.map(d => `
      <span class="legend-item"><span class="dot" style="background: ${d.color}"></span>${d.type} (${d.percent}%)</span>
    `).join('');
  }

  function renderActivity() {
    const icons = {
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
      transaction: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
    };

    document.getElementById('activityFeed').innerHTML = DemoData.activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon ${a.type}">${icons[a.type]}</div>
        <div class="activity-content">
          <div class="activity-title">${a.title}</div>
          <div class="activity-desc">${a.desc}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>
    `).join('');
  }

  function sortTransactions() {
    filteredTransactions.sort((a, b) => {
      let valA = a[currentSort.column];
      let valB = b[currentSort.column];
      
      if(currentSort.column === 'amount') {
        valA = parseFloat(valA.replace(/[$,]/g, ''));
        valB = parseFloat(valB.replace(/[$,]/g, ''));
      }
      
      if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
      if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function renderTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filteredTransactions.slice(start, end);
    
    if (paginated.length === 0) {
      DOM.txTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No transactions found.</td></tr>';
    } else {
      DOM.txTableBody.innerHTML = paginated.map(tx => `
        <tr data-id="${tx.id}">
          <td><strong>${tx.id}</strong></td>
          <td>${tx.customer}</td>
          <td>${tx.date}</td>
          <td>${tx.amount}</td>
          <td><span class="status-badge status-${tx.status}">${tx.status}</span></td>
          <td>${tx.method}</td>
        </tr>
      `).join('');
      
      // Add row click listeners for details modal
      DOM.txTableBody.querySelectorAll('tr').forEach(tr => {
        tr.addEventListener('click', () => showTxDetails(tr.getAttribute('data-id')));
      });
    }

    // Pagination info
    document.getElementById('pageStart').textContent = filteredTransactions.length === 0 ? 0 : start + 1;
    document.getElementById('pageEnd').textContent = Math.min(end, filteredTransactions.length);
    document.getElementById('pageTotal').textContent = filteredTransactions.length;
    
    DOM.btnPrevPage.disabled = currentPage === 1;
    DOM.btnNextPage.disabled = end >= filteredTransactions.length;
  }

  function showTxDetails(id) {
    const tx = DemoData.transactions.find(t => t.id === id);
    if(!tx) return;
    
    document.getElementById('txModalTitle').textContent = `Transaction ${tx.id}`;
    document.getElementById('txModalBody').innerHTML = `
      <div class="tx-detail-grid">
        <div><div class="tx-label">Customer</div><div class="tx-value">${tx.customer}</div></div>
        <div><div class="tx-label">Date</div><div class="tx-value">${tx.date}</div></div>
        <div><div class="tx-label">Payment Method</div><div class="tx-value">${tx.method}</div></div>
        <div><div class="tx-label">Status</div><div class="status-badge status-${tx.status}" style="display:inline-block">${tx.status}</div></div>
      </div>
      <div style="margin-bottom: 2rem;">
        <div class="tx-label">Amount</div>
        <div class="tx-value large">${tx.amount}</div>
      </div>
      <div class="tx-label" style="margin-bottom: 1rem">Timeline</div>
      <div class="timeline">
        <div class="timeline-item completed">
          <div class="timeline-title">Payment Initiated</div>
          <div class="timeline-time">${tx.date} 09:41 AM</div>
        </div>
        <div class="timeline-item completed">
          <div class="timeline-title">Payment Processing</div>
          <div class="timeline-time">${tx.date} 09:42 AM</div>
        </div>
        <div class="timeline-item ${tx.status === 'completed' ? 'completed' : ''}">
          <div class="timeline-title">Payment ${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</div>
          <div class="timeline-time">${tx.date} 09:45 AM</div>
        </div>
      </div>
    `;
    openModal('txModal');
  }

  function renderReports() {
    const reports = [
      { title: 'Monthly Revenue Report', desc: 'Detailed breakdown of September revenue.', type: 'csv' },
      { title: 'User Growth & Retention', desc: 'Active users and retention cohorts.', type: 'pdf' },
      { title: 'Performance Summary', desc: 'High-level KPI export for Q3.', type: 'json' }
    ];
    
    document.getElementById('reportsGrid').innerHTML = reports.map(r => `
      <div class="report-card">
        <div class="report-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <div>
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem;">${r.title}</h3>
          <p style="font-size: 0.8125rem; color: var(--text-secondary);">${r.desc}</p>
        </div>
        <div class="report-actions">
          <button class="btn btn-sm btn-primary" onclick="alert('Download started')">Download ${r.type.toUpperCase()}</button>
          <button class="btn btn-sm btn-outline">Share</button>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     UTILITIES
     ========================================================================== */
  
  function exportCSV(dataArray, filename) {
    if(!dataArray || !dataArray.length) {
      showToast('No data to export', 'warning');
      return;
    }
    const headers = Object.keys(dataArray[0]).join(',');
    const rows = dataArray.map(obj => Object.values(obj).map(v => `"${v}"`).join(',')).join('\n');
    const csvStr = headers + '\n' + rows;
    
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filename} exported successfully`, 'success');
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Start Application
  init();

});