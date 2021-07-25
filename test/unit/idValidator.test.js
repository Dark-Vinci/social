const validator = require('../../middleware/idVerifier');
const mongoose = require('mongoose');

describe('id validator', () => {
    it ('should return a 404 status if an invalid id is passed', () => {
        const req = {
            params: { id: 1 }
        }
        const next = jest.fn();
        const res = {
            status: { json: { status: 404 }}
        };

        validator(req, res, next);

        expect(res.status.json.status).toBe(404);
        expect(next).toHaveBeenCalled();
    });

    it('should call the next function if valid id is passed ', () => {
        const id = mongoose.Types.ObjectId();
        const req = {
            params: { id }
        }
        const next = jest.fn();
        const res = {};

        validator(req, res, next);

        expect(next).toHaveBeenCalled()
    })
})