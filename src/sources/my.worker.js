
let c = 123;
onmessage = function (event) {
    postMessage(c);
    c++;
};
