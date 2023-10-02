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
        this.raycaster = new THREE.Raycaster();
        this.initTheeJs();
    }

    /**
     * Init threejs objects
     */
    async initTheeJs() {
        this.objects = [];
        this.setSceneAndCam();
        this.setRenderer("#8bc34a");
        this.setSpotLight();
        let skyBoxImages = [
            "textures\\Day_Light_skyBox\\Box_Left_1.bmp", "textures\\Day_Light_skyBox\\Box_Right_2.bmp",
            "textures\\Day_Light_skyBox\\Box_Top_3.bmp", "textures\\Day_Light_skyBox\\Box_Bottom_4.bmp",
            "textures\\Day_Light_skyBox\\Box_Back_5.bmp", "textures\\Day_Light_skyBox\\Box_Front_6.bmp"
        ]
        this.setSkyBox(skyBoxImages);
        this.preLoadTextures();
        
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.sphere = this.create3dObjectsHelper.createBasicSphereObject(0.5, 32, 32, this.reflectMaterial);
        this.cube = this.create3dObjectsHelper.createBasicCubeObject(1, 1, 1, this.reflectMaterial);             
        this.setPlaneAndPickSquare();

        this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        this.scene.add(this.hemiLight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 2.3;
        this.renderer.shadowMap.enabled = true;
        this.resizeScreenAction();
        this.insertObjectInPlaneScene();
   
        // this.extenal3dObject = this.load3dExternalModel('models/rusticFarmHouseNewBrunswickCanada/scene.gltf', -30, -50, 0);
        // this.extenal3dObject = await this.load3dExternalModel('models/oldRailroadBumper/scene.gltf', -20, 0, 10);
    }

    /**
     * Load extenal 3d model
     * @param {Object} modelPath - path of 3d model file
     * @param {Number} positionX - position in X to place the object
     * @param {Number} positionY - position in Y to place the object
     * @param {Number} positionZ - position in Z to place the object
     */
    async load3dExternalModel(modelPath, positionX, positionY, positionZ) {
        let model;
        try {            
            model = await this.create3dObjectsHelper.load3dModel(modelPath, positionX, positionY, positionZ);
            model.position.set(positionX, positionY, positionZ);      
        } catch (error) {
            console.log(error)
        } finally {
            return model;
        }
    }

    /**
     * insert 3d model object in a plane position selected
     */
    insertObjectInPlaneScene() {
        window.addEventListener('click', () => {
            const objectExist = this.objects.find((object) => {
                return (object.position.x === this.highlightMesh.position.x)
                && (object.position.z === this.highlightMesh.position.z)
            });
        
            if(!objectExist) {
                if(this.intersects.length > 0) {
                    const sphereClone = this.extenal3dObject ? this.extenal3dObject.clone() : this.cube.clone();
                    let position = this.highlightMesh.position;
                    position.y = 0.5;
                    sphereClone.position.copy(position);
                    this.scene.add(sphereClone);
                    this.objects.push(sphereClone);
                    this.highlightMesh.material.color.setHex(0xFF0000);
                }
            }
            console.log(this.scene.children.length);
        });
    }

    /**
     * When resize window change the camera and renderer
     */
    resizeScreenAction() {
        window.addEventListener('resize', () => {
            debugger;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Set plane and highlight square while mouse move over plane
     * TODO: refact
     */
    setPlaneAndPickSquare() {
        const planeMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                visible: false
            })
        );
        planeMesh.rotateX(-Math.PI / 2);
        this.scene.add(planeMesh);
        
        this.addGridHelper();
        
        this.highlightMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true
            })
        );
        this.highlightMesh.rotateX(-Math.PI / 2);
        this.highlightMesh.position.set(0.5, 0, 0.5);
        this.scene.add(this.highlightMesh);
        
        const mousePosition = new THREE.Vector2();        
        window.addEventListener('mousemove', (event) => {
            mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(mousePosition, this.camera);
            this.intersects = this.raycaster.intersectObject(planeMesh);
            if(this.intersects.length > 0) {
                const intersect = this.intersects[0];
                const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
                this.highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);
        
                const objectExist = this.objects.find((object) => {
                    return (object.position.x === this.highlightMesh.position.x)
                    && (object.position.z === this.highlightMesh.position.z)
                });
        
                if(!objectExist)
                    this.highlightMesh.material.color.setHex(0xFFFFFF);
                else
                    this.highlightMesh.material.color.setHex(0xFF0000);
            }
        });
    }

    /**
     * Add grid helper
     */
    addGridHelper() {
        this.gridHelper = new THREE.GridHelper(20, 20)        
        this.scene.add(this.gridHelper);
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

    /**
     * Set skybox images
     * @param {Array} skyBoxImages - array of images path 
     */
    setSkyBox(skyBoxImages) {        
        let loader = new THREE.CubeTextureLoader();
        this.scene.background = loader.load(skyBoxImages);
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
        this.scene = new THREE.Scene();
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
        const renderSceneAndCam = (time) => {
            if(this.highlightMesh) {
                this.highlightMesh.material.opacity = 1 + Math.sin(time / 120);
            }            
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