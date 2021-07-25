let server;
const request = require('supertest');
const { User } = require('../../model/users');

describe('register user', () => {
    beforeEach(() => { server = require('../../app') });
    afterEach( async () => {
        await User.remove({});
        server.close();
    });

    it ('should return a 400 error because of short firstName', async () => {
        const user = { firstName: "a", lastName: "abcdef", email: 'abcd@gmail.com', password: "1234567890", phoneNumber: "09034119761", username: "abcd" };
        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(400)
    });

    it ('should return a 400 error because of short lastName', async () => {
        const user = { firstName: "abcdef", lastName: "a", email: 'abcd@gmail.com', password: "1234567890", phoneNumber: "09034119761", username: "abcd" };
        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(400)
    });

    it ('should return a 400 error because of invalid email', async () => {
        const user = { firstName: "abcdef", lastName: "abcdef", email: 'abcdcom', password: "1234567890", phoneNumber: "09034119761", username: "abcd" };
        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(400)
    });

    it ('should return a 400 error short password', async () => {
        const user = { firstName: "abcdef", lastName: "abcdef", email: 'abcd@gmail.com', password: "123456", phoneNumber: "09034119761", username: "abcd" };
        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(400)
    });

    it ('should return a 400 error because of invalid phonenumber', async () => {
        const user = { firstName: "abcdef", lastName: "abcdef", email: 'abcd@gmail.com', password: "123456", phoneNumber: "09034", username: "abcd" };
        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(400)
    });

    it ('should return a 400 error because of invalid username', async () => {
        const user = { firstName: "abcdef", lastName: "abcdef", email: 'abcd@gmail.com', password: "123456", phoneNumber: "09034", username: "" };
        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(400)
    });

    it ('should return a 200 status for valid user', async () => {
        const user = { firstName: "abcdef", lastName: "abcdef", 
            email: 'abcd@gmail.com', password: "12345678901", 
            phoneNumber: "09034119761", username: "abc",
            country: 'nigeria'
        };

        const res = await request(server)
            .post('/api/register')
            .send(user);

        expect(res.status).toBe(200)
    });
})