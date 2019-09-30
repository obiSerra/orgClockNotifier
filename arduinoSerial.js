const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

//const portPath = "/dev/tty.usbmodem14201";
const portPath = "/dev/cu.usbmodem14201";
const portConfig = { baudRate: 9600 };

const port = new SerialPort(portPath, portConfig);
//const parser = port.pipe(new Readline({ delimiter: "\n" }));

const data = "Hello";

port.on("open", openPort); // called when the serial port opens

function openPort() {
  var brightness = 0; // the brightness to send for the LED
  console.log("port open");
  //  console.log("baud rate: " + port.options.baudRate);

  // since you only send data when the port is open, this function
  // is local to the openPort() function:
  function sendData() {
    // convert the value to an ASCII string before sending it:
    port.write(data + "\n");
  }
  // set an interval to update the brightness 2 times per second:
  setInterval(sendData, 500);
}
