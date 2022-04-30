const ws = new WebSocket("ws://" + location.host + "/");
let NB_LED;
let colors = [];
let leds = [];
const container = document.querySelector('#circle');
let CIRCLE_RADIUS = 0;
let config;

ws.onmessage = (evt) => {
    const msg = evt.data
    const json = JSON.parse(msg);

    if (!json.cmd) {
        console.error("Invalid message recieved");
        return;
    }

    switch (json.cmd) {
        case 'configure': {
            config = json.data;
            resize();
            break;
        }

        case 'render': {
            const newColors = json.data;
            render(newColors)
            break;
        }
    }
}

ws.addEventListener('open', (event) => {
    ws.send(JSON.stringify({ cmd: "hi" }));
});

function render(newColors) {
    gotData();
    for (let i = 0; i < newColors.length; i += 4) {
         colors[i / 4] = {
            w: newColors[i],
            r: newColors[i + 1],
            g: newColors[i + 2],
            b: newColors[i + 3],
        }
    }
}

function gotData() {
    const div = document.getElementById("noData");
    if (div) {
        div.remove();
    }
}

function configure(newConfig) {
    config = newConfig;
    NB_LED = config.leds;
    leds.forEach(led => container.removeChild(led));
    leds = [];
    color = [];
    const ledWidth = (2 * Math.PI * (CIRCLE_RADIUS + 0.2 / 2) / NB_LED) * 0.5;
    const ledHeight = ledWidth;
    const marginPercent = 0.85;
    const margin = CIRCLE_RADIUS * (1 - marginPercent);

    for (let i = 0; i < NB_LED; i++) {
        const led = document.createElement("div");
        led.classList.add("led");
        const led_percent = i / NB_LED;
        const led_rad = 2 * led_percent * Math.PI;
        led.style.left = `${(CIRCLE_RADIUS + Math.cos(led_rad) * CIRCLE_RADIUS - ledWidth / 2) * marginPercent + margin}px`;
        led.style.top = `${(CIRCLE_RADIUS + Math.sin(led_rad) * CIRCLE_RADIUS - ledHeight / 2) * marginPercent + margin}px`;
        led.style.transform = `rotate(${led_percent + 0.25}turn)`;
        led.style.height = `${ledHeight}px`;
        led.style.width = `${ledWidth}px`;

        leds[i] = led;
        container.appendChild(led);
    }
}

init();

function init() {
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < NB_LED; i++) {
        const led = leds[i];
        const color = colors[i];

        if (!color) {
            return;
        }

        if (!led) {
            return;
        }

        led.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        const blur = Math.round(parseFloat(led.style.height));
        const spread = Math.round(parseFloat(led.style.height) / 2);
        led.style.boxShadow = `0 0 ${blur}px ${spread}px rgb(${color.r}, ${color.g}, ${color.b})`;
    }
}

function resize() {
    let w;
    let h;
    const ratio = 1;
    if (window.innerWidth / window.innerHeight >= ratio) {
        w = window.innerHeight * ratio;
        h = window.innerHeight;
    } else {
        w = window.innerWidth;
        h = window.innerWidth / ratio;
    }

    container.style.width = w + 'px';
    container.style.height = h + 'px';

    CIRCLE_RADIUS = w / 2
    configure(config);
}

window.onresize = resize;

document.getElementById('title').classList.add('disappearing');
