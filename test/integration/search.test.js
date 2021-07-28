let server;
const request = require('supertest');

describe('search /', () => {
    beforeEach(() => {
        server = require('../../app')
    });

    afterEach(() => {
        server.close();
    });

    let searchParams;

    const exec = async () => {
        return await request(server)
            .post('/api/search')
            .send({ searchParams })
    };

    beforeEach(() => {
        searchParams = 'abcd'
    })

    it ("should return a 400 error if search input is invalid", async () => {
        searchParams = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it ("should resolve a 200 status for valid inputs", async () => {
        const res = await exec();
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/success/);
    });
});