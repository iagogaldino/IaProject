import { Request, Response } from 'express';
import { Agent } from '../agents/agents';
import { query } from '../services/postgresService';

export class OpenAIController {
    
    // private dbAgent = new Agent(promptIn);
    private assistantAgent = new Agent(`
       Based on what the user requested, review the search results and generate a response.
        `);

    constructor() { }

    async ask(req: Request, res: Response): Promise<void> {
        let answer = '';
        const prompt = req.body.prompt;

        if (!req.body || !req.body.prompt) {
            res.status(400).json({ error: 'Prompt is required' });
            return;
        }


        try {
            const result = await query("SELECT * FROM relatorio_texto");
            const promtptToSend = `
            \n - Search results for you to respond to the user's request: ${result.rows[0].texto}
            \n - User order: ${prompt} 
            `;
          
            const response = await this.assistantAgent.ask(promtptToSend);
          
            res.status(200).json({ data: response, userPrompt: prompt, dbData: result.rows[0].texto, promtptToSend});
        } catch (dbError) {
            console.error('Database query error:', dbError);
            res.status(500).json({ error: 'Database query failed', iaResponse: answer });
        }
    }
}