const dotenv = require('dotenv');
dotenv.config();

const dgram = require('dgram');
const express = require('express');
const bodyParser = require('body-parser');

const LedManager = require('./ledManager.js');

const NB_LED = parseInt(process.env.NB_LED);
const PIN = parseInt(process.env.PIN);
const LED_TYPE = process.env.LED_TYPE;
const INVERT = process.env.INVERT.toLowerCase() === "true";

if (typeof NB_LED === 'undefined' || typeof PIN === 'undefined' || typeof LED_TYPE === 'undefined') {
    throw new Error("NB_LED, PIN and LED_TYPE should be defined. Either pass them as an environment variable, or add it to the .env file.");
}

const ledManager = new LedManager(NB_LED, PIN, LED_TYPE, INVERT);

function runUdpServer() {
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
        console.log(`UDP server error:\n${err.stack}`);
    });

    server.on('message', (msg, rinfo) => {
        try {
            if (msg.readUInt8() === 3) {
                // Binary RGB
                const payload = new Uint32Array(NB_LED);
                payload.set(msg.slice(1, msg.length));
                const colorArray = Array.from(payload);
                // FIXME add white byte to array
                // Render to strip
                ledManager.renderArray(colorArray);
            } else if (msg.readUInt8() === 4) {
                // Binary RGBW
                ledManager.renderArray(msg.slice(1, msg.length));
            } else if (msg.toString('utf-8', 0, 1) === '{') {
                // JSON
                changeLeds(JSON.parse(msg.toString('utf-8')).colors);
            } else {
                console.log(`UDP server error: Cannot read packet starting with byte 0x${msg.slice(0, 1).toString('hex')}`);
            }
        } catch (e) {
            console.log(`UDP server error on message: ${msg.toString('hex')} (${msg.length} bytes)`);
            console.log(e);
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`UDP server listening ${address.address}:${address.port}`);
        console.log(`First byte is header: 0x03 for RGB, 0x04 for WRGB. Rest is payload, each byte is a color value.`);
    });

    server.bind(13334);
}

function runExpressServer() {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/', (req, res) => {
        changeLeds(req.body.colors);
        res.send(JSON.stringify(req.body.colors));
    });

    app.get('/config', (req, res) => {
        res.json({
            NB_LED
        });
    });

    app.listen(13334);

    console.log(`Server listening on port 13334`);
    console.log(`API: POST { "colors": [{ "r": 255, "g": 255, "b": 255, "w": 255 }, { "r": 0, "g": 255, "b": 0, "w": 255 }]}`);
    console.log(`API: POST { "colors": ["FF00FF00", "77FF22FF", "00FFFF00"]}`);
}

function changeLeds(colors) {
    const color = colors[0];
    if (typeof color === "string") {
        ledManager.setColorsStr(colors);
    } else {
        ledManager.setColorsObj(colors);
    }
}

runUdpServer();
runExpressServer();
