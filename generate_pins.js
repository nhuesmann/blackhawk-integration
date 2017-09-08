const stringify = require('csv-stringify');
const fs = require('fs');
const request = require('request-promise');
const order = require('./order.json');

var columns = {};
var pins = [];

// TODO: add the url to the env/config (after merging the projects)
const generatePins = async () => {
  var lastPin = await request('https://apps-staging.chefd.com/v1/lastpin');

  const random = () => {
    return Math.floor(1000000 + Math.random() * 9000000);
  };

  const incrementString = (string) => {
    const toInt = +string + 1;
    return ('0000000' + toInt).slice(-7);
  };

  const generate = (lastPinArg, quantity) => {
    let counter = lastPinArg.slice(-9).slice(0, 7);

    for (let i = 0; i < quantity; i++) {
      counter = incrementString(counter);

      let pin = `${random()}${counter}BH`;
      if (!pins[i]) {
        pins.push([pin]);
      } else {
        pins[i] = pins[i].concat([pin]);
      }
    };

    lastPin = pins[pins.length - 1][0];
  };

  order.forEach((order, index) => {
    generate(lastPin, order.quantity);
    columns[`card${1 + index}`] = order.upc;
  });

  stringify(pins, {
    columns,
    header: true
  }, (err, output) => {
    if (err) {
      console.log(err);
    }

    let dateStamp = (new Date()).toISOString().slice(0,10).replace(/-/g,"");
    let dir = `${__dirname}/csv`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(`${dir}/${dateStamp}-pins.csv`, output);
  });
};

generatePins();
