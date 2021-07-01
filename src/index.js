import algoliasearch from 'algoliasearch';
import { promises } from 'fs';
import { join } from 'path';

require("dotenv").config();

ensureNonEmptyArgs("MODE", "ALGOLIA_APP_ID", "ALGOLIA_ADMIN_KEY", "OUTPUT_PATH");
const algoliaClient = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

function ensureNonEmptyArgs(...args) {
  let counter = 0;
  for (const arg of args) {
    const value = process.env[arg];
    if (!value || value === "") {
      throw new Error(`Argument ${arg} was empty, this is NOT supported`);
    }

    counter++;
  }
}

async function exportData() {
  const { items } = await algoliaClient.listIndices();

  for (const { name } of items) {
    const index = algoliaClient.initIndex(name);
    const records = await getIndexData(index);

    const fqdn = join(process.env.OUTPUT_PATH, `${name}.json`);
    console.log("Writing to", fqdn);
    await promises.writeFile(fqdn, JSON.stringify(records), { encoding: 'utf-8' });
  }
}

async function importData() {
  const files = await promises.readdir(process.env.OUTPUT_PATH);
  for (const indexName of files) {
    const fqdn = join(process.env.OUTPUT_PATH, indexName);
    const { records, settings } = JSON.parse(await promises.readFile(fqdn));
    const index = algoliaClient.initIndex(indexName);
    if (settings) {
      await index.setSettings(settings);
    }

    if (records && records.length > 0) {
      await index.saveObjects(records, { autoGenerateObjectIDIfNotExist: false });
    }
  }
}

async function getIndexData(index) {
  let records = [];
  await index.browseObjects({
    batch: data => records = records.concat(data)
  });

  const settings = await index.getSettings();
  return { records, settings };
}

const mode = process.env.MODE.toLowerCase();
switch(mode) {
  case "import":
    importData().catch(e => console.error(e));
    break;
  case "export":
    exportData().catch(e => console.error(e));
    break;
  default:
    throw new Error(`Unknown mode "${mode}" encounterd`);
}