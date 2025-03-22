import React, { useState, useRef, useEffect, memo } from "react";
import { Github, Globe, ExternalLink, Copy, Code, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GitHubButtonProps {
  repoName: string;
  repoOwner?: string;
  publishToRepo: () => void;
}

const GitHubPublishUI = memo(({ repoName, repoOwner, publishToRepo }: GitHubButtonProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("HTTPS");
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const repoUrl = `https://github.com/${repoOwner}/${repoName}`;
  const httpsUrl = `https://github.com/${repoOwner}/${repoName}.git`;
  const sshUrl = `git@github.com:${repoOwner}/${repoName}.git`;
  const cliCmd = `gh repo clone ${repoOwner}/${repoName}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openVSCode = () => {
    window.open(`vscode://vscode.git/clone?url=${encodeURIComponent(httpsUrl)}`);
  };

  const viewOnGitHub = () => {
    window.open(repoUrl, "_blank");
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDetails(false);
      }
    };

    if (showDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDetails]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDetails) {
        setShowDetails(false);
      }
    };
    
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showDetails]);

  return (
    <div className="top-4 z-50">
      <button
        onClick={() => setShowDetails(true)}
        className="flex items-center justify-center px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-md"
        aria-label="GitHub Repository"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <Github size={18} className="sm:mr-2" />
        <span className="hidden sm:inline">GitHub</span>
      </button>

      <AnimatePresence>
        {showDetails && (
          <div className="fixed top-64 inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" style={{width: "15rem"}}>
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
              className="m-4 border border-gray-800 rounded-lg text-white overflow-hidden w-full max-w-md shadow-xl"
              style={{ backgroundColor: "#0a0a0a" }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Github className="mr-2" size={20} style={{ color: "#359587" }} />
                    <h2 className="text-sm font-bold">GitHub</h2>
                  </div>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-1">
                  <span className="text-gray-300 text-sm">This project is connected to </span>
                  <span className="font-semibold text-sm" style={{ color: "#359587" }}>{repoOwner}/{repoName} </span>
                  <span className="text-gray-300 text-sm mt-1">Changes will be committed to the <span className="font-semibold">main</span> branch.</span>
                </div>
                
                <div className="mb-2">
                  <p className="text-gray-400 text-xs">Your source code only exists in your GitHub repository. Deleting it removes your work.</p>
                </div>
                
                <div className="mb-1">
                  <h3 className="text-sm font-semibold text-gray-200">Clone</h3>
                  <div className="flex space-x-1 border-b border-gray-800 text-xs">
                    {[
                      { key: "HTTPS", label: "HTTPS" },
                      { key: "SSH", label: "SSH" },
                      { key: "GitHub CLI", label: "GitHubCLI" }
                    ].map(tab => (
                      <button 
                        key={tab.key}
                        className={`py-1 px-2 ${activeTab === tab.key ? "border-b-2 font-medium" : "text-gray-400"}`}
                        style={{ borderColor: activeTab === tab.key ? "#359587" : "transparent" }}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={activeTab === "HTTPS" ? httpsUrl : activeTab === "SSH" ? sshUrl : cliCmd}
                      className="bg-gray-900 text-gray-300 text-sm p-2 rounded-l flex-grow border border-gray-800 font-mono"
                      style={{ backgroundColor: "#0f0f0f" }}
                    />
                    <button 
                      onClick={() => copyToClipboard(activeTab === "HTTPS" ? httpsUrl : activeTab === "SSH" ? sshUrl : cliCmd)}
                      className="bg-gray-800 p-2 rounded-r hover:bg-gray-700 border-t border-r border-b border-gray-800"
                      aria-label="Copy to clipboard"
                    >
                      {copied ? (
                        <span className="text-xs px-1" style={{ color: "#359587" }}>Copied!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={openVSCode}
                    className="w-full text-white py-1 px-2 text-sm rounded flex items-center justify-between transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#359587" }}
                  >
                    <div className="flex items-center">
                      <Code className="mr-2" size={16} />
                      <span>Edit in VS Code</span>
                    </div>
                    <ExternalLink size={16} />
                  </button>
                  
                  <button 
                    onClick={viewOnGitHub}
                    className="w-full bg-transparent hover:bg-gray-800 text-white py-1 px-2 text-sm rounded border border-gray-800 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center">
                      <Github className="mr-2" size={16} />
                      <span>View on GitHub</span>
                    </div>
                    <ExternalLink size={16} />
                  </button>
                  
                  <button 
                    onClick={publishToRepo}
                    className="w-full bg-transparent hover:bg-gray-800 text-white py-1 px-2 text-sm rounded border border-gray-800 flex items-center justify-center transition-colors"
                  >
                    <Globe className="mr-2" size={16} />
                    <span>Push Code</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {copied && (
          <div
            className="fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow-lg z-50"
            style={{ backgroundColor: "#0a0a0a", borderLeft: "3px solid #359587" }}
          >
            Copied to clipboard!
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default GitHubPublishUI;