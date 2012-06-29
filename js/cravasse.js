$(function(){
  var canvasElem = document.getElementById("world");
  var world = boxbox.createWorld(canvasElem, {
    gravity: 30,
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
    
  terrainSpawner(0, 0, .3, 430, 'leftwall');
  terrainSpawner(16, 0, .3, 430, 'rightwall');
  terrainSpawner(0, 14, 32, 2, 'floor');
  
  terrainSpawner(6, 1, 3, 1, 'floor', 'pink', false, 'img/cloud2.gif');
  
  for(var i = 1; i < 100; i++){ 
    terrainSpawner(2,  -Math.abs(i*11), 1.5, 1, 'floor', 'pink', false, 'img/cloud.gif');
    terrainSpawner(13, -Math.abs(i*17), 3, 1, 'floor', 'pink', false, 'img/cloud2.gif');
    terrainSpawner(8,  -Math.abs(i*23), 1.5, 1, 'floor', 'pink', false, 'img/cloud.gif');
    terrainSpawner(5,  -Math.abs(i*31), 3, 1, 'floor', 'pink', false, 'img/cloud2.gif');
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
    shape: 'square',
    x: 4,
    y: -5,
    width: .5,
    height: .5,
    density: 0,
    fixedRotation: true,
    friction: 2,
    restitution: 0
      
  });

  player.onKeydown(function( e ){
    var movementForce = 13;
    var impulseForce = 18;
    // Left
    if (e.keyCode === 39) {
      this.setForce( 'movement', movementForce, 1 * movementForce, 0);
    }

    // Right
    if (e.keyCode === 37) {
      this.setForce( 'movement', movementForce, -1 * movementForce, 0);
    }
      

    // Jump
    if( this.contact && this.jumps < 2 ) {

      if (e.keyCode === 32 || 38) {
        this.jumps++
        this.applyImpulse( impulseForce, 0);
      }
    }
  });

  player.onKeyup(function( e ){
    player.clearForce( 'movement' );
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
    if( p.y < 0 ) {
      this.camera({x: 0, y: p.y - 7 });
    }
    
  });

});