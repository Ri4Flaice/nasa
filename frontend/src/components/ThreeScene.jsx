import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Установите размер рендерера на размеры окна
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Загрузка текстур
    const loader = new THREE.TextureLoader();
    const sunTexture = loader.load("https://ak6.picdn.net/shutterstock/videos/366016/thumb/1.jpg");
    const backgroundTexture = loader.load('https://avatars.mds.yandex.net/i?id=476493bb16637b71e91cff846742698c_l-8311401-images-thumbs&n=13');

    // Установка текстуры фона
    scene.background = backgroundTexture;

    // Создание солнца
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Создание кольца вокруг солнца
    const ringGeometry = new THREE.TorusGeometry(3, 0.2, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      wireframe: false,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);

    const spaceObjectCount = 10;
    const spaceObjects = [];

    const createSpaceObject = (index) => {
      return new Promise((resolve) => {
        loader.load(
          "https://images.unsplash.com/photo-1600095355173-b970ea5ceb46?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          (texture) => {
            const geometry = new THREE.SphereGeometry(0.5, 32, 32);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const spaceObject = new THREE.Mesh(geometry, material);

            const angle = (Math.PI * 2 * index) / spaceObjectCount;
            const x = 3 * Math.cos(angle);
            const z = 3 * Math.sin(angle);
            spaceObject.position.set(x, Math.random() * 2 - 1, z);

            scene.add(spaceObject);
            spaceObjects.push(spaceObject);
            resolve();
          },
          undefined,
          (err) => {
            console.error("Ошибка при загрузке изображения космического объекта.", err);
          }
        );
      });
    };

    // Создание всех космических объектов
    Promise.all(
      Array.from({ length: spaceObjectCount }, (_, index) =>
        createSpaceObject(index)
      )
    ).then(() => {
      camera.position.z = 10;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      const animate = () => {
        requestAnimationFrame(animate);
        sun.rotation.y += 0.01;
        ring.rotation.z += 0.005;

        spaceObjects.forEach((spaceObject, index) => {
          const angle = (Math.PI * 2 * index) / spaceObjectCount;
          const x = 3 * Math.cos(angle);
          const z = 3 * Math.sin(angle);
          spaceObject.position.set(x, spaceObject.position.y, z);
        });

        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    });

    // Обработка кликов по объектам
    const onMouseClick = (event) => {
      // Преобразование координат мыши в диапазон от -1 до 1
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Установка луча
      raycaster.setFromCamera(mouse, camera);

      // Проверка пересечения луча с космическими объектами
      const intersects = raycaster.intersectObjects(spaceObjects);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Кликнули по астероиду:', intersectedObject);
        // Здесь можно добавить другие действия, например, отображение информации о астероиде
      }
    };

    window.addEventListener("click", onMouseClick);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-pointer"
    />
  );
};

export default ThreeScene;
