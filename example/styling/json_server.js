const http = require('http')
const port = 3000
const n_points = 20000;

const requestHandler = (request, response) => {
    console.log(request.url)
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Credentials", false);
    response.setHeader("Access-Control-Max-Age", '86400'); // 24 hours
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    if (request.method === 'OPTIONS') {
        response.end();
    }
    else {
        data = Array.apply(null, Array(n_points*2)).map(()=>Math.random()*2-1);
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
