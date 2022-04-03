const express = require('express')
const connectDB = require('./config/db')
const config = require('config')
const port = config.get('PORT')

connectDB()

const app = express()

app.use(express.json({extended:false}))

app.use('/api/users',require('./routes/api/users'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/profile',require('./routes/api/profile'))
app.use('/api/posts',require('./routes/api/posts'))
app.use('/api/follows',require('./routes/api/follows'))

const PORT = port || 3333
app.listen(PORT,()=>console.log(`Server started on PORT ${PORT}`))