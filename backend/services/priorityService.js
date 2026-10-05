const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzePriority = async (messageText) => {
  try {
    const prompt = `
You are an emergency communication priority classifier.

Classify the emergency message into EXACTLY ONE category:

critical
important
low

CRITICAL:
Use critical when there is immediate danger to human life or urgent rescue is required.

Examples:
- A person is trapped
- Someone is trapped under a collapsed building
- Person is drowning
- Someone is seriously injured
- Severe bleeding
- Fire
- Building collapse with people trapped
- Person unconscious
- Someone cannot breathe
- Immediate life-threatening danger

IMPORTANT:
Use important when help is needed but there is no immediate threat to life.

Examples:
- Need food
- Need water
- Need medicine
- Need shelter
- Minor injury
- Property damage
- Need evacuation assistance without immediate danger

LOW:
Use low for:
- General information
- Status updates
- Non-urgent communication
- Safe/good status reports

IMPORTANT RULE:
If the message contains a situation where a person is trapped, seriously injured,
drowning, unconscious, unable to breathe, or in immediate danger,
the answer MUST be:

critical

Return ONLY ONE WORD.

Message:
${messageText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const result = response.text
      .trim()
      .toLowerCase();

    const allowedPriorities = [
      "critical",
      "important",
      "low",
    ];

    if (allowedPriorities.includes(result)) {
      return result;
    }

    return "important";
  } catch (error) {
    console.error("AI priority analysis error:", error);

    // Safe fallback if Gemini is unavailable
    return "important";
  }
};

module.exports = {
  analyzePriority,
};