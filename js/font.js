var Pxxl = {};

Pxxl.Font = function(version, comments, properties, glyphs) {
  this.version = version;
  this.comments = comments;
  this.properties = properties;
  this.glyphs = glyphs;
  //console.log(glyphs);
  //console.log("BDF version " + this.version);
  // if (comments && comments.length)
  //   console.log(comments.join(""));
}

Pxxl.Font.ParseJSON = function (obj)
{
  var f = new Pxxl.Font(obj.version, obj.comments, obj.properties, {});
  //console.log(f);
  for (var k in obj)
  {
    if (obj.hasOwnProperty(k) && k != "glyphs")
      f[k] = obj[k];
  }

  f.glyphs = {};
  for (var g in obj.glyphs)
  {
    //console.log(g);
    if (obj.glyphs.hasOwnProperty(g))
      f.glyphs[g] = Font.Glyph.ParseJSON(obj.glyphs[g]);
  }
  return f;
}

Pxxl.Font.prototype = {

  size: function() {
    return this.SIZE[0];
  },

  getGlyph: function(character)
  {
    var c = character.charCodeAt(0);

    return this.glyphs[c];
  },

  defaultWidth: function ()
  {
    return this.FONTBOUNDINGBOX[0];
  },

  defaultHeight: function ()
  {
    return this.FONTBOUNDINGBOX[1];
  },

  bit: function(text, row, column ) {
    var t = ~~(column / 8);
    if (t < 0 || t > text.length-1) return false;
    var c = text.charCodeAt(t);

    //console.log(t);
    var g = this.glyphs[c];
    if (g)
      return g.bit(row , column % 8);
    else
      return false;
  },

  getPixels : function(text) {
    //console.log(text, x,y, maxWidth);
    var ctx = this.ctx;
    var hspacing = this.FONTBOUNDINGBOX[0];

    var pixels = [];


    for( var t=0 ; t<text.length ; t++) // characters in a string x
    {
     var chr = text.charCodeAt(t);
     var glyph = this.glyphs[chr];

     var bitmap = glyph.bitmap;
     var dx = t * hspacing;
     var dy = this.defaultHeight() - glyph.height(); // some glyphs have fewer rows

     for ( var r=0 ; r<bitmap.length ; r++) // pixelrows in a glyph y
     {
       var row = bitmap[r];

       for (var b=0 ; b<row.length ; b++) // bytes in a row x
       {
         var byt = row[b];

         var offset = b*8; //consecutive bytes are drawn next to each other
         var bit = 256;

         while (bit >>>= 1) // bits in a byte x
         {
           if (byt & bit)
           {
             var px = dx+offset;
             var py = dy+r;

              pixels.push({x:px, y:py, row:r, column:offset });
           }
           offset++;
         }
       }
     }
    }

    return pixels;
  }
};
