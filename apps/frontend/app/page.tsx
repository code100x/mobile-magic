import { Appbar } from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import { Prompt } from "@/components/Prompt";
import Image from "next/image";
import { TemplateButtons } from "@/components/TemplateButtons";
import { ProjectsDrawer } from "@/components/ProjectsDrawer";

export default function Home() {
  return (
    <div className="p-4 bg-gradient-to-b from-blue-600/50 to-50% to-black h-screen">
      <Appbar />
      <ProjectsDrawer />
      <div className="max-w-2xl mx-auto pt-16  flex flex-col">
        <div className="pb-14 mx-auto">
          <span className="px-3 py-1 text-center text-sm font-semibold rounded-full bg-gradient-to-l from-emerald-700 to to-orange-400 shadow-xl ">
            ✨ simply the mobile-magic
          </span>
        </div>
        <div className="text-2xl font-bold text-center">
          What do you want to build?
        </div>
        <div className="text-sm text-muted-foreground text-center p-2">
          Prompt, click generate and watch your app come to life
        </div>
        <div className="pt-4">
          <Prompt />
        </div>
      </div>
      <div className="max-w-2xl mx-auto pt-4">
        <TemplateButtons />
      </div>
    </div>
  );
}
