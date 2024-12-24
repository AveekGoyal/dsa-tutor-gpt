"use client";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import LandingLayout from '@/components/layout/LandingLayout';

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