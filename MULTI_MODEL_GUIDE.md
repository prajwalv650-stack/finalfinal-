# Multi-Model Gemini API Implementation Guide

## 📋 Overview

Your Jyotish Guru application now supports **6 different Gemini models** with intelligent fallback logic. If one model fails or is unavailable, the system automatically tries the next model in the priority queue.

---

## 🎯 Supported Models

### Priority Order (Automatic Fallback)

| # | Model | Version | Input Tokens | Output Tokens | Features | Best For |
|---|-------|---------|--------------|---------------|----------|----------|
| 1 | `gemini-2.5-flash` | 2.5 | 1M | 65K | Multimodal, Thinking | **Latest, most capable** |
| 2 | `gemini-2.5-pro` | 2.5 | 1M | 65K | Pro-grade, Thinking | Complex reasoning |
| 3 | `gemini-2.5-flash-lite` | 2.5 | 1M | 65K | Fast, Thinking | Quick responses |
| 4 | `gemini-2.0-flash` | 2.0 | 1M | 8K | Versatile, Stable | Production-ready |
| 5 | `gemini-2.0-flash-001` | 2.0 | 1M | 8K | Stable version | Reliability |
| 6 | `gemini-2.0-flash-lite` | 2.0 | 1M | 8K | Lightweight | Cost-effective |

---

## 🔄 How Fallback Logic Works

### Request Flow

```
Client Request
     ↓
Try Model 1 (gemini-2.5-flash)
     ↓
Success? → Return Result + Metadata
     ↓ No
Try Model 2 (gemini-2.5-pro)
     ↓
Success? → Return Result + Metadata
     ↓ No
Try Model 3 (gemini-2.5-flash-lite)
     ↓
... continue for all 6 models ...
     ↓
All Failed? → Return 503 Error
```

### Key Features

✅ **Automatic Fallback** - Tries next model if current fails  
✅ **Performance Tracking** - Logs success/failure stats per model  
✅ **Custom Preferences** - Can request specific model  
✅ **Retry Limit** - Prevents infinite loops  
✅ **Detailed Logging** - Know which model was used  

---

## 📡 API Endpoint Usage

### Basic Usage (Automatic Model Selection)

```bash
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this birth chart..."
  }'
```

**Response:**
```json
{
  "result": "AI analysis here...",
  "metadata": {
    "model": "models/gemini-2.5-flash",
    "attempts": 1,
    "responseTime": 2345,
    "totalModelsAvailable": 6
  }
}
```

### Advanced: Specify Preferred Model

```bash
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Your prompt here",
    "preferredModel": "models/gemini-2.5-pro",
    "maxRetries": 3
  }'
```

**Parameters:**
- `prompt` (required) - Your request text
- `preferredModel` (optional) - Which model to try first
- `maxRetries` (optional) - Max number of models to try (1-6)

### Get Model Statistics

```bash
curl http://localhost:3000/api/models
```

**Response:**
```json
{
  "models/gemini-2.5-flash": {
    "maxTokens": 1048576,
    "outputTokens": 65536,
    "thinking": true,
    "description": "Mid-size multimodal (latest)",
    "stats": {
      "successCount": 45,
      "failureCount": 2,
      "avgResponseTime": "1823.45ms"
    }
  },
  ...
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-17T10:30:45.123Z",
  "modelsAvailable": 6,
  "apiConfigured": true
}
```

---

## 🎨 Frontend Integration

### Updated JavaScript

The HTML file now sends optional parameters:

```javascript
// Option 1: Let system choose model
const resp = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ 
    prompt: "Your prompt here"
  })
});

// Option 2: Request specific model
const resp = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ 
    prompt: "Your prompt here",
    preferredModel: "models/gemini-2.5-pro",
    maxRetries: 6
  })
});

// Option 3: Limit retries for speed
const resp = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ 
    prompt: "Your prompt here",
    maxRetries: 2  // Only try first 2 models
  })
});
```

### Response Handling

```javascript
const data = await resp.json();

// Get the AI response
const analysis = data.result;

// Get metadata about which model was used
const modelUsed = data.metadata.model;
const attempts = data.metadata.attempts;
const responseTime = data.metadata.responseTime;

console.log(`✓ Response from ${modelUsed} in ${responseTime}ms`);
```

---

## 🔧 Configuration

### Server Configuration (server.js)

Edit `GEMINI_MODELS` array to change priority order:

```javascript
const GEMINI_MODELS = [
  'models/gemini-2.5-flash',      // Try this first
  'models/gemini-2.5-pro',        // Then this
  'models/gemini-2.5-flash-lite', // etc...
  // ... rest of models
];
```

### Environment Variables

```env
GEMINI_API_KEY=AIzaSy...your_key_here  # Required
PORT=3000                              # Optional
NODE_ENV=production                    # Optional
```

---

## 📊 Monitoring & Diagnostics

### View Server Logs

```bash
# During development
npm run dev

# Check which models are being used
npm start  # Look for [Attempt X] logs
```

### Log Output Example

```
[2025-06-17T10:30:45.123Z] Trying 6 model(s) for request
[Attempt 1/6] Using model: models/gemini-2.5-flash
[SUCCESS] models/gemini-2.5-flash succeeded in 2345ms (Total successful: 45)
```

### Get Performance Stats

```bash
curl http://localhost:3000/api/models | jq '.["models/gemini-2.5-flash"].stats'
```

Output:
```json
{
  "successCount": 45,
  "failureCount": 2,
  "avgResponseTime": "1823.45ms"
}
```

---

## 🚀 Deployment to Railway

### No Changes Needed!

The updated code works automatically on Railway:

1. Push code to GitHub
2. Railway detects and deploys
3. Set `GEMINI_API_KEY` in Railway variables
4. All 6 models available immediately

### Railway Configuration

In Railway Dashboard → Variables:
```
GEMINI_API_KEY = AIzaSy...your_key
PORT = 3000
NODE_ENV = production
```

---

## 💡 Use Cases

### Use Case 1: Always Get a Response
```javascript
// Request without model preference - automatic fallback
const resp = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ prompt: "Analyze chart" })
});
// System tries all models until one succeeds
```

### Use Case 2: Require Latest Features
```javascript
// Request latest model with thinking capability
const resp = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ 
    prompt: "Complex analysis",
    preferredModel: "models/gemini-2.5-pro",
    maxRetries: 6  // Fall back if needed
  })
});
```

### Use Case 3: Speed Over Quality
```javascript
// Request fast, lightweight model
const resp = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ 
    prompt: "Quick analysis",
    preferredModel: "models/gemini-2.5-flash-lite",
    maxRetries: 2  // Try lite versions only
  })
});
```

### Use Case 4: Monitor Performance
```javascript
// Check which models are performing best
const stats = await fetch('/api/models').then(r => r.json());
const bestModel = Object.entries(stats).sort((a, b) => {
  return b[1].stats.successCount - a[1].stats.successCount;
})[0];
console.log('Most reliable model:', bestModel[0]);
```

---

## 🐛 Troubleshooting

### Issue: "All available models failed"

**Causes:**
- Invalid Gemini API key
- API quota exhausted
- Network connectivity issue

**Solution:**
1. Verify `GEMINI_API_KEY` is correct
2. Check Google AI Studio for quota limits
3. Check network connectivity
4. View server logs for specific errors

### Issue: Always using Model 6

**Cause:** Models 1-5 are failing

**Solution:**
```bash
# Check server logs
npm run dev

# Check health endpoint
curl http://localhost:3000/health

# Check if API key is configured
echo $GEMINI_API_KEY  # Should not be empty
```

### Issue: Slow Responses

**Solution 1: Use lighter model**
```javascript
{ preferredModel: "models/gemini-2.5-flash-lite" }
```

**Solution 2: Limit retries**
```javascript
{ maxRetries: 2 }  // Try only 2 models
```

**Solution 3: Monitor stats**
```bash
curl http://localhost:3000/api/models | jq '.[].stats.avgResponseTime'
```

---

## 📈 Performance Tips

### 1. Cache Successful Models
```javascript
// After first success, remember which model worked
let cachedModel = 'models/gemini-2.5-flash';
// Use in next request
fetch('/api/gemini', {
  body: JSON.stringify({ 
    prompt: "...",
    preferredModel: cachedModel 
  })
});
```

### 2. Adjust Output Tokens
Models automatically use appropriate token limits:
- `gemini-2.5-*`: 65,536 tokens output max
- `gemini-2.0-*`: 8,192 tokens output max

### 3. Monitor & Alert
```bash
# Check failure count
curl http://localhost:3000/api/models | jq '.[].stats.failureCount'
# If too high, may need to check API key
```

---

## 🔐 Security Notes

✅ **API Key Protection** - Only stored on server, never in frontend  
✅ **Model Validation** - Only allows whitelisted models  
✅ **Error Messages** - Generic errors to prevent info leakage  
✅ **Rate Limiting** - Can be added if needed  

---

## 📞 Support

### Check These First

1. **Is API key set?** `echo $GEMINI_API_KEY`
2. **Is server running?** `curl http://localhost:3000/health`
3. **Check logs:** `npm run dev` and look for [Attempt X] messages
4. **Test API:** `curl http://localhost:3000/api/models`

### Common Issues Table

| Issue | Check | Fix |
|-------|-------|-----|
| "All models failed" | API key | Set `GEMINI_API_KEY` correctly |
| Slow response | Response time stats | Use lighter model or cache |
| 503 error | Server logs | Check network, API quota |
| Model not used | Stats endpoint | Check `preferredModel` name |

---

## 🎯 Next Steps

1. **Test locally:** `npm run dev`
2. **Try different models:** Use `preferredModel` parameter
3. **Monitor stats:** Check `/api/models` endpoint
4. **Deploy to Railway:** Push to GitHub
5. **Monitor production:** Set up alerting on `/api/models`

---

## 📚 Additional Resources

- **Gemini API Docs:** https://ai.google.dev/docs
- **Model Comparison:** Check `/api/models` endpoint
- **Railway Docs:** https://docs.railway.app
- **Server Logs:** Check console output when running

---

**Your Jyotish Guru is now resilient and can handle any Gemini model!** 🌟
