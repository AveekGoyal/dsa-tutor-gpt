/**
 * @dev Home page component for the application
 * Features: landing page sections, responsive layout, client-side rendering
 */

"use client";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import LandingLayout from '@/components/layout/LandingLayout';

/**
 * @dev Main home page component that combines all landing page sections
 * Uses client-side rendering for interactive features
 */
export default function Home() {
  return (
    <LandingLayout>
      <main className="flex min-h-screen flex-col">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
    </LandingLayout>
  );
}