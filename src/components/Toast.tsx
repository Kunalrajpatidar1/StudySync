import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface ToastProps {
  toast: string;
}

export function Toast({ toast }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          role="status"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <Check size={16} />
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
