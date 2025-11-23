import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedListProps {
  children: ReactNode[];
  staggerDelay?: number;
}

export function AnimatedList({ children, staggerDelay = 0.05 }: AnimatedListProps) {
  return (
    <>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}
