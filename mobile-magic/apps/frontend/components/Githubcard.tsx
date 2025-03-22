'use client'
import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { BACKEND_URL } from "@/config";
import axios from "axios";


export default function GitHubRepoCard() {
  const [isOpen, setIsOpen] = useState(false);
 

  const handleGithubClick = async () => {
    try {
        
        const githubToken = localStorage.getItem("githubToken");
        const githubUsername = localStorage.getItem("githubUsername");

        if (!githubToken) {
            return (window.location.href = `${BACKEND_URL}/auth/github`);
        }
        const response = await axios.post(`${BACKEND_URL}/createrepo`,
          {
            githubToken,
            githubUsername,
            files: [
              {
                name: "myFile.txt",
                content: "This is the content of my file."
              },
              {
                name: "anotherFile.js",
                content: "console.log('Hello from another file!');"
              }
            ]
          },
        );

        if (response.data.repoUrl) {
            window.open(response.data.repoUrl, "_blank");
        }
    } catch  {
        alert("Failed to clone repository");
    }
};

  return (
    <div className="relative">
      
      <button
        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        GitHub
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="absolute right-4 mt-2 bg-black text-white p-4 rounded-lg shadow-lg w-80">
          <h2 className="text-lg font-bold">GitHub</h2>
          <p className="text-sm mt-2">
            This project is connected to <br />
            <span className="font-semibold">{`mobile-magic`}</span>.
            <br /> Changes will be committed to the <b>main</b> branch.
          </p>


          <div className="mt-4 flex flex-col">
            <button 
              className="bg-blue-500 text-white text-sm text-center p-2 rounded mb-2 flex items-center justify-center gap-2"
              onClick={() => {
                alert("not avilable yet")
              }}
            >
              Edit in VS Code <ExternalLink size={14} />
            </button>
            <button
             className="text-white text-sm text-center border border-gray-600 p-2 rounded flex items-center justify-center gap-2"
             onClick={handleGithubClick}
            >
              View on GitHub <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}