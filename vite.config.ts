import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/ai/summarize', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const { testType, value, normalRange, patientName } = JSON.parse(bodyStr || '{}');
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) {
              const defaultEnglish = `Your ${testType || 'health'} reading is ${value || 'within recorded parameters'}. Normal reference range is ${normalRange || 'reference range'}. Maintain a balanced diet, stay hydrated, and consult a physician if symptoms persist.`;
              const defaultTelugu = `మీ ${testType || 'ఆరోగ్య'} పరీక్ష ఫలితం ${value || 'సాధారణ పరిధిలో ఉంది'}. సాధారణ పరిధి: ${normalRange || 'రెఫరెన్స్ పరిధి'}. సమతుల్య ఆహారం తీసుకోండి, పుష్కలంగా నీరు త్రాగండి మరియు వైద్యుడిని సంప్రదించండి.`;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                summaryEn: defaultEnglish,
                summaryTe: defaultTelugu,
                advice: 'Maintain proper hydration, balanced nutrition and regular physical activity.'
              }));
              return;
            }

            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const prompt = `Patient ${patientName || 'User'} took a diagnostic test at Vending Machine Clinic.
Test: ${testType}
Value: ${value}
Normal reference range: ${normalRange}

Provide a concise, patient-friendly summary in simple English and its Telugu translation, followed by a short lifestyle recommendation. Format as JSON with keys:
"summaryEn": "1-2 sentences simple English summary",
"summaryTe": "1-2 sentences Telugu translation in Telugu script",
"advice": "1 practical actionable lifestyle/diet tip"`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              },
            });

            const text = response.text || '{}';
            let parsed = {};
            try {
              parsed = JSON.parse(text);
            } catch {
              parsed = {
                summaryEn: `Your ${testType} test result is ${value}. Maintain proper hydration and consult a physician.`,
                summaryTe: `మీ ${testType} పరీక్ష ఫలితం ${value}. తగినంత నీరు త్రాగండి మరియు వైద్యుడిని సంప్రదించండి.`,
                advice: 'Follow up with a routine checkup in 30 days.'
              };
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(parsed));
          } catch (err) {
            console.error('Gemini API error in middleware:', err);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              summaryEn: `Your test reading has been recorded. Drink plenty of water, maintain healthy sleep and consult our doctor for guidance.`,
              summaryTe: `మీ పరీక్ష వివరాలు నమోదు చేయబడ్డాయి. పుష్కలంగా నీరు త్రాగండి మరియు తదుపరి సలహా కొరకు వైద్యుడిని సంప్రదించండి.`,
              advice: 'Hydrate well and rest.'
            }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
