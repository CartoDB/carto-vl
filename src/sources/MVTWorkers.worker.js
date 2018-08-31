import { MVTWorker } from './MVTWorker';
import { WindshaftWorker } from '../client/WindshaftWorker';

// This file publishes a Web Worker onmessage function that will redirect incoming messages
// based on an ID (`workerName`) defined by the message sender
// to each different Worker implementation

const workers = {
    MVT: new MVTWorker(),
    windshaft: new WindshaftWorker()
};

onmessage = function (event) {
    return workers[event.data.workerName].onmessage(event);
};
