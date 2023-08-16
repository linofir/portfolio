import * as CANNON from 'cannon-es';
import {Ball} from './Ball.js';

let scene, world, debug, helper;

function addCannonVisual(body, color=0xAAAAAA){
    if(!helper) return;
    helper.addVisual(body, color);

}

class Arch {
    constructor(params){
        this.body = new CANNON.Body({
            mass: 0,
            material : Table.MATERIAL
        });

        params = params || {};

        this.position = params.position || {x:0, y:0, z:0};

        this.radius = params.radius || Ball.RADIUS + 0.02;

        this.box_autowidth = params.box_autowidth || false;
        this.box_width = params.box_width || 2;
        this.box_height = params.box_height || 5;
        this.box_thickness = params.box_thickness || 2;
        this.no_of_boxes = params.no_of_boxes || 5;

        this.body.position.set(this.position.x, this.position.y, this.position.z);

        const y_axis = new CANNON.Vec3(0,1,0);

        this.body.quaternion.setFromAxisAngle(y_axis, Math.PI);

        const box_increment_angle = Math.PI/ (2* this.no_of_boxes);
        let x_len = this.radius * Math.tan(box_increment_angle);

        if(!this.box_autowidth) x_len = this.box_width

        const shape = new CANNON.Box(new CANNON.Vec3(x_len, this.box_height, this.box_thickness));

        for( let i=0; i < this.no_of_boxes; i++){
            const theta = box_increment_angle +(i* Math.PI/this.no_of_boxes);

            let boxZ = Math.sin(theta)*(this.radius + this.box_thickness);
            let boxX = Math.cos(theta)*(this.radius + this.box_thickness);

            this.body.addShape(
                shape, 
                new CANNON.Vec3(boxX,0, boxZ),
                helper.createQuaternionFromAxisAngle(y_axis, Math.PI / 2 -theta)
                )
        }
    }


}

class LongWall{
    constructor(x, y, z, width) {
        const height = 0.02;
        const thickness = 0.025;
  
        this.body = new CANNON.Body({
            mass: 0, // mass == 0 makes the body static
            material: Table.WALL_MATERIAL
        });
  
        //adjust the x-coordinates to change the angle of the triangle shape
        const vertices1 = [
            -0.028,     height, -2 * thickness, // vertex 0
            0,     height,  0,             // vertex 1
            0,  height, -2 * thickness, // vertex 2
            -0.028,    -height, -2 * thickness, // vertex 3
            0,    -height,  0,             // vertex 4
            0, -height, -2 * thickness  // vertex 5
        ];
  
        //corner of table
        const vertices2 = [
            0,  height, -2 * thickness, // vertex 0
            0,  height,  0,             // vertex 1
            0.08,  height, -2 * thickness, // vertex 2
            0, -height, -2 * thickness, // vertex 3
            0, -height,  0,             // vertex 4
            0.08, -height, -2 * thickness  // vertex 5
        ];
  
        const indices = [
            0, 1, 2,
            5, 4, 3,
            5, 0, 2,
            5, 3, 0,
            3, 4, 1,
            3, 1, 0,
            4, 5, 1,
            5, 2, 1
        ];

        const trimeshShape1 = new CANNON.Trimesh(vertices1, indices);
        const trimeshShape2 = new CANNON.Trimesh(vertices2, indices);
  
        this.body.position.set(x,y,z);
        this.body.addShape(trimeshShape1, new CANNON.Vec3(-width, 0, 0));
        this.body.addShape(trimeshShape2, new CANNON.Vec3( width, 0, 0));
  
        const boxshape = new CANNON.Box(new CANNON.Vec3(width, height, thickness));
  
        this.body.addShape(boxshape, new CANNON.Vec3(0 ,0, -thickness));
    }
    
}
class ShortWall{
    constructor(x, y, z, width) {
        const height = 0.02;
        const thickness = 0.04;

        this.body = new CANNON.Body({
            mass: 0, // mass == 0 makes the body static
            material: Table.WALL_MATERIAL
        });
  
        // How to make a mesh with a single triangle
        const vertices1 = [
            -0.125,  height, -2 * thickness, // vertex 0
            0,  height,  0,             // vertex 1
            0,  height, -2*thickness,   // vertex 2
            -0.125, -height, -2*thickness,   // vertex 3
            0, -height,  0,             // vertex 4
            0, -height, -2*thickness    // vertex 5
        ];
  
        // Corner of table
        const vertices2 = [
            0,  height, -2 * thickness,  // vertex 0
            0,  height,  0,              // vertex 1
            0.125,  height, -2 * thickness,  // vertex 2
            0, -height, -2 * thickness,  // vertex 3
            0, -height,  0,              // vertex 4
            0.125, -height, -2 * thickness   // vertex 5
        ];
  
        const indices = [
            0, 1, 2,
            3, 4, 5,
            5, 0, 2,
            5, 3, 0,
            3, 4, 1,
            3, 1, 0,
            4, 5, 1,
            5, 2, 1
        ];

        const trimeshShape1 = new CANNON.Trimesh(vertices1, indices);
        const trimeshShape2 = new CANNON.Trimesh(vertices2, indices);
  
        this.body.position.set(x,y,z);
        this.body.addShape(trimeshShape1, new CANNON.Vec3(-width, 0, 0));
        this.body.addShape(trimeshShape2, new CANNON.Vec3( width, 0, 0));
  
        const boxshape = new CANNON.Box(new CANNON.Vec3(width, height, thickness));
  
        this.body.addShape(boxshape, new CANNON.Vec3(0 ,0, -thickness));
  
        this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    }
}

class Hole{
    constructor(x,y,z,positionAngle){

        this.archWall = new Arch({
            position: {x, y, z},
            no_of_boxes: 6,
            box_height: 0.06,
            box_autowidth: true,
            box_thickness: 0.01
        })

        this.archfloor = new Arch({
            position: {x, y: y - 0.01, z},
            no_of_boxes: 6,
            box_height: 0.01,
            box_autowidth: 0.025,
            box_thickness: 0.03
        })
        this.archWall.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), Math.PI - positionAngle);
        this.archfloor.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -positionAngle);
  
        world.addBody(this.archWall.body);
        world.addBody(this.archfloor.body);

        if (debug) {
            addCannonVisual(this.archWall.body, 0x3333FF, false, false);
            addCannonVisual(this.archfloor.body, 0x33FFFF, false, false);
        }

    }

}


class Table {
    //create static values for size
    static LENGTH = 2.7432;
    static WIDTH = 1.3716;
    static HEIGHT = 0.06;
    static MATERIAL = new CANNON.Material('floorMaterial');
    static WALL_MATERIAL = new CANNON.Material('wallMaterial');

    constructor(game){
        world = game.world;
        scene = game.scene;
        debug = game.debug;
        helper = game.helper;

        this.createRigidBody();

    }

    createRigidBody(){
        this.felt = this.createFelt();
        this.holes = this.createHoles();
        this.walls = this.createWalls();

    }

    createFelt(){
        const shortStripLength= Table.WIDTH /2 - 0.05;
        const shortStripWidth = 0.02;
        const tableThickness = Table.HEIGHT/2;
        const floorLength = Table.LENGTH/2 - 2*shortStripWidth;

        const shortStripe = new CANNON.Box(new CANNON.Vec3
            (shortStripWidth, tableThickness, shortStripLength));
        const floor = new CANNON.Box(new CANNON.Vec3
            (floorLength , tableThickness, Table.WIDTH/2));

        const body = new CANNON.Body({
            mass:0,
            material: Table.MATERIAL
        });

        body.addShape(floor, new CANNON.Vec3(0, -tableThickness, 0));
        body.addShape(shortStripe, new CANNON.Vec3(-floorLength -shortStripWidth , -tableThickness, 0 ));
        body.addShape(shortStripe, new CANNON.Vec3(floorLength + shortStripWidth,-tableThickness, ));

        if(debug){
            addCannonVisual(body, 0x00FF00, false, true);

        }

        world.addBody(body);
        
        return body
        
    }

    createHoles(){
        const corner = {x: Table.LENGTH/2 +0.015, z: Table.WIDTH/2 - 0.015, positionAngle: Math.PI/4};

        const middleZ = Table.WIDTH/2 +0.048;

        const holes =  [
            new Hole(corner.x, 0, -corner.z, corner.positionAngle),
            new Hole(corner.x, 0, corner.z,3 * corner.positionAngle),
            new Hole(0, 0, middleZ, Math.PI),
            new Hole(-corner.x, 0, corner.z, 5* corner.positionAngle),
            new Hole(-corner.x, 0, -corner.z,7 * corner.positionAngle),
            new Hole(0, 0, -middleZ, 0)
        ]
        return holes
    }

    createWalls(){
        const pos = {x: Table.LENGTH / 4 -0.008, y: 0.02, z: Table.WIDTH/2}

        const wallX1 = new LongWall(pos.x,pos.y,-pos.z, 0.61);
        const wallX2 = new LongWall(-pos.x,pos.y,-pos.z, 0.61);
        wallX2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0,1), Math.PI);

        const wallX3 = new LongWall(pos.x,pos.y,pos.z, 0.61);
        wallX3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0,0), Math.PI);
        const wallX4 = new LongWall(-pos.x,pos.y,pos.z, 0.61);
        wallX4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1,0), -Math.PI);


        pos.x = Table.LENGTH/2;

        const wallZ1 = new ShortWall(pos.x, pos.y, 0, 0.605);
        const wallZ2 = new ShortWall(-pos.x, pos.y, 0, 0.605);
        wallZ2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -1.5*Math.PI);


        const walls = [wallX1, wallX2, wallX3, wallX4, wallZ1, wallZ2];
        walls.forEach(wall => {
            world.addBody(wall.body)
            if(debug){
                addCannonVisual(wall.body, 0x00DD00, false, true);
    
            }

        });

        return walls;

    }
}

export {Table}