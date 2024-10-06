import * as THREE from "three";
import { useEffect } from "react";
import SceneInit from "./lib/SceneInit";
import Planet from "./lib/Planet";
import Rotation from "./lib/Rotation";

export default function Home() {
  let gui;

  const initGui = async () => {
    const dat = await import("dat.gui");
    gui = new dat.GUI();
  };

  useEffect(() => {
    // Инициализация сцены
    let test = new SceneInit();
    test.initScene();
    test.animate();

    // Создание Солнца
    const sunGeometry = new THREE.SphereGeometry(8);
    const sunTexture = new THREE.TextureLoader().load("2k_sun.jpg");
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    const solarSystem = new THREE.Group();
    solarSystem.add(sunMesh);
    test.scene.add(solarSystem);

    // Создание планет
    const planets = [
      { radius: 2, distance: 16, texture: "1.jpg", name: "Меркурий" },
      { radius: 3, distance: 32, texture: "2.jpg", name: "Венера" },
      { radius: 4, distance: 48, texture: "3.jpg", name: "Земля" },
      { radius: 3, distance: 64, texture: "4.jpg", name: "Марс" },
      { radius: 4, distance: 74, texture: "5.jpg", name: "Юпитер" },
      { radius: 3.5, distance: 84, texture: "6.jpg", name: "Сатурн" },
      { radius: 3, distance: 94, texture: "7.jpg", name: "Уран" },
      { radius: 3, distance: 104, texture: "8.jpg", name: "Нептун" },
    ];

    const planetSystems = {};

    planets.forEach((planetData) => {
      const planet = new Planet(planetData.radius, planetData.distance, planetData.texture);
      const planetMesh = planet.getMesh();
      const planetGroup = new THREE.Group();
      planetGroup.add(planetMesh);
      solarSystem.add(planetGroup);
      planetSystems[planetData.name] = {
        group: planetGroup,
        mesh: planetMesh,
      };
    });

    // Создание вращений для планет
    const rotations = {};

    planets.forEach((planetData) => {
      const rotation = new Rotation(planetSystems[planetData.name].mesh);
      const rotationMesh = rotation.getMesh();
      planetSystems[planetData.name].group.add(rotationMesh);
      rotations[planetData.name] = rotationMesh;
    });

    // Создание орбит для планет
    const orbits = {};

    const createOrbit = (distance) => {
      const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2; // Повернуть орбиту горизонтально
      return orbit;
    };

    planets.forEach((planetData) => {
      const orbit = createOrbit(planetData.distance);
      solarSystem.add(orbit);
      orbits[planetData.name] = orbit;
    });

    // Инициализация GUI
    initGui().then(() => {
      const solarSystemGui = gui.addFolder("Солнечная система");

      planets.forEach((planetData) => {
        // Контроль видимости вращения (линии)
        solarSystemGui
          .add(rotations[planetData.name], "visible")
          .name(`${planetData.name} Траектория`)
          .listen();

        // Контроль видимости орбиты (кольца)
        solarSystemGui
          .add(orbits[planetData.name], "visible")
          .name(`${planetData.name} Орбита`)
          .listen();
      });
    });

    // Анимация сцены
    const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);
    const animate = () => {
      sunMesh.rotation.y += 0.001;

      // Вращение планет вокруг Солнца
      planetSystems["Меркурий"].group.rotation.y += EARTH_YEAR * 4;
      planetSystems["Венера"].group.rotation.y += EARTH_YEAR * 2;
      planetSystems["Земля"].group.rotation.y += EARTH_YEAR;
      planetSystems["Марс"].group.rotation.y += EARTH_YEAR * 0.5;
      planetSystems["Юпитер"].group.rotation.y += EARTH_YEAR * 1;
      planetSystems["Сатурн"].group.rotation.y += EARTH_YEAR * 2.5;
      planetSystems["Уран"].group.rotation.y += EARTH_YEAR * 2;
      planetSystems["Нептун"].group.rotation.y += EARTH_YEAR * 1;

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas id="myThreeJsCanvas" />
    </div>
  );
}
