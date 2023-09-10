import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
class threeJs {
    constructor(create3dObjectsHelperInstance) {
        this.create3dObjectsHelper = create3dObjectsHelperInstance;
        this.object = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.textureLoader = null;
        this.initTheeJs();
    }

    /**
     * Init threejs objects
     */
    async initTheeJs() {
        this.setSceneAndCam();
        this.setRenderer();
        this.loadTextures();
        this.pointLight = new THREE.DirectionalLight(0xffffff, 0.1);
        this.pointLight1 = new THREE.DirectionalLight(0xffffff, 0.1);
        // create 3d objects
        // sphere
        this.texturesValues = this.create3dObjectsHelper.textures();
        this.metallicNestMaterial = this.create3dObjectsHelper.standardMaterialValues({normalMap: this.texturesValues.nest, roughness: 0.8, metalness: 0.3});
        const sphere = this.create3dObjectsHelper.createBasicSphereObject(1, 64, 64, this.metallicNestMaterial);

        // Cube
        const cube = this.create3dObjectsHelper.createBasicCubeObject(2,2,2,this.metallicNestMaterial);

        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x20b2aa });
        const cube1 = new THREE.Mesh(geometry, material);        

        const edges = new THREE.EdgesGeometry(geometry);
        this.line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));        
        this.scene.add(this.line);
        // cylinder
        const geometryCylinder = new THREE.CylinderGeometry(2, 2, 7, 50);
        const cylinder = this.create3dObjectsHelper.create3dObject(geometryCylinder);

        const  planeGeometry = new THREE.PlaneGeometry(30, 30)
        const plane = this.create3dObjectsHelper.create3dObject(planeGeometry);
        this.scene.add(plane);
        plane.rotation.x = -0.5 * Math.PI;
        // this.changeObjectFromScene(cube);
        this.changeObjectFromScene(cube);
        this.moveObject();
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.gridHelper = new THREE.GridHelper(30, 60)
        this.dLightHelper = new THREE.DirectionalLightHelper(this.pointLight, 5);
        this.scene.add(this.gridHelper);
        this.scene.add(this.dLightHelper);
        this.renderer.shadowMap.enabled = true;
    }

    /**
     * Set threejs scene and camera
     */
    setSceneAndCam() {
        //Create a scene
        this.scene = new THREE.Scene();
        // create camera
        this.camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth/window.innerHeight,
            0.1,
            1000
        );
        //set initial position of camera
        this.camera.position.set(0, 0, 25);
        this.axesHelper();
    }

    axesHelper() {
        this.axesHelperObj = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelperObj);        
    }

    /**
     * Set threejs WebGLRenderer renderer
     */
    setRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor ("#8bc34a", 1);
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Set geometry object into class property
     * @param {Object} geometry - An Object3D
     * @param {String} color - Hex color Codes
     * @param {Number} metalness - How much the material is like a metal (Non-metallic materials such as wood or stone use 0.0, metallic use 1.0)
     * @param {Number} roughness - How rough the material appears (0.0 means a smooth mirror reflection, 1.0 means fully diffuse. Default is 1.0)
     * @returns {Object} Threejs Mesh object 
     */
    createMeshStandardMaterialObject(geometry, color, metalness, roughness, normalMap) {
        const material = new THREE.MeshStandardMaterial({
            normalMap: normalMap,            
            roughness: roughness,
            metalness: metalness,
            color: new THREE.Color(color)
        });
        return new THREE.Mesh(geometry, material);
    }

    setLight(objectPosX, objectPosY, objectPosZ) {
        this.removeLights();
        this.setLights();
        this.pointLight.position.set(objectPosX + 1, objectPosY + 1, objectPosZ + 1);
        this.pointLight.intensity = 1;        
        this.pointLight1.position.set(objectPosX - 1, objectPosY - 1, objectPosZ - 1);
        this.pointLight1.intensity = 1;
        this.scene.add(this.pointLight);
        this.scene.add(this.pointLight1);
    }

    removeLights() {
        this.scene.remove(this.pointLight);
        this.scene.remove(this.pointLight1);
    }

    setLights() {
        this.pointLight = new THREE.PointLight(0xffffff, 0.1);
        this.pointLight1 = new THREE.PointLight(0xffffff, 0.1);
    }

    /**
     * Set geometry object into class property
     * @param {Object} geometryObject - An Threejs Object3D
     */
    setObject(object) {
        this.object = object;
    }

    /**
     * Animate - rotate geometry object
     */
    animateObject() {
        const animate = () => {
            requestAnimationFrame(animate);
            // this.object.rotation.x += 0.01;
            // this.object.rotation.y += 0.01;
            // this.line.rotation.x += 0.01;
            // this.line.rotation.y += 0.01;
            this.object.position.y = 1;
            this.line.position.y = 1;
            this.renderer.render(this.scene, this.camera);
        }
        animate();
    }
    
    /**
     * Remove geometry object from a scene
     */
    removeObjectFromScene() {
        this.scene.remove(this.object);
    }

    /**
     * Add geometry object to a scene
     */
    addObjectInScene() {
        this.scene.add(this.object);
    }

    /**
     * Remove previus geometry object and add another
     * @param {Object} geometryObject - An Threejs Object3D
     */
    async changeObjectFromScene(geometryObject) {
        this.removeObjectFromScene();
        this.setObject(geometryObject);
        this.addObjectInScene();
        this.animateObject();
    }

    loadTextures() {
        this.textureLoader = new THREE.TextureLoader();
        this.nestTexture = this.textureLoader.load("\\textures\\nest.jpg");
        this.stonesTexture = this.textureLoader.load("textures\\stones.jpg");
        this.whiteWavesTexture = this.textureLoader.load("textures\\white-waves.jpg");
        this.glassWaterDropsTexture = this.textureLoader.load("textures\\glass_water_drops.jpg");
        this.woodTexture = this.textureLoader.load("textures\\wood.jpg");
    }

    /**
     * Move geometry object through the screen
     */
    moveObject() {
        $(document).keydown((event) => {
            switch (event.key) {
                case "ArrowDown":
                case "s":
                case "S":
                    this.object.position.z++;
                    this.line.position.z++;
                    this.setLight(this.object.position.x, this.object.position.y, this.object.position.z);
                    break;
                case "ArrowUp":
                case "w":
                case "W":
                    this.object.position.z--;
                    this.line.position.z--;
                    this.setLight(this.object.position.x, this.object.position.y, this.object.position.z);
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    this.object.position.x--;
                    this.line.position.x--;
                    this.setLight(this.object.position.x, this.object.position.y, this.object.position.z);
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    this.object.position.x++;
                    this.line.position.x++;
                    this.setLight(this.object.position.x, this.object.position.y, this.object.position.z);
                    break;
                default:
                    console.log(`event.key: ${event.key}`);
            }
        });
    }
}

$(document).ready(() => {
    let create3dObjectsHelperInstance = new Create3dObjectsHelper(THREE);
    let threeJsInstance = new threeJs(create3dObjectsHelperInstance);
});