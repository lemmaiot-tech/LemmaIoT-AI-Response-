// Fix: Removed self-import of `GeneratedResponse` to resolve conflict with local declaration.

export enum ResponseFormat {
  Email = 'Email',
  WhatsApp = 'WhatsApp',
  Article = 'Article',
}

export enum OutputFormat {
  PlainText = 'Plain Text',
  Markdown = 'Markdown',
  HTML = 'HTML',
}

export interface GeneratedResponse {
  greeting: string;
  requestAnalysis: string;
  option1: {
    title: string;
    description: string;
  };
  option2: {
    title: string;
    description: string;
  };
  recommendation: string;
  priceQuote: string;
  callToAction: string;
  closing: string;
}