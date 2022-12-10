'use strict';

process.env.SECRET = 'bankSecret';

const { db, users } = require('../src/models/index');
// const bankRoutes = require('../src/routes/bankRoutes');
const server = require('../src/server.js').server;
const supertest = require('supertest');

const mockRequest = supertest(server);

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

describe('Bank RBAC Routes', () => {
  const deposit = {
    typeof: 'check',
    amount: 1387
  };
  const withdrawal = {
    typeof: 'cash',
    amount: 380
  };
  it('should allow teller access (update) to PUT a deposit in any user account and update user balance', async () => {
    const response = await mockRequest
      .put(`/transaction/deposit/${testUser.id}`)
      .send(deposit)
      .set('Authorization', `Bearer ${testTeller.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record.balance).toEqual(1387);
    expect(record.username).toEqual('basicUser');
    expect(record.accountNumber).toBeDefined();
  });
  it('should allow teller access (update) PUT a withdrawal in any user account and update user balance', async () => {
    const response = await mockRequest
      .put(`/transaction/withdrawal/${testUser.id}`)
      .send(withdrawal)
      .set('Authorization', `Bearer ${testTeller.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record.balance).toEqual(1007);
    expect(record.username).toEqual('basicUser');
    expect(record.accountNumber).toBeDefined();
  });
  it('should allow admin access (update, delete) to PUT a deposit in any user account and update user balance', async () => {
    const response = await mockRequest
      .put(`/transaction/deposit/${testTeller.id}`)
      .send(deposit)
      .set('Authorization', `Bearer ${testAdmin.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record.balance).toEqual(1387);
    expect(record.username).toEqual('updateTeller');
    expect(record.accountNumber).toBeDefined();
  });
  it('should allow admin access (update, delete) PUT a withdrawal in any user account and update user balance', async () => {
    const response = await mockRequest
      .put(`/transaction/withdrawal/${testTeller.id}`)
      .send(withdrawal)
      .set('Authorization', `Bearer ${testAdmin.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record.balance).toEqual(1007);
    expect(record.username).toEqual('updateTeller');
    expect(record.accountNumber).toBeDefined();
  });
  it('should deny user access (read, create) to PUT a deposit in user account', async () => {
    const response = await mockRequest
      .put(`/transaction/deposit/${testUser.id}`)
      .send(deposit)
      .set('Authorization', `Bearer ${testUser.token}`);
    const record = response.body;
    expect(response.status).toEqual(500);
    expect(record.error).toBeDefined();
    expect(record.body.typeof).toEqual('check');
    expect(record.body.amount).toEqual(1387);
    expect(record.message).toEqual('Access Denied');
  });
  it('should deny user access (read, create) PUT a withdrawal in user account', async () => {
    const response = await mockRequest
      .put(`/transaction/withdrawal/${testUser.id}`)
      .send(withdrawal)
      .set('Authorization', `Bearer ${testUser.token}`);
    const record = response.body;
    expect(response.status).toEqual(500);
    expect(record.error).toBeDefined();
    expect(record.body.typeof).toEqual('cash');
    expect(record.body.amount).toEqual(380);
    expect(record.message).toEqual('Access Denied');
  });
  it('should deny user access (read, create) to GET all user accounts', async () => {
    const response = await mockRequest
      .get(`/transaction/users`)
      .set('Authorization', `Bearer ${testUser.token}`);
    const record = response.body;
    expect(response.status).toEqual(500);
    expect(record.error).toBeDefined();
    expect(record.message).toEqual('Access Denied');
  });
  it('should deny user access (read, create) to GET a different user account', async () => {
    const response = await mockRequest
      .get(`/transaction/users/myaccount/${testTeller.id}`)
      .set('Authorization', `Bearer ${testUser.token}`);
    const record = response.body;
    expect(response.status).toEqual(500);
    expect(record.error).toBeDefined();
    expect(record.message).toEqual('Access Denied: Invalid User Account');
  });
  it('should allow user access (read, create) to GET their own user account', async () => {
    const response = await mockRequest
      .get(`/transaction/users/myaccount/${testUser.id}`)
      .set('Authorization', `Bearer ${testUser.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record.username).toEqual('basicUser');
    expect(record.accountNumber).toBeDefined();
  });
  it('should allow teller and admin access to GET all user accounts', async () => {
    const response = await mockRequest
      .get(`/transaction/users`)
      .set('Authorization', `Bearer ${testAdmin.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record[0].accountNumber).toBeDefined();
    expect(record[1].accountNumber).toBeDefined();
    expect(record[2].accountNumber).toBeDefined();
  });
  it('should allow teller and admin access to GET a different user account by id', async () => {
    const response = await mockRequest
      .get(`/transaction/users/${testTeller.id}`)
      .set('Authorization', `Bearer ${testAdmin.token}`);
    const record = response.body;
    expect(response.status).toEqual(200);
    expect(record.username).toEqual('updateTeller');
    expect(record.accountNumber).toBeDefined();
  });
  it('should deny user and teller access (read, create, update) to DELETE a user account', async () => {
    const response = await mockRequest
      .delete(`/transaction/users/${testUser.id}`)
      .set('Authorization', `Bearer ${testTeller.token}`);
    expect(response.status).toEqual(500);
  });
  it('should allow admin access (update, delete) to DELETE a user account', async () => {
    const response = await mockRequest
      .delete(`/transaction/users/${testUser.id}`)
      .set('Authorization', `Bearer ${testAdmin.token}`);
    expect(response.status).toEqual(200);
  });
});
