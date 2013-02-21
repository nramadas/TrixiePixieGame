var PG = (function () {

  var Game = function (context) {
    var that = this;

    this.pixie = new Pixie();
    this.context = context;
    this.mushrooms = (function() {
      return [Mushroom.randomMushroom()];
    })();

    this.start = function() {
      var t = setInterval(function() {
        if(key.isPressed(38)) { // up
          that.pixie.startJump();
        }
        if(key.isPressed(37)) { // left
          that.pixie.move('left');
        }
        if(key.isPressed(39)) { // right
          that.pixie.move('right');
        }

        for (var i = 0; i < that.mushrooms.length; i++) {
          that.pixie.collide(that.mushrooms[i]);
        };

        that.pixie.update();
        that.draw();
      }, 3);
    };

    this.draw = function() {
      that.context.clearRect(0,0,Game.xSize,Game.ySize);
      var img = new Image();
      img.src = '../assets/grass.png';
      for (var i=0; i < 10; i++){
        that.context.drawImage(img, (i*200), Game.ySize - 200, 200, 200);
      };

      that.pixie.draw(that.context);
      for (var i = 0; i < that.mushrooms.length; i++) {
        that.mushrooms[i].draw(that.context);
      };
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

    this.draw = function(context) {
      var img = new Image();
      img.src = '../assets/pixie.png';
      context.drawImage(img, that.posX, that.posY - 60);
    };

    this.move = function (dir) {
      if (dir == "right") {
        that.deltaX = 5;
      } else {
        that.deltaX = -5;
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
            // that.altitude = -20;
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

      that.posX += that.deltaX;
      that.deltaX = 0;
      that.posY = that.flatY - that.altitude;
    }

    this.collide = function (obj) {
      // console.log(that.deltaX);
      // console.log(that.posX);
      // console.log(obj.posX);
      if ((((this.deltaX + this.posX) > (obj.posX)) && ((this.deltaX + this.posX - 20) < (obj.posX + obj.width))) && (this.posY == obj.posY)) {
        that.deltaX = 0;
      }
    }
  };

  var Mushroom = function (x) {
    var that = this;

    this.posX = x;
    this.posY = Game.ySize - 200;
    this.width = 20;
    this.height = 20;

    this.draw = function (context) {
      var img = new Image();
      img.src = '../assets/mushroom.png';
      context.drawImage(img, that.posX, that.posY - 60);
    }
  };

  Mushroom.randomMushroom = function() {
    var rand = (Math.random() * 500) + 300;
    return (new Mushroom(rand));
  };

  return {
    Pixie: Pixie,
    Game: Game,
    Mushroom: Mushroom
  };

})();

var loader = function() {
  // console.log(context);

  PG.Game.xSize = document.body.clientWidth;
  PG.Game.ySize = document.body.clientHeight;

  var canvas = document.getElementById('canvas');

  console.log(PG.Game.xSize);
  console.log(PG.Game.ySize);

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

    g.pixie.flatY = Game.ySize - 200;
  };

  console.log(PG.Game.xSize);


};