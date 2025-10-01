import { Request, Response } from 'express';
import { TestService } from '../services/testService';

export class TestController {
  constructor(private testService: TestService) {}

  getTest(req: Request, res: Response) {
    res.json({ message: this.testService.getMessage() });
  }
}