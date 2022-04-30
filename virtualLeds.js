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

const port = parseInt(process.argv[2]) || 8080;
app.listen(port);
console.log("Web Server started on port", port);

const VirutalLeds = {
    configure: (newConfig) => {
        config = newConfig;
        broadcast({
            cmd: "configure",
            data: config
        });
    },
    render: (newColors) => {
        colors = newColors;

        broadcast({
            cmd: "render",
            data: colors
        });
    }
}

module.exports = VirutalLeds;
