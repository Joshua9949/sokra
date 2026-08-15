import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { Statements } from "@/components/landing/Statements";
import { Subjects } from "@/components/landing/Subjects";
import { Experience } from "@/components/landing/Experience";
import { Onchain } from "@/components/landing/Onchain";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { useReveal } from "@/hooks/useReveal";
import { useWallet } from "@/lib/wallet";
import { Onboarding } from "@/components/Onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sokra — The onchain intelligent teacher" },
      {
        name: "description",
        content:
          "Sokra teaches through conversation. No quizzes. No lessons. Just understanding — verified by GenLayer and issued to your wallet.",
      },
      { property: "og:title", content: "Sokra — The onchain intelligent teacher" },
      {
        property: "og:description",
        content:
          "A conversational intelligence powered by GenLayer. Earn soulbound credentials when Sokra decides you understand.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useReveal();
  const { user } = useWallet();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-open onboarding if user just connected & hasn't completed it.
  useEffect(() => {
    if (user && !user.onboarding_complete) setShowOnboarding(true);
  }, [user]);

  return (
    <div className="relative min-h-screen">
      <LandingNav onNew={() => setShowOnboarding(true)} />
      <main className="relative z-10">
        <Hero onNew={() => setShowOnboarding(true)} />
        <Statements />
        <Subjects />
        <Experience />
        <Onchain />
        <CTA onNew={() => setShowOnboarding(true)} />
      </main>
      <Footer />
      {showOnboarding && <Onboarding />}
    </div>
  );
}
