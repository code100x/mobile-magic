## Things to do
 - Complete the orchestrator. Its an empty folder right now. It should talk to ASGs and scale them up/drain them when a worker becomes idle
 - Send the user response back to the LLM. If a user is changing a file, the LLM needs to be aware of this. 
 - UI cleanups
 - Figure out why npm install doesnt work from time to time. Most probably we need to run them sequentially so create some sort of async queue to do it.
- Create a load balancer service that routes requests from id.worker.100xdevs.com to the respective worker for that project
- Add multiplayer mode
- Backup folders to S3 (can use s3-mount for this)
