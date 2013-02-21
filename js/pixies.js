var PG = (function () {

  var Game = function (context) {
    var that = this;

    this.pixie = new Pixie();
    this.context = context;
    this.mushrooms = (function() {
      temp = [];
      for (var i = 0; i < 10; i++) {
        temp.push(Mushroom.randomMushroom());
      };
      return temp;
    })();
    this.starfire = [];
    this.werebears = [];
    this.werebearCounter = 0;
    this.pixieDust = null;

    this.resize = function() {
      that.pixie.flatY = Game.ySize - 200;
      that.mushrooms.forEach(function (shroom) {
        shroom.posY = Game.ySize - 200;
      });
      that.werebears.forEach(function (bear) {
        bear.posY = Game.ySize - 200;
      });
      if (that.pixieDust) {
        that.pixieDust.posY = Game.ysize - 400;
      }
    };

    this.start = function() {
      var werebearFrequency = 150;
      var werebearCountdown = werebearFrequency;

      var pixieDustCountdown = 400;
      var pixieDustPowerupCountdown = 350;

      key('w', function() {
        that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                        that.pixie.posY + that.pixie.offSetY,
                                        0, -8));
      });
      key('a', function() {
        that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                        (that.pixie.posY + that.pixie.offSetY),
                                        -8, 0));
      });
      key('s', function() {
        that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                        that.pixie.posY + that.pixie.offSetY,
                                        0, 8));
      });
      key('d', function() {
        that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                        (that.pixie.posY + that.pixie.offSetY),
                                        8, 0));
      });
      key('p', function() {
        that.pixie.onPixieDust = true;
      });

      var t = setInterval(function() {
        werebearCountdown--;
        pixieDustCountdown--;

        if((pixieDustCountdown <= 0) && (!that.pixieDust)) {
          that.genPixiedust();
          // that.pixie.onPixieDust = true;
          pixieDustCountdown = (Math.random() * 500) + 1200;
        }

        if(werebearCountdown <= 0) {
          werebearFrequency -= 1;
          werebearCountdown = werebearFrequency;
          that.genWerebear();
        }
        if(key.isPressed(38)) { // up
          that.pixie.startJump();
        }
        if(key.isPressed(37)) { // left
          that.pixie.move('left');
        }
        if(key.isPressed(39)) { // right
          that.pixie.move('right');
        }

        if (that.pixie.onPixieDust) {
          pixieDustPowerupCountdown--;
          if(pixieDustPowerupCountdown > 0) {
            if(pixieDustPowerupCountdown % 5 == 0) {
              that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                            that.pixie.posY + that.pixie.offSetY,
                                            0, -8));
              that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                              (that.pixie.posY + that.pixie.offSetY),
                                              -8, 0));
              that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                              that.pixie.posY + that.pixie.offSetY,
                                              0, 8));
              that.starfire.push(new StarFire(that.pixie.posX + that.pixie.offSetX,
                                              (that.pixie.posY + that.pixie.offSetY),
                                              8, 0));
            }
          } else {
            that.pixie.onPixieDust = false;
            pixieDustPowerupCountdown = 350;
          }

        }

        that.update(t);

        that.draw();
      }, 3);
    };

    this.hit = function (obj1, obj2) {
      return ((((obj1.posX >= obj2.posX) && (obj1.posX < obj2.posX + obj2.width)) ||
               ((obj1.posX + obj1.width >= obj2.posX) && (obj1.posX + obj1.width < obj2.posX + obj2.width))) &&
              (((obj1.posY <= obj2.posY) && (obj1.posY > obj2.posY - obj2.height)) ||
               ((obj1.posY - obj1.height <= obj2.posY) && (obj1.posY - obj1.height > obj2.posY - obj2.height))));
    };

    this.update = function(t) {
      var collisionDetection = function (array, fun) {
        for (var i = 0; i < array.length; i++) {
          fun(array[i]);
        };
      }

      collisionDetection(that.mushrooms, function(shroom) {
        that.pixie.collide(shroom);
      });
      collisionDetection(that.werebears, function(enemy) {
        if(that.hit(that.pixie, enemy)) {
          alert("You Lose!");
          clearInterval(t);
        }
      });

      if(that.pixieDust) {
        if(that.hit(that.pixie, that.pixieDust)) {
          that.pixieDust = null;
          that.pixie.onPixieDust = true;
        }
      }

      for (var i = 0; i < that.werebears.length; i++) {
        for (var j = 0; j < that.starfire.length; j++) {
          if (that.hit(that.starfire[j], that.werebears[i])) {
            that.werebears.splice(i, 1);
            that.starfire.splice(j, 1);
            break;
          }
        }
      }

      that.pixie.update();

      var updateHelper = function(array) {
        for (var i = 0; i < array.length; i++) {
          array[i].update();
          if((array[i].posX < 0) || (array[i].posX > Game.xSize)) {
            array.splice(i,1);
          } else if((array[i].posY < 0) || (array[i].posY > Game.ySize - 200)) {
            array.splice(i,1);
          }
        };
      }

      updateHelper(that.starfire);
      updateHelper(that.werebears);
      if(that.pixieDust) {
        updateHelper([that.pixieDust]);
      }
    };

    this.draw = function() {
      that.context.clearRect(0,0,Game.xSize,Game.ySize);
      var img = new Image();
      img.src = '../assets/grass.png';
      for (var i=0; i < 10; i++){
        that.context.drawImage(img, (i*200), Game.ySize - 200, 200, 200);
      };

      that.pixie.draw(that.context);

      var drawHelper = function(array) {
        for (var i = 0; i < array.length; i++) {
          array[i].draw(that.context);
        };
      };

      drawHelper(that.mushrooms);
      drawHelper(that.starfire);
      drawHelper(that.werebears);
      if (that.pixieDust) {
        that.pixieDust.draw(that.context);
      }
    };

    this.genWerebear = function () {
      var random = Math.floor(Math.random() * 10) - 5;
      that.werebears.push(new Werebear(random));
    };

    this.genPixiedust = function () {
      var random = Math.floor(Math.random() - 0.5);
      if(random) {
        that.pixieDust = new PixieDust(5);
      } else {
        that.pixieDust = new PixieDust(-5);
      }
    };
  };

  Game.xSize = 1000;
  Game.ySize = 1000;

  var Pixie = function () {
    var that = this;

    this.posX = 200;
    this.posY = Game.ySize - 200;
    this.flatY = Game.ySize - 200;
    this.deltaX = 0;
    this.jump = false;
    this.altitude = 0;
    this.jumpAmount = 20;
    this.jumpDirection = 'up';
    this.direction = "right";
    this.offSetX = 40;
    this.offSetY = -30;
    that.width = 49;
    that.height = 60;
    that.onPixieDust = false;

    this.draw = function(context) {
      if (that.direction == "left") {
        var img = new Image();
        img.src = "../assets/pixieL.png";
        context.drawImage(img, that.posX, that.posY - 60);
        that.offSetX = 5;
      } else {
        var img = new Image();
        img.src = '../assets/pixie.png';
        context.drawImage(img, that.posX, that.posY - 60);
        that.offSetX = 40;
      }
    };

    this.move = function (dir) {
      if (dir == "right") {
        that.deltaX = 5;
        that.direction = "right";
      } else {
        that.deltaX = -5;
        that.direction = "left";
      }
    };

    this.startJump = function () {
      that.jump = true;
    };

    this.update = function () {
      if (that.jump) {
        if (that.jumpDirection == 'up') {
          that.altitude += that.jumpAmount;
          that.jumpAmount -= 1;
          if(that.altitude >= 210) {
            that.jumpDirection = 'down';
          }
        } else {
          that.altitude -= that.jumpAmount;
          that.jumpAmount += 1;
          if(that.altitude <= 0) {
            that.jumpDirection = 'up';
            that.jump = false;
            that.posY = that.flatY;
            that.jumpAmount = 20;
            that.altitude = 0;
          }
        }
      }

      that.posX = (that.posX + that.deltaX + Game.xSize) % Game.xSize;
      that.deltaX = 0;
      that.posY = that.flatY - that.altitude;
    };

    this.collide = function (obj) {
      if ((((this.deltaX + this.posX + obj.leftBound) > (obj.posX))
        && ((this.deltaX + this.posX - obj.rightBound) < (obj.posX + obj.width)))
        && (this.posY == obj.posY)) {
        that.deltaX = 0;
        console.log("here");
      }
    };
  };

  var StarFire = function (x, y, dX, dY) {
    var that = this;
    this.posX = x;
    this.posY = y;
    this.deltaX = dX;
    this.deltaY = dY;
    this.width = 15;
    this.height = 15;

    this.update = function() {
      that.posX += that.deltaX;
      that.posY += that.deltaY;
    };

    this.draw = function (context) {
      function drawStar(ctx,cx,cy,spikes,r0,r1) {
        var rot=Math.PI/2*3,x=cx,y=cy,step=Math.PI/spikes
        var rand = function () { return (Math.floor(Math.random() * 122) + 133); }
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + rand() + "," + rand() + "," + rand() + ",0.9)";
        ctx.moveTo(cx,cy-r0)
        for(i=0;i<spikes;i++){
          x=cx+Math.cos(rot)*r0;
          y=cy+Math.sin(rot)*r0;
          ctx.lineTo(x,y)
          rot+=step

          x=cx+Math.cos(rot)*r1;
          y=cy+Math.sin(rot)*r1;
          ctx.lineTo(x,y)
          rot+=step
        }
        ctx.lineTo(cx,cy-r0)
        ctx.fill();
        ctx.closePath();

      }
      drawStar(context, that.posX + 5, that.posY + 2, 5, 5, 10);
      drawStar(context, that.posX, that.posY - 5, 5, 5, 10);
      drawStar(context, that.posX - 5, that.posY - 2, 5, 5, 10);
    };
  };

  var Werebear = function (dX) {
    var that = this;
    this.posX = (dX < 0) ? Game.xSize : 0;
    this.posY = Game.ySize - 200;
    this.deltaX = dX;
    this.width = 60;
    this.height = 80;

    this.draw = function(context) {
      if (that.deltaX < 0) {
        var img = new Image();
        img.src = "../assets/werebearL.png";
        context.drawImage(img, that.posX, that.posY - that.height);
      } else {
        var img = new Image();
        img.src = '../assets/werebear.png';
        context.drawImage(img, that.posX, that.posY - that.height);
      }
    };

    this.update = function () {
      this.posX += this.deltaX;
    };

  }

  var PixieDust = function (dX) {
    var that = this;
    this.posX = (dX < 0) ? Game.xSize : 0;
    this.posY = Game.ySize - 400;
    this.deltaX = dX;
    this.width = 40;
    this.height = 40;

    this.draw = function(context) {
      var img = new Image();
      img.src = "../assets/pixiedust.png";
      context.drawImage(img, that.posX, that.posY - 80);
    };

    this.update = function () {
      this.posX += this.deltaX;
    };
  }

  var Mushroom = function (x) {
    var that = this;

    this.posX = x;
    this.posY = Game.ySize - 200;
    this.width = 20;
    this.height = 20;
    this.leftBound = 38;
    this.rightBound = 10;

    this.draw = function (context) {
      var img = new Image();
      img.src = '../assets/mushroom.png';
      context.drawImage(img, that.posX, that.posY - 60);
    };
  };

  Mushroom.randomMushroom = function() {
    var rand = (Math.random() * Game.xSize);
    return (new Mushroom(rand));
  };

  return {
    Pixie: Pixie,
    Game: Game,
    Mushroom: Mushroom
  };

})();

var loader = function() {

  PG.Game.xSize = document.body.clientWidth;
  PG.Game.ySize = document.body.clientHeight;

  var canvas = document.getElementById('canvas');

  canvas.setAttribute('width', PG.Game.xSize);
  canvas.setAttribute('height', PG.Game.ySize);

  var context = canvas.getContext('2d');

  var g = new PG.Game(context);
  g.start();

  window.onresize = function () {
    PG.Game.xSize = document.body.clientWidth;
    PG.Game.ySize = document.body.clientHeight;

    canvas.setAttribute('width', PG.Game.xSize);
    canvas.setAttribute('height', PG.Game.ySize);

    g.resize();
  };
};