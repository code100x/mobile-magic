"use client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import {Loader} from "@/components/Loader"
import { ArrowRight } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";

const texts = [
  "Build a chess app...",
  "Create a todo app...",
  "Create a docs app...",
  "Create a base app..."
];

export function Prompt() {
  const [prompt, setPrompt] = useState("");
  const [loading,setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentText = texts[textIndex];

      if (isDeleting) {
        // Delete characters
        if (charIndex > 0) {
          charIndex--;
          setPlaceholder(currentText.slice(0, charIndex));
        } else {
          // Move to next text after deletion
          isDeleting = false;
          textIndex = (textIndex + 1) % texts.length;
        }
      } else {
        // Type characters
        if (charIndex < currentText.length) {
          charIndex++;
          setPlaceholder(currentText.slice(0, charIndex));
        } else {
          // Wait before deleting
          isDeleting = true;
          setTimeout(typeEffect, 2000);
          return;
        }
      }

      setTimeout(typeEffect, isDeleting ? 50 : 100);
    }

    const timeoutId = setTimeout(typeEffect, 500); // Start typing effect after delay

    return () => clearTimeout(timeoutId); // Cleanup function to prevent speed-up issues
  }, []);

  if(loading){
          return <div className="flex h-screen justify-center items-center"><Loader /></div>
      }
    
  return (
    <div className="flex rounded-xl border-xl border border-white/20 bg-zinc-600/50 text-white max-sm:w-md max-sm:mx-4 ">
      <textarea
        className="flex w-full rounded-md px-4 py-4  focus-visible:outline-none focus-visible:ring-ring resize-none text-[16px] placeholder-shown:whitespace-nowrap md:text-base focus-visible:ring-0 max-h-[200px] placeholder:text-white "
        placeholder={placeholder}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <AnimatePresence>
        {prompt.trim() !== "" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 20 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex justify-end px-4"
          >
            <Button
              onClick={async () => {
                setLoading(true)

                const token = await getToken();
                const response = await axios.post(
                  `${BACKEND_URL}/project`,
                  { prompt: prompt },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                await axios.post(`${WORKER_API_URL}/prompt`, {
                  projectId: response.data.projectId,
                  prompt: prompt,
                });
                router.push(`/project/${response.data.projectId}`);
                setLoading(false)
              }}
            >
              <ArrowRight />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
