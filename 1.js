
const fs = require('fs')
const csv = require('csvtojson')

const main = async () => {

  const readStream = fs.createReadStream('./data/import.csv')

  const writeStream = fs.createWriteStream('./data/export.csv')

  readStream.pipe(
    writeStream
  )
  readStream.on('end',()=>{
    console.log('Stream ended')
  })
  writeStream.on('finish',()=>{
    console.log('write stram finish')
  })
}

main()
