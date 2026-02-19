import React from 'react';
import { motion } from 'framer-motion';

const AnimatedItem = ({ children, delay = 0, type = "fade" }) => {
  const animations = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    slideDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 }
    }
  };

  const animation = animations[type] || animations.fade;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animation}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedItem;