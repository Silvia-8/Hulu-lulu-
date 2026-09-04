/**
 * NEXUS STUDENT OS - PROGRESS & ANALYTICS VIEW
 * Interactive study analytics, charts, XP level progression, and session breakdown.
 */

class ProgressView {
  constructor() {
    this.container = document.getElementById('view-progress');
  }

  init() {
    window.AppStore.subscribe(() => {
      if (this.container && this.container.classList.contains('active')) {
        this.render();
      }
    });
  }

  render() {
    if (!this.container) return;
    const state = window.AppStore.getState();
    const { profile, tasks, studySessions, history } = state;

    // Metrics calculations
    const totalWeeklyHours = history.reduce((sum, h) => sum + (h.hours || 0), 0).toFixed(1);
    const dailyAverageHours = (totalWeeklyHours / (history.length || 1)).toFixed(1);
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
    const completedSessionsCount = studySessions.filter(s => s.completed).length;

    const xpPercent = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

    let html = `
      <div class="progress-grid">
        
        <!-- Header -->
        <div>
          <h2>Performance & Study Analytics</h2>
          <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
            Track your focus velocity, subject balance, and academic momentum
          </p>
        </div>

        <!-- Gamification XP & Level Progression Card -->
        <div class="xp-level-card card">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 56px; height: 56px; border-radius: var(--radius-lg); background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: white; box-shadow: 0 4px 18px var(--accent-glow);">
              ${profile.level}
            </div>
            <div>
              <div style="font-size: var(--text-lg); font-weight: 800; color: var(--text-primary);">
                Scholar Rank: Level ${profile.level}
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
                🔥 ${profile.streakDays} Day Active Streak • Earn XP by completing tasks & focus sessions
              </div>
            </div>
          </div>

          <div class="xp-bar-container" style="max-width: 450px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700;">
              <span>XP Progress</span>
              <span style="font-family: var(--font-mono); color: var(--accent-primary);">${profile.xp} / ${profile.nextLevelXp} XP (${xpPercent}%)</span>
            </div>
            <div class="xp-bar-track">
              <div class="xp-bar-fill" style="width: ${xpPercent}%;"></div>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-align: right;">
              ${profile.nextLevelXp - profile.xp} XP until Level ${profile.level + 1}
            </div>
          </div>
        </div>

        <!-- 4 Summary KPI Cards -->
        <div class="stats-grid">
          <div class="card stat-card">
            <div class="stat-header">
              <span class="card-subtitle">WEEKLY FOCUS TIME</span>
              <span style="color: var(--accent-primary);">⏱️</span>
            </div>
            <div class="stat-value">${totalWeeklyHours} <span style="font-size: 0.9rem; color: var(--text-muted);">hours</span></div>
            <div class="stat-caption">Last 7 days total</div>
          </div>

          <div class="card stat-card">
            <div class="stat-header">
              <span class="card-subtitle">DAILY AVERAGE</span>
              <span style="color: var(--color-success);">📈</span>
            </div>
            <div class="stat-value">${dailyAverageHours} <span style="font-size: 0.9rem; color: var(--text-muted);">hrs/day</span></div>
            <div class="stat-caption">Target: ${profile.dailyGoalHours}h/day</div>
          </div>

          <div class="card stat-card">
            <div class="stat-header">
              <span class="card-subtitle">TASK COMPLETION RATE</span>
              <span style="color: var(--color-warning);">✅</span>
            </div>
            <div class="stat-value">${taskCompletionRate}%</div>
            <div class="stat-caption">${completedTasksCount} of ${tasks.length} tasks finished</div>
          </div>

          <div class="card stat-card">
            <div class="stat-header">
              <span class="card-subtitle">COMPLETED SESSIONS</span>
              <span style="color: var(--accent-secondary);">🎯</span>
            </div>
            <div class="stat-value">${completedSessionsCount}</div>
            <div class="stat-caption">Focus blocks logged</div>
          </div>
        </div>

        <!-- Visual Charts Grid Row -->
        <div class="charts-row">
          
          <!-- Chart 1: Weekly Hours Velocity -->
          <div class="card chart-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Daily Study Hours (Weekly Trend)</h3>
                <div class="card-subtitle">Hours logged per day vs. ${profile.dailyGoalHours}h target line</div>
              </div>
            </div>
            <div id="analytics-weekly-chart" class="chart-container"></div>
          </div>

          <!-- Chart 2: Subject Time Breakdown -->
          <div class="card chart-card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Subject Focus Breakdown</h3>
                <div class="card-subtitle">Time distribution across courses</div>
              </div>
            </div>
            <div id="analytics-subject-dist" class="chart-container" style="display: flex; align-items: center;"></div>
          </div>

        </div>

        <!-- Recent Study Sessions Log Table -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Study Log History</h3>
              <div class="card-subtitle">Recorded focus sessions</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.openModal('modal-add-session')">+ Log Session</button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm); text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: var(--text-xs); text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Topic / Task</th>
                  <th style="padding: 10px 14px;">Subject</th>
                  <th style="padding: 10px 14px;">Duration</th>
                  <th style="padding: 10px 14px;">Date</th>
                  <th style="padding: 10px 14px;">Status</th>
                  <th style="padding: 10px 14px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${studySessions.map(s => `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 12px 14px; font-weight: 600; color: var(--text-primary);">${s.topic}</td>
                    <td style="padding: 12px 14px;"><span class="badge badge-${s.subject}">${s.subject}</span></td>
                    <td style="padding: 12px 14px; font-family: var(--font-mono); color: var(--text-secondary);">${s.durationMinutes} mins</td>
                    <td style="padding: 12px 14px; color: var(--text-muted); font-size: var(--text-xs);">${s.date || 'Today'}</td>
                    <td style="padding: 12px 14px;">
                      <span class="badge ${s.completed ? 'badge-priority-low' : 'badge-priority-med'}">
                        ${s.completed ? 'Completed' : 'Scheduled'}
                      </span>
                    </td>
                    <td style="padding: 12px 14px; text-align: right;">
                      <button class="icon-btn" style="width: 28px; height: 28px; display: inline-flex;" onclick="window.AppStore.deleteStudySession('${s.id}')" title="Delete record">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.container.innerHTML = html;

    // Render charts
    setTimeout(() => {
      window.AppCharts.renderWeeklyBarChart('analytics-weekly-chart', history, profile.dailyGoalHours);
      window.AppCharts.renderSubjectDistribution('analytics-subject-dist', studySessions, tasks);
    }, 50);
  }
}

window.progressView = new ProgressView();
