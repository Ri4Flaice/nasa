import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Импорт текстур для планет и колец
import sunTexture from "../images/2k_sun.jpg";
import mercuryTexture from "../images/1.jpg";
import venusTexture from "../images/2.jpg";
import venusAtmosphereTexture from "../images/2k_venus_atmosphere.jpg"; // Текстура атмосферы Венеры
import earthTexture from "../images/3.jpg";
import marsTexture from "../images/4.jpg";
import jupiterTexture from "../images/5.jpg";
import saturnTexture from "../images/6.jpg";
import saturnRingsTexture from "../images/saturn_ring_alpha.png"; // Текстура колец для Сатурна
import uranusTexture from "../images/7.jpg";
import neptuneTexture from "../images/8.jpg";

import responseJson from '../../../backend/src/nasa.WebApi/nasa_asteroid_solar_system.json';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const planets = [];
  const asteroids = [];
  const raycaster = new THREE.Raycaster(); // Создаем raycaster для отслеживания кликов
  const mouse = new THREE.Vector2(); // Вектор для позиции мыши

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
    camera.position.z = 50;

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
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
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
      },
      { distance: 9, size: 0.7, speed: 1.015, texture: earthTexture },
      { distance: 11, size: 0.5, speed: 1.013, texture: marsTexture },
      { distance: 14, size: 1.2, speed: 1.008, texture: jupiterTexture },
      {
        distance: 17,
        size: 1.0,
        speed: 1.006,
        texture: saturnTexture,
        rings: true, // Добавляем кольца для Сатурна
      },
      { distance: 20, size: 0.9, speed: 1.004, texture: uranusTexture },
      { distance: 23, size: 0.85, speed: 1.002, texture: neptuneTexture },
    ];

    // Функция для создания планеты с кольцами и атмосферой
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

      // Добавление атмосферы, если она есть
      if (atmosphere) {
        const atmosphereTexture = loader.load(venusAtmosphereTexture);
        const atmosphereGeometry = new THREE.SphereGeometry(size * 1.1, 32, 32); // Сфера для атмосферы
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          map: atmosphereTexture,
          side: THREE.DoubleSide, // Отображение с обеих сторон
          transparent: true,
          opacity: 0.5, // Полупрозрачность атмосферы
        });
        const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphereMesh); // Добавляем атмосферу как дочерний элемент
      }

      // Добавление колец, если это планета с кольцами (например, Сатурн)
      if (rings) {
        const ringGeometry = new THREE.RingGeometry(size * 1.2, size * 1.8, 32);
        const ringTexture = loader.load(saturnRingsTexture);
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8, // Прозрачность колец
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI / 2; // Поворачиваем кольца
        planet.add(ringMesh);
      }
    };

    // Создание планет
    planetData.forEach(({ distance, size, texture, rings, atmosphere }) => {
      createPlanet(distance, size, texture, rings, atmosphere);
    });

    // Создание астероидов
    const asteroidGeometry = new THREE.DodecahedronGeometry(0.3, 0);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

    // Проверка длины массива астероидов
    console.log("Количество астероидов в JSON:", responseJson.length);

    responseJson.slice(0, 150).forEach((asteroidData) => {
      const { OrbitCoordinates } = asteroidData;

      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

      const initialPosition = OrbitCoordinates[0];
      asteroid.position.set(
        initialPosition.X / 100000000,
        initialPosition.Y / 100000000,
        initialPosition.Z / 100000000
      );

      asteroids.push({ asteroid, OrbitCoordinates, currentStep: 0 });
      scene.add(asteroid);

      // Событие клика на астероид, вывод данных в консоль
      asteroid.userData = asteroidData;
    });

    // Вывод информации об астероидах
    asteroids.forEach((asteroidData, index) => {
      console.log(`${index + 1}. Астероид:`, asteroidData.asteroid.userData);
    });

    // Обработчик события клика мыши
    const handleClick = (event) => {
      // Преобразование координат мыши в нормализованные координаты устройства
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Установка raycaster
      raycaster.setFromCamera(mouse, camera);

      // Выявление пересечений с астероидами
      const intersects = raycaster.intersectObjects(asteroids.map(a => a.asteroid));

      if (intersects.length > 0) {
        const asteroid = intersects[0].object;
        console.log("Астероид:", asteroid.userData); // Вывод данных в консоль
      }
    };

    window.addEventListener('click', handleClick); // Добавляем слушатель события клика

    // Анимация сцены
    const animate = () => {
      requestAnimationFrame(animate);
      
      sun.rotation.y += 0.01;

      // Включение движения планет (раскомментируйте при необходимости)
      planets.forEach(({ planet, distance, speed }) => {
        const time = Date.now() * 0.001;
        planet.position.x = distance * Math.cos(time * speed);
        planet.position.z = distance * Math.sin(time * speed);
      });

      // Включение движения астероидов (раскомментируйте при необходимости)
      asteroids.forEach((asteroidData) => {
        const { asteroid, OrbitCoordinates, currentStep } = asteroidData;
        const nextStep = (currentStep + 1) % OrbitCoordinates.length;
        const nextPosition = OrbitCoordinates[nextStep];

        asteroid.position.set(
          nextPosition.X / 100000000,
          nextPosition.Y / 100000000,
          nextPosition.Z / 100000000
        );

        asteroidData.currentStep = nextStep;
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('click', handleClick);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeScene;
