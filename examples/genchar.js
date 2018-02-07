const cv = require('../lib/opencv')
const fs = require('fs')
const potrace = require('potrace')
function png2svg (filepath) {
  potrace.trace(filepath, function (err, svg) {
    if (err) {
      throw err
    }
    fs.writeFileSync('./tmp/a.svg', svg)
  })
}

['4eba','5f66','97ea'].forEach(name => {
  const im = cv.readImage(`./files/${name}.png`)
  const w = im.width(), h = im.height()
  console.log(`${name}.png (${w},${h})`)
})

// Load the image
cv.readImage('./files/97ea.png', function(err, im) {
  if (err) {
    throw err;
  }
  var line = 0
  const width = im.width(), height = im.height()
  line = Math.floor(height / 150)
  console.log(`(${width},${height}), line = ${line}, newImg width=${width * line}`)

  const logo = cv.readImage('./files/hanziwu.bmp')
  const w = logo.width()
  const h = logo.height()

  const out = im.matchTemplate('./files/hanziwu.bmp', 5)

  const x0 = out[1], y0 = out[2]
  const x1 = x0 + w, y1 = y0
  const x2 = x1, y2 = y1 + h
  const x3 = x0, y3 = y0 + h
  const bgc = [255, 255, 255]
  console.log(`(${x0},${y0})  (${x1}, ${y1}) (${x2},${y2})  (${x3},${y3})`)
  const whiteMat = new cv.Matrix(h, w, cv.Constants.CV_8UC3, bgc)
  whiteMat.copyTo(im, x0, y0)

  const newImgH = 150
  const newImg = new cv.Matrix(newImgH, width * line, cv.Constants.CV_8UC3, bgc)
  console.log(`new image ${newImg.width()}x${newImg.height()}`)
  for (let i = 0; i < line; i++) {
    let fromx = 0, fromy = newImgH * i, fromw = width, fromh = newImgH
    let tox = width * i, toy = 0
    console.log(`(${fromx},${fromy})-${fromw}x${fromh} => (${tox},${toy})`)
    im.roi(fromx, fromy + i*3, fromw, fromh)
      .copyTo(newImg, tox, toy)
  }

  const frameColor = [244, 186, 100]
  const realWith = findRealWidth(newImg, frameColor)
  console.log(realWith)
  removeFrameLines(newImg, frameColor, [255, 255, 255])

  removeFrameLines(newImg, [238,238,238], [255, 255, 255])
  removeFrameLines(newImg, [243,243,243], [255, 255, 255])
  removeFrameLines(newImg, [241,214,174], [255, 255, 255])

  removeFrameLines(newImg, [82,86,255], [51, 51, 51])

  const finalIm = new cv.Matrix(newImg.height(), realWith + 2, cv.Constants.CV_8UC3, bgc)
  newImg.roi(0, 0, finalIm.width(), finalIm.height()).copyTo(finalIm, 0,0)
  finalIm.save('./tmp/4eba-removelogo.png')
  png2svg('./tmp/4eba-removelogo.png')
})

function findRealWidth (im, color) {
  const w = im.width()
  for(let i = w - 1; i > 0; i--) {
    const p = im.getPixel(1, i)
    if (p[0] === color[0] && p[1] === color[1] && p[2] === color[2]) {
      return i
    }
  }
  return -1
}

function removeFrameLines (im, color, to) {
  const w = im.width(), h = im.height()
  for(let x = 0; x < w; x++) {
    for(let y = 0; y < h; y++) {
      let p = im.getPixel(y, x)
      if (p[0] === color[0] && p[1] === color[1] && p[2] === color[2]) {
        im.pixel(y, x, to)
      }
    }
  }
}

