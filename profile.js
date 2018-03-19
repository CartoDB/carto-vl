const puppeteer = require('puppeteer');


puppeteer.launch({
    headless: false,
    args: ['--disable-gpu-vsync'],
}).then(browser => {
    browser.newPage().then(page => {
        page.goto('file:///home/dmanzanares/github/renderer-prototype/examples/expressions/animation.html', { waitUntil: 'networkidle0' }).then(() => {
            console.log('Profiling started');
            page.evaluate(() => {
                window.times = [];
                profileLayer(window.times);
                function profileLayer(times) {
                    let lastTime;
                    function metrics(t) {
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
            page.waitFor(15000).then(() => {
                page.evaluate(() => {
                    return Promise.resolve(window.times);
                }).then(times => {
                    const sampleSize = times.length;
                    const avg = times.reduce((x, y) => x + y) / times.length;
                    times.sort((x, y) => x - y);
                    const p99 = times[Math.floor(times.length * 99 / 100)];
                    const p90 = times[Math.floor(times.length * 90 / 100)];
                    let over60FPS = 0;
                    times.map(t => over60FPS += t < 16.5 ? 1 / times.length : 0);
                    over60FPS = over60FPS * 100 + ' %';
                    console.log({ sampleSize, avg, p90, p99, over60FPS });
                    browser.close();
                });
            });
        });
    });
});
