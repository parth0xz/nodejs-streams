
const fs = require('fs')
const mongoose = require('mongoose')
const csv = require('csvtojson')
const { Transform } = require('stream')
const { pipeline } = require('stream/promises')
const userModel = require('./user')
const main = async () => {
  await mongoose.connect('mongodb://localhost:27017/myapp')
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
      callback(null,user)
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
  const saveUser = new Transform({
    objectMode: true,
    async transform(user,enc,callback)
    {
      await userModel.create(user)
      callback(null)
    }
  })
try{
  await pipeline(
    readStream,
    csv({ delimiter: ';'}, { objectMode: true}),
    myTransform,
    myFilter,
    saveUser
    )
  console.log('Stream End')
}
catch(error)
{
  console.log('stream with error',error)
}  
}
main()
