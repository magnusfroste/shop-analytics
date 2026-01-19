import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge function called - parsing request body')
    const { question, visitorData, systemPrompt, userPrompt, model } = await req.json()
    
    // Get the Lovable API key from Supabase secrets
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    
    if (!lovableApiKey) {
      console.error('Lovable API key not found in environment')
      throw new Error('Lovable API key not found in secrets')
    }

    // Map model names or use default
    const modelToUse = model || 'google/gemini-3-flash-preview'
    console.log('Calling Lovable AI Gateway with model:', modelToUse)

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429,
          }
        )
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 402,
          }
        )
      }
      const errorData = await response.json()
      console.error('Lovable AI Gateway error:', errorData)
      throw new Error(`AI Gateway error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('Lovable AI Gateway response received successfully')
    
    if (data && data.choices && data.choices.length > 0) {
      return new Response(
        JSON.stringify({ content: data.choices[0].message.content }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('Unexpected response format from AI Gateway')
    }
  } catch (error: unknown) {
    console.error('Error in ask-chatgpt function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
