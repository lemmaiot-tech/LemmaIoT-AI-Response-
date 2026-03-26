import Groq from "groq-sdk";
import { ResponseFormat, GeneratedResponse } from '../types';

const createPrompt = (customerRequest: string, businessInfo: string, format: ResponseFormat, lemmaIotInfo: string): string => {
  return `
    **Your Role:** You are an expert sales and technical support assistant for LemmaIoT, a leading cloud solutions provider in Nigeria specializing in the Internet of Things (IoT). Your responses must be professional, friendly, clear, and persuasive.

    **About LemmaIoT:**
    ${lemmaIotInfo}

    **Your Task:**
    Analyze the customer's request and their business information, then compose a response tailored for the specified format (${format}).

    **Customer Request:**
    "${customerRequest}"

    **Customer Business Information (if provided):**
    "${businessInfo || 'Not provided.'}"

    **Instructions:**
    Generate a structured response adhering strictly to the provided JSON schema. Your goal is to understand the customer's core problem and propose tangible, valuable solutions from LemmaIoT. Be creative but realistic with your proposed solutions and pricing.
    
    You MUST respond with a valid JSON object. Do not include markdown formatting like \`\`\`json.
    
    The JSON object MUST have the following structure:
    {
      "greeting": "A warm, personalized greeting to the customer. Thank them for their interest in LemmaIoT.",
      "requestAnalysis": "A summary and analysis of the customer's request, demonstrating a clear understanding of their needs. Connect it to their business if info is provided.",
      "option1": {
        "title": "A concise title for the first proposed solution.",
        "description": "A detailed description of the first solution, including its benefits."
      },
      "option2": {
        "title": "A concise title for the second, alternative solution.",
        "description": "A detailed description of the second solution, highlighting how it differs from the first."
      },
      "recommendation": "A clear recommendation for one of the options, with a justification for why it's the best fit for the customer.",
      "priceQuote": "An estimated price quote or a realistic price range for the recommended solution. Mention currency (e.g., NGN or USD).",
      "callToAction": "A clear next step for the customer, such as scheduling a discovery call or a demo.",
      "closing": "A professional closing phrase (e.g., 'Best regards,')."
    }
  `;
};

export const generateCustomerResponse = async (
  customerRequest: string,
  businessInfo: string,
  responseFormat: ResponseFormat,
  lemmaIotInfo: string,
  modelName: string,
  apiKey: string
): Promise<GeneratedResponse> => {
  const groq = new Groq({ apiKey: apiKey || process.env.API_KEY, dangerouslyAllowBrowser: true });
  const prompt = createPrompt(customerRequest, businessInfo, responseFormat, lemmaIotInfo);

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that outputs JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: modelName,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const jsonText = chatCompletion.choices[0]?.message?.content || "{}";
    const parsedResponse = JSON.parse(jsonText);
    
    // Basic validation to ensure the parsed object matches the expected structure.
    if (
      !parsedResponse.greeting ||
      !parsedResponse.option1 ||
      !parsedResponse.option1.title
    ) {
      throw new Error("AI response is missing required fields.");
    }

    return parsedResponse as GeneratedResponse;

  } catch (error) {
    console.error("Error calling Groq API:", error);
    if (error instanceof Error && error.message.includes('API key')) {
        throw new Error("The API key is not valid. Please check your settings.");
    }
    throw new Error("Failed to get a valid response from the AI model.");
  }
};
