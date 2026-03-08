// =============================================
// Statistics Study App — Main Application Logic
// =============================================

(function () {
  "use strict";

  // --- State ---
  let activeMode = "flashcards";
  let activeCategory = "all";
  let filteredFormulas = [...FORMULAS];
  let cardIndex = 0;
  let confidence = { hard: 0, okay: 0, easy: 0 };

  // Quiz state
  let quizQuestions = [];
  let quizIndex = 0;
  let quizCorrect = 0;
  let quizAnswers = [];

  // --- DOM Refs ---
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Nav
  const navBtns = $$(".nav-btn");
  const modeSections = $$(".mode-section");

  // Filter
  const filterBar = $("#filter-bar");

  // Flashcard
  const flashcard = $("#flashcard");
  const cardCounter = $("#card-counter");
  const prevBtn = $("#prev-card");
  const nextBtn = $("#next-card");
  const shuffleBtn = $("#shuffle-btn");
  const progressBar = $("#progress-bar");

  // Quiz
  const quizSetup = $("#quiz-setup");
  const quizActive = $("#quiz-active");
  const quizResults = $("#quiz-results");
  const startQuizBtn = $("#start-quiz");
  const quizNextBtn = $("#quiz-next");
  const quizRestartBtn = $("#quiz-restart");

  // Reference
  const searchBox = $("#search-box");
  const refBody = $("#ref-body");

  // --- Init ---
  buildFilterBar();
  renderCard();
  renderReference();

  // === Navigation ===
  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeMode = btn.dataset.mode;
      modeSections.forEach((s) => s.classList.add("hidden"));
      $(`#${activeMode}-mode`).classList.remove("hidden");
    });
  });

  // === Category Filter ===
  function buildFilterBar() {
    // "All" button already in HTML
    CATEGORIES.forEach((cat) => {
      const count = FORMULAS.filter((f) => f.category === cat).length;
      const btn = document.createElement("button");
      btn.className = "cat-btn";
      btn.dataset.cat = cat;
      btn.textContent = `${cat} (${count})`;
      filterBar.appendChild(btn);
    });

    filterBar.addEventListener("click", (e) => {
      if (!e.target.classList.contains("cat-btn")) return;
      $$(".cat-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      activeCategory = e.target.dataset.cat;
      applyFilter();
    });
  }

  function applyFilter() {
    filteredFormulas =
      activeCategory === "all"
        ? [...FORMULAS]
        : FORMULAS.filter((f) => f.category === activeCategory);
    cardIndex = 0;
    confidence = { hard: 0, okay: 0, easy: 0 };
    updateScoreSummary();
    renderCard();
    renderReference();
  }

  // === Flashcard Mode ===
  function renderCard() {
    if (filteredFormulas.length === 0) return;
    const f = filteredFormulas[cardIndex];
    flashcard.classList.remove("flipped");

    // Front
    flashcard.querySelector(".flashcard-front .card-id").textContent = f.id;
    flashcard.querySelector(".flashcard-front .card-category").textContent = f.category;
    flashcard.querySelector(".card-name").textContent = f.name;

    // Back
    flashcard.querySelector(".flashcard-back .card-id").textContent = f.id;
    flashcard.querySelector(".flashcard-back .card-category").textContent = f.category;
    flashcard.querySelector(".card-formula").textContent = f.formula;

    cardCounter.textContent = `${cardIndex + 1} / ${filteredFormulas.length}`;
    progressBar.style.width = `${((cardIndex + 1) / filteredFormulas.length) * 100}%`;
  }

  flashcard.addEventListener("click", () => flashcard.classList.toggle("flipped"));
  flashcard.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flashcard.classList.toggle("flipped");
    }
  });

  prevBtn.addEventListener("click", () => {
    if (cardIndex > 0) { cardIndex--; renderCard(); }
  });

  nextBtn.addEventListener("click", () => {
    if (cardIndex < filteredFormulas.length - 1) { cardIndex++; renderCard(); }
  });

  shuffleBtn.addEventListener("click", () => {
    for (let i = filteredFormulas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredFormulas[i], filteredFormulas[j]] = [filteredFormulas[j], filteredFormulas[i]];
    }
    cardIndex = 0;
    renderCard();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (activeMode !== "flashcards") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    if (e.key === "ArrowLeft") { prevBtn.click(); }
    else if (e.key === "ArrowRight") { nextBtn.click(); }
  });

  // Confidence rating
  $$(".conf-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const level = btn.dataset.conf;
      confidence[level]++;
      updateScoreSummary();
      // Auto-advance
      if (cardIndex < filteredFormulas.length - 1) {
        cardIndex++;
        renderCard();
      }
    });
  });

  function updateScoreSummary() {
    $("#hard-count").textContent = `Hard: ${confidence.hard}`;
    $("#okay-count").textContent = `Okay: ${confidence.okay}`;
    $("#easy-count").textContent = `Easy: ${confidence.easy}`;
  }

  // === Quiz Mode ===
  startQuizBtn.addEventListener("click", startQuiz);
  quizNextBtn.addEventListener("click", nextQuestion);
  quizRestartBtn.addEventListener("click", () => {
    quizResults.classList.add("hidden");
    quizSetup.classList.remove("hidden");
  });

  function startQuiz() {
    const count = parseInt($("#quiz-count").value);
    const style = $("#quiz-style").value;
    const pool = [...filteredFormulas];

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selected = pool.slice(0, Math.min(count, pool.length));
    quizQuestions = selected.map((f) => buildQuestion(f, style, pool));
    quizIndex = 0;
    quizCorrect = 0;
    quizAnswers = [];

    quizSetup.classList.add("hidden");
    quizResults.classList.add("hidden");
    quizActive.classList.remove("hidden");

    renderQuestion();
  }

  function buildQuestion(formula, style, pool) {
    let questionStyle = style;
    if (style === "mixed") {
      questionStyle = Math.random() < 0.5 ? "name-to-formula" : "formula-to-name";
    }

    const isNameToFormula = questionStyle === "name-to-formula";
    const prompt = isNameToFormula
      ? `What is the formula for: ${formula.name}?`
      : `Which concept has this formula: ${formula.formula}?`;

    const correctAnswer = isNameToFormula ? formula.formula : formula.name;

    // Build wrong options from same category first, then others
    const others = pool.filter((f) => f.id !== formula.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const wrongAnswers = shuffled.slice(0, 3).map((f) =>
      isNameToFormula ? f.formula : f.name
    );

    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    return { formula, prompt, correctAnswer, options };
  }

  function renderQuestion() {
    const q = quizQuestions[quizIndex];
    $("#q-num").textContent = quizIndex + 1;
    $("#q-total").textContent = quizQuestions.length;
    $("#q-prompt").textContent = q.prompt;
    $("#quiz-feedback").classList.add("hidden");
    quizNextBtn.classList.add("hidden");

    const optionsDiv = $("#q-options");
    optionsDiv.innerHTML = "";

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => handleAnswer(opt, q, optionsDiv));
      optionsDiv.appendChild(btn);
    });
  }

  function handleAnswer(selected, question, optionsDiv) {
    const isCorrect = selected === question.correctAnswer;
    if (isCorrect) quizCorrect++;
    quizAnswers.push({ question, selected, isCorrect });

    // Highlight options
    optionsDiv.querySelectorAll(".quiz-option").forEach((btn) => {
      btn.classList.add("disabled");
      if (btn.textContent === question.correctAnswer) btn.classList.add("correct");
      if (btn.textContent === selected && !isCorrect) btn.classList.add("wrong");
    });

    // Feedback
    const feedback = $("#quiz-feedback");
    feedback.classList.remove("hidden", "correct-feedback", "wrong-feedback");
    if (isCorrect) {
      feedback.classList.add("correct-feedback");
      feedback.textContent = "Correct!";
    } else {
      feedback.classList.add("wrong-feedback");
      feedback.textContent = `Incorrect. The answer is: ${question.correctAnswer}`;
    }

    quizNextBtn.classList.remove("hidden");
  }

  function nextQuestion() {
    quizIndex++;
    if (quizIndex >= quizQuestions.length) {
      showQuizResults();
    } else {
      renderQuestion();
    }
  }

  function showQuizResults() {
    quizActive.classList.add("hidden");
    quizResults.classList.remove("hidden");

    const pct = Math.round((quizCorrect / quizQuestions.length) * 100);
    $("#quiz-score").textContent = `${quizCorrect} / ${quizQuestions.length} correct (${pct}%)`;

    const reviewDiv = $("#quiz-review");
    reviewDiv.innerHTML = "";

    quizAnswers.forEach((a, i) => {
      const div = document.createElement("div");
      div.className = `review-item ${a.isCorrect ? "correct-review" : "wrong-review"}`;
      div.innerHTML = `
        <div class="review-q">${i + 1}. ${a.question.prompt}</div>
        <div class="review-a">${a.isCorrect ? "Correct" : `Your answer: ${a.selected}`}</div>
        ${!a.isCorrect ? `<div class="review-a" style="color:var(--green)">Correct answer: ${a.question.correctAnswer}</div>` : ""}
      `;
      reviewDiv.appendChild(div);
    });
  }

  // === Reference Mode ===
  function renderReference() {
    refBody.innerHTML = "";
    const query = searchBox ? searchBox.value.toLowerCase() : "";

    const list = filteredFormulas.filter((f) => {
      if (!query) return true;
      return (
        f.id.toLowerCase().includes(query) ||
        f.name.toLowerCase().includes(query) ||
        f.formula.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      );
    });

    list.forEach((f) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${f.id}</td>
        <td>${f.name}</td>
        <td>${f.formula}</td>
        <td>${f.category}</td>
      `;
      refBody.appendChild(tr);
    });
  }

  searchBox.addEventListener("input", renderReference);
})();
