import { OpenAIService } from "../services/openAIService";
import { Config } from "../config/config";

export class Agent {
    private openAIService = new OpenAIService(Config.getOpenAIKey());
    constructor(private descripition: string) { }

    ask(prompt: string): Promise<string> {
        const promptToSend = `
        O que você deve fazer: ${this.descripition} 
        \n${prompt}
        `;
        return this.openAIService.ask(promptToSend)
    }
}