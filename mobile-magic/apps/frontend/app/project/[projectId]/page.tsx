"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_URL, WORKER_API_URL } from "@/config";
import { Send } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useActions } from "@/hooks/useActions";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { ProjectsDrawer } from "@/components/ProjectsDrawer";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const { projectId } = useParams();

  const [isReady, setIsReady] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const { prompts } = usePrompts(projectId as string);
  const { actions } = useActions(projectId as string);

  const { getToken } = useAuth();
  const { user } = useUser();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsReady(!!projectId);

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const isNearBottom =
        scrollContainer.scrollHeight -
          scrollContainer.scrollTop -
          scrollContainer.clientHeight <
        50;

      setIsUserScrolling(!isNearBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    if (!isUserScrolling) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [projectId, prompts, actions, isUserScrolling]);

  const submitPrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    try {
      const token = await getToken();
      await axios.post(
        `${WORKER_API_URL}/prompt`,
        {
          projectId: projectId,
          prompt: prompt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPrompt("");
    } catch (error) {
      console.error("Failed to submit prompt:", error);
    }
  }, [prompt, projectId, getToken]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitPrompt();
      }
    },
    [submitPrompt]
  );

  if (!isReady)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="h-screen flex flex-col pt-16">
      <div className="flex flex-grow overflow-hidden">
        <div className="w-full md:w-1/4 flex flex-col p-4 overflow-hidden">
          <Button
            variant={"ghost"}
            className="bg-primary-foreground rounded-full mb-3 self-start"
          >
            Chat history
          </Button>
          <div className="flex-grow overflow-hidden border rounded-lg shadow-sm bg-background flex flex-col">
            <div
              ref={scrollContainerRef}
              className="flex-grow overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-secondary-foreground/20 scrollbar-track-transparent"
            >
              {prompts
                .filter((prompt) => prompt.type === "USER")
                .map((prompt) => {
                  // Convert createdAt to Date object if it's not already
                  const promptCreatedAt =
                    prompt.createdAt instanceof Date
                      ? prompt.createdAt
                      : new Date(prompt.createdAt);

                  const relatedActions = actions.filter((action) => {
                    const actionCreatedAt =
                      action.createdAt instanceof Date
                        ? action.createdAt
                        : new Date(action.createdAt);

                    return (
                      actionCreatedAt >= promptCreatedAt &&
                      actionCreatedAt <=
                        new Date(promptCreatedAt.getTime() + 5 * 60 * 1000)
                    );
                  });

                  return (
                    <div key={prompt.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <Image
                            src={user?.imageUrl || "/placeholder.svg"}
                            width={32}
                            height={32}
                            alt="Profile picture"
                            className="rounded-full"
                            priority={true}
                          />
                        </div>
                        <div className="flex-grow py-2 px-3 rounded-lg bg-secondary text-secondary-foreground">
                          {prompt.content}
                        </div>
                      </div>

                      {relatedActions.length > 0 && (
                        <div className="space-y-2 ml-10">
                          {relatedActions.map((action) => (
                            <div
                              key={action.id}
                              className="py-2 px-3 rounded-lg bg-muted text-muted-foreground"
                            >
                              {action.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-2 p-3 border-t">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow"
                onKeyDown={handleKeyDown}
              />
              <Button
                onClick={submitPrompt}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden md:block md:w-3/4 p-4">
          <iframe
            src={`${WORKER_URL}/`}
            className="w-full h-full rounded-lg shadow-md"
            title="Project Worker"
          />
        </div>
      </div>
      <ProjectsDrawer />
    </div>
  );
}