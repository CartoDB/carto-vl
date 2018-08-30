import { MVTWorker } from './MVTWorker';
import { WindshaftWorker } from '../client/WindshaftWorker';

const workers = {
    MVT: new MVTWorker(),
    windshaft: new WindshaftWorker()
};

onmessage = function (event) {
    return workers[event.data.workerName].onmessage(event);
};
