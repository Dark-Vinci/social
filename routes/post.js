const express = require('express');

const router = express.Router();

const { User } = require('../model/users');
const { validatePost, Post } = require('../model/post');

const validateId = require('../middleware/idVerifier');
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');

const validateIdAndAuth = [validateId, auth];

router.get('/all', wrapper (async (req, res) => {
    const posts = await Post.find()
    res.send(posts)
}));

router.get('/:postId', validateId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId)
        .populate('comment');

    if (!post) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: post
        });
    }
}));

router.get('/likedBy/:postId', validateId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const toReturn = await Post.findById(postId)
        .select('likedBy')
        .populate({
            path: 'likedBy',
            select:  { username: 1 }
        })

    if (!toReturn) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: "no such post in the db"
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

router.get('/numberOfLike/:postId', validateId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const toReturn = await Post.findById(postId)
        .select('likedBy')
        .count()

    if (!toReturn) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: "no such post in the db"
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

router.get('/postedBy/:postId', validateId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const toReturn = await Post.findById(postId)
        .select('postedBy')
        .populate({
            path: 'postedBy',
            select:  { password: 0, email: 0, phoneNumber: 0 }
        })

    if (!toReturn) {
        res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such user in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

router.get('/repostedBy/:postId', validateId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const toReturn = await Post.findById(postId)
        .select('repostedBy')
        .populate({
            path: 'repostedBy',
            select:  { username: 1 }
        })

    if (!toReturn) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

router.get('/numberOfRepost/:postId', validateId, wrapper (async (req, res) => {
    const { postId } = req.params;
    const toReturn = await Post.findById(postId)
        .select('repostedBy')
        .count()

    if (!toReturn) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

router.put('/like/:postId', validateIdAndAuth, wrapper (async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);


    if (!post) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: "no such post in the db"
        })
    } else {
        const index = post.likedBy.indexOf(userId);
        if (index >= 0) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: "youve liked this post once"
            });
        }

        const user = await User.findById(userId);
        user.likedPost.push(postId);
        await user.save();

        post.likedBy.push(userId);
        await post.save();

        res.status(200).json({
            status: 200,
            message: 'failure',
            data: 'post has been successfully liked'
        })
    }
}));

router.put('/unlike/:postId', validateIdAndAuth, wrapper (async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db...'
        })
    }

    const index = post.likedBy.indexOf(userId);

    if (index < 0) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'you never liked this post'
        })
    } else {
        const user = await User.findById(userId);
        const likeIndex = user.likedPost.indexOf(postId);

        if (likeIndex < 0) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'you never liked this post'
            })
        } else {
            user.likedPost.splice(likeIndex, 1);
            post.likedBy.splice(index, 1);

            await user.save();
            await post.save();

            return res.status(200).json({
                status: 200,
                message: 'success',
                data: 'post successfully unliked'
            })
        }
    }
}));

router.put('/repost/:postId', validateIdAndAuth, wrapper (async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db...'
        })
    } else {
        const user = await User.findById(userId);
        user.repost.push(postId);
        await user.save();

        post.repostedBy.push(userId);
        await post.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'the post has been reposted'
        });
    }
}));

router.put('/unrepost/:postId', validateIdAndAuth, wrapper (async (req, res) => {
    const userId = req.user._id;
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'no such post in the db'
        });
    }

    const index = post.repostedBy.indexOf(userId);

    if (index < 0) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'you haveny reposted this post'
        });
    } else {
        const user = await User.findById(userId);
        const repostIndex = user.repost.indexOf(postId);

        if (repostIndex < 0) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'you haveny reposted this post'
            });
        } else {
            user.repost.splice(repostIndex, 1);
            post.repostedBy.splice(index, 1);

            await user.save();
            await post.save();

            return res.status(200).json({
                status: 200,
                message: 'success',
                data: 'successfully unreposted...'
            });
        }
    }
}));

router.post('/createPost', auth, wrapper (async (req, res) => {
    const { error } = validatePost(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        });
    } else {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const { content } = req.body;

        if (!user) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'you broke something'
            });
        } else {
            const post = new Post({
                content: content,
                postedBy: userId
            });
            await post.save();

            user.post.push(post._id);
            await user.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: post
            });
        }
    }
}));

router.delete('/:postId', validateIdAndAuth, wrapper (async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId)
        .select('post');

    const index = user.post.indexOf(postId);

    if (index < 0) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'you dont have such post in your store'
        });
    } else {
        await Post.findByIdAndDelete(postId) //from post from the post document

        user.post.splice(index, 1); // delete the post from the user
        await user.save();
        return res.status(200).json({
            status: 200,
            message: 'success',
            data: 'successfuly removed from the db'
        });
    }
}));

module.exports = router;