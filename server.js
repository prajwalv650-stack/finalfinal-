const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ════════════════════════════════════════════════════════
// GEMINI MODELS CONFIGURATION
// ════════════════════════════════════════════════════════

// Available Gemini models (in order of preference)
const GEMINI_MODELS = [
  'models/gemini-2.5-flash',      // Latest: 1M tokens, most capable
  'models/gemini-2.5-pro',        // Latest Pro: 1M tokens, most powerful
  'models/gemini-2.5-flash-lite', // Latest Lite: 1M tokens, faster
  'models/gemini-2.0-flash',      // Stable: 8K tokens
  'models/gemini-2.0-flash-001',  // Stable version: 8K tokens
  'models/gemini-2.0-flash-lite', // Lite version: 8K tokens
];

// Model metadata for reference
const MODEL_CONFIG = {
  'models/gemini-2.5-flash': {
    maxTokens: 1048576,
    outputTokens: 65536,
    thinking: true,
    description: 'Mid-size multimodal (latest)'
  },
  'models/gemini-2.5-pro': {
    maxTokens: 1048576,
    outputTokens: 65536,
    thinking: true,
    description: 'Pro model (latest, most powerful)'
  },
  'models/gemini-2.5-flash-lite': {
    maxTokens: 1048576,
    outputTokens: 65536,
    thinking: true,
    description: 'Fast lite model (latest)'
  },
  'models/gemini-2.0-flash': {
    maxTokens: 1048576,
    outputTokens: 8192,
    thinking: false,
    description: 'Fast versatile model'
  },
  'models/gemini-2.0-flash-001': {
    maxTokens: 1048576,
    outputTokens: 8192,
    thinking: false,
    description: 'Stable version'
  },
  'models/gemini-2.0-flash-lite': {
    maxTokens: 1048576,
    outputTokens: 8192,
    thinking: false,
    description: 'Lite version'
  },
};

// Track model usage statistics
const modelStats = {};
GEMINI_MODELS.forEach(model => {
  modelStats[model] = { success: 0, failed: 0, totalTime: 0 };
});

// System prompt for Vedic astrology
const SYSTEM_PROMPT = `You are Jyotish Guru — a deeply learned Vedic astrologer with mastery of Parashari Jyotish, Nadi astrology, and classical texts including Brihat Parashara Hora Shastra, Phala Deepika, and Saravali.

You receive ASTRONOMICALLY ACCURATE chart data computed via Jean Meeus algorithms with Lahiri ayanamsa. These positions are precise — trust them completely and build your analysis entirely from this data.

CORE PRINCIPLES:
1. Be specific to the actual chart data provided — never generic
2. Use correct house rulership and aspect theory (Parashari aspects)
3. Identify yogas from actual planetary positions
4. Consider mutual aspects, conjunctions, and house lords
5. Acknowledge both benefic and malefic influences honestly
6. Connect dasha timing to specific life areas based on the chart
7. Use warm, wise, non-fear-based language
8. Employ proper Vedic terminology throughout
9. Note that Rahu/Ketu are always retrograde in Vedic astrology
10. Format all output with ### headings and bullet points for clarity

For yogas: check for Raj Yoga, Dhana Yoga, Gaja Kesari, Kemadruma, Vipareeta Raja Yoga, etc. from ACTUAL positions.
For remedies: recommend traditional Vedic remedies (mantra, gemstone, puja, charity, fasting) appropriate to the chart's specific challenges.`;

// ════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINT
// ════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    modelsAvailable: GEMINI_MODELS.length,
    apiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// ════════════════════════════════════════════════════════
// MODEL STATISTICS ENDPOINT
// ════════════════════════════════════════════════════════

app.get('/api/models', (req, res) => {
  const stats = {};
  for (const [model, data] of Object.entries(modelStats)) {
    const config = MODEL_CONFIG[model];
    stats[model] = {
      ...config,
      stats: {
        successCount: data.success,
        failureCount: data.failed,
        avgResponseTime: data.success > 0 ? (data.totalTime / data.success).toFixed(2) + 'ms' : 'N/A'
      }
    };
  }
  res.json(stats);
});

// ════════════════════════════════════════════════════════
// MAIN GEMINI API ENDPOINT WITH FALLBACK LOGIC
// ════════════════════════════════════════════════════════

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, preferredModel, maxRetries } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
      });
    }

    // Determine model priority
    let modelsToTry = GEMINI_MODELS;
    if (preferredModel && GEMINI_MODELS.includes(preferredModel)) {
      // Put preferred model first
      modelsToTry = [
        preferredModel,
        ...GEMINI_MODELS.filter(m => m !== preferredModel)
      ];
    }

    // Limit retries
    const retryLimit = Math.min(maxRetries || GEMINI_MODELS.length, GEMINI_MODELS.length);
    modelsToTry = modelsToTry.slice(0, retryLimit);

    let lastError = null;
    let usedModel = null;
    let attempts = 0;

    console.log(`[${new Date().toISOString()}] Trying ${modelsToTry.length} model(s) for request`);

    // Try each model in order until one succeeds
    for (const model of modelsToTry) {
      attempts++;
      const startTime = Date.now();

      try {
        console.log(`[Attempt ${attempts}/${modelsToTry.length}] Using model: ${model}`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: MODEL_CONFIG[model].outputTokens,
              temperature: 0.65,
              topP: 0.95
            }
          })
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
          
          // Log failure
          modelStats[model].failed++;
          lastError = errorMessage;

          console.warn(`[Attempt ${attempts}] ${model} failed: ${errorMessage} (${responseTime}ms)`);

          // Don't throw yet - try next model
          continue;
        }

        const data = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
          modelStats[model].failed++;
          lastError = 'No response text from API';
          console.warn(`[Attempt ${attempts}] ${model} returned empty result`);
          continue;
        }

        // Success! Update stats and return
        modelStats[model].success++;
        modelStats[model].totalTime += responseTime;
        usedModel = model;

        console.log(`[SUCCESS] ${model} succeeded in ${responseTime}ms (Total successful: ${modelStats[model].success})`);

        return res.json({ 
          result,
          metadata: {
            model: usedModel,
            attempts: attempts,
            responseTime: responseTime,
            totalModelsAvailable: GEMINI_MODELS.length
          }
        });

      } catch (error) {
        modelStats[model].failed++;
        lastError = error.message;
        console.error(`[Attempt ${attempts}] ${model} error:`, error.message);
        // Continue to next model
      }
    }

    // All models failed
    console.error(`[FAILED] All ${modelsToTry.length} model(s) failed. Last error: ${lastError}`);
    
    return res.status(503).json({ 
      error: `All available models failed. Last error: ${lastError}`,
      details: {
        attemptedModels: modelsToTry,
        totalAttempts: attempts
      }
    });

  } catch (error) {
    console.error('[FATAL] Gemini API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
});

// ════════════════════════════════════════════════════════
// SERVE STATIC FILES
// ════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ════════════════════════════════════════════════════════
// ERROR HANDLING MIDDLEWARE
// ════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║       🌟 Jyotish Guru Server Started 🌟              ║
╚════════════════════════════════════════════════════════╝

📍 Server running on port: ${PORT}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
🔑 Gemini API key: ${process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ NOT CONFIGURED'}
📊 Available models: ${GEMINI_MODELS.length}

Available endpoints:
  GET  /health              - Health check
  GET  /api/models          - Model statistics
  POST /api/gemini          - Gemini API proxy

Models ready (in priority order):
${GEMINI_MODELS.map((m, i) => `  ${i + 1}. ${m}`).join('\n')}

Ready to receive requests!
  `);
});
