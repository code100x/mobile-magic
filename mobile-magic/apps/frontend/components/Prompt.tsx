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
import { toast } from "sonner";

export function Prompt() {
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();

  const handleTemplateClick = (text: string) => {
		setPrompt(text);
	};
  return (
    <div className="relative">
      <Textarea
        placeholder="Create a chess application..."
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				className="py-4 pl-4 pr-12 min-h-28 max-h-40 overflow-auto resize-none"
			/>
      {prompt && (
        <div>
        <Button variant="ghost" className="absolute top-4 right-16 cursor-pointer border-gray-800 p-2 h-9 w-9">
            <Paperclip className="w-5 h-5 text-gray-500 " />
        </Button>
				<Button
					className="absolute top-4 right-4 cursor-pointer"
					onClick={async () => {
            const token = await getToken();
            if(!token) {
              toast.error("You need to be signed in to generate a project");
              return;
            };
            const response = await axios.post(
							`${BACKEND_URL}/project`, {
                prompt: prompt,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // You should get the worker url here.
            await axios.post(`${WORKER_API_URL}/prompt`, {
                projectId: response.data.projectId,
                prompt: prompt,
            });
            router.push(`/project/${response.data.projectId}`);
        }}>
          <Send />
        </Button>
        </div>
      )}
      <div className="max-w-2xl mx-auto pt-4">
				<TemplateButtons onTemplateClick={handleTemplateClick} />
			</div>
    </div>
  );
}