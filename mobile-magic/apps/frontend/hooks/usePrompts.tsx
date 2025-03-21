import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";

interface Prompt {
    id: string;
    content: string;
    type: "USER" | "SYSTEM";
    createdAt: Date;
    actions: Action[];
}

interface Action {
    id: string;
    content: string;
    createdAt: Date;
}


export function usePrompts(projectId: string) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const { getToken } = useAuth();

    useEffect(() => {
        async function getPrompts() {
            const token = await getToken();
            axios.get(`${BACKEND_URL}/prompts/${projectId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then((res) => {
                setPrompts(res.data.prompts);
            });
        }
        getPrompts();
        let interval = setInterval(getPrompts, 3 * 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        prompts,
    };
}