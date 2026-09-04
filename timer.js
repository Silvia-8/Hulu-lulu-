/**
 * NEXUS STUDENT OS - FOCUS POMODORO TIMER CONTROLLER
 * Interactive Pomodoro timer, Web Audio chimes, ambient noise mixer, fullscreen mode.
 */

class TimerView {
  constructor() {
    this.container = document.getElementById('view-timer');
    this.mode = 'pomodoro'; // 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom'
    this.timeLeft = 25 * 60;
    this.totalDuration = 25 * 60;
    this.isRunning = false;
    this.timerInterval = null;
    this.targetSubject = 'cs';
    this.targetTopic = 'Focused Deep Work';
    this.isFullscreen = false;
  }

  init() {
    window.AppStore.subscribe(() => {
      if (this.container && this.container.classList.contains('active')) {
        this.updateSubjectPills();
      }
    });
  }

  setTargetSubject(subject, topic, estimatedMinutes) {
    this.targetSubject = subject || 'cs';
    this.targetTopic = topic || 'Focused Deep Work';
    if (estimatedMinutes && this.mode === 'custom') {
      this.timeLeft = estimatedMinutes * 60;
      this.totalDuration = estimatedMinutes * 60;
    }
    this.render();
  }

  setMode(mode) {
    this.pause();
    this.mode = mode;
    const { settings } = window.AppStore.getState();

    if (mode === 'pomodoro') {
      this.totalDuration = (settings.pomodoroTime || 25) * 60;
    } else if (mode === 'shortBreak') {
      this.totalDuration = (settings.shortBreakTime || 5) * 60;
    } else if (mode === 'longBreak') {
      this.totalDuration = (settings.longBreakTime || 15) * 60;
    } else if (mode === 'custom') {
      const customMin = prompt('Enter custom timer duration in minutes:', '45');
      const val = parseInt(customMin);
      this.totalDuration = (val && val > 0 ? val : 25) * 60;
    }

    this.timeLeft = this.totalDuration;
    this.render();
  }

  toggleStartPause() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    this.updateControlsUI();
  }

  start() {
    if (this.isRunning) return;
    window.AppAudio.init(); // Initialize audio context on user gesture
    this.isRunning = true;

    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateTimeDisplay();
      } else {
        this.completeSession();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  reset() {
    this.pause();
    this.setMode(this.mode);
  }

  completeSession() {
    this.pause();
    window.AppAudio.playChime();

    const durationMinutes = Math.round(this.totalDuration / 60);
    if (this.mode === 'pomodoro' || this.mode === 'custom') {
      // Record completed study session
      window.AppStore.addStudySession({
        subject: this.targetSubject,
        topic: this.targetTopic,
        durationMinutes: durationMinutes,
        completed: true
      });
      window.AppStore.recordStudyHistory(durationMinutes);
      window.AppStore.addXP(durationMinutes * 3);
      window.app.showToast(`🎉 Focus session complete! Logged ${durationMinutes}m (+${durationMinutes * 3} XP)`, 'success');
    } else {
      window.app.showToast('☕ Break time finished! Ready to resume studying.', 'info');
    }

    this.timeLeft = this.totalDuration;
    this.render();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateTimeDisplay() {
    const timeStr = this.formatTime(this.timeLeft);
    const digitsElem = document.getElementById('timer-digits');
    const fsDigitsElem = document.getElementById('fullscreen-timer-digits');
    if (digitsElem) digitsElem.textContent = timeStr;
    if (fsDigitsElem) fsDigitsElem.textContent = timeStr;

    // Update document title for background tracking
    document.title = `${timeStr} • Nexus Study Timer`;

    // Update SVG dial stroke
    const radius = 135;
    const circumference = 2 * Math.PI * radius;
    const progress = this.timeLeft / this.totalDuration;
    const offset = circumference * (1 - progress);

    const dialElem = document.getElementById('timer-dial-svg-circle');
    if (dialElem) {
      dialElem.style.strokeDashoffset = offset;
    }
  }

  updateControlsUI() {
    const btn = document.getElementById('timer-play-btn');
    const fsBtn = document.getElementById('fullscreen-play-btn');
    const playIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
    const pauseIcon = `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

    if (btn) btn.innerHTML = this.isRunning ? pauseIcon : playIcon;
    if (fsBtn) fsBtn.innerHTML = this.isRunning ? pauseIcon : playIcon;
  }

  updateSubjectPills() {
    // optional live re-render of subject indicator
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    const fsOverlay = document.getElementById('fullscreen-timer-overlay');
    if (fsOverlay) {
      if (this.isFullscreen) {
        fsOverlay.classList.add('active');
        this.updateTimeDisplay();
        this.updateControlsUI();
      } else {
        fsOverlay.classList.remove('active');
      }
    }
  }

  render() {
    if (!this.container) return;
    const state = window.AppStore.getState();
    const timeStr = this.formatTime(this.timeLeft);

    // SVG parameters
    const radius = 135;
    const circumference = 2 * Math.PI * radius;
    const progress = this.timeLeft / this.totalDuration;
    const offset = circumference * (1 - progress);

    let html = `
      <div class="timer-container">
        
        <!-- Mode Tabs -->
        <div class="timer-mode-selector">
          <button class="timer-mode-btn ${this.mode === 'pomodoro' ? 'active' : ''}" onclick="window.timerView.setMode('pomodoro')">
            🎯 Pomodoro (25m)
          </button>
          <button class="timer-mode-btn ${this.mode === 'shortBreak' ? 'active' : ''}" onclick="window.timerView.setMode('shortBreak')">
            ☕ Short Break (5m)
          </button>
          <button class="timer-mode-btn ${this.mode === 'longBreak' ? 'active' : ''}" onclick="window.timerView.setMode('longBreak')">
            🌴 Long Break (15m)
          </button>
          <button class="timer-mode-btn ${this.mode === 'custom' ? 'active' : ''}" onclick="window.timerView.setMode('custom')">
            ⚙️ Custom
          </button>
        </div>

        <!-- Timer Circle Dial -->
        <div class="timer-dial-wrapper">
          <svg class="timer-dial-svg" viewBox="0 0 320 320">
            <circle class="timer-dial-track" stroke-width="12" r="${radius}" cx="160" cy="160"/>
            <circle id="timer-dial-svg-circle" class="timer-dial-progress" stroke-width="12" r="${radius}" cx="160" cy="160"
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"/>
          </svg>

          <div class="timer-dial-center">
            <span class="timer-digits" id="timer-digits">${timeStr}</span>
            <span class="timer-label">${this.mode === 'pomodoro' || this.mode === 'custom' ? 'Deep Focus' : 'Rest & Recharge'}</span>
            
            <div class="timer-subject-pill" onclick="window.timerView.promptChangeSubject()" style="cursor: pointer;" title="Click to change target subject/topic">
              <span class="badge badge-${this.targetSubject}">${this.targetSubject}</span>
              <span style="font-weight: 600; max-width: 140px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                ${this.targetTopic}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </div>
        </div>

        <!-- Controls Row -->
        <div class="timer-controls">
          <button class="icon-btn" onclick="window.timerView.reset()" title="Reset timer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
          </button>

          <button class="timer-play-btn" id="timer-play-btn" onclick="window.timerView.toggleStartPause()" title="Start / Pause">
            ${this.isRunning ? `
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ` : `
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            `}
          </button>

          <button class="icon-btn" onclick="window.timerView.completeSession()" title="Complete & Log Session">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>

          <button class="icon-btn" onclick="window.timerView.toggleFullscreen()" title="Fullscreen Focus Mode">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
          </button>
        </div>

        <!-- Ambient Sound Mixer Panel -->
        <div class="ambient-audio-panel">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <h4 style="font-size: var(--text-sm); font-weight: 700;">Focus Ambient Audio Generators</h4>
            </div>
            <span style="font-size: var(--text-xs); color: var(--text-muted);">Synthesized in real-time</span>
          </div>

          <div class="ambient-sounds-grid">
            
            <!-- Sound 1: Rain -->
            <div class="sound-card ${window.AppAudio.ambientState.rain ? 'active' : ''}" onclick="window.timerView.toggleAmbientSound('rain', this)">
              <div class="sound-card-icon">🌧️</div>
              <span style="font-size: var(--text-xs); font-weight: 700;">Gentle Rain</span>
              <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="${window.AppAudio.activeVolumes.rain}"
                     onclick="event.stopPropagation()" oninput="window.AppAudio.setVolume('rain', parseFloat(this.value))"/>
            </div>

            <!-- Sound 2: Binaural Alpha Beat -->
            <div class="sound-card ${window.AppAudio.ambientState.binaural ? 'active' : ''}" onclick="window.timerView.toggleAmbientSound('binaural', this)">
              <div class="sound-card-icon">🧠</div>
              <span style="font-size: var(--text-xs); font-weight: 700;">Alpha Waves (10Hz)</span>
              <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="${window.AppAudio.activeVolumes.binaural}"
                     onclick="event.stopPropagation()" oninput="window.AppAudio.setVolume('binaural', parseFloat(this.value))"/>
            </div>

            <!-- Sound 3: Pink Noise -->
            <div class="sound-card ${window.AppAudio.ambientState.pink ? 'active' : ''}" onclick="window.timerView.toggleAmbientSound('pink', this)">
              <div class="sound-card-icon">☕</div>
              <span style="font-size: var(--text-xs); font-weight: 700;">Warm Pink Noise</span>
              <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="${window.AppAudio.activeVolumes.pink}"
                     onclick="event.stopPropagation()" oninput="window.AppAudio.setVolume('pink', parseFloat(this.value))"/>
            </div>

            <!-- Sound 4: White Noise -->
            <div class="sound-card ${window.AppAudio.ambientState.white ? 'active' : ''}" onclick="window.timerView.toggleAmbientSound('white', this)">
              <div class="sound-card-icon">🌊</div>
              <span style="font-size: var(--text-xs); font-weight: 700;">White Stream</span>
              <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="${window.AppAudio.activeVolumes.white}"
                     onclick="event.stopPropagation()" oninput="window.AppAudio.setVolume('white', parseFloat(this.value))"/>
            </div>

          </div>
        </div>

      </div>

      <!-- Fullscreen Distraction-Free Overlay -->
      <div id="fullscreen-timer-overlay" class="fullscreen-focus-mode">
        <button class="icon-btn fullscreen-exit-btn" onclick="window.timerView.toggleFullscreen()" title="Exit Fullscreen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div style="font-size: 1.1rem; color: var(--accent-primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 20px;">
          ✦ DISTRACTION-FREE FOCUS ✦
        </div>

        <div style="font-family: var(--font-mono); font-size: 6.5rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.04em;" id="fullscreen-timer-digits">
          ${timeStr}
        </div>

        <div style="font-size: 1.25rem; color: var(--text-secondary); margin-top: 10px;">
          ${this.targetTopic} (${this.targetSubject.toUpperCase()})
        </div>

        <div style="display: flex; gap: 20px; margin-top: 40px;">
          <button class="timer-play-btn" id="fullscreen-play-btn" onclick="window.timerView.toggleStartPause()">
            ${this.isRunning ? `
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ` : `
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            `}
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  toggleAmbientSound(type, elem) {
    const isActive = window.AppAudio.toggleAmbient(type);
    if (elem) {
      if (isActive) elem.classList.add('active');
      else elem.classList.remove('active');
    }
  }

  promptChangeSubject() {
    const newTopic = prompt('Enter the study topic or task name:', this.targetTopic);
    if (newTopic && newTopic.trim()) {
      this.targetTopic = newTopic.trim();
      this.render();
    }
  }
}

window.timerView = new TimerView();
