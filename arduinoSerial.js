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

  async function sendData() {
    if (typeof getMessage === "function") {
      data = await getMessage();
      if (typeof data !== "undefined") {
        console.log("writing message");
        console.log(data);
        port.write(data + "\n");
      }
    }
  }

  setInterval(sendData, 500);
}

function formatTimers(activeTimers) {
  if (activeTimers.length === 0) {
    return "No active timers";
  } else {
    let str = activeTimers[0].tasks[0].title
      .replace(/\**/, "")
      .replace(/TODO/, "")
      .replace(/IN-PROGRESS/, "")
      .replace(/\/*/g, "")
      .replace(/[\s]+/g, " ")
      .trim();

    str +=
      "_Started: " +
      activeTimers[0].tasks[0].clocks[0]
        .replace(/CLOCK:/g, "")
        .replace(/\[/g, "")
        .replace(/\]/g, "")
        .replace(/[\s]+/g, " ")
        .replace(/[a-z]*/gi, "")
        .replace(/[0-9]{4}-[0-9]{2}-[0-9]{2}/gi, "")
        .trim();
    return str;
  }
}

module.exports = { setupArduino, formatTimers };
