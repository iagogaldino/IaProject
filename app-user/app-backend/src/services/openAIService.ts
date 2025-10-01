import { OpenAI } from 'openai';
import { Config } from '../config/config';

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    // Use provided API key or get from centralized config
    const keyToUse = apiKey || Config.getOpenAIKey();
    console.log('OpenAI API Key configured:', !!keyToUse);
    this.openai = new OpenAI({ apiKey: keyToUse });
  }

  async ask(prompt: string): Promise<string> {
    const promptToSend = `${prompt}`;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: promptToSend }],
      });
      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI API Error:', error.message);
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }
      throw error;
    }
  }
}