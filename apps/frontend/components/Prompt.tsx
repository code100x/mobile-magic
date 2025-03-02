"use client";

import { Button } from "@/components/ui/button"
import { Paperclip, Send } from 'lucide-react'
import { TemplateButtons } from "./TemplateButtons";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";

export function Prompt() {
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();

  const handlePrompt = async () => {
    const token = await getToken();
    const response = await axios.post(`${BACKEND_URL}/project`, {
      prompt: prompt,
    }, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    // You should get the worker url here.
    await axios.post(`${WORKER_API_URL}/prompt`, {
      projectId: response.data.projectId,
      prompt: prompt,
    });
    router.push(`/project/${response.data.projectId}`);
  }

  return (
    <div className="h-[90dvh] text-white flex flex-col items-center pt-56 px-4 md:px-6 relative z-10">

      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-b from-neutral-500 to-neutral-700 dark:from-neutral-100 dark:to-neutral-400 pb-3">
          What can I help you build?
        </h1>
        <div className="w-96 h-64 fixed -bottom-30 -right-10 -z-50 bg-blue-700/50 blur-3xl animate-pulse duration-4000" />

        <div className="relative mb-8">
          <div className="flex border border-primary/20 rounded-lg p-4 bg-background/50">
            <Paperclip className="w-5 h-5 text-gray-500 mr-2 mt-2.5" />

            <Textarea
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask v0 a question..."
              className="border-0 bg-transparent text-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 max-h-44 resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrompt}
                variant="default"
                className="border-gray-800 p-2 h-9 w-9">
                <Send className="h-4 w-4 text-background" />
              </Button>
            </div>
          </div>
        </div>
        <TemplateButtons />
      </div>
    </div>
  )
}
