// script.js — Tic-Tac-Toe with optional Minimax AI
// Modes: "pvp" (2-player) or "ai" (player X vs computer O)
// X always starts. When in "ai" mode and X starts, computer plays O.
// Theme toggle functionality included

(function () {
  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
  }
  
  // Theme toggle event
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    
    // Add a little animation to the button
    themeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      themeToggle.style.transform = '';
    }, 300);
  });
  
  // Game variables
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const newBtn = document.getElementById('newBtn');
  const resetScoreBtn = document.getElementById('resetScoreBtn');
  const modeInputs = document.querySelectorAll('input[name="mode"]');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDEl = document.getElementById('scoreD');

  let board = Array(9).fill(null); // null, 'X', 'O'
  let current = 'X';
  let running = true;
  let mode = 'pvp';
  let difficulty = 'medium'; // easy, medium, hard
  let scores = { X: 0, O: 0, D: 0 };

  // Winning combinations
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  // Build board cells
  function buildBoard(){
    boardEl.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.setAttribute('role','gridcell');
      btn.setAttribute('data-index', String(i));
      btn.setAttribute('aria-label', `Cell ${i+1}`);
      btn.tabIndex = 0;
      btn.addEventListener('click', onCellClick);
      btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
      boardEl.appendChild(btn);
    }
    updateUI();
  }

  // Update UI (board, status)
  function updateUI(winningCombo){
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
      cell.textContent = board[i] ? board[i] : '';
      cell.classList.toggle('disabled', !running || board[i] !== null);
      if (winningCombo && winningCombo.includes(i)) cell.classList.add('winning'); else cell.classList.remove('winning');
    });

    const statusTextEl = statusEl.querySelector('.status-text');
    if (winningCombo) {
      const winner = board[winningCombo[0]];
      if (statusTextEl) {
        statusTextEl.textContent = `Winner: ${winner}! 🏆`;
      } else {
        statusEl.textContent = `Winner: ${winner}! 🏆`;
      }
    } else if (!board.includes(null)) {
      if (statusTextEl) {
        statusTextEl.textContent = "It's a draw! 🤝";
      } else {
        statusEl.textContent = "It's a draw! 🤝";
      }
    } else {
      if (statusTextEl) {
        statusTextEl.textContent = `${current}'s turn`;
      } else {
        statusEl.textContent = `${current}'s turn`;
      }
    }
  }

  // Handle cell click
  function onCellClick(e){
    const i = Number(e.currentTarget.getAttribute('data-index'));
    if (!running || board[i] !== null) return;

    makeMove(i, current);
    const result = checkGame();
    if (result) return handleResult(result);

    // switch turn
    current = current === 'X' ? 'O' : 'X';
    updateUI();

    // if vs AI and it's AI turn, let AI play (AI plays 'O')
    if (mode === 'ai' && current === 'O') {
      // small timeout to simulate thinking
      setTimeout(() => {
        let aiMove;
        
        // Choose AI strategy based on difficulty
        if (difficulty === 'easy') {
          aiMove = easyAI(board);
        } else if (difficulty === 'medium') {
          aiMove = mediumAI(board);
        } else {
          aiMove = bestMove(board, 'O'); // Hard mode - unbeatable
        }
        
        makeMove(aiMove, 'O');
        const result2 = checkGame();
        if (result2) return handleResult(result2);
        current = 'X';
        updateUI();
      }, 200);
    }
  }

  // Place a move
  function makeMove(index, player){
    board[index] = player;
  }

  // Check winner or draw - returns {winner, combo} or {draw:true} or null
  function checkGame(){
    for (const combo of wins) {
      const [a,b,c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        running = false;
        return { winner: board[a], combo };
      }
    }
    if (!board.includes(null)) {
      running = false;
      return { draw: true };
    }
    return null;
  }

  // Handle end result
  function handleResult(result){
    const statusTextEl = statusEl.querySelector('.status-text');
    if (result.draw) {
      scores.D += 1;
      scoreDEl.textContent = scores.D;
      updateUI();
      if (statusTextEl) {
        statusTextEl.textContent = "It's a draw! 🤝";
      } else {
        statusEl.textContent = "It's a draw! 🤝";
      }
    } else {
      const w = result.winner;
      scores[w] += 1;
      scoreXEl.textContent = scores.X;
      scoreOEl.textContent = scores.O;
      updateUI(result.combo);
      if (statusTextEl) {
        statusTextEl.textContent = `Winner: ${w}! 🏆`;
      } else {
        statusEl.textContent = `Winner: ${w}! 🏆`;
      }
    }
  }

  // Reset board but keep scores
  function newGame(){
    board = Array(9).fill(null);
    current = 'X';
    running = true;
    updateUI();
  }

  function resetScores(){
    scores = { X:0, O:0, D:0 };
    scoreXEl.textContent = '0';
    scoreOEl.textContent = '0';
    scoreDEl.textContent = '0';
  }

  // Easy AI - Makes random moves (beatable)
  function easyAI(currentBoard) {
    const avail = currentBoard.map((v,i) => v===null?i:null).filter(v => v!==null);
    return avail[Math.floor(Math.random() * avail.length)];
  }

  // Medium AI - Mix of random and smart moves (moderate challenge)
  function mediumAI(currentBoard) {
    const avail = currentBoard.map((v,i) => v===null?i:null).filter(v => v!==null);
    
    // 60% chance to make a smart move, 40% random
    if (Math.random() < 0.6) {
      // Check for winning move
      for (const i of avail) {
        const testBoard = currentBoard.slice();
        testBoard[i] = 'O';
        if (evaluateBoard(testBoard) === 10) return i;
      }
      
      // Block player's winning move
      for (const i of avail) {
        const testBoard = currentBoard.slice();
        testBoard[i] = 'X';
        if (evaluateBoard(testBoard) === -10) return i;
      }
      
      // Take center if available
      if (currentBoard[4] === null) return 4;
      
      // Take corners
      const corners = [0, 2, 6, 8].filter(i => currentBoard[i] === null);
      if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    }
    
    // Random move
    return avail[Math.floor(Math.random() * avail.length)];
  }

  // Minimax AI (unbeatable) — returns best index for player
  function bestMove(currentBoard, player) {
    // Terminal check
    const winner = evaluateBoard(currentBoard);
    if (winner !== null) return null; // game over

    // Available moves
    const avail = currentBoard.map((v,i) => v===null?i:null).filter(v => v!==null);

    let bestScore = (player === 'O') ? -Infinity : Infinity;
    let move = avail[0];

    for (const i of avail) {
      const boardCopy = currentBoard.slice();
      boardCopy[i] = player;
      const score = minimax(boardCopy, player === 'O' ? 'X' : 'O');
      if (player === 'O') { // maximizing
        if (score > bestScore) { bestScore = score; move = i; }
      } else { // minimizing
        if (score < bestScore) { bestScore = score; move = i; }
      }
    }
    return move;
  }

  // Evaluate board: return 10 if O win, -10 if X win, 0 draw or null if not terminal
  function evaluateBoard(b) {
    for (const combo of wins) {
      const [a,b1,c] = combo;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
        return b[a] === 'O' ? 10 : -10;
      }
    }
    if (!b.includes(null)) return 0;
    return null;
  }

  // Minimax returns score from perspective of O (computer)
  function minimax(b, player) {
    const evalRes = evaluateBoard(b);
    if (evalRes !== null) return evalRes;

    const avail = b.map((v,i) => v===null?i:null).filter(v => v!==null);
    if (player === 'O') {
      let best = -Infinity;
      for (const i of avail) {
        const copy = b.slice(); copy[i] = 'O';
        const score = minimax(copy, 'X');
        best = Math.max(best, score);
      }
      return best;
    } else {
      let best = Infinity;
      for (const i of avail) {
        const copy = b.slice(); copy[i] = 'X';
        const score = minimax(copy, 'O');
        best = Math.min(best, score);
      }
      return best;
    }
  }

  // Mode change
  function setMode(m) {
    mode = m;
    
    // Show/hide difficulty selector
    const difficultySelector = document.getElementById('difficultySelector');
    if (m === 'ai') {
      difficultySelector.style.display = 'block';
    } else {
      difficultySelector.style.display = 'none';
    }
    
    newGame();
  }
  
  // Difficulty change
  function setDifficulty(d) {
    difficulty = d;
    newGame();
  }

  // Initialize
  function init(){
    buildBoard();
    newGame();
    
    // Attach events
    newBtn.addEventListener('click', () => { newGame(); });
    resetScoreBtn.addEventListener('click', () => { resetScores(); });
    
    modeInputs.forEach(i => i.addEventListener('change', (e) => {
      setMode(e.target.value);
    }));
    
    // Difficulty selector events
    const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
    difficultyInputs.forEach(i => i.addEventListener('change', (e) => {
      setDifficulty(e.target.value);
    }));
    
    // Expose quick debugging (optional)
    window.ttt = { board, newGame };
  }

  init();

})();
