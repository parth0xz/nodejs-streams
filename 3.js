
const fs = require('fs')
const csv = require('csvtojson')
const { Transform } = require('stream')
const { pipeline } = require('stream/promises')
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
try{
  await pipeline(
    readStream,
    csv({ delimiter: ';'}, { objectMode: true}),
    myTransform,
    myFilter,
  )
  console.log('Stream End')
}
catch(error)
{
  console.log('stream with error',error)
}  
}
main()
