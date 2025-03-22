import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { accessToken, name, description, homepage, isPrivate, isTemplate } = await req.json();

  if (!accessToken || !name) {
    return NextResponse.json({ error: 'Access token and repository name are required.' }, { status: 400 });
  }

  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${accessToken}`,
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({
      name,
      description,
      homepage,
      private: isPrivate,
      is_template: isTemplate
    })
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.message || 'Failed to create repository' }, { status: response.status });
  }

  return NextResponse.json({ message: 'Repository created successfully!', data });
}




// import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// export async function POST(req: NextRequest) {
//   const { accessToken, name, description, homepage, isPrivate, isTemplate } = await req.json();

//   if (!accessToken || !name) {
//     return NextResponse.json({ error: 'Access token and repository name are required.' }, { status: 400 });
//   }

//   // Create the repository
//   const response = await fetch('https://api.github.com/user/repos', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/vnd.github+json',
//       'Authorization': `Bearer ${accessToken}`,
//       'X-GitHub-Api-Version': '2022-11-28'
//     },
//     body: JSON.stringify({
//       name,
//       description,
//       homepage,
//       private: isPrivate,
//       is_template: isTemplate
//     })
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     return NextResponse.json({ error: data.message || 'Failed to create repository' }, { status: response.status });
//   }

//   // Push README file after repository creation
//   try {
//     const owner = data.owner.login;
//     const repoName = data.name;
    
//     // Path to the README file
//     const readmePath = path.join(process.cwd(), './Readme');
    
//     // Check if file exists
//     if (!fs.existsSync(readmePath)) {
//       throw new Error(`README file not found at: ${readmePath}`);
//     }
    
//     // Read the README file content
//     const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
//     // Convert content to base64
//     const contentBase64 = Buffer.from(readmeContent).toString('base64');
    
//     // Push README to repository
//     const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/README.md`, {
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/vnd.github+json',
//         'Authorization': `Bearer ${accessToken}`,
//         'X-GitHub-Api-Version': '2022-11-28'
//       },
//       body: JSON.stringify({
//         message: 'Add README file',
//         content: contentBase64
//       })
//     });
    
//     const uploadData = await uploadResponse.json();
    
//     if (!uploadResponse.ok) {
//       throw new Error(uploadData.message || 'Failed to upload README file');
//     }
    
//     return NextResponse.json({ 
//       message: 'Repository created successfully and README added!', 
//       repository: data,
//       readme: {
//         path: 'README.md',
//         status: 'success',
//         url: uploadData.content.html_url
//       }
//     });
//   } catch (error: any) {
//     console.error(`Error uploading README: ${error.message}`);
//     return NextResponse.json({ 
//       message: 'Repository created but failed to add README', 
//       repository: data,
//       error: error.message 
//     }, { status: 207 }); // 207 Multi-Status
//   }
// }



// import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// export async function POST(req: NextRequest) {
//   const { accessToken, name, description, homepage, isPrivate, isTemplate, files } = await req.json();

//   if (!accessToken || !name) {
//     return NextResponse.json({ error: 'Access token and repository name are required.' }, { status: 400 });
//   }
//   console.log("accessToken", accessToken)

//   // Create the repository
//   const response = await fetch('https://api.github.com/user/repos', {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/vnd.github+json',
//       'Authorization': `Bearer ${accessToken}`,
//       'X-GitHub-Api-Version': '2022-11-28'
//     },
//     body: JSON.stringify({
//       name,
//       description,
//       homepage,
//       private: isPrivate,
//       is_template: isTemplate
//     })
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     return NextResponse.json({ error: data.message || 'Failed to create repository' }, { status: response.status });
//   }

//   const owner = data.owner.login;
//   const repoName = data.name;
//   const uploadResults = [];

//   try {
//     // Process README first
//     // Path to the README file
//     const readmePath = path.join(process.cwd(), './Readme');
    
//     // Check if file exists
//     if (fs.existsSync(readmePath)) {
//       // Read the README file content
//       const readmeContent = fs.readFileSync(readmePath, 'utf8');
      
//       // Convert content to base64
//       const contentBase64 = Buffer.from(readmeContent).toString('base64');
      
//       // Push README to repository
//       const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/README.md`, {
//         method: 'PUT',
//         headers: {
//           'Accept': 'application/vnd.github+json',
//           'Authorization': `Bearer ${accessToken}`,
//           'X-GitHub-Api-Version': '2022-11-28'
//         },
//         body: JSON.stringify({
//           message: 'Add README file',
//           content: contentBase64
//         })
//       });
      
//       const uploadData = await uploadResponse.json();
      
//       if (!uploadResponse.ok) {
//         throw new Error(uploadData.message || 'Failed to upload README file');
//       }
      
//       uploadResults.push({
//         path: 'README.md',
//         status: 'success',
//         url: uploadData.content.html_url
//       });
//     }
    
//     // Process additional files if provided
//     if (files && Array.isArray(files)) {
//       for (const file of files) {
//         try {
//           const { path: filePath, content } = file;
          
//           if (!filePath || !content) {
//             throw new Error('File path and content are required');
//           }
          
//           // Convert content to base64
//           const contentBase64 = Buffer.from(content).toString('base64');
          
//           // Push file to repository
//           const fileUploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`, {
//             method: 'PUT',
//             headers: {
//               'Accept': 'application/vnd.github+json',
//               'Authorization': `Bearer ${accessToken}`,
//               'X-GitHub-Api-Version': '2022-11-28'
//             },
//             body: JSON.stringify({
//               message: `Add ${filePath}`,
//               content: contentBase64
//             })
//           });
          
//           const fileUploadData = await fileUploadResponse.json();
          
//           if (!fileUploadResponse.ok) {
//             throw new Error(fileUploadData.message || `Failed to upload ${filePath}`);
//           }
          
//           uploadResults.push({
//             path: filePath,
//             status: 'success',
//             url: fileUploadData.content.html_url
//           });
//         } catch (fileError: any) {
//           uploadResults.push({
//             path: file.path,
//             status: 'error',
//             error: fileError.message
//           });
//         }
//       }
//     }
    
//     return NextResponse.json({ 
//       message: 'Repository created successfully and files added!', 
//       repository: data,
//       files: uploadResults
//     });
//   } catch (error: any) {
//     console.error(`Error processing files: ${error.message}`);
//     return NextResponse.json({ 
//       message: 'Repository created but failed to add some files', 
//       repository: data,
//       files: uploadResults,
//       error: error.message 
//     }, { status: 207 }); // 207 Multi-Status
//   }
// }