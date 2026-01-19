import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SendHorizontal, CheckCircle, TrendingUp, Users, Clock, LightbulbIcon, LineChart, BarChart4, PieChart } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { aggregateDataForChatGPT } from '../utils/dataProcessing';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { supabase } from '../integrations/supabase/client';

const ChatGPT = ({ visitorData, weatherData, systemPrompt, userPrompt, model }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponse('');
    
    try {
      console.log('ChatGPT component - handleSubmit called');
      console.log('System Prompt:', systemPrompt);
      console.log('User Prompt:', userPrompt);
      console.log('Model:', model);

      const aggregatedData = aggregateDataForChatGPT(visitorData, weatherData);
      console.log('Aggregated data for ChatGPT:', aggregatedData);

      const formattedUserPrompt = userPrompt
        .replace('{question}', input)
        .replace('{visitorData}', JSON.stringify(aggregatedData));

      console.log('Calling Supabase Edge Function...');

      // Call Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('ask-chatgpt', {
        body: {
          question: input,
          visitorData: aggregatedData,
          systemPrompt: systemPrompt,
          userPrompt: formattedUserPrompt,
          model: model
        }
      });

      console.log('Edge function response:', { data, functionError });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Failed to get response from ChatGPT');
      }

      if (data && data.content) {
        setResponse(data.content);
      } else {
        throw new Error('Unexpected response format from ChatGPT API');
      }
    } catch (error) {
      console.error('Error getting ChatGPT response:', error);
      setError(error.message || 'Sorry, there was an error processing your request. Please try again later.');
    }
    setIsLoading(false);
  };

  const extractSummary = (text) => {
    // Look for summary indicators in the text
    const summaryIndicators = [
      'In summary', 'To summarize', 'Key takeaways', 'In conclusion', 
      'Overall', 'The analysis shows', 'Based on the data'
    ];
    
    const paragraphs = text.split('\n\n');
    
    // First try to find a paragraph that starts with a summary indicator
    for (const paragraph of paragraphs) {
      for (const indicator of summaryIndicators) {
        if (paragraph.startsWith(indicator)) {
          return paragraph;
        }
      }
    }
    
    // If no explicit summary, use the first paragraph if it's not too long
    if (paragraphs[0] && paragraphs[0].length < 300) {
      return paragraphs[0];
    }
    
    // If first paragraph is too long, create a summary from it
    if (paragraphs[0]) {
      return paragraphs[0].substring(0, 200) + '...';
    }
    
    return null;
  };

  // Custom components for markdown rendering
  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <div className="mt-6 mb-4">
        <h1 className="font-bold text-2xl text-blue-700 flex items-center">
          <BarChart4 className="mr-2" size={24} />
          {props.children}
        </h1>
        <div className="w-16 h-1 bg-blue-500 mt-1 rounded-full"></div>
      </div>
    ),
    h2: ({ node, ...props }) => (
      <div className="mt-5 mb-3">
        <h2 className="font-bold text-xl text-blue-700 flex items-center">
          <LineChart className="mr-2" size={20} />
          {props.children}
        </h2>
        <div className="w-12 h-1 bg-blue-400 mt-1 rounded-full"></div>
      </div>
    ),
    h3: ({ node, ...props }) => (
      <h3 className="font-semibold text-lg text-blue-600 mt-4 mb-2">{props.children}</h3>
    ),
    p: ({ node, ...props }) => {
      const text = props.children?.toString() || '';
      const isKeyInsight = 
        text.toLowerCase().includes('key insight') || 
        text.toLowerCase().includes('important finding') ||
        text.toLowerCase().includes('recommendation') ||
        text.toLowerCase().includes('conclusion');
        
      return (
        <p className={`mb-4 ${isKeyInsight ? 'bg-blue-50/80 p-4 border-l-4 border-blue-500 rounded-r-md font-medium' : 'p-2'}`}>
          {props.children}
        </p>
      );
    },
    ul: ({ node, ...props }) => (
      <ul className="list-none space-y-3 my-4 bg-white/90 p-5 rounded-lg shadow-sm border border-gray-100">
        {props.children}
      </ul>
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal pl-5 space-y-2 my-4 bg-white/90 p-5 rounded-lg shadow-sm border border-gray-100">
        {props.children}
      </ol>
    ),
    li: ({ node, ...props }) => {
      const text = props.children?.toString() || '';
      
      // Determine if this might be a key insight or recommendation
      const isInsight = 
        text.toLowerCase().includes('increase') || 
        text.toLowerCase().includes('improve') || 
        text.toLowerCase().includes('recommend') ||
        text.toLowerCase().includes('suggest') ||
        text.toLowerCase().includes('opportunity');
      
      // Choose icon based on content
      let ItemIcon = CheckCircle;
      if (text.toLowerCase().includes('trend') || text.toLowerCase().includes('increase') || text.toLowerCase().includes('growth')) {
        ItemIcon = TrendingUp;
      } else if (text.toLowerCase().includes('demographic') || text.toLowerCase().includes('age') || text.toLowerCase().includes('gender')) {
        ItemIcon = Users;
      } else if (text.toLowerCase().includes('time') || text.toLowerCase().includes('hour') || text.toLowerCase().includes('day')) {
        ItemIcon = Clock;
      }
      
      return (
        <li className={`flex items-start p-2 rounded-md ${isInsight ? 'bg-blue-50/50' : ''}`}>
          <span className={`mr-3 mt-1 p-1 rounded-full ${isInsight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-blue-500'}`}>
            <ItemIcon size={16} />
          </span>
          <span className={`${isInsight ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>{props.children}</span>
        </li>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-blue-300 pl-4 italic bg-blue-50/50 p-3 rounded-r-md my-4">
        {props.children}
      </blockquote>
    ),
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-700 font-mono text-sm">{children}</code>;
      }
      return (
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto my-4">
          <code className="font-mono text-sm">{children}</code>
        </pre>
      );
    },
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          {props.children}
        </table>
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-blue-50">
        {props.children}
      </thead>
    ),
    th: ({ node, ...props }) => (
      <th className="py-2 px-4 border-b border-gray-200 text-left text-blue-700 font-semibold">
        {props.children}
      </th>
    ),
    td: ({ node, ...props }) => (
      <td className="py-2 px-4 border-b border-gray-200">
        {props.children}
      </td>
    )
  };

  return (
    <Card className="w-full bg-white/50 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="text-white flex items-center">
          <LightbulbIcon className="mr-2" />
          Ask Ana (ChatGPT) about your visitor data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Ask questions about your visitor data... Example: 'What patterns do you see in our visitor demographics and traffic that could help us increase sales? Are there specific times when certain age groups visit more frequently?'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-sm shadow-inner min-h-24 p-4"
          />
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all py-6"
          >
            {isLoading ? 'Thinking...' : 'Ask Ana'}
            <SendHorizontal className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4 shadow-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <div className="mt-6 p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-blue-100 text-blue-800 flex items-center">
              <BarChart4 className="mr-2" size={20} />
              Insights & Recommendations
            </h3>
            
            {/* Summary section */}
            {extractSummary(response) && (
              <div className="mb-6 bg-blue-50/80 p-5 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex items-center mb-2">
                  <LightbulbIcon className="text-yellow-500 mr-2" size={20} />
                  <h4 className="font-semibold text-blue-800">Key Insight</h4>
                </div>
                <p className="text-gray-700">{extractSummary(response)}</p>
              </div>
            )}
            
            {/* Main content with markdown parsing */}
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown
                components={MarkdownComponents}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {response}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatGPT;
