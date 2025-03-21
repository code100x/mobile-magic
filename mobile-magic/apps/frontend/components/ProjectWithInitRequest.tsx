"use client"
import axios from "axios";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Project } from "@/app/project/[projectId]/Project";

export default function ProjectWithInitRequest({
    projectId,
    sessionUrl,
    previewUrl,
    workerUrl 
}: {
    projectId: string,
    sessionUrl: string,
    previewUrl: string,
    workerUrl: string
}) {
	const searchParams = useSearchParams()
 	const initPrompt = searchParams.get('initPrompt');
	const { getToken } = useAuth();
	const router = useRouter();

	useEffect(() => {
		(async () => {
			const token = await getToken();
			axios.post(
				`${workerUrl}/prompt`,
				{
					projectId: projectId,
					prompt: initPrompt,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			// window.location.href = `/project/${projectId}`;
		})()	
	}, [projectId, initPrompt, workerUrl, getToken, router]);

	return <Project
		projectId={projectId} 
		sessionUrl={sessionUrl} 
		previewUrl={previewUrl} 
		workerUrl={workerUrl} 
	/>
}
