import * as THREE from 'three';
import gsap from 'gsap'
import vertexShader from "../shaders/vertex.glsl"
import atmosphereVertexShader from "../shaders/atmosphereVertex.glsl"
import fragmentShader from "../shaders/fragment.glsl"
import atmosphereFragmentShader from "../shaders/atmosphereFragment.glsl"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Create3dObjectsHelper } from './createObjectHelper'

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
        await this.isLoadingTable();
        this.objects = [];
        this.setRenderer();
        this.setSceneAndCam();

        this.preLoadTextures();

        let sphereRadius = this.state ? 0.5 : 1;
        let atmosphereScaleValue = this.state ? 1.2 : 2.2;
        this.sphere = this.create3dObjectsHelper.createBasicSphereObject(sphereRadius, 50, 50, this.shaderMaterial);
        this.sphereAtmosphere = this.create3dObjectsHelper.createBasicSphereObject(0.6, 50, 50, this.atmosphereShaderMaterial);
        this.sphereAtmosphere.scale.set(atmosphereScaleValue, atmosphereScaleValue, atmosphereScaleValue);
        this.cube = this.create3dObjectsHelper.createBasicCubeObject(1, 1, 1, this.reflectMaterial);

        this.hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
        this.scene.add(this.hemiLight);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 2.3;
        this.renderer.shadowMap.enabled = true;


        if (this.state) {
            this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
            this.setSkyBox();
            this.setPlaneAndPickSquare();
            this.sphere.scale.set(1.1, 1.1, 1.1)
            this.insertObjectInPlaneScene();

            this.addGridHelper();
        } else {
            this.sphereStop = false;
            this.scene.add(this.sphereAtmosphere);
            this.Group = new THREE.Group();
            this.Group.add(this.sphere);
            this.scene.add(this.Group);
            this.objects.push(this.sphere, this.sphereAtmosphere);
            this.sphere.position.set(0, 20, 3);
            this.sphereAtmosphere.position.set(0, 20, 3);
            this.setMousePermissionMovements();
            this.setStars();
            this.setMousePosition();
        }
        this.resizeScreenAction();
        this.runScene();
    }

    /**
     * Set movement sphere status
     */
    setMousePermissionMovements() {
        $(window).on('mouseup', () => {
            this.sphereStop = false;
        });
        $(window).on('mousedown', () => {
            this.sphereStop = true;
        });
    }

    /**
     * Set star points objects
     */
    setStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 400;
            const z = -Math.random() * 500;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    /**
     * Set mouse position values
     */
    setMousePosition() {
        this.mousePosition = {
            x: undefined,
            y: undefined
        }

        $(window).on('mousemove', (event) => {
            if (this.sphereStop) {
                this.mousePosition.x = (event.clientX / innerWidth) * 2 - 1;
                this.mousePosition.y = (event.clientY / innerHeight) * 2 - 1;
                console.log(this.mousePosition);
            }
        })
    }

    /**
     * Set confirm to choose which objects to load
     */
    async isLoadingTable() {
        this.state = await confirm("Load plane table?");
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

            if (!objectExist) {
                if (this.intersects.length > 0) {
                    const sphereClone = this.extenal3dObject ? this.extenal3dObject.clone() : this.sphere.clone();
                    const sphereAtmosphereClone = this.sphereAtmosphere.clone();
                    let position = this.highlightMesh.position;
                    position.y = 0.5;
                    sphereClone.position.copy(position);
                    sphereAtmosphereClone.position.copy(position);
                    this.scene.add(sphereClone);
                    this.scene.add(sphereAtmosphereClone);
                    this.objects.push(sphereClone, sphereAtmosphereClone);
                    this.highlightMesh.material.color.setHex(0xFF0000);
                    position.y = 0;
                }
            }
            console.log(this.scene.children.length, this.ObjectsGroup.children.length);
        });
    }

    /**
     * When resize window change the camera and renderer
     */
    resizeScreenAction() {
        window.addEventListener('resize', () => {
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
            if (this.intersects.length > 0) {
                const intersect = this.intersects[0];
                const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
                this.highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

                const objectExist = this.objects.find((object) => {
                    return (object.position.x === this.highlightMesh.position.x)
                        && (object.position.z === this.highlightMesh.position.z)
                });

                if (!objectExist)
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
        this.spotLight = new THREE.SpotLight(0xffa95c, 4);
        this.spotLight.castShadow = true;
        this.spotLight.shadow.bias = -0.0001;
        this.spotLight.shadow.mapSize.width = 1024 * 4;
        this.spotLight.shadow.mapSize.height = 1024 * 4;
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
     * @param {Array} skyBoxImages - array of images path to load as background of canvas  effect as 3d
     */
    setSkyBox(skyBoxImages) {
        if (skyBoxImages) {
            this.scene.background = new THREE.CubeTextureLoader().load(skyBoxImages);
            this.renderer.render(this.scene, this.camera);
        }

    }

    /**
     * Set threejs WebGLRenderer renderer
     * @param {String} color - HEX color value to set as background of canvas
     */
    setRenderer(color) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (color) {
            this.renderer.setClearColor(color, 1);
        }
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Set threejs scene and camera
     */
    setSceneAndCam() {
        let camXposition = this.state ? 70 : 3;
        let camZposition = this.state ? 5000 : 1000;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            camXposition,
            window.innerWidth / window.innerHeight,
            1,
            camZposition
        );
        //set initial position of camera
        this.camera.position.set(0, 20, 50);
        if (this.state) {
            this.axesHelper(10);
        }
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
            if (this.highlightMesh) {
                this.highlightMesh.material.opacity = 1 + Math.sin(time / 120);
            }
            this.renderer.render(this.scene, this.camera);
            if (this.spotLight) {
                this.spotLight.position.set(
                    this.camera.position.x + 10,
                    this.camera.position.y + 10,
                    this.camera.position.z + 10
                );
            }

            this.objects.forEach((obj) => {
                obj.rotation.y += 0.005;
            });

            if (this.sphereStop) {
                gsap.to(this.Group.children[0].rotation, {
                    x: this.mousePosition.y * 2,
                    y: this.mousePosition.x * 3,
                    duration: 1
                });
            }

            requestAnimationFrame(renderSceneAndCam);
        }
        renderSceneAndCam();
    }

    /**
     * Remove previus geometry object and add another
     * @param {Object} geometryObject - An Threejs Object3D
     */
    async changeObjectFromScene(geometryObject) {
        this.scene.remove(this.object);
        this.setObject(geometryObject);
        this.scene.add(this.object);
    }

    /**
     * Move geometry object through the screen
     * @param {Object} objects - THREE objects
     */
    moveObject(objects) {
        $(document).keydown((event) => {
            if (objects?.length <= 0) {
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
            if (objects?.length > 0) {
                this.setLight(objects[0].position.x, objects[0].position.y, objects[0].position.z);
            }
        });
    }

    /**
     * Load materials and textures variables
     */
    preLoadTextures() {
        this.texturesValues = this.create3dObjectsHelper.textures();
        this.metallicNestMaterial = this.create3dObjectsHelper.standardMaterialValues({ normalMap: this.texturesValues.nest, roughness: 0.8, metalness: 0.3 });
        this.woodMaterial = this.create3dObjectsHelper.standardMaterialValues({ normalMap: this.texturesValues.wood, roughness: 0.9, metalness: 0.1 });
        this.globeMaterial = this.reflectMaterial = this.create3dObjectsHelper.basicMaterialValues({ map: this.texturesValues.globe });
        this.shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: this.getUniformObj(this.texturesValues.globe)
        });

        this.atmosphereShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        if (this.state) {
            this.reflectMaterial = this.create3dObjectsHelper.basicMaterialValues({ envMap: this.scene.background });
            this.skyBoxImages = [
                "textures\\Day_Light_skyBox\\Box_Left_1.bmp", "textures\\Day_Light_skyBox\\Box_Right_2.bmp",
                "textures\\Day_Light_skyBox\\Box_Top_3.bmp", "textures\\Day_Light_skyBox\\Box_Bottom_4.bmp",
                "textures\\Day_Light_skyBox\\Box_Back_5.bmp", "textures\\Day_Light_skyBox\\Box_Front_6.bmp"
            ]
        }

        // this.extenal3dObject = this.load3dExternalModel('models/rusticFarmHouseNewBrunswickCanada/scene.gltf', -30, -50, 0);
        // this.extenal3dObject = await this.load3dExternalModel('models/oldRailroadBumper/scene.gltf', -20, 0, 10);
    }

    /**
     * Load materials and textures variables
     */
    setDirectionalLightHelper() {
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
        this.dLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 5);
    }

    /**
     * Load materials and textures variables
     * @param {Object} texture - Threejs TextureLoader object
     */
    getUniformObj(texture) {
        return THREE.UniformsUtils.clone({
            texture1: { type: "t", value: texture }
        })
    }
}

$(document).ready(() => {
    let threeJsInstance = new threeJs();
});