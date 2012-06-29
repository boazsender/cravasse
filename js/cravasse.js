$(function(){
  var inputState = {
    left: false,
    right: false,
    up: false
  };
  var canvasElem = document.getElementById("world");
  var world = boxbox.createWorld(canvasElem, {
    gravity: 40,
    scale: 30
  });

  world.camera({x: 0, y: -7});
    
  var terrainSpawner = function( x, y, w, h, name, color, active, image) {
    if(active !== false) {
      var active = true
    }
    var obstacle = world.createEntity({
      name: name || 'terrain-' + Math.random(),
      type: 'static',
      color: 'black',
      shape: 'square',
      restitution: 0,
      density: .5,
      x: x,
      y: y,
      width: w,
      height: h,
      color: color || 'black',
      borderWidth: 0,
      image: image || false,
      imageStretchToFit: true,
      active: active
    });
  };
    
  terrainSpawner(0, -200, .3, 430, 'leftwall');
  terrainSpawner(16, -200, .3, 430, 'rightwall');
  terrainSpawner(0, 14, 32, 2, 'floor');
  
  terrainSpawner(6, 1, 9, 3, 'floor', 'pink', false, 'img/cloud2.png');
  
  for(var i = 1; i < 100; i++){ 
    terrainSpawner(2,  -Math.abs(i*11), 6, 3, 'floor', 'pink', false, 'img/cloud1.png');
    terrainSpawner(8, -Math.abs(i*31), 9, 3, 'floor', 'pink', false, 'img/cloud2.png');
    terrainSpawner(8,  -Math.abs(i*43), 6, 3, 'floor', 'pink', false, 'img/cloud3.png');
    terrainSpawner(5,  -Math.abs(i*53), 9, 3, 'floor', 'pink', false, 'img/cloud4.png');
  }
  
  
  world.onRender(function(ctx) {
    var p = player.position();
    var c = this.camera();
    if( p.y < -7 ) {
      this.camera({x: 0, y: p.y - 7 });   
    }
  });

  var player = world.createEntity({
    name: 'player',
    type: 'dynamic',
    color: 'black',
    x: 4,
    y: 1,
    width: 2,
    height: 2,
    imageStretchToFit: true,
    fixedRotation: true,
    friction: 12,
    density: 1,
    restitution: 0,
    spriteSheet:true,
    image: 'img/player.png',
    spriteWidth: 32,
    spriteHeight: 32,
    spriteX: 0,
    spriteY: 0
  });

  var force = 600;

  player.onKeydown(function( e ){
    
    // Right
    if (e.keyCode === 39) {
      this.setForce('movement', force, 90);
      inputState.right = true;
      player.lastDirection = 'right';
    }

    // Left
    if (e.keyCode === 37) {
      this.setForce('movement', force, 270);
      inputState.left = true;
      player.lastDirection = 'left';
    }
      
    // Jump
    if( this.contact && this.jumps < 2 ) {

      if (e.keyCode === 32 || 38) {
        this.jumps++
        this.applyImpulse( 50 );
        inputState.up = true;
      }
    }
  });

  // var event = document.createEvent("KeyboardEvent");
  // event.keyCode = 39;
  // event.initEvent('keydown', true, true);
  // window.dispatchEvent(event)

  $("#right").on('click', function(){
    player.setForce('movement', force, 90);
    inputState.right = true;
    player.lastDirection = 'right';
  });

  $("#jump").on('click', function(){
    player.jumps++
    player.applyImpulse( 50 );
    inputState.up = true;
  });

  $("#left").on('click', function(){
    player.setForce('movement', force, 270);
    inputState.left = true;
    player.lastDirection = 'left';
  });

  player.onKeyup(function( e ){
    player.clearForce( 'movement' );
    if( player.lastDirection === 'right' ){
      player.sprite( 0, 1 );
    } else {
      player.sprite( 0, 0 );
    }

    // Right
    if (e.keyCode === 39) {
      inputState.right = false;
    }

    // Left
    if (e.keyCode === 37) {
      inputState.left = false;
    }
    
    // Jump
    if (e.keyCode === 32 || 38) {
      inputState.up = false;
    }
  });

  var frameCounter = 0
  player.onRender(function(){
    frameCounter++
    if( frameCounter > 6 ) {
      frameCounter = 0;
    }
    if( inputState.left ) {
      if(!this.contact){
        player.sprite( 1, 0 )
      } else {
        player.sprite( frameCounter, 0 );
      }
    }
    if( inputState.right ) {
      if(!this.contact){
        player.sprite( 1, 1 )
      } else {
        player.sprite( frameCounter, 1);
      }
    }
  });


  player.onStartContact(function( e ){
    this.contact = true;
    this.jumps = 0;
  });

  player.onFinishContact(function( e ){
    this.contact = false;
  });

  player.onImpact(function( entity, force, friction ){
    if( force > 80 && entity._ops.type !== 'static' && entity.name !== 'obstacle'){
      player.destroy()
    }
  })

  world.onRender(function(ctx) {
    var p = player.position();
    var c = this.camera();
    if( p.y < .4 ) {
      this.camera({x: 0, y: p.y - 7 });
    }
    
  });
  window.player = player;
});