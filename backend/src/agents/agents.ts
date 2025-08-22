import { OpenAIService } from "../services/openAIService";
const apiKey = process.env.OPENAI_API_KEY || '';

export class Agent {
    private openAIService = new OpenAIService(apiKey);
    constructor(private descripition: string) { }

    ask(prompt: string): Promise<string> {
        const promptToSend = `
        O que você deve fazer: ${this.descripition} 
        \n${prompt}
        `;
        return this.openAIService.ask(promptToSend)
    }
}