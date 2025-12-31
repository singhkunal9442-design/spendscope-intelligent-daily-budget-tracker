import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
const POSTS = [
  {
    id: 1,
    title: "Mastering Your Daily Coffee Spend",
    excerpt: "How small daily habits add up to big monthly savings without sacrificing your morning joy.",
    category: "Financial Tips",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "The Psychology of 'Remaining Balance'",
    excerpt: "Why seeing exactly what you have left is more motivating than tracking what you already spent.",
    category: "Productivity",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Version 2.0: The Auth Update",
    excerpt: "Everything you need to know about our new secure login and multi-device sync features.",
    category: "Updates",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"
  }
];
export function BlogPage() {
  return (
    <>
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">SpendScope Blog</h1>
        <p className="text-xl text-muted-foreground">Insights for intelligent spending.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {POSTS.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full glass group overflow-hidden border-border/30 hover:shadow-lg transition-all">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter>
                <button className="text-sm font-semibold text-primary hover:underline">Read More →</button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}