require('dotenv').config();
const OpenAI = require('openai');

async function test() {
  try {
    console.log("Using key:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0,10) + '...' : 'NONE');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const promptText = `
You are an expert AI classifying severe civic issues. Parse the provided issue report.
Title: "broken bridge"
Description: "so i got there and the bridge was broken"

Please return JSON matching this schema exactly:
{
  "description": "Enhanced rich description of the issue based on title, user description, and image context",
  "issue": "A 1-3 word category name (e.g. Pothole, Flooding, Vandalism)",
  "severity": "One of: Critical, High, Moderate, Low, None",
  "severityScore": number from 0 to 100,
  "confidence": number from 0.0 to 1.0 (how sure you are),
  "department": "The suggested city department to assign this to",
  "impactScope": "Brief description of the impact scope",
  "urgency": "One of: High, Medium, Low",
  "priorityScore": number from 0 to 100,
  "estimatedResolution": "A brief timeframe e.g. 24-48 hours",
  "invalidImage": boolean (true if image is out of context, completely black, blurry, or irrelevant to a civic issue. If no image, false),
  "invalidImageType": string ("BLURRY" or "OUT_OF_CONTEXT" if invalidImage is true, otherwise null)
}
  `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: [{ type: 'text', text: promptText }] }],
      response_format: { type: 'json_object' },
    });

    console.log("Result:", response.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
