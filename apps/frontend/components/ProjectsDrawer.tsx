"use client";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { SignedIn, UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOutIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { formatDate } from "@/utils/FormatDate";
import { useProjects } from "@/hooks/useProjects";

const WIDTH = 300;

export function ProjectsDrawer() {
  const projects = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    // track mouse pointer, open if its on the left over the drawer
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < 10) {
        setIsOpen(true);
      }
      if (e.clientX > WIDTH) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
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
          <div className="flex-1 overflow-y-auto px-4 mb-1 custom-scrollbar">
            {Object.keys(projects).map((date) => {
              return (
                <div key={date} className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 py-1">
                    {date}
                  </h2>
                  {projects[date]
                    .filter((project) =>
                      project.description
                        .toLowerCase()
                        .includes(searchString.toLowerCase())
                    )
                    .map((project) => (
                      <div key={project.id} className="mt-1.5">
                        <Button
                          variant={"outline"}
                          onClick={() => {
                            router.push(`/project/${project.id}`);
                          }}
                          className="pl-1 w-full rounded hover:bg-accent cursor-pointer hover:text-accent-foreground text-[12px]"
                        >
                          <div className="w-full flex gap-1">
                            <div className="pl-1 flex items-center">
                              <MessageCircleIcon className="w-4 h-4" />
                            </div>
                            <div>
                              {project.description.length > 40
                                ? `${project.description.substring(0, 35)} ...`
                                : project.description}
                            </div>
                          </div>
                        </Button>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>

          <DrawerFooter className="p-2 bg-neutral-900 rounded-br-4xl shadow-xl ">
            <div className=" p-3 flex items-center gap-4 justify-between">
              <UserButton />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {user?.fullName || "User"}
                </span>
                <span className="text-xs text-neutral-400">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <div
                className="hover:text-blue-600 transition-colors"
                onClick={() => signOut()}
              >
                <LogOutIcon />
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </SignedIn>
  );
}
