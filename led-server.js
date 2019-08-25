const express = require('express');
const ws281x = require('rpi-ws281x');
const bodyParser = require('body-parser');

const LED_NB = ledNb(300);
const PIN = 18;

function runServer() {
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

    function changeLeds(colors) {
        ledManager.setColors(colors);
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

        // Number of leds in my strip
        this.config.leds = LED_NB;

        // Set full brightness, a value from 0 to 255 (default 255)
        this.config.brightness = 255;

        // Set the GPIO number to communicate with the Neopixel strip (default 18)
        this.config.gpio = PIN;

        // The RGB sequence may vary on some strips. Valid values
        // are "rgb", "rbg", "grb", "gbr", "bgr", "brg".
        // Default is "rgb".
        // RGBW strips are not currently supported.
        this.config.strip = 'rgb';

        // Configure ws281x
        ws281x.configure(this.config);
    }

    // FORMAT: [{r: 255, g: 255, b: 255, w?: 255}]
    setColors (colors) {
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

    // for (let i = 0; i < LED_NB; i++) {
    //     newArray[i] = ((a.shift() << 16) | (a.shift() << 8) | (a.shift()));
    // }

    return newArray;
}

runServer();
