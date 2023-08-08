import * as THREE from "three";
import * as CANNON from 'cannon-es';
import { CannonHelper } from "../libs/CannonHelper.js";

class Table {
    //create static values for size
    static LENGTH = 2.7432;
    static WIDTH = 1.3716;
    static HEIGHT = 0.2;
    static MATERIAL = new CANNON.Material('floorMaterial');

    constructor(game){
        this.game = game;
        this.world = game.world;

        const boxshape = new CANNON.Vec3(Table.LENGTH/2 , Table.HEIGHT/2, WIDTH/2);
        const shape = new CANNON.Box(boxshape);

        const body = new CANNON.Body({
            mass:0,
            material: Table.MATERIAL,
            shape
        });

        body.position.y = -Table.HEIGHT/2;

        this.world.addShape(body);
        game.helper.addVisual(body, 0x000FF00, false, true);


    }
}

export {Table}