const argv = require('yargs').argv;
const config = require('./config.json');

const modules = {
  fs: require('fs'),
  request: require('request-promise'),
  csvDir: `${__dirname}/csv`,
  log: `${__dirname}/log`
};

if (argv.init) return init(modules);

const environment = argv.production ? 'production' : argv.staging ? 'staging' : null;
if (!environment) return console.log('Please specify the execution environment.');

function init (modules) {
  let dirs = [
    modules.log,
    modules.csvDir,
    `${modules.csvDir}/drop_here_to_populate_database`,
    `${modules.csvDir}/generated_pins`,
    `${modules.csvDir}/archive`
  ];

  dirs.forEach((dir) => {
    if (!modules.fs.existsSync(dir)) { modules.fs.mkdirSync(dir); }
  });
  console.log('All required directories present.');
}

if (argv.generate_pins) {
  let {generatePins} = require('./bhn_generate_pins');
  modules.stringify = require('csv-stringify');
  modules.order = require('./order.json');
  modules.csvDir += '/generated_pins';
  modules.log += '/bhn_generate_pins.log';
  modules.endpoint = `${config[environment].ENDPOINT}/lastpin`;
  generatePins(modules);

} else if (argv.update_database) {
  let {updateDatabase} = require('./bhn_update_database');
  modules.parse = require('csv-parse/lib/sync');
  modules.batch_size = config[environment].BATCH_SIZE;
  modules.csvDir += '/drop_here_to_populate_database';
  modules.log += '/bhn_update_database.log';
  modules.endpoint = `${config[environment].ENDPOINT}/populatebhn`;
  updateDatabase(modules);
}
