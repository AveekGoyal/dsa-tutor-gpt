import TypingAnimation from "@/components/ui/typing-animation";
import { useEffect, useState } from "react";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import { cn } from "@/lib/utils";

const dsaTopics = [
  "Arrays",
  "Strings",
  "Recursion",
  "Searching",
  "Sorting",
  "Stacks",
  "Queue",
  "Tree",
  "Heap",
  "Graphs",
];

export function TypingTopics() {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingDuration = dsaTopics[currentTopicIndex].length * 75;
    const deletingDuration = dsaTopics[currentTopicIndex].length * 50;
    const pauseDuration = 1000;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setIsDeleting(true);
      } else {
        setCurrentTopicIndex((prev) => (prev + 1) % dsaTopics.length);
        setIsDeleting(false);
      }
    }, !isDeleting ? typingDuration + pauseDuration : deletingDuration);

    return () => clearTimeout(timeout);
  }, [currentTopicIndex, isDeleting]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xl font-semibold whitespace-nowrap">Master DSA topics like:</span>
      <div className="w-[120px]">
        <AnimatedGradientText>
          <div className="flex items-center justify-center h-[20px]">
            <TypingAnimation
              text={dsaTopics[currentTopicIndex]}
              duration={50}
              className={cn(
                "font-semibold text-xl animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40]",
                "bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent"
              )}
            />
          </div>
        </AnimatedGradientText>
      </div>
    </div>
  );
}
