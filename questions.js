"use strict";

/*
 * Kids Explore Careers
 * Explorer Profile questionnaire data
 *
 * IMPORTANT:
 * This file contains questionnaire content and scoring rules only.
 * It does NOT contain or store a child's answers.
 */

const EXPLORER_PROFILE_DATA = {

  answerChoices: [
    {
      label: "❌ No, not me",
      value: 0
    },
    {
      label: "🙃 Not really",
      value: 1
    },
    {
      label: "🤔 Sometimes",
      value: 2
    },
    {
      label: "✅ That sounds like me",
      value: 3
    },
    {
      label: "🌟 I LOVE THIS!",
      value: 4
    }
  ],


  /*
   * Preserve the current Explorer Profile scoring method.
   * We will use this when the local scoring engine is added.
   */
  scoring: {
    questionsPerSignal: 5,
    scaleDivisor: 5,
    completenessBase: 0.7,
    completenessBonus: 0.3
  },


  signals: [
    {
      name: "Curiosity",
      family: "Thinking"
    },
    {
      name: "Creativity",
      family: "Thinking"
    },
    {
      name: "Reflection",
      family: "Thinking"
    },
    {
      name: "Initiative",
      family: "Action"
    },
    {
      name: "Persistence",
      family: "Action"
    },
    {
      name: "Reasoning",
      family: "Action"
    },
    {
      name: "Instruction",
      family: "Helping"
    },
    {
      name: "Empathy",
      family: "Helping"
    },
    {
      name: "Collaboration",
      family: "Helping"
    },
    {
      name: "Organization",
      family: "Organization"
    }
  ],


  namePrompt: {
    label: "What should we call you in your Explorer Profile?",
    helpText:
      "You can use your first name, nickname, or leave this blank. Please don't enter your last name.",
    required: false
  },


  sections: [
    {
      id: "enjoy-and-wonder",
      title: "What I Enjoy and Wonder About",
      description:
        "These questions are about what you enjoy, what interests you, and what naturally grabs your attention.",
      startQuestion: 1,
      endQuestion: 10
    },
    {
      id: "how-i-think",
      title: "How I Like to Think",
      description:
        "These questions are about how you think about ideas, choices, and experiences.",
      startQuestion: 11,
      endQuestion: 15
    },
    {
      id: "start-and-keep-going",
      title: "How I Start and Keep Going",
      description:
        "These questions are about how you begin things, stick with them, and grow while working on something over time.",
      startQuestion: 16,
      endQuestion: 25
    },
    {
      id: "solve-problems-and-help",
      title: "How I Solve Problems and Help",
      description:
        "These questions are about how you approach problems, help others, and work on things that matter.",
      startQuestion: 26,
      endQuestion: 35
    },
    {
      id: "others-and-organization",
      title: "How I Work With Others and Stay Organized",
      description:
        "These questions are about how you like to work with people, follow routines, and keep things organized.",
      startQuestion: 36,
      endQuestion: 50
    }
  ],


  questions: [

    {
      id: "Q1",
      number: 1,
      signal: "Curiosity",
      text: "I like asking “why” and wondering how things work."
    },
    {
      id: "Q2",
      number: 2,
      signal: "Curiosity",
      text: "I enjoy learning new things."
    },
    {
      id: "Q3",
      number: 3,
      signal: "Curiosity",
      text: "I get excited when I discover something new on my own."
    },
    {
      id: "Q4",
      number: 4,
      signal: "Curiosity",
      text: "I enjoy figuring out why something works (or doesn’t)."
    },
    {
      id: "Q5",
      number: 5,
      signal: "Curiosity",
      text: "I like learning how the world works."
    },

    {
      id: "Q6",
      number: 6,
      signal: "Creativity",
      text: "I like imagining new worlds, stories, or inventions."
    },
    {
      id: "Q7",
      number: 7,
      signal: "Creativity",
      text: "I like making up stories, games, or ideas."
    },
    {
      id: "Q8",
      number: 8,
      signal: "Creativity",
      text:
        "I enjoy expressing myself through drawing, writing, building, or creating."
    },
    {
      id: "Q9",
      number: 9,
      signal: "Creativity",
      text: "I like turning my ideas into something others can see."
    },
    {
      id: "Q10",
      number: 10,
      signal: "Creativity",
      text: "I enjoy coming up with new ideas or new ways to do things."
    },

    {
      id: "Q11",
      number: 11,
      signal: "Reflection",
      text: "I like thinking about my ideas before doing anything."
    },
    {
      id: "Q12",
      number: 12,
      signal: "Reflection",
      text: "I like taking time to think things through."
    },
    {
      id: "Q13",
      number: 13,
      signal: "Reflection",
      text: "I like thinking about my choices after I’ve made them."
    },
    {
      id: "Q14",
      number: 14,
      signal: "Reflection",
      text: "I learn a lot by thinking about what worked and what didn’t."
    },
    {
      id: "Q15",
      number: 15,
      signal: "Reflection",
      text: "I like thinking about what I could do differently next time."
    },

    {
      id: "Q16",
      number: 16,
      signal: "Initiative",
      text: "I trust my ideas, even if others aren’t sure yet."
    },
    {
      id: "Q17",
      number: 17,
      signal: "Initiative",
      text: "I enjoy starting new projects."
    },
    {
      id: "Q18",
      number: 18,
      signal: "Initiative",
      text: "I like starting things on my own, without being asked."
    },
    {
      id: "Q19",
      number: 19,
      signal: "Initiative",
      text: "I enjoy taking the lead when there’s an idea to try."
    },
    {
      id: "Q20",
      number: 20,
      signal: "Initiative",
      text: "I like taking the first step when there’s something to do."
    },

    {
      id: "Q21",
      number: 21,
      signal: "Persistence",
      text: "I keep working even when I make mistakes."
    },
    {
      id: "Q22",
      number: 22,
      signal: "Persistence",
      text: "I keep trying even when something is hard."
    },
    {
      id: "Q23",
      number: 23,
      signal: "Persistence",
      text: "I keep working even when things take a long time."
    },
    {
      id: "Q24",
      number: 24,
      signal: "Persistence",
      text: "I like sticking with something until it’s done."
    },
    {
      id: "Q25",
      number: 25,
      signal: "Persistence",
      text: "I enjoy finishing what I start."
    },

    {
      id: "Q26",
      number: 26,
      signal: "Reasoning",
      text: "I like fixing things that don’t work."
    },
    {
      id: "Q27",
      number: 27,
      signal: "Reasoning",
      text:
        "I enjoy building things with LEGOs, blocks, or anything I can find."
    },
    {
      id: "Q28",
      number: 28,
      signal: "Reasoning",
      text: "I enjoy learning how things work by trying them."
    },
    {
      id: "Q29",
      number: 29,
      signal: "Reasoning",
      text: "I like figuring things out as I go."
    },
    {
      id: "Q30",
      number: 30,
      signal: "Reasoning",
      text: "I like making something better after it already exists."
    },

    {
      id: "Q31",
      number: 31,
      signal: "Instruction",
      text: "I like breaking things down so they make sense."
    },
    {
      id: "Q32",
      number: 32,
      signal: "Instruction",
      text:
        "I like explaining things step-by-step so they make sense to someone else."
    },
    {
      id: "Q33",
      number: 33,
      signal: "Instruction",
      text: "I enjoy showing someone how to do something."
    },
    {
      id: "Q34",
      number: 34,
      signal: "Instruction",
      text: "I feel good when I help someone learn something new."
    },
    {
      id: "Q35",
      number: 35,
      signal: "Instruction",
      text: "I like being the person others ask for help."
    },

    {
      id: "Q36",
      number: 36,
      signal: "Empathy",
      text: "I notice when someone needs help."
    },
    {
      id: "Q37",
      number: 37,
      signal: "Empathy",
      text: "I like asking, “Do you need help with that?”"
    },
    {
      id: "Q38",
      number: 38,
      signal: "Empathy",
      text: "I like helping people feel better or supported."
    },
    {
      id: "Q39",
      number: 39,
      signal: "Empathy",
      text: "I feel good when I can make someone’s day better."
    },
    {
      id: "Q40",
      number: 40,
      signal: "Empathy",
      text: "Helping others feels important to who I am."
    },

    {
      id: "Q41",
      number: 41,
      signal: "Collaboration",
      text: "I like helping others and being a good teammate."
    },
    {
      id: "Q42",
      number: 42,
      signal: "Collaboration",
      text: "I enjoy working with others to solve problems."
    },
    {
      id: "Q43",
      number: 43,
      signal: "Collaboration",
      text: "I like helping groups work better together."
    },
    {
      id: "Q44",
      number: 44,
      signal: "Collaboration",
      text: "I enjoy sharing ideas and building on others’ ideas."
    },
    {
      id: "Q45",
      number: 45,
      signal: "Collaboration",
      text: "I like being part of a team."
    },

    {
      id: "Q46",
      number: 46,
      signal: "Organization",
      text: "I like keeping track of what I need to do."
    },
    {
      id: "Q47",
      number: 47,
      signal: "Organization",
      text: "I like knowing what comes next."
    },
    {
      id: "Q48",
      number: 48,
      signal: "Organization",
      text:
        "I feel calmer when things are organized or when I know what to expect."
    },
    {
      id: "Q49",
      number: 49,
      signal: "Organization",
      text: "I like having a plan before I start."
    },
    {
      id: "Q50",
      number: 50,
      signal: "Organization",
      text:
        "I feel proud when things are finished, organized, or cleaned up."
    }
  ],


  reflectionQuestions: [
    {
      id: "reflectionEnjoy",
      text:
        "Is there anything else you really enjoy doing, or feel proud of, that we didn’t ask about?",
      helpText:
        "You can write a short answer (one or two sentences) — or skip this question.",
      required: false
    },
    {
      id: "reflectionSurprise",
      text:
        "Did anything surprise you, or make you think differently about yourself, while answering these questions?",
      helpText:
        "You can write a short answer (one or two sentences) — or skip this question.",
      required: false
    }
  ]
};
