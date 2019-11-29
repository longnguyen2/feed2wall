const phantom = require('phantom');
const createCrawlerPage = require('./PageFactory').createCrawlerPage;
const uuidv4 = require('uuid/v4');
const { debounce } = require('lodash');

let instance;
const pagePool = {};
const destroyPageJobs = {};

async function createPhantomInstance() {
  instance = await phantom.create();
}

async function createNewPage(pageType) {
  if (Object.keys(pagePool).length === 0) {
    await createPhantomInstance();
  }
  const phantomPage = await instance.createPage();
  const id = uuidv4();
  pagePool[id] = createCrawlerPage(pageType, phantomPage);
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