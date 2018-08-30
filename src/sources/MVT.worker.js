import { MVTWorker } from './MVTWorker';

const worker = new MVTWorker();

onmessage = worker.onmessage.bind(worker);
