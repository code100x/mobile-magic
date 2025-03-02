"use client";
import { use} from "react";
import { Appbar } from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_URL } from "@/config";
import { Send } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useActions } from "@/hooks/useActions";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { WORKER_API_URL } from "@/config";

type PageParams = Promise<{ projectId: string }>;

export default function ProjectPage({ params }: { params: PageParams }) {
    const resolvedParams = use(params);
    const { prompts } = usePrompts(resolvedParams.projectId);
    const { actions } = useActions(resolvedParams.projectId);
    const [prompt, setPrompt] = useState("");
    const { getToken } = useAuth();

    return <div> 
        <div className="flex h-screen">
            <div className="w-1/4 h-screen flex flex-col justify-between p-4">
                <div>
                    Chat history
                    {prompts.filter((prompt) => prompt.type === "USER").map((prompt) => (
                        <div key={prompt.id}>
                            {prompt.content}
                        </div>
                    ))}
                    {actions.map((action) => (
                        <div key={action.id}>
                            {action.content}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pb-8">
                    <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <Button onClick={async () => {
                        const token = await getToken();
                        axios.post(`${WORKER_API_URL}/prompt`, {
                            projectId: resolvedParams.projectId,
                            prompt: prompt,
                        }, {
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }
                        });
                    }}>
                        <Send />
                    </Button>
                </div>
            </div>
            <div className="w-3/4 p-8">
                <iframe src={`${WORKER_URL}/`} width={"100%"} height={"100%"} title="Worker"/>
            </div>
        </div>
    </div>
}