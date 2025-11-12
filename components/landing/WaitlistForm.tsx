'use client';

import { useState } from 'react';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="animate-fadeIn">
        <div className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6 animate-scaleIn shadow-lg shadow-teal-500/30">
            ✓
          </div>
          <h3 className="text-3xl font-semibold text-slate-900 mb-4">
            You&apos;re on the list!
          </h3>
          <p className="text-lg text-slate-600">
            Thanks for signing up! We&apos;ll send you an email when we launch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-12">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          disabled={status === 'loading'}
          className="flex-1 min-w-[300px] px-6 py-5 text-lg border-2 border-white/30 rounded-xl bg-white/15 text-white placeholder:text-white/70 backdrop-blur-lg transition-all focus:outline-none focus:border-white focus:bg-white/25 focus:shadow-xl disabled:opacity-60"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-shrink-0 px-8 py-5 bg-white text-teal-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white/95 hover:-translate-y-1 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 whitespace-nowrap"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <span>Get Started →</span>
          )}
        </button>
      </div>
      <p className="text-center text-sm text-white/80">
        We respect your privacy. Unsubscribe at any time.
      </p>

      {status === 'error' && errorMessage && (
        <div className="mt-4 bg-red-500/20 border border-red-500/40 text-white px-6 py-4 rounded-xl text-center animate-fadeIn">
          {errorMessage}
        </div>
      )}
    </form>
  );
}
