/**
 * NEXUS STUDENT OS - SETTINGS & PROFILE CONTROLLER
 * Handles theme toggles, accent palette picker, student profile, and data import/export.
 */

class SettingsView {
  constructor() {
    this.container = document.getElementById('view-settings');
  }

  init() {
    window.AppStore.subscribe(() => {
      if (this.container && this.container.classList.contains('active')) {
        this.render();
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    window.AppStore.updateSettings({ theme });
    this.render();
    window.app.showToast(`Theme changed to ${theme.toUpperCase()}`, 'info');
  }

  setAccent(accent) {
    document.documentElement.setAttribute('data-accent', accent);
    window.AppStore.updateSettings({ accent });
    this.render();
    window.app.showToast(`Accent color updated`, 'info');
  }

  render() {
    if (!this.container) return;
    const { profile, settings } = window.AppStore.getState();

    let html = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        
        <div>
          <h2>System Preferences & Profile</h2>
          <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
            Customize your visual workspace, student profile, and timer settings
          </p>
        </div>

        <div class="settings-grid">
          
          <!-- Card 1: Appearance & Themes -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Theme & Appearance</h3>
                <div class="card-subtitle">Select visual aesthetic and accent glow</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Theme Mode</label>
              <div class="theme-options-grid">
                
                <div class="theme-option-card ${settings.theme === 'dark' ? 'active' : ''}" onclick="window.settingsView.setTheme('dark')">
                  <div class="theme-preview-box" style="background: #090c14; border: 1px solid rgba(255,255,255,0.1);"></div>
                  <div style="font-size: var(--text-xs); font-weight: 700;">Deep Dark</div>
                </div>

                <div class="theme-option-card ${settings.theme === 'oled' ? 'active' : ''}" onclick="window.settingsView.setTheme('oled')">
                  <div class="theme-preview-box" style="background: #000000; border: 1px solid rgba(255,255,255,0.2);"></div>
                  <div style="font-size: var(--text-xs); font-weight: 700;">OLED Black</div>
                </div>

                <div class="theme-option-card ${settings.theme === 'light' ? 'active' : ''}" onclick="window.settingsView.setTheme('light')">
                  <div class="theme-preview-box" style="background: #f1f5f9; border: 1px solid rgba(0,0,0,0.1);"></div>
                  <div style="font-size: var(--text-xs); font-weight: 700; color: #0f172a;">Clean Light</div>
                </div>

              </div>
            </div>

            <div class="form-group" style="margin-top: var(--space-4);">
              <label class="form-label">Accent Luminous Glow</label>
              <div class="accent-colors-row">
                <div class="accent-color-circle ${settings.accent === 'indigo' ? 'active' : ''}" style="background: #6366f1;" onclick="window.settingsView.setAccent('indigo')" title="Neon Indigo"></div>
                <div class="accent-color-circle ${settings.accent === 'cyan' ? 'active' : ''}" style="background: #06b6d4;" onclick="window.settingsView.setAccent('cyan')" title="Cyber Cyan"></div>
                <div class="accent-color-circle ${settings.accent === 'emerald' ? 'active' : ''}" style="background: #10b981;" onclick="window.settingsView.setAccent('emerald')" title="Emerald Green"></div>
                <div class="accent-color-circle ${settings.accent === 'rose' ? 'active' : ''}" style="background: #f43f5e;" onclick="window.settingsView.setAccent('rose')" title="Rose Quartz"></div>
                <div class="accent-color-circle ${settings.accent === 'amber' ? 'active' : ''}" style="background: #f59e0b;" onclick="window.settingsView.setAccent('amber')" title="Solar Amber"></div>
              </div>
            </div>
          </div>

          <!-- Card 2: Student Profile -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Student Profile</h3>
                <div class="card-subtitle">Personal info and daily study targets</div>
              </div>
            </div>

            <form onsubmit="event.preventDefault(); window.settingsView.saveProfile(this);">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" name="name" class="input-field" value="${profile.name}" required/>
              </div>

              <div class="form-group">
                <label class="form-label">Major / Field of Study</label>
                <input type="text" name="major" class="input-field" value="${profile.major}" required/>
              </div>

              <div class="form-group">
                <label class="form-label">Daily Study Target (Hours)</label>
                <input type="number" name="dailyGoalHours" min="1" max="16" step="0.5" class="input-field" value="${profile.dailyGoalHours}" required/>
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top: var(--space-2);">Save Profile</button>
            </form>
          </div>

          <!-- Card 3: Pomodoro Timer Settings -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Focus Timer Preferences</h3>
                <div class="card-subtitle">Default session and break durations</div>
              </div>
            </div>

            <form onsubmit="event.preventDefault(); window.settingsView.saveTimerSettings(this);">
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3);">
                <div class="form-group">
                  <label class="form-label">Focus (Min)</label>
                  <input type="number" name="pomodoroTime" min="5" max="120" class="input-field" value="${settings.pomodoroTime || 25}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Short (Min)</label>
                  <input type="number" name="shortBreakTime" min="1" max="30" class="input-field" value="${settings.shortBreakTime || 5}"/>
                </div>
                <div class="form-group">
                  <label class="form-label">Long (Min)</label>
                  <input type="number" name="longBreakTime" min="5" max="60" class="input-field" value="${settings.longBreakTime || 15}"/>
                </div>
              </div>

              <button type="submit" class="btn btn-secondary" style="margin-top: var(--space-2);">Update Durations</button>
            </form>
          </div>

          <!-- Card 4: Data Management & Backup -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Data Storage & Backup</h3>
                <div class="card-subtitle">Manage browser localStorage and backups</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <p style="font-size: var(--text-xs); color: var(--text-secondary);">
                All tasks, focus logs, and notes are securely persisted in your browser's localStorage.
              </p>

              <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
                <button class="btn btn-secondary btn-sm" onclick="window.settingsView.exportBackup()">
                  💾 Export JSON Backup
                </button>
                <button class="btn btn-secondary btn-sm" onclick="document.getElementById('import-file-input').click()">
                  📥 Import JSON
                </button>
                <input type="file" id="import-file-input" accept=".json" style="display: none;" onchange="window.settingsView.importBackup(event)"/>
              </div>

              <div style="padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); margin-top: var(--space-2);">
                <button class="btn btn-ghost btn-sm" style="color: var(--color-danger);" onclick="window.settingsView.resetSampleData()">
                  ⚠️ Reset to Sample Student Data
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    this.container.innerHTML = html;
  }

  saveProfile(form) {
    const name = form.name.value.trim();
    const major = form.major.value.trim();
    const dailyGoalHours = parseFloat(form.dailyGoalHours.value) || 4;

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST';

    window.AppStore.updateProfile({
      name,
      major,
      avatar: initials,
      dailyGoalHours
    });

    window.app.showToast('Profile updated successfully!', 'success');
  }

  saveTimerSettings(form) {
    const pomodoroTime = parseInt(form.pomodoroTime.value) || 25;
    const shortBreakTime = parseInt(form.shortBreakTime.value) || 5;
    const longBreakTime = parseInt(form.longBreakTime.value) || 15;

    window.AppStore.updateSettings({
      pomodoroTime,
      shortBreakTime,
      longBreakTime
    });

    window.app.showToast('Timer settings saved!', 'success');
  }

  exportBackup() {
    const jsonStr = window.AppStore.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_student_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.app.showToast('Backup downloaded!', 'success');
  }

  importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = window.AppStore.importDataJSON(e.target.result);
      if (success) {
        window.app.showToast('Data imported successfully!', 'success');
        this.render();
      } else {
        alert('Failed to import: invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  }

  resetSampleData() {
    if (confirm('Reset all tasks, notes, and study logs to initial sample data?')) {
      window.AppStore.resetToSampleData();
      window.app.showToast('Reset to default student data', 'info');
      this.render();
    }
  }
}

window.settingsView = new SettingsView();
