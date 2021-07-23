const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { Admin, validate, 
    validateLogin, validatePasswordChange 
} = require('../model/admin');
const { Post } = require('../model/post');
const { User } = require('../model/users');

const validateId = require('../middleware/idVerifier');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');

const adminMiddleware = [ auth, admin ];
const adminMiddlewareAndId = [ validateId, auth, admin ];
const superAdminMiddlewareAndId = [ validateId, auth, admin, superAdmin ] ;

router.get('/', adminMiddleware, wrapper (async (req, res) => {
    const admins = await Admin.find()
        .select('-password');

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    });
}));

router.get('/:id', adminMiddlewareAndId, wrapper (async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findById(id)
        .select('-password');

    if (!admin) {
        return res.status(400).json({
            status: 200,
            message: 'failure',
            data: 'no such admin in the db'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        })
    }
}));

router.put('/empower/:id', superAdminMiddlewareAndId, wrapper (async (req, res) => {
    const { id } = req.params;
    const adm = await Admin.findById(id);
    if (adm.power == 7) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'power cant be more than 7'
        });
    }

    const admin = await Admin.findByIdAndUpdate(id, {
        $inc: {
            power: +1
        }
    }, { new: true });

    const message = `${ admin.username }'s power has been increased`;
    if (!admin) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such admin in the database'
        });
    }

    res.status(200).json({
        status: 200,
        message: 'success',
        data: message
    })
}));

router.put('/reduce/:id', superAdminMiddlewareAndId, wrapper (async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (!admin) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such admin in the db'
        })
    } else {
        if (admin.power <= 1) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'this is the lowest possible power for an admin'
            });
        } else {
            const newPower = admin.power - 1;
            admin.power = newPower
            await admin.save();

            const message = `${ admin.username }'s power has been reduced`;

            res.status(200).json({
                status: 200,
                message: 'success',
                data: message
            })
        }
    }
}));

router.delete('/deletePost/:postId', adminMiddlewareAndId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findByIdAndRemove(postId);

    if (!post) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db'
        })
    } else {
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: post
        })
    }
}));

router.put('/blockUser/:userId', adminMiddlewareAndId, wrapper (async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
        .select('password');

    if (!user) {
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: 'no such user in the db'
        })
    } else {
        const changed = user.password + 1;
        user.password = changed;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'password has been changed'
        })
    }
}));

router.put('/unblockUser/:userId', adminMiddlewareAndId, wrapper (async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
        .select('password');
    
    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'user doesnt exist in the database'
        });
    } else {
        const wrongPassword = user.password;
        const indexToSplice = wrongPassword.length - 1;
        const changed = wrongPassword.split('').splice(0, indexToSplice).join('');
        user.password = changed;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'password has been reset'
        });
    }
}));

router.post('/login', wrapper (async (req, res) => {
    const { error } = validateLogin(req.bdoy);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        });
    } else {
        const { emailOrUsername, password } = req.body;

        const user1 = await Admin.findOne({ email: emailOrUsername });
        const user2 = await Admin.findOne({ username: emailOrUsername });

        if (!user1 && !user2) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'invalid input parameter'
            });
        }

        let admin = user1 || user2;

        const isValid = await bcrypt.compare(password, admin.password);
        
        if (!isValid) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'invalid input parameters'
            });
        } else {
            const token = admin.generateToken();
            res.status(200).header('x-auth-token', token).json({
                status: 200,
                message: 'success',
                data: `youre welcome ${ admin.username }`
            });
        }
    }
}));

router.post('/logout', adminMiddleware, wrapper ((req, res) => {
    const token = 0;
    res.header('x-auth-token', token).json({
        status: 200,
        message: 'success',
        body: 'good bye'
    })
}));

// tested
router.post('/register', wrapper (async (req, res) => {
    const adminNumber = await Admin.find()
        .count();

    if (adminNumber >= 10) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'sorry, we cant have more than 10 amdins'
        })
    } else {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: error.details[0].message
            });
        } else {
            const { email, phoneNumber, username, password } = req.body;

            const user1 = await Admin.findOne({ email });
            const user2 = await Admin.findOne({ phoneNumber });
    
            if (user1) {
                return res.status(400).json({
                    status: 400,
                    message: 'failure',
                    data: 'theres a user with same email'
                });
            }
    
            if (user2) {
                return res.status(400).json({
                    status: 400,
                    message: 'failure',
                    data: 'theres a user with same phoneNumber'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const admin = new Admin({
                email,
                phoneNumber,
                username,
                password: hashedPassword
            });

            if (adminNumber == 0) {
                admin.power = 7;
            }

            try {
                await admin.save();
                const token = admin.generateToken();
                const toReturn = _.pick(admin, ['power', 'email', '_id', 'username', 'phoneNumber']);
                res.header('x-auth-token', token).status(200).json({
                    status: 200,
                    message: 'success',
                    data: toReturn
                })
            } catch (ex) {
                let message = '';

                for (field in ex.errors) {
                    message += ex.errors[field].message;
                }

                return res.status(400).json({
                    status: 400,
                    message: 'failure',
                    data: message
                });
            }
        }
    }
}));

// tested
router.put('/changepassword', adminMiddleware, wrapper (async (req, res) => {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId)
        .select('password');

    const { error } = validatePasswordChange(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        })
    } else {
        console.log(admin)
        const { oldPassword, newPassword } = req.body;
        const valid = await bcrypt.compare(oldPassword, admin.password);

        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'invalid input fields'
            })
        } else {
            const stored = newPassword;
            const salt = await bcrypt.genSalt(10);
            let hashedPassword = await bcrypt.hash(newPassword, salt);

            admin.password = hashedPassword;
            await admin.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `your new password is now ${ stored }`
            })
        }  
    }
}));

// tested
router.delete('/:id', superAdminMiddlewareAndId, wrapper (async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findByIdAndRemove(id);

    if (!admin) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'admin doesnt exist'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ admin.username } has been deleted from the db `
        });
    }
}));

module.exports = router;