import { Project } from "./Project"

interface Params {
	params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: Params) {
	const projectId = (await params).projectId

	return <Project projectId={projectId} />
}
