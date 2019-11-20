const phantom = require('phantom');
const InstagramPage = require('./InstagramPage');
const uuidv4 = require('uuid/v4');
const { debounce } = require('lodash');

let instance;
const pagePool = {};
const destroyPageJobs = {};

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
  createDestroyJob(id);
  return id;
}

async function destroyPage(id) {
  await pagePool[id].destroy();
  delete pagePool[id];
  if (Object.keys(pagePool).length === 0) {
    await instance.exit();
  }
}

function createDestroyJob(id, timeToLive) {
  const destroyJob = debounce(() => destroyPage(id), timeToLive);
  destroyJob();
  destroyPageJobs[id] = destroyJob;
}

function resetDestroyJob(id) {
  destroyPageJobs[id].cancel();
  createDestroyJob(id, 60 * 1000);
}

function getPage(id) {
  if (pagePool[id]) {
    resetDestroyJob(id);
  }
  return pagePool[id];
}

module.exports = { createNewPage, getPage }