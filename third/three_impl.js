import * as T from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new T.Scene();
scene.background = new T.Color(0xE4C7B7);

const width = window.innerWidth;
const height = window.innerHeight;
const camera = new T.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new T.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 20);
controls.autoRotate = true;

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

        const color = d3.scaleOrdinal()
            .domain(["Adelie", "Chinstrap", "Gentoo"])
            .range(["#e3861b", "#7a1be6", "#39959b"]);

        // const axesHelper = new T.AxesHelper(10);
        // axesHelper.position.set(-5, 0, 0);
        // scene.add(axesHelper);

        // axesHelper.setColors(0x000000, 0x000000, 0x000000);
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

function axes() {

}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

loadAndParse();
animate();