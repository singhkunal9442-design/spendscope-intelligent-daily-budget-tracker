import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, Zap, ArrowRight, BarChart3 } from 'lucide-react';
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.6, 
      ease: [0.215, 0.61, 0.355, 1] as const 
    }
  })
};
export function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 dark:from-zinc-900/50 to-transparent -z-10" />
        <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible" className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            Finance meets <br />
            <span className="text-zinc-400 dark:text-zinc-600">Simplicity.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 font-medium tracking-tight">
            Master your daily budget with elegant clarity. Real-time insights, zero-knowledge security, and a beautiful interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 shadow-xl hover:scale-105 transition-transform">
              <Link to="/login">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full text-lg font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <Link to="/blog">Read Blog</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible" className="mt-20 w-full max-w-6xl mx-auto px-4">
          <div className="aspect-[21/9] rounded-[2rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000"
              alt="Premium Workspace"
              className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30"
            />
          </div>
        </motion.div>
      </section>
      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Intelligent Budgeting', icon: BarChart3, desc: 'Our "Scope" logic helps you stay on track day by day, not just month by month.' },
            { title: 'Privacy First', icon: Shield, desc: 'Your data is encrypted and stored in global Durable Objects for unmatched security.' },
            { title: 'Real-time Sync', icon: Zap, desc: 'Every transaction reflects instantly across all your devices via Cloudflare edge.' }
          ].map((f, i) => (
            <motion.div
              key={i} custom={i} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="p-10 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
            >
              <f.icon className="w-10 h-10 mb-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
              <h3 className="text-2xl font-black tracking-tight mb-4">{f.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-24 bg-zinc-900 text-white w-full">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Active Users', value: '10k+' },
            { label: 'Security Score', value: '100%' },
            { label: 'Global Edge Nodes', value: '300+' },
            { label: 'Average Savings', value: '25%' }
          ].map((s, i) => (
            <div key={i}>
              <p className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{s.value}</p>
              <p className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Footer */}
      <footer className="py-24 px-6 text-center border-t border-zinc-100 dark:border-zinc-900">
        <h2 className="text-4xl font-black tracking-tighter mb-8">Ready to take control?</h2>
        <Button asChild size="lg" className="h-16 px-12 rounded-full text-xl font-bold bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900">
          <Link to="/login">Join SpendScope</Link>
        </Button>
        <p className="mt-12 text-zinc-400 text-sm font-medium">Built with ❤�� at Cloudflare</p>
      </footer>
    </div>
  );
}