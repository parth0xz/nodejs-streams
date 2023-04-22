
const fs = require('fs')
const csv = require('csvtojson')
const { Transform } = require('stream')

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
    }
  })


  // adding filter on active users
  const myFilter = new Transform({
    objectMode: true,
    transform(user,enc,callback){
      if(!user.isActive)
      {
        callback(null)
        return
      }
      callback(null,user)
    }
  })




  readStream
  .pipe(
    csv({
      delimiter: ';'
    }, { objectMode: true })
  )
  .pipe(myTransform) //transform data into object
  .pipe(myFilter) //adding filter transform
  .on('data',data =>{
    console.log('data :-')
    console.log(data)
  })
  .on('error',error =>{
    console.log('stream error',error)
  })
  .on('end',()=>{
    console.log('Stream ended')
  })
}

main()
