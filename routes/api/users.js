const express = require('express');
const router = express.Router();
const gravatar=require('gravatar')
const { check, validationResult } = require('express-validator');

//import user model
const User = require('../../models/User')

//@route POST api/users
//@desc Register user
//@access public
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const{name,email,password} = request.body
        
        try{
            //see if user exists
            let user=await User.findOne({email});
            if(user){
                res.status(400).json({error:[{msg: 'User already exists'}]})
            }
        
        //if so head back error
        
        //get user gravatar (globally recognised avatar)

        //encrypt password
        
        //return jsonwebtoken
        res.send('User route');
        }
        catch(err) {
            console.log(err.message);
            res.status(500).send('server error')
        }
        
        
        
    }
);

module.exports = router;
