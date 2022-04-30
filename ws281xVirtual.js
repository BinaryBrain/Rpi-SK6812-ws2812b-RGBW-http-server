const path = require('path');
const express = require('express');
const expressWsWrapper = require('express-ws');

const app = new express();
const expressWs = expressWsWrapper(app);
let wsClients = [];
let config;
let colors;

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/light', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'static', 'light.html'));
});

app.get('/3d', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'static', '3d.html'));
});

app.use('/static', express.static(__dirname + '/static'));

expressWs.app.ws('/', (ws) => {
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());

        if (msg.cmd === "hi") {
            wsClients.push(ws);

            if (config) {
                ws.send(JSON.stringify({
                    cmd: "configure",
                    data: config
                }));
            }

            if (colors) {
                ws.send(JSON.stringify({
                    cmd: "render",
                    data: Array.from(colors)
                }));
            }
        }
    });

    ws.on('close', () => {
        wsClients = wsClients.filter(c => c.ws !== ws);
    });
});

function broadcast(msgObj) {
    wsClients.forEach(ws => ws.send(JSON.stringify(msgObj)));
}

// This part simulate the rpi-ws281x-native-fixed lib
const channel = { array: []};

function ws281xVirtual(NB_LED, newConfig) {
    config = newConfig;
    config.leds = NB_LED;
    channel.array = new Array(NB_LED);
    broadcast({
        cmd: "configure",
        data: config
    });

    return channel;
}

ws281xVirtual.render = function () {
    const newColors = [];

    for (let value of channel.array) {
        const w = (value >> 24) & 255;
        const r = (value >> 16) & 255;
        const g = (value >> 8) & 255;
        const b = value & 255;

        newColors.push(w, r, g, b);
    }

    broadcast({
        cmd: "render",
        data: newColors
    });
}

const port = parseInt(process.argv[2]) || 8080;
app.listen(port);
console.log("Web Server started on port", port);

module.exports = ws281xVirtual;
