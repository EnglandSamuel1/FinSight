import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual email service
    // Options: SendGrid, Resend, Postmark, or Web3Forms

    // For now, using Web3Forms (free, no backend needed)
    const WEB3FORMS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

    if (!WEB3FORMS_KEY) {
      console.warn('WEB3FORMS_ACCESS_KEY not set. Simulating success for development.');
      // In development, just log it
      console.log('Waitlist signup:', email);

      return NextResponse.json({
        success: true,
        message: 'Successfully added to waitlist (dev mode)',
      });
    }

    // Submit to Web3Forms
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('email', email);
    formData.append('subject', 'New FinSight Waitlist Signup');
    formData.append('from_name', 'FinSight Landing Page');

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Submission failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist',
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process request',
      },
      { status: 500 }
    );
  }
}
