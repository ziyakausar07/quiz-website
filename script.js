/**
 * QuizPulse — Modern Interactive Quiz Platform
 * State Management, Audio Synthesizer, Confetti Engine, and Interaction Logic
 */

// ============================================================================
// 1. Centralized Application State
// ============================================================================
const state = {
  allQuestions: [],        // Master dataset loaded from questions.json
  activeQuestions: [],     // Filtered / sliced questions for the current quiz run
  currentIndex: 0,         // 0-indexed current question
  score: 0,                // Current live score
  userAnswers: [],         // Records user answers: { questionId, question, selectedAnswer, correctAnswer, isCorrect, explanation }
  isAnswerSubmitted: false,// Locks answering to prevent duplicate submissions
  isQuizCompleted: false,  // Completion flag
  categoryFilter: 'all',   // Selected category
  questionCountLimit: 'all',// Question count selection
  soundEnabled: true,      // Sound effect toggle
  currentTheme: 'dark'     // 'dark' or 'light'
};

// Fallback questions in case fetch('questions.json') is opened via local file:// protocol
const FALLBACK_QUESTIONS = [
  {
    "id": 1,
    "question": "Which HTML5 semantic element is most appropriate for grouping self-contained content that could be distributed independently, such as a blog post or news story?",
    "options": ["<section>", "<article>", "<aside>", "<div>"],
    "correctAnswer": "<article>",
    "explanation": "The <article> element is intended for standalone, self-contained compositions (like blog posts, forum posts, or news articles) that could theoretically be reused or syndicated independently.",
    "category": "Web Development",
    "difficulty": "Easy"
  },
  {
    "id": 2,
    "question": "In JavaScript, what will the expression `typeof null` evaluate to?",
    "options": ["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""],
    "correctAnswer": "\"object\"",
    "explanation": "In JavaScript, `typeof null` returns 'object'. This is a historical quirk from the earliest version of JavaScript where type tags were used and 000 represented an object reference.",
    "category": "JavaScript",
    "difficulty": "Medium"
  },
  {
    "id": 3,
    "question": "Which CSS property is used to create a staggered, smooth layout shift when flex items wrap to the next line?",
    "options": ["align-content", "justify-items", "flex-basis", "order"],
    "correctAnswer": "align-content",
    "explanation": "`align-content` defines how the browser distributes space between and around content items along the cross-axis of a flex container when flex-wrap is enabled.",
    "category": "Web Development",
    "difficulty": "Medium"
  },
  {
    "id": 4,
    "question": "What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
    "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    "correctAnswer": "O(log n)",
    "explanation": "In a balanced Binary Search Tree (like an AVL or Red-Black tree), the height of the tree is O(log n), so search, insertion, and deletion operations take logarithmic time on average.",
    "category": "Computer Science",
    "difficulty": "Medium"
  },
  {
    "id": 5,
    "question": "Which JavaScript method creates a new array with all elements that pass the test implemented by the provided function?",
    "options": ["Array.prototype.map()", "Array.prototype.filter()", "Array.prototype.find()", "Array.prototype.reduce()"],
    "correctAnswer": "Array.prototype.filter()",
    "explanation": "The `filter()` method creates a shallow copy of a portion of a given array, filtered down to just the elements from the given array that pass the test implemented by the provided function.",
    "category": "JavaScript",
    "difficulty": "Easy"
  },
  {
    "id": 6,
    "question": "What does the HTTP 429 status code signify?",
    "options": ["Payment Required", "Request Timeout", "Too Many Requests", "Unavailable For Legal Reasons"],
    "correctAnswer": "Too Many Requests",
    "explanation": "HTTP status code 429 Too Many Requests indicates the user has sent too many requests in a given amount of time (rate limiting).",
    "category": "Computer Science",
    "difficulty": "Easy"
  },
  {
    "id": 7,
    "question": "Which CSS unit is relative to 1% of the viewport's smaller dimension (width or height)?",
    "options": ["vh", "vw", "vmin", "vmax"],
    "correctAnswer": "vmin",
    "explanation": "1vmin represents 1% of the minimum of viewport height and viewport width (whichever is smaller at the moment of rendering).",
    "category": "Web Development",
    "difficulty": "Easy"
  },
  {
    "id": 8,
    "question": "In the JavaScript Event Loop, which queue has the highest priority for execution after the current call stack clears?",
    "options": ["Macrotask Queue (Task Queue)", "Microtask Queue", "Animation Frame Queue", "Timer Queue"],
    "correctAnswer": "Microtask Queue",
    "explanation": "Microtasks (such as Promise callbacks, queueMicrotask, MutationObserver) are processed immediately after the current call stack finishes, before the next macrotask is processed.",
    "category": "JavaScript",
    "difficulty": "Hard"
  },
  {
    "id": 9,
    "question": "Which git command allows you to combine changes from a branch onto another by reapplying commits one by one on top of a new base tip?",
    "options": ["git merge", "git rebase", "git cherry-pick", "git reset"],
    "correctAnswer": "git rebase",
    "explanation": "`git rebase` reapplies commits from the current branch onto another branch, producing a cleaner, linear commit history without merge commits.",
    "category": "Computer Science",
    "difficulty": "Medium"
  },
  {
    "id": 10,
    "question": "What is the primary purpose of the `defer` attribute on a `<script>` tag?",
    "options": [
      "Executes the script asynchronously as soon as it is downloaded without blocking parsing.",
      "Downloads the script in parallel and executes it only after HTML document parsing is complete.",
      "Postpones downloading until the window.onload event triggers.",
      "Runs the script inside a Web Worker thread in the background."
    ],
    "correctAnswer": "Downloads the script in parallel and executes it only after HTML document parsing is complete.",
    "explanation": "`defer` tells the browser to download the script file in parallel while continuing HTML parsing, and guarantees execution in document order right after HTML parsing completes, before `DOMContentLoaded`.",
    "category": "Web Development",
    "difficulty": "Medium"
  },
  {
    "id": 11,
    "question": "Which cryptographic algorithm is asymmetric and widely used for public-key cryptography and digital signatures?",
    "options": ["AES-256", "RSA", "DES", "SHA-256"],
    "correctAnswer": "RSA",
    "explanation": "RSA (Rivest–Shamir–Adleman) is an asymmetric algorithm that uses a pair of keys (public and private). AES and DES are symmetric, while SHA-256 is a cryptographic hash function.",
    "category": "Computer Science",
    "difficulty": "Medium"
  },
  {
    "id": 12,
    "question": "What is the output of `[1, 2, 3] + [4, 5, 6]` in standard JavaScript?",
    "options": ["[1, 2, 3, 4, 5, 6]", "\"1,2,34,5,6\"", "NaN", "TypeError: cannot add arrays"],
    "correctAnswer": "\"1,2,34,5,6\"",
    "explanation": "The `+` operator converts both arrays to strings ('1,2,3' and '4,5,6') and concatenates them, resulting in the string '1,2,34,5,6'.",
    "category": "JavaScript",
    "difficulty": "Hard"
  },
  {
    "id": 13,
    "question": "In relational databases, which normal form (NF) ensures that all non-key attributes are fully functionally dependent on the entire primary key, eliminating partial dependencies?",
    "options": ["First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
    "correctAnswer": "Second Normal Form (2NF)",
    "explanation": "2NF requires the table to be in 1NF and eliminates partial dependencies, meaning every non-prime attribute must depend on the whole candidate key, not just a part of it.",
    "category": "Computer Science",
    "difficulty": "Hard"
  },
  {
    "id": 14,
    "question": "Which CSS pseudo-class matches an element only when it does NOT match a specified selector list?",
    "options": [":where()", ":is()", ":not()", ":has()"],
    "correctAnswer": ":not()",
    "explanation": "The `:not()` negation pseudo-class takes a selector list as an argument and represents elements that are not matched by the argument list.",
    "category": "Web Development",
    "difficulty": "Easy"
  },
  {
    "id": 15,
    "question": "What is the result of `0.1 + 0.2 === 0.3` in JavaScript?",
    "options": ["true", "false", "undefined", "TypeError"],
    "correctAnswer": "false",
    "explanation": "Due to IEEE 754 double-precision binary floating-point representation, 0.1 + 0.2 evaluates to 0.30000000000000004, which does not strictly equal 0.3.",
    "category": "JavaScript",
    "difficulty": "Easy"
  },
  {
    "id": 16,
    "question": "What is the purpose of the Content Security Policy (CSP) HTTP header?",
    "options": [
      "Encrypts data payloads sent across web sockets.",
      "Restricts the sources from which resources (scripts, styles, images) can be loaded to prevent XSS attacks.",
      "Forces browsers to only communicate over HTTPS.",
      "Enables cross-origin resource sharing for specific API origins."
    ],
    "correctAnswer": "Restricts the sources from which resources (scripts, styles, images) can be loaded to prevent XSS attacks.",
    "explanation": "Content Security Policy (CSP) helps detect and mitigate Cross-Site Scripting (XSS) and data injection attacks by restricting the origins from which scripts, images, and other assets can load.",
    "category": "Computer Science",
    "difficulty": "Medium"
  }
];

// ============================================================================
// 2. Web Audio API Sound Synthesizer (Zero External Dependencies)
// ============================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'correct') {
      // Cheerful ascending two-tone chime (F5 -> A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(698.46, now); // F5
      osc1.frequency.setValueAtTime(880.00, now + 0.1); // A5

      osc2.frequency.setValueAtTime(698.46, now);
      osc2.frequency.setValueAtTime(880.00, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);

    } else if (type === 'incorrect') {
      // Soft gentle buzzy drop (D#3 -> C3)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(155.56, now); // Eb3
      osc.frequency.exponentialRampToValueAtTime(110.0, now + 0.28); // A2

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);

    } else if (type === 'click') {
      // Subtle click pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

    } else if (type === 'fanfare') {
      // Triumphant 3-note arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + index * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// ============================================================================
// 3. Lightweight Canvas Confetti Engine
// ============================================================================
let confettiAnimationId = null;

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;

  const pieces = [];
  const numberOfPieces = 90;
  const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  for (let i = 0; i < numberOfPieces; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  let frameCount = 0;
  const maxFrames = 220;

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    pieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (frameCount < maxFrames) {
      confettiAnimationId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

// ============================================================================
// 4. DOM Elements Cache
// ============================================================================
const dom = {
  // Screens
  welcomeScreen: document.getElementById('welcome-screen'),
  quizScreen: document.getElementById('quiz-screen'),
  resultsScreen: document.getElementById('results-screen'),
  reviewScreen: document.getElementById('review-screen'),

  // Brand & Header controls
  brandLogo: document.getElementById('brand-logo'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundOnIcon: document.getElementById('sound-on-icon'),
  soundOffIcon: document.getElementById('sound-off-icon'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  moonIcon: document.getElementById('moon-icon'),
  sunIcon: document.getElementById('sun-icon'),

  // Welcome Screen Form
  categorySelect: document.getElementById('category-select'),
  questionCountSelect: document.getElementById('question-count-select'),
  startQuizBtn: document.getElementById('start-quiz-btn'),

  // Quiz Screen Elements
  categoryBadge: document.getElementById('category-badge'),
  difficultyBadge: document.getElementById('difficulty-badge'),
  liveScore: document.getElementById('live-score'),
  totalPossibleScore: document.getElementById('total-possible-score'),
  currentQuestionNum: document.getElementById('current-question-num'),
  totalQuestionsNum: document.getElementById('total-questions-num'),
  progressPercentage: document.getElementById('progress-percentage'),
  progressBar: document.getElementById('quiz-progress-bar'),
  progressFill: document.getElementById('progress-fill'),
  questionText: document.getElementById('question-text'),
  optionsContainer: document.getElementById('options-container'),
  
  // Feedback Panel
  feedbackPanel: document.getElementById('feedback-panel'),
  feedbackHeader: document.getElementById('feedback-header'),
  feedbackIconContainer: document.getElementById('feedback-icon-container'),
  feedbackStatusText: document.getElementById('feedback-status-text'),
  explanationText: document.getElementById('explanation-text'),
  nextQuestionBtn: document.getElementById('next-question-btn'),
  nextBtnText: document.getElementById('next-btn-text'),

  // Results Screen Elements
  performanceBadge: document.getElementById('performance-badge'),
  performanceMessage: document.getElementById('performance-message'),
  finalPercentage: document.getElementById('final-percentage'),
  finalScore: document.getElementById('final-score'),
  finalTotal: document.getElementById('final-total'),
  finalRatingTag: document.getElementById('final-rating-tag'),
  radialProgress: document.getElementById('radial-progress'),
  statTotalAttempted: document.getElementById('stat-total-attempted'),
  statCorrectCount: document.getElementById('stat-correct-count'),
  statIncorrectCount: document.getElementById('stat-incorrect-count'),
  reviewAnswersBtn: document.getElementById('review-answers-btn'),
  restartQuizBtn: document.getElementById('restart-quiz-btn'),

  // Review Screen Elements
  backToResultsBtn: document.getElementById('back-to-results-btn'),
  reviewRestartBtn: document.getElementById('review-restart-btn'),
  filterAllCount: document.getElementById('filter-all-count'),
  filterCorrectCount: document.getElementById('filter-correct-count'),
  filterIncorrectCount: document.getElementById('filter-incorrect-count'),
  reviewListContainer: document.getElementById('review-list-container'),
  filterTabs: document.querySelectorAll('.filter-tab')
};

// ============================================================================
// 5. Screen Navigation Utilities
// ============================================================================
function switchScreen(targetScreen) {
  const screens = [dom.welcomeScreen, dom.quizScreen, dom.resultsScreen, dom.reviewScreen];
  screens.forEach(screen => {
    if (screen) {
      screen.classList.remove('active');
    }
  });

  if (targetScreen) {
    targetScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ============================================================================
// 6. Dataset Loading (Fetch with Automatic Fallback)
// ============================================================================
async function loadQuestionBank() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      state.allQuestions = data;
    } else {
      state.allQuestions = FALLBACK_QUESTIONS;
    }
  } catch (error) {
    console.info('Using embedded fallback question bank (likely running via file:// protocol):', error.message);
    state.allQuestions = FALLBACK_QUESTIONS;
  }
}

// ============================================================================
// 7. Quiz Lifecycle & State Functions
// ============================================================================

/**
 * Starts a new quiz attempt with current filter preferences
 */
function startQuiz() {
  playSound('click');

  // Read setup options
  state.categoryFilter = dom.categorySelect.value;
  state.questionCountLimit = dom.questionCountSelect.value;

  // Filter questions based on category
  let pool = [...state.allQuestions];
  if (state.categoryFilter !== 'all') {
    pool = pool.filter(q => q.category === state.categoryFilter);
  }

  // Shuffle questions randomly
  pool.sort(() => Math.random() - 0.5);

  // Apply question count limit
  if (state.questionCountLimit !== 'all') {
    const limit = parseInt(state.questionCountLimit, 10);
    pool = pool.slice(0, Math.min(limit, pool.length));
  }

  // Fallback safety if pool is empty
  if (pool.length === 0) {
    pool = [...state.allQuestions].slice(0, 10);
  }

  // Reset quiz state
  state.activeQuestions = pool;
  state.currentIndex = 0;
  state.score = 0;
  state.userAnswers = [];
  state.isAnswerSubmitted = false;
  state.isQuizCompleted = false;

  // Render initial question and switch screen
  dom.totalPossibleScore.textContent = pool.length;
  dom.totalQuestionsNum.textContent = pool.length;
  dom.liveScore.textContent = '0';

  renderQuestion();
  switchScreen(dom.quizScreen);
}

/**
 * Renders the active question and options
 */
function renderQuestion() {
  const currentQ = state.activeQuestions[state.currentIndex];
  if (!currentQ) return;

  state.isAnswerSubmitted = false;

  // 1. Meta Badges
  dom.categoryBadge.textContent = currentQ.category || 'General';
  dom.difficultyBadge.textContent = currentQ.difficulty || 'Medium';
  dom.difficultyBadge.className = 'badge badge-difficulty';
  if (currentQ.difficulty) {
    dom.difficultyBadge.classList.add(currentQ.difficulty.toLowerCase());
  }

  // 2. Question Counter & Progress
  const questionNumber = state.currentIndex + 1;
  const totalQuestions = state.activeQuestions.length;
  dom.currentQuestionNum.textContent = questionNumber;
  dom.totalQuestionsNum.textContent = totalQuestions;

  // Calculate progress percentage
  const progressPercent = Math.round(((state.currentIndex) / totalQuestions) * 100);
  dom.progressPercentage.textContent = `${progressPercent}%`;
  dom.progressFill.style.width = `${progressPercent}%`;
  dom.progressBar.setAttribute('aria-valuenow', progressPercent);

  // 3. Question Title
  dom.questionText.textContent = currentQ.question;

  // 4. Clear and Render Answer Options
  dom.optionsContainer.innerHTML = '';
  const optionLetters = ['A', 'B', 'C', 'D'];

  currentQ.options.forEach((optionText, idx) => {
    const letter = optionLetters[idx] || (idx + 1);
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'option-btn';
    optionButton.setAttribute('role', 'radio');
    optionButton.setAttribute('aria-checked', 'false');
    optionButton.dataset.option = optionText;
    optionButton.dataset.index = idx;

    optionButton.innerHTML = `
      <span class="option-letter">${letter}</span>
      <span class="option-text">${escapeHTML(optionText)}</span>
      <span class="option-icon" aria-hidden="true"></span>
    `;

    optionButton.addEventListener('click', () => {
      handleAnswerSelection(optionText, optionButton);
    });

    dom.optionsContainer.appendChild(optionButton);
  });

  // 5. Reset Feedback Panel
  dom.feedbackPanel.classList.add('hidden');
  dom.feedbackHeader.className = 'feedback-header';

  // 6. Reset & Configure Next Button
  dom.nextQuestionBtn.disabled = true;
  if (state.currentIndex === totalQuestions - 1) {
    dom.nextBtnText.textContent = 'View Final Results';
  } else {
    dom.nextBtnText.textContent = 'Next Question';
  }
}

/**
 * Handles the selection of an answer option
 */
function handleAnswerSelection(selectedOptionText, clickedButton) {
  // Prevent multiple selections
  if (state.isAnswerSubmitted) return;
  state.isAnswerSubmitted = true;

  const currentQ = state.activeQuestions[state.currentIndex];
  const isCorrect = selectedOptionText === currentQ.correctAnswer;

  // 1. Update score in real time (only on correct answers)
  if (isCorrect) {
    state.score += 1;
    dom.liveScore.textContent = state.score;
    playSound('correct');
  } else {
    playSound('incorrect');
  }

  // 2. Record answer history for results & review screen
  state.userAnswers.push({
    questionId: currentQ.id,
    question: currentQ.question,
    options: currentQ.options,
    selectedAnswer: selectedOptionText,
    correctAnswer: currentQ.correctAnswer,
    isCorrect: isCorrect,
    explanation: currentQ.explanation,
    category: currentQ.category,
    difficulty: currentQ.difficulty
  });

  // 3. Update Visual State of Option Buttons
  const allOptionButtons = dom.optionsContainer.querySelectorAll('.option-btn');
  allOptionButtons.forEach(btn => {
    btn.disabled = true; // Disable further selections
    const btnOption = btn.dataset.option;

    if (btnOption === currentQ.correctAnswer) {
      // Highlight correct answer in green with checkmark
      btn.classList.add('correct');
      btn.setAttribute('aria-checked', 'true');
      const iconSpan = btn.querySelector('.option-icon');
      if (iconSpan) {
        iconSpan.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      }
    } else if (btn === clickedButton && !isCorrect) {
      // Highlight user's incorrect choice in red with X
      btn.classList.add('incorrect');
      btn.setAttribute('aria-checked', 'true');
      const iconSpan = btn.querySelector('.option-icon');
      if (iconSpan) {
        iconSpan.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      }
    } else {
      // Dim unselected options
      btn.classList.add('dimmed');
    }
  });

  // 4. Update and Display Feedback Banner & Explanation
  dom.feedbackPanel.classList.remove('hidden');

  if (isCorrect) {
    dom.feedbackHeader.className = 'feedback-header is-correct';
    dom.feedbackStatusText.textContent = 'Correct Answer!';
    dom.feedbackIconContainer.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  } else {
    dom.feedbackHeader.className = 'feedback-header is-incorrect';
    dom.feedbackStatusText.textContent = 'Incorrect Answer!';
    dom.feedbackIconContainer.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
    `;
  }

  dom.explanationText.textContent = currentQ.explanation;

  // 5. Update progress bar fill to reflect completed question
  const totalQuestions = state.activeQuestions.length;
  const progressPercent = Math.round(((state.currentIndex + 1) / totalQuestions) * 100);
  dom.progressPercentage.textContent = `${progressPercent}%`;
  dom.progressFill.style.width = `${progressPercent}%`;
  dom.progressBar.setAttribute('aria-valuenow', progressPercent);

  // 6. Enable Next Button
  dom.nextQuestionBtn.disabled = false;
  dom.nextQuestionBtn.focus();
}

/**
 * Advances to the next question or shows the final results
 */
function goToNextQuestion() {
  if (!state.isAnswerSubmitted) return;
  playSound('click');

  if (state.currentIndex < state.activeQuestions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

/**
 * Calculates results and transitions to the results screen
 */
function showResults() {
  state.isQuizCompleted = true;
  const totalAttempted = state.activeQuestions.length;
  const correctCount = state.score;
  const incorrectCount = totalAttempted - correctCount;
  const percentage = Math.round((correctCount / totalAttempted) * 100);

  // 1. Text Stats
  dom.statTotalAttempted.textContent = totalAttempted;
  dom.statCorrectCount.textContent = correctCount;
  dom.statIncorrectCount.textContent = incorrectCount;
  dom.finalScore.textContent = correctCount;
  dom.finalTotal.textContent = totalAttempted;
  dom.finalPercentage.textContent = `${percentage}%`;

  // 2. Rating & Performance Feedback
  let badgeText = '💡 Good Effort!';
  let messageText = 'Keep studying to master all technical concepts.';
  let ratingGrade = 'Grade: C';

  if (percentage >= 90) {
    badgeText = '🏆 Mastermind!';
    messageText = 'Outstanding performance! You have displayed mastery over core concepts!';
    ratingGrade = 'Grade: A+';
  } else if (percentage >= 75) {
    badgeText = '🌟 Great Job!';
    messageText = 'Impressive work! You have strong understanding across most topics.';
    ratingGrade = 'Grade: A';
  } else if (percentage >= 60) {
    badgeText = '👍 Solid Effort!';
    messageText = 'Good job! A bit more practice will turn you into an expert.';
    ratingGrade = 'Grade: B';
  } else if (percentage >= 40) {
    badgeText = '📚 Keep Learning!';
    messageText = 'You have a good starting point. Review your incorrect answers to improve!';
    ratingGrade = 'Grade: C';
  } else {
    badgeText = '🌱 Room for Growth!';
    messageText = 'Don\'t be discouraged! Take time to read through the detailed explanations.';
    ratingGrade = 'Grade: Needs Review';
  }

  dom.performanceBadge.textContent = badgeText;
  dom.performanceMessage.textContent = messageText;
  dom.finalRatingTag.textContent = ratingGrade;

  // 3. Radial SVG Gauge Animation (Circumference: 2 * PI * 70 = 439.82)
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;
  dom.radialProgress.style.strokeDashoffset = offset;

  // 4. Sound & Confetti for Good Scores
  if (percentage >= 60) {
    playSound('fanfare');
    setTimeout(triggerConfetti, 150);
  }

  switchScreen(dom.resultsScreen);
}

/**
 * Restarts the quiz completely without refreshing the webpage
 */
function restartQuiz() {
  playSound('click');
  // Reset all state variables
  state.currentIndex = 0;
  state.score = 0;
  state.userAnswers = [];
  state.isAnswerSubmitted = false;
  state.isQuizCompleted = false;

  // Start fresh with current preferences
  startQuiz();
}

/**
 * Opens detailed answer review screen
 */
function showReviewScreen() {
  playSound('click');
  populateReviewScreen('all');
  switchScreen(dom.reviewScreen);
}

/**
 * Populates review items with filter tab support
 */
function populateReviewScreen(activeFilter = 'all') {
  // Update filter counters
  const total = state.userAnswers.length;
  const correct = state.userAnswers.filter(a => a.isCorrect).length;
  const incorrect = total - correct;

  dom.filterAllCount.textContent = total;
  dom.filterCorrectCount.textContent = correct;
  dom.filterIncorrectCount.textContent = incorrect;

  // Filter items
  let filtered = [...state.userAnswers];
  if (activeFilter === 'correct') {
    filtered = filtered.filter(a => a.isCorrect);
  } else if (activeFilter === 'incorrect') {
    filtered = filtered.filter(a => !a.isCorrect);
  }

  // Render list
  dom.reviewListContainer.innerHTML = '';

  if (filtered.length === 0) {
    dom.reviewListContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        No questions match this filter.
      </div>
    `;
    return;
  }

  filtered.forEach((ans, index) => {
    const itemCard = document.createElement('div');
    itemCard.className = `review-item ${ans.isCorrect ? 'item-correct' : 'item-incorrect'}`;

    const originalIndex = state.userAnswers.indexOf(ans) + 1;

    itemCard.innerHTML = `
      <div class="review-item-header">
        <span class="review-q-num">Question ${originalIndex}</span>
        <span class="review-status-tag ${ans.isCorrect ? 'tag-correct' : 'tag-incorrect'}">
          ${ans.isCorrect ? '✓ Correct' : '✕ Incorrect'}
        </span>
      </div>

      <h3 class="review-item-title">${escapeHTML(ans.question)}</h3>

      <div class="review-answers-box">
        <div class="review-choice">
          <span class="choice-label">Your Answer:</span>
          <span class="choice-text ${ans.isCorrect ? 'text-success' : 'text-danger'}">
            ${escapeHTML(ans.selectedAnswer)}
          </span>
        </div>

        ${!ans.isCorrect ? `
          <div class="review-choice">
            <span class="choice-label">Correct Answer:</span>
            <span class="choice-text text-success">
              ${escapeHTML(ans.correctAnswer)}
            </span>
          </div>
        ` : ''}
      </div>

      <div class="review-explanation">
        <strong>Explanation:</strong> ${escapeHTML(ans.explanation)}
      </div>
    `;

    dom.reviewListContainer.appendChild(itemCard);
  });
}

// ============================================================================
// 8. Theme and Audio Management
// ============================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('quizpulse_theme') || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('quizpulse_theme', theme);

  if (theme === 'light') {
    dom.moonIcon.classList.add('hidden');
    dom.sunIcon.classList.remove('hidden');
  } else {
    dom.moonIcon.classList.remove('hidden');
    dom.sunIcon.classList.add('hidden');
  }
}

function toggleTheme() {
  const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  playSound('click');
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  if (state.soundEnabled) {
    dom.soundOnIcon.classList.remove('hidden');
    dom.soundOffIcon.classList.add('hidden');
    playSound('click');
  } else {
    dom.soundOnIcon.classList.add('hidden');
    dom.soundOffIcon.classList.remove('hidden');
  }
}

// ============================================================================
// 9. Keyboard Navigation Support
// ============================================================================
function handleKeyboardNavigation(e) {
  // If user is inside an input or select, do not override
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

  // Active quiz screen keyboard handling
  if (dom.quizScreen.classList.contains('active')) {
    // Keys '1', '2', '3', '4' or 'a', 'b', 'c', 'd'
    const key = e.key.toLowerCase();
    let optionIndex = -1;

    if (['1', '2', '3', '4'].includes(key)) {
      optionIndex = parseInt(key, 10) - 1;
    } else if (['a', 'b', 'c', 'd'].includes(key)) {
      optionIndex = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 }[key];
    }

    if (optionIndex >= 0 && !state.isAnswerSubmitted) {
      const optionButtons = dom.optionsContainer.querySelectorAll('.option-btn');
      if (optionButtons[optionIndex]) {
        optionButtons[optionIndex].click();
      }
    }

    // Enter / Space to advance to Next Question
    if ((e.key === 'Enter' || e.key === ' ') && state.isAnswerSubmitted && !dom.nextQuestionBtn.disabled) {
      e.preventDefault();
      dom.nextQuestionBtn.click();
    }
  }

  // Welcome screen: Enter triggers Start Quiz
  else if (dom.welcomeScreen.classList.contains('active')) {
    if (e.key === 'Enter') {
      dom.startQuizBtn.click();
    }
  }

  // Results screen: Enter restarts
  else if (dom.resultsScreen.classList.contains('active')) {
    if (e.key === 'Enter') {
      dom.restartQuizBtn.click();
    }
  }
}

// Helper: Escape HTML to avoid XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// 10. Event Listeners Initialization
// ============================================================================
function bindEvents() {
  // Brand logo click returns to welcome screen
  dom.brandLogo.addEventListener('click', () => {
    playSound('click');
    switchScreen(dom.welcomeScreen);
  });

  // Sound and Theme toggles
  dom.soundToggleBtn.addEventListener('click', toggleSound);
  dom.themeToggleBtn.addEventListener('click', toggleTheme);

  // Start Quiz Button
  dom.startQuizBtn.addEventListener('click', startQuiz);

  // Next Question Button
  dom.nextQuestionBtn.addEventListener('click', goToNextQuestion);

  // Results screen buttons
  dom.restartQuizBtn.addEventListener('click', restartQuiz);
  dom.reviewAnswersBtn.addEventListener('click', showReviewScreen);

  // Review screen buttons
  dom.backToResultsBtn.addEventListener('click', () => {
    playSound('click');
    switchScreen(dom.resultsScreen);
  });
  dom.reviewRestartBtn.addEventListener('click', restartQuiz);

  // Filter tabs in Review Screen
  dom.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dom.filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      populateReviewScreen(filter);
      playSound('click');
    });
  });

  // Keyboard navigation
  window.addEventListener('keydown', handleKeyboardNavigation);
}

// ============================================================================
// 11. App Bootstrapping
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  bindEvents();
  await loadQuestionBank();
});
