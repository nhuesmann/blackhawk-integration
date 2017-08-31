# Blackhawk PIN Generator

Generates PIN codes for desired UPCs and quantities and creates a CSV of the PINs.

## Usage

Edit `order.json` and change the quantities for each UPC to reflect desired
order quantities. Then, from the console:
```shell
$ node generate_pin.js
```
The created CSV will be found in the `/csv` directory.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
