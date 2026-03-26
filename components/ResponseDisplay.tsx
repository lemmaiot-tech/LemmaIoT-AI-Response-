import React, { useState, useEffect } from 'react';
import { GeneratedResponse, OutputFormat } from '../types';
import Spinner from './Spinner';
import CopyIcon from './CopyIcon';

interface ResponseDisplayProps {
  response: GeneratedResponse | null;
  isLoading: boolean;
  error: string | null;
  outputFormat: OutputFormat;
}

const loadingMessages = [
    { main: "AI is thinking...", sub: "Crafting the perfect response for you." },
    { main: "Analyzing request details...", sub: "Understanding the customer's needs." },
    { main: "Consulting knowledge base...", sub: "Tailoring solutions to your business." },
    { main: "Composing the perfect reply...", sub: "This will just take a moment." },
];

const getFormattedResponse = (response: GeneratedResponse, format: OutputFormat): string => {
  const { greeting, requestAnalysis, option1, option2, recommendation, priceQuote, callToAction, closing } = response;

  const sections = [
    { title: 'Greeting', content: greeting },
    { title: 'Request Analysis', content: requestAnalysis },
    { title: `Option 1: ${option1.title}`, content: option1.description },
    { title: `Option 2: ${option2.title}`, content: option2.description },
    { title: 'Recommendation', content: recommendation },
    { title: 'Price Quote', content: priceQuote },
    { title: 'Call To Action', content: callToAction },
    { title: 'Closing', content: closing },
  ].filter(section => section.content);

  switch (format) {
    case OutputFormat.Markdown:
      return sections.map(sec => `### ${sec.title}\n\n${sec.content}`).join('\n\n---\n\n');
    case OutputFormat.HTML:
      return sections.map(sec => `<h3>${sec.title}</h3>\n<p>${sec.content.replace(/\n/g, '<br />')}</p>`).join('\n\n');
    case OutputFormat.PlainText:
    default:
      return sections.map(sec => `${sec.title.toUpperCase()}\n${'-'.repeat(sec.title.length)}\n${sec.content}`).join('\n\n\n');
  }
};


const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, isLoading, error, outputFormat }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 3000); // Change message every 3 seconds

      return () => clearInterval(interval);
    } else {
        // Reset to the first message when not loading
        setCurrentMessageIndex(0);
    }
  }, [isLoading]);


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderContent = () => {
    if (isLoading) {
      const { main, sub } = loadingMessages[currentMessageIndex];
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">
            {main}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {sub}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-center text-red-500">
          <p>{error}</p>
        </div>
      );
    }

    if (response) {
      const formattedText = getFormattedResponse(response, outputFormat);
      return (
        <div className="relative h-full">
            <button
              onClick={() => handleCopy(formattedText)}
              className="absolute top-2 right-2 p-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              title="Copy to Clipboard"
            >
              {isCopied ? 'Copied!' : <CopyIcon />}
            </button>
            <pre className="h-full w-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-md">
              <code className="text-sm whitespace-pre-wrap font-mono">{formattedText}</code>
            </pre>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Your generated response will appear here...
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[500px] flex flex-col">
       <div className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-700 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Generated Response
          </h2>
       </div>
      <div className="flex-grow relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResponseDisplay;