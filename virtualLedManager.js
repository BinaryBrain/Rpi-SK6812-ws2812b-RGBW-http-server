const VirutalLeds = require('./virtualLeds.js');

class VirtualLedManager {
    constructor(NB_LED) {
        this.type = 'rgb';
        this.NB_LED = NB_LED;
        this.config = {};
        this.config.leds = NB_LED;
        this.config.brightness = 255;
        this.config.strip = 'rgb';
        VirutalLeds.configure(this.config);
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

        // Render to strip
        VirutalLeds.render(colorArray);
    }

    // FORMAT: [{r: 255, g: 255, b: 255, w?: 255}]
    setColorsObj (colors) {
        const colorArray = [];

        for (let color of colors) {
            if (!color.w) {
                color.w = 0;
            }

            colorArray.push(color.r);
            colorArray.push(color.g);
            colorArray.push(color.b);
            colorArray.push(color.w);
        }

        // Render to strip
        VirutalLeds.render(colorArray);
    }

    renderBytes (bytes) {
        VirutalLeds.render(bytes);
    }

    renderArray (array) {
        VirutalLeds.render(array);
    }
};

module.exports = VirtualLedManager;
