const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

//import user model
const User = require('../../models/User');

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

        const { name, email, password } = req.body;

        try {
            //see if user exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({
                    error: [{ msg: 'User already exists' }],
                });
            }

            //get user gravatar (globally recognised avatar)
            const avatar = gravatar.url(email, {
                //size
                s: '200',
                //rating
                r: 'pg',
                //default
                d: 'mn',
            });

            user = new User({
                name,
                email,
                avatar,
                password,
            });
            //encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);
            await user.save();


            //return jsonwebtoken
            res.send('User Registered');
        } catch (err) {
            console.log(err.message);
            res.status(500).send('server error');
        }
    }
);

module.exports = router;
