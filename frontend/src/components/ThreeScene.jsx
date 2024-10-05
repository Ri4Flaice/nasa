import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Set the renderer size to the window's inner size
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create the sun
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32); // Radius of 2
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Yellow color
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create a ring around the sun
    const ringGeometry = new THREE.TorusGeometry(3, 0.2, 16, 100); // Inner radius 3, tube radius 0.2
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      wireframe: false,
    }); // Gold color for the ring
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    scene.add(ring);

    // Load texture for space objects
    const loader = new THREE.TextureLoader();
    const spaceObjectCount = 10; // Number of space objects
    const spaceObjects = [];

    // Create space objects and position them on the ring
    const createSpaceObject = (index) => {
      return new Promise((resolve) => {
        loader.load(
          "https://images.unsplash.com/photo-1600095355173-b970ea5ceb46?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with the URL to your image
          (texture) => {
            const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Radius of 0.5
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const spaceObject = new THREE.Mesh(geometry, material);

            // Position space objects evenly spaced along the ring
            const angle = (Math.PI * 2 * index) / spaceObjectCount; // Evenly spaced angle
            const x = 3 * Math.cos(angle); // Distance from sun (inner radius of the ring)
            const z = 3 * Math.sin(angle);
            spaceObject.position.set(x, Math.random() * 2 - 1, z); // Random Y position

            scene.add(spaceObject);
            spaceObjects.push(spaceObject);
            resolve();
          },
          undefined,
          (err) => {
            console.error(
              "An error happened while loading the space object image.",
              err
            );
          }
        );
      });
    };

    // Create all space objects
    Promise.all(
      Array.from({ length: spaceObjectCount }, (_, index) =>
        createSpaceObject(index)
      )
    ).then(() => {
      camera.position.z = 10;

      // Add OrbitControls for camera interaction
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      const animate = () => {
        requestAnimationFrame(animate);
        // Rotate the sun
        sun.rotation.y += 0.01;

        // Rotate the ring
        ring.rotation.z += 0.005; // Rotate the ring slowly

        // Update space object positions to keep them fixed on the ring
        spaceObjects.forEach((spaceObject, index) => {
          const angle = (Math.PI * 2 * index) / spaceObjectCount; // Calculate angle based on index
          const x = 3 * Math.cos(angle);
          const z = 3 * Math.sin(angle);
          spaceObject.position.set(x, spaceObject.position.y, z); // Update position
        });

        controls.update(); // Required if damping is enabled
        renderer.render(scene, camera);
      };

      animate();
    });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-pointer" // Tailwind classes to take full width and height
    />
  );
};

export default ThreeScene;
