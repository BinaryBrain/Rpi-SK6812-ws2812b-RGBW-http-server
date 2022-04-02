const ws281x = require('rpi-ws281x-native-fixed');

class LedManager {
    constructor(NB_LED, gpio, stripType, isInverted) {
        this.NB_LED = NB_LED;

        const config = {
            stripType,
            gpio,
            invert: isInverted
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

        this.renderArray(colorArray);
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

        this.renderArray(colorArray);
    }

    renderArray (array) {
        this.setChannelColors(array);
        ws281x.render();
    }

    setChannelColors (array) {
        const newArray = this.channel.array;

        for (let i = 0; i < array.length; i = i + 4) {
            const j = i/4;
            newArray[j] = ((array[i] << 24) | (array[i+1] << 16) | (array[i+2] << 8) | (array[i+3]));
        }
    }
};

module.exports = LedManager;
