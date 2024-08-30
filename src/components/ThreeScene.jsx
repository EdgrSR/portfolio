import "./ThreeScene.css";
import { useEffect, useRef, useState } from "react";
import SummonModal from "./SummonModal";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

export default function ThreeScene() {
  const [showSummonModal, setShowSummonModal] = useState(0);

  const loadingOverlay = useRef(null);
  const threeCanvas = useRef(null);

  useEffect(() => {
    if (threeCanvas.current && loadingOverlay.current) {
      THREE.ColorManagement.enabled = false;

      const loadingManager = new THREE.LoadingManager();

      loadingManager.onLoad = () => {
        loadingOverlay.current.classList.add("hidden");
      };

      const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas.current });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animation);

      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(-4.5, 4.5, -1.5);

      const scene = new THREE.Scene();
      const clock = new THREE.Clock();
      const modelLoader = new GLTFLoader(loadingManager);
      const fontLoader = new FontLoader(loadingManager);
      const messages = [];

      const composer = new EffectComposer(renderer);
      composer.setSize(window.innerWidth, window.innerHeight);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 1.0, 0.0));

      const fireLight = new THREE.PointLight(0xff2200, 20, 10);
      fireLight.position.set(-0.2, 1.0, -0.2);
      fireLight.castShadow = false;
      scene.add(fireLight);

      const ambientLight = new THREE.AmbientLight(0xff8e7d, 1.0);
      scene.add(ambientLight);

      modelLoader.load("/scene.glb", (gltf) => {
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.material.depthWrite = true;
            node.material.alphaTest = 0.4;
          }
        });
        scene.add(gltf.scene);
      }, undefined, (err) => {
        console.error(err);
      });

      const fireColor = 0xff2200;
      const fireRadiusX = 0.18;
      const fireRadiusZ = 0.18;
      const fireHeight = 1.2;
      const particleCount = 150;
      const particleSize = 0.4;
      const fireGeometry = createFireGeometry(fireRadiusX, fireRadiusZ, fireHeight, particleCount);
      const fireMaterial = createFireMaterial(fireColor, particleSize);
      fireMaterial.setPerspective(camera.fov, window.innerHeight);
      const fireMesh = new THREE.Points(fireGeometry, fireMaterial);
      fireMesh.position.set(0, 0.3, 0);
      scene.add(fireMesh);

      const summon = new THREE.Group();

      const summonFireColor = 0xfbff87;
      const summonFireRadiusX = 0.085;
      const summonFireRadiusZ = 0.68;
      const summonFireHeight = 0.0;
      const summonParticleCount = 250;
      const summonParticleSize = 0.2;
      const summonFireGeometry = createFireGeometry(summonFireRadiusX, summonFireRadiusZ, summonFireHeight, summonParticleCount);
      const summonFireMaterial = createFireMaterial(summonFireColor, summonParticleSize);
      summonFireMaterial.setPerspective(camera.fov, window.innerHeight);
      const summonFireMesh = new THREE.Points(summonFireGeometry, summonFireMaterial);
      summonFireMesh.position.set(0, 0.05, 0);
      summon.add(summonFireMesh);

      fontLoader.load("/font.json", (font) => {
        const summonTextGeometry = new TextGeometry("Edgar R.", { font: font, size: 0.18, depth: 0.005 });
        summonTextGeometry.computeBoundingBox();
        summonTextGeometry.translate(-((summonTextGeometry.boundingBox.max.x - summonTextGeometry.boundingBox.min.x) / 2), -((summonTextGeometry.boundingBox.max.y - summonTextGeometry.boundingBox.min.y) / 2), -((summonTextGeometry.boundingBox.max.z - summonTextGeometry.boundingBox.min.z) / 2));
        const summonTextMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1.0 });
        const summonTextMesh = new THREE.Mesh(summonTextGeometry, summonTextMaterial);
        summonTextMesh.position.set(0.0, 0.12, 0.0);
        summonTextMesh.rotation.set(-1.575, 0, -1.575);
        summon.add(summonTextMesh);
      }, undefined, (err) => {
        console.error(err);
      });

      const summonHitBoxGeometry = new THREE.BoxGeometry(0.3, 0.03, 1.4);
      const summonHitboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
      const summonHitBoxMesh = new THREE.Mesh(summonHitBoxGeometry, summonHitboxMaterial);
      summonHitBoxMesh.position.set(0, 0.15, 0);
      summonHitBoxMesh.name = "summon";
      summon.add(summonHitBoxMesh);

      summon.position.set(-1.0, 0.0, -1.0);
      summon.rotation.y = -0.15;
      scene.add(summon);

      const msgAboutMe = createMessage("ABOUT ME");
      msgAboutMe.position.set(-1.5, 0, 0.4);
      msgAboutMe.rotation.y = -0.15;
      messages.push(msgAboutMe);
      scene.add(msgAboutMe);

      const msgKnowledge = createMessage("KNOWLEDGE");
      msgKnowledge.position.set(-1.8, 0, -0.9);
      msgKnowledge.rotation.y = -0.15;
      messages.push(msgKnowledge);
      scene.add(msgKnowledge);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.03;
      controls.minPolarAngle = 0.3;
      controls.maxPolarAngle = 1.3;
      controls.minDistance = 3;
      controls.maxDistance = 9;

      window.addEventListener("click", onClick);
      window.addEventListener("touchstart", onClick);

      window.addEventListener("resize", onWindowResize);

      const stats = new Stats();
      //document.body.appendChild(stats.dom);

      function onClick(event) {
        if (event.target.tagName.toLowerCase() === "canvas") {
          const pointer = new THREE.Vector2();

          if (event.touches === undefined) {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
          } else {
            pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            pointer.y =
              -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
          }

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(pointer, camera);

          const intersects = raycaster.intersectObjects(scene.children).filter((intersect) => intersect.object.type === "Mesh");

          if (intersects.length > 0) {
            switch (intersects[0].object.name) {
              case "summon":
                setShowSummonModal(1);
                break;

              case "ABOUT ME":
                setShowSummonModal(2);
                break;

              case "KNOWLEDGE":
                setShowSummonModal(3);
                break;
            }
          }
        }
      }

      function createMessage(text) {
        const group = new THREE.Group();

        const msgFireColor = 0xff2200;
        const msgFireRadiusX = 0.04;
        const msgFireRadiusZ1 = 0.4;
        const msgFireRadiusZ2 = 0.75;
        const msgFireRadiusZ3 = 0.55;
        const msgFireHeight = 0.0;
        const msgParticleCount1 = 95;
        const msgParticleCount2 = 450;
        const msgParticleCount3 = 130;
        const msgParticleSize = 0.15;
        const msgFireGeometry1 = createFireGeometry(msgFireRadiusX, msgFireRadiusZ1, msgFireHeight, msgParticleCount1);
        const msgFireGeometry2 = createFireGeometry(msgFireRadiusX, msgFireRadiusZ2, msgFireHeight, msgParticleCount2);
        const msgFireGeometry3 = createFireGeometry(msgFireRadiusX, msgFireRadiusZ3, msgFireHeight, msgParticleCount3);
        const msgFireMaterial = createFireMaterial(msgFireColor, msgParticleSize);
        msgFireMaterial.setPerspective(camera.fov, window.innerHeight);
        const msgFireMesh1 = new THREE.Points(msgFireGeometry1, msgFireMaterial);
        const msgFireMesh2 = new THREE.Points(msgFireGeometry2, msgFireMaterial);
        const msgFireMesh3 = new THREE.Points(msgFireGeometry3, msgFireMaterial);
        msgFireMesh1.position.set(-0.22, 0.06, 0.0);
        msgFireMesh2.position.set(0, 0.06, 0.0);
        msgFireMesh3.position.set(0.22, 0.06, 0.0);
        msgFireMesh1.name = "fire";
        msgFireMesh2.name = "fire";
        msgFireMesh3.name = "fire";
        group.add(msgFireMesh1);
        group.add(msgFireMesh2);
        group.add(msgFireMesh3);

        fontLoader.load("/font.json", (font) => {
          const msgTextGeometry = new TextGeometry(text, { font: font, size: 0.1, depth: 0.005 });
          msgTextGeometry.computeBoundingBox();
          msgTextGeometry.translate(-((msgTextGeometry.boundingBox.max.x - msgTextGeometry.boundingBox.min.x) / 2), -((msgTextGeometry.boundingBox.max.y - msgTextGeometry.boundingBox.min.y) / 2), -((msgTextGeometry.boundingBox.max.z - msgTextGeometry.boundingBox.min.z) / 2));
          const msgTextMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1.0 });
          const msgTextMesh = new THREE.Mesh(msgTextGeometry, msgTextMaterial);
          msgTextMesh.position.set(0, 0.115, 0.0);
          msgTextMesh.rotation.set(-1.575, 0, -1.575);
          group.add(msgTextMesh);
        }, undefined, (err) => {
          console.error(err);
        });

        const msgHitBoxGeometry = new THREE.BoxGeometry(0.6, 0.03, 1.1);
        const msgHitboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
        const msgHitBoxMesh = new THREE.Mesh(msgHitBoxGeometry, msgHitboxMaterial);
        msgHitBoxMesh.position.set(0, 0.15, 0);
        msgHitBoxMesh.name = text;
        group.add(msgHitBoxMesh);

        return group;
      }

      function createFireGeometry(xRadius, zRadius, height, particleCount) {
        const geometry = new THREE.BufferGeometry();

        const position = new Float32Array(particleCount * 3);
        const random = new Float32Array(particleCount);
        const sprite = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          const r = Math.sqrt(Math.random());
          const angle = Math.random() * 2 * Math.PI;

          position[i * 3 + 0] = Math.cos(angle) * r * xRadius;
          position[i * 3 + 1] = (1 - r) * (height * 0.5) + height * 0.5;
          position[i * 3 + 2] = Math.sin(angle) * r * zRadius;

          sprite[i] = (1 / 4) * ((Math.random() * 4) | 0);
          random[i] = Math.random();

          if (i === 0) {
            position[i * 3 + 0] = 0;
            position[i * 3 + 1] = 0;
            position[i * 3 + 2] = 0;
          }
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
        geometry.setAttribute("random", new THREE.BufferAttribute(random, 1));
        geometry.setAttribute("sprite", new THREE.BufferAttribute(sprite, 1));

        return geometry;
      }

      function createFireMaterial(color, size) {
        const image = new Image();
        const texture = new THREE.Texture();

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.image = image;

        image.onload = function () {
          texture.needsUpdate = true;
        };

        image.src = "/fireSprites.png";

        const uniforms = {
          color: { value: null },
          size: { value: 0.0 },
          map: { value: texture },
          time: { value: 0.0 },
          heightOfNearPlane: { value: 0.0 },
        };

        const material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: `
            attribute float random;
            attribute float sprite;
            uniform float time;
            uniform float size;
            uniform float heightOfNearPlane;
            varying float vSprite;
            varying float vOpacity;
            float PI = 3.14;

            float quadraticIn(float t) {
              float tt = t * t;
              return tt * tt;
            }

            void main() {
              float progress = fract(time + (2.0 * random - 1.0));
              float progressNeg = 1.0 - progress;
              float ease = quadraticIn(progress);
              float influence = sin(PI * ease);
              vec3 newPosition = position * vec3(1.0, ease, 1.0);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
              gl_PointSize = (heightOfNearPlane * size) / gl_Position.w;
              vOpacity = min(influence * 4.0, 1.0) * progressNeg;
              vSprite = sprite;
            }
          `,
          fragmentShader: `
            uniform vec3 color;
            uniform sampler2D map;
            varying float vSprite;
            varying float vOpacity;

            void main() {
              vec2 texCoord = vec2(
                gl_PointCoord.x * 0.25 + vSprite,
                gl_PointCoord.y
              );
              gl_FragColor = vec4(texture2D(map, texCoord).xyz * color * vOpacity, 1.0);
            }
          `,
          blending: THREE.AdditiveBlending,
          depthTest: true,
          depthWrite: false,
          transparent: true,
        });

        material.color = new THREE.Color(color);
        material.size = size;
        material.uniforms.color.value = material.color;
        material.uniforms.size.value = material.size;

        material.update = function (delta) {
          material.uniforms.time.value =
            (material.uniforms.time.value + delta) % 1;
        };

        material.setPerspective = function (fov, height) {
          material.uniforms.heightOfNearPlane.value = Math.abs(height / (2 * Math.tan(THREE.MathUtils.degToRad(fov * 0.5))));
        };

        return material;
      }

      function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        fireMesh.material.setPerspective(camera.fov, window.innerHeight);
        summonFireMesh.material.setPerspective(camera.fov, window.innerHeight);
        messages.forEach((msg) => {
          msg.children.forEach((mesh) => {
            if (mesh.name === "fire") {
              mesh.material.setPerspective(camera.fov, window.innerHeight);
            }
          });
        });
      }

      function animation() {
        const delta = clock.getDelta();

        fireMesh.material.update(delta / 20);
        summonFireMesh.material.update(delta / 2);
        messages.forEach((msg) => {
          msg.children.forEach((mesh) => {
            if (mesh.name === "fire") {
              mesh.material.update(delta / 5);
            }
          });
        });

        controls.update();

        composer.render();

        stats.update();
      }
    }
  }, []);

  return (
    <div>
      <div ref={loadingOverlay} id="loading-overlay"></div>
      <SummonModal show={showSummonModal} onClose={() => setShowSummonModal(0)} />
      <canvas ref={threeCanvas}></canvas>
    </div>
  );
}
