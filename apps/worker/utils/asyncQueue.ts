// apps/worker/utils/asyncQueue.ts
export class AsyncQueue {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;
  
    enqueue(task: () => Promise<void>) {
      this.queue.push(task);
      this.process();
    }
  
    private async process() {
      if (this.isProcessing) return;
      this.isProcessing = true;
  
      while (this.queue.length > 0) {
        const task = this.queue.shift();
        if (task) {
          await task();
        }
      }
  
      this.isProcessing = false;
    }
  }
  
  // Export a singleton instance of the queue
  export const npmInstallQueue = new AsyncQueue();