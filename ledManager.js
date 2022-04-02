const ws281x = require('rpi-ws281x-native-fixed');

class LedManager {
    constructor(NB_LED, PIN, LED_TYPE) {
        this.NB_LED = NB_LED;
        // this.config = {};
        // this.config.leds = NB_LED;
        // this.config.brightness = 255;
        // this.config.gpio = PIN;
        // this.config.strip = LED_TYPE;
        // ws281x.configure(this.config);

        const config = {
            stripType: LED_TYPE,
            GPIO: PIN,
        };

        this.channel = ws281x(NB_LED, config);
    }

    // FORMAT: ["CCAA66", "FFCCAA66"]
    setColorsStr (colors) {
        const colorArray = [];

        for (let color of colors) {
            const value = parseInt(color, 16);
            const w = (value >> 24) & 255;
            const r = (value >> 16) & 255;
            const g = (value >> 8) & 255;
            const b = value & 255;

            colorArray.push(r, g, b, w);
        }

        const pixels = this.translate(colorArray);

        // Render to strip
        ws281x.render();
    }

    // FORMAT: [{r: 255, g: 255, b: 255, w?: 255}]
    setColorsObj (colors) {
        const colorArray = [];

        for (let color of colors) {
            if (!color.w) {
                color.w = 0;
            }

            colorArray.push(color.w);
            colorArray.push(color.r);
            colorArray.push(color.g);
            colorArray.push(color.b);
        }

        const pixels = this.translate(colorArray);

        // Render to strip
        ws281x.render(pixels);
    }

    renderBytes (bytes) {
        ws281x.render(bytes);
    }

    renderArray (array) {
        ws281x.render(this.translate(array));
    }

    translate (array) {
        const newArray = this.channel.array;

        for (let i = 0; i < array.length; i = i + 4) {
            const j = i/4;
            newArray[j] = ((array[i] << 24) | (array[i+1] << 16) | (array[i+2] << 8) | (array[i+3]));
        }

        return newArray;
    }
};

module.exports = LedManager;
