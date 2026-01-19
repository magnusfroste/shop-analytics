import axios from 'axios';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export const askChatGPT = async (question, visitorData, apiKey, systemPrompt, userPrompt, model) => {
  if (!apiKey) {
    throw new Error('ChatGPT API key is missing. Please add it in the settings.');
  }

  const formattedUserPrompt = userPrompt
    .replace('{question}', question)
    .replace('{visitorData}', JSON.stringify(visitorData));

  try {
    console.log('Sending request to ChatGPT API with the following data:');
    console.log('API Key:', apiKey.substring(0, 5) + '...');
    console.log('System Prompt:', systemPrompt);
    console.log('Formatted User Prompt:', formattedUserPrompt);
    console.log('Model:', model);

    const response = await axios.post(
      API_URL,
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: formattedUserPrompt,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    console.log('Received response from ChatGPT API:', response.data);

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message;
    } else {
      throw new Error('Unexpected response format from ChatGPT API');
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    if (error.response) {
      console.error('API response:', error.response.data);
      throw new Error(`ChatGPT API error: ${error.response.data.error?.message || 'Unknown error'}`);
    } else if (error.request) {
      throw new Error('No response received from ChatGPT API');
    } else {
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
};
