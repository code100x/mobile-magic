import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GitHubLogoIcon, FileIcon, DownloadIcon } from '@radix-ui/react-icons'

interface ExportOptionsProps {
  repoUrl?: string
  onExport?: (type: 'github' | 'https' | 'ssh' | 'cli') => void
}

export const ExportOptions = ({ repoUrl, onExport }: ExportOptionsProps) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 [&_svg:not([class*='size-'])]:size-5"
        >
          <DownloadIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <GitHubLogoIcon className="size-5" />
            <span className="font-medium">Clone</span>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Select a cloning method to get the project URL
          </div>
          <div className="space-y-2">
            <DropdownMenuItem
              className="flex items-center justify-between"
              onClick={() => {
                handleCopy(`${repoUrl || ''}`);
                onExport?.('https');
              }}
            >
              <span>HTTPS</span>
              <FileIcon className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between"
              onClick={() => {
                handleCopy(`git@github.com:${repoUrl?.split('github.com/')[1]}`);
                onExport?.('ssh');
              }}
            >
              <span>SSH</span>
              <FileIcon className="size-4" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center justify-between"
              onClick={() => {
                handleCopy(`gh repo clone ${repoUrl?.split('github.com/')[1]}`);
                onExport?.('cli');
              }}
            >
              <span>GitHub CLI</span>
              <FileIcon className="size-4" />
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
