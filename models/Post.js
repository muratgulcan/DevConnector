const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    text:{
        type:String,
        required:true,
    },
    name:{
        type:String,
    },
    avatar:{
        type:String
    },
    username:{
        type:String
    },
    likes:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'users'
            }
        }
    ],
    comments:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'user'
            },
            text:{
                type:String,
                required:true
            },
            name:{
                type:String,
            },
            avatar:{
                type:String
            },
            date:{
                type:Date,
                default:Date.now
            },
            username:{
                type:String
            }
        }
    ],
    date:{
        type:Date,
        default:Date.now
    }
    
})

module.exports = Post = mongoose.model('post',PostSchema)