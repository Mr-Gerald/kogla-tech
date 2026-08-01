import React from 'react';
import { ReviewSection } from '../components/ReviewSection';

export default function Reviews() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-black text-white font-sans">
      <ReviewSection 
        title="Kogla Tech Community Reviews"
        subtitle="Explore real student testimonials, service reviews, interactive feedback, and technical discussions across Kogla Tech Global."
      />
    </div>
  );
}
