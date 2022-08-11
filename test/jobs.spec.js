const request = require('supertest');
const app = require('../src/app');


describe('Test unpaid jobs endpoint', () => {
  beforeAll(async () => {
    const storage = './test-database.sqlite3';
    const {sequelize} = require('../src/models')(storage);
    const seed = require('../scripts/seedDb')(storage);

    app.set('sequelize', sequelize);
    app.set('models', sequelize.models);

    await seed();
  });


  test('It should return 401 for unauthenticated users', async () => {
    const response = await request(app).get('/jobs/unpaid');

    expect(response.statusCode).toBe(401);
  });

  test('It should return list of unpaid jobs', async () => {
    const response = await request(app)
        .get('/jobs/unpaid')
        .set('profile_id', 1);

    expect(response.statusCode).toBe(200);
    expect(response.body.map((x) => x.id)).toEqual([2]);
  });
});
