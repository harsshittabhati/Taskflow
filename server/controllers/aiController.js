const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.suggestEstimate = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  // Graceful fallback if API key is missing
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      effort: 'M (4-8 hours)',
      suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reasoning: 'AI unavailable - showing default estimate',
      fallback: true,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `You are a project management assistant. Analyze this task and provide an effort estimate.

Task Title: ${title}
Task Description: ${description || 'No description provided'}

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "effort": "S (1-2 hours) or M (4-8 hours) or L (1-3 days) or XL (1-2 weeks)",
  "suggestedDueDate": "YYYY-MM-DD",
  "reasoning": "One sentence explaining your estimate"
}

Set suggestedDueDate to a realistic date from today (${new Date().toISOString().split('T')[0]}) based on the effort.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean up response in case Gemini adds markdown
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (error) {
    console.error('Gemini API error:', error.message);

    // Graceful fallback if AI call fails
    res.json({
      effort: 'M (4-8 hours)',
      suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reasoning: 'AI estimate unavailable - showing default',
      fallback: true,
    });
  }
};