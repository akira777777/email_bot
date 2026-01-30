import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateDraft(contactName, history) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('mock')) {
    console.log('Using Mock AI for draft generation');
    return `Здравствуйте, ${contactName}!\n\nСпасибо за ваше сообщение. Мы получили ваш запрос и скоро ответим подробнее.\n\nЭто автоматический черновик ответа.\n\nС уважением,\nВаш помощник`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt = `
      You are a helpful email assistant for a business.
      The client name is ${contactName}.

      Here is the conversation history:
      ${history.map(m => `${m.role}: ${m.content}`).join('\n')}

      Please generate a polite, professional, and concise response draft for the last message.
      Reply in Russian.
      Do not include placeholders like "[Your Name]" if possible, or use generic signatures.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating draft. Please check server logs.";
  }
}
