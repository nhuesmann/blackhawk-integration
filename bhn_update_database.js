// TODO: archive csv from drop folder

// Makes a POST to the endpoint with gift card data. Sends smaller batches to
// avoid processing timeouts.
const updateDatabase = async (modules) => {
  const { fs, request, csvDir, log, endpoint, parse, batch_size } = modules;

  // Retrieves the CSV name from the drop directory.
  function getCSVName () {
    return fs.readdirSync(csvDir).filter(filename => {
      return filename.endsWith('.csv');
    })[0];
  };

  // Reads the CSV.
  function getCSVData () {
    return fs.readFileSync(`${csvDir}/${getCSVName()}`);
  };

  // Converts the order lines in the CSV to an array of order objects.
  function parseCSV () {
    return parse(getCSVData(), {columns: validateHeaders});
  };

  // Converts CSV headers into valid strings usable as object properties.
  function validateHeaders (headers) {
    return headers.map(function(header) {
      return header.replace(/\W/g, " ").replace(/\s+/g, "_").replace(/^_/, "").toLowerCase();
    });
  };

  // Transform each gift card object into the form required by the main process
  const giftCards = parseCSV().map(gc => {
    return {
      pin: gc.pin_nbr.toLowerCase(),
      pan: gc.card_nbr,
      amount: gc.amount,
      product_code: gc.product_cd.replace('-', ''),
      last_characters: gc.pin_nbr.slice(-4)
    }
  });

  let counter = giftCards.length;

  // Main loop
  for (let i = 0; i < giftCards.length; i += batch_size) {
    let chunk = giftCards.slice(i, i + batch_size);
    let message;
    counter -= chunk.length;

    let options = {
      method: 'POST',
      uri: endpoint,
      body: {
        gift_cards: chunk
      },
      json: true
    };

    try {
      const response = await request(options);
      message = `${response.data.response} ${counter} gift cards remaining.`;
    } catch(e) {
      message = `${e.error.message} ${chunk.length} cards starting at position ${i}. ${counter} gift cards remaining.`;
    }

    // Log the results
    fs.appendFileSync(log, `${new Date().toString()} ${message}\n`);
    console.log(message);
  }

  // Archive the CSV
  fs.renameSync(`${csvDir}/${getCSVName()}`, `${csvDir}/../archive/${getCSVName()}`);

  fs.appendFileSync(log, `${new Date().toString()} All gift cards processed.\n`);
  console.log('All gift cards processed.');
};

module.exports = { updateDatabase };
