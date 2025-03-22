"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Header"
import { MoveUpRight, SquarePen } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useAuth, useUser } from "@clerk/nextjs";
import { SidebarInset } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import Image from "next/image";
import axios from "axios";
import { PreviewIframe } from "@/components/PreviewIframe";
import { GitHubModal } from "@/components/GitHubModal";

export const Project: React.FC<{ projectId: string, sessionUrl: string, previewUrl: string, workerUrl: string }> = ({projectId, sessionUrl, previewUrl, workerUrl }) => {
    const router = useRouter()
    const { prompts } = usePrompts(projectId);
    const [prompt, setPrompt] = useState("");
    const { getToken } = useAuth();
    const { user } = useUser()
    const [tab, setTab] = useState("code");

    const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const token = await getToken();
        axios.post(
            `${workerUrl}/prompt`,
            {
                projectId: projectId,
                prompt: prompt,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );
        setPrompt("");
    }, [projectId, workerUrl, getToken, prompt]);

    return (
        <SidebarInset className="bg-transparent">
            <div className="grid h-screen w-full grid-cols-1 md:grid-cols-[auto_1fr]">
                <div className="flex flex-col justify-between p-4 gap-2 rounded-md w-full xl:w-[400px] 2xl:w-[500px] max-w-full overflow-hidden">
		    <div className="flex items-center justify-start">
                <Header onClick={() => router.push("/")}>
			 <SquarePen />	
		       </Header>
		    </div>
                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <div className="flex flex-col space-y-4 justify-center">
                                {/* we are filtering only user prompts and rendering it */}
                                {prompts.filter((prompt) => prompt.type === "USER").map((prompt) => (
                                    <div key={prompt.id}>
                                        <span key={prompt.id} className="flex text-lg gap-2">
                                            <Image src={user?.imageUrl || ""} width={10} height={10} alt="Profile picture" className="rounded-full w-6 h-6" />
                                            {prompt.content}
                                        </span>
                                        {prompt.actions.map((action) => (
                                            <div key={action.id} className="flex border-2 bg-gray-500/10 p-2 rounded-md">
                                                <div className="flex items-center gap-2">
                                                <div className="inline-block rounded-full border dark:border-gray-300/20 p-1 h-fit">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-teal-300 dark:bg-teal-300/30" />
                                                </div>
                                                <p>{action.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <form onSubmit={(e) => onSubmit(e)} className="relative w-full border-2 bg-gray-500/10 focus-within:outline-1 focus-within:outline-teal-300/30 rounded-xl">
                            <div className="p-2">
                                <Textarea
                                    value={prompt}
                                    placeholder="Write a prompt..."
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full placeholder:text-gray-400/60 shadow-none bg-transparent border-none text-md rounded-none focus-visible:ring-0 min-h-16 max-h-80 resize-none outline-none"
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
                        </form>
                    </div>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden p-4">
                    <div className="flex items-center justify-end gap-2 pb-2">
                        <GitHubModal projectId={projectId} workerUrl={workerUrl} />
                        <Button variant={tab === "code" ? "default" : "outline"} onClick={() => setTab("code")}>Code</Button>
                        <Button variant={tab === "preview" ? "default" : "outline"} onClick={() => setTab("preview")}>Preview</Button>
                        <Button variant="outline" onClick={() => setTab("split")}>Split</Button>
                    </div>
                        <div className="flex gap-2 h-full">
                            <div className={`${tab === "code" ? "left-0 flex-1" : tab === "split" ? "left-0 flex-1" : "left-full flex-0"} position-absolute transition-all duration-300 h-full w-full`}>
                                <iframe
                                    src={`${sessionUrl}/`}
                                    className="w-full h-full rounded-lg"
                                    title="Project Worker"
                                />
                            </div>
                            <div className={`${tab === "preview" ? "left-0 flex-1" : tab === "split" ? "left-0 flex-1" : "left-full flex-0"} position-absolute transition-all duration-300 h-full w-full`}>
                                <PreviewIframe url={`${previewUrl}/`} />
                            </div>
                        </div>
                </div>
            </div>
        </SidebarInset>
    )
}
