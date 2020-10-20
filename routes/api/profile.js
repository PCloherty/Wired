const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/profile');
const User = require('../../models/User');

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
router.post(
    '/',
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

module.exports = router;
