# LemmaIoT AI Response Composer

An AI-powered application that helps compose perfect customer replies using Groq's blazing-fast models.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Run the development server: `npm run dev`

## Features
- AI-powered response generation using Groq models (Llama 3, Mixtral, Gemma)
- Fetch knowledge base context directly from URLs (HTML, PDF, Plain Text)
- Multiple output formats (Plain Text, Markdown, HTML)
- Copy to clipboard functionality
