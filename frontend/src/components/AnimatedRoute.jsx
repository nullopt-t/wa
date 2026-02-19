import React from 'react';
import { motion } from 'framer-motion';

const AnimatedRoute = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        stiffness: 100,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedRoute;