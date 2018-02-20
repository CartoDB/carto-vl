const http = require('http')
const port = 3000
const n_points = 20000;

function randomPoint(min_x, min_y, max_x, max_y) {
    return {
        pickup_longitude: Math.random()*(max_x - min_x) + min_x,
        pickup_latitude: Math.random()*(max_y - min_y) + min_y,
        amount: Math.random()*150,
        distance: Math.random()*100
    }
}

const requestHandler = (request, response) => {
    console.log(request.url)
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Credentials", false);
    response.setHeader("Access-Control-Max-Age", '86400'); // 24 hours
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    console.log("REQUEST!! ----");
    if (request.method === 'OPTIONS') {
        console.log("  OPTIONS");
        response.end();
    }
    else if (request.url.match(/metadata/i)) {
        console.log("  META");
        let metadata = {
            featureCount: n_points,
            columns: [
                {
                    name: 'amount',
                    type: 'float'
                },
                {
                    name: 'distance',
                    type: 'float'
                }
            ],
            categoryIDs: {},
        };
        response.end(JSON.stringify(metadata));
    }
    else {
        console.log("  DATA");
        // random data in tile 13/2412/3078
        const min_x = -74.00390625, min_y = 40.7472569628042, max_x = -73.9599609375, max_y = 40.7805414318603;
        data = Array.apply(null, Array(n_points*2)).map(()=>randomPoint(min_x, min_y, max_x, max_y));
        response.end(JSON.stringify(data));
    }
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('ERROR', err)
  }
  console.log(`server is listening on ${port}`)
})
