import { OpenAI } from 'openai';

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async ask(prompt: string): Promise<string> {
    const promptToSend = `${prompt}`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptToSend }],
    });
    return response.choices[0]?.message?.content || '';
  }
}