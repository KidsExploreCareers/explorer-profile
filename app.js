"use strict";

/*
 * Kids Explore Careers
 * Explorer Profile
 *
 * PRIVACY DESIGN
 *
 * - Answers exist only in JavaScript memory.
 * - No localStorage.
 * - No sessionStorage.
 * - No cookies.
 * - No network submission.
 * - No analytics.
 * - Refreshing or closing the page clears the answers.
 */

(() => {

  const data = EXPLORER_PROFILE_DATA;

  const appCard = document.getElementById("app-card");


  /* ==========================================================
     APP STATE
  ========================================================== */

  const state = {
    name: "",

    currentQuestionIndex: 0,

    answers: {},

    reflectionEnjoy: "",

    reflectionSurprise: ""
  };


  /* ==========================================================
     HELPERS
  ========================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function scrollToCard() {
    appCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }


  function getSectionForQuestion(questionNumber) {

    if (!Array.isArray(data.sections)) {
      return null;
    }

    return (
      data.sections.find(
        (section) =>
          questionNumber >= section.startQuestion &&
          questionNumber <= section.endQuestion
      ) || null
    );
  }


  /* ==========================================================
     WELCOME
  ========================================================== */

  function renderWelcome() {

    appCard.innerHTML = `
      <h2>Discover what stands out about you</h2>

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
        <strong>Your answers stay private.</strong><br>

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
      .getElementById("start-button")
      .addEventListener(
        "click",
        () => {
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
        ${escapeHtml(data.namePrompt.label)}
      </h2>

      <p>
        ${escapeHtml(data.namePrompt.helpText)}
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
        value="${escapeHtml(state.name)}"
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
      .getElementById("name-back")
      .addEventListener(
        "click",
        () => {
          renderWelcome();
          scrollToCard();
        }
      );


    document
      .getElementById("name-next")
      .addEventListener(
        "click",
        () => {

          const input =
            document.getElementById("profile-name");

          state.name =
            input.value.trim();

          state.currentQuestionIndex = 0;

          renderQuestion();

          scrollToCard();
        }
      );
  }


  /* ==========================================================
     QUESTION
  ========================================================== */

  function renderQuestion() {

    const question =
      data.questions[state.currentQuestionIndex];

    if (!question) {
      renderReflectionScreen();
      return;
    }


    const section =
      getSectionForQuestion(question.number);


    const selectedValue =
      state.answers[question.id];


    const answerMarkup =
      data.answerChoices
        .map((choice) => {

          const checked =
            selectedValue !== undefined &&
            Number(selectedValue) === Number(choice.value);


          return `
            <label
              class="answer-option ${checked ? "selected" : ""}"
            >

              <input
                type="radio"
                name="answer"
                value="${choice.value}"
                ${checked ? "checked" : ""}
              >

              <span>
                ${escapeHtml(choice.label)}
              </span>

            </label>
          `;
        })
        .join("");


    const percent =
      Math.round(
        (
          (state.currentQuestionIndex + 1) /
          data.questions.length
        ) * 100
      );


    appCard.innerHTML = `

      <div class="progress-label">
        Question
        ${state.currentQuestionIndex + 1}
        of
        ${data.questions.length}
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


      ${
        section
          ? `
            <div class="section-heading">

              <h3>
                ${escapeHtml(section.title)}
              </h3>

              <p>
                ${escapeHtml(section.description)}
              </p>

            </div>
          `
          : ""
      }


      <h2 class="question-text">
        ${escapeHtml(question.text)}
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
        >
          ${
            state.currentQuestionIndex ===
            data.questions.length - 1
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
      .querySelectorAll('input[name="answer"]')
      .forEach((radio) => {

        radio.addEventListener(
          "change",
          (event) => {

            state.answers[question.id] =
              Number(event.target.value);


            document
              .querySelectorAll(".answer-option")
              .forEach((option) => {
                option.classList.remove("selected");
              });


            event.target
              .closest(".answer-option")
              .classList.add("selected");
          }
        );
      });


    document
      .getElementById("question-back")
      .addEventListener(
        "click",
        () => {
          goBackFromQuestion();
          scrollToCard();
        }
      );


    document
      .getElementById("question-next")
      .addEventListener(
        "click",
        () => {
          goForwardFromQuestion();
          scrollToCard();
        }
      );


    document
      .getElementById("skip-question")
      .addEventListener(
        "click",
        () => {

          delete state.answers[question.id];

          goForwardFromQuestion();

          scrollToCard();
        }
      );
  }


  /* ==========================================================
     QUESTION NAVIGATION
  ========================================================== */

  function goBackFromQuestion() {

    if (state.currentQuestionIndex === 0) {

      renderNameScreen();

      return;
    }


    state.currentQuestionIndex -= 1;

    renderQuestion();
  }


  function goForwardFromQuestion() {

    if (
      state.currentQuestionIndex <
      data.questions.length - 1
    ) {

      state.currentQuestionIndex += 1;

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
        These questions are optional. Share anything that might
        help your Explorer Profile sound more like you.
      </p>


      <div class="privacy-note">

        <strong>
          Keep private information private.
        </strong>

        <br>

        Please don't enter your full name, school, address,
        phone number, email address, or other identifying
        information.

      </div>


      <div class="reflection-field">

        <label
          class="field-label"
          for="reflection-enjoy"
        >
          ${escapeHtml(
            data.reflectionQuestions[0].text
          )}
        </label>


        <p class="small-text">
          ${escapeHtml(
            data.reflectionQuestions[0].helpText
          )}
        </p>


        <textarea
          id="reflection-enjoy"
          class="text-area"
          maxlength="500"
          rows="4"
        >${escapeHtml(state.reflectionEnjoy)}</textarea>

      </div>


      <div class="reflection-field">

        <label
          class="field-label"
          for="reflection-surprise"
        >
          ${escapeHtml(
            data.reflectionQuestions[1].text
          )}
        </label>


        <p class="small-text">
          ${escapeHtml(
            data.reflectionQuestions[1].helpText
          )}
        </p>


        <textarea
          id="reflection-surprise"
          class="text-area"
          maxlength="500"
          rows="4"
        >${escapeHtml(state.reflectionSurprise)}</textarea>

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
          Finish
        </button>

      </div>
    `;


    document
      .getElementById("reflection-back")
      .addEventListener(
        "click",
        () => {

          saveReflectionValues();

          state.currentQuestionIndex =
            data.questions.length - 1;

          renderQuestion();

          scrollToCard();
        }
      );


    document
      .getElementById("reflection-finish")
      .addEventListener(
        "click",
        () => {

          saveReflectionValues();

          renderCompleteScreen();

          scrollToCard();
        }
      );
  }


  function saveReflectionValues() {

    state.reflectionEnjoy =
      document
        .getElementById("reflection-enjoy")
        ?.value
        .trim() || "";


    state.reflectionSurprise =
      document
        .getElementById("reflection-surprise")
        ?.value
        .trim() || "";
  }


  /* ==========================================================
     COMPLETE
  ========================================================== */

  function renderCompleteScreen() {

    const answeredCount =
      Object.keys(state.answers).length;


    appCard.innerHTML = `

      <div class="completion-mark">
        ✓
      </div>


      <h2>
        ${
          state.name
            ? `${escapeHtml(state.name)}, your answers are ready!`
            : "Your answers are ready!"
        }
      </h2>


      <p>
        You answered
        ${answeredCount}
        of
        ${data.questions.length}
        Explorer questions.
      </p>


      <div class="privacy-note">

        <strong>
          Nothing was submitted.
        </strong>

        <br>

        Your answers are still only in this browser tab.

      </div>


      <p>
        Next, we'll use these answers to build your
        Explorer Signals and Explorer Profile.
      </p>


      <div class="button-row">

        <button
          id="complete-back"
          class="secondary-button"
          type="button"
        >
          Review Reflection
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
      .getElementById("complete-back")
      .addEventListener(
        "click",
        () => {

          renderReflectionScreen();

          scrollToCard();
        }
      );


    document
      .getElementById("start-over")
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

    state.name = "";

    state.currentQuestionIndex = 0;

    state.answers = {};

    state.reflectionEnjoy = "";

    state.reflectionSurprise = "";


    renderWelcome();
  }


  /* ==========================================================
     START
  ========================================================== */

  renderWelcome();

})();
