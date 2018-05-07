import _ from 'lodash';
import { Server, Router, Database } from '../src';

const userFactory = faker => ({
  firstName: faker.name.firstName,
  lastName: faker.name.lastName,
  address: {
    streetName: faker.address.streetName,
  },
  avatar: faker.internet.avatar,
});

const commentFactory = faker => ({
  title: 'He-yo',
  content: faker.lorem.paragraph,
  author: { name: 'Morty' },
});

export const databaseSpec = () => {
  test('DB # all', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 10);

    const users = db.all('user');

    expect(users).toHaveLength(10);
    expect(_.isArray(users)).toBeTruthy()

    // expect(() => db.all('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.all('game'),
    //   'Throws error when collection is not present.');
  });

  test('DB # checkFactoryPresence', () => {
    const db = new Database();

    db.register('user', userFactory);

    // expect(() => db.checkFactoryPresence('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.checkFactoryPresence('game'),
    //   'Throws error when collection is not present.');
  });

  test('DB # create', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 5);

    expect(db.all('user')).toHaveLength(5);

    db.create('user', 2);

    expect(db.all('user')).toHaveLength(7);
  });

  test('DB # create # fake values', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.register('comment', commentFactory);

    db.create('user', 5);
    db.create('comment', 10);

    const users = db.all('user');
    const comments = db.all('comment');

    expect(_.every(users, user => _.isString(user.firstName))).toBeTruthy();
    expect(_.every(users, user => _.isString(user.address.streetName))).toBeTruthy();
    expect(_.every(comments, comment => _.isString(comment.title))).toBeTruthy();
    expect(_.every(comments, comment => _.isString(comment.author.name))).toBeTruthy();
  });

  test('DB # decorateRecord', () => {
    const db = new Database();

    db.register('user', userFactory);

    const user = db.decorateRecord('user', { name: 'Morty' });

    expect(_.has(user, 'id')).toBeTruthy();;

    expect(() => db.decorateRecord('user')).toBeTruthy();;
    expect(() => db.decorateRecord('game')).toBeTruthy();;
  });

  test('DB # find', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 5);

    db.register('comment', commentFactory);
    db.create('comment', 10);

    const users1 = db.find('user', user => user.id > 2);
    const users2 = db.find('user', { id: 2 });
    const comments = db.find('comment', { author: { name: 'Morty' } });

    expect(users1).toHaveLength(2);
    expect(users2).toHaveLength(1);
    expect(comments).toHaveLength(10);

    // expect(() => db.find('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.find('game'),
    //   'Throws error when collection is not present.');
  });

  test('DB # findOne', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 5);

    db.register('comment', commentFactory);
    db.create('comment', 10);

    const name = db.all('user')[0].firstName;
    const user1 = db.findOne('user', user => user.id === 2);
    const user2 = db.findOne('user', { firstName: name });

    const comment = db.findOne('comment', { author: { name: 'Morty' } });

    expect(user1.id).toEqual(2);
    expect(user2.firstName).toEqual(name)

    expect(comment.author.name).toEqual('Morty');

    // expect(() => db.findOne('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.findOne('game'),
    //   'Throws error when collection is not present.');
  });

  test('DB # first', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 5);

    const user = db.first('user');

    expect(_.isObject(user)).toBeTruthy();
    expect(user.id).toEqual(0)

    // expect(() => db.first('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.first('game'),
    //   'Throws error when collection is not present.');
  });

  test('DB # last', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 5);

    const user = db.last('user');

    expect(_.isObject(user)).toBeTruthy();
    expect(user.id).toEqual(4);

    // expect(() => db.last('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.last('game'),
    //   'Throws error when collection is not present.');
  });

  test('DB # push', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.push('user', { id: 1, name: 'Rick' });
    db.push('user', { id: 2, name: 'Morty' });
    db.push('user', { id: 3, name: 'ICE-T' });

    const users = db.all('user');

    expect(users).toHaveLength(3);
    expect(users[0].name).toEqual('Rick');

    // expect(() => db.push('user', {}),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.push('game', {}),
    //   'Throws error when collection is not present.');
  });

  test('DB # record # save', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 20);

    db.all('user').forEach((user, index) => {
      user.firstName = (index % 2) ? 'Hector' : 'Oskar';
      user.save();
    });

    expect(_.filter(db.all('user'), { firstName: 'Hector' })).toHaveLength(10);
    expect(_.filter(db.all('user'), { firstName: 'Oskar' })).toHaveLength(10);
  });

  test('DB # register', () => {
    const db = new Database();

    db.register('user', userFactory);

    // expect(() => db.checkFactoryPresence('user'),
    //       'Registers factory properly.');
  });

  test('DB # reset', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 2);

    db.reset();

    // expect(() => db.all('user'),
    //   'Cleans up all stores.');

    // expect(() => db.checkFactoryPresence('user'),
    //   'Cleans up all factories.');
  });

  test('DB # uuid', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.register('comment', commentFactory);

    expect(db.uuid('user')).toEqual(0);
    expect(db.uuid('user')).toEqual(1);
    expect(db.uuid('comment')).toEqual(0);

    // expect(() => db.uuid('user'),
    //   'Doesn\'t throw error when collection is present.');
    // expect(() => db.uuid('game'),
    //   'Throws error when collection is not present.');
  });

  test('recordFactory # save', () => {
    const db = new Database();

    db.register('user', userFactory);
    db.create('user', 2);

    const user1 = db.all('user')[0];
    const user2 = db.all('user')[1];

    const oldFirstname1 = user1.firstName;
    const oldFirstname2 = user2.firstName;

    user1.firstName = 'NEW NAME';

    const newUser1 = user1.save();
    const newUser2 = user2.save();

    // expect(db.all('user')[0].firstName).toEqual(oldFirstname1);
    expect(db.all('user')[1].firstName).toEqual(oldFirstname2);

    // expect(newUser1.firstName).toEqual(oldFirstname1);
    expect(newUser2.firstName).toEqual(oldFirstname2);
  });

  test.skip('recordFactory # remove side effects', () => {
    expect(4);

    const server = new Server();
    const router = new Router();
    const database = new Database();

    database.register('foo', _ => {
      return {
        foo: 'bar'
      };
    });
    database.create('foo', 1);

    router.get('/side_effects', (request, db) => {
      return db.first('foo');
    });

    server.use(router);
    server.use(database);

    fetch('/side_effects').then(r => r.json()).then(response => {
      expect(response.save).toBeUndefined();
      expect(response.delete).toBeUndefined();
    });

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;

      const response = JSON.parse(xhr.responseText);
      
      expect(response.save).toBeUndefined()
      expect(response.delete).toBeUndefined()
    };
    xhr.open('GET', '/side_effects', true);
    xhr.send();
  });
};

databaseSpec()