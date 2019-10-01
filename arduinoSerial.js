const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

//const portPath = "/dev/tty.usbmodem14201";
//const portPath = "/dev/cu.usbmodem14201";
const portPath = "/dev/ttyS5";
const portConfig = { baudRate: 9600 };

const port = new SerialPort(portPath, portConfig);
//const parser = port.pipe(new Readline({ delimiter: "\n" }));

let data = "Hello";

function setupArduino(getMessage) {
  port.on("open", () => openPort(getMessage));
}

async function openPort(getMessage) {
  console.log("port open");
  //  console.log("baud rate: " + port.options.baudRate);

  // since you only send data when the port is open, this function
  // is local to the openPort() function:
  async function sendData() {
    // convert the value to an ASCII string before sending it:
    if (typeof getMessage === "function") {
      data = await getMessage();
      if (typeof data !== "undefined") {
        console.log("writing message");
        console.log(data);
        port.write(data + "\n");
      }
    }
  }
  // set an interval to update the brightness 2 times per second:
  setInterval(sendData, 500);
}
module.exports = { setupArduino };
