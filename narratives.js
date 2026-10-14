"use strict";

/*
 * Kids Explore Careers
 * Explorer Profile narrative library
 *
 * Extracted from the existing Narrative Library sheet.
 * This file contains the full narrative-key library from the workbook.
 * Static text only; no child data is stored here.
 */

const EXPLORER_NARRATIVES = {
  "signal_curiosity_summary": "Curiosity describes how you notice the world around you and how interested you feel in learning more about things that catch your attention. It often shows up through asking questions, wondering how things work, or exploring ideas in your own way.",
  "signal_curiosity_high": "You enjoy asking questions and exploring ideas that capture your interest, especially when there’s room to wonder, investigate, or dig a little deeper. Noticing details others miss makes learning engaging for you.",
  "signal_creativity_summary": "Creativity describes how you express ideas, thoughts, or feelings in ways that feel natural to you. This can include imagination, storytelling, art, movement, building, or play.",
  "signal_creativity_high": "Expressing ideas in imaginative ways comes naturally to you. It shows up through storytelling, drawing, building, movement, or play—especially when you’re sharing what you think or feel in your own style.",
  "signal_reflection_summary": "Reflection describes how you think about experiences, ideas, or feelings, either during or after they happen. It may involve quiet thinking, noticing patterns, or taking time before responding.",
  "signal_reflection_high": "Taking time to think about experiences, ideas, or feelings matters to you. You notice patterns, value quiet thinking time, and often pause to reflect before sharing your thoughts.",
  "signal_initiative_summary": "Initiative describes how you approach getting started on new tasks or activities. It can include taking the first step independently or feeling ready to begin once things feel clear or inviting.",
  "signal_initiative_high": "Getting started feels comfortable for you. You’re ready to take the first step, try new activities, or explore ideas independently.",
  "signal_persistence_summary": "Persistence describes how you respond when something feels challenging or takes time to complete. It often shows up through sticking with tasks, trying again after setbacks, or choosing when to move on.",
  "signal_persistence_high": "When something matters to you, sticking with it feels worthwhile. Working through challenges, trying again after setbacks, and steadily moving toward finishing something meaningful helps you stay engaged.",
  "signal_reasoning_summary": "Reasoning describes how you like to learn by doing and experimenting. This may include building, fixing, testing ideas, or working with real objects and materials.",
  "signal_reasoning_high": "Learning by doing feels rewarding for you. Building, fixing, experimenting, or testing ideas are especially engaging ways to understand how things work.",
  "signal_instruction_summary": "Instruction describes how you share understanding with others. It can involve talking ideas out loud, showing how something works, or helping others learn in ways that feel comfortable to you.",
  "signal_instruction_high": "Sharing ideas and helping others understand things feels satisfying to you. Explaining how something works or talking through what you know comes easily.",
  "signal_empathy_summary": "Empathy describes how you notice others and respond to their needs. This may show up through kindness, support, fairness, encouragement, or helping in practical or thoughtful ways.",
  "signal_empathy_high": "You’re attentive to when others need support and enjoy helping in ways that feel meaningful. Offering comfort, encouragement, or kindness is a strong motivator.",
  "signal_collaboration_summary": "Collaboration describes how you engage with others when learning or working together. It can include sharing ideas, cooperating in groups, or contributing to shared goals in your own way.",
  "signal_collaboration_high": "Working with others feels energizing for you. Sharing ideas, learning together, and contributing toward group goals is especially rewarding.",
  "signal_organization_summary": "Organization describes how you relate to structure, routines, and planning. It may show up through liking clear expectations, arranging things thoughtfully, or finding comfort in knowing what comes next.",
  "signal_organization_high": "Structure and organization help you feel comfortable and grounded. Routines, planning, sorting, and knowing what to expect next make it easier to focus and feel at ease.",
  "cluster_curiosity_creativity": "When curiosity and creativity show up together for you, you may enjoy turning questions into ideas you can imagine, build, or share. You might like exploring possibilities, experimenting with new approaches, or expressing what you’re learning in creative and original ways.",
  "cluster_curiosity_reasoning": "When curiosity and reasoning come together, you may enjoy learning by testing ideas and seeing what happens. You might like experimenting, building, or figuring things out through trial and error rather than just talking or reading about them",
  "cluster_persistence_organization": "When persistence and organization work together for you, you may feel comfortable sticking with tasks and seeing them through. Having structure or a clear plan can help you make steady progress on things that matter to you.",
  "cluster_empathy_instruction": "When empathy and instruction and come together, you may enjoy supporting others by sharing what you know. You might feel motivated to teach, guide, or encourage people in ways that help them understand or feel more confident.",
  "cluster_collaboration_empathy": "When collaboration and empathy show up together, you may enjoy being part of a group where people support one another. Working toward shared goals and helping others along the way can feel especially meaningful to you.",
  "report_integrative_summary_many_highs": "Your answers show several signals standing out across different areas, rather than just one or two. This suggests your strengths are broad, and you may feel comfortable exploring many kinds of activities depending on the situation.",
  "report_integrative_summary_typical": "A few signals stand out more clearly in your answers, with other signals close behind. These stronger areas can offer clues about what feels most natural to you right now, while the rest show different ways you can learn and contribute.",
  "report_integrative_summary_balanced": "Your signals are fairly even and close together, which suggests you may be flexible in how you learn and explore. What feels comfortable or interesting to you may change depending on the topic, the setting, or who you’re learning with.",
  "report_integrative_summary_single_peak": "One signal stands out more clearly than the others in your answers. This can be a helpful clue about what feels most natural to you right now, while the rest of your signals show the different ways you can learn in other situations.",
  "report_integrative_summary_no_highs": "Your answers didn’t point to any signals standing out strongly above the others, and that’s completely okay. This can happen when interests are still forming or when many things feel “somewhat true.” The goal here is simply to notice patterns and stay curious over time.",
  "integrative_emerging_profile": "Your answers show that many different ways of learning and exploring are still taking shape for you. No single area stands far above the others right now, which is completely normal as interests grow and change. This is a great time for trying new activities, noticing what feels enjoyable, and paying attention to what sparks your curiosity. As you keep exploring, certain strengths may become clearer, while others continue to develop in their own way.",
  "integrative_balanced_strengths": "Your answers show strengths across several different areas, rather than just one. You’re comfortable learning in multiple ways—thinking, doing, helping, or working alongside others depending on the situation. This balance can make it easier to adapt to new challenges and explore a wide range of interests. Over time, some of these strengths may grow more prominent as you follow what feels meaningful to you.",
  "integrative_strong_peak": "One area stands out more strongly in your answers, pointing to a clear strength in how you like to learn or engage right now. This doesn’t take away from your other strengths—it simply highlights something that feels especially natural or energizing for you. Strong focus like this can guide you toward activities that feel rewarding and confidence-building, while other skills continue to grow through experience.",
  "integrative_balanced_with_peak": "Your answers show strengths across several areas, with one that stands out right now. This gives you flexibility. You’re comfortable learning and working in different ways, with an approach that feels especially energizing or natural. Over time, that standout strength can guide the activities you enjoy most, while your broader strengths support your growth.",
  "integrative_broad_explorer_even": "Your answers show that many different ways of learning and exploring feel comfortable for you, without any single area standing far above the others. This kind of balance makes it easier to move between activities, try new things, and adapt to different situations. Rather than being drawn to just one approach, you enjoy learning in ways that shift with the context or topic.",
  "integrative_broad_explorer_with_peaks": "Your answers show many strengths working together, with one that feels especially strong right now. This gives you flexibility. You can learn and work in different ways, while also having an approach that feels exciting and natural to you. As you grow, that strength may help guide what you enjoy most, while your other strengths support exploration and discovery along the way.",
  "integrative_focused_with_support": "One or two ways of learning stand out clearly in your answers, while the rest provide steady support. This points to a focused set of strengths that guide how you like to engage, without leaving other areas behind. Having clear strengths alongside supportive skills can help you build confidence while still staying open to new experiences.",
  "integrative_emerging_even": "Your answers show that your interests and learning preferences are still developing, with no single area standing far apart from the others. This evenness creates a helpful foundation, allowing you to explore freely without feeling pulled strongly in one direction yet. As you gain more experiences, certain interests or strengths may begin to take shape more clearly over time.",
  "micro_curiosity_high": [
    "You love asking questions and figuring out how things work.",
    "You’re naturally curious and enjoy exploring ideas that catch your interest."
  ],
  "micro_curiosity_low": [
    "You often start with what feels familiar, and curiosity grows as you become more comfortable.",
    "You explore new ideas gradually, especially when you feel confident in the setting."
  ],
  "micro_creativity_high": [
    "You enjoy making or inventing things and putting your own twist on ideas.",
    "You like expressing yourself creatively in ways that feel personal to you."
  ],
  "micro_creativity_low": [
    "You prefer clear examples at the start, with creativity emerging once the basics are in place.",
    "Your creativity shows up more quietly, often through practical problem-solving."
  ],
  "micro_reflection_high": [
    "You like to think things through and notice what you’re learning along the way.",
    "You often pause to reflect on ideas, feelings, or experiences."
  ],
  "micro_reflection_low": [
    "You learn best by doing, with reflection coming after the action.",
    "You process experiences later, rather than pausing to reflect in the moment."
  ],
  "micro_initiative_high": [
    "You often get started on your own and like choosing what to do next.",
    "You’re comfortable taking the first step, especially when something excites you."
  ],
  "micro_initiative_low": [
    "You prefer a clear starting point and build momentum once you begin.",
    "You do your best work after someone helps you get started."
  ],
  "micro_persistence_high": [
    "You keep going even when something is tricky, especially if it matters to you.",
    "You show determination and stick with challenges that feel important."
  ],
  "micro_persistence_low": [
    "When things feel frustrating, smaller steps and quick wins help you keep going.",
    "You’re more likely to persist when tasks feel achievable and supported."
  ],
  "micro_reasoning_high": [
    "You like to learn by trying things, testing ideas, and fixing what doesn’t work.",
    "You enjoy solving problems by getting hands-on and experimenting."
  ],
  "micro_reasoning_low": [
    "You prefer understanding or watching first, then trying things yourself.",
    "Seeing how something works builds your confidence before you jump in."
  ],
  "micro_instruction_high": [
    "You enjoy explaining ideas and helping others understand.",
    "You like sharing what you know, especially when someone is curious."
  ],
  "micro_instruction_low": [
    "You prefer learning privately at first, then sharing when you’re ready.",
    "You think things through before explaining them out loud."
  ],
  "micro_empathy_high": [
    "You notice others’ needs and like being the kind of person who helps.",
    "You feel connected to people and like offering support or kindness."
  ],
  "micro_empathy_low": [
    "You focus on your own tasks first, with helping growing in moments that feel meaningful.",
    "Helping comes more naturally when you feel calm and settled."
  ],
  "micro_collaboration_high": [
    "You enjoy working with others and feel energized by teamwork.",
    "You like sharing ideas and contributing to group goals."
  ],
  "micro_collaboration_low": [
    "You prefer working independently, with teamwork feeling easier when there’s a clear purpose.",
    "Teamwork works best for you when expectations are clear and focused."
  ],
  "micro_organization_high": [
    "You like having a plan, keeping things tidy, and knowing what comes next.",
    "Structure helps you feel comfortable and ready to work."
  ],
  "micro_organization_low": [
    "You prefer flexibility, with organization helping most when it’s simple and visual.",
    "Organization feels most helpful when systems stay simple and visual."
  ],
  "integrative_fallback": "Your answers show a mix of different strengths, without one clear pattern standing out more than the others right now. That’s completely okay—learning styles can shift depending on interests, experiences, and what you’re exploring at the moment. This snapshot simply reflects where things are today, and it can grow and change over time.",
  "cluster_fallback": "Your strengths don’t all show up in the same way every time—and that’s a good thing. You may use different skills depending on the situation, the people you’re with, or what you’re working on. This flexibility can help you adapt, try new things, and learn in lots of different ways.",
  "next_step_curiosity": "If you’re curious, you might enjoy following a question a little longer and seeing where it leads, without worrying about finding the “right” answer.",
  "next_step_creativity": "You could experiment with sharing your ideas in a new way, or trying a creative activity just for the enjoyment of it.",
  "next_step_reflection": "You might notice what happens if you give yourself a little quiet time to think or talk through what you’re learning.",
  "next_step_initiative": "If something sparks your interest, you could try taking the first step and seeing how it feels, even without a full plan.",
  "next_step_persistence": "You might experiment with breaking a tricky task into smaller pieces and noticing which parts feel easiest to stick with.",
  "next_step_reasoning": "You could try learning something new by building, testing, or tinkering with it rather than watching or reading first.",
  "next_step_instruction": "If it feels right, you might enjoy explaining something you know to someone else and seeing what you learn as you do.",
  "next_step_empathy": "You could notice moments when helping others feels energizing and see which kinds of support feel most natural to you.",
  "next_step_collaboration": "You might experiment with working alongside others and paying attention to what you enjoy most about it.",
  "next_step_organization": "If you want, you could try creating a simple plan or structure for something you care about and see how it supports you.",
  "profile_fluidity_note": [
    "This snapshot reflects your answers today. These patterns can change as you grow. There’s no right or wrong way to be an explorer. Revisit this anytime -- and dream big, stay curious!",
    "This profile reflects what feels true right now. It’s not a label, just a moment in time. Come back to it as you explore -- and dream big, stay curious!",
    "This profile reflects patterns you noticed today, not limits on who you can become. Interests grow and change over time. Share it, revisit it, and stay curious!"
  ],
  "integrative_broad_explorer": "Your answers show strengths across many different areas, which suggests you may enjoy exploring lots of kinds of activities. You can learn and contribute in more than one way—thinking, doing, helping, or working with others depending on the situation. This flexibility can help you try new things and discover what feels most exciting or meaningful over time.",
  "integrative_focused_strengths": "Your answers show one or two ways of learning that feel especially natural to you right now. This can help you feel confident and engaged when you’re doing activities that match your strengths. Over time, you can keep building those strengths while also trying new experiences that help other skills grow."
};
