"use client";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { LogOutIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "./ui/button";

const WIDTH = 250;

type Project = {
  id: string;
  description: string;
  createdAt: string;
};

function useProjects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<{ [date: string]: Project[] }>({});
  useEffect(() => {
    const fetchProjects = async () => {
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedProjects = response.data.projects.sort(
        (a: Project, b: Project) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const projectsByDate = sortedProjects.reduce(
        (acc: { [date: string]: Project[] }, project: Project) => {
          const date = new Date(project.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(project);
          return acc;
        },
        {}
      );
      setProjects(projectsByDate);
    };

    fetchProjects();
  }, [getToken]);

  return projects;
}

export function ProjectsDrawer() {
  const projects = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const router = useRouter();

  useEffect(() => {
    // track mouse pointer, open if its on the left over the drawer
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 50) {
        if (e.clientX < 40) {
          setIsOpen(true);
        }
        if (e.clientX > WIDTH) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/sign-in");
  };

  const handleNewProject = () => {
    setIsOpen(false);
    router.push("/new-project");
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
      <DrawerContent style={{ maxWidth: WIDTH }} className="bg-background">
        <DrawerHeader>
          <Button onClick={handleNewProject} variant="ghost" className="w-full">
            <MessageSquareIcon /> Start new project
          </Button>
          <Input
            type="text"
            placeholder="Search"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
          <DrawerTitle className="font-semibold pl-2 pt-2">
            Your projects
          </DrawerTitle>
          {Object.keys(projects).map((date) => (
            <div key={date} className="py-2">
              <h2 className="font-semibold text-xs px-2">{date}</h2>
              {projects[date]
                .filter((project) =>
                  project.description
                    .toLowerCase()
                    .includes(searchString.toLowerCase())
                )
                .map((project) => (
                  <Button
                    key={project.id}
                    variant="ghost"
                    onClick={() => {
                      router.push(`/project/${project.id}`);
                    }}
                    className="pl-2 w-full text-left justify-start items-start rounded hover:bg-accent cursor-pointer hover:text-accent-foreground text-muted-foreground"
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {project.description}
                    </span>
                  </Button>
                ))}
            </div>
          ))}
        </DrawerHeader>
        <DrawerFooter>
          <Button variant="ghost" className="w-full" onClick={handleLogout}>
            <LogOutIcon /> Logout
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
