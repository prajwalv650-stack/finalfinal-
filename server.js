const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoint for Gemini calls
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' 
      });
    }

    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

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

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.65,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Gemini API error: HTTP ${response.status}`;
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      return res.status(500).json({ error: 'No response from Gemini API' });
    }

    res.json({ result });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Jyotish Guru server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Gemini API configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
});
