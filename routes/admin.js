const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { Admin, validate, 
    validateLogin, validatePasswordChange 
} = require('../model/admin');
const { Post } = require('../model/post');
const { User } = require('../model/users');
const { Blocked } = require('../model/blocked');

const validateId = require('../middleware/idVerifier');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const bodyValidator = require('../middleware/bodyValidator');

const adminMiddleware = [ auth, admin ];
const adminMiddlewareAndId = [ validateId, auth, admin ];
const superAdminMiddlewareAndId = [ validateId, auth, admin, superAdmin ] ;
const validateAdminAndBody = [ adminMiddleware, bodyValidator(validatePasswordChange) ];

router.get('/', adminMiddleware, wrapper (async (req, res) => {
    const admins = await Admin.find()
        .select('-password');

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    });
}));

router.get('/blockedUser', adminMiddleware, wrapper (async (req, res) => {
    const blockedUsers = await Blocked.stillBlocked();
    
    if (blockedUsers.length === 0) {
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: 'currently, there are no blocked users'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: blockedUsers
        });
    }
}));

router.get('/onceblockedUser', adminMiddleware, wrapper (async (req, res) => {
    const onceBlocked = await Blocked.onceBlocked();

    if (onceBlocked.length === 0) {
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: 'currently, there are no blocked users'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: onceBlocked
        });
    }
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

router.put('/unblock/:blockId', adminMiddlewareAndId, wrapper (async (req, res) => {
    const { blockId } = req.params; 
    const blocked = await Blocked.findByIdAndUpdate(blockId);

    if (!blocked) {
        return res.status(404).json({
            status: 404,
            message: 'failure',
            data: 'no such blocked id in the db...'
        })
    } else {
        if (blocked.unblocked) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'the user unblocked before now'
            })
        }

        const userId = blocked.userId;
        const user = await User.findById(userId)
            .select({ password: 1, username: 1 })
        console.log(user)
        const wrongPassword = user.password;
        const indexToSplice = wrongPassword.length - 1;
        const changed = wrongPassword.split('').splice(0, indexToSplice).join('');
        user.password = changed;

        blocked.set({
            unblockedBy: req.user._id,
            unblockedAt: new Date(),
            unblocked: true
        });

        await user.save();
        await blocked.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ user.username } has been successfully unblocked`
        });
    }
}));

router.post('/block/:userId', adminMiddlewareAndId, wrapper (async (req, res) => {
    const { userId } = req.params;
    const adminUsername = req.user.username;

    const user = await User.findById(userId)
        .select('password');

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'failure',
            data: 'no such user in the db'
        })
    } else {
        const changed = user.password + 1;
        user.password = changed;

        const reason = req.query.reason;
        const blocked = new Blocked({
            userId,
            reason,
            blockedBy: adminUsername
        });

        await blocked.save();
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ user.username } has been blocked with block id ${ blocked._id }`
        })
    }
}));

router.post('/login', bodyValidator(validateLogin), wrapper (async (req, res) => {
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
}));

router.post('/logout', adminMiddleware, wrapper ((req, res) => {
    const token = 0;
    res.header('x-auth-token', token).json({
        status: 200,
        message: 'success',
        body: 'good bye'
    })
}));

router.post('/register', bodyValidator(validate), wrapper (async (req, res) => {
    const adminNumber = await Admin.find()
        .count();

    if (adminNumber >= 5) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'sorry, we cant have more than 10 amdins'
        })
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
}));

router.put('/changepassword', validateAdminAndBody, wrapper (async (req, res) => {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId)
        .select('password');

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
}));

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