const request = require('supertest');

let server;
const { User } = require('../../model/users');

describe('authorization', () => {
    beforeEach(() => { server = require('../../app') });

    afterEach(async () => {
        await User.remove({})
        server.close();
    });

    let token;

    const exec = () => request(server).get('/api/user/home').set('x-auth-token', token)

    beforeEach( async () => {
        const user = new User( { 
            firstName: "abcde", lastName: "abcdef", 
            email: 'abcd@gmail.com', password: "1234567890", 
            phoneNumber: "09034119761", username: "abcd" })

        await user.save();

        token = user.generateToken();
    })

    it ('should return a 401 status if no token is provided', async () => {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401)
    });

    it ('should return a 401 status if no token is provided', async () => {
        token = 'abcd';
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return a 200 status with valid token', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });
})