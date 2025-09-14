"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "motion/react";
import { ThinkingAnimation } from "./thinking-animation-clean";
import { FloatingChatInput } from "./floating-chat-input";

export function DemoChatShowcase() {
  const [showDemo, setShowDemo] = useState(false);
  const [demoPhase, setDemoPhase] = useState<"input" | "thinking" | "response">("input");

  const runDemo = () => {
    setShowDemo(true);
    setDemoPhase("thinking");

    // Simulate thinking for 15 seconds
    setTimeout(() => {
      setDemoPhase("response");
    }, 15000);

    // Reset after response
    setTimeout(() => {
      setShowDemo(false);
      setDemoPhase("input");
    }, 20000);
  };

  const demoMessages = [
    { role: "user" as const, text: "Jarvis, I have a Google SWE interview tomorrow at 2 PM. Help me dominate it." },
    {
      role: "assistant" as const,
      text: "🎯 **INTERVIEW NINJA MODE ACTIVATED** 🚀\n\n**Phase 1: Intelligence Gathering (Complete)**\n📅 Calendar Intelligence: Found your 2 PM Google interview with Sarah Chen, Senior SWE\n📧 Gmail Integration: Scanned confirmation emails - team focus on distributed systems\n👥 Contact Analysis: Sarah's background in Google Cloud Infrastructure\n🔍 Company Research: Latest Google engineering initiatives in serverless architecture\n🔗 LinkedIn Integration: Recent updates show Sarah's work on Kubernetes optimization\n\n**Phase 2: Technical Preparation (Complete)**\n💻 GitHub Analysis: Your distributed systems project perfectly aligns with Google's work\n🧮 LeetCode Integration: Your 450+ solved problems show exceptional algorithms foundation\n📋 Work History: Recent microservices achievements demonstrate scalability expertise\n\n**Phase 3: Content Creation (Complete)**\n🎨 Visual Portfolio: Generated system architecture diagrams showcasing your expertise\n📊 Achievement Timeline: Visual representation of your 2-year coding journey\n📈 Strategic Brief: Complete interview preparation with behavioral story framework\n🎯 Question Framework: STAR method responses tailored to Google's values\n\n**YOU'RE READY TO DOMINATE THIS INTERVIEW! 💪**\n\nKey talking points: Your microservices architecture, distributed caching solutions, and leadership in code reviews. Sarah will be impressed by your systematic approach to scalability challenges."
    }
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-2xl mx-4 space-y-6">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">mcp² Enhanced Chat Experience</h2>
          <p className="text-white/80">Experience the thinking animation and MCP tool calling in action!</p>
        </div>

        {!showDemo ? (
          <motion.button
            onClick={runDemo}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🚀 Start Demo: "Help me dominate my Google interview"
          </motion.button>
        ) : (
          <div className="space-y-4">
            {/* Demo chat interface */}
            <div className="bg-white/90 dark:bg-black/90 rounded-xl p-6 backdrop-blur-xl">
              <div className="space-y-4">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-[80%]">
                    {demoMessages[0].text}
                  </div>
                </div>

                {/* Thinking animation or response */}
                {demoPhase === "thinking" && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <ThinkingAnimation isVisible={true} />
                    </div>
                  </div>
                )}

                {demoPhase === "response" && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap">
                      {demoMessages[1].text}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="text-center text-white/80 text-sm">
              {demoPhase === "thinking" && "🧠 Analyzing your request and gathering intelligence from 12+ MCP services..."}
              {demoPhase === "response" && "✨ Your personalized AI assistant delivered a comprehensive solution!"}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setShowDemo(false);
            setDemoPhase("input");
          }}
          className="w-full px-4 py-2 text-white/80 hover:text-white transition-colors text-sm"
        >
          Close Demo
        </button>
      </div>
    </div>
  );
}