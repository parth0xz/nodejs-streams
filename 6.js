
const fs = require('fs')
const mongoose = require('mongoose')
const csv = require('csvtojson')
const { Transform } = require('stream')
const { pipeline } = require('stream/promises')
const userModel = require('./user')
const bufferingObjectStream = require('buffering-object-stream')

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
  const saveUsers = new Transform({
    objectMode: true,
    async transform(users,enc,callback)
    {
    //   const promise = users.map(user => userModel.create(user))
    //   await Promise.all(promise)
    //   callback(null)
      await userModel.bulkWrite(
        users.map(user =>({
          insertOne:{
            document: user,
          }
        }))
      )
      callback(null)
    }
  })
try{
  await pipeline(
    readStream,
    csv({ delimiter: ';'}, { objectMode: true}),
    myTransform,
    bufferingObjectStream(5),
    saveUsers
    )
  console.log('Stream End')
}
catch(error)
{
  console.log('stream with error',error)
}  
}
main()
