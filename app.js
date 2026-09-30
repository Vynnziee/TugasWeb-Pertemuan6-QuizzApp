
const quizData = [
  {
    category: "HTML",
    question: "Apa kepanjangan dari HTML?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink Text Mode Language",
    ],
    correct: "Hyper Text Markup Language",
  },
  {
    category: "HTML",
    question: "Tag apa yang digunakan untuk membuat tautan (link) di HTML?",
    options: ["<link>", "<a>", "<href>", "<nav>"],
    correct: "<a>",
  },
  {
    category: "CSS",
    question: "Properti CSS apa yang digunakan untuk mengatur warna teks?",
    options: ["text-color", "font-color", "color", "text-style"],
    correct: "color",
  },
  {
    category: "CSS",
    question: "Apa fungsi utama Flexbox dalam CSS?",
    options: [
      "Mengatur koneksi database",
      "Mengatur tata letak elemen dalam satu dimensi",
      "Membuat animasi 3D",
      "Mengompres ukuran gambar",
    ],
    correct: "Mengatur tata letak elemen dalam satu dimensi",
  },
  {
    category: "JavaScript",
    question: "Method apa yang digunakan untuk memilih elemen HTML berdasarkan selector CSS?",
    options: ["getElementById()", "querySelector()", "findElement()", "selectTag()"],
    correct: "querySelector()",
  },
  {
    category: "JavaScript",
    question: "Apa fungsi addEventListener() dalam JavaScript?",
    options: [
      "Menghapus elemen dari DOM",
      "Menambahkan event handler ke elemen",
      "Membuat elemen baru",
      "Mengubah CSS secara langsung",
    ],
    correct: "Menambahkan event handler ke elemen",
  },
  {
    category: "JavaScript",
    question: "Apa yang dimaksud dengan Event Delegation?",
    options: [
      "Menghapus semua event listener sekaligus",
      "Menangani event dari elemen turunan lewat parent-nya",
      "Membuat event baru secara manual",
      "Menunda eksekusi sebuah event",
    ],
    correct: "Menangani event dari elemen turunan lewat parent-nya",
  },
  {
    category: "Web Storage",
    question: "Apa perbedaan utama localStorage dan sessionStorage?",
    options: [
      "localStorage jauh lebih cepat diakses",
      "sessionStorage hilang saat tab ditutup, localStorage tidak",
      "localStorage hanya bisa menyimpan angka",
      "Tidak ada perbedaan sama sekali",
    ],
    correct: "sessionStorage hilang saat tab ditutup, localStorage tidak",
  },
  {
    category: "JavaScript",
    question: "Properti mana yang aman dipakai mengisi teks agar terhindar dari XSS?",
    options: ["innerHTML", "outerHTML", "textContent", "document.write()"],
    correct: "textContent",
  },
  {
    category: "CSS",
    question: "Unit CSS apa yang bersifat relatif terhadap ukuran font elemen root?",
    options: ["px", "rem", "vh", "pt"],
    correct: "rem",
  },
];

const TIME_PER_QUESTION = 15; // detik — bonus: timer per soal
const RING_CIRCUMFERENCE = 119.4; // 2 * PI * r(19)

// ---------- DOM ELEMENTS ----------
const quizCard = document.querySelector("#quizCard");
const resultEl = document.querySelector("#result");

const categoryBadge = document.querySelector("#categoryBadge");
const progressFill = document.querySelector("#progressFill");
const progressLabel = document.querySelector("#progressLabel");
const questionEl = document.querySelector("#question");
const optionsEl = document.querySelector("#options");
const nextBtn = document.querySelector("#nextBtn");

const timerRing = document.querySelector("#timerRing");
const timerText = document.querySelector("#timerText");

const resultEmoji = document.querySelector("#resultEmoji");
const scoreEl = document.querySelector("#score");
const highScoreEl = document.querySelector("#highScore");
const restartBtn = document.querySelector("#restartBtn");

const themeToggle = document.querySelector("#themeToggle");

// ---------- STATE ----------
let workingData = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let timeLeft = TIME_PER_QUESTION;
let timerInterval = null;

// ---------- UTIL: shuffle (Fisher–Yates) ----------
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- START / RESTART QUIZ ----------
function startQuiz() {
  // Bonus: urutan soal & kategori diacak setiap main
  workingData = shuffle(quizData);
  currentQuestion = 0;
  score = 0;

  resultEl.classList.add("hidden");
  quizCard.classList.remove("hidden");

  renderQuestion();
}

// ---------- RENDER SOAL (createElement + textContent) ----------
function renderQuestion() {
  answered = false;
  const q = workingData[currentQuestion];

  categoryBadge.textContent = q.category;
  progressLabel.textContent = `Soal ${currentQuestion + 1}/${workingData.length}`;
  progressFill.style.width = `${(currentQuestion / workingData.length) * 100}%`;

  // Animasi transisi antar soal (bonus)
  questionEl.style.animation = "none";
  optionsEl.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  questionEl.offsetHeight; // force reflow untuk restart animasi
  questionEl.style.animation = "";

  questionEl.textContent = q.question;

  // Render opsi jawaban dengan createElement (acak urutan opsinya juga)
  optionsEl.innerHTML = "";
  const shuffledOptions = shuffle(q.options);
  shuffledOptions.forEach((optionText) => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = optionText;
    optionsEl.appendChild(btn);
  });

  nextBtn.classList.add("hidden");
  startTimer();
}

// ---------- EVENT DELEGATION untuk pilihan jawaban ----------
optionsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".option-btn");
  if (!btn || answered) return;
  handleAnswer(btn);
});

function handleAnswer(selectedBtn) {
  answered = true;
  stopTimer();

  const correctAnswer = workingData[currentQuestion].correct;
  const allButtons = optionsEl.querySelectorAll(".option-btn");

  allButtons.forEach((btn) => {
    btn.disabled = true;
    // Feedback visual: jawaban benar selalu ditandai hijau
    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    }
  });

  if (selectedBtn.textContent === correctAnswer) {
    score++;
  } else {
    // Feedback visual: jawaban yang dipilih salah ditandai merah
    selectedBtn.classList.add("wrong");
  }

  nextBtn.classList.remove("hidden");
}

// ---------- TIMER PER SOAL (bonus) ----------
function startTimer() {
  stopTimer();
  timeLeft = TIME_PER_QUESTION;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function updateTimerUI() {
  timerText.textContent = timeLeft;
  const offset = RING_CIRCUMFERENCE * (1 - timeLeft / TIME_PER_QUESTION);
  timerRing.style.strokeDashoffset = offset;
  timerRing.classList.toggle("low", timeLeft <= 5);
}

function handleTimeout() {
  if (answered) return;
  answered = true;

  const correctAnswer = workingData[currentQuestion].correct;
  const allButtons = optionsEl.querySelectorAll(".option-btn");
  allButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) btn.classList.add("correct");
  });

  nextBtn.classList.remove("hidden");
}

// ---------- TOMBOL LANJUT (navigasi tanpa reload / SPA) ----------
nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < workingData.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

// ---------- HASIL & HIGH SCORE (LocalStorage) ----------
function showResult() {
  stopTimer();
  quizCard.classList.add("hidden");
  resultEl.classList.remove("hidden");
  progressFill.style.width = "100%";

  const total = workingData.length;
  const percentage = Math.round((score / total) * 100);
  scoreEl.textContent = `${score}/${total} (${percentage}%)`;

  const savedHighScore = parseInt(localStorage.getItem("quizHighScore")) || 0;

  if (percentage > savedHighScore) {
    localStorage.setItem("quizHighScore", percentage);
    highScoreEl.textContent = `${percentage}% 🎉 Rekor baru!`;
  } else {
    highScoreEl.textContent = `${savedHighScore}%`;
  }

  resultEmoji.textContent = percentage >= 80 ? "🏆" : percentage >= 50 ? "🎉" : "💪";
}

// ---------- TOMBOL RESTART ----------
restartBtn.addEventListener("click", startQuiz);

// ---------- DARK MODE TOGGLE (bonus) ----------
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("quizTheme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  applyTheme(current === "dark" ? "light" : "dark");
});

// ---------- INISIALISASI ----------
applyTheme(localStorage.getItem("quizTheme") || "dark");
startQuiz();
