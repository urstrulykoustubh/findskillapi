const express = require('express');
require('dotenv').config();
const authRoutes=require('./routes/auth')
const userRoutes=require('./routes/user')
const categoryRoutes=require('./routes/category')
const linkRoutes=require('./routes/link')
const morgan=require('morgan')
const bodyParser=require('body-parser')
const cors=require('cors')
const mongoose=require('mongoose')


const app = express();
mongoose.connect(process.env.DATABASE_CLOUD,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("DB CONNECTED"))
.catch((err)=>console.log(err));
app.use(morgan('dev'))
app.use(bodyParser.json({limit:'5mb',type:'application/json'}))
app.use(cors({origin:process.env.CLIENT_URL}));

app.use('/api',authRoutes);
app.use('/api',userRoutes)
app.use('/api',categoryRoutes)
app.use('/api',linkRoutes)
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API is running on port ${port}`));
