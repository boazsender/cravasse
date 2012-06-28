$(function(){
  var canvasElem = document.getElementById("world");
  var world = boxbox.createWorld(canvasElem, {
    gravity: 20,
    scale: 9,
      
  });

  world.camera({x: -1.5, y: -10});
    
  var terrainSpawner = function( x, y, w, h, name) {
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
      color: 'black',
    });
  };
    
  terrainSpawner(2, 0, 1, 30, 'leftwall');
  terrainSpawner(28, 0, 1, 30, 'rightwall');
  terrainSpawner(14, 15, 50, 2, 'floor');

  var player = world.createEntity({
    name: 'player',
    type: 'dynamic',
    color: 'black',
    shape: 'square',
    x: 4,
    y: 2,
    width: 1,
    height: 1,
    density: 0,
    fixedRotation: true,
    friction: 2,
    restitution: 0
      
  });

  player.onKeydown(function( e ){
    var movementForce = 18;
    var impulseForce = 13;
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
    if( p.y < 4 ) {
      this.camera({x: -1.5, y: player.position().y - 5});
    }
 });

});