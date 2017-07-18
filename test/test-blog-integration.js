const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogPostData() {
  console.info('seeing blog post data');
  const seedData = [];

  //do i need this? i only have 11 things in my seed data
  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogPostData());
  }

  return BlogPost.insertMany(seedData)
}

function generateTitle() {
  const titles = [
    'A title', 'A good title', 'A better title', 'An even better title', 'The best title'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateAuthor() {
  const authors = [
    {'firstName': faker.name.firstName(), 'lastName': faker.name.lastName()}, {'firstName': faker.name.firstName(), 'lastName': faker.name.lastName()}, {'firstName': faker.name.firstName(), 'lastName': faker.name.lastName()}];
  return authors[Math.floor(Math.random() * authors.length)];
}

function generateContent() {
  const contents = [faker.lorem.paragraphs(), faker.lorem.paragraph(), faker.lorem.words()];
  return contents[Math.floor(Math.random() * contents.length)];
}

function generateBlogPostData() {
  return {
    title: generateTitle(),
    author: generateAuthor(),
    content: generateContent()
  }
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  describe('GET endpoint', function() {
    it('should return all existing blog posts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          res.should.have.status(200);
          res.body.posts.should.have.length.of(count);
        });
    });

    it('should return posst with the right fields', function() {
      let resBlogPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.posts.should.be.a('array');
          res.body.posts.should.have.length.of.at.least(1);

          res.body.posts.forEach(function(post) {
            post.should.be.a('object');
            //not sure if we need id?
            post.should.include.keys(
              'id', 'title', 'author', 'content');
            });
            resBlogPost = res.body.posts[0];
            return BlogPost.findById(resBlogPost.id);
          })
          .then(function(post) {
            resBlogPost.id.should.equal(post.id);
            resBlogPost.title.should.equal(post.title);
            resBlogPost.author.should.equal(post.author);
            resBlogPost.content.should.equal(post.content)
          });
    });
  });



})