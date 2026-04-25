#!/bin/bash
# Setup script for organizing files for Railway deployment

# Create public directory if it doesn't exist
mkdir -p public

# Move index.html to public folder (if not already there)
if [ -f "index.html" ] && [ ! -f "public/index.html" ]; then
  cp index.html public/index.html
  echo "✓ Copied index.html to public/"
else
  echo "✓ index.html already in public/ or not found"
fi

# Create a simple deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Railway Deployment Checklist

## Before Deployment

- [ ] `.env` file exists locally with `GEMINI_API_KEY` set
- [ ] `.env` is in `.gitignore` (not committed to Git)
- [ ] `package.json` exists with all dependencies listed
- [ ] `server.js` exists in root directory
- [ ] `index.html` exists in `public/` directory
- [ ] GitHub repository is created and pushed
- [ ] Git repository is connected to Railway

## Railway Configuration

- [ ] Project created on railway.app
- [ ] Connected to GitHub repository
- [ ] `GEMINI_API_KEY` environment variable added
- [ ] Build and deployment logs show success

## Post-Deployment

- [ ] Public URL is accessible
- [ ] `/health` endpoint returns 200 OK
- [ ] `/api/gemini` endpoint accepts POST requests
- [ ] Frontend loads correctly
- [ ] Astrology chart calculations work
- [ ] Gemini AI responds to prompts
- [ ] Monitor Railway logs for errors

## Troubleshooting

If deployment fails:
1. Check Railway build logs
2. Verify `package.json` exists
3. Check `GEMINI_API_KEY` is set
4. Review `server.js` syntax
5. Check Node version compatibility (18.x)
EOF

echo "✓ Created DEPLOYMENT_CHECKLIST.md"

# List final structure
echo ""
echo "Project structure ready for deployment:"
ls -la

EOF
