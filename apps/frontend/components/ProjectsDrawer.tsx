"use client"
import { Separator } from "@/components/ui/separator"

import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, MessageCircleIcon, MessageSquareIcon, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";

const WIDTH = 250;

type Project = {
    id: string;
    description: string;
    createdAt: string;
}

function useProjects() {
    const { getToken } = useAuth();
    const [projects, setProjects] = useState<{ [date: string]: Project[] }>({});
    useEffect(() => {
        (async () => {
            const token = await getToken();
            const response = await axios.get(`${BACKEND_URL}/projects`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            const projectsByDate = response.data.projects.reduce((acc: { [date: string]: Project[] }, project: Project) => {
                const date = new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(project);
                return acc;
            }, {});
            setProjects(projectsByDate);
        })()

    }, [getToken])

    return projects;
}
export function ProjectsDrawer() {
    const projects = useProjects();
    const [isOpen, setIsOpen] = useState(false);
    const [searchString, setSearchString] = useState("");
    const router = useRouter();

    useEffect(() => {
        // track mouse pointer, open if its on the left ovver the drawer
        const handleMouseMove = (e: MouseEvent) => {
            if (e.clientX < 40) {
                setIsOpen(true);
            }
            if (e.clientX > WIDTH) {
                setIsOpen(false);
            }
        }
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
            <DrawerContent style={{ maxWidth: WIDTH }} className="bg-background">
                <DrawerHeader>
                    <Button onClick={() => {
                        setIsOpen(false);
                    }} variant="ghost" className="w-full"><MessageSquareIcon /> Start new project</Button>
                    <DrawerTitle className="text-[12px]">Your projects</DrawerTitle>
                    <div className="flex space-between border rounded-md pr-2 pl-1">
                        <input className="text-[12px] w-full p-1 text-sm border-none ouline-none" type="text" placeholder="Search" value={searchString} onChange={(e) => setSearchString(e.target.value)} >

                        </input>
                        <div className="flex items-center">
                            <SearchIcon className="w-4 h-4" />
                        </div>
                    </div>
                    {Object.keys(projects).map((date) => (
                        <div key={date}>
                            <h2 className="text-[10px]">{date}</h2>
                            {projects[date].filter((project) => project.description.toLowerCase().includes(searchString.toLowerCase())).map((project) => (
                                <div key={project.id} className="my-1">
                                    <Button variant={"outline"} onClick={() => {
                                        router.push(`/project/${project.id}`);
                                    }} className="border pl-1 w-full rounded hover:bg-accent cursor-pointer hover:text-accent-foreground text-[12px]">
                                        <div className="w-full flex">

                                            <div className="pl-2 flex items-center"><MessageCircleIcon className="w-4 h-4" /></div> <div className="pl-2">{project.description}</div>
                                        </div>
                                    </Button >
                                </div>
                            ))}
                            <Separator />
                        </div>
                    ))}
                </DrawerHeader>
                <DrawerFooter>
                    <Button variant="ghost" className="w-full">
                        <LogOutIcon /> Logout
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>

    )
}