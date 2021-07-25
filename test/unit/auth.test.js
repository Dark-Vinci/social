const { User } = require('../../model/users');
const auth = require('../../middleware/auth');
const mongoose = require('mongoose');


describe('authorization populate', () => {
    it ('should popultae a decoded jwt', () => {
        const payload = { 
            _id: mongoose.Types.ObjectId().toHexString(),
            username: "abcd" }
        const token = new User(payload).generateToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        };
        const next = jest.fn();
        const res = {};
        auth(req, res, next);

        expect(req.user).not.toBeNull();
        expect(req.user).toMatchObject(payload);
        expect(next).toHaveBeenCalled()
    })
})