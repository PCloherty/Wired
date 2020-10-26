const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require(`config`);
const axios = require('axios');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route GET api/profile/github/:username
//desc Get user repos from github
//access public
router.get('/github/:username', async (req,res) => {
    try {
        const uri = encodeURI(
            `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
        );
        const headers = {
            'user-agent' : 'node.js',
            Authorization: `token ${config.get('githubToken')}`
        };

        const githubResponse = await axios.get(uri, { headers });
        return res.json(githubResponse.data);
    } catch (err) {
        console.error(err.message);
        return res.status(404).json({ msg: 'No Github profile found'})
    }
});

//@route Get api/profile/me
//@desc Get current users profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            User: req.User.id,
        }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res
                .status(400)
                .json({ msg: 'there is no profile for this user' });
        }
    } catch (err) {
        console.console.error(err.message);
        res.status(500).send('server Error');
    }
});

//@route Post api/profile
//@desc Create or update user Profile
//@access private
router.post('/',
    [
        //middleware checks
        auth,
        [
            check('status', 'status is required').not().isEmpty(),
            check('skills', 'skills is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
            instagram,
            linkedin
        } = req.body;

        //build profile object
        //create object
        const profileFields={};
        profileFields.user=req.user.id;
        //if field exists then populate profileFields.field with field
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location =location;
        if(bio) profileFields.bio =bio;
        if(status) profileFields.status =status;
        if(githubusername) profileFields.githubusername =githubusername;
        if(skills){
            profileFields.skills=skills.split(',').map(skill=>skill.trim());
        }
        //build social object
        profileFields.social ={};
        if(youtube) profileFields.social.youtube = youtube;
        if(facebook) profileFields.social.facebook = facebook;
        if(twitter) profileFields.social.twitter = twitter;
        if(instagram) profileFields.social.instagram = instagram;
        if(linkedin) profileFields.social.linkedin = linkedin;

        try {
            //look for profile of user
            let profile= await Profile.findOne({user:req.user.id})

            //if found then update and send response 
            if(profile){
                //update
                profile=await Profile.findOneAndUpdate({user:req.user.id},
                    {$set:profileFields},
                    {new:true}
                );
                return res.json(profile);
            }
            //if not then create a new profile and save
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }catch(err) {
            console.error(err.message)
            res.status(500).send('server error')
        }
    }
);

//@route Get api/profile
//@desc Get all profiles
//@access private
router.get('/', async (req,res) =>
{
    try {
        const profiles = await Profile.find().populate('user',['name','avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error')
    }
})

//@route Get api/profile/user/:user_id
//@desc Get profile by userID
//@access public
router.get('/user/:user_id',async(req,res) =>
{
    try {
        const profile = await Profile.findOne({
            user:req.params.user_id
        }).populate('user',['name','avatar']);
        
        if(!profile)
            return res.status(400).json({msg:'there is no profile for this user(profile not found)'});
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind=='ObjectId'){
            return res.status(400).json({msg:'Profile not found'});


        }
        res.status(500).send('server Error')
    }
})

//@route DELETE Api/Profile
//@desc Delete profile user and posts
//@access Private
router.delete('/', auth,  async ( req , res ) => {
    try {
        
        //remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        //remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg:'User Deleted'})
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')    
    }
});

//@Route    Put api/profile/expreience
//@desc     Add profile experience
//@access   Private
router.put('/experience',[auth,[
    check('title','Title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From date is required').not().isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const{
        title, 
        company,
        location,
        from,
        to,
        current,
        description
    }=req.body

    const newExp = {
        title, company, 
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user:req.user.id});
    
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server error');
    }
    
})

//@Route    DELETE api/profile/expreience
//@desc     delete experience from profile
//@access   Private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {
        //get user profile
        const profile=await Profile.findOne({ user: req.user.id});

        //get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);
        //splice out
        profile.experience.splice(removeIndex, 1);

        //save
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
}
)
//-----

//@Route    Put api/profile/education
//@desc     Add profile education
//@access   Private
router.put('/education',[auth,[
    check('school','School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is required').not().isEmpty(),
    check('from','From date is required').not().isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const{
        school, 
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }=req.body

    const newEdu = {
        school, 
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user:req.user.id});
    
        profile.education.unshift(newEdu);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('server error');
    }
    
})

//@Route    DELETE api/profile/education/:edu_id
//@desc     delete education from profile
//@access   Private
router.delete('/education/:edu_id',auth,async(req,res)=>{
    try {
        //get user profile
        const profile=await Profile.findOne({ user: req.user.id});

        //get remove index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
        //splice out
        profile.education.splice(removeIndex, 1);

        //save
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
}
)

module.exports = router;
