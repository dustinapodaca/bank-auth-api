'use strict';

process.env.SECRET = 'bankSecret';

const { db, users } = require('../src/models/index');
const server = require('../src/server.js').server;
const supertest = require('supertest');

const mockRequest = supertest(server);

let user = {
  testUser: {
    username: 'testUser',
    password: 'testPassword',
    role: 'user'
  },
  testTeller: {
    username: 'testTeller',
    password: 'testPassword',
    role: 'teller'
  },
  testAdmin: {
    username: 'testAdmin',
    password: 'testPassword',
    role: 'admin'
  },
};

let testUser;
let testTeller;
let testAdmin;

beforeAll(async () => {
  await db.sync();
  testUser = await users.create({
    username: 'basicUser',
    password: 'basicPassword',
    role: 'user'
  });
  testTeller = await users.create({
    username: 'updateTeller',
    password: 'updatePassword',
    role: 'teller'
  });
  testAdmin = await users.create({
    username: 'fullAdmin',
    password: 'fullPassword',
    role: 'admin'
  });
});

afterAll(async () => {
  await db.drop();
});

describe('Auth Routes', () => {
  Object.keys(user).forEach((type) => {
    it(`should POST /signup a ${type}`, async () => {
      const response = await mockRequest.post('/signup').send(user[type]);
      const record = response.body;
      expect(response.status).toBe(201);
      expect(record.user.username).toEqual(user[type].username);
      expect(record.user.role).toEqual(user[type].role);
      expect(record.token).toBeDefined();
      expect(record.refreshToken).toBeDefined();
      expect(record.user.id).toBeDefined();
    });
  });

  Object.keys(user).forEach((type) => {
    it(`should POST /signin a ${type}`, async () => {
      const response = await mockRequest.post('/signin').auth(user[type].username, user[type].password);
      const record = response.body;
      expect(response.status).toBe(200);
      expect(record.user.username).toEqual(user[type].username);
      expect(record.user.role).toEqual(user[type].role);
      expect(record.token).toBeDefined();
      expect(record.refreshToken).toBeDefined();
      expect(record.user.id).toBeDefined();
    });
  });
  it('should deny access to GET all users with only basicAuth', async () => {
    const response = await mockRequest.get('/users').auth(user.testUser.username, user.testUser.password);
    const record = response.body;
    expect(response.status).toBe(500);
    expect(record.message).toEqual('Invalid Login');
  });
  it('should deny access to GET all users without update permissions', async () => {
    const response = await mockRequest.get('/users').set('Authorization', `Bearer ${testUser.token}`);
    const record = response.body;
    expect(response.status).toBe(500);
    expect(record.message).toEqual('Access Denied');
  });
  it('should allow access to GET all users with teller (update) permissions', async () => {
    const response = await mockRequest.get('/users').set('Authorization', `Bearer ${testTeller.token}`);
    const record = response.body;
    expect(response.status).toBe(200);
    expect(record[0].username).toEqual('basicUser');
    expect(record[1].username).toEqual('updateTeller');
    expect(record[2].username).toEqual('fullAdmin');
  });
  it('should allow access to GET all users with admin (update, delete) permissions', async () => {
    const response = await mockRequest.get('/users').set('Authorization', `Bearer ${testAdmin.token}`);
    const record = response.body;
    expect(response.status).toBe(200);
    expect(record[0].username).toEqual('basicUser');
    expect(record[1].username).toEqual('updateTeller');
    expect(record[2].username).toEqual('fullAdmin');
  });
  it ('should allow access to GET one user by id with teller and admin permissions', async () => {
    const response = await mockRequest.get(`/users/${testUser.id}`).set('Authorization', `Bearer ${testTeller.token}`);
    const record = response.body;
    expect(response.status).toBe(200);
    expect(record.username).toEqual('basicUser');
  });
});
