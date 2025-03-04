"use client";

import { Button } from "@/components/ui/button";

import { WORKER_URL } from "@/config";
import { Check, ClipboardCopy, Paperclip, Send } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useActions } from "@/hooks/useActions";
import axios from "axios";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { WORKER_API_URL } from "@/config";
import { ProjectsDrawer } from "@/components/ProjectsDrawer";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface Action {
    id: string;
    content?: string;
    code?: string;
}

export default function ProjectPage({ params }: { params: { projectId: string } }) {
    const { prompts } = usePrompts(params.projectId);
    const { actions } = useActions(params.projectId);
    const [prompt, setPrompt] = useState("");
    const { getToken } = useAuth();
    const { user } = useUser()
    const [copied, setCopied] = useState<string | null>(null);

    const submitPrompt = async () => {
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
            },
        );
        setPrompt("");
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 flex flex-col px-4 border-r border-gray-800">
                <div className="sticky top-0 bg-background p-5 text-lg border-b border-gray-800">
                    Chat History
                </div>
                <div className="sticky h-4/5 my-5 flex-1 overflow-y-auto">
                    <ScrollArea className="pr-4">
                        <div className="space-y-6">
                            {prompts.filter((prompt) => prompt.type === "USER").map((prompt, index) => (
                                <div key={prompt.id} className="space-y-4">
                                    <div className="flex bg-gray-800 p-3 rounded-lg border-4 border-gray-800 items-start gap-3">
                                        <Image src={user?.imageUrl || ""} width={10} height={10} alt="Profile picture" className="rounded-full w-6 h-6" />
                                        {prompt.content}
                                    </div>

                                    {actions[index] && (
                                        <div className="flex items-start l:pl-7 gap-3">
                                            <div className="flex-1">
                                                <div className="text-gray-200 mb-3">{actions[index]?.content}</div>

                                                {('code' in actions[index] && actions[index]?.code) && (
                                                    <div className="relative flex bg-gray-800 justify-between rounded-md overflow-hidden mb-4">
                                                    
                                                            <pre className="md:p-4 overflow-x-auto text-sm max-h-60 scrollbar-thin scrollbar-thumb-gray-600">
                                                                <code className="text-gray-200 whitespace-pre-wrap break-words">
                                                                    {String(actions[index].code || "")}
                                                                </code>
                                                            </pre>
                                                            <span className="flex items-center justify-between xl:px-4 py-2 text-xs text-gray-100">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 right-1 w-6 p-0"
                                                                onClick={() => copyToClipboard(
                                                                    String(actions[index].code || ""),
                                                                    `header-${actions[index].id}`
                                                                )}
                                                            >
                                                                {copied === `header-${actions[index].id}` ? (
                                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                                ) : (
                                                                    <ClipboardCopy className="h-3.5 w-3.5 text-gray-400" />
                                                                )}
                                                            </Button>
                                                            </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="sticky bottom-5 bg-background pt-4 border-gray-800">
                    <div className="flex flex-col rounded-lg overflow-hidden border border-primary/20">
                        <Textarea
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                   submitPrompt(); 
                                }
                            }}
                            className="border-0 bg-transparent text-primary focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 max-h-44 resize-none"
                        />
                        <div className="flex items-end justify-end gap-2 pr-1">
                            <Button variant="ghost" className="border-gray-800 p-2 h-9 w-9">
                                <Paperclip className="w-5 h-5 text-gray-500 " />
                            </Button>
                            <Button
                                className="rounded-sm px-4 py-2"
                                onClick={submitPrompt}>
                                <Send />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:w-3/4 p-0">
                <iframe src={`${WORKER_URL}/`} width={"100%"} height={"100%"} title="Project Worker" className="border-none rounded-lg" />
            </div>
            <ProjectsDrawer />
        </div>
    );
}