# 🚀 Quick Deploy Guide

## Step 1: Get Web3Forms Key (2 minutes)

1. Go to **https://web3forms.com/**
2. Enter your email → Click "Create Access Key"
3. Check your email → Verify
4. Copy the access key

## Step 2: Update Landing Page

Edit `public/landing.html` line 1017:

```html
<input type="hidden" name="access_key" value="PASTE_YOUR_KEY_HERE">
```

## Step 3: Deploy to Vercel

### Option A: Quick Deploy (Recommended)

```bash
# In your project directory
npx vercel --prod
```

### Option B: Via Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"

## Done! 🎉

Your landing page will be live at:
- `https://your-project.vercel.app/landing.html`

## Test the Form

1. Visit your landing page
2. Enter an email and click "Get Started"
3. Check for success message
4. Check your email inbox for the submission

## Access Your Landing Page

The page is available at these URLs:
- **Main**: `https://your-domain.vercel.app/landing.html`
- **Root**: Set as homepage (optional - see below)

## Make it Your Homepage (Optional)

To make landing.html your root page, you have two options:

### Option 1: Update vercel.json

Add to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/", "destination": "/landing.html" }
  ]
}
```

### Option 2: Rename the file

```bash
mv public/landing.html public/index.html
```

Then redeploy.

## Troubleshooting

**Form not working?**
- Check if you added the Web3Forms access key
- Check browser console for errors
- Verify your email is confirmed in Web3Forms

**Page not loading?**
- Verify the file is in `public/` directory
- Check Vercel deployment logs
- Try a hard refresh (Cmd+Shift+R)

## Next Steps

- [ ] Get Web3Forms key
- [ ] Add key to landing page
- [ ] Deploy to Vercel
- [ ] Test the form
- [ ] Share the URL!

For full documentation, see [LANDING_PAGE_SETUP.md](./LANDING_PAGE_SETUP.md)
