const RUNS = 1e5;

/**
 * Meassure the average execution time of a function
 * @param {*} name 
 * @param {*} fn 
 */
function perf(name, fn) {
    console.log(name);
    console.log(_meassure(fn, RUNS));
}


function _meassure(fn, runs) {
    let total = 0;
    for (let i = 0; i < runs; i++) {
        const start = performance.now();
        fn();
        const end = performance.now();
        total += (end - start);
    }
    return { avg: total / runs, runs };
}





module.exports = { perf };
