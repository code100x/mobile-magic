"use client";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { SignedIn, useClerk, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareIcon, SearchIcon, UmbrellaOff } from "lucide-react";
import { Button } from "./ui/button";
import { useProjects } from "@/hooks/useProject";
import { Separator } from "./ui/separator";
import { formatDate } from "@/utils/formatDate";
import { useDebounce } from "@/hooks/useDebounce";

const WIDTH = 260;

export function ProjectsDrawer() {
  const [searchString, setSearchString] = useState("");
  const debounceString = useDebounce(searchString, 1000);
  const projects = useProjects(debounceString);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  let delayTimerId: Timer;
  useEffect(() => {
    // track mouse pointer, open if its on the left ovver the drawer
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 40) {
        clearTimeout(delayTimerId);
        delayTimerId = setTimeout(() => {
          setIsOpen(true);
        }, 300);
      }
      if (e.clientX > WIDTH) {
        clearTimeout(delayTimerId);
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(delayTimerId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <SignedIn>
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
        <DrawerContent
          style={{ maxWidth: WIDTH }}
          className="bg-background rounded-r-4xl shadow-lg h-screen flex flex-col"
        >
          <DrawerHeader className="flex flex-col gap-3">
            <div className="px-2 py-1 font-bold text-2xl italic text-white hover:text-neutral-300 transition-colors duration-300">
              Bolty
            </div>
            <Button
              onClick={() => {
                setIsOpen(false);
              }}
              variant="ghost"
              className="w-full bg-blue-500/20 text-blue-600 hover:text-blue-400"
            >
              <MessageSquareIcon /> Start new project
            </Button>
            <DrawerTitle className="text-sm">Your projects</DrawerTitle>
            <div className="flex space-between border rounded-md pr-2 pl-1 shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
              <input
                className="w-full p-2 text-sm border-none outline-none"
                type="text"
                placeholder="Search"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
              />
              <div className="flex items-center">
                <SearchIcon className="w-4 h-4" />
              </div>
            </div>
            <Separator />
          </DrawerHeader>

          {/* Scrollable Projects List */}
          {Object.keys(projects).length === 0 ? (
            <div className="flex flex-col justify-center w-full items-center mt-4 gap-y-4 ">
              <UmbrellaOff size={50} opacity={0.5} />
              <p className="">No projects found</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 mb-1 custom-scrollbar">
              {Object.keys(projects).map((date) => {
                const formattedDate = formatDate(date);
                return (
                  <div key={date} className="mb-4">
                    <h2 className="text-sm font-semibold text-neutral-700 py-1">
                      {formattedDate}
                    </h2>
                    {projects[date].map((project) => (
                      <div
                        key={project.id}
                        onClick={() => {
                          router.push(`/project/${project.id}`);
                        }}
                        className="p-2 w-full rounded hover:bg-accent cursor-pointer hover:text-accent-foreground text-[12px] text- gap-y-1"
                      >
                        {project.description.length > 34
                          ? `${project.description.substring(0, 32)} ...`
                          : project.description}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <DrawerFooter className="p-2 bg-neutral-900 rounded-br-4xl shadow-xl ">
            <div className="py-2 flex items-center  gap-4">
              <UserButton />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {user?.fullName || "User"}
                </span>
                <span className="text-xs text-neutral-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </SignedIn>
  );
}
