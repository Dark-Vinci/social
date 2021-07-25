let server;
const request = require('supertest');
const { User } = require('../../model/users');

describe('login', () => {
    beforeEach(() => { server = require('../../app') });
    afterEach( async () => {
        await User.remove({});
        server.close();
    });

    it ('return 200 status with valid inputs', async () => {
        const body = { firstName: "abcdef", lastName: "abcdef", 
            email: 'abcdefg@gmail.com', password: "12345678901", 
            phoneNumber: "09034119761", username: "abc",
            country: 'nigeria'
        };

        await request(server)
            .post('/api/register')
            .send(body)
        
        const payload = {
            emailOrUsername: "abc",
            password: "12345678901" 
        }

        const res = await request(server)
            .post('/api/login')
            .send(payload)

        
        expect(res.status).toBe(200);
    });

    it ('return 400 status with invalid inputs', async () => {
        const body = { firstName: "abcdef", lastName: "abcdef", 
            email: 'abcdefg@gmail.com', password: "12345678901", 
            phoneNumber: "09034119761", username: "abc",
            country: 'nigeria'
        };
        await request(server)
            .post('/api/register')
            .send(body)
        
        const payload = {
            emailOrUsername: "abc",
            password: "123456789" 
        }

        const res = await request(server)
            .post('/api/login')
            .send(payload)
        
        expect(res.status).toBe(400);
    });

    it ('return 400 status with short password', async () => {
        const body = { firstName: "abcdef", lastName: "abcdef", 
            email: 'abcdefg@gmail.com', password: "12345678901", 
            phoneNumber: "09034119761", username: "abc",
            country: 'nigeria'
        };
        await request(server)
            .post('/api/register')
            .send(body)
        
        const payload = {
            emailOrUsername: "abc",
            password: "123" 
        }

        const res = await request(server)
            .post('/api/login')
            .send(payload)
        
        expect(res.status).toBe(400);
    })
})