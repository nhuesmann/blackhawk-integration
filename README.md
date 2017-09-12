# Blackhawk Integration App

Provides functionality for both generating PIN codes for submission to Blackhawk
and uploading a CSV of new PIN codes to the apps server database for redemption.

## Installation

Download the repo. Create `config.json` and `order.json` files in the root
directory. Fill each with the following, respectively:

**config.json:**
```json
{
  "production": {
    "ENDPOINT": "apps server staging url here",
    "BATCH_SIZE": 50
  },
  "staging": {
    "ENDPOINT": "apps server production url here",
    "BATCH_SIZE": 50
  }
}
```

**order.json:**
```json
[{
  "denomination": 25,
  "upc": "$25 gift card upc here",
  "quantity": 2000
}, {
  "denomination": 50,
  "upc": "$50 gift card upc here",
  "quantity": 2000
}]
```

Run the initialization function from the console:
```shell
$ npm run blackhawk_init
```

## Usage - Generate Pins

Edit `order.json` and change the quantities for each UPC to reflect desired
order quantities. Then, from the console:

**Staging:**
```shell
$ npm run generate_pins_staging
```
**Production**
```shell
$ npm run generate_pins_production
```

The created CSV will be found in the `/csv/generated_pins` directory.

## Usage - Update Database

**Edit the data file**

Blackhawk sends the data files in a `.txt` format. Edit the text files by doing
the following:
* Delete the top line of the file (should begin with "sof")
* Delete the bottom line of the file (should begin with "eof")
* Save the file
* From Finder, change the file's extension to `.csv`
* Move the CSV to `/csv/drop_here_to_populate_database`

**Run the app**

**Staging:**
```shell
$ npm run update_database_staging
```
**Production**
```shell
$ npm run update_database_production
```

The console will log a success message if the operation was successful.

**NOTE:** The size of the batch sent in a single call defaults to 50. This value
is editable within `config.json`, however it is recommended to leave it at 50 to
avoid Chef'd apps server timeouts.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
