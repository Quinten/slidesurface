/**
 *    ____|
 *     |__|__
 *     | 
 */

var surface = { 
  maxImageSize: 0,
  iWidth: 0,
  iHeight: 0,
  gridWidth: 0,
  gridHeight: 0, 
  clips: [], 
  nClips: 12, 
  nLoaded: 0,
  currentClip: undefined,
  display: {},
  poster: {},
  thumbs: {},
  thumbSize: 64,
  topLeftT: { sx: 0, sy: 0, sw: 0, sh: 0, dx:0, dy:0 },
  topRightT: { sx: 0, sy: 0, sw: 0, sh: 0, dx:0, dy:0 },
  bottomLeftT: { sx: 0, sy: 0, sw: 0, sh: 0, dx:0, dy:0 },
  bottomRightT: { sx: 0, sy: 0, sw: 0, sh: 0, dx:0, dy:0 },
  diafragm: { x1: 0, y1: 0, x2: 0, y2: 0, xHome1: 0, yHome1: 0, xHome2: 0, yHome2: 0 },
  fadeCount: 180
}, SF = surface;

SF.onF = function () { };

SF.onC = undefined;

SF.load = function ( images ) {
  // check if the window object knows it's dimensions else start again
  if (!window.innerWidth) {
    setTimeout(SF.load, 500, images);
    return;
  }
  SF.maxImageSize = (window.innerWidth < window.innerHeight) ? window.innerWidth : window.innerHeight;
  SF.iWidth = window.innerWidth;
  SF.iHeight = window.innerHeight;
  
  // setup the main display canvas
  SF.display.canvas = document.createElement('canvas');
  SF.display.context = SF.display.canvas.getContext('2d');
  SF.display.canvas.width = window.innerWidth;
  SF.display.canvas.height = window.innerHeight;
  document.body.appendChild(SF.display.canvas);
  SF.display.context.translate(SF.display.canvas.width/2, SF.display.canvas.height/2);
  // setup a poster buffer canvas
  SF.poster.canvas = document.createElement('canvas');
  SF.poster.context = SF.poster.canvas.getContext('2d');
  SF.poster.canvas.width = SF.maxImageSize;
  SF.poster.canvas.height = SF.maxImageSize;
  // setup a thumbs buffer canvas
  SF.thumbs.canvas = document.createElement('canvas');
  SF.thumbs.context = SF.thumbs.canvas.getContext('2d');
  
  // set props for the preloader animation
  SF.display.context.fillStyle = "#ffffff";
  SF.display.context.strokeStyle = "#ffffff";
  SF.display.context.font = "48px sans-serif";
  SF.display.context.textAlign = "center";
  SF.display.context.textBaseline = "middle";
  
  // preload the images
  SF.nClips = images.length;
  SF.onF = SF.preloop;
  SF.onF();
  for ( var i = 0; i < images.length; i++ ) {
    SF.clips[i] = { x: 0, y: 0, width: 0, height: 0, scale: 1 };
    SF.clips[i].img = new Image();
    SF.clips[i].img.clip = SF.clips[i];
    SF.clips[i].img.onload = function () {
      // set size of the clip
      if ( this.width > this.height ) {
        this.clip.width = ( this.width > SF.maxImageSize ) ? SF.maxImageSize : this.width;
        this.clip.height = this.clip.width * this.height / this.width;
      } else {
        this.clip.height = ( this.height > SF.maxImageSize ) ? SF.maxImageSize : this.height;
        this.clip.width = this.clip.height * this.width / this.height;        
      }
      this.clip.scale = this.clip.width / this.width;
      // check if everything is loaded and start
      SF.nLoaded++;
      if ( SF.nLoaded === SF.nClips ) {
        SF.start();
      }
    };
    SF.clips[i].img.src = images[i];
  }
};

SF.resize = function () {
  if ( SF.iWidth !== window.innerWidth || SF.iHeight !== window.innerHeight ) {
    SF.display.context.translate(-SF.display.canvas.width/2, -SF.display.canvas.height/2);
    SF.display.canvas.width = SF.iWidth = window.innerWidth;
    SF.display.canvas.height = SF.iHeight = window.innerHeight;
    SF.display.context.translate(SF.display.canvas.width/2, SF.display.canvas.height/2);
  }  
}

SF.preloop = function () {
  window.requestAnimationFrame(SF.onF, SF.display.canvas);
  SF.resize();
  // draw
  SF.display.context.clearRect(-SF.display.canvas.width/2, -SF.display.canvas.height/2, SF.display.canvas.width, SF.display.canvas.height);
  var angle = - (Math.PI / 2) + ((SF.nLoaded/SF.nClips) * Math.PI * 2);
  SF.display.context.beginPath();
  SF.display.context.moveTo(0, -48);
  SF.display.context.lineTo(0, 0);
  if ( angle < -Math.PI * .25 ) {
   SF.display.context.lineTo(Math.cos(angle) * 48, -48);
   SF.display.context.lineTo(48, -48);
   SF.display.context.lineTo(48, 48);
   SF.display.context.lineTo(-48, 48);
   SF.display.context.lineTo(-48, -48); 
  }else if ( angle < Math.PI * .25 ) {
   SF.display.context.lineTo(48, Math.sin(angle) * 48);
   SF.display.context.lineTo(48, 48);
   SF.display.context.lineTo(-48, 48);
   SF.display.context.lineTo(-48, -48); 
  }else if ( angle < Math.PI * .75 ) {
   SF.display.context.lineTo(Math.cos(angle) * 48, 48);
   SF.display.context.lineTo(-48, 48);
   SF.display.context.lineTo(-48, -48); 
  }else if ( angle < Math.PI * 1.25 ) {
   SF.display.context.lineTo(-48, Math.sin(angle) * 48);
   SF.display.context.lineTo(-48, -48); 
  }else{
   SF.display.context.lineTo(Math.cos(angle) * 48, -48); 
  }
  SF.display.context.lineTo(0, -48);
  SF.display.context.closePath();
  SF.display.context.fill();
    
  SF.display.context.globalCompositeOperation = "xor";
  SF.display.context.fillText(SF.nClips - SF.nLoaded, 0, 0);
  SF.display.context.globalCompositeOperation = "source-over";
}

SF.start = function () {
  // calculate the grid width and height
  SF.gridWidth = Math.floor(Math.sqrt(SF.nClips));
  SF.gridHeight = Math.ceil(SF.nClips / SF.gridWidth);
  SF.thumbs.canvas.width = SF.gridWidth * SF.thumbSize;
  SF.thumbs.canvas.height = SF.gridHeight * SF.thumbSize;
  // print the thumbnails to the buffer
  var gX = 0, gY = 0;
  for ( var c = 0; c < SF.nClips; c++ ) {
    var scaledThumbSize = SF.thumbSize / SF.clips[c].scale;
    SF.clips[c].x = gX * SF.thumbSize;
    SF.clips[c].y = gY * SF.thumbSize;
    SF.thumbs.context.drawImage(SF.clips[c].img, (SF.clips[c].img.width - scaledThumbSize)/2, (SF.clips[c].img.height - scaledThumbSize)/2, scaledThumbSize, scaledThumbSize, SF.clips[c].x, SF.clips[c].y, SF.thumbSize, SF.thumbSize);
    gX++;
    if (gX === SF.gridWidth) {
      gX = 0;
      gY++;
    }
  }
  // set T (a thumb collection) temporary
  SF.topLeftT.sx = 0;
  SF.topLeftT.sy = 0;
  SF.topLeftT.sw = SF.thumbs.canvas.width;
  SF.topLeftT.sh = SF.thumbs.canvas.height;
  SF.topLeftT.dx = -SF.thumbs.canvas.width / 2;
  SF.topLeftT.dy = -SF.thumbs.canvas.height / 2;
  SF.diafragm.x1 = SF.diafragm.xHome1 = SF.thumbs.canvas.width / 2;
  SF.diafragm.y1 = SF.diafragm.yHome1 = SF.thumbs.canvas.height / 2;
  SF.diafragm.x2 = SF.diafragm.xHome2 = SF.thumbs.canvas.width / 2;
  SF.diafragm.y2 = SF.diafragm.yHome2 = SF.thumbs.canvas.height / 2;
  SF.display.canvas.addEventListener('click', SF.click, false);
  SF.onF = SF.loop;
};

SF.click = function (e) {
  var x, y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= SF.display.canvas.offsetLeft;
  y -= SF.display.canvas.offsetTop;
  x -= SF.display.canvas.width/2;
  y -= SF.display.canvas.height/2;
  var hitT = undefined;
  if ( (x > SF.topLeftT.dx) && (x < (SF.topLeftT.dx + SF.topLeftT.sw)) && (y > SF.topLeftT.dy) && (y < (SF.topLeftT.dy + SF.topLeftT.sh)) ) {
    x = SF.topLeftT.sx + (x - SF.topLeftT.dx);
    y = SF.topLeftT.sy + (y - SF.topLeftT.dy);
    hitT = SF.topLeftT;
  } else if ( (x > SF.topRightT.dx) && (x < (SF.topRightT.dx + SF.topRightT.sw)) && (y > SF.topRightT.dy) && (y < (SF.topRightT.dy + SF.topRightT.sh)) ) {
    x = SF.topRightT.sx + (x - SF.topRightT.dx);
    y = SF.topRightT.sy + (y - SF.topRightT.dy);
    hitT = SF.topRightT;
  } else if ( (x > SF.bottomLeftT.dx) && (x < (SF.bottomLeftT.dx + SF.bottomLeftT.sw)) && (y > SF.bottomLeftT.dy) && (y < (SF.bottomLeftT.dy + SF.bottomLeftT.sh)) ) {
    x = SF.bottomLeftT.sx + (x - SF.bottomLeftT.dx);
    y = SF.bottomLeftT.sy + (y - SF.bottomLeftT.dy);
    hitT = SF.bottomLeftT;
  } else if ( (x > SF.bottomRightT.dx) && (x < (SF.bottomRightT.dx + SF.bottomRightT.sw)) && (y > SF.bottomRightT.dy) && (y < (SF.bottomRightT.dy + SF.bottomRightT.sh)) ) {
    x = SF.bottomRightT.sx + (x - SF.bottomRightT.dx);
    y = SF.bottomRightT.sy + (y - SF.bottomRightT.dy);
    hitT = SF.bottomRightT;
  }
  if ( hitT !== undefined ) {
    for ( var c = 0; c < SF.nClips; c++ ) {
      if ( (x > SF.clips[c].x) && (x < (SF.clips[c].x + SF.thumbSize)) && (y > SF.clips[c].y) && (y < (SF.clips[c].y + SF.thumbSize)) ) {
        if (SF.onF !== SF.loop) {
          SF.onF = SF.loop;
          SF.onF();
        }
        if(SF.currentClip !== undefined){
          var index = c;
          SF.onC = function () {
            SF.setCurrent(index, hitT);
          };
          // close diafragm
          SF.diafragm.xHome1 = -SF.thumbSize/2;
          SF.diafragm.yHome1 = -SF.thumbSize/2;
          SF.diafragm.xHome2 = SF.thumbSize/2;
          SF.diafragm.yHome2 = SF.thumbSize/2;
        } else {
          SF.setCurrent(c, hitT);
        }
        return;
      }
    }
  } 
  // close diafragm and stop
  SF.diafragm.xHome1 = -SF.thumbSize/2;
  SF.diafragm.yHome1 = -SF.thumbSize/2;
  SF.diafragm.xHome2 = SF.thumbSize/2;
  SF.diafragm.yHome2 = SF.thumbSize/2;
  if (SF.onF !== SF.loop) {
    SF.onF = SF.loop;
    SF.onF();
  }
  SF.onC = undefined;
}

SF.setCurrent = function ( index, hitT ) {
  SF.diafragm.x1 = hitT.dx + SF.clips[index].x - hitT.sx;
  SF.diafragm.y1 = hitT.dy + SF.clips[index].y - hitT.sy;
  SF.diafragm.x2 = SF.diafragm.x1 + SF.thumbSize;
  SF.diafragm.y2 = SF.diafragm.y1 + SF.thumbSize;
  SF.diafragm.xHome1 = -SF.thumbSize/2;
  SF.diafragm.yHome1 = -SF.thumbSize/2;
  SF.diafragm.xHome2 = SF.thumbSize/2;
  SF.diafragm.yHome2 = SF.thumbSize/2;
  SF.topLeftT.sx = 0;
  SF.topLeftT.sy = 0;
  SF.topLeftT.sw = SF.clips[index].x + SF.thumbSize;
  SF.topLeftT.sh = SF.clips[index].y;
  SF.topRightT.sx = SF.clips[index].x + SF.thumbSize;
  SF.topRightT.sy = 0;
  SF.topRightT.sw = SF.thumbs.canvas.width - SF.topRightT.sx;
  SF.topRightT.sh = SF.clips[index].y + SF.thumbSize;
  SF.bottomLeftT.sx = 0;
  SF.bottomLeftT.sy = SF.clips[index].y;
  SF.bottomLeftT.sw = SF.clips[index].x;
  SF.bottomLeftT.sh = SF.thumbs.canvas.height - SF.clips[index].y;
  SF.bottomRightT.sx = SF.clips[index].x;
  SF.bottomRightT.sy = SF.clips[index].y + SF.thumbSize;
  SF.bottomRightT.sw = SF.thumbs.canvas.width - SF.bottomRightT.sx;
  SF.bottomRightT.sh = SF.thumbs.canvas.height - SF.bottomRightT.sy;
  // paste to poster
  SF.currentClip = index;
  SF.poster.context.clearRect(-SF.poster.canvas.width/2, -SF.poster.canvas.height/2, SF.poster.canvas.width, SF.poster.canvas.height);
  SF.poster.context.drawImage(SF.clips[SF.currentClip].img, 0, 0, SF.clips[SF.currentClip].img.width, SF.clips[SF.currentClip].img.height, 0, 0, SF.clips[SF.currentClip].width, SF.clips[SF.currentClip].height);
  SF.onC = SF.opendiafragm;
}

SF.opendiafragm = function () {
  SF.diafragm.xHome1 = -SF.clips[SF.currentClip].width/2;
  SF.diafragm.yHome1 = -SF.clips[SF.currentClip].height/2;
  SF.diafragm.xHome2 = SF.clips[SF.currentClip].width/2;
  SF.diafragm.yHome2 = SF.clips[SF.currentClip].height/2;
  SF.onC = undefined;
}

SF.loop = function () {
  window.requestAnimationFrame(SF.onF, SF.display.canvas);
  SF.resize();
  // animate
  SF.diafragm.x1 += (SF.diafragm.xHome1 - SF.diafragm.x1) / 10;
  SF.diafragm.y1 += (SF.diafragm.yHome1 - SF.diafragm.y1) / 10;
  SF.diafragm.x2 += (SF.diafragm.xHome2 - SF.diafragm.x2) / 10;
  SF.diafragm.y2 += (SF.diafragm.yHome2 - SF.diafragm.y2) / 10;
  // draw
  SF.display.context.clearRect(-SF.display.canvas.width/2, -SF.display.canvas.height/2, SF.display.canvas.width, SF.display.canvas.height);
  
  if ( SF.topLeftT.sw > 0 && SF.topLeftT.sh > 0 ) {
    SF.topLeftT.dx = SF.diafragm.x2 - SF.topLeftT.sw;
    SF.topLeftT.dy = SF.diafragm.y1 - SF.topLeftT.sh;
    SF.display.context.drawImage(SF.thumbs.canvas, SF.topLeftT.sx, SF.topLeftT.sy, SF.topLeftT.sw, SF.topLeftT.sh, SF.topLeftT.dx, SF.topLeftT.dy, SF.topLeftT.sw, SF.topLeftT.sh);
  }
  
  if ( SF.topRightT.sw > 0 && SF.topRightT.sh > 0 ) {
    SF.topRightT.dx = SF.diafragm.x2;
    SF.topRightT.dy = SF.diafragm.y2 - SF.topRightT.sh;  
    SF.display.context.drawImage(SF.thumbs.canvas, SF.topRightT.sx, SF.topRightT.sy, SF.topRightT.sw, SF.topRightT.sh, SF.topRightT.dx, SF.topRightT.dy, SF.topRightT.sw, SF.topRightT.sh);
  }

  if ( SF.bottomLeftT.sw > 0 && SF.bottomLeftT.sh > 0 ) {
    SF.bottomLeftT.dx = SF.diafragm.x1 - SF.bottomLeftT.sw;
    SF.bottomLeftT.dy = SF.diafragm.y1;  
    SF.display.context.drawImage(SF.thumbs.canvas, SF.bottomLeftT.sx, SF.bottomLeftT.sy, SF.bottomLeftT.sw, SF.bottomLeftT.sh, SF.bottomLeftT.dx, SF.bottomLeftT.dy, SF.bottomLeftT.sw, SF.bottomLeftT.sh);
  }
  
  if ( SF.bottomRightT.sw > 0 && SF.bottomRightT.sh > 0 ) {
    SF.bottomRightT.dx = SF.diafragm.x1;
    SF.bottomRightT.dy = SF.diafragm.y2;  
    SF.display.context.drawImage(SF.thumbs.canvas, SF.bottomRightT.sx, SF.bottomRightT.sy, SF.bottomRightT.sw, SF.bottomRightT.sh, SF.bottomRightT.dx, SF.bottomRightT.dy, SF.bottomRightT.sw, SF.bottomRightT.sh);
  }
  
  if ( SF.currentClip != undefined && (SF.diafragm.x2 - SF.diafragm.x1) > 0 && (SF.diafragm.y2 - SF.diafragm.y1) > 0 ) {
    SF.display.context.drawImage(SF.poster.canvas, (SF.clips[SF.currentClip].width - SF.diafragm.x2 + SF.diafragm.x1)/2, (SF.clips[SF.currentClip].height - SF.diafragm.y2 + SF.diafragm.y1)/2, SF.diafragm.x2 - SF.diafragm.x1, SF.diafragm.y2 - SF.diafragm.y1, SF.diafragm.x1, SF.diafragm.y1, SF.diafragm.x2 - SF.diafragm.x1, SF.diafragm.y2 - SF.diafragm.y1);
  }
  
  // debug
  /*
  SF.display.context.fillStyle="rgba(0,255,0,0.3)";
  SF.display.context.fillRect(SF.topLeftT.dx, SF.topLeftT.dy, SF.topLeftT.sw, SF.topLeftT.sh);
  SF.display.context.fillStyle="rgba(255,0,0,0.3)";
  SF.display.context.fillRect(SF.topRightT.dx, SF.topRightT.dy, SF.topRightT.sw, SF.topRightT.sh);
  SF.display.context.fillStyle="rgba(0,0,255,0.3)";
  SF.display.context.fillRect(SF.bottomLeftT.dx, SF.bottomLeftT.dy, SF.bottomLeftT.sw, SF.bottomLeftT.sh);
  SF.display.context.fillStyle="rgba(255,255,0,0.3)";
  SF.display.context.fillRect(SF.bottomRightT.dx, SF.bottomRightT.dy, SF.bottomRightT.sw, SF.bottomRightT.sh);
  */
 
  // check if the animation ended
  if ( (typeof SF.onC === 'function') && (Math.abs(SF.diafragm.xHome1 - SF.diafragm.x1)) < 1 && (Math.abs(SF.diafragm.yHome1 - SF.diafragm.y1)) < 1 && (Math.abs(SF.diafragm.xHome2 - SF.diafragm.x2)) < 1 && (Math.abs(SF.diafragm.yHome2 - SF.diafragm.y2)) < 1 ) {
    SF.diafragm.x1 = SF.diafragm.xHome1;
    SF.diafragm.y1 = SF.diafragm.yHome1;
    SF.diafragm.x2 = SF.diafragm.xHome2;
    SF.diafragm.y2 = SF.diafragm.yHome2;
    SF.onC();
  }
  
  if ( SF.fadeCount ) {
    SF.fadeCount--;
    SF.display.context.fillStyle="rgba(0,0,0," + SF.fadeCount/180 + ")";
    SF.display.context.fillRect(-SF.display.canvas.width/2, -SF.display.canvas.height/2, SF.display.canvas.width, SF.display.canvas.height);
  } 
  
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                                  window.mozRequestAnimationFrame ||
                                  window.msRequestAnimationFrame ||
                                  window.oRequestAnimationFrame ||
                                  function (callback) {
                                    return window.setTimeout(callback, 17);
                                  });
}

