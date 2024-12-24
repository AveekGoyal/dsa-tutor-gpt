import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Terminal, Code2, TestTube, Lightbulb, FileCode, Bug } from "lucide-react";
import { ChatPreview } from "./ChatPreview";

const stages = [
  {
    icon: Terminal,
    title: "Problem Understanding",
    description: "Break down the problem, analyze requirements, and identify constraints.",
  },
  {
    icon: TestTube,
    title: "Test Case Analysis",
    description: "Review sample cases, identify edge cases, and validate inputs.",
  },
  {
    icon: Lightbulb,
    title: "Logic Building",
    description: "Brainstorm approaches, recognize patterns, and develop solution strategy.",
  },
  {
    icon: Code2,
    title: "Algorithm & Pseudo Code",
    description: "Develop step-by-step algorithm and analyze complexity.",
  },
  {
    icon: FileCode,
    title: "Implementation",
    description: "Write code with guidance, following best practices.",
  },
  {
    icon: Bug,
    title: "Dry Run & Debug",
    description: "Test, identify bugs, and optimize performance.",
  },
];

function StageCard({ stage, index }: { stage: typeof stages[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const Icon = stage.icon;

  return (
    <motion.div
      ref={cardRef}
      style={{ y, opacity }}
      className="relative flex items-start gap-4 bg-card p-6 rounded-lg shadow-lg"
    >
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold">
        {index + 1}
      </div>
      <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{stage.title}</h3>
        <p className="text-muted-foreground">{stage.description}</p>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="container mt-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-bold">
          Experience AI-Guided Learning
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Our intelligent system breaks down complex problems into manageable steps,
          making DSA approachable for everyone.
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Journey Line */}
        <div className="absolute left-[47px] top-8 bottom-8 w-0.5 bg-primary/30" />

        {/* Stage Cards */}
        <div className="space-y-8">
          {stages.map((stage, index) => (
            <StageCard key={stage.title} stage={stage} index={index} />
          ))}
        </div>
      </div>

      {/* Chat Preview Section */}
      <div className="mb-1">
        <ChatPreview />
      </div>
    </section>
  );
}
