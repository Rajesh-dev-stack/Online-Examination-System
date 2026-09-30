const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function generateQuestions(topic, numberOfQuestions, difficulty, subject) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [{
          role: 'user',
          content: `Generate exactly ${numberOfQuestions} multiple choice questions for ${subject} on the topic: ${topic}. Difficulty level: ${difficulty}.
          
          Return ONLY a JSON array like this, with no extra text or markdown code blocks around it:
          [
            {
              "questionText": "question here",
              "optionA": "option a",
              "optionB": "option b", 
              "optionC": "option c",
              "optionD": "option d",
              "correctAnswer": "A",
              "marks": 1
            }
          ]`
        }],
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Attempt to parse JSON from the response text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // inject AI source tag
      return parsed.map(q => ({ ...q, source: 'ai' }));
    } else {
      throw new Error("Failed to parse AI response into JSON");
    }
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
}
