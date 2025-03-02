import { Appbar } from "@/components/Appbar";
import { Button } from "@/components/ui/button";
import { Prompt } from "@/components/Prompt";
import { TemplateButtons } from "@/components/TemplateButtons";
import { ProjectsDrawer } from "@/components/ProjectsDrawer";
import AnimatedComp from "@/components/AnimatedComp";



export default function Home() {
  return (
    <div className="p-4 overflow-x-hidden">
      <Appbar />
    <div className=" relative mt-4 border-b-2 border-zinc-400/50 w-screen right-4" />
      <div className="flex justify-center mt-16">
     <AnimatedComp />
      </div>
      <ProjectsDrawer />
      <div className="max-w-2xl mx-auto pt-28">
        <div className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-indigo-600 font-bold text-center">
          What do you want to build?
        </div>
        <div className="text-md text-muted-foreground text-center p-2">
          Prompt, click generate and watch your app come to life
        </div>
        <div className="pt-6 w-xl mx-auto  ">
          <Prompt />
        </div>
      </div>
      <div className="max-w-2xl mx-auto pt-8">
        <TemplateButtons />
      </div>
    </div>
  );
}
