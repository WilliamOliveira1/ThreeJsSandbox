import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Create3dObjectsHelper} from './createObjectHelper'
class threeJs {
    constructor() {
        this.create3dObjectsHelper = new Create3dObjectsHelper();
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
        this.setRenderer("#8bc34a");
        this.setSpotLight();
        this.setSkyBox();
        this.preLoadTextures();
        
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        const sphere = this.create3dObjectsHelper.createBasicSphereObject(1, 32, 32, this.reflectMaterial);
        const cube = this.create3dObjectsHelper.createBasicCubeObject(1, 1, 1, this.reflectMaterial);
        this.gridHelper = new THREE.GridHelper(30, 60)        
        this.scene.add(this.gridHelper);       
        this.changeObjectFromScene(cube);
        this.moveObject([this.object]);
        this.renderer.shadowMap.enabled = true;


        this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        this.scene.add(this.hemiLight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 2.3;
        this.renderer.shadowMap.enabled = true;
        
        // loading 3d model
        this.create3dObjectsHelper.load3dModel('models/rusticFarmHouseNewBrunswickCanada/scene.gltf', -30, -50, 0, this.scene);
        this.create3dObjectsHelper.load3dModel('models/oldRailroadBumper/scene.gltf', -20, 0, 10, this.scene);
        // this.create3dObjectsHelper.load3dModel('models/oldRailroadBumper/scene.gltf', 0, 0.25, 0);
    }    

    /**
     * Set light and cast shadow
     */
    setSpotLight() {
        this.spotLight = new THREE.SpotLight(0xffa95c,4);
        this.spotLight.castShadow = true;
        this.spotLight.shadow.bias = -0.0001;
        this.spotLight.shadow.mapSize.width = 1024*4;
        this.spotLight.shadow.mapSize.height = 1024*4;
        this.scene.add(this.spotLight);
    }

    /**
     * Add multiples objects in scene
     * @param {Object} objects - ThreeJs objects
     */
    addObjectsInScene(objects) {
        objects.forEach((object) => {
            this.scene.add(object);
        });
    }

    setSkyBox() {
        let images = [
            "textures\\Day_Light_skyBox\\Box_Left_1.bmp", "textures\\Day_Light_skyBox\\Box_Right_2.bmp",
            "textures\\Day_Light_skyBox\\Box_Top_3.bmp", "textures\\Day_Light_skyBox\\Box_Bottom_4.bmp",
            "textures\\Day_Light_skyBox\\Box_Back_5.bmp", "textures\\Day_Light_skyBox\\Box_Front_6.bmp"
        ]
        let loader = new THREE.CubeTextureLoader();
        this.scene.background = loader.load(images);
        this.renderer.render(this.scene, this.camera);        
        this.runScene();
    }

    /**
     * Set threejs WebGLRenderer renderer
     * @param {String} color - HEX color value
     */
    setRenderer(color) {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(color, 1);
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Set threejs scene and camera
     */
    setSceneAndCam() {
        //Create a scene
        this.scene = new THREE.Scene();
        // create camera
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth/window.innerHeight,
            1,
            5000
        );
        //set initial position of camera
        this.camera.position.set(0, 20, 50);
        this.axesHelper(10);
    }

    /**
     * Set AxesHelper
     * @param {Number} lineSize - line size of AxesHelper
     */
    axesHelper(lineSize) {
        this.scene.add(new THREE.AxesHelper(lineSize));        
    }    

    /**
     * Set lights position
     * @param {Number} objectPosX - Object position in X
     * @param {Number} objectPosY - Object position in Y
     * @param {Number} objectPosZ - Object position in Z
     */
    setLight(objectPosX, objectPosY, objectPosZ) {
        this.removeLights([this.pointLight, this.pointLight1]);
        this.pointLight = new THREE.PointLight(0xffffff, 0.5);
        this.pointLight1 = new THREE.PointLight(0xffffff, 0.5);
        this.pointLight.position.set(objectPosX + 1, objectPosY + 1, objectPosZ + 1);
        this.pointLight.intensity = 1;        
        this.pointLight1.position.set(objectPosX - 1, objectPosY - 1, objectPosZ - 1);
        this.pointLight1.intensity = 1;
        this.scene.add(this.pointLight);
        this.scene.add(this.pointLight1);
    }

    /**
     * Remove lights from scene
     * @param {Array} lights - Object position in X
     */
    removeLights(lights) {
        lights.forEach((light) => {
            this.scene.remove(light);
        });
    }

    /**
     * Set geometry object into class property
     * @param {Object} geometryObject - An Threejs Object3D
     */
    setObject(object) {
        this.object = object;
    }

    /**
     * run Scene - must do to render the scene and the camera
     */
    runScene() {
        const renderSceneAndCam = () => {
            this.renderer.render(this.scene, this.camera);
            this.spotLight.position.set(
                this.camera.position.x + 10,
                this.camera.position.y + 10,
                this.camera.position.z + 10
            );
            requestAnimationFrame(renderSceneAndCam);
        }
        renderSceneAndCam();
    }

    /**
     * Animate object
     */
    animateObject() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.object.rotation.x += 0.01;
            this.object.rotation.y += 0.01;
            this.object.position.y = 1;
        }
        animate();
    }


    /**
     * Remove previus geometry object and add another
     * @param {Object} geometryObject - An Threejs Object3D
     */
    async changeObjectFromScene(geometryObject) {
        this.scene.remove(this.object);
        this.setObject(geometryObject);
        this.scene.add(this.object);
        // this.animateObject();
    }

    /**
     * Move geometry object through the screen
     */
    moveObject(objects) {
        $(document).keydown((event) => {
            if(objects?.length <= 0) {
                return;
            }
            switch (event.key) {
                case "ArrowDown":
                case "s":
                case "S":
                    objects.forEach((object) => {
                        object.position.z++;
                    });                    
                    break;
                case "ArrowUp":
                case "w":
                case "W":
                    objects.forEach((object) => {
                        object.position.z--;
                    });
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    objects.forEach((object) => {
                        object.position.x--;
                    });
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    objects.forEach((object) => {
                        object.position.x++;
                    });
                    break;
                default:
                    console.log(`event.key: ${event.key}`);
            }
            if(objects?.length > 0) {
                this.setLight(objects[0].position.x, objects[0].position.y, objects[0].position.z);
            }  
        });                      
    }

    preLoadTextures() {
        this.texturesValues = this.create3dObjectsHelper.textures();
        this.metallicNestMaterial = this.create3dObjectsHelper.standardMaterialValues({normalMap: this.texturesValues.nest, roughness: 0.8, metalness: 0.3});
        this.woodMaterial = this.create3dObjectsHelper.standardMaterialValues({normalMap: this.texturesValues.wood, roughness: 0.9, metalness: 0.1});
        this.reflectMaterial = this.create3dObjectsHelper.basicMaterialValues({envMap: this.scene.background});
    }

    setDirectionalLightHelper() {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
        this.dLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 5);
    }
}

$(document).ready(() => {
    let threeJsInstance = new threeJs();
});