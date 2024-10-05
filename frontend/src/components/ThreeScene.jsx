import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Импорт текстур для планет
import sunTexture from "../images/2k_sun.jpg";
import mercuryTexture from "../images/1.jpg";
import venusTexture from "../images/2.jpg";
import venusAtmopshere from "../images/2k_venus_atmosphere.jpg"; // Текстура атмосферы Венеры
import earthTexture from "../images/3.jpg";
import marsTexture from "../images/4.jpg";
import jupiterTexture from "../images/5.jpg";
import saturnTexture from "../images/6.jpg";
import uranusTexture from "../images/7.jpg";
import neptuneTexture from "../images/8.jpg";
import saturnRingsTexture from "../images/saturn_ring_alpha.png"; // Текстура колец для Сатурна

const ThreeScene = () => {
  const mountRef = useRef(null);
  const planets = [];
  const asteroidBelt = [];
  const asteroidOrbits = [];

  useEffect(() => {
    // Инициализация сцены, камеры и рендера
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Чёрный фон

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Загрузка текстур
    const loader = new THREE.TextureLoader();
    const sunMap = loader.load(sunTexture);

    // Солнце
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunMap });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Данные планет
    const planetData = [
      { distance: 5, size: 0.5, speed: 1.02, texture: mercuryTexture },
      {
        distance: 7,
        size: 0.6,
        speed: 1.018,
        texture: venusTexture,
        atmosphere: true, // Добавляем атмосферу
        rings: true, // Добавляем кольца для Венеры
      },
      { distance: 9, size: 0.7, speed: 1.015, texture: earthTexture },
      { distance: 11, size: 0.5, speed: 1.013, texture: marsTexture },
      { distance: 14, size: 1.2, speed: 1.008, texture: jupiterTexture },
      {
        distance: 17,
        size: 1.0,
        speed: 1.006,
        texture: saturnTexture,
        rings: true,
      },
      { distance: 20, size: 0.9, speed: 1.004, texture: uranusTexture },
      { distance: 23, size: 0.85, speed: 1.002, texture: neptuneTexture },
    ];

    // Функция для создания планеты
    const createPlanet = (distance, size, textureUrl, rings, atmosphere) => {
      const texture = loader.load(textureUrl);
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const planet = new THREE.Mesh(geometry, material);

      planet.position.x = distance;
      planets.push({
        planet,
        distance,
        speed: planetData.find((p) => p.distance === distance).speed,
      });
      scene.add(planet);

      // Добавление атмосферы, если она есть у планеты (например, у Венеры)
      if (atmosphere) {
        const atmosphereTexture = loader.load(venusAtmopshere);
        const atmosphereGeometry = new THREE.SphereGeometry(size * 1.1, 32, 32); // Сфера для атмосферы
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          map: atmosphereTexture,
          side: THREE.DoubleSide, // Отображение с обеих сторон
          transparent: true,
          opacity: 1, // Непрозрачность атмосферы
        });
        const atmosphereMesh = new THREE.Mesh(
          atmosphereGeometry,
          atmosphereMaterial
        );
        planet.add(atmosphereMesh); // Добавляем атмосферу как дочерний элемент
      }

      // Добавление колец, если это планета с кольцами
      if (rings) {
        const ringGeometry = new THREE.RingGeometry(size * 1.2, size * 1.8, 32);
        const ringTexture = loader.load(saturnRingsTexture);
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8, // Прозрачность колец
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2; // Поворачиваем кольца
        planet.add(rings);
      }
    };

    // Создание планет
    planetData.forEach(({ distance, size, texture, rings, atmosphere }) => {
      createPlanet(distance, size, texture, rings, atmosphere);
    });

    // Создание пояса астероидов
    const asteroidGeometry = new THREE.DodecahedronGeometry(0.3, 0);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

    for (let i = 0; i < 100; i++) {
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      const distance = Math.random() * 30 + 10; // Радиус орбиты
      const speed = Math.random() * 0.02 + 0.005; // Скорость движения

      asteroid.position.set(
        distance * Math.cos(Math.random() * Math.PI * 2),
        (Math.random() - 0.5) * 2, // Высота над плоскостью
        distance * Math.sin(Math.random() * Math.PI * 2)
      );

      asteroidBelt.push(asteroid);
      asteroidOrbits.push({ distance, speed });
      scene.add(asteroid);
    }

    // Анимация сцены
    const animate = () => {
      requestAnimationFrame(animate);
      sun.rotation.y += 0.01;

      const time = Date.now() * 0.001;

      // Анимация планет
      planets.forEach(({ planet, distance, speed }) => {
        planet.position.x = distance * Math.cos(time * speed);
        planet.position.z = distance * Math.sin(time * speed);
      });

      // Анимация астероидов
      asteroidBelt.forEach((asteroid, index) => {
        const { distance, speed } = asteroidOrbits[index];
        asteroid.position.x = distance * Math.cos(time * speed);
        asteroid.position.z = distance * Math.sin(time * speed);
        asteroid.rotation.x += 0.01;
        asteroid.rotation.y += 0.01;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Управление изменением размера экрана
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Очистка ресурса
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-pointer" />;
};

export default ThreeScene;
