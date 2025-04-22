import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

export async function initRoblox(win, showNotification) {
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  contentArea.innerHTML = "";
  contentArea.style.flex = "1";
  contentArea.style.position = "relative";
  contentArea.style.height = "100%";

  const rendererContainer = document.createElement('div');
  rendererContainer.style.width = "100%";
  rendererContainer.style.height = "100%";
  rendererContainer.style.position = "absolute";
  contentArea.appendChild(rendererContainer);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
  rendererContainer.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const skybox = cubeTextureLoader.load([
    '/null_plainsky512_rt.jpg',
    '/null_plainsky512_lf.jpg',
    '/null_plainsky512_up.jpg',
    '/null_plainsky512_dn.jpg',
    '/null_plainsky512_ft.jpg',
    '/null_plainsky512_bk.jpg'
  ]);
  scene.background = skybox;

  const camera = new THREE.PerspectiveCamera(
    75,
    rendererContainer.clientWidth / rendererContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, 5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(50, 50, 25);
  scene.add(directionalLight);

  const room = new WebsimSocket();
  await room.initialize();
  const otherPlayers = new Map();

  const textureLoader = new THREE.TextureLoader();
  const topTexture = textureLoader.load('roblox-stud.png');
  topTexture.magFilter = THREE.LinearFilter;
  topTexture.minFilter = THREE.LinearMipMapLinearFilter;
  topTexture.wrapS = THREE.RepeatWrapping;
  topTexture.wrapT = THREE.RepeatWrapping;
  topTexture.repeat.set(4, 4);

  const bottomTexture = textureLoader.load('roblox-stud-underside.png');
  bottomTexture.magFilter = THREE.LinearFilter;
  bottomTexture.minFilter = THREE.LinearMipMapLinearFilter;
  bottomTexture.wrapS = THREE.RepeatWrapping;
  bottomTexture.wrapT = THREE.RepeatWrapping;
  bottomTexture.repeat.set(4, 4);

  function createBlockMaterials(baseColor) {
    return [
      new THREE.MeshPhongMaterial({ color: baseColor }),
      new THREE.MeshPhongMaterial({ color: baseColor }),
      new THREE.MeshPhongMaterial({ map: topTexture, color: baseColor, transparent: true }),
      new THREE.MeshPhongMaterial({ map: bottomTexture, color: baseColor, transparent: true }),
      new THREE.MeshPhongMaterial({ color: baseColor }),
      new THREE.MeshPhongMaterial({ color: baseColor })
    ];
  }

  const groundGeo = new THREE.BoxGeometry(50, 1, 50);
  const groundMaterials = createBlockMaterials(0x00aa00);
  const ground = new THREE.Mesh(groundGeo, groundMaterials);
  ground.position.set(25, -0.5, 25);
  scene.add(ground);

  const platforms = [];

  let startX = 2, startZ = 2;
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.BoxGeometry(4, 1, 4);
    const platformMaterials = createBlockMaterials(0x00aa00);
    const platform = new THREE.Mesh(geo, platformMaterials);
    platform.position.set(startX, i * 2 + 1, startZ);
    platforms.push(platform);
    scene.add(platform);
    startX += 3;
    startZ += 3;
  }

  const islandPositions = [
    { x: 30, y: 10, z: 10, size: 8 },
    { x: 40, y: 15, z: 30, size: 6 },
    { x: 15, y: 12, z: 35, size: 7 },
    { x: 8, y: 8, z: 45, size: 5 }
  ];

  islandPositions.forEach(island => {
    const geo = new THREE.BoxGeometry(island.size, 1, island.size);
    const platformMaterials = createBlockMaterials(0x00aa00);
    const platform = new THREE.Mesh(geo, platformMaterials);
    platform.position.set(island.x, island.y, island.z);
    platforms.push(platform);
    scene.add(platform);
  });

  const bridges = [
    { start: { x: 30, y: 10, z: 10 }, end: { x: 40, y: 15, z: 30 }, width: 2 },
    { start: { x: 40, y: 15, z: 30 }, end: { x: 15, y: 12, z: 35 }, width: 2 },
    { start: { x: 15, y: 12, z: 35 }, end: { x: 8, y: 8, z: 45 }, width: 2 }
  ];

  bridges.forEach(bridge => {
    const dx = bridge.end.x - bridge.start.x;
    const dy = bridge.end.y - bridge.start.y;
    const dz = bridge.end.z - bridge.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);
    const slope = Math.atan2(dy, length);

    const geo = new THREE.BoxGeometry(length, 0.5, bridge.width);
    const bridgeMaterials = createBlockMaterials(0xaaaaaa);
    const bridgeMesh = new THREE.Mesh(geo, bridgeMaterials);

    bridgeMesh.position.set(
      bridge.start.x + dx/2,
      bridge.start.y + dy/2,
      bridge.start.z + dz/2
    );

    bridgeMesh.rotation.y = angle;
    bridgeMesh.rotation.x = slope;

    platforms.push(bridgeMesh);
    scene.add(bridgeMesh);
  });

  const hazards = [];

  for (let i = 0; i < 6; i++) {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const hazardMaterials = createBlockMaterials(0xff0000);
    const hazard = new THREE.Mesh(geo, hazardMaterials);
    hazard.position.set(5 + i * 3, i * 2 + 2, 5 + i * 3);
    hazards.push(hazard);
    scene.add(hazard);
  }

  const hazardFields = [
    { x: 25, y: 11, z: 15, count: 5 },
    { x: 35, y: 16, z: 25, count: 4 },
    { x: 20, y: 13, z: 40, count: 6 }
  ];

  hazardFields.forEach(field => {
    for (let i = 0; i < field.count; i++) {
      const geo = new THREE.BoxGeometry(2, 2, 2);
      const hazardMaterials = createBlockMaterials(0xff0000);
      const hazard = new THREE.Mesh(geo, hazardMaterials);
      hazard.position.set(
        field.x + (Math.random() - 0.5) * 8,
        field.y,
        field.z + (Math.random() - 0.5) * 8
      );
      hazards.push(hazard);
      scene.add(hazard);
    }
  });

  const movingHazards = [];
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BoxGeometry(2, 2, 2);
    const hazardMaterials = createBlockMaterials(0xff4500);
    const hazard = new THREE.Mesh(geo, hazardMaterials);
    hazard.position.set(20 + i * 10, 10 + i * 2, 20 + i * 5);
    hazard.userData.speed = 0.05;
    hazard.userData.distance = 5;
    hazard.userData.originalX = hazard.position.x;
    hazard.userData.originalZ = hazard.position.z;
    hazard.userData.angle = Math.random() * Math.PI * 2;
    movingHazards.push(hazard);
    hazards.push(hazard);
    scene.add(hazard);
  }

  const goalGeo = new THREE.BoxGeometry(6, 1, 6);
  const goalMaterials = createBlockMaterials(0x0000ff);
  const goal = new THREE.Mesh(goalGeo, goalMaterials);
  goal.position.set(45, 20, 45);
  scene.add(goal);

  const decorations = [];
  const decorativePositions = [
    { x: 10, y: 0.5, z: 10 },
    { x: 20, y: 10.5, z: 20 },
    { x: 35, y: 15.5, z: 35 },
    { x: 5, y: 0.5, z: 40 }
  ];

  decorativePositions.forEach(pos => {
    const geo = new THREE.CylinderGeometry(0.5, 1, 3, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const decoration = new THREE.Mesh(geo, material);
    decoration.position.set(pos.x, pos.y, pos.z);
    decoration.rotation.y = Math.random() * Math.PI;
    decorations.push(decoration);
    scene.add(decoration);
  });

  let playerModel;
  const playerObject = new THREE.Object3D();
  const startPosition = new THREE.Vector3(1, 5, 1);
  playerObject.position.copy(startPosition);
  scene.add(playerObject);

  const loader = new GLTFLoader();
  loader.load('roblox_noob.glb', (gltf) => {
    playerModel = gltf.scene;
    playerModel.scale.set(0.4, 0.4, 0.4);
    playerModel.position.y = 0;
    playerObject.add(playerModel);

    broadcastPresence();
    showNotification("Roblox character loaded!");
  });

  async function createPlayerModel() {
    return new Promise((resolve) => {
      loader.load('roblox_noob.glb', (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.4, 0.4, 0.4);
        model.position.y = 0;
        resolve(model);
      });
    });
  }

  const cameraOffset = new THREE.Vector3(0, 0, 0);
  const cameraTarget = new THREE.Vector3(0, 0, 0);
  const cameraTargetOffset = new THREE.Vector3(0, 1, 0);
  let isRightMouseDown = false;
  let mouseX = 0, mouseY = 0;
  let cameraAngle = 0;
  let cameraVerticalAngle = 0;

  const moveSpeed = 7.0;
  const GRAVITY = -30;
  const jumpSpeed = 12;
  let velocityY = 0;
  let canJump = false;
  const playerRadius = 0.3;
  const playerHeight = 2;

  function collidesWithObject(position, objects) {
    const lowerSphere = new THREE.Sphere(
      new THREE.Vector3(position.x, position.y + playerRadius, position.z),
      playerRadius
    );
    const upperSphere = new THREE.Sphere(
      new THREE.Vector3(position.x, position.y + playerHeight - playerRadius, position.z),
      playerRadius
    );

    for (let obj of objects) {
      const box = new THREE.Box3().setFromObject(obj);
      if (box.intersectsSphere(lowerSphere) || box.intersectsSphere(upperSphere)) {
        return true;
      }
    }

    for (const [id, otherPlayerModel] of otherPlayers) {
      if (id !== room.clientId) {
        const otherBox = new THREE.Box3().setFromObject(otherPlayerModel);
        if (otherBox.intersectsSphere(lowerSphere) || otherBox.intersectsSphere(upperSphere)) {
          return true;
        }
      }
    }

    return false;
  }

  function broadcastPresence() {
    if (playerObject && playerModel && isWindowOpen) { 
      room.updatePresence({
        position: {
          x: playerObject.position.x,
          y: playerObject.position.y,
          z: playerObject.position.z
        },
        rotation: playerModel.rotation.y
      });
    }
  }

  const unsubscribePresence = room.subscribePresence(async (currentPresence) => {
    const currentPeerIds = Object.keys(currentPresence); 
    const handledPlayerIds = new Set();

    for (const clientId in currentPresence) {
      if (clientId === room.clientId) continue; 

      handledPlayerIds.add(clientId);
      const playerData = currentPresence[clientId];

      if (playerData && playerData.position && playerData.rotation !== undefined) {
        if (!otherPlayers.has(clientId)) {
          const newPlayerModel = await createPlayerModel();
          scene.add(newPlayerModel);
          otherPlayers.set(clientId, newPlayerModel);
          console.log(`Player ${clientId} joined/appeared`);
        }

        const model = otherPlayers.get(clientId);
        if (model) {
          model.position.set(playerData.position.x, playerData.position.y, playerData.position.z);
          model.rotation.y = playerData.rotation;
        }
      } else {
        if (otherPlayers.has(clientId)) {
          const modelToRemove = otherPlayers.get(clientId);
          scene.remove(modelToRemove);
          otherPlayers.delete(clientId);
          console.log(`Player ${clientId} left/disappeared (invalid data)`);
        }
      }
    }

    otherPlayers.forEach((model, clientId) => {
      if (!handledPlayerIds.has(clientId)) {
        scene.remove(model);
        otherPlayers.delete(clientId);
        console.log(`Player ${clientId} left/disappeared (removed from presence)`);
      }
    });
  });

  const oofSound = new Audio("oof.mp3");
  const jumpSound = new Audio("roblox-classic-jump.mp3");

  const keysPressed = {};
  const onKeyDown = (e) => {
    keysPressed[e.code] = true;
    if (e.code === 'Space' && canJump) {
      velocityY = jumpSpeed;
      canJump = false;
      jumpSound.play().catch(err => {
        console.warn('Could not play jump sound:', err);
      });
    }
  };
  const onKeyUp = (e) => { keysPressed[e.code] = false; };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  renderer.domElement.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      isRightMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      isRightMouseDown = false;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isRightMouseDown) {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      cameraAngle -= deltaX * 0.01;
      cameraVerticalAngle += deltaY * 0.01;
    }
  });

  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
  resizeObserver.observe(rendererContainer);

  let lastBroadcastTime = 0;
  const BROADCAST_INTERVAL = 50;

  let animationFrameId = null; 
  let isWindowOpen = true; 

  let prevTime = performance.now();
  function animate() {
    if (!isWindowOpen) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    animationFrameId = requestAnimationFrame(animate); 

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    movingHazards.forEach(hazard => {
      hazard.userData.angle += hazard.userData.speed;
      hazard.position.x = hazard.userData.originalX + Math.cos(hazard.userData.angle) * hazard.userData.distance;
      hazard.position.z = hazard.userData.originalZ + Math.sin(hazard.userData.angle) * hazard.userData.distance;
    });

    let moveX = 0, moveZ = 0;
    const speed = moveSpeed * delta;

    if (keysPressed['KeyW']) {
      moveX -= Math.sin(cameraAngle) * speed;
      moveZ -= Math.cos(cameraAngle) * speed;
    }
    if (keysPressed['KeyS']) {
      moveX += Math.sin(cameraAngle) * speed;
      moveZ += Math.cos(cameraAngle) * speed;
    }
    if (keysPressed['KeyA']) {
      moveX -= Math.cos(cameraAngle) * speed;
      moveZ += Math.sin(cameraAngle) * speed;
    }
    if (keysPressed['KeyD']) {
      moveX += Math.cos(cameraAngle) * speed;
      moveZ -= Math.sin(cameraAngle) * speed;
    }

    const newPosition = playerObject.position.clone();

    newPosition.x += moveX;
    if (!collidesWithObject(newPosition, [...platforms, ...hazards, ground])) {
      playerObject.position.x = newPosition.x;
    }
    newPosition.x = playerObject.position.x;

    newPosition.z += moveZ;
    if (!collidesWithObject(newPosition, [...platforms, ...hazards, ground])) {
      playerObject.position.z = newPosition.z;
    }
    newPosition.z = playerObject.position.z;

    velocityY += GRAVITY * delta;
    newPosition.y += velocityY * delta;

    if (!collidesWithObject(newPosition, [...platforms, ...hazards, ground])) {
      playerObject.position.y = newPosition.y;
      canJump = false;
    } else {
      if (velocityY < 0) {
        canJump = true;
      }
      velocityY = 0;
    }

    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ);
      if (playerModel) {
        playerModel.rotation.y = angle;
      }
    }

    cameraOffset.x = Math.sin(cameraAngle) * Math.cos(cameraVerticalAngle) * 5;
    cameraOffset.y = Math.sin(cameraVerticalAngle) * 5;
    cameraOffset.z = Math.cos(cameraAngle) * Math.cos(cameraVerticalAngle) * 5;

    cameraTarget.copy(playerObject.position).add(cameraTargetOffset);
    camera.position.copy(cameraTarget).add(cameraOffset);
    camera.lookAt(cameraTarget);

    for (let hazard of hazards) {
      const dist = playerObject.position.distanceTo(hazard.position);
      const collisionDistance = 1.5;
      const verticalDist = Math.abs(playerObject.position.y - hazard.position.y);
      const verticalThreshold = 2.0;

      if (dist < collisionDistance && verticalDist < verticalThreshold) {
        oofSound.play().catch(err => { console.warn('Could not play oof sound:', err); });
        showNotification("You died! Restarting...");
        playerObject.position.copy(startPosition);
        velocityY = 0;
        canJump = false;
        break;
      }
    }

    const goalBox = new THREE.Box3().setFromObject(goal);
    if (goalBox.containsPoint(playerObject.position)) {
      showNotification("Congratulations! You reached the goal! Restarting...");
      playerObject.position.copy(startPosition);
      velocityY = 0;
      canJump = false;
    }

    if (time - lastBroadcastTime > BROADCAST_INTERVAL) {
      broadcastPresence();
      lastBroadcastTime = time;
    }

    renderer.render(scene, camera);
  }

  animate();

  const closeBtn = win.querySelector('button[aria-label="Close"]');
  const originalCloseAction = closeBtn ? closeBtn.onclick : null; 

  if (closeBtn) {
    closeBtn.onclick = null; 
    closeBtn.addEventListener('click', () => {
      isWindowOpen = false; 
      
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      resizeObserver.disconnect();
      unsubscribePresence();
      otherPlayers.forEach(model => scene.remove(model));
      otherPlayers.clear();
      if (animationFrameId) cancelAnimationFrame(animationFrameId); 

      room.updatePresence({}); 

      const realCloseBtn = win.querySelector('.title-bar-controls button[aria-label="Close"]');
      if (realCloseBtn && realCloseBtn !== closeBtn) {
        realCloseBtn.click(); 
      } else {
        win.remove(); 
      }
      const taskbarButtons = document.querySelector('.taskbar-buttons');
      const btnToRemove = taskbarButtons.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
      if(btnToRemove) btnToRemove.remove();
      if (window.currentActiveWindowId === win.dataset.id) {
        window.currentActiveWindowId = null;
      }
    });
  }
}