import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(`project-processing`)
export class projectProcessor extends WorkerHost {
  async process(job: Job): Promise<void> {
    console.log(`job received`);
    console.log(job.name);
    console.log(job.data);
  }
}
