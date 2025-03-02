"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_URL } from "@/config";
import { ChevronDownIcon, RocketIcon, Send } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useActions } from "@/hooks/useActions";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { WORKER_API_URL } from "@/config";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { prompts } = usePrompts(params.projectId);
  const { actions } = useActions(params.projectId);
  const [prompt, setPrompt] = useState("");
  const { getToken } = useAuth();
  const router = useRouter();

  return (
    <div className="p-4 bg-gradient-to-b from-blue-600/50 to-50% to-black flex flex-col justify-between h-screen">
      <div className="flex justify-between px-2 py-2 items-center ">
        <div
          className="font-bold cursor-pointer text-2xl italic text-white hover:text-neutral-300 transition-colors duration-300 z-40"
          onClick={() => router.push("/")}
        >
          Bolty
        </div>
        <div className="flex items-center gap-1 font-bold">
          E-commerce Mobile App - A React Native app for online shopping
          <span>
            <ChevronDownIcon className="text-neutral-400" />
          </span>
        </div>
        <div className="flex items-center gap-2 bg-blue-500 px-2 py-1 rounded-md font-semibold">
          <RocketIcon />
          Deploy
        </div>
      </div>
      <Separator className="bg-emerald-800" />
      <div className="flex h-full py-4 ">
        <div className="w-1/4 h-full flex flex-col justify-between p-4 bg-neutral-950 rounded-md shadow-2xl ">
          <div>
            Chat history
            {prompts
              .filter((prompt) => prompt.type === "USER")
              .map((prompt) => (
                <div key={prompt.id}>{prompt.content}</div>
              ))}
            {actions.map((action) => (
              <div key={action.id}>{action.content}</div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-neutral-800 h-10"
            />
            <Button
              onClick={async () => {
                const token = await getToken();
                axios.post(
                  `${WORKER_API_URL}/prompt`,
                  {
                    projectId: params.projectId,
                    prompt: prompt,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
              }}
            >
              <Send />
            </Button>
          </div>
        </div>
        <div className="w-3/4 h-full pl-8 ">
          <iframe src={`${WORKER_URL}/`} width={"100%"} height={"100%"} />
        </div>
      </div>
    </div>
  );
}
