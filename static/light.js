const ws = new WebSocket("ws://" + location.host + "/");
let NB_LED = 100;
const colors = [];

const leds = [];

const CIRCLE_RADIUS = 200;

ws.onmessage = (evt) => {
    const msg = evt.data
    const json = JSON.parse(msg);

    if (!json.cmd) {
        console.error("Invalid message recieved");
        return;
    }

    switch (json.cmd) {
        case 'configure': {
            const config = json.data;
            configure(config);
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

function configure(config) {
    NB_LED = config.leds;

    console.log(config);
}

const lights = [];

let app;
let container;

init();

function init() {
    app = new PIXI.Application({ backgroundColor: 0x111111, width: 600, height: 600 });
    document.getElementById('webgl').style = "backgroundColor: #111111;";
    document.getElementById('webgl').appendChild(app.view);

    container = new PIXI.Container();
    app.stage.addChild(container);

    const texture = PIXI.Texture.from('/static/led.png');
    texture.defaultAnchor.x = 0.5;
    texture.defaultAnchor.y = 0.5;
    console.log(texture);

    for (let i = 0; i < NB_LED; i++) {
        const led = new PIXI.Sprite(texture);
        const led_percent = i / NB_LED;
        const led_rad = 2 * led_percent * Math.PI;
        led.x = 300 + Math.cos(led_rad) * CIRCLE_RADIUS;
        led.y = 300 + Math.sin(led_rad) * CIRCLE_RADIUS;
        led.rotation = led_rad;
        leds[i] = led;
        container.addChild(led);
    }

    const brt = new PIXI.BaseRenderTexture(0, 0, PIXI.SCALE_MODES.LINEAR, 1);
    const rt = new PIXI.RenderTexture(brt);

    const sprite = new PIXI.Sprite(rt);

    sprite.x = 0;
    sprite.y = 0;
    app.stage.addChild(sprite);

    /*
     * All the bunnies are added to the container with the addChild method
     * when you do this, all the bunnies become children of the container, and when a container moves,
     * so do all its children.
     * This gives you a lot of flexibility and makes it easier to position elements on the screen
     */
    container.x = 0;
    container.y = 0;

    app.ticker.add(() => {
        app.renderer.render(container, rt);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    for (let i = 0; i < NB_LED; i++) {
        const led = leds[i];
        const color = colors[i];
        let value = 0x000000;

        if (!color) {
            return;
        }

        value += color.b;
        value += color.g * 0x100;
        value += color.r * 0x10000;

        if (!led) {
            return;
        }

        led.blendMode = 1;
        led.tint = value;
    }

    app.renderer.render(container);
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
    app.renderer.view.style.width = w + 'px';
    app.renderer.view.style.height = h + 'px';
}
window.onresize = resize;
resize();

document.getElementById('title').classList.add('disappearing');
