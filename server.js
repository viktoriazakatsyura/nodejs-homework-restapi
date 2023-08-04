const app = require('./app')
const mongoose = require("mongoose");

// app.listen(3000, () => {
//   console.log("Server running. Use our API on port: 3000")
// })

const DB_HOST = "mongodb+srv://viktoria:viktoria1234@cluster0.ifj3iv2.mongodb.net/db-contacts?retryWrites=true&w=majority"

mongoose.set('strictQuery', true)

mongoose.connect(DB_HOST)
.then(()=>{
  app.listen(3000)
  console.log("Database connection successful")
})
.catch(error=>{
  console.log(error.message)
  process.exit(1)
})