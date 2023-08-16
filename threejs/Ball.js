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
        
        const colors =[0xFFFFFF, 0x99e6ee, 0xff8484, 0xb21212, 0xb26abf
            , 0xf4d2b2, 0xbce5af, 0x000000, 0xd89a00, 0x00606a, 0xb21212, 0x5f2969, 0xdc6900, 0x009a37, 0x634303
        ]
        //const color = (id==0) ? 0xFFFFFF : 0xFF0000;
        this.mesh = this.game.helper.addVisual(this.sphere, colors[id]);

        this.name = `Ball${id}`;

        this.forward = new THREE.Vector3(0,0,-1);
        this.up = new THREE.Vector3(0,1,0);
        this.tmpVec = new THREE.Vector3();
        this.tmpQuat = new THREE.Quaternion();

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
}

export { Ball}