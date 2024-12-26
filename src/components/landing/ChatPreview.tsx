/**
 * @dev Landing page component that showcases chat interface screenshots
 * Features: animated screenshots, responsive layout, scroll reveal animations
 */

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BoxReveal } from "@/components/ui/box-reveal";

/**
 * @dev Configuration for chat interface screenshots
 * Each screenshot has a source, alt text, and initial animation position
 */
const screenshots = [
  {
    src: "/chat-preview-1.png",
    alt: "Chat preview 1",
    initialX: -20,
    initialY: 0,
  },
  {
    src: "/chat-preview-2.png",
    alt: "Chat preview 2",
    initialX: 0,
    initialY: -20,
  },
  {
    src: "/chat-preview-3.png",
    alt: "Chat preview 3",
    initialX: 20,
    initialY: 0,
  },
];

export function ChatPreview() {
  return (
    <section id="chat-preview" className="container py-10 relative overflow">
      {/* Heading */}
      <div className="text-center space-y-2 mb-16 mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            Experience Interactive Learning
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master Data Structures & Algorithms with AI-powered guidance
          </p>
      </div>

      {/* Screenshots Gallery */}
      <div className="relative h-[600px] w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={screenshot.src}
              className="absolute"
              style={{
                zIndex: screenshots.length - index,
                translateX: screenshot.initialX + '%',
                translateY: screenshot.initialY + '%',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -10, 0],
                rotate: [0, index % 2 === 0 ? 1 : -1, 0],
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                },
                rotate: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                }
              }}
              whileHover={{ 
                scale: 1.05,
                zIndex: 10,
                transition: { duration: 0.3 }
              }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  width={700}
                  height={400}
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Individual screenshot glow effect */}
              <motion.div
                className="absolute -z-10 w-full h-20 blur-xl bg-gradient-to-r from-[#ffaa40]/10 via-[#9c40ff]/30 to-[#ffaa40]/10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
