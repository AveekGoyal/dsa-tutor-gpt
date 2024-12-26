/**
 * @dev Visual component that displays programming language icons in an orbital animation
 * Features: multiple orbiting circles, staggered animations, responsive layout
 */

import OrbitingCircles from "@/components/ui/orbiting-circles";
import Image from "next/image";

/**
 * @dev Creates a dynamic display of programming languages orbiting around "DSA" text
 * Uses multiple orbital layers with different radii and animation timings
 */
export function LanguagesOrbit() {
  return (
    <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
        DSA
      </span>

      {/* Inner Circles */}
      <OrbitingCircles
        className="size-[30px] border-none bg-transparent"
        duration={20}
        delay={20}
        radius={120}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Image
            src="/icons/python.svg"
            alt="Python"
            width={24}
            height={24}
            className="size-6"
          />
        </div>
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[30px] border-none bg-transparent"
        duration={20}
        delay={10}
        radius={120}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Image
            src="/icons/c-.png"
            alt="C++"
            width={24}
            height={24}
            className="size-6"
          />
        </div>
      </OrbitingCircles>

      {/* Outer Circles (reverse) */}
      <OrbitingCircles
        className="size-[50px] border-none bg-transparent"
        radius={190}
        duration={20}
        reverse
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Image
            src="/icons/java.svg"
            alt="Java"
            width={32}
            height={32}
            className="size-8"
          />
        </div>
      </OrbitingCircles>
      <OrbitingCircles
        className="size-[50px] border-none bg-transparent"
        radius={190}
        duration={20}
        delay={20}
        reverse
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
          <Image
            src="/icons/c.svg"
            alt="C"
            width={32}
            height={32}
            className="size-8"
          />
        </div>
      </OrbitingCircles>
    </div>
  );
}
