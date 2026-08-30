"use client";

import React, { useState, useEffect } from 'react';
import PremiumReader from '@/components/PremiumReader';

export default function PremiumReaderPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<string>('freemium');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserProfile(data.user);
          setSubscription(data.subscription.plan.toLowerCase());
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-xs text-gray-400">Loading reader...</p>
        </div>
      </div>
    );
  }

  return (
    <PremiumReader userProfile={userProfile} subscription={subscription} isEmbedded={false} />
  );
}
