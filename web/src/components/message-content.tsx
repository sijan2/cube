"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { Check, Copy, Download, FileText, ExternalLink } from "lucide-react";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

interface MessageContentProps {
  content: string;
  role: "user" | "assistant" | "system";
  className?: string;
}

export function MessageContent({ content, role, className }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        role === "user" ? "prose-invert" : "dark:prose-invert",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:leading-relaxed prose-p:break-words",
        "prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5",
        "prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:relative prose-pre:group",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-table:text-xs prose-th:font-semibold",
        "prose-img:rounded-lg prose-img:shadow-md",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Enhanced code blocks with copy button
          pre: ({ children, ...props }) => {
            const codeElement = React.Children.toArray(children)[0] as React.ReactElement;
            const className = codeElement?.props?.className || "";
            const language = className.replace(/language-/, "");
            const codeContent = codeElement?.props?.children?.[0] || "";
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

            return (
              <div className="relative group">
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {language && (
                    <span className="px-2 py-1 text-xs font-medium bg-white/10 backdrop-blur-sm rounded">
                      {language}
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(String(codeContent), codeId)}
                    className="p-1.5 rounded bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                    aria-label="Copy code"
                  >
                    {copiedCode === codeId ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-white/70" />
                    )}
                  </button>
                </div>
                <pre {...props} className={cn(props.className, "!mt-0")}>
                  {children}
                </pre>
              </div>
            );
          },

          // Enhanced inline code
          code: ({ children, ...props }) => (
            <code
              {...props}
              className={cn(
                "px-1.5 py-0.5 rounded-md font-mono text-xs",
                role === "user"
                  ? "bg-white/20 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-zinc-100"
              )}
            >
              {children}
            </code>
          ),

          // Enhanced links
          a: ({ href, children, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {children}
              <ExternalLink size={12} className="opacity-50" />
            </a>
          ),

          // Enhanced tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table {...props} className="w-full">
                {children}
              </table>
            </div>
          ),

          // Enhanced blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-zinc-600 dark:text-zinc-300"
            >
              {children}
            </blockquote>
          ),

          // Enhanced list items
          li: ({ children, ...props }) => (
            <li {...props} className="marker:text-zinc-400 dark:marker:text-zinc-500">
              {children}
            </li>
          ),

          // Enhanced horizontal rules
          hr: ({ ...props }) => (
            <hr {...props} className="my-4 border-zinc-200 dark:border-zinc-700" />
          ),

          // Enhanced images
          img: ({ src, alt, ...props }) => (
            <figure className="my-4">
              <img
                {...props}
                src={src}
                alt={alt}
                className="rounded-lg shadow-lg w-full"
                loading="lazy"
              />
              {alt && (
                <figcaption className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}