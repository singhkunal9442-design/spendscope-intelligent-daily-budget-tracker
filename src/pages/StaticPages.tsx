import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Info, HelpCircle } from "lucide-react";
export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Info className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">About SpendScope</h1>
          <p className="text-xl text-muted-foreground">Budgeting at the speed of life.</p>
        </div>
        <div className="prose dark:prose-invert max-w-none space-y-6">
          <p>
            Traditional budgeting apps focus on monthly history. SpendScope focuses on the <strong>now</strong>. 
            We believe that knowing exactly how much you can spend on lunch <em>today</em> is more valuable than seeing 
            a pie chart of last month's grocery bills.
          </p>
          <p>
            Built for the modern spender, SpendScope provides a visual, real-time dashboard that answers the 
            critical question: "What is my scope for today?"
          </p>
        </div>
      </div>
    </div>
  );
}
export function HelpPage() {
  const faqs = [
    { q: "How do daily limits reset?", a: "Daily limits reset automatically at midnight in your local timezone. Every day is a fresh start!" },
    { q: "Where is my data stored?", a: "Your data is securely stored in Cloudflare's Global Durable Objects, ensuring high availability and speed." },
    { q: "Can I track multiple currencies?", a: "Currently, you can set a global currency in the top bar. We're working on per-category currency support!" },
    { q: "What is 'Available Cash'?", a: "Available Cash is calculated as your Starting Balance minus everything you've spent this month so far." }
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <HelpCircle className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Help & FAQ</h1>
          <p className="text-xl text-muted-foreground">Everything you need to know to master your money.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
export function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Mail className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">Feedback, bugs, or just to say hi.</p>
        </div>
        <Card className="glass shadow-lg">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Name</Label>
                  <Input id="c-name" placeholder="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Email</Label>
                  <Input id="c-email" type="email" placeholder="alex@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-msg">Message</Label>
                <Textarea id="c-msg" placeholder="How can we help?" className="min-h-[120px]" />
              </div>
              <Button className="w-full btn-gradient">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}