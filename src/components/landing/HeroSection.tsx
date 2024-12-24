import { RainbowButton } from "@/components/ui/rainbow-button";
import { BoxReveal } from "@/components/ui/box-reveal";
import { motion } from "framer-motion";
import Link from "next/link";
import { LanguagesOrbit } from "./LanguagesOrbit";
import { TypingTopics } from "@/components/ui/typing-topics";

export function HeroSection() {
  return (
    <section id="hero" className="container flex flex-col-reverse md:flex-row items-center justify-between py-20 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        <div className="space-y-4 max-w-2xl">
          <BoxReveal boxColor="#000" duration={0.5}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary">
              Your AI-Powered DSA Journey Starts Here
            </h1>
          </BoxReveal>

          <BoxReveal boxColor="#000" duration={0.5}>
            <p className="text-lg text-muted-foreground">
              Enhance your problem-solving skills with personalized AI assistance.
            </p>
          </BoxReveal>

          <BoxReveal boxColor="#000" duration={0.5}>
            <p className="text-lg text-muted-foreground">
              → Understand problems deeply<br />
              → Get guided solution steps<br />
              → Learn optimal approaches
            </p>
          </BoxReveal>

          <BoxReveal boxColor="#000" duration={0.5}>
            <TypingTopics />
          </BoxReveal>

          <BoxReveal boxColor="#000" duration={0.5}>
            <div className="pt-4">
              <Link href="/auth/register">
                <RainbowButton>Get Started</RainbowButton>
              </Link>
            </div>
          </BoxReveal>
        </div>
      </motion.div>

      <div className="flex-1">
        <LanguagesOrbit />
      </div>
    </section>
  );
}
