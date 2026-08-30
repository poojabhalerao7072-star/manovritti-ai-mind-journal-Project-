import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const app = express();

// 1. Mandatory Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

/**
 * Resilient content generation wrapper that iterates through fallback models upon encountering recoverable API errors.
 */
async function generateContentWithFallback(requestParams: {
  contents: any;
  config?: any;
}) {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: requestParams.contents,
        config: requestParams.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed with error:`, err?.message || err);
      lastError = err;
      // Recoverable error conditions: continue to next fallback
      const status = err?.status || err?.code || 0;
      if (
        status === 404 ||
        status === 429 ||
        status === 500 ||
        status === 503 ||
        err?.message?.includes('not found') ||
        err?.message?.includes('Resource has been exhausted') ||
        err?.message?.includes('Overloaded')
      ) {
        continue;
      }
      // If it's a critical fatal error like bad request syntax, attempt next model as well
      continue;
    }
  }

  throw lastError || new Error('All fallback models in the ladder failed.');
}

// System instruction matching user requirement specification
const SYSTEM_INSTRUCTION_BASE =
  'You are an empathetic, context-aware AI journaling companion and cognitive analyst. Provide warm reflections, evaluate sentiment, and extract metadata in the user’s preferred language (English or Marathi). Always respond with compassionate, psychologically healthy, non-judgmental guidance.';

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * 1. Entry Analysis Endpoint
 * Analyzes single decrypted journal entry: gives empathetic reflection, mood score (1-10), mood label, tags, next prompt
 */
app.post('/api/gemini/analyze-entry', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const text = typeof data.text === 'string' ? data.text.trim() : '';
    const language = data.language === 'mr' ? 'mr' : 'en';

    if (!text) {
      return res.status(400).json({ error: 'Journal text is required for analysis.' });
    }

    const languageInstruction =
      language === 'mr'
        ? 'The user is writing in Marathi (मराठी). Generate the reflection, moodLabel, tags, and nextSuggestedPrompt entirely in natural, fluent Marathi (Devanagari script).'
        : 'The user is writing in English. Generate all fields in English.';

    const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n${languageInstruction}`;

    const prompt = `Analyze this personal journal entry:\n\n"""\n${text}\n"""\n\nProvide an empathetic reflection, assess moodScore on a scale of 1-10 (1=deeply distressed, 5=neutral/balanced, 10=joyful/inspired), provide a concise moodLabel, generate 2-5 relevant smart tags, and craft a thought-provoking nextSuggestedPrompt.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reflection: {
              type: Type.STRING,
              description: 'Empathetic reflection or response.',
            },
            moodScore: {
              type: Type.INTEGER,
              description: '1 to 10 score (1=distressed, 5=neutral, 10=joyful).',
            },
            moodLabel: {
              type: Type.STRING,
              description: 'Short mood description (e.g., Hopeful, Anxious, Peaceful, उत्साही, शांत).',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-5 smart tags.',
            },
            nextSuggestedPrompt: {
              type: Type.STRING,
              description: 'Context-aware prompt for the next entry.',
            },
          },
          required: ['reflection', 'moodScore', 'moodLabel', 'tags', 'nextSuggestedPrompt'],
        },
      },
    });

    const outputText = response.text?.trim() || '{}';
    const parsed = JSON.parse(outputText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-entry:', error);
    return res.status(500).json({
      error: 'Failed to analyze journal entry.',
      details: error?.message || String(error),
      fallback: {
        reflection:
          req.body?.language === 'mr'
            ? 'तुमचे विचार सुरक्षितपणे नोंदवले आहेत. मन मोकळे केल्याने नेहमी शांती मिळते.'
            : 'Your reflection has been securely stored. Expressing your thoughts is a powerful step in mindful self-care.',
        moodScore: 5,
        moodLabel: req.body?.language === 'mr' ? 'शांत' : 'Calm',
        tags: req.body?.language === 'mr' ? ['विचार', 'स्व-संवाद'] : ['Reflection', 'Mindfulness'],
        nextSuggestedPrompt:
          req.body?.language === 'mr'
            ? 'आजचा दिवस अधिक सुखकर करण्यासाठी तुम्ही काय करू शकता?'
            : 'What is one gentle thing you can do for yourself today?',
      },
    });
  }
});

/**
 * 2. Weekly Synthesis Endpoint
 * Synthesizes last 7 days of decrypted entries into holistic summary, top themes, average mood score, actionable insight
 */
app.post('/api/gemini/weekly-synthesis', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const language = data.language === 'mr' ? 'mr' : 'en';

    if (entries.length === 0) {
      return res.status(400).json({ error: 'No entries provided for weekly synthesis.' });
    }

    const languageInstruction =
      language === 'mr'
        ? 'The output must be generated in fluent, empathetic Marathi (Devanagari script).'
        : 'The output must be generated in English.';

    const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\nWeekly synthesis mode.\n${languageInstruction}`;

    const formattedEntries = entries
      .map(
        (e: any, idx: number) =>
          `[Entry ${idx + 1} | Date: ${e.date || 'Recent'} | Mood: ${e.moodScore || 5}/10 (${e.moodLabel || 'N/A'}) | Tags: ${(e.tags || []).join(', ')}]\n${e.text}\n`
      )
      .join('\n---\n');

    const prompt = `Synthesize these decrypted journal entries from the past 7 days:\n\n${formattedEntries}\n\nDeliver a comprehensive weekly summary of cognitive patterns, extract top themes, calculate/estimate the weighted average mood score (1-10), and give a deeply compassionate and actionable cognitive insight.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklySummary: {
              type: Type.STRING,
              description: 'Comprehensive empathetic weekly summary.',
            },
            topThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3-6 cognitive and emotional themes.',
            },
            averageMoodScore: {
              type: Type.NUMBER,
              description: 'Average mood score for the week between 1 and 10.',
            },
            actionableInsight: {
              type: Type.STRING,
              description: 'Actionable cognitive advice or mindfulness encouragement.',
            },
          },
          required: ['weeklySummary', 'topThemes', 'averageMoodScore', 'actionableInsight'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/weekly-synthesis:', error);
    return res.status(500).json({
      error: 'Failed to generate weekly synthesis.',
      details: error?.message || String(error),
    });
  }
});

/**
 * 3. Multi-turn Conversational Exploration on an Entry
 */
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const entryContext = typeof data.entryContext === 'string' ? data.entryContext : '';
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const language = data.language === 'mr' ? 'mr' : 'en';

    const languageInstruction =
      language === 'mr'
        ? 'Always converse in warm, comforting Marathi (Devanagari script).'
        : 'Always converse in warm, comforting English.';

    const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\nYou are engaging in a 1-on-1 dialogue with the user regarding their specific journal reflection.\nJournal Entry Context:\n"""${entryContext}"""\n\n${languageInstruction}`;

    // Prepare contents array
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '') }],
    }));

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No chat messages provided.' });
    }

    const response = await generateContentWithFallback({
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text?.trim() || (language === 'mr' ? 'मी तुमचे ऐकले आहे.' : 'I am here with you.'),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: 'Failed to generate chat response.',
      details: error?.message || String(error),
      reply:
        req.body?.language === 'mr'
          ? 'माफ करा, संपर्क साधण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.'
          : 'I am experiencing a momentary connection pause. Please send your reflection again.',
    });
  }
});

/**
 * 4. Context-Aware Daily Starter Prompt
 * Fetches last 3 entries and creates a personalized starter question for the day
 */
app.post('/api/gemini/daily-prompt', async (req, res) => {
  try {
    const data = req.body && typeof req.body === 'object' ? req.body : {};
    const recentEntries = Array.isArray(data.recentEntries) ? data.recentEntries : [];
    const language = data.language === 'mr' ? 'mr' : 'en';

    const languageInstruction =
      language === 'mr'
        ? 'The prompt and theme must be written in beautiful, thoughtful Marathi (Devanagari script).'
        : 'The prompt and theme must be written in English.';

    const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\nGenerate an insightful, uplifting, or clarifying daily journal prompt tailored to what the user has recently experienced.\n${languageInstruction}`;

    let contextSnippet = 'User is starting fresh.';
    if (recentEntries.length > 0) {
      contextSnippet = recentEntries
        .slice(0, 3)
        .map((e: any, i: number) => `Entry ${i + 1} (${e.moodLabel || 'Mood'}): ${e.text.substring(0, 300)}...`)
        .join('\n');
    }

    const prompt = `Based on the user's recent reflections:\n\n${contextSnippet}\n\nGenerate 1 inspiring daily reflection prompt, a 2-4 word theme, and an optional brief philosophical or mindfulness quote.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: {
              type: Type.STRING,
              description: 'A thoughtful, engaging daily prompt.',
            },
            theme: {
              type: Type.STRING,
              description: 'Theme title (e.g. Gratitude & Clarity, कृतज्ञता आणि धैर्य).',
            },
            inspirationalQuote: {
              type: Type.STRING,
              description: 'Short uplifting quote.',
            },
          },
          required: ['prompt', 'theme'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/daily-prompt:', error);
    const lang = req.body?.language === 'mr' ? 'mr' : 'en';
    return res.json({
      prompt:
        lang === 'mr'
          ? 'आज अशी कोणती गोष्ट घडली ज्याने तुमच्या मनात सकारात्मक विचार आणला?'
          : 'What is one moment from today that brought you a sense of quiet clarity or gratitude?',
      theme: lang === 'mr' ? 'दैनिक चिंतन' : 'Daily Mindfulness',
      inspirationalQuote:
        lang === 'mr'
          ? '“शांत मन हे सर्व सामर्थ्याचे मूळ आहे.”'
          : '“Peace comes from within. Do not seek it without.”',
    });
  }
});

/**
 * Start Express Server with Vite middleware
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Manovritti server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
