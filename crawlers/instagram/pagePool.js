const phantom = require('phantom');
const InstagramPage = require('./InstagramPage');
const uuidv4 = require('uuid/v4');

let instance;
const pagePool = {};

async function createPhantomInstance() {
  instance = await phantom.create();
}

async function createNewPage() {
  if (Object.keys(pagePool).length === 0) {
    await createPhantomInstance();
  }
  const page = await instance.createPage();
  const id = uuidv4();
  pagePool[id] = new InstagramPage(page);
  return id;
}

async function destroyPage(id) {
  await pagePool[id].destroy();
  delete pagePool[id];
  if (Object.keys(pagePool).length === 0) {
    await instance.exit();
  }
}

function getPage(id) {
  return pagePool[id];
}

module.exports = { createNewPage, getPage }