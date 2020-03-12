const ENDPOINT_URL = 'https://bigquery.googleapis.com/bigquery/v2';
const QUERY_TIMEOUT = 5 * 1000;
const POLLING_TIMEOUT = 2 * 60 * 1000;

export default class BigQueryClient {
    constructor (projectId, token) {
        this._projectId = projectId;
        this._token = token;
        this._activeJobs = {};
    }

    async list () {
        return this.fetch('GET', 'jobs');
    }

    async insert () {
        return this.fetch('POST', 'jobs');
    }

    async get (jobId) {
        return this.fetch('GET', `jobs/${jobId}`);
    }

    async cancel (jobId) {
        return this.fetch('POST', `jobs/${jobId}/cancel`);
    }

    async query (sqlQuery) {
        return this.fetch('POST', 'queries', {
            kind: 'bigquery#queryRequest',
            query: sqlQuery,
            useLegacySql: false,
            timeoutMs: QUERY_TIMEOUT,
            useQueryCache: true
        });
    }

    async getQueryResults (jobId) {
        return this.fetch('GET', `queries/${jobId}?timeoutMs=${QUERY_TIMEOUT}`);
    }

    async execute (sqlQuery) {
        const result = await this.query(sqlQuery);
        if (result.error) {
            return result;
        }
        return this._pollingQuery(result);
    }

    async _pollingQuery (result) {
        return new Promise((resolve, reject) => {
            if (result.jobComplete) {
                resolve(result);
            } else {
                const jobId = result.jobReference.jobId;
                this._updateJobTime(jobId);
                if (this._jobTimeout(jobId)) {
                    this._cancelJob(jobId, reject);
                } else {
                    this._getJobResult(jobId, resolve);
                }
            }
        });
    }

    _jobTimeout (jobId) {
        return this._activeJobs[jobId] >= POLLING_TIMEOUT;
    }

    _updateJobTime (jobId) {
        if (jobId in this._activeJobs) {
            this._activeJobs[jobId] += QUERY_TIMEOUT;
        } else {
            this._activeJobs[jobId] = QUERY_TIMEOUT;
        }
    }

    async _cancelJob (jobId, reject) {
        const result = await this.cancel(jobId);
        delete this._activeJobs[jobId];
        reject(result);
    }

    async _getJobResult (jobId, resolve) {
        const result = await this.getQueryResults(jobId);
        if (result.jobComplete) {
            resolve(result);
        } else {
            resolve(this._pollingQuery(result));
        }
    }

    async fetch (method, url, body) {
        const response = await fetch(`${ENDPOINT_URL}/projects/${this._projectId}/${url}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this._token}`,
                'Content-Type': 'application/json'
            },
            body: body && JSON.stringify(body)
        });
        return response.json();
    }
}
