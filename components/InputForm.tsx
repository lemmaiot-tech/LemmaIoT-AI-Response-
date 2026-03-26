import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ResponseFormat } from '../types';
import Spinner from './Spinner';

// Configure the worker to use the CDN version matching the installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface InputFormProps {
  customerRequest: string;
  setCustomerRequest: (value: string) => void;
  businessInfo: string;
  setBusinessInfo: (value: string) => void;
  lemmaIotInfo: string;
  setLemmaIotInfo: (value: string) => void;
  responseFormat: ResponseFormat;
  setResponseFormat: (value: ResponseFormat) => void;
  isLoading: boolean;
  onSubmit: () => void;
  modelName: string;
  setModelName: (value: string) => void;
}

const MAX_CONTENT_LENGTH = 50000; // 50,000 characters limit
const AVAILABLE_MODELS = ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];

const InputForm: React.FC<InputFormProps> = ({
  customerRequest,
  setCustomerRequest,
  businessInfo,
  setBusinessInfo,
  lemmaIotInfo,
  setLemmaIotInfo,
  responseFormat,
  setResponseFormat,
  isLoading,
  onSubmit,
  modelName,
  setModelName,
}) => {
  const [knowledgeBaseUrl, setKnowledgeBaseUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetchFromUrl = async () => {
    if (!knowledgeBaseUrl.trim()) {
      setFetchError('Please enter a valid URL.');
      return;
    }
    setIsFetchingUrl(true);
    setFetchError(null);
    try {
      const proxyUrl = 'https://corsproxy.io/?';
      const response = await fetch(`${proxyUrl}${encodeURIComponent(knowledgeBaseUrl)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Could not find content at the provided URL. Please check the URL and try again.');
        }
        throw new Error(`Failed to fetch content. The server responded with status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      let cleanedText = '';

      if (contentType.includes('application/pdf') || knowledgeBaseUrl.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        cleanedText = fullText.replace(/\s\s+/g, ' ').trim();
      } else if (contentType.includes('text/html')) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.querySelectorAll('script, style').forEach(el => el.remove());
        const textContent = doc.body.textContent || '';
        cleanedText = textContent.replace(/\s\s+/g, ' ').trim();
      } else {
        // Fallback for plain text, JSON, CSV, etc.
        const text = await response.text();
        cleanedText = text.replace(/\s\s+/g, ' ').trim();
      }

      if (cleanedText.length > MAX_CONTENT_LENGTH) {
        throw new Error(`The content from this URL is too long (over ${MAX_CONTENT_LENGTH.toLocaleString()} characters). Please use a more specific URL or manually paste a shorter section.`);
      }
      
      setLemmaIotInfo(cleanedText);

    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError(err.message || 'An unknown error occurred while fetching. Please check the URL and ensure it is publicly accessible.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Compose Your Request
        </h2>
      </div>

      <div>
         <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          AI Model
        </label>
        <select
          id="modelName"
          className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="customerRequest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Customer's Request *
        </label>
        <textarea
          id="customerRequest"
          rows={6}
          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out"
          placeholder="Paste the customer's email, message, or describe their needs here..."
          value={customerRequest}
          onChange={(e) => setCustomerRequest(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="businessInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Customer's Business Info (Optional)
        </label>
        <textarea
          id="businessInfo"
          rows={3}
          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out"
          placeholder="e.g., 'ABC Farms, a commercial poultry farm in Oyo State. Website: abcfarms.com.ng'"
          value={businessInfo}
          onChange={(e) => setBusinessInfo(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="lemmaIotInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          AI Knowledge Base: About Your Business
        </label>
        
        <div className="flex items-center gap-2 mb-2">
            <input
                type="url"
                id="knowledgeBaseUrl"
                className="flex-grow p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out"
                placeholder="Paste a URL to fetch knowledge from (e.g., about page)"
                value={knowledgeBaseUrl}
                onChange={(e) => setKnowledgeBaseUrl(e.target.value)}
                disabled={isFetchingUrl}
                aria-label="Knowledge Base URL"
            />
            <button
                onClick={handleFetchFromUrl}
                disabled={isFetchingUrl || !knowledgeBaseUrl.trim()}
                className="flex justify-center items-center gap-2 py-2 px-4 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {isFetchingUrl ? <Spinner size="sm" /> : 'Fetch'}
            </button>
        </div>
        {fetchError && <p className="text-red-500 text-sm mt-1">{fetchError}</p>}

        <textarea
          id="lemmaIotInfo"
          rows={6}
          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out"
          placeholder="Enter details about your company, or fetch from a URL above..."
          value={lemmaIotInfo}
          // Fix: Corrected typo from 'taget' to 'target'.
          onChange={(e) => setLemmaIotInfo(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="responseFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Response Format
        </label>
        <select
          id="responseFormat"
          className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary transition duration-150 ease-in-out"
          value={responseFormat}
          onChange={(e) => setResponseFormat(e.target.value as ResponseFormat)}
        >
          {Object.values(ResponseFormat).map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? <><Spinner /> Generating...</> : 'Generate Response'}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
