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
      // Show/hide formula category filter bar (not relevant for questions mode)
      filterBar.classList.toggle("hidden", activeMode === "questions");
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

  // === Questions Mode ===
  const qSearch = $("#q-search");
  const qFilterDifficulty = $("#q-filter-difficulty");
  const qFilterFirm = $("#q-filter-firm");
  const qFilterSubject = $("#q-filter-subject");
  const qFilterTheme = $("#q-filter-theme");
  const questionsList = $("#questions-list");

  // Build filter dropdowns
  FIRMS.forEach((f) => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    qFilterFirm.appendChild(opt);
  });
  SUBJECTS.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    qFilterSubject.appendChild(opt);
  });
  THEMES.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    qFilterTheme.appendChild(opt);
  });

  // Build formula lookup map
  const formulaMap = {};
  FORMULAS.forEach((f) => { formulaMap[f.id] = f; });

  function getFilteredQuestions() {
    const search = qSearch.value.toLowerCase();
    const diff = qFilterDifficulty.value;
    const firm = qFilterFirm.value;
    const subject = qFilterSubject.value;
    const theme = qFilterTheme.value;

    return QUESTIONS.filter((q) => {
      if (diff !== "all" && q.difficulty !== diff) return false;
      if (firm !== "all" && q.firm !== firm) return false;
      if (subject !== "all" && q.subject !== subject) return false;
      if (theme !== "all") {
        if (!q.theme || !q.theme.split("|").includes(theme)) return false;
      }
      if (search) {
        const hay = `${q.id} ${q.name} ${q.firm} ${q.subject} ${q.framework || ""} ${q.theme || ""} ${q.formula_ids.join(" ")}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }

  function renderQuestions() {
    const filtered = getFilteredQuestions();
    questionsList.innerHTML = "";

    // Stats
    const easy = filtered.filter((q) => q.difficulty === "Easy").length;
    const med = filtered.filter((q) => q.difficulty === "Medium").length;
    const hard = filtered.filter((q) => q.difficulty === "Hard").length;
    $("#q-count-display").textContent = `Showing ${filtered.length} of ${QUESTIONS.length} questions`;
    $("#q-diff-breakdown").innerHTML =
      `<span style="color:var(--green)">${easy} Easy</span>` +
      `<span style="color:var(--orange)">${med} Medium</span>` +
      `<span style="color:var(--red)">${hard} Hard</span>`;

    filtered.forEach((q) => {
      const card = document.createElement("div");
      card.className = "q-card";
      card.dataset.id = q.id;

      const themes = q.theme ? q.theme.split("|").map((t) => `<span class="q-tag theme">${t}</span>`).join("") : "";
      const frameworks = q.framework ? q.framework.split("|").map((f) => `<span class="q-tag">${f}</span>`).join("") : "";

      // Build formula badges with tooltips
      let formulaBadges = "";
      if (q.formula_ids.length > 0) {
        formulaBadges = q.formula_ids.map((fid) => {
          const f = formulaMap[fid];
          const tip = f ? f.formula : fid;
          return `<span class="q-formula-link" title="${tip}">${fid}</span>`;
        }).join("");
      }

      card.innerHTML = `
        <div class="q-card-header">
          <span class="q-card-id">#${q.id}</span>
          <span class="q-card-name">${q.name}</span>
          <span class="q-card-difficulty ${q.difficulty.toLowerCase()}">${q.difficulty}</span>
        </div>
        <div class="q-card-meta">
          <span class="q-tag firm">${q.firm}</span>
          <span class="q-tag subject">${q.subject}</span>
          ${frameworks}
          ${themes}
        </div>
        <div class="q-card-detail">
          ${q.framework ? `<div class="q-detail-row"><span class="q-detail-label">Framework</span><span class="q-detail-value">${q.framework}</span></div>` : ""}
          ${q.theme ? `<div class="q-detail-row"><span class="q-detail-label">Theme</span><span class="q-detail-value">${q.theme}</span></div>` : ""}
          ${q.formula_ids.length > 0 ? `<div class="q-detail-row"><span class="q-detail-label">Formulas</span><span class="q-detail-value">${formulaBadges}</span></div>` : ""}
          ${q.formula_ids.length > 0 ? `<div style="margin-top:0.5rem">${q.formula_ids.map((fid) => {
            const f = formulaMap[fid];
            return f ? `<div style="font-size:0.8rem;margin-bottom:0.3rem"><span class="q-formula-link">${fid}</span> <span class="formula-tooltip">${f.formula}</span></div>` : "";
          }).join("")}</div>` : '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem">No linked formulas (logic/brainteaser)</div>'}
        </div>
      `;

      card.addEventListener("click", () => card.classList.toggle("expanded"));
      questionsList.appendChild(card);
    });
  }

  // Question filter listeners
  qSearch.addEventListener("input", renderQuestions);
  qFilterDifficulty.addEventListener("change", renderQuestions);
  qFilterFirm.addEventListener("change", renderQuestions);
  qFilterSubject.addEventListener("change", renderQuestions);
  qFilterTheme.addEventListener("change", renderQuestions);

  // Initial render
  renderQuestions();
})();
