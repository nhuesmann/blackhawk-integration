const generatePins = async (modules) => {
  const { fs, request, csvDir, log, endpoint, stringify, order } = modules;

  var columns = {};
  var pins = [];

  var lastPin = await request(endpoint);

  function random () {
    return Math.floor(1000000 + Math.random() * 9000000);
  };

  function incrementString (string) {
    const toInt = +string + 1;
    return ('0000000' + toInt).slice(-7);
  };

  function generate (lastPinArg, quantity) {
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

    fs.writeFileSync(`${csvDir}/${dateStamp}-pins.csv`, output);
  });

  let orderTotal = order.reduce((prev, curr) => curr.quantity + prev.quantity);
  let message = `Successfully generated ${orderTotal} PINs.`;

  fs.appendFileSync(log, `${new Date().toString()} ${message}\n`);
  console.log(message);
};

module.exports = { generatePins };
