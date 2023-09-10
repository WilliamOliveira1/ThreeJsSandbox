class Create3dObjectsHelper {
    constructor(threeJsInstance) {
        this.THREE = threeJsInstance;
        this.materialType = {
            basicMaterial: this.THREE.MeshBasicMaterial,
            standardMaterial: this.THREE.MeshStandardMaterial
        }        
    }

    textures() {
        this.textureLoader = new this.THREE.TextureLoader();
        return {
            nest: this.textureLoader.load("\\textures\\nest.jpg"),
            stone: this.textureLoader.load("textures\\stones.jpg"),
            whiteWaves: this.textureLoader.load("textures\\white-waves.jpg"),
            waterDrops: this.textureLoader.load("textures\\glass_water_drops.jpg"),
            wood: this.textureLoader.load("textures\\wood.jpg")
        }
    }

    /**
     * Standard material values (Get and Set)
     * @param {Object} normalMap - texture loader object- the default value is null
     * @param {String} color - Hex color Codes - the default value is "#FFFFFF" (white)
     * @param {Number} metalness - How much the material is like a metal (Non-metallic materials such as wood or stone use 0.0, metallic use 1.0)
     * @param {Number} roughness - How rough the material appears (0.0 means a smooth mirror reflection, 1.0 means fully diffuse. Default is 1.0)
     * @param {Boolean} isFogAffected - Whether the material is affected by fog. Default is true.
     * @returns {Object} a standard material object value
     */
    standardMaterialValues({normalMap = null, roughness = 1.0, metalness = 0.0, color = "#FFFFFF", isFogAffected = true} = {}) {        ;
        return {normalMap, roughness, metalness, color, isFogAffected};
    }

    /**
     * Basic material values (Get and Set)
     * @param {String} color - Hex color Codes - the default value is "#FFFFFF" (white)
     * @param {Boolean} isFogAffected - Whether the material is affected by fog. Default is true.
     * @returns {Object} a standard material object value
     */
    basicMaterialValues({color = "#FFFFFF", isFogAffected = true} = {}) {
        return {color, isFogAffected};
    }
    
    /**
     * Create basic 3d object
     * @param {Object} geometry - threejs base geometry object
     * @param {Object} materialObject - material of the 3d object, default value is basicMaterialValues object
     * @returns {Object} Threejs Mesh object 
     */
    create3dObject(geometry, materialObject = this.basicMaterialValues()) {
        let objValuesMaterialType = this.getMaterialObjType(materialObject);
        return new this.THREE.Mesh(geometry, new objValuesMaterialType(materialObject));
    }

    /**
     * Create basic sphere 3d object
     * @param {Number} radius - sphere radius. Default value is 1
     * @param {Number} widhtSegments - number of horizontal segments. Minimum value is 3, default value is 32.
     * @param {Number} heightSegments - number of vertical segments. Minimum value is 2, default value is 16.
     * @param {Object} materialObject - material of the 3d object, default value is basicMaterialValues object
     * @returns {Object} Threejs Mesh object 
     */
    createBasicSphereObject(radius = 1, widhtSegments = 32, heightSegments = 16, materialObject = this.basicMaterialValues()) {        
        const sphereGeometry = new this.THREE.SphereGeometry(radius, widhtSegments, heightSegments);
        return this.create3dObject(sphereGeometry, materialObject);
    }
    
    /**
     * Create basic cube 3d object
     * @param {Number} width — The length of the edges parallel to the X axis. Optional; default value is 1.
     * @param {Number} height — The length of the edges parallel to the Y axis. Optional; default value is 1.
     * @param {Number} depth — The length of the edges parallel to the Z axis. Optional; default value is 1.
     * @param {Object} materialObject - material of the 3d object, default value is basicMaterialValues object
     * @returns {Object} Threejs Mesh object 
     */
    createBasicCubeObject(width = 1, height = 1, depth = 1, materialObject = this.basicMaterialValues()) {
        const geometryCube = new this.THREE.BoxGeometry(width, height, depth);
        return this.create3dObject(geometryCube, materialObject);
    }

    /**
     * Create basic cylinder 3d object
     * @param {Number} radiusTop — Radius of the cylinder at the top. Default value is 1.
     * @param {Number} radiusBottom — Radius of the cylinder at the bottom. Default value is 1.
     * @param {Number} height — Height of the cylinder. Default value is 1.
     * @param {Number} radialSegments — Number of segmented faces around the circumference of the cylinder. Default value is 32.
     * @param {Object} materialObject - material of the 3d object, default value is basicMaterialValues object
     * @returns {Object} Threejs Mesh object 
     */
    createBasicCylinderObject(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 32, materialObject = this.basicMaterialValues()) {
        const geometryCylinder = new this.THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        return this.create3dObject(geometryCylinder, materialObject);
    }

    /**
     * Get material type based in object type
     * @param {Object} materialObjValues — material object value.
     * @returns {Object} MaterialType enum
     */
    getMaterialObjType(materialObjValues) {    
        let materialValues = [this.basicMaterialValues(), this.standardMaterialValues()]
        let materialType = null;
        let materialNames = ["basicMaterial", "standardMaterial"]
        materialValues.forEach((material, index) => {
            let isEqual = this.isSameTypeObjects(material, materialObjValues);
            if(isEqual) {
                materialType = this.materialType[materialNames[index]];
                return;
            }
        });
        return materialType;
    }

    /**
     * Check if is same type objects
     * @param {Object} firstObj — material object value.
     * @param {Object} secondObj — material object value.
     * @returns {Boolean} True if same type objects, false otherwise
     */
    isSameTypeObjects(firstObj, secondObj) {
        const keys1 = Object.keys(firstObj).sort();
        const keys2 = Object.keys(secondObj).sort();

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (let i = 0; i < keys1.length; i++) {
            if (keys1[i] !== keys2[i]) {
                return false;
            }
        }

        return true;
    }
}