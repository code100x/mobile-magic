import { Prompt } from "@/components/Prompt";
import { Appbar } from "@/components/Appbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <SidebarInset className="bg-transparent">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-4 px-4">
          <div className="space-y-4">
            <Appbar />

            <div className="max-w-2xl mx-auto pt-32">
	      <Hero />

              <div className="pt-4">
                <Prompt />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
