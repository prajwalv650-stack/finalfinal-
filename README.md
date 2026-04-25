# Jyotish Guru — Vedic Astrology AI

A full-stack Vedic astrology application powered by AI (Gemini API) with accurate astrological calculations using Jean Meeus algorithms and Lahiri ayanamsa.

## Features

✨ **Accurate Calculations**
- Jean Meeus ephemeris algorithms
- Lahiri ayanamsa (sidereal zodiac)
- Precise planetary positions & houses
- Vimshottari dasha system

🤖 **AI-Powered Analysis**
- Gemini AI integration for deep insights
- Kundali (birth chart) interpretation
- Kundali matching (compatibility analysis)
- Personalized remedies & guidance

🌍 **Global City Database**
- 60+ cities with pre-configured coordinates
- Automatic timezone detection
- Geolocation support

## Project Structure

```
├── server.js           # Node.js/Express backend
├── package.json        # Dependencies
├── public/
│   └── index.html      # Frontend (single-page app)
├── .env                # Environment variables (local)
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── Procfile            # Heroku/Railway process definition
├── railway.json        # Railway.app config
└── README.md           # This file
```

## Setup Instructions

### Local Development

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd jyotish-guru
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Get a Gemini API Key
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create a new API key
- Copy the key

#### 4. Configure environment
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
PORT=3000
NODE_ENV=development
```

#### 5. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Deployment on Railway

#### 1. Push code to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Deploy on Railway
- Go to [railway.app](https://railway.app)
- Click "New Project"
- Select "Deploy from GitHub"
- Choose your repository
- Railway will automatically detect the `server.js` and `package.json`

#### 3. Add Environment Variables
In Railway Dashboard:
1. Go to Variables
2. Add `GEMINI_API_KEY` with your actual key
3. Optional: Set `NODE_ENV=production`

#### 4. Enable Public URL
- Your app will be available at a Railway-provided URL
- Custom domain can be configured in Railway settings

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment mode (default: development) |

**⚠️ IMPORTANT:** Never commit `.env` file. Railway will use the variables set in the dashboard.

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Gemini API Proxy
```
POST /api/gemini
Content-Type: application/json

{
  "prompt": "Your analysis prompt here"
}
```

**Response:**
```json
{
  "result": "AI-generated response"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## How It Works

### Architecture Flow

```
Frontend (index.html)
         ↓
    HTTP Request
         ↓
Backend (server.js)
         ↓
Validates & Proxies
         ↓
    Gemini API
         ↓
    Response
         ↓
Frontend Display
```

### Key Improvements from Direct API

✅ **Security**: API key never exposed to frontend
✅ **Rate Limiting**: Can be added at backend level
✅ **Error Handling**: Centralized error management
✅ **Flexibility**: Easy to add authentication/logging
✅ **Deployment Ready**: Proper structure for production

## Frontend Features

### Tab 1: Single Chart Reading
- Birth date, time, place input
- Planetary positions calculation
- Dasha analysis
- AI interpretation via Gemini

### Tab 2: Kundali Matching
- Two persons' data entry
- Ashta-Koota compatibility scoring
- Mangal Dosha checking
- Detailed compatibility analysis

### Technical Highlights
- No external build process (vanilla HTML/JS)
- Pure calculation algorithms (no library dependency)
- Responsive design with Vedic aesthetic
- Real-time calculations

## Troubleshooting

### "Gemini API key not configured"
- Ensure `GEMINI_API_KEY` is set in `.env` (local) or Railway variables (production)
- Verify the key is valid and has API quota remaining

### "Failed to fetch"
- Check if backend is running (`npm run dev`)
- Verify API endpoint is `/api/gemini`
- Check browser console for CORS errors

### Port already in use
- Change `PORT` in `.env` or use: `PORT=3001 npm run dev`

### Railway deployment fails
- Check build logs: `railway logs --service=<service-name>`
- Verify `package.json` exists
- Ensure `npm install` completes successfully

## Performance Tips

- **Caching**: Consider caching chart calculations on backend
- **Rate Limiting**: Implement to prevent API abuse
- **CDN**: Use Railway's built-in CDN for static files
- **Compression**: Express automatically enables gzip

## Security Considerations

🔒 **API Key Protection**
- Never hardcode keys in frontend
- Use backend proxy pattern (as implemented)
- Rotate keys periodically

🔒 **CORS Configuration**
- Currently allows all origins (update for production)
- Restrict to specific domains if needed

🔒 **Input Validation**
- Backend validates all incoming prompts
- SQL injection not applicable (no database)
- Consider prompt sanitization for specific use cases

## Future Enhancements

- 🗄️ Database for storing user charts
- 🔐 User authentication system
- 📧 Email notifications
- 📊 Chart history & comparisons
- 🌐 Multi-language support
- 📱 Mobile app (React Native)

## Support

For issues or questions:
- Check Railway logs: `railway logs`
- Review .env configuration
- Verify Gemini API quota at [Google AI Studio](https://aistudio.google.com/app/apikey)

## License

MIT License - Feel free to use for personal or commercial projects

## Disclaimer

This application provides astrological insights for educational and entertainment purposes. Vedic astrology is an ancient science; results are interpretive and should not replace professional advice.

---

**Built with ❤️ using Node.js, Express, and Google Gemini AI**
