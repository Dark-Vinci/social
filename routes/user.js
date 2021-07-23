const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const router = express.Router();

const { User, validateChangePassword,
    validateChangeProfile
} = require('../model/users');

const cloudinary = require('../middleware/cloudinary');
const multer = require('../middleware/multer');
const validateId = require('../middleware/idVerifier');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');

const validateIdAndAuthMiddleware = [ validateId, auth ];
const authAndUploadDpMiddleware = [auth, multer.single('image')];

router.get('/', wrapper (async (req, res) => {
    const users = await User.find()
        .select('username')
        .sort('-dateCreated');

    res.status(200).json({
        status: 200,
        message: 'success',
        data: users
    });
}));

router.get('/me', auth, wrapper (async (req, res) => {
    const id = req.user._id;
    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(400).json({
            status: 400,
            message: "failure",
            data: 'you do not exist in the db'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        })
    }
}));

router.get('/home', auth, wrapper (async (req, res) => {
    const id = req.user._id;
    const posts = await User.findById(id)
        .select({ following: 1, _id: 0 })
        .populate({
            path: 'following',
            select: { post: 1, repost: 1 },
            populate: {
                path: 'repost'
            }
        })
    const toReturn = posts.following;

    res.json({
        toReturn
    })
}));

router.get('/seeSomeonesPost/:userToBeCheckedId', validateId, wrapper (async (req, res) => {
    const { userToBeCheckedId } = req.params;
    const userPost = await User.findById(userToBeCheckedId)
        .select('post')
        .populate('post')

    if (!userPost) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user on the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: userPost
        });
    }
}));

router.get('/seeSomeonesRepost/:userToBeCheckedId', validateId, wrapper (async (req, res) => {
    const { userToBeCheckedId } = req.params;
    const userRepost = await User.findById(userToBeCheckedId)
        .select('repost')
        .populate('repost')

    if (!userRepost) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user in the database'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: userRepost
        });
    }
}));

router.get('/seeSomeonesLiked/:userToBeCheckedId', validateId, wrapper (async (req, res) => {
    const { userToBeCheckedId } = req.params;
    const userLiked = await User.findById(userToBeCheckedId)
        .select('likedPost')
        .populate('likedPost')

    if (!userLiked) {
        res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user on the media'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: userLiked
        });
    }
}));

router.get('/seeSomeonesFollowers/:userToBeCheckedId', validateId, wrapper (async (req, res) => {
    const { userToBeCheckedId } = req.params;
    const userFollowers = await User.findById(userToBeCheckedId)
        .select('followers')
        .populate({
            path: 'users',
            select: { username: 1 }
        })

    if (!userFollowers) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user on the media'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: userFollowers
        });
    }
}));

router.get('/seeSomeonesFollowing/:userToBeCheckedId', validateId, wrapper (async (req, res) => {
    const { userToBeCheckedId } = req.params;
    const userFollow = await User.findById(userToBeCheckedId)
        .select('following')
        .populate({
            path: 'following',
            select: { username: 1 }
        })

    if (!userFollow) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user on the media'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: userFollow
        });
    }
}));

router.get('/:id', validateId, wrapper (async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id)
        .select({ email: 0, password: 0, phoneNumber: 0 });
    
    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user on the media'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

router.put('/uploadDp', authAndUploadDpMiddleware, wrapper (async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path);

        const userId = req.user._id;
        const user = await User.findById(userId);

        user.avatar = result.secure_url;
        user.avatarKey = result.public_id;

        await user.save();
        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'image succesfuly uploaded'
        });
    } catch (ex) {
        res.status(500).json({
            status: 500,
            message: 'failure',
            data: 'something went wrong, but do not panic'
        });
    }
}));

router.post('/logout', auth, wrapper ((req, res) => {
    const token = 0;
    res.header('x-auth-token', token).json({
        status: 200,
        message: 'success',
        data: 'logged out'
    });
}));

router.put('/updateProfile', auth, wrapper (async (req, res) => {
    const { error } = validateChangeProfile(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        })
    } else {
        const id = req.user._id
        const user = await User.findById(id)
            .select('-password');

        const { firstName, lastName, description } = req.body;
        user.set({
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            description: description || user.description
        });

        await user.save();
        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'status has been uploaded successfully'
        })
    }
}));

router.put('/follow/:userToBeFollowedId', validateIdAndAuthMiddleware, wrapper (async (req, res) => {
    const { userToBeFollowedId } = req.params;
    const userId = req.user._id;

    const userToBeFollowed = await User.findById(userToBeFollowedId);
    const user = await User.findById(userId);

    if (!userToBeFollowed) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user in the db'
        })
    } else {
        const index = userToBeFollowed.followers.indexOf(userId);
        if (index >= 0) { //to ensure user is only followed once
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'youve been a follower of this person'
            });
        } 

        userToBeFollowed.followers.push(userId);
        user.following.push(userToBeFollowedId);

        await user.save();
        await userToBeFollowed.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'now following this user'
        })
    }
}));

router.put('/unfollow/:userToBeUnFollowedId', validateIdAndAuthMiddleware, wrapper (async (req, res) => {
    const { userToBeUnFollowedId } = req.params;
    const userId = req.user._id;

    const userToBeUnFollowed = await User.findById(userToBeUnFollowedId);
    const user = await User.findById(userId);

    if (!userToBeUnFollowed) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user in the db'
        })
    }

    const index = userToBeUnFollowed.followers.indexOf(userId);

    if (index < 0) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'youre not a follower of the user'
        })
    } else {
        const userIndex = user.following.indexOf(userToBeUnFollowed);
        user.following.splice(userIndex, 1);
        userToBeUnFollowed.followers.splice(index, 1);

        await userToBeUnFollowed.save();
        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'success',
            data: 'succesfully unfollowed'
        })
    }
}));

router.put('/changepassword', auth, wrapper (async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId)
        .select('password');

        const { error } = validateChangePassword(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        });
    } else {
        const { oldPassword, newPassword } = req.body;
        const valid = await bcrypt.compare(oldPassword, user.password);

        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'invalid input field'
            })
        } else {
            const stored = newPassword;
            const salt = await bcrypt.genSalt(10);
            let hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;
            await user.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `your new password is now ${ stored }`
            })
        }
    }
}));

router.delete('/', auth, wrapper (async (req, res) => {
    const userId = req.user._id;
    const user = await User.findByIdAndRemove(userId);

    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user in the database'
        });
    } else {
        const message = `success, ${ user.username } has been removed`;
        res.status(200).json({
            status: 200,
            message: 'success',
            data: message
        });
    }
}));

module.exports = router;