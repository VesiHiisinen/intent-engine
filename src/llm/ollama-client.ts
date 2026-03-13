import axios from 'axios';

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

export interface OllamaResponse {
  response: string;
}

export class OllamaClient {
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    baseUrl: string = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    model: string = process.env.OLLAMA_MODEL ?? 'llama3.2'
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generate(prompt: string): Promise<string> {
    const request: OllamaRequest = {
      model: this.model,
      prompt,
      stream: false,
    };

    const response = await axios.post<OllamaResponse>(
      `${this.baseUrl}/api/generate`,
      request,
      { timeout: 60000 }
    );

    return response.data.response.trim();
  }

  async isAvailable(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
