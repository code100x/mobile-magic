"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_URL } from "@/config";
import { Check, Send } from "lucide-react";
import { usePrompts } from "@/hooks/usePrompts";
import { useActions } from "@/hooks/useActions";
import axios from "axios";
import {Loader} from "@/components/Loader"
import { use, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { WORKER_API_URL } from "@/config";

export default function ProjectPage({ params }: { params:Promise< { projectId: string } >}) {
    const {projectId} = use(params)
    const { prompts } = usePrompts(projectId);
    const { actions } = useActions(projectId);
    const [prompt, setPrompt] = useState("");
    const { user } = useUser();
    const { getToken } = useAuth();

    if(!user){
        return <div className="flex h-screen justify-between items-center"><Loader /></div>
    }

    return (
        <div className="flex h-screen">
            <div className="w-1/4 h-screen flex flex-col justify-between p-4">
                <div className="mt-5">
                    <div style={{ backgroundColor: "rgb(39, 39, 39)" }} className=" shimmer-button w-fit px-2 rounded-xl border-white/70  border-b-1">
                        Chat History
                    </div >
                    <div style={{ backgroundColor: "rgb(39, 39, 39)" }} className="shimmer-div flex gap-3 px-4 w-full py-3 items-center mt-4 rounded-md">
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                        />

                        {prompts.filter((p) => p.type === "USER").map((p) => (
                            <div key={p.id}>{p.content}</div>
                        ))}
                    </div>

                    <div style={{ backgroundColor: "rgb(39, 39, 39)" }} className="relative h-fit w-full mt-6 pb-6  rounded-md">
                        <div className="py-2 px-6">
                            Creating App...
                        </div>
                        <div style={{ backgroundColor: " #171717" }} className=" flex flex-col mx-6 px-2 justify-center  rounded-md ring-1 ring-white/20" >
                            {actions.map((a) => (
                                <div
                                    className="px-2 py-1 flex gap-1 hover:underline "
                                    key={a.id}> <Check color="#4ade80" /><span className="">{a.content}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 pb-8">
                    <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <Button
                        onClick={async () => {
                            const token = await getToken();
                            await axios.post(
                                `${WORKER_API_URL}/prompt`,
                                { projectId:projectId, 
                                  prompt },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                        }}
                    >
                        <Send />
                    </Button>
                </div>
            </div>
            <div className="w-3/4 p-8">
                <iframe src={`${WORKER_URL}/`} width="100%" height="100%" className="rounded-xl" />
            </div>
        </div>
    );
}