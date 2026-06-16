/*
  PROJECT 2.4 — CALCULATOR — script.js
  =======================================

  STEP 1 — State variables
  ─────────────────────────
  A calculator needs to remember:
    • currentOperand  — the number currently on the display (string)
    • previousOperand — the number from before the operator was pressed (string)
    • operator        — the selected operator: '+', '-', '*', '/' (or null)
    • shouldResetDisplay — a flag for a special case (see Step 4)

  Start with:
    let currentOperand  = '0';
    let previousOperand = '';
    let operator        = null;
    let shouldResetDisplay = false;


  STEP 2 — updateDisplay()
  ─────────────────────────
  Write a function that reads the state variables and updates the DOM.

  The current display just shows currentOperand.
  The previous display shows previousOperand + the operator symbol
    (e.g. "125 ×"), or empty if no operator has been selected yet.

  One gotcha: when displaying very long decimals (like 0.30000000004),
  you should parse the number and re-format it. parseFloat() + toPrecision()
  or toFixed() can help, but be careful not to cut off important digits.


  STEP 3 — inputDigit(digit)
  ───────────────────────────
  Called when a number button (0–9) is pressed.

  Cases to handle:
    a. If shouldResetDisplay is true, start fresh:
         currentOperand = digit;
         shouldResetDisplay = false;

    b. If currentOperand is '0' and digit is not '.':
         Replace the '0': currentOperand = digit;
         (otherwise you'd get "07")

    c. Otherwise:
         Append the digit: currentOperand += digit;

  After updating the state, call updateDisplay().


  STEP 4 — inputDecimal()
  ─────────────────────────
  Called when the '.' button is pressed.

  You can only have ONE decimal point. Check if currentOperand already
  contains '.'. If it does, return early (do nothing).

  Also, if shouldResetDisplay is true (we're starting a new number after
  an operator), start with '0.':
    currentOperand = '0.';
    shouldResetDisplay = false;

  Otherwise, append '.':
    currentOperand += '.';

  Call updateDisplay().


  STEP 5 — selectOperator(op)
  ────────────────────────────
  Called when +, -, ×, or ÷ is pressed.

  If previousOperand is not empty AND shouldResetDisplay is false, the
  user has typed a full number and then pressed another operator — this
  means they want to chain operations. Calculate the result first:
    calculate();

  Then:
    operator = op;
    previousOperand = currentOperand;
    shouldResetDisplay = true;
    // (the next digit press should start a new number)

  Call updateDisplay().


  STEP 6 — calculate()
  ──────────────────────
  Called when '=' is pressed (also called internally for chaining).

  Guard: if there's no operator or no previousOperand, do nothing.

  Convert both operands to numbers:
    const prev = parseFloat(previousOperand);
    const curr = parseFloat(currentOperand);

  Then switch on the operator:
    '+' → result = prev + curr
    '-' → result = prev - curr
    '*' → result = prev * curr
    '/' → result = prev / curr (handle division by zero — show 'Error')

  After calculating:
    currentOperand  = String(result);
    previousOperand = '';
    operator        = null;
    shouldResetDisplay = true;

  Call updateDisplay().


  STEP 7 — clear()
  ─────────────────
  Resets everything back to the initial state:
    currentOperand  = '0';
    previousOperand = '';
    operator        = null;
    shouldResetDisplay = false;

  The button label should also change:
    • When currentOperand is '0' and no previous operand: show "AC" (all clear)
    • When the user has typed something: show "C" (clear current entry only)
  The "C" version should only reset currentOperand to '0', not the whole
  calculation. Check the button's current label to know which to do.


  STEP 8 — negate()
  ──────────────────
  Flips the sign of the current number.
    currentOperand = String(parseFloat(currentOperand) * -1);
  Guard against trying to negate '0'.


  STEP 9 — percent()
  ────────────────────
  Converts the current number to a percentage (divides by 100):
    currentOperand = String(parseFloat(currentOperand) / 100);


  STEP 10 — Event delegation
  ───────────────────────────
  Instead of attaching listeners to every button, use ONE listener on
  the calculator container. Check the clicked element's data attributes:

  calculatorEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const digit  = btn.dataset.digit;

    if (action === 'digit')     inputDigit(digit);
    if (action === 'decimal')   inputDecimal();
    if (action === 'operator')  selectOperator(btn.dataset.operator);
    if (action === 'calculate') calculate();
    if (action === 'clear')     clear();
    if (action === 'negate')    negate();
    if (action === 'percent')   percent();
  });


  STRETCH — Keyboard support
  ───────────────────────────
  Add a keydown listener on the document:
    document.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
      if (e.key === '.')                 inputDecimal();
      if (e.key === '+')                 selectOperator('+');
      if (e.key === '-')                 selectOperator('-');
      if (e.key === '*')                 selectOperator('*');
      if (e.key === '/')                 { e.preventDefault(); selectOperator('/'); }
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Escape')            clear();
    });
*/
