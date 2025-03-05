"use client";

import { useState, useEffect, useRef } from "react";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { MoveUpRight, ChevronRight } from "lucide-react";
import axios from "axios";
import { prompts } from "@/lib/constants"
import { motion } from "motion/react"
import { containerVariants, itemVariants } from "@/lib/animation-variants"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function Prompt() {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");

  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(promptRef.current) {
      promptRef.current.focus();
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if(!token) {
      setIsSignedIn(true);
      return
    }
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
    <motion.div
       variants={containerVariants}
       initial="hidden"
       animate="visible"
    >
      <div className="px-4 py-2 sm:static sm:w-auto fixed bottom-0 left-0 w-full">
        <motion.form variants={itemVariants} onSubmit={(e) => onSubmit(e)} className="relative w-full border-2 bg-gray-500/10 focus-within:outline-1 focus-within:outline-teal-300/30 rounded-xl">
          <div className="p-2">
            <Textarea
              ref={promptRef}
              value={prompt}
              placeholder="Write your prompt here..."
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full placeholder:text-gray-400/60 bg-transparent border-none text-md rounded-none focus-visible:ring-0 min-h-16 max-h-80 resize-none outline-none"
            />
          </div>

          <div className="p-2 flex items-center justify-end">
            <Button
              type="submit"
              className="h-10 w-10 cursor-pointer rounded-full bg-teal-200/10 hover:bg-teal-300/20 flex items-center justify-center"
              disabled={!prompt}
            >
              <MoveUpRight className="w-10 h-10 text-teal-300/70" />
            </Button>
          </div>
        </motion.form>
      </div>

      <motion.div variants={itemVariants} className="flex flex-row flex-wrap mt-4 sm:flex-nowrap w-full gap-2 sm:gap-2 justify-center items-center">
        {prompts.map((prompt) => (
          <div onClick={() => setPrompt(prompt.title)} key={prompt.id} className="border border-zinc-800 hover:bg-zinc-600/10 bg-zinc-900 cursor-pointer px-4 py-2 rounded-xl">
            <p className="text-gray-400/80 text-sm">{prompt.title}</p>
          </div>
        ))}
      </motion.div>

      <AlertDialog open={isSignedIn} onOpenChange={setIsSignedIn}>
        <AlertDialogContent className="border-2 border-teal-400/10 bg-teal-950/90 text-white/70 rounded-xl">
          <AlertDialogHeader>
	   <div className="flex items-center gap-2">
	    <ChevronRight className="text-teal-400/60" />
            <AlertDialogTitle className="">You are not signed in</AlertDialogTitle>
	   <div>
	  </div>
	  </div>
	     <AlertDialogDescription className="text-white/80">
	       Please sign in to access this feature. Your data is safe and will not be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer text-white hover:text-teal-400 focus-visible:outline-none focus-visible:ring-0">Cancel</AlertDialogCancel>
            <AlertDialogAction className="cursor-pointer text-white hover:text-teal-400">Sign in</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

