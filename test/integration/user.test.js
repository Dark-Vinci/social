let server;
const request = require('supertest');
const { User } = require('../../model/users');

describe('/api/user', () => {
    beforeEach(() => { server = require('../../app') });
    afterEach(async () => { 
        server.close() 
        await User.remove({})
    });

    describe('GET /', () => {
        it ('should return all users', async () => {
            await User.collection.insertMany([
                { firstName: "abcde", lastName: "abcdef", email: 'abcd@gmail.com', password: "1234567890", phoneNumber: "09034119761", username: "abcd" },
                { firstName: "abcdef", lastName: "abcdef", email: 'abced@gmail.com', password: "1234567899", phoneNumber: "09034119762", username: "abcdd" }
            ])
            const res = await request(server).get('/api/user');

            expect(res.body.data.length).toBe(2);
            expect(res.status).toBe(200);
        })
    });

    describe('GET /me', () => {
        it ('should return a 400if no token is provided', async () => {
            const res = await request(server).get('/api/user/me');

            expect(res.status).toBe(401);
        });

        it ('should return a users data if token is provided', async () => {
            const user = new User({ firstName: "abcde", 
                lastName: "abcdef", email: 'abcd@gmail.com', 
                password: "1234567890", phoneNumber: "09034119761", 
                username: "abcd" })
            const token = user.generateToken();
            await user.save()

            const res = await request(server)
                .get('/api/user/me')
                .set('x-auth-token', token);

            expect(res.status).toBe(200);
        })
    });

    describe('GET /:id', () => {
        it ('should return a users data if valid id is provid', async () => {
            const user = new User( { 
                firstName: "abcde", lastName: "abcdef", 
                email: 'abcd@gmail.com', password: "1234567890", 
                phoneNumber: "09034119761", username: "abcd" });
            await user.save();

            const res = await request(server).get('/api/user/' + user._id);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty("firstName", user.firstName)
        });

        it ('should return a 404 error if invalid id is passed', async () => {
            const res = await request(server).get('/api/user/1');

            expect(res.status).toBe(404);
        })
    })
})