export class ArtifactProcessor {
    public currentArtifact: string;
    public instanceIds: string[];
    private onFileContent: (filePath: string, fileContent: string) => void;
    private onShellCommand: (shellCommand: string) => void;
  
    constructor(
      instanceIds: string[],
      onFileContent: (filePath: string, fileContent: string) => void,
      onShellCommand: (shellCommand: string) => void
    ) {
      this.instanceIds = instanceIds;
      this.currentArtifact = '';
      this.onFileContent = onFileContent;
      this.onShellCommand = onShellCommand;
    }
  
    append(artifact: string) {
      this.currentArtifact += artifact;
      this.parse();
    }
  
    async finalize() {
      // Cleanup logic for all instances
      this.currentArtifact = '';
      return Promise.resolve();
    }
  
    private parse() {
      const lines = this.currentArtifact.split("\n");
      const actionStart = lines.findIndex(line => line.includes("<boltAction"));
      const actionEnd = lines.findIndex(line => line.includes("</boltAction>"));
  
      if (actionStart === -1 || actionEnd === -1) return;
  
      try {
        const actionTypeLine = lines[actionStart];
        const actionContent = lines.slice(actionStart, actionEnd + 1).join("\n");
  
        if (actionTypeLine.includes('type="shell"')) {
          const command = lines.slice(actionStart + 1, actionEnd)
            .join("\n")
            .replace("</boltAction>", "")
            .trim();
          this.onShellCommand(command);
        } else if (actionTypeLine.includes('type="file"')) {
          const filePathMatch = actionTypeLine.match(/filePath="([^"]+)"/);
          if (filePathMatch) {
            const content = lines.slice(actionStart + 1, actionEnd)
              .join("\n")
              .replace("</boltAction>", "");
            this.onFileContent(filePathMatch[1], content);
          }
        }
        
        this.currentArtifact = lines.slice(actionEnd + 1).join("\n");
      } catch (error) {
        console.error('Error parsing artifact:', error);
      }
    }
  }