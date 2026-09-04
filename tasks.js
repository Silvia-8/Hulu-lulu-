/**
 * NEXUS STUDENT OS - TASKS VIEW CONTROLLER
 * Full Task Manager with List & Kanban views, Search, Filters, Subtasks, and CRUD.
 */

class TasksView {
  constructor() {
    this.container = document.getElementById('view-tasks');
    this.currentViewMode = 'kanban'; // 'kanban' | 'list'
    this.searchQuery = '';
    this.subjectFilter = 'all';
    this.priorityFilter = 'all';
    this.statusFilter = 'all';
  }

  init() {
    window.AppStore.subscribe(() => {
      if (this.container && this.container.classList.contains('active')) {
        this.render();
      }
    });
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.render();
  }

  setSearchQuery(q) {
    this.searchQuery = q.toLowerCase();
    this.render();
  }

  setSubjectFilter(s) {
    this.subjectFilter = s;
    this.render();
  }

  setPriorityFilter(p) {
    this.priorityFilter = p;
    this.render();
  }

  render() {
    if (!this.container) return;
    const { tasks } = window.AppStore.getState();

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
      const matchSearch = !this.searchQuery || 
        task.title.toLowerCase().includes(this.searchQuery) ||
        (task.desc && task.desc.toLowerCase().includes(this.searchQuery));
      const matchSubject = this.subjectFilter === 'all' || task.subject === this.subjectFilter;
      const matchPriority = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      const matchStatus = this.statusFilter === 'all' || task.status === this.statusFilter;
      return matchSearch && matchSubject && matchPriority && matchStatus;
    });

    const todoTasks = filteredTasks.filter(t => t.status === 'todo');
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
    const completedTasks = filteredTasks.filter(t => t.status === 'completed');

    let html = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        
        <!-- Header & Top Controls -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
          <div>
            <h2 style="display: flex; align-items: center; gap: 8px;">
              <span>Tasks & Assignments</span>
              <span class="column-count">${filteredTasks.length}</span>
            </h2>
            <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
              Manage assignments, labs, problem sets and project milestones
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <div class="view-toggle-btns">
              <button class="view-toggle-btn ${this.currentViewMode === 'kanban' ? 'active' : ''}" onclick="window.tasksView.setViewMode('kanban')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
                Board
              </button>
              <button class="view-toggle-btn ${this.currentViewMode === 'list' ? 'active' : ''}" onclick="window.tasksView.setViewMode('list')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                List
              </button>
            </div>

            <button class="btn btn-primary" onclick="window.app.openModal('modal-add-task')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add New Task
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="tasks-toolbar" style="background: var(--bg-card); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-card);">
          <div class="tasks-search-filter">
            <div class="search-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="input-field" placeholder="Search tasks, descriptions..." value="${this.searchQuery}" oninput="window.tasksView.setSearchQuery(this.value)"/>
            </div>

            <select class="select-field" style="max-width: 170px;" onchange="window.tasksView.setSubjectFilter(this.value)">
              <option value="all" ${this.subjectFilter === 'all' ? 'selected' : ''}>All Subjects</option>
              <option value="cs" ${this.subjectFilter === 'cs' ? 'selected' : ''}>Computer Science</option>
              <option value="math" ${this.subjectFilter === 'math' ? 'selected' : ''}>Mathematics</option>
              <option value="bio" ${this.subjectFilter === 'bio' ? 'selected' : ''}>Biology</option>
              <option value="phys" ${this.subjectFilter === 'phys' ? 'selected' : ''}>Physics</option>
              <option value="lit" ${this.subjectFilter === 'lit' ? 'selected' : ''}>Literature</option>
              <option value="other" ${this.subjectFilter === 'other' ? 'selected' : ''}>Other</option>
            </select>

            <select class="select-field" style="max-width: 150px;" onchange="window.tasksView.setPriorityFilter(this.value)">
              <option value="all" ${this.priorityFilter === 'all' ? 'selected' : ''}>All Priorities</option>
              <option value="high" ${this.priorityFilter === 'high' ? 'selected' : ''}>High Priority</option>
              <option value="med" ${this.priorityFilter === 'med' ? 'selected' : ''}>Medium</option>
              <option value="low" ${this.priorityFilter === 'low' ? 'selected' : ''}>Low Priority</option>
            </select>
          </div>
        </div>

        <!-- Task Content Area -->
        ${this.currentViewMode === 'kanban' ? this.renderKanban(todoTasks, inProgressTasks, completedTasks) : this.renderList(filteredTasks)}

      </div>
    `;

    this.container.innerHTML = html;
  }

  renderKanban(todoTasks, inProgressTasks, completedTasks) {
    return `
      <div class="kanban-board">
        
        <!-- Column 1: TO DO -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-column-title">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted);"></span>
              To Do
            </span>
            <span class="column-count">${todoTasks.length}</span>
          </div>
          <div class="kanban-cards-list">
            ${todoTasks.length === 0 ? `<div class="empty-state" style="padding: 20px 0;"><p style="font-size: 0.8rem;">No tasks here</p></div>` : ''}
            ${todoTasks.map(t => this.renderTaskCard(t)).join('')}
          </div>
        </div>

        <!-- Column 2: IN PROGRESS -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-column-title">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-primary); box-shadow: 0 0 8px var(--accent-glow);"></span>
              In Progress
            </span>
            <span class="column-count">${inProgressTasks.length}</span>
          </div>
          <div class="kanban-cards-list">
            ${inProgressTasks.length === 0 ? `<div class="empty-state" style="padding: 20px 0;"><p style="font-size: 0.8rem;">No active tasks</p></div>` : ''}
            ${inProgressTasks.map(t => this.renderTaskCard(t)).join('')}
          </div>
        </div>

        <!-- Column 3: COMPLETED -->
        <div class="kanban-column">
          <div class="kanban-column-header">
            <span class="kanban-column-title">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 8px var(--color-success-glow);"></span>
              Completed
            </span>
            <span class="column-count">${completedTasks.length}</span>
          </div>
          <div class="kanban-cards-list">
            ${completedTasks.length === 0 ? `<div class="empty-state" style="padding: 20px 0;"><p style="font-size: 0.8rem;">No completed tasks</p></div>` : ''}
            ${completedTasks.map(t => this.renderTaskCard(t)).join('')}
          </div>
        </div>

      </div>
    `;
  }

  renderList(tasksList) {
    if (tasksList.length === 0) {
      return `
        <div class="card empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Try changing your filters or add a new task</p>
          <button class="btn btn-primary" onclick="window.app.openModal('modal-add-task')">+ Create Task</button>
        </div>
      `;
    }

    return `
      <div class="tasks-list-view">
        ${tasksList.map(t => this.renderTaskCard(t, true)).join('')}
      </div>
    `;
  }

  renderTaskCard(task, isListView = false) {
    const subtasksTotal = (task.subtasks || []).length;
    const subtasksDone = (task.subtasks || []).filter(st => st.done).length;
    const subtasksPercent = subtasksTotal > 0 ? Math.round((subtasksDone / subtasksTotal) * 100) : 0;
    const isCompleted = task.status === 'completed';

    return `
      <div class="task-card ${isCompleted ? 'completed' : ''}" style="${isCompleted ? 'opacity: 0.75;' : ''}" onclick="window.tasksView.openEditModal('${task.id}')">
        
        <div class="task-card-header">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <label class="checkbox-label" onclick="event.stopPropagation()">
              <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="window.tasksView.toggleTask('${task.id}')"/>
              <span class="custom-checkbox">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </label>
            <div>
              <div class="task-card-title" style="${isCompleted ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">
                ${task.title}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 4px;" onclick="event.stopPropagation()">
            <button class="icon-btn" style="width: 28px; height: 28px; border-radius: var(--radius-sm);" onclick="window.tasksView.openEditModal('${task.id}')" title="Edit task">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn" style="width: 28px; height: 28px; border-radius: var(--radius-sm); color: var(--color-danger);" onclick="window.tasksView.deleteTask('${task.id}')" title="Delete task">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        ${task.desc ? `
          <div class="task-card-desc">${task.desc}</div>
        ` : ''}

        ${subtasksTotal > 0 ? `
          <div class="subtasks-progress" onclick="event.stopPropagation()">
            <span>${subtasksDone}/${subtasksTotal} subtasks</span>
            <div class="subtasks-bar">
              <div class="subtasks-bar-fill" style="width: ${subtasksPercent}%;"></div>
            </div>
            <span>${subtasksPercent}%</span>
          </div>

          <!-- Interactive Subtask Checklist -->
          <div style="display: flex; flex-direction: column; gap: 4px; padding-left: 6px;" onclick="event.stopPropagation()">
            ${task.subtasks.map(st => `
              <label class="checkbox-label" style="font-size: 0.75rem; color: ${st.done ? 'var(--text-muted)' : 'var(--text-secondary)'};">
                <input type="checkbox" ${st.done ? 'checked' : ''} onchange="window.tasksView.toggleSubtask('${task.id}', '${st.id}')"/>
                <span class="custom-checkbox" style="width: 15px; height: 15px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span style="${st.done ? 'text-decoration: line-through;' : ''}">${st.title}</span>
              </label>
            `).join('')}
          </div>
        ` : ''}

        <div class="task-card-footer" onclick="event.stopPropagation()">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge badge-${task.subject}">${task.subject}</span>
            <span class="badge badge-priority-${task.priority}">${task.priority}</span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="task-due-date">
              📅 ${task.dueDate || 'No date'}
            </span>

            <!-- Status Shift Quick Buttons -->
            <select class="select-field" style="padding: 2px 18px 2px 6px; font-size: 0.72rem; border-radius: 4px; height: 26px;" onchange="window.tasksView.changeStatus('${task.id}', this.value)">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        </div>

      </div>
    `;
  }

  toggleTask(taskId) {
    window.AppAudio.playClick();
    window.AppStore.toggleTaskStatus(taskId);
  }

  toggleSubtask(taskId, subtaskId) {
    window.AppAudio.playClick();
    window.AppStore.toggleSubtask(taskId, subtaskId);
  }

  changeStatus(taskId, newStatus) {
    window.AppStore.updateTask(taskId, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    });
    if (newStatus === 'completed') {
      window.AppAudio.playChime();
      window.app.showToast('Task marked as completed! +50 XP', 'success');
    }
  }

  deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
      window.AppStore.deleteTask(taskId);
      window.app.showToast('Task removed', 'warning');
    }
  }

  openEditModal(taskId) {
    const task = window.AppStore.getState().tasks.find(t => t.id === taskId);
    if (!task) return;

    // Populate edit modal fields
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-desc').value = task.desc || '';
    document.getElementById('edit-task-subject').value = task.subject;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-status').value = task.status;
    document.getElementById('edit-task-due').value = task.dueDate || '';
    document.getElementById('edit-task-duration').value = task.estimatedMinutes || 30;

    // Render edit subtasks list
    const subtaskContainer = document.getElementById('edit-subtasks-list');
    if (subtaskContainer) {
      subtaskContainer.innerHTML = (task.subtasks || []).map((st, i) => `
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;" class="edit-subtask-row">
          <input type="text" class="input-field" value="${st.title}" data-sub-id="${st.id}" style="padding: 4px 8px; font-size: 0.8rem;"/>
          <button type="button" class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()" style="color: var(--color-danger);">✕</button>
        </div>
      `).join('');
    }

    window.app.openModal('modal-edit-task');
  }
}

window.tasksView = new TasksView();
