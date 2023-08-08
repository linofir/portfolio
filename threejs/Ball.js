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
        this.world = this.game.world;

        this.position.x = x;
        this.position.z = z;

        this.startPosition = new THREE.Vector3(x, Ball.RADIUS, z);

        

        this.sphere = this.createBody(x, BallRadius, z)
        this.world.addShape(sphereBody);
        
        const color = (id==0) ? 0xFFFFFF : 0xFF0000;
        this.mesh = this.game.helper.addVisual(this.sphere, color)

        this.name = `Ball${id}`;

        this.foward = new THREE.Vector3(0,0,-1);
        this.up = new THREE.Vector3(0,1,0);
        this.tempVec = new THREE.Vector3();
        this.tempQuat = new THREE.Vector3();

    }

    hit(){
            
    }

    createBody(x, radius, z){

        const shape = new CANNON.Sphere(Ball.RADIUS);
        const sphereBody = new Body({
            mass: Ball.MASS,
            material: Ball.MATERIAL,
            shape
        })
        sphereBody.position.x = x;
        sphereBody.position.z = z;
        return sphereBody
    }
}

export { Ball}