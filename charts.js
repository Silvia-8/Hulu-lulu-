/**
 * NEXUS STUDENT OS - CHARTS & VISUALIZATION ENGINE
 * High-performance, zero-dependency responsive Canvas/SVG charts.
 */

class ChartEngine {
  constructor() {
    this.subjectColors = {
      cs: '#8b5cf6',
      math: '#06b6d4',
      bio: '#10b981',
      phys: '#f59e0b',
      lit: '#ec4899',
      other: '#64748b'
    };
    this.subjectLabels = {
      cs: 'Computer Science',
      math: 'Mathematics',
      bio: 'Biology',
      phys: 'Physics',
      lit: 'Literature',
      other: 'General & Other'
    };
  }

  /**
   * Renders the Weekly Study Hours Bar Chart
   */
  renderWeeklyBarChart(containerId, historyData, targetDailyHours = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = historyData || [];
    const maxVal = Math.max(...data.map(d => d.hours), targetDailyHours + 1, 6);

    let html = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-between; position: relative;">
        <!-- Target Goal Line Indicator -->
        <div style="position: absolute; left: 0; right: 0; top: ${100 - (targetDailyHours / maxVal) * 80}%; border-top: 1px dashed var(--accent-primary); opacity: 0.5; pointer-events: none; z-index: 1;">
          <span style="position: absolute; right: 0; top: -18px; font-size: 0.68rem; color: var(--accent-primary); font-weight: 700; background: var(--bg-card); padding: 0 4px; border-radius: 4px;">Goal: ${targetDailyHours}h</span>
        </div>

        <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; flex: 1; padding: 20px 4px 10px; z-index: 2;">
    `;

    data.forEach((item, index) => {
      const heightPercent = Math.max(8, (item.hours / maxVal) * 100);
      const isToday = item.day.includes('Today');
      const barColor = isToday ? 'var(--accent-gradient)' : 'linear-gradient(180deg, rgba(99, 102, 241, 0.7), rgba(6, 182, 212, 0.4))';
      const glow = isToday ? '0 0 14px var(--accent-glow)' : 'none';

      html += `
        <div style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end; group;" title="${item.day}: ${item.hours} hrs, ${item.tasksCompleted || 0} tasks done">
          <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: ${isToday ? 'var(--accent-primary)' : 'var(--text-secondary)'}; margin-bottom: 6px;">
            ${item.hours}h
          </span>
          <div style="width: 100%; max-width: 42px; height: ${heightPercent}%; background: ${barColor}; border-radius: 8px 8px 3px 3px; box-shadow: ${glow}; transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer;"
               onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
          </div>
          <span style="font-size: 0.75rem; font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--accent-primary)' : 'var(--text-muted)'}; margin-top: 8px; white-space: nowrap;">
            ${item.day.replace(' (Today)', '')}
          </span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Renders Subject Time/Focus Distribution Donut / Progress Bars
   */
  renderSubjectDistribution(containerId, sessions, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const distribution = { cs: 0, math: 0, bio: 0, phys: 0, lit: 0, other: 0 };
    let totalMinutes = 0;

    // Aggregate from completed & scheduled sessions
    (sessions || []).forEach(s => {
      const dur = s.durationMinutes || 30;
      distribution[s.subject] = (distribution[s.subject] || 0) + dur;
      totalMinutes += dur;
    });

    // Aggregate from tasks
    (tasks || []).forEach(t => {
      const dur = t.estimatedMinutes || 30;
      distribution[t.subject] = (distribution[t.subject] || 0) + dur;
      totalMinutes += dur;
    });

    if (totalMinutes === 0) totalMinutes = 1; // prevent div by 0

    let html = `
      <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
    `;

    Object.keys(distribution).forEach(subjectKey => {
      const minutes = distribution[subjectKey];
      if (minutes > 0 || ['cs', 'math', 'bio'].includes(subjectKey)) {
        const percent = Math.round((minutes / totalMinutes) * 100);
        const color = this.subjectColors[subjectKey] || '#64748b';
        const label = this.subjectLabels[subjectKey] || subjectKey;
        const hours = (minutes / 60).toFixed(1);

        html += `
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
              <span style="display: flex; align-items: center; gap: 6px; font-weight: 600; color: var(--text-primary);">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; box-shadow: 0 0 6px ${color};"></span>
                ${label}
              </span>
              <span style="font-family: var(--font-mono); color: var(--text-secondary); font-size: 0.75rem;">
                ${hours}h (${percent}%)
              </span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--border-subtle); border-radius: 99px; overflow: hidden;">
              <div style="width: ${percent}%; height: 100%; background: ${color}; border-radius: 99px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
            </div>
          </div>
        `;
      }
    });

    html += `</div>`;
    container.innerHTML = html;
  }
}

window.AppCharts = new ChartEngine();
