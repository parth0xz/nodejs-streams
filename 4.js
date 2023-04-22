
const fs = require('fs')
const csv = require('csvtojson')
const { Transform } = require('stream')
const { pipeline } = require('stream/promises')
const { createGzip } = require('zlib')
const main = async () => {

  const readStream = fs.createReadStream('./data/import.csv')

  const myTransform = new Transform({
    objectMode: true,
    transform(chunk,enc,callback){
      //edit chunk data and format as you want
      const user = {
        name: chunk.name,
        email: chunk.email.toLowerCase(),
        age: Number(chunk.age),
        salary: Number(chunk.salary),
        isActive: chunk.isActive === 'true'
      }
      callback(null,user) //callback(null,chunk)
    },
  })
  //adding filter on active users
  const myFilter = new Transform({
    objectMode: true,
    transform(user,enc,callback){
      if(!user.isActive)
      {
        callback(null)
        return
      }
      console.log('user filter:', user)
      callback(null,user)
    }
  })
  const convertToJson = new Transform({
    objectMode: true,
    transform(user,enc,cb){
      const value = JSON.stringify(user) + '\n'
      cb(null,value)
    }
  })
try{
  await pipeline(
    readStream,
    csv({ delimiter: ';'}, { objectMode: true}),
    myTransform,
    myFilter,
    convertToJson,
    fs.createWriteStream('./data/export.json'),
    createGzip(), //add gZip function
    fs.createWriteStream('./data/export.json.gz') // add gz file name as want
  )
  console.log('Stream End')
}
catch(error)
{
  console.log('stream with error',error)
}  
}
main()
