"use strict";

/*
 * Kids Explore Careers
 * Explorer Profile browser app
 *
 * Privacy design:
 * - Answers exist only in JavaScript memory.
 * - Question order exists only in JavaScript memory.
 * - No localStorage or sessionStorage.
 * - No cookies.
 * - No network submission.
 * - No analytics.
 * - Refreshing or closing the page clears everything.
 */

(() => {
  const data = EXPLORER_PROFILE_DATA;
  const narratives = EXPLORER_NARRATIVES;

  const PROFILE_RULES = {
    topThreshold: 0.05,
    bottomThreshold: 0.05,

    reportMinTopSignals: 3,
    reportMaxTopSignals: 5,

    maxLowMicrosInLearnBest: 1,

    integrativeEvenRangeMax: 0.18,
    integrativePeakGapMin: 0.14,
    integrativeStrongPeakMin: 0.78,

    meaningfulReflectionMinWords: 2
  };

  const FAMILY_ORDER = [
    "Thinking",
    "Action",
    "Helping",
    "Organization"
  ];

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
    Thinking: [
      "Curiosity",
      "Creativity",
      "Reflection"
    ],

    Action: [
      "Initiative",
      "Persistence",
      "Reasoning"
    ],

    Helping: [
      "Instruction",
      "Empathy",
      "Collaboration"
    ]
  };

  const QUESTION_LENSES = [
    {
      title: "What I Enjoy and Wonder About",
      description:
        "These questions are about what you enjoy, what interests you, and what naturally grabs your attention.",
      signals: [
        "Curiosity",
        "Creativity"
      ],
      families: [
        "Thinking"
      ]
    },

    {
      title: "How I Like to Think",
      description:
        "These questions are about how you think about ideas, choices, and experiences.",
      signals: [
        "Reflection"
      ],
      families: [
        "Thinking"
      ]
    },

    {
      title: "How I Start and Keep Going",
      description:
        "These questions are about how you begin things, stick with them, and grow while working on something over time.",
      signals: [
        "Initiative",
        "Persistence"
      ],
      families: [
        "Action"
      ]
    },

    {
      title: "How I Solve Problems and Help",
      description:
        "These questions are about how you approach problems, help others, and work on things that matter.",
      signals: [
        "Reasoning",
        "Instruction"
      ],
      families: [
        "Action",
        "Helping"
      ]
    },

    {
      title: "How I Work With Others and Stay Organized",
      description:
        "These questions are about how you like to work with people, follow routines, and keep things organized.",
      signals: [
        "Empathy",
        "Collaboration",
        "Organization"
      ],
      families: [
        "Helping",
        "Organization"
      ]
    }
  ];

  const CLUSTER_RULES = [
    {
      key: "cluster_curiosity_creativity",
      signals: [
        "Curiosity",
        "Creativity"
      ]
    },

    {
      key: "cluster_curiosity_reasoning",
      signals: [
        "Curiosity",
        "Reasoning"
      ]
    },

    {
      key: "cluster_persistence_organization",
      signals: [
        "Persistence",
        "Organization"
      ]
    },

    {
      key: "cluster_empathy_instruction",
      signals: [
        "Empathy",
        "Instruction"
      ]
    },

    {
      key: "cluster_collaboration_empathy",
      signals: [
        "Collaboration",
        "Empathy"
      ]
    }
  ];

  const QUESTION_BY_ID =
    new Map(
      data.questions.map(
        (question) => [
          question.id,
          question
        ]
      )
    );

  const SIGNAL_FAMILY =
    new Map(
      data.signals.map(
        (signal) => [
          signal.name,
          signal.family
        ]
      )
    );

  const state = {
    name: "",

    currentQuestionIndex: 0,

    /*
     * Stores question IDs in the randomized
     * order for this one profile.
     */
    questionOrder: [],

    answers: {},

    reflectionEnjoy: "",
    reflectionSurprise: ""
  };

  const appCard =
    document.getElementById(
      "app-card"
    );

  let scoreDetailsOpenBeforePrint =
    null;


  /* ==========================================================
     GENERAL HELPERS
  ========================================================== */

  function escapeHtml(value) {
    return String(
      value ?? ""
    )
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }


  function toSignalSlug(
    signalName
  ) {
    return String(
      signalName || ""
    )
      .trim()
      .toLowerCase()
      .replaceAll(
        "&",
        "and"
      )
      .replace(
        /[^a-z0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      );
  }


  function ensureSentence(
    value
  ) {
    const text =
      String(
        value || ""
      ).trim();

    if (!text) {
      return "";
    }

    return /[.!?]$/.test(
      text
    )
      ? text
      : `${text}.`;
  }


  function hashString(
    value
  ) {
    const text =
      String(
        value || ""
      );

    let hash = 0;

    for (
      let i = 0;
      i < text.length;
      i += 1
    ) {
      hash =
        ((hash << 5) - hash) +
        text.charCodeAt(i);

      hash |= 0;
    }

    return hash;
  }


  function getProfileSeed() {
    return data.questions
      .map(
        (question) => {
          const value =
            state.answers[
              question.id
            ];

          return value === undefined
            ? `${question.id}:_`
            : `${question.id}:${value}`;
        }
      )
      .join("|");
  }


  function pickNarrativeVariant(
    key,
    seedSuffix = ""
  ) {
    const value =
      narratives[key];

    if (!value) {
      return null;
    }

    if (
      typeof value === "string"
    ) {
      return value;
    }

    const seed =
      `${key}::${getProfileSeed()}::${seedSuffix}`;

    const index =
      Math.abs(
        hashString(seed)
      ) %
      value.length;

    return value[index];
  }


  function scrollToCard() {
    appCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


  /* ==========================================================
     LOCAL RANDOMIZATION
  ========================================================== */

  function randomUnit() {
    if (
      window.crypto &&
      typeof window.crypto
        .getRandomValues ===
        "function"
    ) {
      const array =
        new Uint32Array(1);

      window.crypto
        .getRandomValues(
          array
        );

      return (
        array[0] /
        4294967296
      );
    }

    return Math.random();
  }


  function randomChoice(
    items
  ) {
    if (
      !items ||
      items.length === 0
    ) {
      return null;
    }

    const index =
      Math.floor(
        randomUnit() *
        items.length
      );

    return items[index];
  }


  function shuffledCopy(
    items
  ) {
    const result =
      [...items];

    for (
      let i =
        result.length - 1;
      i > 0;
      i -= 1
    ) {
      const j =
        Math.floor(
          randomUnit() *
          (i + 1)
        );

      [
        result[i],
        result[j]
      ] = [
        result[j],
        result[i]
      ];
    }

    return result;
  }


  /*
   * BALANCED SHUFFLE
   *
   * There are 10 signals with five questions each.
   *
   * We shuffle the five questions inside each
   * signal, then build five randomized rounds.
   *
   * Each round contains one question from each
   * signal. This means approximately every block
   * of 10 questions contains the full range of
   * Explorer Signals.
   *
   * Within each round we also:
   * - avoid repeating the same signal at a boundary
   * - avoid three questions from the same family
   *   in a row
   * - prefer families that have appeared less often
   *   in the last several questions
   *
   * The result still feels random, but is less likely
   * to produce strange clusters that could affect
   * the questionnaire experience.
   */
  function buildBalancedQuestionOrder() {
    const bySignal =
      new Map();

    data.signals.forEach(
      (signal) => {
        bySignal.set(
          signal.name,
          []
        );
      }
    );

    data.questions.forEach(
      (question) => {
        if (
          !bySignal.has(
            question.signal
          )
        ) {
          bySignal.set(
            question.signal,
            []
          );
        }

        bySignal
          .get(
            question.signal
          )
          .push(
            question
          );
      }
    );

    for (
      const [
        signalName,
        questions
      ]
      of bySignal.entries()
    ) {
      bySignal.set(
        signalName,
        shuffledCopy(
          questions
        )
      );
    }

    const roundCount =
      Math.max(
        ...Array.from(
          bySignal.values()
        ).map(
          (questions) =>
            questions.length
        )
      );

    const orderedQuestions =
      [];

    for (
      let round = 0;
      round < roundCount;
      round += 1
    ) {
      let remainingSignals =
        shuffledCopy(
          Array.from(
            bySignal.keys()
          ).filter(
            (signalName) =>
              bySignal
                .get(
                  signalName
                )[round]
          )
        );

      while (
        remainingSignals.length >
        0
      ) {
        const previousQuestion =
          orderedQuestions[
            orderedQuestions.length -
            1
          ];

        const secondPreviousQuestion =
          orderedQuestions[
            orderedQuestions.length -
            2
          ];

        const previousSignal =
          previousQuestion
            ?.signal;

        const previousFamily =
          previousQuestion
            ? SIGNAL_FAMILY.get(
                previousQuestion.signal
              )
            : null;

        const secondPreviousFamily =
          secondPreviousQuestion
            ? SIGNAL_FAMILY.get(
                secondPreviousQuestion.signal
              )
            : null;

        let candidates =
          remainingSignals.filter(
            (signalName) => {
              const family =
                SIGNAL_FAMILY.get(
                  signalName
                );

              const repeatsSignal =
                signalName ===
                previousSignal;

              const makesThreeFamilyRun =
                previousFamily &&
                secondPreviousFamily &&
                family ===
                  previousFamily &&
                family ===
                  secondPreviousFamily;

              return (
                !repeatsSignal &&
                !makesThreeFamilyRun
              );
            }
          );

        /*
         * Relax only the family-run rule
         * if necessary.
         */
        if (
          candidates.length === 0
        ) {
          candidates =
            remainingSignals.filter(
              (signalName) =>
                signalName !==
                previousSignal
            );
        }

        /*
         * Extremely defensive fallback.
         */
        if (
          candidates.length === 0
        ) {
          candidates =
            [...remainingSignals];
        }

        /*
         * Among valid choices, favor a family
         * that has appeared less often recently.
         */
        const recentQuestions =
          orderedQuestions.slice(
            -5
          );

        const recentFamilyCounts =
          new Map();

        FAMILY_ORDER.forEach(
          (family) => {
            recentFamilyCounts.set(
              family,
              0
            );
          }
        );

        recentQuestions.forEach(
          (question) => {
            const family =
              SIGNAL_FAMILY.get(
                question.signal
              );

            recentFamilyCounts.set(
              family,
              (
                recentFamilyCounts.get(
                  family
                ) || 0
              ) + 1
            );
          }
        );

        const minimumRecentCount =
          Math.min(
            ...candidates.map(
              (signalName) =>
                recentFamilyCounts.get(
                  SIGNAL_FAMILY.get(
                    signalName
                  )
                ) || 0
            )
          );

        const balancedCandidates =
          candidates.filter(
            (signalName) =>
              (
                recentFamilyCounts.get(
                  SIGNAL_FAMILY.get(
                    signalName
                  )
                ) || 0
              ) ===
              minimumRecentCount
          );

        const chosenSignal =
          randomChoice(
            balancedCandidates.length
              ? balancedCandidates
              : candidates
          );

        const chosenQuestion =
          bySignal
            .get(
              chosenSignal
            )[round];

        orderedQuestions.push(
          chosenQuestion
        );

        remainingSignals =
          remainingSignals.filter(
            (signalName) =>
              signalName !==
              chosenSignal
          );
      }
    }

    return orderedQuestions.map(
      (question) =>
        question.id
    );
  }


  function ensureQuestionOrder() {
    if (
      state.questionOrder.length ===
      data.questions.length
    ) {
      return;
    }

    state.questionOrder =
      buildBalancedQuestionOrder();
  }


  function getCurrentQuestion() {
    ensureQuestionOrder();

    const questionId =
      state.questionOrder[
        state.currentQuestionIndex
      ];

    return (
      QUESTION_BY_ID.get(
        questionId
      ) || null
    );
  }


  /* ==========================================================
     PRINTING
  ========================================================== */

  function prepareForPrint() {
    const details =
      document.querySelector(
        ".score-details"
      );

    if (!details) {
      return;
    }

    if (
      scoreDetailsOpenBeforePrint ===
      null
    ) {
      scoreDetailsOpenBeforePrint =
        details.open;
    }

    details.open = true;
  }


  function restoreAfterPrint() {
    const details =
      document.querySelector(
        ".score-details"
      );

    if (
      details &&
      scoreDetailsOpenBeforePrint !==
        null
    ) {
      details.open =
        scoreDetailsOpenBeforePrint;
    }

    scoreDetailsOpenBeforePrint =
      null;
  }


  function printProfile() {
    prepareForPrint();

    window.setTimeout(
      () => {
        window.print();
      },
      0
    );
  }


  window.addEventListener(
    "beforeprint",
    prepareForPrint
  );


  window.addEventListener(
    "afterprint",
    restoreAfterPrint
  );


  /* ==========================================================
     WELCOME
  ========================================================== */

  function renderWelcome() {
    appCard.innerHTML = `
      <h2>
        Discover what stands out about you
      </h2>

      <p>
        Answer a series of questions about what you enjoy,
        how you think, how you solve problems, and how you
        work with others.
      </p>

      <p>
        At the end, you'll receive your own Explorer Profile —
        a snapshot of your interests, strengths, and ways
        of learning.
      </p>

      <div class="privacy-note">
        <strong>
          Your answers stay private.
        </strong>

        <br>

        Your questionnaire answers are processed in your browser
        and are not submitted to or stored by Kids Explore Careers.
      </div>

      <button
        id="start-button"
        class="primary-button"
        type="button"
      >
        Create My Explorer Profile
      </button>

      <p class="small-text">
        You can stop at any time. Your answers are not saved
        after you leave or refresh this page.
      </p>
    `;

    document
      .getElementById(
        "start-button"
      )
      .addEventListener(
        "click",
        () => {
          /*
           * Randomize once at the beginning
           * of this profile.
           */
          ensureQuestionOrder();

          renderNameScreen();

          scrollToCard();
        }
      );
  }


  /* ==========================================================
     NAME
  ========================================================== */

  function renderNameScreen() {
    appCard.innerHTML = `
      <div class="progress-label">
        Before we begin
      </div>

      <h2>
        ${escapeHtml(
          data.namePrompt.label
        )}
      </h2>

      <p>
        ${escapeHtml(
          data.namePrompt.helpText
        )}
      </p>

      <label
        class="field-label"
        for="profile-name"
      >
        First name or nickname
      </label>

      <input
        id="profile-name"
        class="text-input"
        type="text"
        maxlength="40"
        autocomplete="off"
        value="${escapeHtml(
          state.name
        )}"
        placeholder="Optional"
      >

      <div class="button-row">

        <button
          id="name-back"
          class="secondary-button"
          type="button"
        >
          Back
        </button>

        <button
          id="name-next"
          class="primary-button"
          type="button"
        >
          Next
        </button>

      </div>
    `;


    document
      .getElementById(
        "name-back"
      )
      .addEventListener(
        "click",
        () => {
          /*
           * Returning to the welcome screen does NOT
           * reshuffle the current profile.
           */
          renderWelcome();

          scrollToCard();
        }
      );


    document
      .getElementById(
        "name-next"
      )
      .addEventListener(
        "click",
        () => {
          state.name =
            document
              .getElementById(
                "profile-name"
              )
              .value
              .trim();

          state.currentQuestionIndex =
            0;

          renderQuestion();

          scrollToCard();
        }
      );
  }


  /* ==========================================================
     QUESTIONS
  ========================================================== */

  function renderQuestion() {
    const question =
      getCurrentQuestion();

    if (!question) {
      renderReflectionScreen();
      return;
    }

    const selectedValue =
      state.answers[
        question.id
      ];

    const hasAnswer =
      selectedValue !==
      undefined;

    const answerMarkup =
      data.answerChoices
        .map(
          (choice) => {
            const checked =
              selectedValue !==
                undefined &&
              Number(
                selectedValue
              ) ===
                Number(
                  choice.value
                );

            return `
              <label
                class="answer-option ${
                  checked
                    ? "selected"
                    : ""
                }"
              >

                <input
                  type="radio"
                  name="answer"
                  value="${
                    choice.value
                  }"
                  ${
                    checked
                      ? "checked"
                      : ""
                  }
                >

                <span>
                  ${escapeHtml(
                    choice.label
                  )}
                </span>

              </label>
            `;
          }
        )
        .join("");

    const percent =
      Math.round(
        (
          (
            state.currentQuestionIndex +
            1
          ) /
          data.questions.length
        ) *
        100
      );

    /*
     * Notice that the old questionnaire
     * theme/section banner is deliberately
     * gone. The child sees the question,
     * not the scoring architecture.
     */
    appCard.innerHTML = `

      <div class="progress-label">
        Question
        ${
          state.currentQuestionIndex +
          1
        }
        of
        ${
          data.questions.length
        }
      </div>


      <div
        class="progress-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${percent}"
        aria-label="Explorer Profile progress"
      >

        <div
          class="progress-fill"
          style="width: ${percent}%"
        ></div>

      </div>


      <h2 class="question-text">
        ${escapeHtml(
          question.text
        )}
      </h2>


      <p class="small-text">
        Choose the answer that feels most like you.
      </p>


      <div class="answer-list">
        ${answerMarkup}
      </div>


      <div class="button-row">

        <button
          id="question-back"
          class="secondary-button"
          type="button"
        >
          Back
        </button>


        <button
          id="question-next"
          class="primary-button"
          type="button"
          ${
            hasAnswer
              ? ""
              : "disabled"
          }
        >
          ${
            state.currentQuestionIndex ===
            data.questions.length -
              1
              ? "Continue"
              : "Next"
          }
        </button>

      </div>


      <button
        id="skip-question"
        class="text-button"
        type="button"
      >
        Skip this question
      </button>
    `;


    document
      .querySelectorAll(
        'input[name="answer"]'
      )
      .forEach(
        (radio) => {
          radio.addEventListener(
            "change",
            (event) => {
              state.answers[
                question.id
              ] =
                Number(
                  event.target.value
                );

              document
                .querySelectorAll(
                  ".answer-option"
                )
                .forEach(
                  (option) => {
                    option
                      .classList
                      .remove(
                        "selected"
                      );
                  }
                );

              event.target
                .closest(
                  ".answer-option"
                )
                .classList
                .add(
                  "selected"
                );

              document
                .getElementById(
                  "question-next"
                )
                .disabled =
                  false;
            }
          );
        }
      );


    document
      .getElementById(
        "question-back"
      )
      .addEventListener(
        "click",
        () => {
          goBackFromQuestion();

          scrollToCard();
        }
      );


    document
      .getElementById(
        "question-next"
      )
      .addEventListener(
        "click",
        () => {
          if (
            !Object.prototype
              .hasOwnProperty
              .call(
                state.answers,
                question.id
              )
          ) {
            return;
          }

          goForwardFromQuestion();

          scrollToCard();
        }
      );


    document
      .getElementById(
        "skip-question"
      )
      .addEventListener(
        "click",
        () => {
          delete state.answers[
            question.id
          ];

          goForwardFromQuestion();

          scrollToCard();
        }
      );
  }


  function goBackFromQuestion() {
    if (
      state.currentQuestionIndex ===
      0
    ) {
      renderNameScreen();

      return;
    }

    state.currentQuestionIndex -=
      1;

    renderQuestion();
  }


  function goForwardFromQuestion() {
    if (
      state.currentQuestionIndex <
      data.questions.length -
        1
    ) {
      state.currentQuestionIndex +=
        1;

      renderQuestion();

      return;
    }

    renderReflectionScreen();
  }


  /* ==========================================================
     REFLECTION
  ========================================================== */

  function renderReflectionScreen() {
    appCard.innerHTML = `

      <div class="progress-label">
        Reflection
      </div>


      <h2>
        You’re almost done.
      </h2>


      <p>
        These questions are optional.
        Share anything that might help
        your Explorer Profile sound
        more like you.
      </p>


      <div class="privacy-note">

        <strong>
          Keep private information private.
        </strong>

        <br>

        Please don't enter your full name,
        school, address, phone number,
        email address, or other identifying
        information.

      </div>


      <div class="reflection-field">

        <label
          class="field-label"
          for="reflection-enjoy"
        >
          ${escapeHtml(
            data
              .reflectionQuestions[0]
              .text
          )}
        </label>


        <p class="small-text">
          ${escapeHtml(
            data
              .reflectionQuestions[0]
              .helpText
          )}
        </p>


        <textarea
          id="reflection-enjoy"
          class="text-area"
          maxlength="500"
          rows="4"
        >${escapeHtml(
          state.reflectionEnjoy
        )}</textarea>

      </div>


      <div class="reflection-field">

        <label
          class="field-label"
          for="reflection-surprise"
        >
          ${escapeHtml(
            data
              .reflectionQuestions[1]
              .text
          )}
        </label>


        <p class="small-text">
          ${escapeHtml(
            data
              .reflectionQuestions[1]
              .helpText
          )}
        </p>


        <textarea
          id="reflection-surprise"
          class="text-area"
          maxlength="500"
          rows="4"
        >${escapeHtml(
          state.reflectionSurprise
        )}</textarea>

      </div>


      <div class="button-row">

        <button
          id="reflection-back"
          class="secondary-button"
          type="button"
        >
          Back
        </button>


        <button
          id="reflection-finish"
          class="primary-button"
          type="button"
        >
          Build My Explorer Profile
        </button>

      </div>
    `;


    document
      .getElementById(
        "reflection-back"
      )
      .addEventListener(
        "click",
        () => {
          saveReflectionValues();

          state.currentQuestionIndex =
            data.questions.length -
            1;

          renderQuestion();

          scrollToCard();
        }
      );


    document
      .getElementById(
        "reflection-finish"
      )
      .addEventListener(
        "click",
        () => {
          saveReflectionValues();

          renderResultsScreen();

          scrollToCard();
        }
      );
  }


  function saveReflectionValues() {
    state.reflectionEnjoy =
      document
        .getElementById(
          "reflection-enjoy"
        )
        ?.value
        .trim() ||
      "";

    state.reflectionSurprise =
      document
        .getElementById(
          "reflection-surprise"
        )
        ?.value
        .trim() ||
      "";
  }


  /* ==========================================================
     SCORING
  ========================================================== */

  function calculateSignalScores() {
    const config =
      data.scoring;

    return data.signals.map(
      (signal) => {
        /*
         * Scoring references the question's
         * signal assignment, NOT its displayed
         * position. Randomizing presentation
         * therefore does not alter the math.
         */
        const questions =
          data.questions.filter(
            (question) =>
              question.signal ===
              signal.name
          );

        const answeredValues =
          questions
            .filter(
              (question) =>
                Object.prototype
                  .hasOwnProperty
                  .call(
                    state.answers,
                    question.id
                  )
            )
            .map(
              (question) =>
                Number(
                  state.answers[
                    question.id
                  ]
                )
            )
            .filter(
              (value) =>
                Number.isFinite(
                  value
                )
            );

        const answered =
          answeredValues.length;

        const raw =
          answeredValues.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          );

        let score = null;

        if (
          answered > 0
        ) {
          const completeness =
            config.completenessBase +
            config.completenessBonus *
              (
                answered /
                config.questionsPerSignal
              );

          score =
            (
              raw /
              (
                answered *
                config.scaleDivisor
              )
            ) *
            completeness;
        }

        return {
          name:
            signal.name,

          family:
            signal.family,

          raw,

          answered,

          score
        };
      }
    );
  }


  function getMaximumPossibleScore() {
    const highestAnswer =
      Math.max(
        ...data.answerChoices.map(
          (choice) =>
            Number(
              choice.value
            )
        )
      );

    return (
      highestAnswer /
      data.scoring.scaleDivisor
    );
  }


  function getVisualScorePercent(
    score
  ) {
    if (
      !Number.isFinite(
        score
      )
    ) {
      return 0;
    }

    const maximum =
      getMaximumPossibleScore();

    if (
      maximum <= 0
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        100,
        (
          score /
          maximum
        ) *
          100
      )
    );
  }


  /* ==========================================================
     RANKING
  ========================================================== */

  function getDistinctScoreGroups(
    scoredSignals
  ) {
    const sortedLevels =
      [];

    scoredSignals
      .map(
        (signal) =>
          signal.score
      )
      .sort(
        (a, b) =>
          b - a
      )
      .forEach(
        (score) => {
          if (
            !sortedLevels.some(
              (level) =>
                Math.abs(
                  level -
                  score
                ) <
                1e-12
            )
          ) {
            sortedLevels.push(
              score
            );
          }
        }
      );

    return sortedLevels
      .slice(
        0,
        3
      )
      .map(
        (level) => ({
          score:
            level,

          signals:
            scoredSignals
              .filter(
                (signal) =>
                  Math.abs(
                    signal.score -
                    level
                  ) <
                  1e-12
              )
              .map(
                (signal) =>
                  signal.name
              )
        })
      );
  }


  /* ==========================================================
     NARRATIVE LOGIC
  ========================================================== */

  function getScoreForSignal(
    scores,
    signalName
  ) {
    return (
      scores.find(
        (signal) =>
          signal.name ===
          signalName
      )?.score ??
      null
    );
  }


  function chooseBestCluster(
    standoutSignals,
    scores
  ) {
    const standoutSet =
      new Set(
        standoutSignals
      );

    const candidates =
      CLUSTER_RULES
        .filter(
          (cluster) =>
            cluster.signals.every(
              (signalName) =>
                standoutSet.has(
                  signalName
                )
            ) &&
            narratives[
              cluster.key
            ]
        )
        .map(
          (
            cluster,
            index
          ) => {
            const strength =
              cluster.signals.reduce(
                (
                  sum,
                  signalName
                ) => {
                  const score =
                    getScoreForSignal(
                      scores,
                      signalName
                    );

                  return (
                    sum +
                    (
                      Number.isFinite(
                        score
                      )
                        ? score
                        : 0
                    )
                  );
                },
                0
              );

            return {
              ...cluster,
              strength,
              index
            };
          }
        );

    if (
      candidates.length ===
      0
    ) {
      return null;
    }

    candidates.sort(
      (a, b) =>
        b.strength -
          a.strength ||
        a.index -
          b.index
    );

    return candidates[0];
  }


  function buildLearnBestNarrative({
    standoutSignals,
    bottomSignals,
    scores,
    allTied
  }) {
    if (
      allTied ||
      standoutSignals.length ===
        0
    ) {
      return (
        narratives
          .cluster_fallback ||
        ""
      );
    }

    const parts = [];

    const cluster =
      chooseBestCluster(
        standoutSignals,
        scores
      );

    if (cluster) {
      parts.push(
        ensureSentence(
          narratives[
            cluster.key
          ]
        )
      );
    }

    let microSignals =
      standoutSignals;

    if (cluster) {
      const outsideCluster =
        standoutSignals.filter(
          (signalName) =>
            !cluster.signals
              .includes(
                signalName
              )
        );

      microSignals =
        outsideCluster.length >
        0
          ? outsideCluster
          : cluster.signals.slice(
              0,
              1
            );
    }

    const highMicroCount =
      cluster
        ? 1
        : 2;

    microSignals
      .slice(
        0,
        highMicroCount
      )
      .forEach(
        (signalName) => {
          const slug =
            toSignalSlug(
              signalName
            );

          const text =
            pickNarrativeVariant(
              `micro_${slug}_high`,
              "learn-best"
            );

          if (text) {
            parts.push(
              ensureSentence(
                text
              )
            );
          }
        }
      );

    const lowSignal =
      bottomSignals.find(
        (signalName) =>
          !standoutSignals
            .includes(
              signalName
            )
      );

    if (
      lowSignal &&
      PROFILE_RULES
        .maxLowMicrosInLearnBest >
        0
    ) {
      const slug =
        toSignalSlug(
          lowSignal
        );

      const lowText =
        pickNarrativeVariant(
          `micro_${slug}_low`,
          "learn-best-low"
        );

      if (lowText) {
        parts.push(
          ensureSentence(
            lowText
          )
        );
      }
    }

    return parts.join(
      " "
    );
  }


  function buildNextStep(
    scores,
    allTied
  ) {
    const scored =
      scores.filter(
        (signal) =>
          Number.isFinite(
            signal.score
          )
      );

    if (
      scored.length === 0
    ) {
      return "";
    }

    if (allTied) {
      return (
        "Choose one question from this profile that caught your attention, " +
        "and try a small activity connected to it. Notice what feels fun, " +
        "interesting, or worth exploring again."
      );
    }

    const maximum =
      Math.max(
        ...scored.map(
          (signal) =>
            signal.score
        )
      );

    /*
     * Uses the established signal order,
     * not randomized question order,
     * as the tie-break.
     */
    const strongest =
      data.signals
        .map(
          (definition) =>
            scored.find(
              (signal) =>
                signal.name ===
                definition.name
            )
        )
        .filter(Boolean)
        .find(
          (signal) =>
            Math.abs(
              signal.score -
              maximum
            ) <
            1e-12
        );

    if (!strongest) {
      return "";
    }

    const slug =
      toSignalSlug(
        strongest.name
      );

    return (
      narratives[
        `next_step_${slug}`
      ] ||
      ""
    );
  }


  function buildTopSignalItems(
    standoutSignals
  ) {
    return standoutSignals.map(
      (signalName) => {
        const slug =
          toSignalSlug(
            signalName
          );

        const microText =
          pickNarrativeVariant(
            `micro_${slug}_high`,
            "top"
          );

        if (microText) {
          return {
            label:
              signalName,

            text:
              microText
          };
        }

        const detailKey =
          `signal_${slug}_high`;

        const summaryKey =
          `signal_${slug}_summary`;

        return {
          label:
            signalName,

          text:
            narratives[
              detailKey
            ] ||
            narratives[
              summaryKey
            ] ||
            ""
        };
      }
    );
  }


  /* ==========================================================
     INTEGRATIVE SUMMARY
  ========================================================== */

  function computeIntegrativeKey(
    scores
  ) {
    const radarScores =
      RADAR_ORDER
        .map(
          (signalName) =>
            scores.find(
              (signal) =>
                signal.name ===
                signalName
            )?.score
        )
        .filter(
          (score) =>
            Number.isFinite(
              score
            )
        );

    if (
      radarScores.length <
      3
    ) {
      return null;
    }

    const sorted =
      [...radarScores]
        .sort(
          (a, b) =>
            b - a
        );

    const max =
      sorted[0];

    const second =
      sorted[1];

    const min =
      sorted[
        sorted.length - 1
      ];

    const range =
      max - min;

    const topGap =
      max - second;

    if (
      topGap >=
        PROFILE_RULES
          .integrativePeakGapMin &&
      max >=
        PROFILE_RULES
          .integrativeStrongPeakMin
    ) {
      return (
        "integrative_strong_peak"
      );
    }

    if (
      range <=
      PROFILE_RULES
        .integrativeEvenRangeMax
    ) {
      return (
        "integrative_broad_explorer_even"
      );
    }

    return (
      "integrative_broad_explorer_with_peaks"
    );
  }


  function buildIntegrativeSummary(
    scores
  ) {
    const key =
      computeIntegrativeKey(
        scores
      );

    if (
      key &&
      narratives[key]
    ) {
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

    for (
      const narrativeKey
      of preferred
    ) {
      if (
        narratives[
          narrativeKey
        ]
      ) {
        return (
          narratives[
            narrativeKey
          ]
        );
      }
    }

    return "";
  }


  /* ==========================================================
     QUALITATIVE RESPONSES
  ========================================================== */

  function normalizeQualitative(
    value
  ) {
    let text =
      String(
        value || ""
      )
        .trim()
        .toLowerCase();

    if (!text) {
      return "";
    }

    text =
      text.replace(
        /[’“”]/g,
        "'"
      );

    text =
      text.replace(
        /\bn\s*\/\s*a\b/g,
        "na"
      );

    text =
      text.replace(
        /\bn\s*a\b/g,
        "na"
      );

    text =
      text.replace(
        /\bnot\s*applicable\b/g,
        "na"
      );

    text =
      text.replace(
        /[^a-z0-9\s]/g,
        " "
      );

    text =
      text.replace(
        /\s+/g,
        " "
      ).trim();

    return text;
  }


  function isNonAnswerQualitative(
    normalized
  ) {
    if (!normalized) {
      return true;
    }

    const nonAnswers =
      new Set([
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

    if (
      nonAnswers.has(
        normalized
      )
    ) {
      return true;
    }

    if (
      /^no(\s+(thanks|thank you))?$/
        .test(
          normalized
        )
    ) {
      return true;
    }

    return false;
  }


  function isMeaningfulQualitative(
    value
  ) {
    const normalized =
      normalizeQualitative(
        value
      );

    if (
      isNonAnswerQualitative(
        normalized
      )
    ) {
      return false;
    }

    const wordCount =
      normalized
        ? normalized
            .split(" ")
            .filter(Boolean)
            .length
        : 0;

    return (
      wordCount >
      PROFILE_RULES
        .meaningfulReflectionMinWords
    );
  }


  function buildQualitativeText() {
    const blocks = [];

    if (
      isMeaningfulQualitative(
        state.reflectionEnjoy
      )
    ) {
      blocks.push(
        state
          .reflectionEnjoy
          .trim()
      );
    }

    if (
      isMeaningfulQualitative(
        state.reflectionSurprise
      )
    ) {
      blocks.push(
        state
          .reflectionSurprise
          .trim()
      );
    }

    return blocks.join(
      " — "
    );
  }


  /* ==========================================================
     PROFILE MODEL
  ========================================================== */

  function buildProfileModel() {
    const scores =
      calculateSignalScores();

    const scoredSignals =
      scores.filter(
        (signal) =>
          signal.score !==
          null
      );

    if (
      scoredSignals.length ===
      0
    ) {
      return {
        scores,
        scoredSignals,

        allTied:
          false,

        workbookTopSignals:
          [],

        bottomSignals:
          [],

        topGroups:
          [],

        standoutSignals:
          [],

        topSignalItems:
          [],

        learnBest:
          "",

        integrativeSummary:
          "",

        nextStep:
          "",

        fluidityNote:
          pickNarrativeVariant(
            "profile_fluidity_note",
            "fluidity"
          ) || "",

        qualitativeText:
          buildQualitativeText()
      };
    }

    const maxScore =
      Math.max(
        ...scoredSignals.map(
          (signal) =>
            signal.score
        )
      );

    const minScore =
      Math.min(
        ...scoredSignals.map(
          (signal) =>
            signal.score
        )
      );

    /*
     * All AVAILABLE signal scores tying is
     * treated as a balanced profile.
     *
     * A completely skipped signal remains
     * excluded rather than being treated as 0.
     */
    const allTied =
      scoredSignals.length >
        1 &&
      Math.abs(
        maxScore -
        minScore
      ) <
        1e-12;

    const workbookTopSignals =
      allTied
        ? []
        : scoredSignals
            .filter(
              (signal) =>
                maxScore -
                  signal.score <=
                PROFILE_RULES
                  .topThreshold +
                  1e-12
            )
            .map(
              (signal) =>
                signal.name
            );

    const bottomSignals =
      allTied
        ? []
        : scoredSignals
            .filter(
              (signal) =>
                signal.score -
                  minScore <=
                PROFILE_RULES
                  .bottomThreshold +
                  1e-12
            )
            .map(
              (signal) =>
                signal.name
            );

    const topGroups =
      getDistinctScoreGroups(
        scoredSignals
      );

    const standoutSignals =
      [];

    const seen =
      new Set();

    function addSignals(
      signalNames
    ) {
      signalNames.forEach(
        (signalName) => {
          if (
            standoutSignals.length >=
            PROFILE_RULES
              .reportMaxTopSignals
          ) {
            return;
          }

          if (
            seen.has(
              signalName
            )
          ) {
            return;
          }

          seen.add(
            signalName
          );

          standoutSignals.push(
            signalName
          );
        }
      );
    }

    if (!allTied) {
      addSignals(
        workbookTopSignals
      );

      if (
        standoutSignals.length <
        PROFILE_RULES
          .reportMinTopSignals
      ) {
        for (
          const group
          of topGroups
        ) {
          addSignals(
            group.signals
          );

          if (
            standoutSignals.length >=
            PROFILE_RULES
              .reportMinTopSignals
          ) {
            break;
          }
        }
      }
    }

    const topSignalItems =
      buildTopSignalItems(
        standoutSignals
      );

    const learnBest =
      buildLearnBestNarrative({
        standoutSignals,
        bottomSignals,
        scores,
        allTied
      });

    const integrativeSummary =
      buildIntegrativeSummary(
        scores
      );

    const nextStep =
      buildNextStep(
        scores,
        allTied
      );

    const fluidityNote =
      pickNarrativeVariant(
        "profile_fluidity_note",
        "fluidity"
      ) ||
      "";

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
      nextStep,

      fluidityNote,

      qualitativeText:
        buildQualitativeText()
    };
  }


  /* ==========================================================
     DISPLAY HELPERS
  ========================================================== */

  function formatPercent(
    score
  ) {
    if (
      !Number.isFinite(
        score
      )
    ) {
      return "—";
    }

    const value =
      score * 100;

    const roundedInteger =
      Math.round(
        value
      );

    if (
      Math.abs(
        value -
        roundedInteger
      ) <
      1e-9
    ) {
      return (
        `${roundedInteger}%`
      );
    }

    return (
      `${value.toFixed(1)}%`
    );
  }


  function formatGeneratedDate(
    date
  ) {
    return date.toLocaleString(
      undefined,
      {
        month:
          "long",

        day:
          "numeric",

        year:
          "numeric",

        hour:
          "numeric",

        minute:
          "2-digit"
      }
    );
  }


  function getProfileTitle() {
    if (!state.name) {
      return (
        "Your Explorer Profile"
      );
    }

    const possessive =
      state.name
        .toLowerCase()
        .endsWith("s")
        ? `${state.name}’`
        : `${state.name}’s`;

    return (
      `${possessive} Explorer Profile`
    );
  }


  function familyCssSlug(
    family
  ) {
    return String(
      family || ""
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      );
  }


  /* ==========================================================
     RADAR MAP
  ========================================================== */

  function buildRadarSvg(
    profile
  ) {
    const width = 470;
    const height = 405;

    const centerX = 235;
    const centerY = 175;

    const radius = 126;
    const labelRadius = 165;

    const scoreMap =
      new Map(
        profile.scores.map(
          (signal) => [
            signal.name,
            signal.score
          ]
        )
      );

    const standoutSet =
      new Set(
        profile.standoutSignals
      );

    function polarPoint(
      index,
      distance
    ) {
      const angle =
        (
          -90 +
          (
            index *
            360
          ) /
          RADAR_ORDER.length
        ) *
        Math.PI /
        180;

      return {
        x:
          centerX +
          Math.cos(
            angle
          ) *
            distance,

        y:
          centerY +
          Math.sin(
            angle
          ) *
            distance
      };
    }

    function pointsForSignalNames(
      signalNames
    ) {
      return signalNames
        .map(
          (signalName) => {
            const index =
              RADAR_ORDER.indexOf(
                signalName
              );

            const score =
              scoreMap.get(
                signalName
              );

            if (
              index < 0 ||
              !Number.isFinite(
                score
              )
            ) {
              return null;
            }

            const point =
              polarPoint(
                index,
                radius *
                  score
              );

            return {
              ...point,
              signalName
            };
          }
        )
        .filter(
          Boolean
        );
    }

    function pathForPoints(
      points,
      closePath
    ) {
      if (
        points.length ===
        0
      ) {
        return "";
      }

      const commands = [
        `M ${
          points[0]
            .x
            .toFixed(2)
        } ${
          points[0]
            .y
            .toFixed(2)
        }`
      ];

      for (
        let index = 1;
        index <
        points.length;
        index += 1
      ) {
        commands.push(
          `L ${
            points[index]
              .x
              .toFixed(2)
          } ${
            points[index]
              .y
              .toFixed(2)
          }`
        );
      }

      if (
        closePath &&
        points.length >= 3
      ) {
        commands.push(
          "Z"
        );
      }

      return commands.join(
        " "
      );
    }

    const organizationScore =
      scoreMap.get(
        "Organization"
      );

    let organizationPath =
      "";

    if (
      Number.isFinite(
        organizationScore
      )
    ) {
      const points =
        RADAR_ORDER.map(
          (
            _,
            index
          ) =>
            polarPoint(
              index,
              radius *
                organizationScore
            )
        );

      organizationPath = `
        <path
          class="radar-line radar-organization"
          d="${
            pathForPoints(
              points,
              true
            )
          }"
        />
      `;
    }

    const familyClass = {
      Thinking:
        "radar-thinking",

      Action:
        "radar-action",

      Helping:
        "radar-helping"
    };

    const familyPaths =
      Object.entries(
        RADAR_FAMILIES
      )
        .map(
          (
            [
              familyName,
              signalNames
            ]
          ) => {
            const points =
              pointsForSignalNames(
                signalNames
              );

            const closePath =
              points.length ===
              signalNames.length;

            if (
              points.length <
              2
            ) {
              return "";
            }

            const circles =
              points
                .map(
                  (point) => `
                    <circle
                      class="radar-point ${
                        familyClass[
                          familyName
                        ]
                      }-point"
                      cx="${
                        point.x.toFixed(
                          2
                        )
                      }"
                      cy="${
                        point.y.toFixed(
                          2
                        )
                      }"
                      r="5"
                    />
                  `
                )
                .join("");

            return `
              <path
                class="radar-line ${
                  familyClass[
                    familyName
                  ]
                }"
                d="${
                  pathForPoints(
                    points,
                    closePath
                  )
                }"
              />

              ${circles}
            `;
          }
        )
        .join("");

    const labels =
      RADAR_ORDER
        .map(
          (
            signalName,
            index
          ) => {
            const point =
              polarPoint(
                index,
                labelRadius
              );

            const deltaX =
              point.x -
              centerX;

            let anchor =
              "middle";

            if (
              deltaX > 35
            ) {
              anchor =
                "start";
            }

            if (
              deltaX < -35
            ) {
              anchor =
                "end";
            }

            const topClass =
              standoutSet.has(
                signalName
              )
                ? " radar-label-top"
                : "";

            return `
              <text
                class="radar-label${topClass}"
                x="${
                  point.x.toFixed(2)
                }"
                y="${
                  point.y.toFixed(2)
                }"
                text-anchor="${anchor}"
                dominant-baseline="middle"
              >${
                escapeHtml(
                  signalName
                )
              }</text>
            `;
          }
        )
        .join("");

    const organizationLegendClass =
      standoutSet.has(
        "Organization"
      )
        ? " legend-label-top"
        : "";

    return `
      <svg
        class="radar-svg"
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-labelledby="radar-title radar-desc"
      >

        <title id="radar-title">
          Explorer Map
        </title>

        <desc id="radar-desc">
          A nine-spoke radar map showing Thinking,
          Action, Helping, and Organization signal patterns.
        </desc>

        ${organizationPath}

        ${familyPaths}

        ${labels}


        <g
          class="radar-legend"
          transform="translate(62 372)"
        >

          <circle
            class="legend-dot legend-thinking"
            cx="0"
            cy="0"
            r="5"
          ></circle>

          <text
            x="12"
            y="1"
          >
            Thinking
          </text>


          <circle
            class="legend-dot legend-action"
            cx="95"
            cy="0"
            r="5"
          ></circle>

          <text
            x="107"
            y="1"
          >
            Action
          </text>


          <circle
            class="legend-dot legend-helping"
            cx="169"
            cy="0"
            r="5"
          ></circle>

          <text
            x="181"
            y="1"
          >
            Helping
          </text>


          <line
            class="legend-org-line"
            x1="262"
            y1="0"
            x2="277"
            y2="0"
          ></line>

          <text
            class="${organizationLegendClass}"
            x="285"
            y="1"
          >
            Organization
          </text>

        </g>

      </svg>
    `;
  }


  /* ==========================================================
     PAGE 2 SCORE / METHODOLOGY MARKUP
  ========================================================== */

  function buildScoreRowMarkup(
    signal
  ) {
    const width =
      getVisualScorePercent(
        signal.score
      );

    let answerCountText;

    if (
      signal.answered ===
      0
    ) {
      answerCountText =
        "No answered questions — not included in ranking or the Explorer Map.";
    } else if (
      signal.answered <
      data.scoring
        .questionsPerSignal
    ) {
      answerCountText =
        `Based on ${
          signal.answered
        } of ${
          data.scoring
            .questionsPerSignal
        } questions.`;
    } else {
      answerCountText =
        `Based on all ${
          data.scoring
            .questionsPerSignal
        } questions.`;
    }

    const incompleteClass =
      signal.answered <
      data.scoring
        .questionsPerSignal
        ? " incomplete"
        : "";

    const familySlug =
      familyCssSlug(
        signal.family
      );

    return `
      <div class="score-row">

        <div class="score-row-heading">

          <span class="score-name">
            ${escapeHtml(
              signal.name
            )}
          </span>

          <strong>
            ${formatPercent(
              signal.score
            )}
          </strong>

        </div>


        <div
          class="score-meter"
          aria-hidden="true"
        >
          <div
            class="score-meter-fill score-fill-${familySlug}"
            style="width: ${width}%"
          ></div>
        </div>


        <div
          class="score-answer-count${incompleteClass}"
        >
          ${escapeHtml(
            answerCountText
          )}
        </div>

      </div>
    `;
  }


  function buildScoreGroupsMarkup(
    profile
  ) {
    return FAMILY_ORDER
      .map(
        (family) => {
          const familySignals =
            profile.scores.filter(
              (signal) =>
                signal.family ===
                family
            );

          const familySlug =
            familyCssSlug(
              family
            );

          return `
            <section
              class="score-family-panel score-family-${familySlug}"
            >

              <h4>
                ${escapeHtml(
                  family
                )}
              </h4>

              <div class="score-family-rows">

                ${
                  familySignals
                    .map(
                      buildScoreRowMarkup
                    )
                    .join("")
                }

              </div>

            </section>
          `;
        }
      )
      .join("");
  }


  function buildMethodologyMarkup() {
    const lensCards =
      QUESTION_LENSES
        .map(
          (lens) => `
            <article class="methodology-lens">

              <h4>
                ${escapeHtml(
                  lens.title
                )}
              </h4>

              <p>
                ${escapeHtml(
                  lens.description
                )}
              </p>

              <p class="methodology-map">
                <strong>
                  Signals:
                </strong>

                ${escapeHtml(
                  lens.signals.join(
                    " · "
                  )
                )}

                <br>

                <strong>
                  ${
                    lens.families.length ===
                    1
                      ? "Family"
                      : "Families"
                  }:
                </strong>

                ${escapeHtml(
                  lens.families.join(
                    " + "
                  )
                )}
              </p>

            </article>
          `
        )
        .join("");

    return `
      <section class="methodology-section">

        <h3>
          How Your Explorer Profile Works
        </h3>

        <p class="methodology-intro">
          The 50 questions were designed around five broad
          ways of exploring interests, learning, problem-solving,
          helping, and organization. The questions are mixed into
          a balanced random order each time a new Explorer Profile
          begins, but every question still contributes only to its
          assigned Explorer Signal.
        </p>

        <p class="methodology-intro">
          Each of the 10 Explorer Signals is based on five questions.
          Those signals are grouped into four larger families:
          <strong>Thinking</strong>,
          <strong>Action</strong>,
          <strong>Helping</strong>, and
          <strong>Organization</strong>.
          The five lenses below guided the question design; they
          intentionally overlap across the four result families.
        </p>

        <div class="methodology-grid">
          ${lensCards}
        </div>

      </section>
    `;
  }


  /* ==========================================================
     RESULTS
  ========================================================== */

  function renderResultsScreen() {
    const profile =
      buildProfileModel();

    const answeredCount =
      Object.keys(
        state.answers
      ).length;

    if (
      profile
        .scoredSignals
        .length ===
      0
    ) {
      appCard.innerHTML = `

        <div class="completion-mark">
          ?
        </div>

        <h2>
          We need a few answers to build your Explorer Profile.
        </h2>

        <p>
          You skipped all
          ${data.questions.length}
          scored questions, so there isn't enough information
          yet to calculate your Explorer Signals.
        </p>

        <div class="button-row">

          <button
            id="no-results-back"
            class="secondary-button"
            type="button"
          >
            Review Answers
          </button>

          <button
            id="start-over"
            class="primary-button"
            type="button"
          >
            Start Over
          </button>

        </div>
      `;

      document
        .getElementById(
          "no-results-back"
        )
        .addEventListener(
          "click",
          () => {
            state.currentQuestionIndex =
              data.questions.length -
              1;

            renderQuestion();

            scrollToCard();
          }
        );

      document
        .getElementById(
          "start-over"
        )
        .addEventListener(
          "click",
          () => {
            resetApp();

            scrollToCard();
          }
        );

      return;
    }

    const incompleteSignals =
      profile.scores.filter(
        (signal) =>
          signal.answered <
          data.scoring
            .questionsPerSignal
      );

    const radarNote =
      incompleteSignals.length >
      0
        ? `
          <p class="radar-note">
            Some areas are based on fewer answers.
            Signals with no answers are left out of
            the map and rankings.
          </p>
        `
        : "";

    const standoutsMarkup =
      profile.allTied
        ? `
          <div class="balanced-callout">

            <strong>
              Your signals are very evenly balanced.
            </strong>

            <p>
              No single signal stands above the others
              right now. That can be a sign of a broad,
              flexible Explorer Profile.
            </p>

          </div>
        `
        : `
          <ul class="standout-list">

            ${
              profile
                .topSignalItems
                .map(
                  (item) => `
                    <li>
                      <strong>
                        ${escapeHtml(
                          item.label
                        )}:
                      </strong>

                      ${escapeHtml(
                        item.text
                      )}
                    </li>
                  `
                )
                .join("")
            }

          </ul>
        `;

    const qualitativeMarkup =
      profile.qualitativeText
        ? `
          <section
            class="profile-section own-words-section"
          >

            <h3>
              In Your Own Words
            </h3>

            <blockquote>
              “${escapeHtml(
                profile
                  .qualitativeText
              )}”
            </blockquote>

          </section>
        `
        : "";

    const nextStepMarkup =
      profile.nextStep
        ? `
          <section
            class="profile-section next-step-section"
          >

            <h3>
              Something to Explore Next
            </h3>

            <p>
              ${escapeHtml(
                profile.nextStep
              )}
            </p>

          </section>
        `
        : "";

    const maximumPossibleScore =
      getMaximumPossibleScore();

    const scoreGroupsMarkup =
      buildScoreGroupsMarkup(
        profile
      );

    const methodologyMarkup =
      buildMethodologyMarkup();

    appCard.innerHTML = `

      <article class="profile-results">


        <header class="profile-results-header">

          <p class="print-brand">
            Kids Explore Careers
          </p>

          <h2>
            ${escapeHtml(
              getProfileTitle()
            )}
          </h2>

          <p class="profile-date">
            Generated
            ${escapeHtml(
              formatGeneratedDate(
                new Date()
              )
            )}
          </p>

        </header>


        <div class="profile-top-grid">


          <section
            class="profile-section standout-section"
          >

            <h3>
              What Stands Out
            </h3>

            ${standoutsMarkup}

          </section>


          <section
            class="profile-section radar-section"
          >

            <h3>
              Your Explorer Map
            </h3>

            <div class="radar-wrap">
              ${buildRadarSvg(
                profile
              )}
            </div>

            ${radarNote}

          </section>

        </div>


        ${
          profile.learnBest
            ? `
              <section class="profile-section">

                <h3>
                  How You Learn Best
                </h3>

                <p>
                  ${escapeHtml(
                    profile.learnBest
                  )}
                </p>

              </section>
            `
            : ""
        }


        <section class="profile-section">

          <h3>
            How This Fits Together
          </h3>

          <p>
            ${escapeHtml(
              profile
                .integrativeSummary
            )}
          </p>

        </section>


        ${qualitativeMarkup}


        ${nextStepMarkup}


        <p class="profile-fluidity-note">
          ${escapeHtml(
            profile.fluidityNote
          )}
        </p>


        <details class="score-details">

          <summary>
            See all Explorer Signal scores
          </summary>


          <div class="score-page-header">

            <p class="print-brand">
              Kids Explore Careers
            </p>

            <h3 class="print-score-title">
              Your Explorer Signals
            </h3>

          </div>


          <div class="signals-not-grades">

            <strong>
              These are signals, not grades.
            </strong>

            <p>
              A higher score means an idea felt more like you
              when you answered today. A lower score does not
              mean you are bad at something.
              ${
                formatPercent(
                  maximumPossibleScore
                )
              }
              is the highest possible score in this system.
            </p>

          </div>


          <p class="small-text score-explainer">
            You answered
            ${answeredCount}
            of
            ${data.questions.length}
            scored questions.

            The bars are scaled so the highest possible score
            fills the bar completely. A signal with no answered
            questions is shown as unanswered and is not included
            in rankings or the Explorer Map.
          </p>


          <div class="score-family-grid">
            ${scoreGroupsMarkup}
          </div>


          ${methodologyMarkup}

        </details>


        <div
          class="privacy-note results-privacy-note"
        >

          <strong>
            Nothing was submitted.
          </strong>

          <br>

          This profile was calculated entirely in this browser tab.
          Refreshing or closing the page clears the answers.

        </div>


        <div
          class="button-row results-button-row"
        >

          <button
            id="results-back"
            class="secondary-button"
            type="button"
          >
            Review Reflection
          </button>


          <button
            id="print-profile"
            class="secondary-button print-button"
            type="button"
          >
            Print / Save as PDF
          </button>


          <button
            id="start-over"
            class="primary-button"
            type="button"
          >
            Start Over
          </button>

        </div>

      </article>
    `;


    document
      .getElementById(
        "results-back"
      )
      .addEventListener(
        "click",
        () => {
          renderReflectionScreen();

          scrollToCard();
        }
      );


    document
      .getElementById(
        "print-profile"
      )
      .addEventListener(
        "click",
        printProfile
      );


    document
      .getElementById(
        "start-over"
      )
      .addEventListener(
        "click",
        () => {
          resetApp();

          scrollToCard();
        }
      );
  }


  /* ==========================================================
     RESET
  ========================================================== */

  function resetApp() {
    state.name =
      "";

    state.currentQuestionIndex =
      0;

    /*
     * Clearing this is what causes a brand-new
     * randomized order the next time Start is clicked.
     */
    state.questionOrder =
      [];

    state.answers =
      {};

    state.reflectionEnjoy =
      "";

    state.reflectionSurprise =
      "";

    renderWelcome();
  }


  /* ==========================================================
     START
  ========================================================== */

  renderWelcome();

})();
