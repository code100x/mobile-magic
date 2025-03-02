"use client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import * as Toast from "@radix-ui/react-toast";
import { AlertCircleIcon, ArrowRight } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";

const texts = [
  "Build a chess app...",
  "Create a todo app...",
  "Create a docs app...",
  "Create a base app..."
];

export function Prompt() {
  const {user} = useUser();
  const [prompt, setPrompt] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState(""); // Manage toast message
  const [open, setOpen] = useState(false); // Control toast visibility


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



    
  return (
    <div className="flex rounded-xl border-xl border border-white/20 bg-zinc-600/50 text-white max-sm:w-md max-sm:mx-4 ">
      <textarea
  className="flex w-full rounded-md px-4 py-4 focus-visible:outline-none focus-visible:ring-ring resize-none text-[16px] placeholder-shown:whitespace-nowrap md:text-base focus-visible:ring-0 max-h-[500px] min-h-[40px] overflow-hidden placeholder:text-white"
  placeholder={placeholder}
  value={prompt}
  onChange={(e) => {
    setPrompt(e.target.value);
    e.target.style.height = "auto"; 
    e.target.style.height = `${e.target.scrollHeight}px`; 
  }}
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
            className="bg-indigo-500 text-white/90 "
              variant={"secondary"}
              onClick={async () => {

                if(!user){
                  setToastMessage("Please Signin/Signup first!");
                  setOpen(true);
                  return
                }
                router.push(`/loading`);
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
                
                router.replace(`/project/${response.data.projectId}`);
              }}
            >
              <ArrowRight />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast notification */}
      <Toast.Provider>
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed bottom-4 right-4"
      >
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          duration={2000}
          className="bg-white flex items-center justify-center gap-2 text-red-600 p-2 h-10 rounded-md shadow-lg"
        >
          <AlertCircleIcon size={20} className="text-red-500" />
          <Toast.Title>{toastMessage}</Toast.Title>
          <Toast.Close />
        </Toast.Root>
      </motion.div>
    )}
  </AnimatePresence>
  <Toast.Viewport className="fixed bottom-4 right-4 w-64 max-w-full" />
</Toast.Provider>


    </div>
  );
}
