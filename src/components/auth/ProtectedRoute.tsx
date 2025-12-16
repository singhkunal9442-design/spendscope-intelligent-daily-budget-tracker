import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBudgetStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useBudgetStore(s => s.token);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!token;
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: { from: location.pathname },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location.pathname]);
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
        <div className="flex flex-col items-center gap-8 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.1, 1],
              opacity: 1,
              boxShadow: ["0 0 0px rgba(243,128,32,0)", "0 0 40px rgba(243,128,32,0.4)", "0 0 0px rgba(243,128,32,0)"]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-6 rounded-[2.5rem] bg-gradient-to-br from-spendscope-500 to-orange-600 text-white"
          >
            <Wallet className="w-12 h-12" />
          </motion.div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-black tracking-tighter text-white">Verifying Session</h2>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-spendscope-500"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
export default ProtectedRoute;