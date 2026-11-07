import * as T from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

const scene = new T.Scene();
scene.background = new T.Color(0xE4C7B7);

const width = window.innerWidth;
const height = window.innerHeight;
const camera = new T.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new T.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const container = document.getElementById("three-imp");
container.style.position = "relative";
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
container.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 10);
controls.autoRotate = false;

function loadAndParse() {
    // load data
    d3.csv("penglings.csv", row => ({
        species: row.species,
        flipper_length_mm: Number(row.flipper_length_mm),
        body_mass_g: Number(row.body_mass_g),
        bill_length_mm: Number(row.bill_length_mm)
    })).then(rows => {
        const data = rows.filter(d =>
            Number.isFinite(d.flipper_length_mm) &&
            Number.isFinite(d.body_mass_g) &&
            Number.isFinite(d.bill_length_mm)
        );

        const range = key => [
            Math.min(...data.map(d => d[key])),
            Math.max(...data.map(d => d[key]))
        ];

        const flipperRange = range("flipper_length_mm");
        const massRange = range("body_mass_g");
        const billRange = range("bill_length_mm");
        const scale = (value, [min, max]) => ((value - min) / (max - min) - 0.5) * 4;
        axes(flipperRange, massRange, billRange);

        const color = d3.scaleOrdinal()
            .domain(["Adelie", "Chinstrap", "Gentoo"])
            .range(["#e3861b", "#7a1be6", "#39959b"]);

        for (const row of data) {
            const mesh = new T.Mesh(
                new T.SphereGeometry(0.08),
                new T.MeshBasicMaterial({ color: color(row.species) })
            );

            mesh.position.set(
                scale(row.flipper_length_mm, flipperRange),
                scale(row.body_mass_g, massRange),
                scale(row.bill_length_mm, billRange)
            );
            scene.add(mesh);
        }
    })
        .catch(error => console.error("Could not load the csv ", error));

};

function axes(flipperRange, massRange, billRange) {
    // creates the axes
    const axesHelper = new T.AxesHelper(10);
    axesHelper.position.set(-5, -3, 0);
    scene.add(axesHelper);

    axesHelper.setColors(0x144187, 0x0f8f19, 0x8f0f0f);

    // now have to add labels and ticks manually
    const addLabel = (text, position) => {
        const element = document.createElement("div");
        element.textContent = text;
        element.style.color = "#111";
        element.style.fontFamily = "sans-serif";
        element.style.whiteSpace = "nowrap";

        const label = new CSS2DObject(element);
        label.position.copy(position);
        axesHelper.add(label);
    };

    addLabel("Flipper Length (mm)", new T.Vector3(10, 0, 0));
    addLabel("Body Mass (g)", new T.Vector3(0, 10, 0));
    addLabel("Bill Length (mm)", new T.Vector3(0, 0, 10));

    // Add ticks for X axis
    const points = [];
    const flipperLengthAtX = d3.scaleLinear().domain([-2, 2]).range(flipperRange);
    for (const x of [-2, 0, 2]) {
        points.push(
            new T.Vector3(x, -2.75, 0),
            new T.Vector3(x, -3.25, 0)
        );
        addLabel(flipperLengthAtX(x).toFixed(1), new T.Vector3(x + 5, 0.5, 0));
    }
    // Add ticks for Y axis
    const massRangeAtY = d3.scaleLinear().domain([-2, 2]).range(massRange);
    for (const y of [-2, 0, 2]) {
        points.push(
            new T.Vector3(-5.25, y, 0),
            new T.Vector3(-4.75, y, 0)
        );
        addLabel(massRangeAtY(y).toFixed(1), new T.Vector3(-0.5, y + 3, 0));
    }
    // Add Z-axis ticks and labels using their corresponding bill lengths.
    const billLengthAtZ = d3.scaleLinear().domain([-2, 2]).range(billRange);
    for (const z of [-2, 0, 2]) {
        points.push(
            new T.Vector3(-5.25, -3, z),
            new T.Vector3(-4.75, -3, z)
        );
        addLabel(billLengthAtZ(z).toFixed(1), new T.Vector3(-0.5, 0, z));
    }

    const geometry = new T.BufferGeometry().setFromPoints(points);
    scene.add(new T.LineSegments(geometry, new T.LineBasicMaterial({ color: 0x000000 })));
};

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
};

loadAndParse();
animate();