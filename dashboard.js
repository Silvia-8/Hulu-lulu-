/**
 * NEXUS STUDENT OS - DASHBOARD VIEW CONTROLLER
 * Renders welcoming header, dynamic progress ring, quick stats, today's schedule,
 * upcoming study sessions, deadlines, and charts.
 */

class DashboardView {
  constructor() {
    this.container = document.getElementById('view-dashboard');
    this.currentQuoteIndex = 0;
  }

  init() {
    window.AppStore.subscribe(() => {
      if (this.container && this.container.classList.contains('active')) {
        this.render();
      }
    });
    this.startLiveClock();
  }

  startLiveClock() {
    setInterval(() => {
      const timeElem = document.getElementById('dash-live-time');
      if (timeElem) {
        const now = new Date();
        timeElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }, 1000);
  }

  getGreeting(name) {
    const hour = new Date().getHours();
    let timeGreeting = 'Good evening';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 18) timeGreeting = 'Good afternoon';
    return `${timeGreeting}, <span>${name || 'Scholar'}</span>`;
  }

  getNextQuote() {
    const quotes = window.AppStore.getState().quotes || [];
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % quotes.length;
    this.render();
  }

  render() {
    if (!this.container) return;
    const state = window.AppStore.getState();
    const { profile, tasks, studySessions, deadlines, quotes, history } = state;

    const todayDate = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.dueDate === todayDate || t.status === 'in_progress');
    const completedTasksToday = tasks.filter(t => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(todayDate));
    const allCompletedToday = tasks.filter(t => t.status === 'completed');

    // Calculate today's study hours from completed sessions & history
    const todayHistory = history.find(h => h.date === todayDate);
    const todayStudyHours = todayHistory ? todayHistory.hours : 2.5;
    const goalPercent = Math.min(100, Math.round((todayStudyHours / (profile.dailyGoalHours || 4)) * 100));

    // Progress Ring Calculations (radius = 32, circumference = 2 * PI * 32 ~= 201)
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (goalPercent / 100) * circumference;

    const activeQuote = quotes[this.currentQuoteIndex] || quotes[0] || { text: "Focus creates flow.", author: "Nexus" };

    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

    const now = new Date();
    const liveTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let html = `
      <div class="dashboard-grid">
        <!-- Welcoming Hero Banner -->
        <div class="hero-banner">
          <div>
            <div class="hero-greeting">
              ${this.getGreeting(profile.name)}
            </div>
            <p style="font-size: var(--text-sm); color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
              <span>📅 ${formattedDate}</span> • 
              <span id="dash-live-time" style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-primary);">${liveTimeStr}</span> • 
              <span>🔥 ${profile.streakDays} Day Study Streak</span>
            </p>
            
            <div class="hero-quote-box">
              <span>"${activeQuote.text}" — <strong style="color: var(--text-primary);">${activeQuote.author}</strong></span>
              <button onclick="window.dashboardView.getNextQuote()" title="Next quote">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              </button>
            </div>
          </div>

          <div class="hero-quick-actions">
            <button class="btn btn-secondary" onclick="window.app.openModal('modal-add-session')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Log Session
            </button>
            <button class="btn btn-primary" onclick="window.app.openModal('modal-add-task')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Task
            </button>
          </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <div class="stats-grid">
          <!-- Card 1: Daily Focus Goal -->
          <div class="card stat-card hover-lift">
            <div class="stat-header">
              <span class="card-subtitle" style="font-weight: 700;">DAILY FOCUS GOAL</span>
              <div class="stat-icon-wrapper" style="background: var(--accent-glow-subtle); color: var(--accent-primary);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px;">
              <div>
                <div class="stat-value">${todayStudyHours} <span style="font-size: 1rem; color: var(--text-muted);">/ ${profile.dailyGoalHours}h</span></div>
                <div class="stat-caption">
                  <span style="color: var(--color-success); font-weight: 700;">${goalPercent}%</span> of target reached
                </div>
              </div>
              <div class="progress-ring-wrapper">
                <svg class="progress-ring" width="76" height="76">
                  <circle class="progress-ring-bg" stroke-width="6" fill="transparent" r="${radius}" cx="38" cy="38"/>
                  <circle class="progress-ring-circle" stroke-width="6" fill="transparent" r="${radius}" cx="38" cy="38"
                          style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset};"/>
                </svg>
                <div class="progress-ring-content">
                  <span style="font-size: 0.75rem; font-weight: 800; font-family: var(--font-mono);">${goalPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Tasks Completed -->
          <div class="card stat-card hover-lift">
            <div class="stat-header">
              <span class="card-subtitle" style="font-weight: 700;">TASKS COMPLETED</span>
              <div class="stat-icon-wrapper" style="background: var(--color-success-bg); color: var(--color-success);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            </div>
            <div>
              <div class="stat-value">${allCompletedToday.length} <span style="font-size: 1rem; color: var(--text-muted);">/ ${tasks.length} total</span></div>
              <div class="stat-caption">
                <span style="color: var(--accent-primary); font-weight: 700;">${tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length} tasks</span> pending
              </div>
            </div>
          </div>

          <!-- Card 3: Study Streak & XP -->
          <div class="card stat-card hover-lift">
            <div class="stat-header">
              <span class="card-subtitle" style="font-weight: 700;">STUDENT RANK & XP</span>
              <div class="stat-icon-wrapper" style="background: var(--color-warning-bg); color: var(--color-warning);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
            </div>
            <div>
              <div class="stat-value">Level ${profile.level} <span style="font-size: 0.85rem; color: var(--accent-primary); font-weight: 600;">Scholar</span></div>
              <div class="stat-caption">
                <span style="font-family: var(--font-mono); font-weight: 700;">${profile.xp}</span> / ${profile.nextLevelXp} XP (${Math.round((profile.xp/profile.nextLevelXp)*100)}%)
              </div>
            </div>
          </div>

          <!-- Card 4: Upcoming Deadlines -->
          <div class="card stat-card hover-lift">
            <div class="stat-header">
              <span class="card-subtitle" style="font-weight: 700;">UPCOMING EXAMS & DUE</span>
              <div class="stat-icon-wrapper" style="background: var(--color-danger-bg); color: var(--color-danger);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            </div>
            <div>
              <div class="stat-value">${deadlines.length} <span style="font-size: 1rem; color: var(--text-muted);">assessments</span></div>
              <div class="stat-caption" style="color: var(--color-danger);">
                ⚠️ 1 urgent in next 24h
              </div>
            </div>
          </div>
        </div>

        <!-- 2-Column Main Workspace Section -->
        <div class="dashboard-main-cols">
          <!-- LEFT COLUMN: Today's Tasks & Weekly Progress Chart -->
          <div style="display: flex; flex-direction: column; gap: var(--space-6);">
            
            <!-- Today's Tasks Widget -->
            <div class="card card-glow">
              <div class="card-header">
                <div>
                  <h3 class="card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    Today's Priority Tasks
                  </h3>
                  <div class="card-subtitle">Active action items needing focus today</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.app.navigate('tasks')">
                  View All (${tasks.length})
                </button>
              </div>

              <div class="dashboard-task-list">
                ${todayTasks.length === 0 ? `
                  <div class="empty-state">
                    <div class="empty-state-icon">✨</div>
                    <p style="font-size: var(--text-sm);">All tasks for today completed! High five!</p>
                  </div>
                ` : todayTasks.slice(0, 4).map(task => `
                  <div class="dashboard-task-item ${task.status === 'completed' ? 'completed' : ''}">
                    <div class="task-left">
                      <label class="checkbox-label" onclick="event.stopPropagation()">
                        <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} onchange="window.dashboardView.toggleTask('${task.id}')"/>
                        <span class="custom-checkbox">
                          <svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      </label>
                      <div>
                        <div class="task-title" style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">
                          ${task.title}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
                          ⏱️ ~${task.estimatedMinutes}m • ${task.subtasks && task.subtasks.length > 0 ? `${task.subtasks.filter(s=>s.done).length}/${task.subtasks.length} subtasks` : 'Ready to start'}
                        </div>
                      </div>
                    </div>

                    <div class="task-meta">
                      <span class="badge badge-${task.subject}">${task.subject}</span>
                      <span class="badge badge-priority-${task.priority}">${task.priority}</span>
                      <button class="btn btn-ghost btn-sm" onclick="window.dashboardView.startTaskInTimer('${task.id}')" title="Start Focus Timer for this task">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="card-footer" style="padding-top: var(--space-3); margin-top: var(--space-3);">
                <button class="btn btn-ghost btn-sm" style="width: 100%; border: 1px dashed var(--border-subtle);" onclick="window.app.openModal('modal-add-task')">
                  + Add Quick Task
                </button>
              </div>
            </div>

            <!-- Weekly Progress Chart Widget -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    Weekly Study Velocity
                  </h3>
                  <div class="card-subtitle">Daily focus hours logged vs. ${profile.dailyGoalHours}h target</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="window.app.navigate('progress')">
                  Full Analytics →
                </button>
              </div>
              <div id="dash-weekly-chart" style="height: 180px; width: 100%;"></div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Study Sessions & Upcoming Deadlines -->
          <div style="display: flex; flex-direction: column; gap: var(--space-6);">
            
            <!-- Study Sessions Widget -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Study Sessions
                  </h3>
                  <div class="card-subtitle">Scheduled blocks for today</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="window.app.openModal('modal-add-session')">
                  + Add
                </button>
              </div>

              <div class="session-list">
                ${studySessions.map(sess => `
                  <div class="session-item ${sess.completed ? 'completed' : ''}">
                    <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                      <button class="icon-btn" style="width: 32px; height: 32px; border-radius: 50%; ${sess.completed ? 'background: var(--color-success); color: white; border: none;' : ''}"
                              onclick="window.dashboardView.toggleSession('${sess.id}')" title="${sess.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        ${sess.completed ? `
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ` : `
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                        `}
                      </button>
                      <div>
                        <div style="font-size: var(--text-sm); font-weight: 700; ${sess.completed ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-primary);'}">
                          ${sess.topic}
                        </div>
                        <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
                          <span class="badge badge-${sess.subject}">${sess.subject}</span> • ⏱️ ${sess.durationMinutes} mins
                        </div>
                      </div>
                    </div>

                    <div>
                      ${!sess.completed ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.dashboardView.startSessionInTimer('${sess.subject}', '${encodeURIComponent(sess.topic)}', ${sess.durationMinutes})" title="Launch in Pomodoro Timer">
                          ▶ Start
                        </button>
                      ` : `
                        <span style="font-size: var(--text-xs); color: var(--color-success); font-weight: 700;">Done ✨</span>
                      `}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Upcoming Exam & Assignment Deadlines -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Upcoming Deadlines
                  </h3>
                  <div class="card-subtitle">Exams, labs & project milestones</div>
                </div>
              </div>

              <div>
                ${deadlines.map(dl => `
                  <div class="deadline-item ${dl.urgent ? 'urgent' : ''}">
                    <div>
                      <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">
                        ${dl.title}
                      </div>
                      <div style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
                        📚 ${dl.course} • Due: ${dl.date}
                      </div>
                    </div>
                    <div>
                      <span class="countdown-badge">
                        ${dl.daysLeft === 0 ? 'Due Today!' : `${dl.daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Render chart
    setTimeout(() => {
      window.AppCharts.renderWeeklyBarChart('dash-weekly-chart', history, profile.dailyGoalHours);
    }, 50);
  }

  toggleTask(taskId) {
    window.AppAudio.playClick();
    window.AppStore.toggleTaskStatus(taskId);
    window.app.showToast('Task updated!', 'success');
  }

  toggleSession(sessionId) {
    window.AppAudio.playClick();
    window.AppStore.toggleSessionCompleted(sessionId);
    window.app.showToast('Study session updated!', 'info');
  }

  startTaskInTimer(taskId) {
    const task = window.AppStore.getState().tasks.find(t => t.id === taskId);
    if (task) {
      window.timerView.setTargetSubject(task.subject, task.title, task.estimatedMinutes);
      window.app.navigate('timer');
    }
  }

  startSessionInTimer(subject, topicEncoded, duration) {
    const topic = decodeURIComponent(topicEncoded);
    window.timerView.setTargetSubject(subject, topic, duration);
    window.app.navigate('timer');
  }
}

window.dashboardView = new DashboardView();
