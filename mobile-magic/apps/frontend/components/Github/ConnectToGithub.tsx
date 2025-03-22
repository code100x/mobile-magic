// "use client";

// import axios from "axios";
// import { useState, useEffect } from "react";
// import { Github, Globe } from "lucide-react";
// import GitHubPublishUI from "./GitPublishUI";

// export default function ConnectToGithub() {
//   const [repoName, setRepoName] = useState("");
//   const [accessToken, setAccessToken] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [repo, setRepo] = useState<boolean>(false);
//   const clientId = "Ov23ligJEGHq8tCMte5X";
//   const [username, setUsername] = useState("");
//   const scope = "repo admin:repo_hook workflow admin:org";
//   useEffect(() => {
//     const codeTemp = window.location.href.split('code=')[1];
//     if (codeTemp) {
//       async function getAccessToken() {
//         const response = await axios.post(`http://localhost:3000/api/auth/github?code=${codeTemp}`);
//         setAccessToken(response.data.access_token);
//       }
//       getAccessToken();
//     }
//   }, []);

//   const authorizeGitHub = () => {
//     const redirectUri = encodeURIComponent("http://localhost:3000");
//     const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
//     window.location.href = authUrl;
//   };

//   let owner = "CrypticNomand"

//   const getUserData = async (token:string) => {
//     try {
//       const response = await axios.get('https://api.github.com/user', {
//         headers: {
//           Authorization: `token ${token}`
//         }
//       });
      
//       setUsername(response.data.login);
//     } catch (error) {
//       console.error("Error fetching GitHub user data:", error);
//     }
//   };

//   const publishToRepo = async()=>{
//     try {
//       const body =  {
//         "token": accessToken,
//         "user": owner,
//         "repo": repoName,
//         "filePath": "testing-folder/.gitkeep",
//         "content": "work",
//         "message": "creating an empty folder"
//       }
//       console.log(body)
//       const response = await axios.post("http://localhost:3000/api/auth/createProjectFiles", body)
//       if(response){
//         console.log(response)
//         alert("Files added")
//       }
//     } catch (error) {
//       console.log(error)
//       alert("Error adding files")
//     }
//   }

//   const createRepo = async () => {
//     if (!accessToken) {
//       alert("Please authorize GitHub first.");
//       return;
//     }
  
//     if (!repoName.trim()) {
//       alert("Please enter a repository name.");
//       return;
//     }
  
//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/auth/createRepo", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           accessToken: accessToken,
//           name: repoName,
//           description: "This is your first repo!",
//           homepage: "https://github.com",
//           isPrivate: false,
//           isTemplate: true
//         }),
//       });
  
//       const data = await response.json();
//       if (response.ok) {
//         setRepo(true)
//         alert("Repository published successfully!");
//       } else {
//         alert(data.message || "Failed to publish repository.");
//       }
//     } catch (error) {
//       console.error("Error publishing repository:", error);
//       alert("Failed to publish repository. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };
  

//   return (
//     <div className=" max-w-md mx-auto rounded-lg shadow-md">

//       {!accessToken ? (
//         <button
//           onClick={authorizeGitHub}
//           disabled={isLoading}
//           className="w-full bg-black border  border-white text-white py-2 px-4 rounded hover:bg-gray-800 disabled:bg-gray-400"
//         >
//           {isLoading ? "Connecting..." : <p className="flex"> <span className="text-sm mr-1"><Github/></span> Authorize GitHub </p>}
//         </button>
//       ) : (
//         <>
//         {!repo?
//           <div className="space-y-4 border border-white p-3 rounded-2xl">
//           <div className="flex items-center text-green-600 mb-1 text-sm">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             Connected to GitHub
//           </div>

//           <div>
//             <label htmlFor="repoName" className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
//             <input
//               id="repoName"
//               type="text"
//               value={repoName}
//               onChange={(e) => setRepoName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="my-awesome-repo"
//             />
//           </div>

//           <button
//             onClick={createRepo}
//             disabled={isLoading || !repoName.trim()}
//             className="w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
//           >
//             {isLoading ? "Publishing..." : "Publish to GitHub"}
//           </button>
//         </div>
//         :

//         // make the ui here, don;t change any of the above code
//         // <div className="border border-white p-2 rounded-lg">
//         //   <button className="flex" onClick={publishToRepo}> <span className="text-sm mr-2"><Globe/></span> Publish you project</button>
//         // </div>

//         <GitHubPublishUI 
//           repoName={repoName} 
//           repoOwner={owner}
//           publishToRepo={publishToRepo} 
//         />
//         }
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { Github, Globe } from "lucide-react";
import GitHubPublishUI from "./GitPublishUI";

export default function ConnectToGithub() {
  const [repoName, setRepoName] = useState("");
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [repo, setRepo] = useState<boolean>(false);
  const [username, setUsername] = useState(""); // Add state for GitHub username
  const clientId = "Ov23ligJEGHq8tCMte5X";
  const scope = "repo admin:repo_hook workflow admin:org";
  
  useEffect(() => {
    const codeTemp = window.location.href.split('code=')[1];
    if (codeTemp) {
      async function getAccessToken() {
        const response = await axios.post(`http://localhost:3000/api/auth/github?code=${codeTemp}`);
        setAccessToken(response.data.access_token);
        
        // Fetch the user data after getting the access token
        if (response.data.access_token) {
          getUserData(response.data.access_token);
        }
      }
      getAccessToken();
    }
  }, []);

  // Function to fetch GitHub user data
  const getUserData = async (token:string) => {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`
        }
      });
      
      setUsername(response.data.login);
    } catch (error) {
      console.error("Error fetching GitHub user data:", error);
    }
  };

  const authorizeGitHub = () => {
    const redirectUri = encodeURIComponent("http://localhost:3000");
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  const publishToRepo = async() => {
    try {
      const body = {
        "token": accessToken,
        "user": username, // Use the fetched username instead of hardcoded value
        "repo": repoName,
        "filePath": "testing-folder/.gitkeep",
        "content": "work",
        "message": "creating an empty folder"
      }
      console.log(body)
      const response = await axios.post("http://localhost:3000/api/auth/createProjectFiles", body)
      if(response){
        console.log(response)
        alert("Files added")
      }
    } catch (error) {
      console.log(error)
      alert("Error adding files")
    }
  }

  const createRepo = async () => {
    if (!accessToken) {
      alert("Please authorize GitHub first.");
      return;
    }
  
    if (!repoName.trim()) {
      alert("Please enter a repository name.");
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/createRepo", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          accessToken: accessToken,
          name: repoName,
          description: "This is your first repo!",
          homepage: "https://github.com",
          isPrivate: false,
          isTemplate: true
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setRepo(true)
        alert("Repository published successfully!");
      } else {
        alert(data.message || "Failed to publish repository.");
      }
    } catch (error) {
      console.error("Error publishing repository:", error);
      alert("Failed to publish repository. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="">

      {!accessToken ? (
        <button
          onClick={authorizeGitHub}
          disabled={isLoading}
          className="w-full bg-black border border-white text-white py-2 px-4 rounded hover:bg-gray-800 disabled:bg-gray-400"
        >
          {isLoading ? "Connecting..." : <p className="flex"> <span className="text-sm mr-1"><Github/></span> Authorize GitHub </p>}
        </button>
      ) : (
        <>
        {!repo ?
          <div className="space-y-4 border border-white p-3 rounded-2xl">
          <div className="flex items-center text-green-600 mb-1 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Connected to GitHub {username && `as ${username}`}
          </div>

          <div>
            <label htmlFor="repoName" className="block text-sm font-medium text-gray-700 mb-1">Repository Name</label>
            <input
              id="repoName"
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="my-awesome-repo"
            />
          </div>

          <button
            onClick={createRepo}
            disabled={isLoading || !repoName.trim()}
            className="w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "Publishing..." : "Publish to GitHub"}
          </button>
        </div>
        :
        <GitHubPublishUI 
          repoName={repoName} 
          repoOwner={username} // Use the fetched username
          publishToRepo={publishToRepo} 
        />
        }
        </>
      )}
    </div>
  );
}