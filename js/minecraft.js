import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/PointerLockControls.js';

export function initMinecraft(win, showNotification) {
  // Use .window-content if available, otherwise fallback to .window-body.
  const contentArea = win.querySelector('.window-content') || win.querySelector('.window-body');
  contentArea.innerHTML = "";
  // Use flex to let the content fill the remaining space.
  contentArea.style.flex = "1";
  contentArea.style.position = "relative";
  // Ensure the content area fills the available space.
  contentArea.style.height = "100%";
  
  const rendererContainer = document.createElement('div');
  rendererContainer.style.width = "100%";
  rendererContainer.style.height = "100%";
  rendererContainer.style.position = "absolute";
  contentArea.appendChild(rendererContainer);

  const crosshair = document.createElement('div');
  crosshair.style.position = 'absolute';
  crosshair.style.top = '50%';
  crosshair.style.left = '50%';
  crosshair.style.transform = 'translate(-50%, -50%)';
  crosshair.style.pointerEvents = 'none';
  crosshair.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20">
      <line x1="10" y1="4" x2="10" y2="16" stroke="white" stroke-width="2" />
      <line x1="4" y1="10" x2="16" y2="10" stroke="white" stroke-width="2" />
    </svg>
  `;
  rendererContainer.appendChild(crosshair);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(rendererContainer.clientWidth, rendererContainer.clientHeight);
  rendererContainer.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const camera = new THREE.PerspectiveCamera(
    75,
    rendererContainer.clientWidth / rendererContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5.5, 12, 5.5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(50, 50, 25);
  scene.add(directionalLight);

  const textureLoader = new THREE.TextureLoader();
  const blockTexture = textureLoader.load('dirt.png', () => {
    blockTexture.generateMipmaps = false;
  });
  blockTexture.magFilter = THREE.NearestFilter;
  blockTexture.minFilter = THREE.NearestFilter;
  blockTexture.wrapS = THREE.RepeatWrapping;
  blockTexture.wrapT = THREE.RepeatWrapping;
  blockTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  const grassTopTexture = textureLoader.load('minecraft_grassTop.jpg', () => {
    grassTopTexture.generateMipmaps = false;
  });
  grassTopTexture.magFilter = THREE.NearestFilter;
  grassTopTexture.minFilter = THREE.NearestFilter;
  grassTopTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  const grassSideTexture = textureLoader.load('minecraft_grassSide.jpeg', () => {
    grassSideTexture.generateMipmaps = false;
  });
  grassSideTexture.magFilter = THREE.NearestFilter;
  grassSideTexture.minFilter = THREE.NearestFilter;
  grassSideTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  const stoneTexture = textureLoader.load('minecraft_stone.jpg', () => {
    stoneTexture.generateMipmaps = false;
  });
  stoneTexture.magFilter = THREE.NearestFilter;
  stoneTexture.minFilter = THREE.NearestFilter;
  stoneTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  const cobblestoneTexture = textureLoader.load('minecraft_cobblestone.png', () => {
    cobblestoneTexture.generateMipmaps = false;
  });
  cobblestoneTexture.magFilter = THREE.NearestFilter;
  cobblestoneTexture.minFilter = THREE.NearestFilter;
  cobblestoneTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  const woolTexture = textureLoader.load('minecraft_wool.jpg', () => {
    woolTexture.generateMipmaps = false;
  });
  woolTexture.magFilter = THREE.NearestFilter;
  woolTexture.minFilter = THREE.NearestFilter;
  woolTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  
  const blockMaterial = new THREE.MeshPhongMaterial({ map: blockTexture });
  const stoneMaterial = new THREE.MeshPhongMaterial({ map: stoneTexture });
  const cobblestoneMaterial = new THREE.MeshPhongMaterial({ map: cobblestoneTexture });
  
  const whiteWoolMaterial = new THREE.MeshPhongMaterial({ map: woolTexture });
  
  const redWoolMaterial = new THREE.MeshPhongMaterial({ 
    map: woolTexture,
    color: 0xff0000
  });
  
  const blueWoolMaterial = new THREE.MeshPhongMaterial({ 
    map: woolTexture,
    color: 0x0000ff
  });
  
  const yellowWoolMaterial = new THREE.MeshPhongMaterial({ 
    map: woolTexture,
    color: 0xffff00
  });
  
  const greenWoolMaterial = new THREE.MeshPhongMaterial({ 
    map: woolTexture,
    color: 0x00ff00
  });
  
  const grassBlockMaterials = [
    new THREE.MeshPhongMaterial({ map: grassSideTexture }), // right
    new THREE.MeshPhongMaterial({ map: grassSideTexture }), // left
    new THREE.MeshPhongMaterial({ map: grassTopTexture }),  // top
    new THREE.MeshPhongMaterial({ map: blockTexture }),     // bottom
    new THREE.MeshPhongMaterial({ map: grassSideTexture }), // front
    new THREE.MeshPhongMaterial({ map: grassSideTexture })  // back
  ];

  const blockTypes = [
    { name: 'stone', material: stoneMaterial },
    { name: 'dirt', material: blockMaterial },
    { name: 'grass', material: grassBlockMaterials },
    { name: 'cobblestone', material: cobblestoneMaterial },
    { name: 'white wool', material: whiteWoolMaterial },
    { name: 'red wool', material: redWoolMaterial },
    { name: 'blue wool', material: blueWoolMaterial },
    { name: 'yellow wool', material: yellowWoolMaterial },
    { name: 'green wool', material: greenWoolMaterial }
  ];
  
  const hotbar = document.createElement('div');
  hotbar.style.position = 'absolute';
  hotbar.style.bottom = '10px';
  hotbar.style.left = '50%';
  hotbar.style.transform = 'translateX(-50%)';
  hotbar.style.display = 'flex';
  hotbar.style.pointerEvents = 'none';
  rendererContainer.appendChild(hotbar);
  
  let selectedSlot = 0;
  
  for (let i = 0; i < 9; i++) {
    const slot = document.createElement('div');
    slot.style.width = '40px';
    slot.style.height = '40px';
    slot.style.backgroundImage = `url('minecraft_hotbar.png')`;
    slot.style.backgroundSize = 'cover';
    slot.style.margin = '0 2px';
    slot.style.position = 'relative';
    slot.style.display = 'flex';
    slot.style.alignItems = 'center';
    slot.style.justifyContent = 'center';
    
    if (i === selectedSlot) {
      slot.style.border = '2px solid white';
      slot.style.transform = 'scale(1.1)';
    }
    
    if (i < blockTypes.length) {
      const blockIcon = document.createElement('div');
      blockIcon.style.width = '25px';
      blockIcon.style.height = '25px';
      
      if (i === 0) { 
        blockIcon.style.backgroundColor = '#888888';
      } else if (i === 1) { 
        blockIcon.style.backgroundColor = '#8B4513';
      } else if (i === 2) { 
        blockIcon.style.backgroundColor = '#8B4513';
        blockIcon.style.borderTop = '5px solid #4CAF50';
      } else if (i === 3) { 
        blockIcon.style.backgroundColor = '#777777';
        blockIcon.style.border = '1px solid #555555';
      } else if (i === 4) { 
        blockIcon.style.backgroundColor = '#FFFFFF';
        blockIcon.style.border = '1px dashed #CCCCCC';
      } else if (i === 5) { 
        blockIcon.style.backgroundColor = '#FF0000';
        blockIcon.style.border = '1px dashed #CC0000';
      } else if (i === 6) { 
        blockIcon.style.backgroundColor = '#0000FF';
        blockIcon.style.border = '1px dashed #0000CC';
      } else if (i === 7) { 
        blockIcon.style.backgroundColor = '#FFFF00';
        blockIcon.style.border = '1px dashed #CCCC00';
      } else if (i === 8) { 
        blockIcon.style.backgroundColor = '#00FF00';
        blockIcon.style.border = '1px dashed #00CC00';
      }
      
      slot.appendChild(blockIcon);
    }
    
    hotbar.appendChild(slot);
  }
  
  function updateHotbarSelection() {
    Array.from(hotbar.children).forEach((slot, i) => {
      if (i === selectedSlot) {
        slot.style.border = '2px solid white';
        slot.style.transform = 'scale(1.1)';
      } else {
        slot.style.border = 'none';
        slot.style.transform = 'scale(1)';
      }
    });
  }
  
  renderer.domElement.addEventListener('wheel', (event) => {
    if (controls.isLocked) {
      selectedSlot = (selectedSlot + (event.deltaY > 0 ? 1 : -1) + 9) % 9;
      updateHotbarSelection();
    }
  });
  
  document.addEventListener('keydown', (event) => {
    const keyNum = parseInt(event.key);
    if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
      selectedSlot = keyNum - 1;
      updateHotbarSelection();
    }
  });

  const worldSize = 10;
  const blockSize = 1;
  let blocks = [];
  
  for (let x = 0; x < worldSize; x++) {
    for (let y = 0; y < worldSize; y++) {
      for (let z = 0; z < worldSize; z++) {
        const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        
        let material;
        if (y === worldSize - 1) {
          material = grassBlockMaterials;
        } else if (y < worldSize / 2) {
          material = stoneMaterial;
        } else {
          material = blockMaterial;
        }
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x + 0.5, y + 0.5, z + 0.5);
        scene.add(cube);
        blocks.push(cube);
      }
    }
  }

  const controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());

  const instructions = document.createElement('div');
  instructions.style.position = 'absolute';
  instructions.style.top = '50%';
  instructions.style.left = '50%';
  instructions.style.transform = 'translate(-50%, -50%)';
  instructions.style.width = '100%';
  instructions.style.textAlign = 'center';
  instructions.style.color = 'white';
  instructions.style.fontFamily = 'Tahoma, sans-serif';
  instructions.style.fontSize = '20px';
  instructions.style.cursor = 'pointer';
  instructions.style.userSelect = 'none';
  instructions.style.background = 'rgba(0,0,0,0.5)';
  instructions.style.padding = '10px';
  instructions.textContent = 'Click to play Minecraft';
  rendererContainer.appendChild(instructions);

  // Create pause menu with export/import functionality
  const pauseMenu = document.createElement('div');
  pauseMenu.style.position = 'absolute';
  pauseMenu.style.top = '50%';
  pauseMenu.style.left = '50%';
  pauseMenu.style.transform = 'translate(-50%, -50%)';
  pauseMenu.style.width = '300px';
  pauseMenu.style.backgroundColor = 'rgba(0,0,0,0.8)';
  pauseMenu.style.color = 'white';
  pauseMenu.style.padding = '20px';
  pauseMenu.style.borderRadius = '10px';
  pauseMenu.style.fontFamily = 'Tahoma, sans-serif';
  pauseMenu.style.display = 'none';
  pauseMenu.style.zIndex = '1000';
  pauseMenu.innerHTML = `
    <h2 style="text-align: center; margin-top: 0;">Game Paused</h2>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <button id="resume-btn" style="padding: 8px; cursor: pointer;">Resume Game</button>
      <button id="export-btn" style="padding: 8px; cursor: pointer;">Export World</button>
      <div style="display: flex; align-items: center; gap: 5px;">
        <button id="import-btn" style="padding: 8px; cursor: pointer; flex-grow: 1;">Import World</button>
        <input type="file" id="import-file" style="display: none;" accept=".json">
      </div>
    </div>
  `;
  rendererContainer.appendChild(pauseMenu);

  instructions.addEventListener('click', () => { controls.lock(); });

  controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
    pauseMenu.style.display = 'none';
  });

  controls.addEventListener('unlock', () => {
    instructions.style.display = '';
    instructions.textContent = 'Click to resume';
    pauseMenu.style.display = 'block';
    instructions.style.display = 'none';
  });

  // Set up export/import functionality
  const resumeBtn = pauseMenu.querySelector('#resume-btn');
  const exportBtn = pauseMenu.querySelector('#export-btn');
  const importBtn = pauseMenu.querySelector('#import-btn');
  const importFile = pauseMenu.querySelector('#import-file');

  resumeBtn.addEventListener('click', () => {
    controls.lock();
  });

  exportBtn.addEventListener('click', () => {
    const worldData = {
      blocks: blocks.map(block => ({
        position: {
          x: block.position.x,
          y: block.position.y,
          z: block.position.z
        },
        // Store the block type by index in blockTypes array
        type: blockTypes.findIndex(type => {
          // Compare material or arrays of materials
          if (Array.isArray(block.material)) {
            return JSON.stringify(block.material) === JSON.stringify(type.material);
          } else {
            return block.material === type.material;
          }
        })
      }))
    };
    
    const dataStr = JSON.stringify(worldData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = 'minecraft_world_' + new Date().getTime() + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  });
  
  importBtn.addEventListener('click', () => {
    importFile.click();
  });
  
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const worldData = JSON.parse(e.target.result);
        
        // Clear existing blocks
        blocks.forEach(block => {
          scene.remove(block);
        });
        blocks = [];
        
        // Recreate world from imported data
        worldData.blocks.forEach(blockData => {
          // Make sure the block type exists
          if (blockData.type >= 0 && blockData.type < blockTypes.length) {
            const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
            const blockType = blockTypes[blockData.type];
            const cube = new THREE.Mesh(geometry, blockType.material);
            cube.position.set(
              blockData.position.x,
              blockData.position.y,
              blockData.position.z
            );
            scene.add(cube);
            blocks.push(cube);
          }
        });
        
        alert('World imported successfully!');
      } catch (error) {
        console.error("Error importing world:", error);
        alert('Error importing world: ' + error.message);
      }
      
      // Reset the file input
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  const moveSpeed = 5.0;
  const GRAVITY = -30;
  const jumpSpeed = 10;
  let velocityY = 0;
  let canJump = false;
  const playerHeight = 1.8;
  const playerRadius = 0.3;

  function sphereIntersectsBox(sphereCenter, radius, boxMin, boxMax) {
    let sqDist = 0;
    for (let i = 0; i < 3; i++) {
      const v = sphereCenter.getComponent(i);
      let min = boxMin.getComponent(i);
      let max = boxMax.getComponent(i);
      if (v < min) {
        sqDist += (min - v) * (min - v);
      } else if (v > max) {
        sqDist += (v - max) * (v - max);
      }
    }
    return sqDist < (radius * radius);
  }

  function collidesAt(position) {
    const lowerCenter = position.clone();
    lowerCenter.y = position.y - (playerHeight / 2 - playerRadius) - 0.3;
    const upperCenter = position.clone();
    upperCenter.y = position.y + (playerHeight / 2 - playerRadius) - 0.3;

    for (let block of blocks) {
      const boxMin = new THREE.Vector3(
        block.position.x - 0.5,
        block.position.y - 0.5,
        block.position.z - 0.5
      );
      const boxMax = new THREE.Vector3(
        block.position.x + 0.5,
        block.position.y + 0.5,
        block.position.z + 0.5
      );
      if (sphereIntersectsBox(lowerCenter, playerRadius, boxMin, boxMax) ||
          sphereIntersectsBox(upperCenter, playerRadius, boxMin, boxMax)) {
        return true;
      }
    }
    return false;
  }

  const raycaster = new THREE.Raycaster();
  const centerVec = new THREE.Vector2(0, 0);

  const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const outlineGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(blockSize, blockSize, blockSize));
  const blockOutline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
  blockOutline.visible = false;
  scene.add(blockOutline);

  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
  resizeObserver.observe(rendererContainer);

  const keysPressed = {};
  const onKeyDown = (event) => {
    keysPressed[event.code] = true;
    if (event.code === 'Space' && canJump) {
      velocityY = jumpSpeed;
      canJump = false;
    }
  };
  const onKeyUp = (event) => { keysPressed[event.code] = false; };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function onMouseDown(event) {
    if (!controls.isLocked) return;
    raycaster.setFromCamera(centerVec, camera);
    const intersects = raycaster.intersectObjects(blocks);
    if (event.button === 0) {
      if (intersects.length > 0 && intersects[0].distance < 5) {
        const hitBlock = intersects[0].object;
        scene.remove(hitBlock);
        const index = blocks.indexOf(hitBlock);
        if (index > -1) blocks.splice(index, 1);
      }
    } else if (event.button === 2) {
      event.preventDefault();
      if (intersects.length > 0 && intersects[0].distance < 5) {
        const hit = intersects[0];
        const pos = hit.point.clone().add(hit.face.normal.multiplyScalar(0.5));
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        pos.z = Math.floor(pos.z);
        const intendedCenter = new THREE.Vector3(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
        const tempPos = camera.position;
        if (intendedCenter.distanceTo(tempPos) < (0.5 + playerRadius)) {
          return;
        }
        const exists = blocks.some(b => {
          return Math.abs(b.position.x - (pos.x + 0.5)) < 0.1 &&
                 Math.abs(b.position.y - (pos.y + 0.5)) < 0.1 &&
                 Math.abs(b.position.z - (pos.z + 0.5)) < 0.1;
        });
        if (!exists) {
          if (selectedSlot < blockTypes.length) {
            const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
            const selectedBlockType = blockTypes[selectedSlot];
            const cube = new THREE.Mesh(geometry, selectedBlockType.material);
            cube.position.set(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
            scene.add(cube);
            blocks.push(cube);
          } else {
          }
        }
      }
    }
  }
  renderer.domElement.addEventListener('mousedown', onMouseDown);
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  let prevTime = performance.now();
  function animate() {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    if (controls.isLocked) {
      let moveX = 0, moveZ = 0;
      const speed = moveSpeed * delta;
      if (keysPressed['KeyW']) { moveZ += speed; }
      if (keysPressed['KeyS']) { moveZ -= speed; }
      if (keysPressed['KeyA']) { moveX -= speed; }
      if (keysPressed['KeyD']) { moveX += speed; }
      
      const forward = new THREE.Vector3();
      controls.getDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3();
      right.crossVectors(forward, camera.up).normalize();
      
      const movement = new THREE.Vector3();
      movement.addScaledVector(forward, moveZ);
      movement.addScaledVector(right, moveX);
      
      const currentPos = camera.position.clone();
      const newPos = currentPos.clone().add(movement);
      
      const posXTest = currentPos.clone();
      posXTest.x = newPos.x;
      if (!collidesAt(posXTest)) { camera.position.x = posXTest.x; }
      const posZTest = currentPos.clone();
      posZTest.z = newPos.z;
      if (!collidesAt(posZTest)) { camera.position.z = posZTest.z; }

      velocityY += GRAVITY * delta;
      const newY = camera.position.y + velocityY * delta;
      const posYTest = camera.position.clone();
      posYTest.y = newY;
      if (!collidesAt(posYTest)) {
        camera.position.y = newY;
        canJump = false;
      } else {
        velocityY = 0;
        canJump = true;
      }
      
      if (camera.position.y < -10) {
        camera.position.set(5.5, worldSize + 3, 5.5);
        velocityY = 0;
      }
    }

    raycaster.setFromCamera(centerVec, camera);
    const intersects = raycaster.intersectObjects(blocks);
    if (intersects.length > 0 && intersects[0].distance < 5) {
      const targetBlock = intersects[0].object;
      blockOutline.visible = true;
      blockOutline.position.copy(targetBlock.position);
      blockOutline.rotation.copy(targetBlock.rotation);
      blockOutline.updateMatrixWorld();
    } else {
      blockOutline.visible = false;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  const closeBtn = win.querySelector('.title-bar button[aria-label="Close"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      resizeObserver.disconnect();
    });
  }
}