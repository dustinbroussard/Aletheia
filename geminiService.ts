
import { GoogleGenAI } from "@google/genai";
import { Persona, Message } from "./types";

export const generateAgentResponse = async (
  agent: Persona,
  history: Message[],
  genesis: string,
  metaInstructions: string,
  openRouterKey: string,
  onStream?: (chunk: string) => void
): Promise<{ text: string; latency: number; tokens: number }> => {
  const start = Date.now();

  if (agent.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const systemInstruction = `${agent.systemPrompt}\n\nGLOBAL CONSTRAINTS:\n${metaInstructions}\n\nINITIAL SCENARIO:\n${genesis}`;
    const contents = history.map(msg => ({
      role: msg.role === 'model' && msg.agentId === agent.id ? 'model' : 'user',
      parts: [{ text: `[${msg.agentName}]: ${msg.content}` }]
    }));

    try {
      const result = await ai.models.generateContentStream({
        model: agent.model || 'gemini-3-flash-preview',
        contents: contents as any,
        config: {
          systemInstruction,
          temperature: agent.temperature,
          maxOutputTokens: agent.maxTokens,
        },
      });

      let fullText = "";
      for await (const chunk of result) {
        const text = chunk.text || "";
        fullText += text;
        if (onStream) onStream(text);
      }

      const latency = Date.now() - start;
      const tokens = Math.ceil(fullText.length / 4);
      return { text: fullText, latency, tokens };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  } else {
    // OpenRouter provider logic
    const systemPrompt = `${agent.systemPrompt}\n\nGLOBAL CONSTRAINTS:\n${metaInstructions}\n\nINITIAL SCENARIO:\n${genesis}`;
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'model' && msg.agentId === agent.id ? 'assistant' : 'user',
        content: `[${msg.agentName}]: ${msg.content}`
      }))
    ];

    try {
      if (!openRouterKey) throw new Error("OpenRouter API key is missing");

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Aletheia'
        },
        body: JSON.stringify({
          model: agent.model,
          messages: messages,
          temperature: agent.temperature,
          max_tokens: agent.maxTokens,
          stream: true
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                const content = data.choices[0]?.delta?.content || "";
                fullText += content;
                if (onStream) onStream(content);
              } catch (e) {
                // Ignore partial JSON
              }
            }
          }
        }
      }

      const latency = Date.now() - start;
      const tokens = Math.ceil(fullText.length / 4);
      return { text: fullText, latency, tokens };
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      throw error;
    }
  }
};
