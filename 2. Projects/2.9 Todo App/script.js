/*
  PROJECT 2.9 — TODO APP — script.js
  ═════════════════════════════════════
  Lecture Notes: 11. JavaScript Advanced


  ══════════════════════════════════════════════════════════
  STEP 1 — DATA MODEL
  ══════════════════════════════════════════════════════════
  Your todos are stored as an array of objects. Each todo is:
    {
      id:        Date.now().toString(),  // unique ID
      text:      'Buy groceries',        // the todo text
      completed: false                   // is it done?
    }

  Load from localStorage on startup. If nothing is stored,
  start with an empty array:
    let todos = JSON.parse(localStorage.getItem('todos')) ?? [];

  Also track which filter is active:
    let activeFilter = 'all';  // 'all' | 'active' | 'completed'


  ══════════════════════════════════════════════════════════
  STEP 2 — saveTodos() HELPER
  ══════════════════════════════════════════════════════════
  After every change to the todos array, save it to localStorage:
    function saveTodos() {
      localStorage.setItem('todos', JSON.stringify(todos));
    }

  Call this in every function that modifies todos.


  ══════════════════════════════════════════════════════════
  STEP 3 — getFilteredTodos() HELPER
  ══════════════════════════════════════════════════════════
  Returns the subset of todos that matches the active filter:
    function getFilteredTodos() {
      if (activeFilter === 'active')    return todos.filter(t => !t.completed);
      if (activeFilter === 'completed') return todos.filter(t => t.completed);
      return todos;  // 'all'
    }


  ══════════════════════════════════════════════════════════
  STEP 4 — render() FUNCTION
  ══════════════════════════════════════════════════════════
  This function re-draws the entire list from the todos array.
  Call render() any time the data changes.

  function render() {
    const filtered = getFilteredTodos();
    const listEl   = document.getElementById('todo-list');
    const countEl  = document.getElementById('todo-count');
    const emptyEl  = document.getElementById('empty-message');
    const clearBtn = document.getElementById('clear-completed');

    // Clear the list
    listEl.innerHTML = '';

    // Show/hide empty state
    emptyEl.hidden = filtered.length > 0;

    // Update count (active todos only)
    const activeCount = todos.filter(t => !t.completed).length;
    countEl.textContent = `${activeCount} left`;

    // Show/hide "clear completed" button
    clearBtn.hidden = !todos.some(t => t.completed);

    // Render each todo
    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.dataset.id = todo.id;

      li.innerHTML = `
        <button class="toggle-btn" aria-label="${todo.completed ? 'Mark as active' : 'Mark as complete'}">
          ${todo.completed ? '✓' : ''}
        </button>
        <span class="todo-text">${todo.text}</span>
        <button class="delete-btn" aria-label="Delete todo">×</button>
      `;

      listEl.appendChild(li);
    });
  }


  ══════════════════════════════════════════════════════════
  STEP 5 — ADD A TODO
  ══════════════════════════════════════════════════════════
  Listen for the form submit:
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('new-todo-input');
      const text = input.value.trim();
      if (!text) return;

      todos.push({
        id:        Date.now().toString(),
        text:      text,
        completed: false
      });

      saveTodos();
      render();
      input.value = '';
      input.focus();
    });


  ══════════════════════════════════════════════════════════
  STEP 6 — TOGGLE AND DELETE (event delegation)
  ══════════════════════════════════════════════════════════
  Use event delegation on the list — one listener handles all
  toggle and delete clicks:
    document.getElementById('todo-list').addEventListener('click', (e) => {
      const li = e.target.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.closest('.toggle-btn')) {
        // Find the todo and flip its completed state
        const todo = todos.find(t => t.id === id);
        todo.completed = !todo.completed;
        saveTodos();
        render();
      }

      if (e.target.closest('.delete-btn')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        render();
      }
    });


  ══════════════════════════════════════════════════════════
  STEP 7 — FILTER BUTTONS
  ══════════════════════════════════════════════════════════
  Listen on the filter bar container (delegation again):
    document.querySelector('.filter-bar').addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      activeFilter = btn.dataset.filter;

      // Update active class on buttons
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      render();
    });


  ══════════════════════════════════════════════════════════
  STEP 8 — CLEAR COMPLETED
  ══════════════════════════════════════════════════════════
    document.getElementById('clear-completed').addEventListener('click', () => {
      todos = todos.filter(t => !t.completed);
      saveTodos();
      render();
    });


  ══════════════════════════════════════════════════════════
  STEP 9 — INITIALISE
  ══════════════════════════════════════════════════════════
  At the very bottom, call render() once to draw the initial state:
    render();

  This will show any todos that were saved from a previous session.
*/
