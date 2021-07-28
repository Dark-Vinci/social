let server;
const request = require('supertest');
const { Admin } = require('../../model/admin');

describe('admin', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach( async () => {
        server.close();
        await Admin.remove({})
    });

    describe('Post /register', () => {
        let admin;
        const exec = async () => {
            return await request(server) 
                .post("/api/admin/register")
                .send(admin)
        }

        beforeEach(() => {
            admin =  { 
                username: "abcdefghi", email: "abcdefghi@gmail.com", 
                password: "1234567890", phoneNumber: "09034119767"
            }
        });  

        it ('should return a 400 status if number of admin is greater o requal 5', async () => {
            await Admin.collection.insertMany([
                { username: "abcd", email: "abcd@gmail.com", password: "1234567890", phoneNumber: "09034119762"},
                { username: "abcde", email: "abcde@gmail.com", password: "1234567890", phoneNumber: "09034119763"},
                { username: "abcdef", email: "abcdef@gmail.com", password: "1234567890", phoneNumber: "09034119764"},
                { username: "abcdefg", email: "abcdefg@gmail.com", password: "1234567890", phoneNumber: "09034119765"},
                { username: "abcdefgh", email: "abcdefgh@gmail.com", password: "1234567890", phoneNumber: "09034119766"}
            ]);

            const res = await exec(); 

            expect(res.status).toBe(400);
            expect(res.body.data).toMatch(/sorry, we cant have more than 10 amdins/);
        });

        it ('should return a 400 status if invalid input username is passed', async () => {
            admin.username = '';
            const res = await exec();

            expect(res.status).toBe(400)
        });

        it ('should return a 400 status if invalid input username is passed', async () => {
            admin.password = '123';
            const res = await exec();

            expect(res.status).toBe(400)
        });

        it ('should return a 400 status if invalid input username is passed', async () => {
            admin.email = '123';
            const res = await exec();

            expect(res.status).toBe(400)
        });

        it ('should return a 400 status if invalid input phoneNumber is passed', async () => {
            admin.phoneNumber = '123';
            const res = await exec();

            expect(res.status).toBe(400)
        });

        it ('should return a 400 status if there exist an admin with same phoneNumber', async () => {
            await Admin.collection.insertOne({ username: "abcd", email: "abcd@gmail.com", password: "12345678900", phoneNumber: "09034119762"})
            admin.phoneNumber = '09034119762';
            const res = await exec();

            expect(res.status).toBe(400)
            expect(res.body.data).toMatch(/theres a user with same phoneNumber/)
        });

        it ('should return a 400 status if there exist an admin with same email', async () => {
            await Admin.collection.insertOne({ username: "abcd", email: "abcd@gmail.com", password: "12345678900", phoneNumber: "09034119762"})
            admin.email = 'abcd@gmail.com';
            const res = await exec();

            expect(res.status).toBe(400)
            expect(res.body.data).toMatch(/theres a user with same email/)
        });  

        it ('should 200 with all valid inputs', async () => {
            const res = await exec();

            expect(res.status).toBe(200)
            expect(res.body.message).toMatch(/success/)
        }); 
    });
});