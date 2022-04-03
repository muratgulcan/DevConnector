const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const {check,validationResult} = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Follow = require('../../models/Follow')

router.get('/me',auth,async (req,res)=>{
    try {
        const profile = await Profile.findOne({userId:req.user.id}).populate('userId',
        ['name','avatar'])
        if(!profile){
            return res.status(400).json({msg:'There is no profile for this user'})
        }
        
        res.json(profile)
    } catch (error) {
        res.status(500).json('Server error')
    }
})

router.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills are required').not().isEmpty()
]],async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        linkedin,
        instagram
    } = req.body

    const profileFields = {}
    profileFields.userId = req.user.id
    if(status) profileFields.status = status
    if(company) profileFields.company = company
    if(website) profileFields.website = website
    if(location) profileFields.location = location
    if(bio) profileFields.bio = bio
    if(githubusername) profileFields.githubusername = githubusername
    if(skills){
        profileFields.skills = skills.split(',').map(skill=>skill.trim())
    }
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube
    if(facebook) profileFields.social.facebook = facebook
    if(twitter) profileFields.social.twitter = twitter
    if(linkedin) profileFields.social.linkedin = linkedin
    if(instagram) profileFields.social.instagram = instagram


    try {
        let profile = await Profile.findOne({userId:req.user.id})
        if(profile){
            //update
            profile = await Profile.findOneAndUpdate({userId:req.user.id},
                {$set:profileFields},
                {new:true}
            )
            return res.json(profile)
        }
        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)

    } catch (error) {
        console.log(error.message);
        res.status(500).json({msg:'Server error'})
    }

})

router.get('/',auth, async (req,res)=>{
    try {
        const profiles = await Profile.find().populate('userId',['name','avatar','username'])
        const followers = await Follow.find({userId:req.user.id}) 
        res.json({profiles,followers})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Server error'})
    }
})

router.get('/user/:name', async (req,res)=>{
    try { 
        const user = await User.findOne({name:req.params.name})
        if(!user) return res.status(400).json({msg:'Profile not found'})
        const profile = await Profile.findOne({userId:user._id}).populate('userId',['name','avatar','username'])
        res.json(profile)
    } catch (error) {
        console.log(error);
        if(error.kind == 'ObjectId'){
            return res.status(400).json({msg:'Profile not found'})
        }
        res.status(500).json({msg:'Server error'})
    }
})

router.delete('/',auth, async (req,res)=>{
    try {
        await Post.deleteMany({useId:req.user.id})
        await Profile.findOneAndRemove({userId:req.user.id})
        await User.findOneAndRemove({_id:req.user.id})
        res.json({msg:'User deleted'})
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Server error'})
    }
})

router.put('/experience',[auth,[
    check('title','Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From date is required').not().isEmpty(),
]] , async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {
        title,
        company,
        from,
        to,
        location,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        from,
        location,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({userId:req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Server error'})
    }

})

router.delete('/experience/:exp_id',auth, async (req,res)=>{
    try {
        const profile = await Profile.findOne({userId:req.user.id})
        const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id)
        if(removeIndex > -1) {
            profile.experience.splice(removeIndex,1)
            await profile.save()
            res.json(profile)
        }
        else{
            res.status(500).json({msg:'bir hata var'})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Server error'})
    }
})

router.put('/education',[auth,[
    check('school','School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is required').not().isEmpty(),
    check('from','From date is required').not().isEmpty(),
]] , async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {
        school,
        degree,
        from,
        to,
        fieldofstudy,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        from,
        to,
        fieldofstudy,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({userId:req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Server error'})
    }

})

router.delete('/education/:edu_id',auth, async (req,res)=>{
    try {
        const profile = await Profile.findOne({userId:req.user.id})
        const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id)
        if(removeIndex > -1) {
            profile.education.splice(removeIndex,1)
            await profile.save()
            res.json(profile)
        }
        else{
            res.status(500).json({msg:'bir hata var'})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({msg:'Server error'})
    }
})

router.post("/follow", auth, async (req, res) => {
    try {
      const newFollow = new Follow({
        userId: req.user.id,
        followId: "61f3224dc462728d883e0007",
      });
      const isFollowing = await Follow.findOne({
        userId: req.user.id,
        followId: "61f3224dc462728d883e0007",
      });
      if (isFollowing) {
        return res.status(400).send("User is following");
      }
      const follow = await newFollow.save();
      res.json(follow);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error");
    }
  });
  
  router.delete("/unfollow", auth, async (req, res) => {
    try {
      const follow = await Follow.findOne({
        userId: req.user.id,
        followId: "61f3224dc462728d883e0007",
      });
      if (!follow) {
        return res.status(400).json({ msg: "Bir sorun var" });
      }
  
      //check user
      if (follow.userId.toString() !== req.user.id) {
        return res.status(401).json({ msg: "Bir sorun vars" });
      }
  
      follow.remove();
      res.json(follow);
    } catch (error) {
      console.log(error);
      res.status(500).send("Server error");
    }
  });
  



module.exports = router