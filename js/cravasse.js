$(function(){
  Kinvey.init({
    appKey: 'kid1960',
    appSecret: '9266577f88fa48a1a4fb99557d1f5c95'
  });
  
  var inputState = {
    left: false,
    right: false,
    up: false
  };
  
  var canvasElem = document.getElementById("world");
  var world = boxbox.createWorld(canvasElem, {
    // collisionOutlines: true,
    gravity: 60,
    scale: 30
  });

  world.camera({x: 0, y: -7});
    
  var terrainSpawner = function( x, y, w, h, name, color, active, image) {
    if(active !== false) {
      active = true;
    }
    var obstacle = world.createEntity({
      name: name || 'terrain-' + Math.random(),
      type: 'static',
      shape: 'square',
      restitution: 0,
      density: 0.5,
      friction: 1,
      x: x,
      y: y,
      width: w,
      height: h,
      color: color || 'black',
      borderWidth: 0,
      image: image || false,
      active: active
    });
  };

  var kickoff = function(){
    // Generate the walls
    terrainSpawner(0, -200, 0.3, 430, 'leftwall');
    terrainSpawner(16, -200, 0.3, 430, 'rightwall');
    terrainSpawner(0, 14, 96, 2, 'floor');
  
    // Generate the clouds
    terrainSpawner(6, 1, 9, 3, 'floor', 'pink', false, 'img/cloud2.png');
    for(var i = 1; i < 100; i++){ 
      terrainSpawner(2,  -Math.abs(i*11), 6, 3, 'floor', 'pink', false, 'img/cloud1.png');
      terrainSpawner(8, -Math.abs(i*31), 9, 3, 'floor', 'pink', false, 'img/cloud2.png');
      terrainSpawner(8,  -Math.abs(i*43), 6, 3, 'floor', 'pink', false, 'img/cloud3.png');
      terrainSpawner(5,  -Math.abs(i*53), 9, 3, 'floor', 'pink', false, 'img/cloud4.png');
    }
  
  
    var player = world.createEntity({
      name: 'player',
      type: 'dynamic',
      color: 'black',
      friction: 1,
      density: 0,
      restitution: 0,
      x: 5,
      y: 7,
      width: 1.1,
      height: 2.6,
      imageOffsetX: -0.8,
      imageOffsetY: -1.2,
      image: 'img/player.png',
      spriteSheet:true,
      spriteWidth: 96,
      spriteHeight: 96,
      fixedRotation: true
    });
  
    player.kill = function( x, y ) {
      player.destroy();
      var deadPlayer = world.createEntity({
        name: 'deadPlayer',
        type: 'static',
        color: 'black',
        x: this.position().x,
        y: this.position().y,
        width: 2.6,
        height: 1.1,
        imageOffsetX: -0.8,
        imageOffsetY: -0.8,
        fixedRotation: true,
        friction: 12,
        density: 1,
        restitution: 0,
        spriteSheet:true,
        image: 'img/player.png',
        spriteWidth: 96,
        spriteHeight: 96,
        spriteX: 0,
        spriteY: 0
      });
    
      for(var i = 1; i < 5; i++){
        deadPlayer.sprite(i, 2);
      }

      var coords = {
        x: this.position().x,
        y: this.position().y
      };

      var entity = new Kinvey.Entity({
          coords: coords
      }, 'dead-bodies');
    
      entity.save();

      player.killed = true;
    };

    var force = 300;
    player.lastShot = Date.now();

    player.onKeydown(function( e ){
      // Jump
      if( this.contact && this.jumps < 2 ) {
        if (e.keyCode === 38) {
          this.jumps++;
          this.applyImpulse( 40 );
          inputState.up = true;
        }
      }

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
      
      // Shoot
      if (e.keyCode === 32) {
        if( (player.lastShot + 1000) < Date.now() ){
          player.lastShot = Date.now();
          var bullet = world.createEntity({
            name: 'bullet',
            type: 'dynamic',
            shape: 'square',
            restitution: 0,
            density: 0.5,
            x: player.position().x,
            y: player.position().y,
            width: 0.1,
            height: 0.1,
            color: 'black'
          });

          bullet.applyImpulse( 50 );
          window.bul = bullet;
          bullet.onRender(function(){
            if ( this.position().y < (world.camera().y - 10) ) {
              this.destroy()
            }
          })
          bullet.onImpact(function( entity, normalForce, tangentialForce ){
            if( entity.name().indexOf("dead-player") === 0 ){
              entity.destroy();
              this.destroy();
              entity._kinveyEntity.destroy();
            }
          });
        }
      }
    });

    // var event = document.createEvent("KeyboardEvent");
    // event.keyCode = 39;
    // event.initEvent('keydown', true, true);
    // window.dispatchEvent(event)

    // $("#right").on('click', function(){
    //   player.setForce('movement', force, 90);
    //   inputState.right = true;
    //   player.lastDirection = 'right';
    // });
    // 
    // $("#jump").on('click', function(){
    //   player.jumps++;
    //   player.applyImpulse( 50 );
    //   inputState.up = true;
    // });
    // 
    // $("#left").on('click', function(){
    //   player.setForce('movement', force, 270);
    //   inputState.left = true;
    //   player.lastDirection = 'left';
    // });

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
      if (e.keyCode === 38) {
        inputState.up = false;
      }
    });

    // Player sprites
    var frameCounter = 0;
    player.lastPos = {};
    player.onRender(function(){
      
      var playerPos = player.position();
      var playerLastPos = player.lastPos;
        
      var playerDistFromBottom = Math.abs( world.camera().y - player.position().y );
      window.dist = playerDistFromBottom;
      
      if( playerPos.y < 0.4 ) {
        if( playerPos.y < playerLastPos.y && playerDistFromBottom < 10) {
          world.camera({x: 0, y: playerPos.y - (playerDistFromBottom) });
        }
      }

      frameCounter++;
      if( frameCounter > 6 ) {
        frameCounter = 0;
      }
      if( inputState.left ) {
        if(!this.contact){
          player.sprite( 1, 0 );
        } else {
          player.sprite( frameCounter, 0 );
        }
      }
      if( inputState.right ) {
        if(!this.contact){
          player.sprite( 1, 1 );
        } else {
          player.sprite( frameCounter, 1);
        }
      }
      // kill the player if they fall off the screen
      if(world.canvasPositionAt(player.position().x, player.position().y).y > 610) {
        if( player.killed !==true) {
          player.kill();
        }
      }
      player.lastPos = this.position();
    });

    player.onStartContact(function( e ){
      this.contact = true;
      this.jumps = 0;
    });

    player.onFinishContact(function( e ){
      this.contact = false;
    });

    var lastPos = 0;
    window.world = world;
    window.player = player;
  };

  var collection = new Kinvey.Collection('dead-bodies');
  collection.fetch({
    success: function(list) {
      for (var i in list ){
        var deadPlayer = world.createEntity({
          name: 'dead-player-' + i,
          type: 'static',
          x: list[i].attr.coords.x,
          y:  list[i].attr.coords.y,
          width: 2.4,
          height: 1,
          imageOffsetX: -0.7,
          imageOffsetY: -0.8,
          restitution: 0,
          spriteSheet:true,
          image: 'img/player.png',
          spriteWidth: 96,
          spriteHeight: 96
        });
        deadPlayer._kinveyEntity = list[i];
        deadPlayer.sprite(4, 2);
      }
      kickoff();
    }
  });
});