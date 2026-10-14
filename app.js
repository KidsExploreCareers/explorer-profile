"use strict";

/*
 * Kids Explore Careers
 * Explorer Profile browser app
 *
 * Privacy design:
 * - Answers exist only in JavaScript memory.
 * - No localStorage or sessionStorage.
 * - No cookies.
 * - No network submission.
 * - No analytics.
 * - Refreshing or closing the page clears the answers.
 */

(() => {
  const data = EXPLORER_PROFILE_DATA;
  const narratives = EXPLORER_NARRATIVES;

  const PROFILE_RULES = {
    topThreshold: 0.05,
    bottomThreshold: 0.05,
    reportMinTopSignals: 3,
    reportMaxTopSignals: 5,
    maxBottomSignalsToSprinkle: 3,
    integrativeEvenRangeMax: 0.18,
    integrativePeakGapMin: 0.14,
    integrativeStrongPeakMin: 0.78,
    meaningfulReflectionMinWords: 2
  };

  const RADAR_ORDER = [
    "Curiosity",
    "Initiative",
    "Instruction",
    "Creativity",
    "Persistence",
    "Empathy",
    "Reflection",
    "Reasoning",
    "Collaboration"
  ];

  const RADAR_FAMILIES = {
    Thinking: ["Curiosity", "Creativity", "Reflection"],
    Action: ["Initiative", "Persistence", "Reasoning"],
    Helping: ["Instruction", "Empathy", "Collaboration"]
  };

  const state = {
    name: "",
    currentQuestionIndex: 0,
    answers: {},
    reflectionEnjoy: "",
    reflectionSurprise: ""
  };

  const appCard = document.getElementById("app-card");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toSignalSlug(signalName) {
    return String(signalName || "")
      .trim()
      .toLowerCase()
      .replaceAll("&", "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function ensureSentence(value) {
    const text = String(value || "").trim();
    if (!text) return "";
    return /[.!?]$/.test(text) ? text : `${text}.`;
  }

  function hashString(value) {
    const text = String(value || "");
    let hash = 0;

    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    return hash;
  }

  function getProfileSeed() {
    return data.questions
      .map((question) => {
        const value = state.answers[question.id];
        return value === undefined ? `${question.id}:_` : `${question.id}:${value}`;
      })
      .join("|");
  }

  function pickNarrativeVariant(key, seedSuffix = "") {
    const value = narratives[key];

    if (!value) return null;
    if (typeof value === "string") return value;

    const seed = `${key}::${getProfileSeed()}::${seedSuffix}`;
    const index = Math.abs(hashString(seed)) % value.length;

    return value[index];
  }

  function getSectionForQuestion(questionNumber) {
    if (!Array.isArray(data.sections)) {
      return null;
    }

    return data.sections.find(
      (section) =>
        questionNumber >= section.startQuestion &&
        questionNumber <= section.endQuestion
    ) || null;
  }

  function scrollToCard() {
    appCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderWelcome() {
    appCard.innerHTML = `
      <h2>Discover what stands out about you</h2>

      <p>
        Answer a series of questions about what you enjoy, how you think,
        how you solve problems, and how you work with others.
      </p>

      <p>
        At the end, you'll receive your own Explorer Profile — a snapshot
        of your interests, strengths, and ways of learning.
      </p>

      <div class="privacy-note">
        <strong>Your answers stay private.</strong><br>
        Your questionnaire answers are processed in your browser and are
        not submitted to or stored by Kids Explore Careers.
      </div>

      <button id="start-button" class="primary-button" type="button">
        Create My Explorer Profile
      </button>

      <p class="small-text">
        You can stop at any time. Your answers are not saved after you leave
        or refresh this page.
      </p>
    `;

    document
      .getElementById("start-button")
      .addEventListener("click", () => {
        renderNameScreen();
        scrollToCard();
      });
  }

  function renderNameScreen() {
    appCard.innerHTML = `
      <div class="progress-label">Before we begin</div>

      <h2>${escapeHtml(data.namePrompt.label)}</h2>

      <p>${escapeHtml(data.namePrompt.helpText)}</p>

      <label class="field-label" for="profile-name">
        First name or nickname
      </label>

      <input
        id="profile-name"
        class="text-input"
        type="text"
        maxlength="40"
        autocomplete="off"
        value="${escapeHtml(state.name)}"
        placeholder="Optional"
      >

      <div class="button-row">
        <button id="name-back" class="secondary-button" type="button">
          Back
        </button>

        <button id="name-next" class="primary-button" type="button">
          Next
        </button>
      </div>
    `;

    document.getElementById("name-back").addEventListener("click", () => {
      renderWelcome();
      scrollToCard();
    });

    document.getElementById("name-next").addEventListener("click", () => {
      state.name = document.getElementById("profile-name").value.trim();
      state.currentQuestionIndex = 0;
      renderQuestion();
      scrollToCard();
    });
  }

  function renderQuestion() {
    const question = data.questions[state.currentQuestionIndex];

    if (!question) {
      renderReflectionScreen();
      return;
    }

    const section = getSectionForQuestion(question.number);
    const selectedValue = state.answers[question.id];

    const answerMarkup = data.answerChoices
      .map((choice) => {
        const checked =
          selectedValue !== undefined &&
          Number(selectedValue) === Number(choice.value);

        return `
          <label class="answer-option ${checked ? "selected" : ""}">
            <input
              type="radio"
              name="answer"
              value="${choice.value}"
              ${checked ? "checked" : ""}
            >
            <span>${escapeHtml(choice.label)}</span>
          </label>
        `;
      })
      .join("");

    const percent = Math.round(
      ((state.currentQuestionIndex + 1) / data.questions.length) * 100
    );

    appCard.innerHTML = `
      <div class="progress-label">
        Question ${state.currentQuestionIndex + 1} of ${data.questions.length}
      </div>

      <div
        class="progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${percent}"
        aria-label="Explorer Profile progress"
      >
        <div class="progress-fill" style="width: ${percent}%"></div>
      </div>

      ${
        section
          ? `
            <div class="section-heading">
              <h3>${escapeHtml(section.title)}</h3>
              <p>${escapeHtml(section.description)}</p>
            </div>
          `
          : ""
      }

      <h2 class="question-text">
        ${escapeHtml(question.text)}
      </h2>

      <p class="small-text">Choose the answer that feels most like you.</p>

      <div class="answer-list">
        ${answerMarkup}
      </div>

      <div class="button-row">
        <button id="question-back" class="secondary-button" type="button">
          Back
        </button>

        <button id="question-next" class="primary-button" type="button">
          ${
            state.currentQuestionIndex === data.questions.length - 1
              ? "Continue"
              : "Next"
          }
        </button>
      </div>

      <button id="skip-question" class="text-button" type="button">
        Skip this question
      </button>
    `;

    document.querySelectorAll('input[name="answer"]').forEach((radio) => {
      radio.addEventListener("change", (event) => {
        state.answers[question.id] = Number(event.target.value);

        document.querySelectorAll(".answer-option").forEach((option) => {
          option.classList.remove("selected");
        });

        event.target.closest(".answer-option").classList.add("selected");
      });
    });

    document.getElementById("question-back").addEventListener("click", () => {
      goBackFromQuestion();
      scrollToCard();
    });

    document.getElementById("question-next").addEventListener("click", () => {
      goForwardFromQuestion();
      scrollToCard();
    });

    document.getElementById("skip-question").addEventListener("click", () => {
      delete state.answers[question.id];
      goForwardFromQuestion();
      scrollToCard();
    });
  }

  function goBackFromQuestion() {
    if (state.currentQuestionIndex === 0) {
      renderNameScreen();
      return;
    }

    state.currentQuestionIndex -= 1;
    renderQuestion();
  }

  function goForwardFromQuestion() {
    if (state.currentQuestionIndex < data.questions.length - 1) {
      state.currentQuestionIndex += 1;
      renderQuestion();
      return;
    }

    renderReflectionScreen();
  }

  function renderReflectionScreen() {
    appCard.innerHTML = `
      <div class="progress-label">Reflection</div>

      <h2>You’re almost done.</h2>

      <p>
        These questions are optional. Share anything that might help your
        Explorer Profile sound more like you.
      </p>

      <div class="privacy-note">
        <strong>Keep private information private.</strong><br>
        Please don't enter your full name, school, address, phone number,
        email address, or other identifying information.
      </div>

      <div class="reflection-field">
        <label class="field-label" for="reflection-enjoy">
          ${escapeHtml(data.reflectionQuestions[0].text)}
        </label>

        <p class="small-text">
          ${escapeHtml(data.reflectionQuestions[0].helpText)}
        </p>

        <textarea
          id="reflection-enjoy"
          class="text-area"
          maxlength="500"
          rows="4"
        >${escapeHtml(state.reflectionEnjoy)}</textarea>
      </div>

      <div class="reflection-field">
        <label class="field-label" for="reflection-surprise">
          ${escapeHtml(data.reflectionQuestions[1].text)}
        </label>

        <p class="small-text">
          ${escapeHtml(data.reflectionQuestions[1].helpText)}
        </p>

        <textarea
          id="reflection-surprise"
          class="text-area"
          maxlength="500"
          rows="4"
        >${escapeHtml(state.reflectionSurprise)}</textarea>
      </div>

      <div class="button-row">
        <button id="reflection-back" class="secondary-button" type="button">
          Back
        </button>

        <button id="reflection-finish" class="primary-button" type="button">
          Build My Explorer Profile
        </button>
      </div>
    `;

    document.getElementById("reflection-back").addEventListener("click", () => {
      saveReflectionValues();
      state.currentQuestionIndex = data.questions.length - 1;
      renderQuestion();
      scrollToCard();
    });

    document
      .getElementById("reflection-finish")
      .addEventListener("click", () => {
        saveReflectionValues();
        renderResultsScreen();
        scrollToCard();
      });
  }

  function saveReflectionValues() {
    state.reflectionEnjoy =
      document.getElementById("reflection-enjoy")?.value.trim() || "";

    state.reflectionSurprise =
      document.getElementById("reflection-surprise")?.value.trim() || "";
  }

  function calculateSignalScores() {
    const config = data.scoring;

    return data.signals.map((signal) => {
      const questions = data.questions.filter(
        (question) => question.signal === signal.name
      );

      const answeredValues = questions
        .filter((question) =>
          Object.prototype.hasOwnProperty.call(state.answers, question.id)
        )
        .map((question) => Number(state.answers[question.id]))
        .filter((value) => Number.isFinite(value));

      const answered = answeredValues.length;
      const raw = answeredValues.reduce((sum, value) => sum + value, 0);

      let score = null;

      if (answered > 0) {
        const completeness =
          config.completenessBase +
          config.completenessBonus *
            (answered / config.questionsPerSignal);

        score =
          (raw / (answered * config.scaleDivisor)) * completeness;
      }

      return {
        name: signal.name,
        family: signal.family,
        raw,
        answered,
        score
      };
    });
  }

  function getDistinctScoreGroups(scoredSignals) {
    const sortedLevels = [];

    scoredSignals
      .map((signal) => signal.score)
      .sort((a, b) => b - a)
      .forEach((score) => {
        if (!sortedLevels.some((level) => Math.abs(level - score) < 1e-12)) {
          sortedLevels.push(score);
        }
      });

    return sortedLevels.slice(0, 3).map((level) => ({
      score: level,
      signals: scoredSignals
        .filter((signal) => Math.abs(signal.score - level) < 1e-12)
        .map((signal) => signal.name)
    }));
  }

  function buildProfileModel() {
    const scores = calculateSignalScores();
    const scoredSignals = scores.filter((signal) => signal.score !== null);

    if (scoredSignals.length === 0) {
      return {
        scores,
        scoredSignals,
        allTied: false,
        workbookTopSignals: [],
        bottomSignals: [],
        topGroups: [],
        standoutSignals: [],
        topSignalItems: [],
        learnBest: "",
        integrativeSummary: "",
        fluidityNote: pickNarrativeVariant("profile_fluidity_note", "fluidity") || "",
        qualitativeText: buildQualitativeText()
      };
    }

    const maxScore = Math.max(...scoredSignals.map((signal) => signal.score));
    const minScore = Math.min(...scoredSignals.map((signal) => signal.score));
    const allTied =
      scoredSignals.length === data.signals.length &&
      Math.abs(maxScore - minScore) < 1e-12;

    const workbookTopSignals = allTied
      ? []
      : scoredSignals
          .filter(
            (signal) =>
              maxScore - signal.score <= PROFILE_RULES.topThreshold + 1e-12
          )
          .map((signal) => signal.name);

    const bottomSignals = allTied
      ? []
      : scoredSignals
          .filter(
            (signal) =>
              signal.score - minScore <= PROFILE_RULES.bottomThreshold + 1e-12
          )
          .map((signal) => signal.name);

    const topGroups = getDistinctScoreGroups(scoredSignals);
    const standoutSignals = [];
    const seen = new Set();

    function addSignals(signalNames) {
      signalNames.forEach((signalName) => {
        if (standoutSignals.length >= PROFILE_RULES.reportMaxTopSignals) return;
        if (seen.has(signalName)) return;

        seen.add(signalName);
        standoutSignals.push(signalName);
      });
    }

    if (!allTied) {
      addSignals(workbookTopSignals);

      if (standoutSignals.length < PROFILE_RULES.reportMinTopSignals) {
        for (const group of topGroups) {
          addSignals(group.signals);
          if (standoutSignals.length >= PROFILE_RULES.reportMinTopSignals) break;
        }
      }
    }

    const topSignalItems = buildTopSignalItems(standoutSignals);
    const learnBest = buildLearnBestNarrative(standoutSignals, bottomSignals);
    const integrativeSummary = buildIntegrativeSummary(scores);
    const fluidityNote =
      pickNarrativeVariant("profile_fluidity_note", "fluidity") || "";

    return {
      scores,
      scoredSignals,
      maxScore,
      minScore,
      allTied,
      workbookTopSignals,
      bottomSignals,
      topGroups,
      standoutSignals,
      topSignalItems,
      learnBest,
      integrativeSummary,
      fluidityNote,
      qualitativeText: buildQualitativeText()
    };
  }

  function buildTopSignalItems(standoutSignals) {
    return standoutSignals.map((signalName) => {
      const slug = toSignalSlug(signalName);
      const microKey = `micro_${slug}_high`;
      const microText = pickNarrativeVariant(microKey, "top");

      if (microText) {
        return { label: signalName, text: microText };
      }

      const detailKey = `signal_${slug}_high`;
      const summaryKey = `signal_${slug}_summary`;

      return {
        label: signalName,
        text: narratives[detailKey] || narratives[summaryKey] || ""
      };
    });
  }

  function buildLearnBestNarrative(standoutSignals, bottomSignals) {
    const backbone = [];

    standoutSignals.forEach((signalName) => {
      const slug = toSignalSlug(signalName);
      const detail =
        narratives[`signal_${slug}_high`] ||
        narratives[`signal_${slug}_summary`];

      if (detail) {
        backbone.push(ensureSentence(detail));
      }
    });

    if (backbone.length === 0) {
      return "";
    }

    const lowMicros = [];

    bottomSignals
      .slice(0, PROFILE_RULES.maxBottomSignalsToSprinkle)
      .forEach((signalName) => {
        const slug = toSignalSlug(signalName);
        const text = pickNarrativeVariant(`micro_${slug}_low`, "low");

        if (text) {
          lowMicros.push(ensureSentence(text));
        }
      });

    if (lowMicros.length === 0) {
      return backbone.join(" ");
    }

    const merged = backbone.slice();
    const insertCount = Math.min(
      lowMicros.length,
      Math.max(1, backbone.length - 1)
    );

    const positions = [];

    for (let index = 0; index < insertCount; index += 1) {
      const position =
        Math.floor(((index + 1) * backbone.length) / (insertCount + 1)) - 1;

      positions.push(
        Math.max(0, Math.min(backbone.length - 1, position))
      );
    }

    for (let index = insertCount - 1; index >= 0; index -= 1) {
      merged.splice(positions[index] + 1, 0, lowMicros[index]);
    }

    return merged.join(" ");
  }

  function computeIntegrativeKey(scores) {
    const radarScores = RADAR_ORDER
      .map((signalName) =>
        scores.find((signal) => signal.name === signalName)?.score
      )
      .filter((score) => Number.isFinite(score));

    if (radarScores.length < 3) {
      return null;
    }

    const sorted = [...radarScores].sort((a, b) => b - a);
    const max = sorted[0];
    const second = sorted[1];
    const min = sorted[sorted.length - 1];
    const range = max - min;
    const topGap = max - second;

    if (
      topGap >= PROFILE_RULES.integrativePeakGapMin &&
      max >= PROFILE_RULES.integrativeStrongPeakMin
    ) {
      return "integrative_strong_peak";
    }

    if (range <= PROFILE_RULES.integrativeEvenRangeMax) {
      return "integrative_broad_explorer_even";
    }

    return "integrative_broad_explorer_with_peaks";
  }

  function buildIntegrativeSummary(scores) {
    const key = computeIntegrativeKey(scores);

    if (key && narratives[key]) {
      return narratives[key];
    }

    const preferred = [
      "integrative_balanced_with_peak",
      "integrative_broad_explorer_with_peaks",
      "integrative_broad_explorer_even",
      "integrative_balanced_strengths",
      "integrative_focused_with_support",
      "integrative_strong_peak",
      "integrative_emerging_profile",
      "integrative_emerging_even",
      "integrative_fallback",
      "report_integrative_summary_typical",
      "report_integrative_summary_balanced",
      "report_integrative_summary_many_highs",
      "report_integrative_summary_single_peak",
      "report_integrative_summary_no_highs"
    ];

    for (const narrativeKey of preferred) {
      if (narratives[narrativeKey]) {
        return narratives[narrativeKey];
      }
    }

    return "";
  }

  function normalizeQualitative(value) {
    let text = String(value || "").trim().toLowerCase();

    if (!text) return "";

    text = text.replace(/[’“”]/g, "'");
    text = text.replace(/\bn\s*\/\s*a\b/g, "na");
    text = text.replace(/\bn\s*a\b/g, "na");
    text = text.replace(/\bnot\s*applicable\b/g, "na");
    text = text.replace(/[^a-z0-9\s]/g, " ");
    text = text.replace(/\s+/g, " ").trim();

    return text;
  }

  function isNonAnswerQualitative(normalized) {
    if (!normalized) return true;

    const nonAnswers = new Set([
      "na",
      "none",
      "no",
      "nope",
      "nah",
      "not really",
      "not sure",
      "dont know",
      "do not know",
      "idk",
      "nothing",
      "nothing else",
      "no comment",
      "nil"
    ]);

    if (nonAnswers.has(normalized)) return true;
    if (/^no(\s+(thanks|thank you))?$/.test(normalized)) return true;

    return false;
  }

  function isMeaningfulQualitative(value) {
    const normalized = normalizeQualitative(value);

    if (isNonAnswerQualitative(normalized)) return false;

    const wordCount = normalized
      ? normalized.split(" ").filter(Boolean).length
      : 0;

    return wordCount > PROFILE_RULES.meaningfulReflectionMinWords;
  }

  function buildQualitativeText() {
    const blocks = [];

    if (isMeaningfulQualitative(state.reflectionEnjoy)) {
      blocks.push(state.reflectionEnjoy.trim());
    }

    if (isMeaningfulQualitative(state.reflectionSurprise)) {
      blocks.push(state.reflectionSurprise.trim());
    }

    return blocks.join(" — ");
  }

  function formatPercent(score) {
    if (!Number.isFinite(score)) return "—";

    const value = score * 100;
    const roundedInteger = Math.round(value);

    if (Math.abs(value - roundedInteger) < 1e-9) {
      return `${roundedInteger}%`;
    }

    return `${value.toFixed(1)}%`;
  }

  function formatGeneratedDate(date) {
    return date.toLocaleString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getProfileTitle() {
    if (!state.name) return "Your Explorer Profile";

    const possessive = state.name.toLowerCase().endsWith("s")
      ? `${state.name}’`
      : `${state.name}’s`;

    return `${possessive} Explorer Profile`;
  }

  function buildRadarSvg(profile) {
    const width = 470;
    const height = 405;
    const centerX = 235;
    const centerY = 175;
    const radius = 126;
    const labelRadius = 165;

    const scoreMap = new Map(
      profile.scores.map((signal) => [signal.name, signal.score])
    );

    const standoutSet = new Set(profile.standoutSignals);

    function polarPoint(index, distance) {
      const angle = (-90 + (index * 360) / RADAR_ORDER.length) * Math.PI / 180;

      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance
      };
    }

    function pointsForSignalNames(signalNames) {
      return signalNames
        .map((signalName) => {
          const index = RADAR_ORDER.indexOf(signalName);
          const score = scoreMap.get(signalName);

          if (index < 0 || !Number.isFinite(score)) return null;

          const point = polarPoint(index, radius * score);
          return { ...point, signalName };
        })
        .filter(Boolean);
    }

    function pathForPoints(points, closePath) {
      if (points.length === 0) return "";

      const commands = [
        `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
      ];

      for (let index = 1; index < points.length; index += 1) {
        commands.push(
          `L ${points[index].x.toFixed(2)} ${points[index].y.toFixed(2)}`
        );
      }

      if (closePath && points.length >= 3) {
        commands.push("Z");
      }

      return commands.join(" ");
    }

    const organizationScore = scoreMap.get("Organization");
    let organizationPath = "";

    if (Number.isFinite(organizationScore)) {
      const points = RADAR_ORDER.map((_, index) =>
        polarPoint(index, radius * organizationScore)
      );

      organizationPath = `
        <path
          class="radar-line radar-organization"
          d="${pathForPoints(points, true)}"
        />
      `;
    }

    const familyClass = {
      Thinking: "radar-thinking",
      Action: "radar-action",
      Helping: "radar-helping"
    };

    const familyPaths = Object.entries(RADAR_FAMILIES)
      .map(([familyName, signalNames]) => {
        const points = pointsForSignalNames(signalNames);
        const closePath = points.length === signalNames.length;

        if (points.length < 2) return "";

        const circles = points
          .map(
            (point) => `
              <circle
                class="radar-point ${familyClass[familyName]}-point"
                cx="${point.x.toFixed(2)}"
                cy="${point.y.toFixed(2)}"
                r="5"
              />
            `
          )
          .join("");

        return `
          <path
            class="radar-line ${familyClass[familyName]}"
            d="${pathForPoints(points, closePath)}"
          />
          ${circles}
        `;
      })
      .join("");

    const labels = RADAR_ORDER
      .map((signalName, index) => {
        const point = polarPoint(index, labelRadius);
        const deltaX = point.x - centerX;
        let anchor = "middle";

        if (deltaX > 35) anchor = "start";
        if (deltaX < -35) anchor = "end";

        const topClass = standoutSet.has(signalName) ? " radar-label-top" : "";

        return `
          <text
            class="radar-label${topClass}"
            x="${point.x.toFixed(2)}"
            y="${point.y.toFixed(2)}"
            text-anchor="${anchor}"
            dominant-baseline="middle"
          >${escapeHtml(signalName)}</text>
        `;
      })
      .join("");

    const organizationLegendClass = standoutSet.has("Organization")
      ? " legend-label-top"
      : "";

    return `
      <svg
        class="radar-svg"
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-labelledby="radar-title radar-desc"
      >
        <title id="radar-title">Explorer Map</title>
        <desc id="radar-desc">
          A nine-spoke radar map showing Thinking, Action, Helping, and Organization signal patterns.
        </desc>

        ${organizationPath}
        ${familyPaths}
        ${labels}

        <g class="radar-legend" transform="translate(62 372)">
          <circle class="legend-dot legend-thinking" cx="0" cy="0" r="5"></circle>
          <text x="12" y="1">Thinking</text>

          <circle class="legend-dot legend-action" cx="95" cy="0" r="5"></circle>
          <text x="107" y="1">Action</text>

          <circle class="legend-dot legend-helping" cx="169" cy="0" r="5"></circle>
          <text x="181" y="1">Helping</text>

          <line class="legend-org-line" x1="262" y1="0" x2="277" y2="0"></line>
          <text class="${organizationLegendClass}" x="285" y="1">Organization</text>
        </g>
      </svg>
    `;
  }

  function renderResultsScreen() {
    const profile = buildProfileModel();
    const answeredCount = Object.keys(state.answers).length;

    if (profile.scoredSignals.length === 0) {
      appCard.innerHTML = `
        <div class="completion-mark">?</div>

        <h2>We need a few answers to build your Explorer Profile.</h2>

        <p>
          You skipped all ${data.questions.length} scored questions, so there
          isn't enough information yet to calculate your Explorer Signals.
        </p>

        <div class="button-row">
          <button id="no-results-back" class="secondary-button" type="button">
            Review Answers
          </button>

          <button id="start-over" class="primary-button" type="button">
            Start Over
          </button>
        </div>
      `;

      document.getElementById("no-results-back").addEventListener("click", () => {
        state.currentQuestionIndex = data.questions.length - 1;
        renderQuestion();
        scrollToCard();
      });

      document.getElementById("start-over").addEventListener("click", () => {
        resetApp();
        scrollToCard();
      });

      return;
    }

    const standoutsMarkup = profile.allTied
      ? `
        <div class="balanced-callout">
          <strong>Your signals are very evenly balanced.</strong>
          <p>
            No single signal stands above the others right now. That can be a
            sign of a broad, flexible Explorer Profile.
          </p>
        </div>
      `
      : `
        <ul class="standout-list">
          ${profile.topSignalItems
            .map(
              (item) => `
                <li>
                  <strong>${escapeHtml(item.label)}:</strong>
                  ${escapeHtml(item.text)}
                </li>
              `
            )
            .join("")}
        </ul>
      `;

    const scoresMarkup = profile.scores
      .map((signal) => {
        const width = Number.isFinite(signal.score)
          ? Math.max(0, Math.min(100, signal.score * 100))
          : 0;

        return `
          <div class="score-row">
            <div class="score-row-heading">
              <span>${escapeHtml(signal.name)}</span>
              <strong>${formatPercent(signal.score)}</strong>
            </div>
            <div class="score-meter" aria-hidden="true">
              <div class="score-meter-fill" style="width: ${width}%"></div>
            </div>
            <div class="score-answer-count">
              ${signal.answered} of ${data.scoring.questionsPerSignal} answered
            </div>
          </div>
        `;
      })
      .join("");

    const qualitativeMarkup = profile.qualitativeText
      ? `
        <section class="profile-section own-words-section">
          <h3>In Your Own Words</h3>
          <blockquote>“${escapeHtml(profile.qualitativeText)}”</blockquote>
        </section>
      `
      : "";

    appCard.innerHTML = `
      <article class="profile-results">
        <header class="profile-results-header">
          <h2>${escapeHtml(getProfileTitle())}</h2>
          <p class="profile-date">
            Generated ${escapeHtml(formatGeneratedDate(new Date()))}
          </p>
        </header>

        <div class="profile-top-grid">
          <section class="profile-section standout-section">
            <h3>What Stands Out</h3>
            ${standoutsMarkup}
          </section>

          <section class="profile-section radar-section">
            <h3>Your Explorer Map</h3>
            <div class="radar-wrap">
              ${buildRadarSvg(profile)}
            </div>
          </section>
        </div>

        ${
          profile.learnBest
            ? `
              <section class="profile-section">
                <h3>How You Learn Best</h3>
                <p>${escapeHtml(profile.learnBest)}</p>
              </section>
            `
            : ""
        }

        <section class="profile-section">
          <h3>How This Fits Together</h3>
          <p>${escapeHtml(profile.integrativeSummary)}</p>
        </section>

        ${qualitativeMarkup}

        <details class="score-details">
          <summary>See all Explorer Signal scores</summary>

          <p class="small-text score-explainer">
            You answered ${answeredCount} of ${data.questions.length} scored questions.
            Scores preserve the same formula used by the original Explorer Profile workbook.
            These are not grades: 80% is the highest possible score in this system.
          </p>

          <div class="score-list">
            ${scoresMarkup}
          </div>
        </details>

        <p class="profile-fluidity-note">
          ${escapeHtml(profile.fluidityNote)}
        </p>

        <div class="privacy-note results-privacy-note">
          <strong>Nothing was submitted.</strong><br>
          This profile was calculated entirely in this browser tab. Refreshing
          or closing the page clears the answers.
        </div>

        <div class="button-row results-button-row">
          <button id="results-back" class="secondary-button" type="button">
            Review Reflection
          </button>

          <button id="start-over" class="primary-button" type="button">
            Start Over
          </button>
        </div>
      </article>
    `;

    document.getElementById("results-back").addEventListener("click", () => {
      renderReflectionScreen();
      scrollToCard();
    });

    document.getElementById("start-over").addEventListener("click", () => {
      resetApp();
      scrollToCard();
    });
  }

  function resetApp() {
    state.name = "";
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.reflectionEnjoy = "";
    state.reflectionSurprise = "";

    renderWelcome();
  }

  renderWelcome();
})();
