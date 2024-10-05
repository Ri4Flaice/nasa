import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Импортируйте изображения
import mercuryTexture from '../images/1.jpg';
import venusTexture from '../images/2.png';
import earthTexture from '../images/3.jpg';
import marsTexture from '../images/4.jpg';
import jupiterTexture from '../images/5.webp';
import saturnTexture from '../images/6.jpg';
import uranusTexture from '../images/7.jpg';

const ThreeScene = () => {
  const mountRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const planets = [];

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const sunTexture = loader.load("https://ak6.picdn.net/shutterstock/videos/366016/thumb/1.jpg");
    const backgroundTexture = loader.load('https://avatars.mds.yandex.net/i?id=476493bb16637b71e91cff846742698c_l-8311401-images-thumbs&n=13');

    scene.background = backgroundTexture;

    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const planetData = [
      { distance: 5, size: 0.5, speed: 1.02, texture: mercuryTexture },
      { distance: 7, size: 0.6, speed: 1.018, texture: venusTexture },
      { distance: 9, size: 0.7, speed: 1.015, texture: earthTexture },
      { distance: 11, size: 0.5, speed: 1.013, texture: marsTexture },
      { distance: 14, size: 1.2, speed: 1.008, texture: jupiterTexture },
      { distance: 17, size: 1.0, speed: 1.006, texture: saturnTexture },
      { distance: 20, size: 0.9, speed: 1.004, texture: uranusTexture }
    ];

    const createPlanet = (distance, size, textureUrl) => {
      return new Promise((resolve) => {
        const texture = new THREE.TextureLoader().load(textureUrl);
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const planet = new THREE.Mesh(geometry, material);

        planet.position.x = distance;
        planets.push({ planet, distance, speed: planetData.find(p => p.distance === distance).speed });
        scene.add(planet);
        resolve(planet);
      });
    };

    Promise.all(planetData.map(planet => createPlanet(planet.distance, planet.size, planet.texture)))
      .then(() => {
        camera.position.z = 25;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const animate = () => {
          requestAnimationFrame(animate);
          sun.rotation.y += 0.01;

          const time = Date.now() * 0.001;
          planets.forEach(({ planet, distance, speed }) => {
            planet.position.x = distance * Math.cos(time * speed);
            planet.position.z = distance * Math.sin(time * speed);
          });

          controls.update();
          renderer.render(scene, camera);
        };

        animate();
      });

    const onMouseClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        console.log('Кликнули по объекту:', intersectedObject);
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
