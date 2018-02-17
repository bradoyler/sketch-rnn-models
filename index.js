const fs = require('fs')
const request = require('request')
const progress = require('request-progress')
const models = require('./models/list')
const baseURL = 'https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models'

let log = [0]
function sampleLog (val, size) {
  const rounded = Math.round(val * 100)
  log.push(rounded)
  if (log.length > size) {
    const sum = log.reduce(function (previous, current) {
      return current += previous //eslint-disable-line
    })
    const avg = Math.round(sum / log.length)
    log = [avg]
  }
  return { percent: Math.min(...log), show: (log.length === 1) }
}

models.forEach(name => {
  const src = `${baseURL}/${name}.gen.json`
  const dest = `data/${name}.gen.json`
  progress(request(src), {
    throttle: 2500, // Throttle the progress event to 2000ms, defaults to 1000ms
    delay: 2000 // Only start to emit after 1000ms delay, defaults to 0ms
    // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
  })
    .on('progress', function (state) {
      const log = sampleLog(state.percent, 20)
      if (log.show) {
        console.log('File progress:', log.percent + '%')
      }
    })
    .on('error', console.error)
    .on('end', function () {
      console.log('#### Completed:', dest)
    })
    .pipe(fs.createWriteStream(dest))
})
