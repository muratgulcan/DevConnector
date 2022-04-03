const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {check,validationResult} = require('express-validator')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

router.post('/', [auth,[
    check('text','Text is required').not().isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const newPost = new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            userId:req.user.id,
            username:user.username
        })
        const post = await newPost.save()
        res.json(post)
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error')
    }
})

router.get('/',auth,async(req,res)=>{
    try {
        const posts = await Post.find().sort({date:-1})
        res.json(posts)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error')
    }
})

router.get('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id).populate('userId',['name','avatar','username'])
        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }
        res.json(post)
    } catch (error) {
        console.log(error);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg:'Post not found'})
        }
        res.status(500).send('Server error')
    }
})

router.delete('/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({msg:'Post not found'})
        }
        if(post.userId.toString() !== req.user.id){
            return res.status(401).json({msg:'Bir sorun var'})
        }
        await post.remove()
        res.json({msg:'Post removed'})
    } catch (error) {
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg:'Post not found'})
        }
        res.status(500).send('Server error')
    }
})

router.put('/like/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        //check if the post has already been liked
        if(post.likes.filter(like=>like.userId.toString() === req.user.id).length > 0){
            return res.status(400).json({msg:'Post already liked'})
        }
        post.likes.unshift({userId:req.user.id})    
        await post.save()
        res.json(post.likes)

    } catch (error) {
        console.log(error);
        res.status(500).send('Server error')
    }
})


router.put('/unlike/:id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        //check if the post has already been liked
        if(post.likes.filter(like=>like.userId.toString() === req.user.id).length === 0){
            return res.status(400).json({msg:'Post has not yet been liked'})
        }
        //get remove index
        const removeIndex = post.likes.map(like=>like.userId.toString()).indexOf(req.user.id)   
        post.likes.splice(removeIndex,1)
        await post.save()
        res.json(post.likes)

    } catch (error) {
        console.log(error);
        res.status(500).send('Server error')
    }
})

router.post('/comment/:id', [auth,[
    check('text','Text is required').not().isEmpty()
]], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)
        const newComment = new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            userId:req.user.id,
            username:user.username
        })
        post.comments.unshift(newComment)
        await post.save()
        res.json(post.comments)
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error')
    }
})

router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id)
        const comment = post.comments.find(comment=>comment.id === req.params.comment_id)
        if(!comment){
            return res.status(400).json({msg:'Comment does not exist'})
        }
        //check user
        if(comment.userId.toString() !== req.user.id){
            return res.status(401).json({msg:'Bir sorun var'})
        }
        comment.remove();
        await post.save()
        res.json(post.comments)
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error')
    }
})

module.exports = router