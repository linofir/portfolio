import * as THREE from "three";
import * as CANNON from 'cannon-es';
import { CannonHelper } from "../libs/CannonHelper.js";

class Ball{
    static RADIUS = 0.05715 /2;
    static MASS = 0.17;
    static MATERIAL = new CANNON.Material("ballMaterial");

    constructor(game, x, z, id=0){
        this.id = id;
        this.game = game;
        this.world = game.world;

        this.startPosition = new THREE.Vector3(x, Ball.RADIUS, z);

        this.sphere = this.createBody(x, Ball.RADIUS, z)
        this.world.addBody(this.sphere);
        
        this.mesh = this.createMesh(this.game.scene);

        this.name = `Ball${id}`;

        this.forward = new THREE.Vector3(0,0,-1);
        this.up = new THREE.Vector3(0,1,0);
        this.tmpVec = new THREE.Vector3();
        this.tmpQuat = new THREE.Quaternion();

        this.fallen = false;

        this.reset();
    }

    reset(){
        //this.rigidBody.velocity = new CANNON.Vec3(0);
        //this.rigidBody.angularVelocity = new CANNON.Vec3(0);
        this.sphere.position.copy( this.startPosition );
        this.mesh.position.copy( this.startPosition );
        this.mesh.rotation.set(0,0,0);
        this.fallen = false;

    }

    hit(strength =0.6){
        this.sphere.wakeUp();
      
        const theta = this.game.controls.getAzimuthalAngle();
        this.tmpQuat.setFromAxisAngle(this.up, theta);

        const forward = this.forward.clone().applyQuaternion(this.tmpQuat);
    
        const force = new CANNON.Vec3();
        force.copy(forward);
        force.scale(strength, force);
      
        this.sphere.applyImpulse(force, new CANNON.Vec3());
    }

    createBody(x, y, z){
        const shape = new CANNON.Sphere(Ball.RADIUS);
        const sphereBody = new CANNON.Body({
            mass: Ball.MASS,
            position: new THREE.Vector3(x,y,z),
            material: Ball.MATERIAL,
            shape: shape
        })
        sphereBody.linearDamping = sphereBody.angularDamping = 0.5;
        sphereBody.allowSleep = true;

        sphereBody.sleepSpeedLimit = 2;
        sphereBody.sleepTimeLimit = 0.1;

        return sphereBody
    }

    createMesh(scene){
        const geometry = new THREE.SphereBufferGeometry(Ball.RADIUS, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            metalness: 0.0,
            roughness: 0.1,
            envMap: scene.environment
        })

        if(this.id > 0){
            const textureLoader = new THREE.TextureLoader().setPath("../assets/pool-table/").load(`${this.id}ball.png`, tex => {
                material.map = tex;
                material.needsUpdate = true;
            })
        }

        const mesh = new THREE.Mesh(geometry, material);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        return mesh;
    };

    update(){
        this.mesh.position.copy(this.sphere.position);
        this.mesh.quaternion.copy(this.sphere.quaternion);

    }
}

export { Ball}