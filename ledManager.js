const ws281x = require('rpi-ws281x');

class LedManager {
    constructor(LED_NB, PIN, type) {
        this.type = type;
        this.LED_NB = LED_NB;
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

            if (color.length === 8) {
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

        const pixels = this.translate(colorArray);

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

            colorArray.push(color.r); // Red
            colorArray.push(color.g); // Green
            colorArray.push(color.b); // Blue
            colorArray.push(color.w); // White
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
        if (this.type === 'rgb') {
            return this.translateRGBW(array);
        } else {
            return this.translateGRBW(array);
        }
    }

    translateRGBW (array) {
        const newArray = new Uint32Array(this.LED_NB);

        for (let i = 0; i < array.length; i = i + 3) {
            const j = i / 3;
            newArray[j] = ((array[i+3] << 24) | (array[i] << 16) | (array[i+1] << 8) | (array[i+2]))
        }

        return newArray;
    }

    translateGRBW (array) {
        const newArray = new Uint32Array(this.LED_NB);

        for (let i = 0; i < array.length; i = i + 3) {
            const j = i / 3;
            const nLed = j % 4;

            // const nLed2 = (nLed + 1) % 4;
            // const r = array[i + nLed];
            // const g = array[i + nLed + 1];
            // const b = array[i + nLed + 2];
            // const w = array[i + nLed + 3];

            switch (nLed) {
                case 0:
                    newArray[j] = ((array[i+3] << 24) | (array[i+1] << 16) | (array[i] << 8) | (array[i+2]));
                    break;
                case 1:
                    newArray[j] = ((array[i+3] << 24) | (array[i] << 16) | (array[i+2] << 8) | (array[i+1]));
                    break;
                case 2:
                    newArray[j] = ((array[i+3] << 24) | (array[i] << 16) | (array[i+2] << 8) | (array[i+1]));
                    break;
                case 3:
                    newArray[j] = ((array[i+2] << 24) | (array[i] << 16) | (array[i+1] << 8) | (array[i+3]));
                    break;
            }
        }

        return newArray;
    }
};

module.exports = LedManager;
