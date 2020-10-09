const express = require('express');
const router = express.Router();
const auth =require('../../middleware/auth')

const Profile = require('../../models/profile');
const User = require('../../models/User')

//@route Get api/profile/me
//@desc get current users profile
//@access private
router.get('/me', auth, async ( req, res) => {
try {
    const profile = await Profile.findOne({User:req.User.id}).populate(
        'user',
        ['name','avatar']
    )
    if(!profile) {
        return res.status(400).json({ msg:'there is no profile for this user'});
    }
} catch(err){
    console.console.error(err.message);
    res.status(500).send('server Error')
    }
}
)

module.exports=router;
