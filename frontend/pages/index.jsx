import * as THREE from "three";
import { useEffect } from "react";
import SceneInit from "./lib/SceneInit";
import Planet from "./lib/Planet";
import Rotation from "./lib/Rotation";

import responseJson from '../../backend/src/nasa.WebApi/nasa_asteroid_solar_system.json';

export default function Home() {
  let gui;
  const fixedY = 0; // Устанавливаем Y-координату в 0 для горизонтального расположения

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

    // Функция для проверки пересечения с планетами и Солнцем
    const isSafePosition = (position) => {
      const sunDistance = position.length() - sunGeometry.parameters.radius; // Расстояние до Солнца
      if (sunDistance < 0) return false; // Если астероид касается Солнца

      return planets.every((planetData) => {
        const planetPosition = new THREE.Vector3(
          0, // Предполагаем, что планеты находятся на оси Y
          0,
          planetData.distance
        );
        const planetDistance = position.distanceTo(planetPosition) - planetData.radius;
        return planetDistance > 0; // Проверка, не касается ли астероид планеты
      });
    };

    // Добавление астероидов
    const asteroids = responseJson.slice(0, 150).map((asteroid) => {
      const coords = asteroid.OrbitCoordinates;

      // Генерируем начальную позицию, выбирая случайные координаты
      let position;

      // Генерируем позицию до тех пор, пока она не окажется в безопасной зоне
      do {
        const randomIndex = Math.floor(Math.random() * coords.length);
        position = new THREE.Vector3(
          coords[randomIndex].X / 1e7 + (Math.random() - 0.5) * 5,
          fixedY,
          coords[randomIndex].Z / 1e7 + (Math.random() - 0.5) * 5
        );
      } while (!isSafePosition(position)); // Проверяем, является ли позиция безопасной

      const asteroidGeometry = new THREE.SphereGeometry(0.5); // Радиус астероида
      const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 }); // Цвет астероида
      const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

      // Устанавливаем начальную позицию
      asteroidMesh.position.copy(position);

      return {
        mesh: asteroidMesh,
        distance: position.length(), // Радиус орбиты
        angle: Math.random() * Math.PI * 2, // Случайный угол
        speed: 1 / (position.length() / 0.1), // Скорость вращения пропорциональна расстоянию
      };
    });

    asteroids.forEach((asteroid) => {
      solarSystem.add(asteroid.mesh);
    });

    // Инициализация GUI
    initGui().then(() => {
      const solarSystemGui = gui.addFolder("Солнечная система");

      planets.forEach((planetData) => {
        solarSystemGui
          .add(rotations[planetData.name], "visible")
          .name(`${planetData.name} Траектория`)
          .listen();

        solarSystemGui
          .add(orbits[planetData.name], "visible")
          .name(`${planetData.name} Орбита`)
          .listen();
      });
    });

    // Анимация сцены
    const EARTH_YEAR = 2 * Math.PI * (1 / 60) * (1 / 60);

    const animate = () => {
      sunMesh.rotation.y += 0.005;

      // Обновление позиций астероидов
      asteroids.forEach((asteroid) => {
        asteroid.angle += asteroid.speed; // Увеличиваем угол для вращения
        asteroid.mesh.position.x = asteroid.distance * Math.cos(asteroid.angle); // Вычисляем новую позицию X
        asteroid.mesh.position.z = asteroid.distance * Math.sin(asteroid.angle); // Вычисляем новую позицию Z
      });

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
