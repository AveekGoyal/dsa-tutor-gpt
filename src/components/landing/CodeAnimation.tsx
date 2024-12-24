import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

const codeSnippet = `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`;

export function CodeAnimation() {
  const controls = useAnimation();

  useEffect(() => {
    const animate = async () => {
      while (true) {
        await controls.start({
          opacity: [0.5, 1, 0.5],
          transition: { duration: 2, repeat: Infinity },
        });
      }
    };
    animate();
  }, [controls]);

  return (
    <motion.div
      className="w-full max-w-lg aspect-square bg-muted rounded-lg p-8 overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <pre className="text-sm md:text-base font-mono overflow-x-auto">
        <code className="language-javascript">{codeSnippet}</code>
      </pre>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
        animate={controls}
      />
    </motion.div>
  );
}
