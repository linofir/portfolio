import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CannonHelper } from "../libs/CannonHelper.js";
import { RGBELoader } from "../node_modules/three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import {LoadingBar} from "../libs/LoadingBar.js";
import { Table } from "./Table.js";
import { Ball } from "./Ball.js";
import { WhiteBall } from "./WhiteBall.js"
import {StrengthBar} from "./StrengthBar.js"


class Game{

  constructor(){
    this.initThree();
    this.initWorld();
    this.initScene();

    this.strengthBar = new StrengthBar();

    const strengthControl = document.getElementById('strengthControl');

    if ('ontouchstart' in document.documentElement){
      strengthControl.addEventListener( 'touchstart', this.mousedown.bind(this));
      strengthControl.addEventListener( 'touchend', this.mouseup.bind(this));
    }else{
      strengthControl.addEventListener( 'mousedown', this.mousedown.bind(this));
      strengthControl.addEventListener( 'mouseup', this.mouseup.bind(this));
      document.addEventListener( 'keydown', this.keydown.bind(this));
      document.addEventListener( 'keyup', this.keyup.bind(this));
    }

    if (this.helper) this.helper.wireframe = true;

    
  }
  
  initThree(){
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    this.debug = false;
    this.loadingBar = new LoadingBar();

     this.clock = new THREE.Clock();
     
     this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20 );
     this.camera.position.set( -3, 1.5, 0 );
     
     this.scene = new THREE.Scene();
     this.scene.background = new THREE.Color( 0x000000 );
 
     const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
     this.scene.add(ambient);
     
     this.createLight(Table.LENGTH/4);
     this.createLight(-Table.LENGTH/4);

     this.renderer = new THREE.WebGLRenderer({ antialias: true } );
     this.renderer.shadowMap.enabled = true;
     this.renderer.setPixelRatio( window.devicePixelRatio );
     this.renderer.setSize( window.innerWidth, window.innerHeight );
     container.appendChild( this.renderer.domElement );
     
     this.controls = new OrbitControls( this.camera, this.renderer.domElement );
     
     this.renderer.setAnimationLoop(this.render.bind(this));
 
     window.addEventListener('resize', this.resize.bind(this) );
    }
    
  createLight(x){
    const light = new THREE.SpotLight(0xffffe5, 1, 10, 0.8, 0.9, 2);

    light.position.set( x, 1, 0);
    light.target.position.set(x,0x0);
    light.updateMatrixWorld();

    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    light.shadow.camera.fov = 70
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 2.5;
    
    this.scene.add(light);

    if(this.debug){
      const SpotLightHelper = new THREE.SpotLightHelper(light);
      //this.scene.add(SpotLightHelper);
    }
  }
    
  setEnvironment(){
    const loader = new RGBELoader();
    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    pmremGenerator.compileEquirectangularShader();
        
    loader.load( '../assets/living_room.hdr',  
        texture => {
            const envMap = pmremGenerator.fromEquirectangular( texture).texture
            ;
            pmremGenerator.dispose();
            this.scene.environment = envMap;
        }, 
        undefined, 
        err => console.error( err )
      );

  }
    
  keydown( evt ){
    if (evt.keyCode == 32){
        this.strengthBar.visible = true;
    }
  }

  keyup( evt ){
    if (evt.keyCode == 32){
        this.strengthBar.visible = false;
        this.strikeCueball()
    }
  }

  mousedown(evt){
    this.strengthBar.visible = true;
  }

  mouseup( evt ){
    this.strengthBar.visible = false;
    this.strikeCueball()
  }

  strikeCueball(){
    if (this.cueBall.isSleeping) this.cueBall.hit(this.strengthBar.strength);
  }

  initWorld() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    this.world.allowSleep = true;
    this.world.fixedTimeStep = 1.0 / 60.0;

    this.setCollisionBehaviour(this.world);
    
    this.world.fixedTimeStep = 1.00 / 60.00;
    
    this.helper = new CannonHelper( this.scene, this.world);
  }

  setCollisionBehaviour(world){
    world.defaultContactMaterial.friction = 0.2;
    world.defaultContactMaterial.restitution = 0.8;

    const ball_floor = new CANNON.ContactMaterial(
      Ball.MATERIAL,
      Table.MATERIAL,
      {friction: 0.7, restitution: 0.1}
    )

    this.world.addContactMaterial(ball_floor);
  }
  // Spheres
  initScene(){
    this.helper = new CannonHelper(this.scene, this.world);
    this.table = new Table(this);
    this.loadGLTF();
    this.createBalls();
  }

  loadGLTF(){
    const loader =  new GLTFLoader().setPath("../assets/pool-table/");

    loader.load(
      'pool-table.glb',

    gltf => {
      this.table = gltf.scene
      this.table.position.set(-Table.LENGTH/2, 0, Table.WIDTH/2 );
      this.table.traverse( child => {
        if(child.name == 'Cue'){
          this.cue = child;
          child.visible = false
        }
        if(child.name = 'Felt'){
          this.edges = child;
        }
        if(child.isMesh){
          child.material.metalness = 0.0;
          child.material.roughness = 0.3;
        }
        if(child.parent !== null && child.parent.name !== null && child.parent.name == 'Felt'){
          //child.material.roughness = 0.8;
          child.recieveShadow = true
        }
      })
      this.scene.add(gltf.scene);

      this.loadingBar.visible = false;

      this.renderer.setAnimationLoop(this.render.bind(this))
    },
    xhr => {
      this.loadingBar.progress = (xhr.loaded / xhr.total);
    },
    err => {
      console.error(err);
    }
    );
  }

  createBalls(){
    //white ball
    this.balls = [new WhiteBall(this, -Table.LENGTH/4, 0) ];
    console.log(this.balls);

    const rowInc = 1.74 * Ball.RADIUS;
    let row = {x: Table.LENGTH/4 +rowInc, count:6, total:6};
    const ids = [4,3,14,2,15,13,7,2,5,6,8,9,10,11,1];

    for(let i=0; i<15; i++){
      if (row.total==row.count){
          //Initialize a new row
          row.total = 0;
          row.count--;
          row.x -= rowInc;
          row.z = (row.count-1) * (Ball.RADIUS + 0.002);
      }
      this.balls.push( new Ball(this, row.x, row.z, ids[i]));
      row.z -= 2 * (Ball.RADIUS + 0.002);
      row.total++;
  }
    
    this.cueBall = this.balls[0];
  }

  resize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );  
  }
 
  render( ) {   
    this.controls.target.copy(this.cueBall.mesh.position);
    this.controls.update(); 
    this.world.step(this.world.fixedTimeStep);

    if (this.strengthBar.visible) this.strengthBar.update();
    const dt = this.clock.getDelta();

    if(this.helper) this.helper.update();
    this.balls.forEach(ball => ball.update(dt));
    this.renderer.render( this.scene, this.camera );
  }
 }
 
 export { Game };