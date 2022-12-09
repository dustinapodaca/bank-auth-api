'use strict';

process.env.SECRET = 'bankSecret';

const supertest = require('supertest');
const { app } = require('../src/server');
const mockRequest = supertest(app);
const { db, users } = require('../src/models');
const base64 = require('base-64');

const userOne = {
  username: 'Dustin',
  password: 'dustinpass',
  role: 'admin',
};

const userTwo = {
  username: 'Jacob',
  password: 'jacobpass',
  role: 'banker',
};

beforeAll(async () => {
  await db.sync();
  await users.create(userOne);
  await users.create(userTwo);
});

afterAll(async () => {
  await db.drop();
  await db.close();
});

describe('/users route', () => {
  it('Succeeds only for admin users', async () => {
    let token = base64.encode(`${userOne.username}:${userTwo.password}`);
    let response = await mockRequest.post('/signin').set('Authorization', `Basic ${token}`).send();
    let bearerToken = response.body.token;
    let usersResponse = await mockRequest.get('/users').set('Authorization', `Bearer ${bearerToken}`);
    expect(usersResponse.status).toEqual(200);
  });

  it('error if non-admin', async () => {
    let token = base64.encode(`${userOne.username}:${userTwo.password}`);
    let response = await mockRequest.post('/signin').set('Authorization', `Basic ${token}`).send();
    let bearerToken = response.body.token;
    let usersResponse = await mockRequest.get('/users').set('Authorization', `Bearer ${bearerToken}`);
    expect(usersResponse.status).toEqual(500);
  });
});
