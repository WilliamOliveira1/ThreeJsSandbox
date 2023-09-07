class threeJs {
    constructor() {
        this.object = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.initTheeJs();
    }

    async initTheeJs() {
        this.setSceneAndCam();
        this.setRenderer();

        // create 3d objects
        // sphere
        const sphereGeometry = new THREE.SphereGeometry(0.5, 64, 64);
        const sphere = this.createObject(sphereGeometry, "#8bc34a");

        // Cube
        const geometryCube = new THREE.BoxGeometry(2, 2, 2);
        const cube = this.createObject(geometryCube, "#292929");

        // cylinder
        const geometryCylinder = new THREE.CylinderGeometry(2, 2, 7, 50);
        const cylinder = this.createObject(geometryCylinder, "#8bc34a");
        
        // this.changeObjectFromScene(cube);
        this.changeObjectFromScene(cylinder);
        this.moveObject();
    }

    setSceneAndCam() {
        //Create a scene
        this.scene = new THREE.Scene();
        // create camera
        this.camera = new THREE.PerspectiveCamera(50, 2 / 1, 0.1, 1000);
        //set initial position of camera
        this.camera.position.z = 25;
    }

    setRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    createObject(geometry, color, metalness, roughness) {
        const material = new THREE.MeshBasicMaterial({
            color: color,
            metalness: metalness,
            roughness: roughness
        });
        return new THREE.Mesh(geometry, material);
    }

    setObject(object) {
        this.object = object;
    }

    animateObject() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.object.rotation.x += 0.01;
            this.object.rotation.y += 0.01;
    
            this.renderer.render(this.scene, this.camera);
        }
        animate();
    }
    
    removeObjectFromScene() {
        this.scene.remove(this.object);
    }

    addObjectInScene() {
        this.scene.add(this.object);
    }

    async changeObjectFromScene(object) {
        this.removeObjectFromScene();
        this.setObject(object);
        this.addObjectInScene();
        this.animateObject();       
    }

    moveObject() {
        $(document).keydown((event) => {
            switch (event.key) {
                case "ArrowDown":
                case "s":
                    this.object.position.z++;
                    break;
                case "ArrowUp":
                case "w":
                    this.object.position.z--;
                    break;                
                case "ArrowLeft":
                case "a":
                    this.object.position.x--;
                    break;
                case "ArrowRight":
                case "d":
                    this.object.position.x++;
                    break;
                default:
                    console.log(`event.key: ${event.key}`);
            }
        });
    }
}

$(document).ready(() => {
    let theeJs = new threeJs();
});