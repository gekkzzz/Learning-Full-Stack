/*
  PROJECT 2.2 — ROCK PAPER SCISSORS — script.js
  ================================================

  STEP 1 — Grab the elements you need from the DOM
  ─────────────────────────────────────────────────
  Use document.querySelector() or getElementById() to store references
  to the elements you'll update: the score displays, result area,
  choice buttons, game-over screen, and play-again button.

  Doing this at the top means you only search the DOM once, and the
  rest of your code just uses those variables.


  STEP 2 — Set up your game state variables
  ──────────────────────────────────────────
  You need to track:
    • playerScore     (starts at 0)
    • computerScore   (starts at 0)
    • roundNumber     (starts at 1)
    • WINNING_SCORE   (a constant — e.g. 5 — that ends the game)
    • gameOver        (a boolean that stops players clicking after game ends)


  STEP 3 — getComputerChoice()
  ─────────────────────────────
  Write a function that returns a random string: 'rock', 'paper',
  or 'scissors'.

  How to do it:
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];

  Math.random() gives you 0–0.999...
  Math.floor() rounds it down to 0, 1, or 2.
  Use that as an array index.


  STEP 4 — getResult(playerChoice, computerChoice)
  ─────────────────────────────────────────────────
  Write a function that takes both choices and returns who won.
  It should return 'player', 'computer', or 'tie'.

  Logic:
    • If both choices are the same → 'tie'
    • Rock beats Scissors
    • Scissors beats Paper
    • Paper beats Rock
    • Anything else → 'computer' wins

  You can use if/else if chains or a lookup like this:
    const winsAgainst = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
    if (winsAgainst[playerChoice] === computerChoice) return 'player';


  STEP 5 — toEmoji(choice)
  ─────────────────────────
  Write a small helper that converts a string to an emoji:
    'rock'     → '✊'
    'paper'    → '✋'
    'scissors' → '✌️'

  Use an object (a lookup map) rather than if/else for this.


  STEP 6 — playRound(playerChoice)
  ──────────────────────────────────
  This is the main function, called every time the player clicks a button.
  It should:
    1. Return early if gameOver is true (prevent clicks after game ends)
    2. Get the computer's choice via getComputerChoice()
    3. Get the result via getResult()
    4. Update the score: increment playerScore or computerScore
    5. Update the DOM:
         • Show both choices as emoji
         • Show the round result message ("You win this round!" etc.)
         • Update the score displays
         • Update the round counter
    6. Check if either score has reached WINNING_SCORE:
         • If so, set gameOver = true
         • Show the game-over screen with the winner and final score
         • Hide the choice buttons (or disable them)
    7. Increment roundNumber


  STEP 7 — Reset / Play Again
  ────────────────────────────
  Write a resetGame() function that:
    • Resets playerScore, computerScore, roundNumber to their starting values
    • Sets gameOver to false
    • Updates all the DOM elements back to their starting state
    • Shows the choice buttons again and hides the game-over screen

  Attach this to the "Play Again" button's click event.


  STEP 8 — Attach event listeners to the choice buttons
  ───────────────────────────────────────────────────────
  Each of the three choice buttons needs an event listener.
  When clicked, call playRound() with the appropriate choice string.

  If your buttons have data attributes (e.g. data-choice="rock"), you
  can use a single querySelectorAll loop:
    document.querySelectorAll('[data-choice]').forEach(btn => {
      btn.addEventListener('click', () => playRound(btn.dataset.choice));
    });
*/
