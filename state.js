/**
 * NEXUS STUDENT OS - STATE MANAGEMENT & STORAGE
 * Handles reactive state, localStorage persistence, and realistic initial sample data.
 */

const STORAGE_KEY = 'nexus_student_os_data_v1';

// Initial realistic default data for high-achieving student
const DEFAULT_STATE = {
  profile: {
    name: 'Alex Vance',
    major: 'Computer Science & Mathematics',
    avatar: 'AV',
    level: 4,
    xp: 2350,
    nextLevelXp: 3000,
    dailyGoalHours: 4, // 4 hours daily study goal
    streakDays: 6,
    lastActiveDate: new Date().toISOString().split('T')[0]
  },
  settings: {
    theme: 'dark', // 'dark' | 'oled' | 'light'
    accent: 'indigo', // 'indigo' | 'cyan' | 'emerald' | 'rose' | 'amber'
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    soundAlerts: true,
    ambientVolume: 0.5
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Complete Distributed Systems Lab 3: Raft Consensus',
      desc: 'Implement leader election and heartbeat ping RPC handlers with test suites.',
      subject: 'cs',
      priority: 'high',
      status: 'in_progress', // 'todo' | 'in_progress' | 'completed'
      dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], // Tomorrow
      estimatedMinutes: 90,
      subtasks: [
        { id: 'sub-1', title: 'Implement RequestVote RPC handler', done: true },
        { id: 'sub-2', title: 'Add heartbeat timers & election timeouts', done: true },
        { id: 'sub-3', title: 'Pass 2A unit tests with 0 race conditions', done: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'task-2',
      title: 'Multivariable Calculus: Stokes Theorem Problem Set',
      desc: 'Problems #14 to #29 from Chapter 16.8 (Surface integrals and curl).',
      subject: 'math',
      priority: 'high',
      status: 'todo',
      dueDate: new Date().toISOString().split('T')[0], // Today
      estimatedMinutes: 60,
      subtasks: [
        { id: 'sub-4', title: 'Review lecture notes on vector fields', done: false },
        { id: 'sub-5', title: 'Solve odd-numbered verification exercises', done: false }
      ],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'task-3',
      title: 'Neural Networks: Fine-tune Vision Transformer Demo',
      desc: 'Train patch classifier on CIFAR-100 dataset and plot loss curves.',
      subject: 'cs',
      priority: 'med',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      estimatedMinutes: 120,
      subtasks: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'task-4',
      title: 'Molecular Biology: Read CRISPR Gene Editing Paper',
      desc: 'Annotate methodology and prepare 3 discussion questions for Friday seminar.',
      subject: 'bio',
      priority: 'med',
      status: 'completed',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: 45,
      subtasks: [
        { id: 'sub-6', title: 'Highlight guide RNA delivery mechanisms', done: true },
        { id: 'sub-7', title: 'Write 1-paragraph summary', done: true }
      ],
      completedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'task-5',
      title: 'Physics II: Electromagnetic Induction Quiz Prep',
      desc: 'Review Faraday law, Lenz law, and self-inductance practice problems.',
      subject: 'phys',
      priority: 'low',
      status: 'completed',
      dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      estimatedMinutes: 50,
      subtasks: [],
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ],
  studySessions: [
    {
      id: 'sess-1',
      subject: 'cs',
      topic: 'Algorithms & Data Structures: Dynamic Programming',
      durationMinutes: 50,
      completed: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'sess-2',
      subject: 'math',
      topic: 'Linear Algebra: Eigenvalues & Diagonalization',
      durationMinutes: 45,
      completed: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'sess-3',
      subject: 'bio',
      topic: 'Genetics Seminar Preparation',
      durationMinutes: 30,
      completed: false,
      timestamp: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
      date: new Date().toISOString().split('T')[0]
    },
    {
      id: 'sess-4',
      subject: 'cs',
      topic: 'Compiler Design: AST Generation',
      durationMinutes: 60,
      completed: false,
      timestamp: new Date(Date.now() + 1000 * 60 * 360).toISOString(),
      date: new Date().toISOString().split('T')[0]
    }
  ],
  // Historical weekly study records (for analytics charts)
  history: [
    { day: 'Mon', hours: 3.8, date: '2026-08-25', tasksCompleted: 4 },
    { day: 'Tue', hours: 4.5, date: '2026-08-26', tasksCompleted: 5 },
    { day: 'Wed', hours: 5.2, date: '2026-08-27', tasksCompleted: 6 },
    { day: 'Thu', hours: 4.0, date: '2026-08-28', tasksCompleted: 3 },
    { day: 'Fri', hours: 3.5, date: '2026-08-29', tasksCompleted: 4 },
    { day: 'Sat', hours: 6.0, date: '2026-08-30', tasksCompleted: 7 },
    { day: 'Sun', hours: 2.8, date: '2026-08-31', tasksCompleted: 2 },
    { day: 'Mon (Today)', hours: 2.5, date: new Date().toISOString().split('T')[0], tasksCompleted: 2 }
  ],
  notes: [
    {
      id: 'note-1',
      title: '🚀 Big-O Complexity & Amortized Analysis Cheat Sheet',
      subject: 'cs',
      pinned: true,
      content: `# Big-O Complexity Summary\n\n### Common Time Complexities:\n- **O(1)**: Hash table lookup, array indexing\n- **O(log N)**: Binary search, balanced BST search\n- **O(N)**: Linear scan, single loop\n- **O(N log N)**: MergeSort, HeapSort, optimal comparison sorting\n- **O(N²)**: Nested loops, bubble sort\n\n### Master Theorem Formula:\n\`T(n) = a*T(n/b) + f(n)\`\n- Case 1: If f(n) = O(n^(log_b(a) - ε)), then T(n) = Θ(n^(log_b(a)))\n- Case 2: If f(n) = Θ(n^(log_b(a))), then T(n) = Θ(n^(log_b(a)) * log n)\n- Case 3: If f(n) = Ω(n^(log_b(a) + ε)), then T(n) = Θ(f(n))`,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    },
    {
      id: 'note-2',
      title: '⚡ Essential Calculus III Formulas: Vector Calculus',
      subject: 'math',
      pinned: false,
      content: `# Vector Calculus Formulas\n\n- **Gradient**: \`∇f = <∂f/∂x, ∂f/∂y, ∂f/∂z>\`\n- **Divergence**: \`div F = ∇ · F = ∂P/∂x + ∂Q/∂y + ∂R/∂z\`\n- **Curl**: \`curl F = ∇ × F = <∂R/∂y - ∂Q/∂z, ∂P/∂z - ∂R/∂x, ∂Q/∂x - ∂P/∂y>\`\n\n### Green's Theorem:\n\`∮_C (P dx + Q dy) = ∬_D (∂Q/∂x - ∂P/∂y) dA\`\n\n### Stokes' Theorem:\n\`∮_C F · dr = ∬_S (curl F) · dS\``,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: 'note-3',
      title: '🧬 CRISPR-Cas9 Mechanism Overview',
      subject: 'bio',
      pinned: false,
      content: `# CRISPR-Cas9 Core Steps\n\n1. **Target Recognition**: sgRNA directs Cas9 enzyme to matching 20-nucleotide sequence adjacent to **PAM** motif (5'-NGG-3').\n2. **Double-Stranded Cleavage**: RuvC and HNH nuclease domains cut both strands ~3 bp upstream of PAM.\n3. **DNA Repair Mechanisms**:\n   - **NHEJ** (Non-Homologous End Joining): Error-prone, introduces indels for gene knockout.\n   - **HDR** (Homology-Directed Repair): High-fidelity with donor template for precise gene insertion.`,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    }
  ],
  deadlines: [
    {
      id: 'dl-1',
      title: 'Distributed Systems Midterm Exam',
      course: 'CS 452',
      date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      daysLeft: 4,
      urgent: false
    },
    {
      id: 'dl-2',
      title: 'Calculus III Problem Set 4 Submission',
      course: 'MATH 241',
      date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
      daysLeft: 1,
      urgent: true
    },
    {
      id: 'dl-3',
      title: 'AI Vision Project Milestone 2',
      course: 'CS 682',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      daysLeft: 7,
      urgent: false
    }
  ],
  quotes: [
    { text: "Consistency is what transforms average into excellence.", author: "Marcus Aurelius" },
    { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus is a muscle. The more you protect your attention, the stronger it becomes.", author: "Cal Newport" },
    { text: "Small daily disciplines repeated with consistency lead to monumental achievements.", author: "Robin Sharma" },
    { text: "You don't have to be extreme, just consistent.", author: "James Clear" }
  ]
};

class StateManager {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
    this.ensureDateIntegrity();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse state from localStorage, initializing defaults:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifySubscribers();
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  ensureDateIntegrity() {
    const today = new Date().toISOString().split('T')[0];
    if (this.state.profile.lastActiveDate !== today) {
      // New day detected: calculate streak
      const lastDate = new Date(this.state.profile.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.state.profile.streakDays += 1;
      } else if (diffDays > 1) {
        this.state.profile.streakDays = 1; // streak reset
      }
      this.state.profile.lastActiveDate = today;
      this.saveState();
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.state);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    });
  }

  getState() {
    return this.state;
  }

  // ==========================================
  // XP & GAMIFICATION
  // ==========================================
  addXP(amount) {
    this.state.profile.xp += amount;
    while (this.state.profile.xp >= this.state.profile.nextLevelXp) {
      this.state.profile.level += 1;
      this.state.profile.nextLevelXp = Math.round(this.state.profile.nextLevelXp * 1.35);
    }
    this.saveState();
  }

  // ==========================================
  // TASK ACTIONS
  // ==========================================
  addTask(taskData) {
    const newTask = {
      id: 'task-' + Date.now(),
      title: taskData.title.trim(),
      desc: taskData.desc ? taskData.desc.trim() : '',
      subject: taskData.subject || 'other',
      priority: taskData.priority || 'med',
      status: taskData.status || 'todo',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      estimatedMinutes: parseInt(taskData.estimatedMinutes) || 30,
      subtasks: taskData.subtasks || [],
      createdAt: new Date().toISOString()
    };
    this.state.tasks.unshift(newTask);
    this.addXP(20);
    this.saveState();
    return newTask;
  }

  updateTask(taskId, updates) {
    const taskIndex = this.state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      this.state.tasks[taskIndex] = { ...this.state.tasks[taskIndex], ...updates };
      this.saveState();
      return this.state.tasks[taskIndex];
    }
    return null;
  }

  toggleTaskStatus(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task) {
      const isNowCompleted = task.status !== 'completed';
      task.status = isNowCompleted ? 'completed' : 'todo';
      if (isNowCompleted) {
        task.completedAt = new Date().toISOString();
        this.addXP(50);
        // Mark all subtasks done if any
        if (task.subtasks) {
          task.subtasks.forEach(st => st.done = true);
        }
      } else {
        delete task.completedAt;
      }
      this.saveState();
      return task;
    }
    return null;
  }

  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.saveState();
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (task && task.subtasks) {
      const subtask = task.subtasks.find(st => st.id === subtaskId);
      if (subtask) {
        subtask.done = !subtask.done;
        // Check if all subtasks are done
        const allDone = task.subtasks.every(st => st.done);
        if (allDone && task.status !== 'completed') {
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          this.addXP(40);
        }
        this.saveState();
      }
    }
  }

  // ==========================================
  // STUDY SESSION ACTIONS
  // ==========================================
  addStudySession(sessionData) {
    const newSession = {
      id: 'sess-' + Date.now(),
      subject: sessionData.subject || 'cs',
      topic: sessionData.topic.trim(),
      durationMinutes: parseInt(sessionData.durationMinutes) || 25,
      completed: sessionData.completed || false,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };
    this.state.studySessions.unshift(newSession);
    this.saveState();
    return newSession;
  }

  toggleSessionCompleted(sessionId) {
    const session = this.state.studySessions.find(s => s.id === sessionId);
    if (session) {
      session.completed = !session.completed;
      if (session.completed) {
        this.addXP(session.durationMinutes * 2);
        // Record into history
        this.recordStudyHistory(session.durationMinutes);
      }
      this.saveState();
      return session;
    }
    return null;
  }

  recordStudyHistory(minutes) {
    const today = new Date().toISOString().split('T')[0];
    const hours = Number((minutes / 60).toFixed(1));
    const todayRecord = this.state.history.find(h => h.date === today);
    if (todayRecord) {
      todayRecord.hours = Number((todayRecord.hours + hours).toFixed(1));
    } else {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = days[new Date().getDay()];
      this.state.history.push({
        day: dayName + ' (Today)',
        hours: hours,
        date: today,
        tasksCompleted: 1
      });
    }
    this.saveState();
  }

  deleteStudySession(sessionId) {
    this.state.studySessions = this.state.studySessions.filter(s => s.id !== sessionId);
    this.saveState();
  }

  // ==========================================
  // NOTE ACTIONS
  // ==========================================
  addNote(noteData) {
    const newNote = {
      id: 'note-' + Date.now(),
      title: noteData.title.trim() || 'Untitled Note',
      subject: noteData.subject || 'other',
      pinned: !!noteData.pinned,
      content: noteData.content || '',
      updatedAt: new Date().toISOString()
    };
    this.state.notes.unshift(newNote);
    this.saveState();
    return newNote;
  }

  updateNote(noteId, updates) {
    const noteIndex = this.state.notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      this.state.notes[noteIndex] = {
        ...this.state.notes[noteIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveState();
      return this.state.notes[noteIndex];
    }
    return null;
  }

  deleteNote(noteId) {
    this.state.notes = this.state.notes.filter(n => n.id !== noteId);
    this.saveState();
  }

  // ==========================================
  // PROFILE & SETTINGS
  // ==========================================
  updateProfile(profileData) {
    this.state.profile = { ...this.state.profile, ...profileData };
    this.saveState();
  }

  updateSettings(settingsData) {
    this.state.settings = { ...this.state.settings, ...settingsData };
    this.saveState();
  }

  // ==========================================
  // BACKUP & RESET
  // ==========================================
  resetToSampleData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  exportDataJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  importDataJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile && parsed.tasks && parsed.settings) {
        this.state = parsed;
        this.saveState();
        return true;
      }
    } catch (e) {
      console.error('Import failed: invalid format', e);
    }
    return false;
  }
}

// Instantiate global state store
window.AppStore = new StateManager();
