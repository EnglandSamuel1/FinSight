# FinSight Landing Page - Production Setup Guide

## Overview

The production-ready landing page is located at:
- **File**: `public/landing.html`
- **Live URL**: Will be available at `https://your-domain.vercel.app/landing.html`

## Quick Start

### 1. Get Your Web3Forms Access Key (FREE)

Web3Forms is a free email forwarding service that requires no backend.

1. Go to https://web3forms.com/
2. Click "Create Access Key"
3. Enter your email address (where you want to receive signups)
4. Verify your email
5. Copy your Access Key

### 2. Add Access Key to Landing Page

Edit `public/landing.html` and replace this line:

```html
<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">
```

With your actual key:

```html
<input type="hidden" name="access_key" value="your-actual-key-here">
```

### 3. Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Or deploy to production directly
vercel --prod
```

#### Option B: Via GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com/
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Next.js and deploy

#### Option C: Drag & Drop

1. Go to https://vercel.com/new
2. Drag the `public` folder
3. Deploy

## Configuration Options

### Environment Variables (Optional)

If you want to use different email services or add custom configuration:

1. Create a `.env.local` file:
```env
NEXT_PUBLIC_CONTACT_EMAIL=hello@finsight.app
NEXT_PUBLIC_WEB3FORMS_KEY=your-key-here
```

2. Update the form to use environment variables (requires Next.js API route)

### Custom Domain

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `finsight.app`)
4. Follow DNS configuration instructions

### Analytics (Optional)

The landing page includes tracking for both Google Analytics and Plausible:

**Google Analytics:**
```html
<!-- Add before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Plausible (Privacy-friendly alternative):**
```html
<!-- Add before </head> -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## File Structure

```
FinSight/
├── public/
│   ├── landing.html          # Production landing page
│   └── [other assets]
├── docs/
│   └── landing-page-mockup.html  # Original mockup (for reference)
└── LANDING_PAGE_SETUP.md     # This file
```

## Features

### ✅ Production-Ready Features

- **Email Collection**: Web3Forms integration (free, no backend)
- **Form Validation**: HTML5 + custom JavaScript validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Visual feedback during submission
- **Success Confirmation**: Animated success message
- **Spam Protection**: Honeypot field for bot prevention
- **Responsive Design**: Mobile-first, works on all devices
- **SEO Optimized**: Comprehensive meta tags
- **Social Sharing**: Open Graph + Twitter Card meta tags
- **Performance**: Lightweight, fast loading
- **Accessibility**: WCAG 2.1 Level AA compliant

### 🎨 Design Features

- Professional gradient design
- Smooth animations
- Trust-building color scheme (teal/cyan)
- Dashboard preview mockup
- Social proof stats
- Clear call-to-action

## Testing Checklist

Before going live, test these:

- [ ] Submit form with valid email → Should show success message
- [ ] Submit form with invalid email → Should show validation error
- [ ] Check email arrives in your inbox
- [ ] Test on mobile device
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify all links work
- [ ] Check responsive design (resize browser)
- [ ] Test smooth scrolling to #signup section
- [ ] Verify no console errors

## Alternative Email Services

### Option 1: Formspree (Free tier available)

1. Sign up at https://formspree.io/
2. Create a new form
3. Get your form endpoint
4. Update form action:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### Option 2: Custom API Route (Next.js)

Create `app/api/waitlist/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  // Add your email service logic here
  // (SendGrid, Resend, etc.)

  return NextResponse.json({ success: true });
}
```

Then update form to POST to `/api/waitlist`

## Monitoring & Analytics

### Track Conversions

The form automatically tracks conversions when:
- Google Analytics is installed (`gtag` event: 'generate_lead')
- Plausible is installed (event: 'Waitlist Signup')

### Email Service Dashboard

Monitor signup rate via:
- Web3Forms dashboard: https://web3forms.com/
- Or your chosen email service dashboard

## Customization

### Update Content

Edit `public/landing.html`:

1. **Headline**: Search for "Budgeting that actually works"
2. **Description**: Search for "No spreadsheets"
3. **Stats**: Update numbers in hero-stats section
4. **CTA Text**: Search for "Join the waitlist"

### Update Colors

Change CSS variables in `:root`:

```css
:root {
  --primary: #0d9488;    /* Main brand color */
  --secondary: #0891b2;  /* Secondary brand color */
  /* ... */
}
```

### Add Sections

The mockup version (`docs/landing-page-mockup.html`) has additional sections:
- Features section
- Transformation comparison
- Extended footer

Copy these sections if needed.

## Troubleshooting

### Form not submitting?

1. Check browser console for errors
2. Verify Web3Forms access key is correct
3. Check email address in Web3Forms is verified
4. Test with a simple email first

### Not receiving emails?

1. Check spam folder
2. Verify your email in Web3Forms dashboard
3. Check Web3Forms submission logs
4. Try a different email service

### Styling issues?

1. Clear browser cache
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)
3. Check for CSS conflicts
4. Verify viewport meta tag is present

## Next Steps

After deployment:

1. ✅ Test the live landing page
2. ✅ Share the URL to collect signups
3. ✅ Monitor email submissions
4. ✅ Set up analytics tracking
5. ✅ Create social media posts with the URL
6. ✅ Consider A/B testing different headlines

## Support

For issues or questions:
- Web3Forms docs: https://docs.web3forms.com/
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs

## License

© 2025 FinSight. All rights reserved.
