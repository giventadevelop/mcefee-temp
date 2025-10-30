'use client';

/**
 * Facebook Sign-In Button Component
 *
 * Handles Facebook OAuth authentication flow via backend
 */

import React from 'react';

interface FacebookSignInButtonProps {
  onError?: (error: string) => void;
}

export function FacebookSignInButton({ onError }: FacebookSignInButtonProps) {
  const handleClick = () => {
    try {
      const redirectUrl = window.location.pathname;

      // Use frontend API proxy route (which adds tenant ID and JWT auth)
      const oauthUrl = `/api/oauth/facebook/initiate?redirectUrl=${encodeURIComponent(redirectUrl)}`;

      window.location.href = oauthUrl;
    } catch (error: any) {
      console.error('Error initiating Facebook OAuth:', error);
      onError?.(error.message || 'Failed to initiate Facebook sign-in');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-blue-600 hover:bg-blue-700 font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
      Continue with Facebook
    </button>
  );
}

export default FacebookSignInButton;
