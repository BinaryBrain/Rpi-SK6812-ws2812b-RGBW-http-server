const dgram = require('dgram');
const express = require('express');
const ws281x = require('rpi-ws281x');
const bodyParser = require('body-parser');

const LED_NB = ledNb(300);
const PIN = 18;


function runUdpServer() {
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
        console.log(`UDP server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        console.log(`UDP server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

        if (msg.readUInt8() === 3) {
            // Binary RGB
            const payload = new Uint8Array(msg.slice(1, msg.length));
            const colorArray = Array.from(payload);
            // Render to strip
            ws281x.render(colorArray);
        } else if (msg.readUInt8() === 4) {
            // Binary RGBW
            const payload = new Uint8Array(msg.slice(1, msg.length));
            const colorArray = Array.from(payload);
            // Translate and render to strip
            ws281x.render(translate(colorArray));
        } else if (msg.toString(0, 1) === '{') {
            // JSON
            changeLeds(JSON.parse(msg.toString('utf-8')));
        } else {
            console.log(`UDP server error: Cannot read packet starting with byte ${msg.slice(0, 1)}`);
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`UDP server listening ${address.address}:${address.port}`);
        console.log(`First byte is header: 0x03 for RGB, 0x04 for RGBW. Rest is payload, each byte is a color value.`);
    });

    server.bind(13335);
}

function runExpressServer() {
    const app = express();
    const ledManager = new LedManager();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/', (req, res)=> {
        changeLeds(req.body.colors);
        res.send(JSON.stringify(req.body.colors));
    });

    app.listen(13334);

    console.log(`Server listening on port 13334`);
    console.log(`API: POST { "colors": [{ "r": 255, "g": 255, "b": 255, "w": 255 }, { "r": 0, "g": 255, "b": 0, "w": 255 }]}`);
    console.log(`API: POST { "colors": ["FF00FF00", "77FF22FF", "00FFFF00"]}`);

    function changeLeds(colors) {
        const color = colors[0];
        if (typeof color === "string") {
            ledManager.setColorsStr(colors);
        } else {
            ledManager.setColorsObj(colors);
        }
    }

}

function ledNb(nleds) {
    let nbytes = nleds * 4;
    if (nbytes % 3 > 0) {
        return nbytes / 3 + 1;
    } else {
        return nbytes / 3;
    }
}

class LedManager {
    constructor() {
        this.config = {};
        this.config.leds = LED_NB;
        this.config.brightness = 255;
        this.config.gpio = PIN;
        this.config.strip = 'rgb';
        ws281x.configure(this.config);
    }

    // FORMAT: ["FFAA66", "FFAA66FF"]
    setColorsStr (colors) {
        const colorArray = [];

        for (let color of colors) {
            const value = parseInt(color, 16);

            let r = 0;
            let g = 0;
            let b = 0;
            let w = 0;

            if (color.length == 8) {
                r = (value >> 24) & 255;
                g = (value >> 16) & 255;
                b = (value >> 8) & 255;
                w = value & 255;
            } else {
                r = (value >> 16) & 255;
                g = (value >> 8) & 255;
                b = value & 255;
                w = 0;
            }

            colorArray.push(r, g, b, w);
        }

        const pixels = translate(colorArray);

        // Render to strip
        ws281x.render(pixels);
    }

    // FORMAT: [{r: 255, g: 255, b: 255, w?: 255}]
    setColorsObj (colors) {
        const colorArray = [];

        for (let color of colors) {
            if (!color.w) {
                color.w = 0;
            }

            colorArray.push(color.w); // White
            colorArray.push(color.g); // Green
            colorArray.push(color.r); // Red
            colorArray.push(color.b); // Blue
        }

        const pixels = translate(colorArray);

        // Render to strip
        ws281x.render(pixels);
    }
};

function translate(a) {
    const newArray = new Uint32Array(LED_NB);

    for (let i = 0; i < a.length; i = i + 3) {
        const j = i / 3;
        newArray[j] = ((a[i] << 24) | (a[i+1] << 16) | (a[i+2] << 8) | (a[i+3]))
    }

    return newArray;
}

runUdpServer();
runExpressServer();
