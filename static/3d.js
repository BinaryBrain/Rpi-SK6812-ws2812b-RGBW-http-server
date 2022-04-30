const ws = new WebSocket("ws://" + location.host + "/");
let NB_LED = 100;
let colors = [];

const cicleHeight = 5.5;
const cicleRadius = 5;

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
    for (let i = 0; i < newColors.length; i += 4) {
        colors[i / 4] = {
            w: newColors[i],
            r: newColors[i + 1],
            g: newColors[i + 2],
            b: newColors[i + 3],
        }

        if (lights[i / 4]) {
            lights[i / 4].color = colors[i / 4];
            lightsMats[i / 4].emissive = colors[i / 4];
        }
    }
}

function configure(config) {
    NB_LED = config.leds;

    const axis = new THREE.Vector3(0, 0, 1).normalize();
    const circleCenter = new THREE.Vector3(0, cicleRadius, 0);

    const ledHeight = 0.2;
    const ledWidth = 2 * Math.PI * (cicleRadius + 0.2 / 2) / NB_LED;

    for (let i = 0; i < NB_LED; i++) {
        const angle = i * 2 * Math.PI / NB_LED;

        lights[i] = new THREE.PointLight(0x000000, 0.002);

        lightsMats[i] = new THREE.MeshStandardMaterial({
            emissive: 0x000000,
            emissiveIntensity: 0.002,
            color: 0x000000
        });

        const lightGeometry = new THREE.PlaneGeometry(ledWidth, ledHeight);
        lights[i].add(new THREE.Mesh(lightGeometry, lightsMats[i]));

        lights[i].position.sub(circleCenter);
        lights[i].position.applyAxisAngle(axis, angle);
        lights[i].position.add(circleCenter);
        lights[i].rotateOnAxis(axis, angle);

        scene.add(lights[i]);

        lights[i].position.add(new THREE.Vector3(0, cicleHeight - cicleRadius, 0));
    }
}

const lights = [];
const lightsMats = [];
let renderer, scene, camera;

init();

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.physicallyCorrectLights = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById("webgl").appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 5, 20);
    camera.rotateY(Math.PI);

    scene = new THREE.Scene();

    THREE.RectAreaLightUniformsLib.init();

    const geoFloor = new THREE.BoxGeometry(2000, 0.1, 2000);
    const matStdFloor = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.1, metalness: 0 });
    const mshStdFloor = new THREE.Mesh(geoFloor, matStdFloor);
    scene.add(mshStdFloor);

    const geoKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 16);
    const matKnot = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0 });
    const meshKnot = new THREE.Mesh(geoKnot, matKnot);
    meshKnot.name = 'meshKnot';
    meshKnot.position.set(0, cicleHeight, 0);
    scene.add(meshKnot);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.copy(meshKnot.position);
    controls.update();

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = (window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
}

function animation(time) {
    const mesh = scene.getObjectByName('meshKnot');
    mesh.rotation.y = time / 1000;
    renderer.render(scene, camera);
}
