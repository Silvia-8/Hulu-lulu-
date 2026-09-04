/**
 * NEXUS STUDENT OS - NOTES VIEW CONTROLLER
 * Markdown notes organizer, real-time preview, tagging, pinning, and auto-save.
 */

class NotesView {
  constructor() {
    this.container = document.getElementById('view-notes');
    this.selectedNoteId = null;
    this.searchQuery = '';
    this.subjectFilter = 'all';
    this.previewMode = false; // false = edit, true = preview
  }

  init() {
    window.AppStore.subscribe(() => {
      if (this.container && this.container.classList.contains('active')) {
        this.render();
      }
    });
  }

  selectNote(noteId) {
    this.selectedNoteId = noteId;
    this.render();
  }

  createNewNote() {
    const newNote = window.AppStore.addNote({
      title: 'New Study Note',
      subject: 'cs',
      content: '# New Study Note\n\nStart typing notes, formulas, or summaries here...\n\n- Key Point 1\n- Key Point 2\n\n```python\n# Code snippet\nprint("Hello, Study World!")\n```'
    });
    this.selectedNoteId = newNote.id;
    this.render();
  }

  togglePreview() {
    this.previewMode = !this.previewMode;
    this.render();
  }

  parseMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') // escape HTML
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 12px; margin: 8px 0; color: var(--text-secondary);">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/gim, '<pre style="background: var(--bg-input); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.85rem; overflow-x: auto; margin: 10px 0;"><code>$1</code></pre>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>')
      .replace(/\n\n/gim, '<p></p>')
      .replace(/\n/gim, '<br/>');
    return html;
  }

  render() {
    if (!this.container) return;
    const { notes } = window.AppStore.getState();

    // Filter notes
    const filteredNotes = notes.filter(n => {
      const matchSearch = !this.searchQuery ||
        n.title.toLowerCase().includes(this.searchQuery) ||
        (n.content && n.content.toLowerCase().includes(this.searchQuery));
      const matchSubject = this.subjectFilter === 'all' || n.subject === this.subjectFilter;
      return matchSearch && matchSubject;
    });

    // Select first note if none selected
    if ((!this.selectedNoteId || !notes.find(n => n.id === this.selectedNoteId)) && filteredNotes.length > 0) {
      this.selectedNoteId = filteredNotes[0].id;
    }

    const activeNote = notes.find(n => n.id === this.selectedNoteId) || (filteredNotes.length > 0 ? filteredNotes[0] : null);

    let html = `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); height: 100%;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
          <div>
            <h2>Study Notes & Flashcards</h2>
            <p style="font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px;">
              Markdown cheat sheets, formulas, and course summaries
            </p>
          </div>
          <button class="btn btn-primary" onclick="window.notesView.createNewNote()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + New Note
          </button>
        </div>

        <div class="notes-layout">
          
          <!-- LEFT: Notes List Sidebar -->
          <div class="notes-sidebar">
            <div class="search-input-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="input-field" placeholder="Search notes..." value="${this.searchQuery}" oninput="window.notesView.searchQuery = this.value.toLowerCase(); window.notesView.render();"/>
            </div>

            <select class="select-field" style="font-size: var(--text-xs);" onchange="window.notesView.subjectFilter = this.value; window.notesView.render();">
              <option value="all" ${this.subjectFilter === 'all' ? 'selected' : ''}>All Subjects</option>
              <option value="cs" ${this.subjectFilter === 'cs' ? 'selected' : ''}>Computer Science</option>
              <option value="math" ${this.subjectFilter === 'math' ? 'selected' : ''}>Mathematics</option>
              <option value="bio" ${this.subjectFilter === 'bio' ? 'selected' : ''}>Biology</option>
              <option value="phys" ${this.subjectFilter === 'phys' ? 'selected' : ''}>Physics</option>
              <option value="lit" ${this.subjectFilter === 'lit' ? 'selected' : ''}>Literature</option>
              <option value="other" ${this.subjectFilter === 'other' ? 'selected' : ''}>Other</option>
            </select>

            <div style="display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2);">
              ${filteredNotes.length === 0 ? `
                <div class="empty-state" style="padding: 30px 10px;">
                  <p style="font-size: 0.8rem;">No notes found</p>
                </div>
              ` : filteredNotes.map(n => `
                <div class="note-item-card ${n.id === this.selectedNoteId ? 'active' : ''} ${n.pinned ? 'pinned' : ''}"
                     onclick="window.notesView.selectNote('${n.id}')">
                  <div class="note-item-title">${n.title}</div>
                  <div class="note-item-snippet">${(n.content || '').replace(/[#*`]/g, '').slice(0, 80)}...</div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
                    <span class="badge badge-${n.subject}">${n.subject}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">
                      ${new Date(n.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- RIGHT: Notes Editor / Preview Pane -->
          <div class="notes-editor-pane">
            ${activeNote ? `
              <div class="notes-editor-header">
                <input type="text" class="note-title-input" value="${activeNote.title}"
                       placeholder="Note Title..."
                       oninput="window.AppStore.updateNote('${activeNote.id}', { title: this.value })"/>

                <div class="notes-toolbar-actions">
                  <select class="select-field" style="width: auto; padding: 4px 24px 4px 8px; font-size: 0.75rem;"
                          onchange="window.AppStore.updateNote('${activeNote.id}', { subject: this.value })">
                    <option value="cs" ${activeNote.subject === 'cs' ? 'selected' : ''}>CS</option>
                    <option value="math" ${activeNote.subject === 'math' ? 'selected' : ''}>Math</option>
                    <option value="bio" ${activeNote.subject === 'bio' ? 'selected' : ''}>Bio</option>
                    <option value="phys" ${activeNote.subject === 'phys' ? 'selected' : ''}>Phys</option>
                    <option value="lit" ${activeNote.subject === 'lit' ? 'selected' : ''}>Lit</option>
                    <option value="other" ${activeNote.subject === 'other' ? 'selected' : ''}>Other</option>
                  </select>

                  <button class="btn btn-secondary btn-sm" onclick="window.notesView.togglePin('${activeNote.id}')" title="${activeNote.pinned ? 'Unpin note' : 'Pin note'}">
                    ${activeNote.pinned ? '📌 Pinned' : '📍 Pin'}
                  </button>

                  <button class="btn btn-secondary btn-sm" onclick="window.notesView.togglePreview()">
                    ${this.previewMode ? '✏️ Edit' : '👁️ Preview'}
                  </button>

                  <button class="icon-btn" style="color: var(--color-danger);" onclick="window.notesView.deleteNote('${activeNote.id}')" title="Delete Note">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              ${this.previewMode ? `
                <div class="note-preview-pane">
                  ${this.parseMarkdown(activeNote.content)}
                </div>
              ` : `
                <textarea class="note-body-textarea" placeholder="Write your notes using Markdown (supports # headings, - lists, \`\`\` code blocks)..."
                          oninput="window.AppStore.updateNote('${activeNote.id}', { content: this.value })">${activeNote.content || ''}</textarea>
              `}
            ` : `
              <div class="empty-state" style="margin: auto;">
                <h3>No note selected</h3>
                <p>Create a note or select one from the sidebar.</p>
                <button class="btn btn-primary" onclick="window.notesView.createNewNote()">+ Create Note</button>
              </div>
            `}
          </div>

        </div>

      </div>
    `;

    this.container.innerHTML = html;
  }

  togglePin(noteId) {
    const note = window.AppStore.getState().notes.find(n => n.id === noteId);
    if (note) {
      window.AppStore.updateNote(noteId, { pinned: !note.pinned });
      window.app.showToast(note.pinned ? 'Note pinned to top' : 'Note unpinned', 'info');
    }
  }

  deleteNote(noteId) {
    if (confirm('Delete this note?')) {
      window.AppStore.deleteNote(noteId);
      this.selectedNoteId = null;
      window.app.showToast('Note deleted', 'warning');
    }
  }
}

window.notesView = new NotesView();
