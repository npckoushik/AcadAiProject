// Game state
let board = Array(9).fill(null)
let xIsNext = true
let gameOver = false
let winner = null
let winningLine = null
let showAlgorithm = false
let history = [Array(9).fill(null)]
let currentMove = 0
let minimaxData = null

// DOM elements
const squares = document.querySelectorAll(".square")
const statusElement = document.getElementById("status")
const resetButton = document.getElementById("reset-btn")
const algorithmToggleButton = document.getElementById("algorithm-toggle-btn")
const algorithmPanel = document.getElementById("algorithm-panel")
const historyButtonsContainer = document.getElementById("history-buttons")
const currentPlayerElement = document.getElementById("current-player")
const bestMoveElement = document.getElementById("best-move")
const bestScoreElement = document.getElementById("best-score")
const moveEvaluationsContainer = document.getElementById("move-evaluations")
const themeToggleButton = document.getElementById("theme-toggle-btn")
const moonIcon = document.getElementById("moon-icon")
const sunIcon = document.getElementById("sun-icon")
const eyeIcon = document.getElementById("eye-icon")
const eyeOffIcon = document.getElementById("eye-off-icon")
const resultModal = document.getElementById("result-modal")
const resultTitle = document.getElementById("result-title")
const resultMessage = document.getElementById("result-message")
const resultIcon = document.getElementById("result-icon")
const playAgainButton = document.getElementById("play-again-btn")

// Initialize the game
function initGame() {
  // Add event listeners
  squares.forEach((square) => {
    square.addEventListener("click", () => {
      const index = Number.parseInt(square.getAttribute("data-index"))
      handleSquareClick(index)
    })
  })

  resetButton.addEventListener("click", resetGame)
  algorithmToggleButton.addEventListener("click", toggleAlgorithm)
  themeToggleButton.addEventListener("click", toggleTheme)
  playAgainButton.addEventListener("click", () => {
    hideResultModal()
    resetGame()
  })

  // Initialize the board
  updateBoard()
  updateStatus()
  updateHistoryButtons()
}

// Handle square click
function handleSquareClick(index) {
  // Ignore click if game is over or square is already filled
  if (gameOver || board[index] !== null) {
    return
  }

  // Create a new board with the move
  const newBoard = [...board]
  newBoard[index] = xIsNext ? "X" : "O"

  // Run minimax for visualization
  minimaxData = runMinimax(newBoard, !xIsNext)

  // Update game state
  board = newBoard
  xIsNext = !xIsNext

  // Update history
  history = [...history.slice(0, currentMove + 1), [...newBoard]]
  currentMove = history.length - 1

  // Check for winner
  checkGameStatus()

  // Update UI
  updateBoard()
  updateStatus()
  updateHistoryButtons()
  updateAlgorithmPanel()

  // Animate the clicked square
  animateSquare(index)
}

// Check if the game is over
function checkGameStatus() {
  const result = calculateWinner(board)
  if (result) {
    winner = result.winner
    winningLine = result.line
    gameOver = true
    // Show result modal after a short delay
    setTimeout(showResultModal, 500)
  } else if (board.every((square) => square !== null)) {
    gameOver = true
    // Show result modal after a short delay
    setTimeout(showResultModal, 500)
  }
}

// Calculate winner
function calculateWinner(board, returnLine = true) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return returnLine ? { winner: board[a], line: lines[i] } : board[a]
    }
  }

  return null
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, alpha, beta) {
  // Check for terminal states
  const result = calculateWinner(board, false)

  if (result === "X") return -10 + depth
  if (result === "O") return 10 - depth
  if (board.every((square) => square !== null)) return 0

  // Maximum depth reached
  if (depth > 5) return 0

  if (isMaximizing) {
    let bestScore = Number.NEGATIVE_INFINITY

    // Try all possible moves
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        // Make the move
        const newBoard = [...board]
        newBoard[i] = "O"

        // Recursively evaluate the position
        const score = minimax(newBoard, depth + 1, false, alpha, beta)

        // Update best score
        bestScore = Math.max(score, bestScore)

        // Alpha-beta pruning
        alpha = Math.max(alpha, bestScore)
        if (beta <= alpha) break
      }
    }

    return bestScore
  } else {
    let bestScore = Number.POSITIVE_INFINITY

    // Try all possible moves
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        // Make the move
        const newBoard = [...board]
        newBoard[i] = "X"

        // Recursively evaluate the position
        const score = minimax(newBoard, depth + 1, true, alpha, beta)

        // Update best score
        bestScore = Math.min(score, bestScore)

        // Alpha-beta pruning
        beta = Math.min(beta, bestScore)
        if (beta <= alpha) break
      }
    }

    return bestScore
  }
}

// Run minimax for visualization
function runMinimax(board, isMaximizing) {
  const player = isMaximizing ? "O" : "X"

  const data = {
    evaluations: [],
    bestMove: -1,
    bestScore: isMaximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  }

  // Get available moves
  const availableMoves = board
    .map((square, index) => (square === null ? index : null))
    .filter((index) => index !== null)

  // Evaluate each move
  availableMoves.forEach((move) => {
    const newBoard = [...board]
    newBoard[move] = isMaximizing ? "O" : "X"

    const score = minimax(newBoard, 0, !isMaximizing, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)

    data.evaluations.push({
      move,
      score,
      board: [...newBoard],
    })

    // Update best move
    if (isMaximizing) {
      if (score > data.bestScore) {
        data.bestScore = score
        data.bestMove = move
      }
    } else {
      if (score < data.bestScore) {
        data.bestScore = score
        data.bestMove = move
      }
    }
  })

  return data
}

// Reset game
function resetGame() {
  hideResultModal()
  board = Array(9).fill(null)
  xIsNext = true
  gameOver = false
  winner = null
  winningLine = null
  minimaxData = null
  history = [Array(9).fill(null)]
  currentMove = 0

  updateBoard()
  updateStatus()
  updateHistoryButtons()
  updateAlgorithmPanel()
}

// Jump to move in history
function jumpTo(move) {
  currentMove = move
  board = [...history[move]]
  xIsNext = move % 2 === 0

  // Check game status
  const result = calculateWinner(board)
  if (result) {
    winner = result.winner
    winningLine = result.line
    gameOver = true
  } else if (board.every((square) => square !== null)) {
    gameOver = true
    winner = null
    winningLine = null
  } else {
    gameOver = false
    winner = null
    winningLine = null
  }

  // Run minimax for the current position
  if (move > 0) {
    minimaxData = runMinimax(board, !xIsNext)
  } else {
    minimaxData = null
  }

  updateBoard()
  updateStatus()
  updateHistoryButtons()
  updateAlgorithmPanel()
}

// Toggle algorithm visualization
function toggleAlgorithm() {
  showAlgorithm = !showAlgorithm

  if (showAlgorithm) {
    algorithmPanel.classList.remove("hidden")
    algorithmToggleButton.classList.add("active")
    eyeIcon.classList.add("hidden")
    eyeOffIcon.classList.remove("hidden")
    algorithmToggleButton.querySelector("svg + span").textContent = "Hide Algorithm"
  } else {
    algorithmPanel.classList.add("hidden")
    algorithmToggleButton.classList.remove("active")
    eyeIcon.classList.remove("hidden")
    eyeOffIcon.classList.add("hidden")
    algorithmToggleButton.querySelector("svg + span").textContent = "Show Algorithm"
  }
}

// Toggle theme
function toggleTheme() {
  const body = document.body
  const isDarkTheme = body.classList.contains("dark-theme")

  if (isDarkTheme) {
    body.classList.remove("dark-theme")
    moonIcon.classList.remove("hidden")
    sunIcon.classList.add("hidden")
  } else {
    body.classList.add("dark-theme")
    moonIcon.classList.add("hidden")
    sunIcon.classList.remove("hidden")
  }
}

// Show result modal
function showResultModal() {
  if (winner) {
    resultTitle.textContent = "Congratulations!"
    resultMessage.textContent = `Player ${winner} wins the game!`
    resultIcon.textContent = winner
    resultIcon.className = "result-icon " + winner.toLowerCase()
  } else {
    resultTitle.textContent = "Game Over"
    resultMessage.textContent = "The game ended in a draw!"
    resultIcon.textContent = "="
    resultIcon.className = "result-icon draw"
  }

  resultModal.classList.remove("hidden")
  setTimeout(() => {
    resultModal.classList.add("visible")
  }, 10)
}

// Hide result modal
function hideResultModal() {
  resultModal.classList.remove("visible")
  setTimeout(() => {
    resultModal.classList.add("hidden")
  }, 300)
}

// Update board UI
function updateBoard() {
  squares.forEach((square, index) => {
    // Clear previous classes
    square.className = "square"
    square.textContent = ""
    square.disabled = false

    // Set square content
    if (board[index]) {
      square.textContent = board[index]
      square.classList.add(board[index].toLowerCase())

      // Add winning line highlight
      if (winningLine && winningLine.includes(index)) {
        square.classList.add("winning")
      }
    }

    // Disable square if game is over or square is filled
    if (gameOver || board[index]) {
      square.disabled = true
    }
  })
}

// Update game status
function updateStatus() {
  if (gameOver) {
    if (winner) {
      statusElement.textContent = `Winner: ${winner}`
    } else {
      statusElement.textContent = "Game ended in a draw!"
    }
  } else {
    statusElement.textContent = `Next player: ${xIsNext ? "X" : "O"}`
  }
}

// Update history buttons
function updateHistoryButtons() {
  historyButtonsContainer.innerHTML = ""

  history.forEach((_, move) => {
    const button = document.createElement("button")
    button.className = "history-btn"
    if (move === currentMove) {
      button.classList.add("active")
    }

    button.textContent = move === 0 ? "Start" : `Move ${move}`
    button.addEventListener("click", () => jumpTo(move))

    historyButtonsContainer.appendChild(button)
  })
}

// Update algorithm panel
function updateAlgorithmPanel() {
  // Update current player
  currentPlayerElement.textContent = xIsNext ? "X" : "O"
  currentPlayerElement.className = xIsNext ? "x" : "o"

  // Update best move and score
  if (minimaxData) {
    bestMoveElement.textContent = minimaxData.bestMove !== -1 ? `Square ${minimaxData.bestMove}` : "None"
    bestScoreElement.textContent = minimaxData.bestScore

    // Add color class based on score
    bestScoreElement.className = ""
    if (minimaxData.bestScore > 0) {
      bestScoreElement.classList.add("positive")
    } else if (minimaxData.bestScore < 0) {
      bestScoreElement.classList.add("negative")
    } else {
      bestScoreElement.classList.add("neutral")
    }

    // Update move evaluations
    moveEvaluationsContainer.innerHTML = ""

    if (minimaxData.evaluations.length === 0) {
      const emptyMessage = document.createElement("p")
      emptyMessage.className = "empty-message"
      emptyMessage.textContent = "No available moves to evaluate."
      moveEvaluationsContainer.appendChild(emptyMessage)
    } else {
      minimaxData.evaluations.forEach((evaluation, index) => {
        const moveItem = document.createElement("div")
        moveItem.className = "move-item"

        // Create move header
        const moveHeader = document.createElement("div")
        moveHeader.className = "move-header"

        const moveHeaderText = document.createElement("div")
        moveHeaderText.className = "move-header-text"
        moveHeaderText.innerHTML = `<span>Move to Square ${evaluation.move}</span> <span class="${evaluation.score > 0 ? "positive" : evaluation.score < 0 ? "negative" : "neutral"}">Score: ${evaluation.score}</span>`

        const moveHeaderIcon = document.createElement("div")
        moveHeaderIcon.className = "move-header-icon"
        moveHeaderIcon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'

        moveHeader.appendChild(moveHeaderText)
        moveHeader.appendChild(moveHeaderIcon)

        // Create move content (initially hidden)
        const moveContent = document.createElement("div")
        moveContent.className = "move-content hidden"

        // Create mini board
        evaluation.board.forEach((square, i) => {
          const miniSquare = document.createElement("div")
          miniSquare.className = "mini-square"

          if (i === evaluation.move) {
            miniSquare.classList.add("highlight")
          }

          if (square) {
            miniSquare.textContent = square
            miniSquare.classList.add(square.toLowerCase())
          }

          moveContent.appendChild(miniSquare)
        })

        // Add toggle functionality
        moveHeader.addEventListener("click", () => {
          moveContent.classList.toggle("hidden")
          moveHeaderIcon.style.transform = moveContent.classList.contains("hidden") ? "" : "rotate(90deg)"
        })

        moveItem.appendChild(moveHeader)
        moveItem.appendChild(moveContent)
        moveEvaluationsContainer.appendChild(moveItem)
      })
    }
  } else {
    bestMoveElement.textContent = "None"
    bestScoreElement.textContent = "0"
    bestScoreElement.className = "neutral"

    moveEvaluationsContainer.innerHTML = '<p class="empty-message">Make a move to see the algorithm in action.</p>'
  }
}

// Animate square when clicked
function animateSquare(index) {
  const square = squares[index]
  square.classList.add("animated")

  setTimeout(() => {
    square.classList.remove("animated")
  }, 300)
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame)
