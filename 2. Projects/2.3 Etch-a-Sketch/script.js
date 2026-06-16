/*
  PROJECT 2.3 — ETCH-A-SKETCH — script.js
  ==========================================

  STEP 1 — Get your DOM references
  ──────────────────────────────────
  Grab references to:
    • The grid container element
    • The clear button
    • The grid-size button
    • The mode buttons (classic, rainbow, darken)
    • The colour picker input


  STEP 2 — Set up state variables
  ─────────────────────────────────
  let currentMode = 'classic';   // which drawing mode is active
  let isDrawing   = false;       // is the mouse button currently held down?
  const GRID_SIZE = 16;          // default starting grid size


  STEP 3 — createGrid(size)
  ──────────────────────────
  This function builds the grid. It runs when the page loads and
  again whenever the user changes the grid size.

  What it should do:
    a. Clear existing cells:
         gridContainer.innerHTML = '';

    b. Calculate cell size in pixels:
         const cellSize = gridContainer.offsetWidth / size;
       (offsetWidth gives the actual pixel width of the container)

    c. Create size × size cells (that's size² cells total):
         Use a nested loop or a single loop running size * size times
         for (let i = 0; i < size * size; i++) { ... }

    d. For each cell:
         • Create a div: document.createElement('div')
         • Set its width and height: cell.style.width = cellSize + 'px'
         • Add a class: cell.classList.add('cell')
         • Add a 'mouseover' event listener that calls drawCell(cell)
         • Append it to the grid container

    e. After the loop, update the active size button if you have one.


  STEP 4 — drawCell(cell)
  ─────────────────────────
  Called when the mouse moves over a cell.

  Guard: if (!isDrawing) return;  — only draw when mouse is held down

  Then check currentMode:

  'classic' mode:
    cell.style.backgroundColor = colourPicker.value;
    // colourPicker.value gives the hex colour from the <input type="color">

  'rainbow' mode:
    const hue = Math.floor(Math.random() * 360);
    cell.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

  'darken' mode:
    // Each cell tracks its own darkness level in a data attribute
    let darkness = parseFloat(cell.dataset.darkness ?? 0);
    darkness = Math.min(darkness + 0.1, 1);  // cap at 1 (fully black)
    cell.dataset.darkness = darkness;
    cell.style.backgroundColor = `rgba(0, 0, 0, ${darkness})`;


  STEP 5 — isDrawing: track mouse button state
  ─────────────────────────────────────────────
  Add to the GRID CONTAINER (not the whole document for mousedown):
    gridContainer.addEventListener('mousedown', () => { isDrawing = true; });

  Add to the DOCUMENT for mouseup (in case the mouse is released
  outside the grid):
    document.addEventListener('mouseup', () => { isDrawing = false; });

  You also want to draw the cell on mousedown itself (not just mouseover),
  so clicking on a cell without moving the mouse still colours it:
    gridContainer.addEventListener('mousedown', (e) => {
      isDrawing = true;
      if (e.target.classList.contains('cell')) drawCell(e.target);
    });


  STEP 6 — Clear button
  ──────────────────────
  Loop through every cell and reset its background and darkness:
    document.querySelectorAll('.cell').forEach(cell => {
      cell.style.backgroundColor = '';
      cell.dataset.darkness = '0';
    });


  STEP 7 — Grid size button
  ──────────────────────────
  Show a prompt asking for a number:
    const input = window.prompt('Enter grid size (1 to 64):');

  Convert to a number: const size = parseInt(input);

  Validate:
    if (isNaN(size) || size < 1 || size > 64) {
      alert('Please enter a number between 1 and 64.');
      return;
    }

  Then call createGrid(size) with the valid number.


  STEP 8 — Mode switching
  ─────────────────────────
  Each mode button updates currentMode when clicked:
    classicBtn.addEventListener('click', () => {
      currentMode = 'classic';
      // update active button styles
    });

  To update which button looks "active", remove an 'active' class from
  all mode buttons and add it to the one that was just clicked:
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    clickedButton.classList.add('active');
    // Style .mode-btn.active in CSS


  STEP 9 — Initialise on load
  ─────────────────────────────
  At the bottom of the file, call createGrid with the default size:
    createGrid(GRID_SIZE);
*/
