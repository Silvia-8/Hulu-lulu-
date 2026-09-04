/**
 * NEXUS STUDENT OS - CORE APP CONTROLLER & ROUTER
 * Coordinates views, modals, toasts, keyboard shortcuts, and responsive navigation.
 */

class NexusApp {
  constructor() {
    this.currentView = 'dashboard';
    this.views = {
      dashboard: window.dashboardView,
      tasks: window.tasksView,
      timer: window.timerView,
      progress: window.progressView,
      notes: window.notesView,
      settings: window.settingsView
    };
  }

  init() {
    // Apply saved theme & accent from state
    const state = window.AppStore.getState();
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
    document.documentElement.setAttribute('data-accent', state.settings.accent || 'indigo');

    // Initialize all view instances
    Object.values(this.views).forEach(v => {
      if (v && typeof v.init === 'function') v.init();
    });

    this.setupEventListeners();
    this.setupModals();
    this.setupShortcuts();
    this.navigate('dashboard');
    this.updateUserBadge();

    // Subscribe to state changes for global header & user badge updates
    window.AppStore.subscribe(() => {
      this.updateUserBadge();
      this.updateNavBadges();
    });
    this.updateNavBadges();
  }

  navigate(viewName) {
    if (!this.views[viewName]) return;

    this.currentView = viewName;

    // Update View Containers
    document.querySelectorAll('.view-section').forEach(el => {
      el.classList.remove('active');
    });
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update Sidebar Navigation
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.dataset.view === viewName) el.classList.add('active');
      else el.classList.remove('active');
    });

    // Update Mobile Bottom Nav
    document.querySelectorAll('.mobile-nav-item').forEach(el => {
      if (el.dataset.view === viewName) el.classList.add('active');
      else el.classList.remove('active');
    });

    // Update Topbar Title
    const titles = {
      dashboard: { title: 'Personal Dashboard', breadcrumb: 'Nexus OS • Command Center' },
      tasks: { title: 'Task & Assignment Manager', breadcrumb: 'Nexus OS • Tasks & Projects' },
      timer: { title: 'Focus Pomodoro & Ambient', breadcrumb: 'Nexus OS • Study Timer' },
      progress: { title: 'Study Analytics & Velocity', breadcrumb: 'Nexus OS • Insights' },
      notes: { title: 'Study Notes & Cheat Sheets', breadcrumb: 'Nexus OS • Knowledge Base' },
      settings: { title: 'Preferences & System', breadcrumb: 'Nexus OS • Settings' }
    };

    const titleInfo = titles[viewName] || { title: 'Nexus OS', breadcrumb: 'Workspace' };
    const pageTitleElem = document.getElementById('topbar-page-title');
    const pageBreadcrumbElem = document.getElementById('topbar-page-breadcrumb');
    if (pageTitleElem) pageTitleElem.textContent = titleInfo.title;
    if (pageBreadcrumbElem) pageBreadcrumbElem.textContent = titleInfo.breadcrumb;

    // Render active view
    if (this.views[viewName] && typeof this.views[viewName].render === 'function') {
      this.views[viewName].render();
    }

    // Close mobile drawer if open
    this.closeMobileSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateUserBadge() {
    const { profile } = window.AppStore.getState();
    const avatarElem = document.getElementById('sidebar-user-avatar');
    const nameElem = document.getElementById('sidebar-user-name');
    const levelElem = document.getElementById('sidebar-user-level');

    if (avatarElem) avatarElem.textContent = profile.avatar || 'ST';
    if (nameElem) nameElem.textContent = profile.name || 'Scholar';
    if (levelElem) levelElem.textContent = `Level ${profile.level} • ${profile.streakDays}d Streak 🔥`;
  }

  updateNavBadges() {
    const { tasks, notes } = window.AppStore.getState();
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length;
    
    const taskBadge = document.getElementById('nav-badge-tasks');
    if (taskBadge) taskBadge.textContent = pendingTasks;

    const notesBadge = document.getElementById('nav-badge-notes');
    if (notesBadge) notesBadge.textContent = notes.length;
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : currentTheme === 'light' ? 'oled' : 'dark';
    window.settingsView.setTheme(nextTheme);
  }

  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  // ==========================================
  // MODAL MANAGEMENT
  // ==========================================
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  setupModals() {
    // Backdrop click to close
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });

    // Form submission for Add Task
    const addTaskForm = document.getElementById('form-add-task');
    if (addTaskForm) {
      addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subtasks = [];
        addTaskForm.querySelectorAll('.new-subtask-input').forEach(input => {
          if (input.value.trim()) {
            subtasks.push({ id: 'st-' + Date.now() + Math.random(), title: input.value.trim(), done: false });
          }
        });

        window.AppStore.addTask({
          title: addTaskForm.title.value,
          desc: addTaskForm.desc.value,
          subject: addTaskForm.subject.value,
          priority: addTaskForm.priority.value,
          dueDate: addTaskForm.dueDate.value,
          estimatedMinutes: addTaskForm.estimatedMinutes.value,
          subtasks
        });

        addTaskForm.reset();
        this.closeModal('modal-add-task');
        this.showToast('New task added! +20 XP', 'success');
      });
    }

    // Form submission for Edit Task
    const editTaskForm = document.getElementById('form-edit-task');
    if (editTaskForm) {
      editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('edit-task-id').value;
        const subtasks = [];
        editTaskForm.querySelectorAll('.edit-subtask-row input').forEach(input => {
          if (input.value.trim()) {
            subtasks.push({
              id: input.dataset.subId || ('st-' + Date.now()),
              title: input.value.trim(),
              done: false
            });
          }
        });

        window.AppStore.updateTask(taskId, {
          title: document.getElementById('edit-task-title').value,
          desc: document.getElementById('edit-task-desc').value,
          subject: document.getElementById('edit-task-subject').value,
          priority: document.getElementById('edit-task-priority').value,
          status: document.getElementById('edit-task-status').value,
          dueDate: document.getElementById('edit-task-due').value,
          estimatedMinutes: parseInt(document.getElementById('edit-task-duration').value) || 30,
          subtasks
        });

        this.closeModal('modal-edit-task');
        this.showToast('Task updated successfully!', 'success');
      });
    }

    // Form submission for Add Study Session
    const addSessionForm = document.getElementById('form-add-session');
    if (addSessionForm) {
      addSessionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.AppStore.addStudySession({
          subject: addSessionForm.subject.value,
          topic: addSessionForm.topic.value,
          durationMinutes: addSessionForm.durationMinutes.value,
          completed: addSessionForm.completed.checked
        });

        addSessionForm.reset();
        this.closeModal('modal-add-session');
        this.showToast('Study session scheduled!', 'success');
      });
    }
  }

  addNewSubtaskRow() {
    const list = document.getElementById('new-subtasks-list');
    if (list) {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
      row.innerHTML = `
        <input type="text" class="input-field new-subtask-input" placeholder="Subtask milestone..." style="padding: 4px 8px; font-size: 0.8rem;"/>
        <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()" style="color: var(--color-danger);">✕</button>
      `;
      list.appendChild(row);
      row.querySelector('input').focus();
    }
  }

  addEditSubtaskRow() {
    const list = document.getElementById('edit-subtasks-list');
    if (list) {
      const row = document.createElement('div');
      row.className = 'edit-subtask-row';
      row.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
      row.innerHTML = `
        <input type="text" class="input-field" placeholder="Subtask milestone..." data-sub-id="st-${Date.now()}" style="padding: 4px 8px; font-size: 0.8rem;"/>
        <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()" style="color: var(--color-danger);">✕</button>
      `;
      list.appendChild(row);
      row.querySelector('input').focus();
    }
  }

  // ==========================================
  // TOAST SYSTEM
  // ==========================================
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✨';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================
  // SHORTCUTS & EVENT LISTENERS
  // ==========================================
  setupShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape closes modals
      if (e.key === 'Escape') {
        this.closeAllModals();
        if (window.timerView && window.timerView.isFullscreen) {
          window.timerView.toggleFullscreen();
        }
      }

      // Cmd / Ctrl + K opens Quick Add Task
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openModal('modal-add-task');
      }
    });
  }

  setupEventListeners() {
    // Navigation items click handling
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view;
        if (view) this.navigate(view);
      });
    });

    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.view;
        if (view) this.navigate(view);
      });
    });
  }
}

// Global App Instance
window.app = new NexusApp();

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
