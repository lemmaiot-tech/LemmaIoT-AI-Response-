import React, { useState, useCallback, useEffect } from 'react';
import { ResponseFormat, GeneratedResponse, OutputFormat } from './types';
import { generateCustomerResponse } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResponseDisplay from './components/ResponseDisplay';

const defaultLemmaIotInfo = `LemmaIoT provides end-to-end IoT solutions including:
- Scalable IoT Device Management Platform
- Real-time Data Processing and Analytics
- Secure and Reliable Cloud Data Storage
- Custom IoT Application Development
- Key sectors: Agriculture (AgriTech), Logistics & Fleet Management, Smart Homes, and Industrial Automation.
- Our mission is to help Nigerian and African businesses leverage IoT to improve efficiency and drive innovation.`;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('groq_api_key') || '');
  const [modelName, setModelName] = useState<string>(() => localStorage.getItem('groq_model_name') || 'llama3-8b-8192');
  
  const [customerRequest, setCustomerRequest] = useState<string>('');
  const [businessInfo, setBusinessInfo] = useState<string>('');
  const [lemmaIotInfo, setLemmaIotInfo] = useState<string>(defaultLemmaIotInfo);
  const [responseFormat, setResponseFormat] = useState<ResponseFormat>(ResponseFormat.Email);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.PlainText);
  const [generatedResponse, setGeneratedResponse] = useState<GeneratedResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('groq_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('groq_model_name', modelName);
  }, [modelName]);

  const handleGenerateResponse = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('API Key is not set. Please add it in the settings.');
      return;
    }
    if (!customerRequest.trim()) {
      setError('Customer request cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedResponse(null);

    try {
      const response = await generateCustomerResponse(
        customerRequest,
        businessInfo,
        responseFormat,
        lemmaIotInfo,
        modelName,
        apiKey
      );
      setGeneratedResponse(response);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [customerRequest, businessInfo, responseFormat, lemmaIotInfo, modelName, apiKey]);

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark font-sans transition-colors duration-300">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputForm
            customerRequest={customerRequest}
            setCustomerRequest={setCustomerRequest}
            businessInfo={businessInfo}
            setBusinessInfo={setBusinessInfo}
            lemmaIotInfo={lemmaIotInfo}
            setLemmaIotInfo={setLemmaIotInfo}
            responseFormat={responseFormat}
            setResponseFormat={setResponseFormat}
            isLoading={isLoading}
            onSubmit={handleGenerateResponse}
            modelName={modelName}
            setModelName={setModelName}
          />
          <ResponseDisplay
            response={generatedResponse}
            isLoading={isLoading}
            error={error}
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
          />
        </div>
      </main>
    </div>
  );
};

export default App;