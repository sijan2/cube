export interface PokeMessage {
  message: string;
}

export interface PokeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class PokeAPI {
  private apiKey: string;
  private baseUrl = 'https://poke.com/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(message: string): Promise<PokeResponse> {
    try {
      console.log('Sending message to Poke API...');
      console.log('API Key length:', this.apiKey.length);
      console.log('API Key (first 10 chars):', this.apiKey.substring(0, 10));
      
      const response = await fetch(`${this.baseUrl}/inbound-sms/webhook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Poke API success:', data);
        return {
          success: true,
          data
        };
      } else {
        console.log('❌ Poke API error:', data);
        return {
          success: false,
          error: `HTTP ${response.status}: ${(data as any).error?.message || response.statusText}`
        };
      }
    } catch (error: any) {
      console.error('❌ Request failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}