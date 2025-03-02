import { Button } from "./ui/button";
import { Camera, FileUp, Figma, Layout, UserPlus, } from "lucide-react"

export function TemplateButtons() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="outline" className="border-primary/20  bg-transparent text-primary/80 hover:bg-gray-900">
        <Camera className="mr-2 h-4 w-4" />
        Build a chess app
      </Button>
      <Button variant="outline" className="border-primary/20  bg-transparent text-primary/80 hover:bg-gray-900">
        <Figma className="mr-2 h-4 w-4" />
        Create a todo app
      </Button>
      <Button variant="outline" className="border-primary/20  bg-transparent text-primary/80 hover:bg-gray-900">
        <FileUp className="mr-2 h-4 w-4" />
        Create a docs app
      </Button>
      <Button variant="outline" className="border-primary/20  bg-transparent text-primary/80 hover:bg-gray-900">
        <Layout className="mr-2 h-4 w-4" />
        Landing Page
      </Button>
      <Button variant="outline" className="border-primary/20  bg-transparent text-primary/80 hover:bg-gray-900">
        <UserPlus className="mr-2 h-4 w-4" />
        Create a base app
      </Button>
    </div>
  );
}
