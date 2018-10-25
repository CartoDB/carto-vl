const puppeteer = require('puppeteer');
const headless = require('../../common/util').headless;

puppeteer.launch({
    headless: headless(),
    args: ['--disable-gpu-vsync']
}).then(browser => {
    browser.newPage().then(page => {
        page.goto(`file://${__dirname}/benchmark.html`, { waitUntil: 'networkidle0' }).then(() => {
            console.log('Benchmark started');
            page.evaluate(() => {
                window.times = [];
                benchmarkLayer(window.times);
                function benchmarkLayer (times) {
                    let lastTime;
                    function metrics (t) {
                        if (lastTime) {
                            const dt = t - lastTime;
                            times.push(dt);
                        }
                        lastTime = t;
                        window.requestAnimationFrame(metrics);
                    }
                    window.requestAnimationFrame(metrics);
                }
            });
            page.waitFor(60000).then(() => {
                page.evaluate(() => {
                    return Promise.resolve(window.times);
                }).then(times => {
                    const sampleSize = times.length;
                    const avg = times.reduce((x, y) => x + y) / times.length;

                    const diffs = times.map((value) => value - avg);
                    const squareDiffs = diffs.map((diff) => diff * diff);
                    const avgSquareDiff = squareDiffs.reduce((x, y) => x + y) / squareDiffs.length;
                    const std = Math.sqrt(avgSquareDiff);

                    const stderr = std / Math.sqrt(sampleSize);

                    times.sort((x, y) => x - y);
                    const p99 = times[Math.floor(times.length * 99 / 100)];
                    const p90 = times[Math.floor(times.length * 90 / 100)];
                    let over60FPS = 0;
                    times.map(t => {
                        over60FPS += t < 16.5 ? 1 / times.length : 0;
                    });
                    over60FPS = over60FPS * 100 + ' %';
                    console.log({ sampleSize, avg, stderr, p90, p99, over60FPS });
                    browser.close();
                });
            });
        });
    });
});
