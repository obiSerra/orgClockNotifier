const fs = require("fs");
const readline = require("readline");
const path = require("path");

const arduinoSerial = require("./arduinoSerial");
const { setupArduino, formatTimers } = arduinoSerial;
// @TODO - move config out
const configFile = "./config.json";
function readConfig(conf) {
  try {
    let dataRaw = fs.readFileSync(conf);
    return JSON.parse(dataRaw);
  } catch (e) {
    logError(e);
    return {};
  }
}
const conf = readConfig(configFile);

const { orgDir, runEvery } = conf;

function prettyPrint(data) {
  console.log(JSON.stringify(data, null, 2));
}

function logError(err) {
  console.error("[-] Error");
  console.error(err);
}

function logWarning(message) {
  console.warn("[-] Warning");
  console.warn(message);
}

async function findOrgFiles(folder) {
  return new Promise((done, reject) => {
    fs.readdir(folder, (err, files) => {
      if (err) reject(err);
      else done(files);
    });
  })
    .then(files =>
      files.filter(f => f.match(/\.org$/)).map(f => path.resolve(folder, f))
    )
    .catch(err => {
      logError(err);
      return false;
    });
}

async function collectTimersFromFile(filename) {
  const res = { filename, tasks: [] };
  return new Promise((done, reject) => {
    try {
      let title = false;
      let clocks = [];
      const rl = readline.createInterface({
        input: fs.createReadStream(filename)
      });
      rl.on("error", err => reject(err));
      rl.on("line", line => {
        if (line.match(/^\*/)) {
          if (title && clocks.length > 0) {
            res.tasks.push({ title, clocks });
          }
          title = line;
          clocks = [];
        } else if (line.match(/^\s*CLOCK:/)) {
          clocks.push(line.trim());
        }
      });

      rl.on("close", _ => done(res));
    } catch (err) {
      reject(err);
    }
  })
    .catch(error => {
      logError(error);
      return false;
    })
    .then(_ => res);
}

async function getTimers(dir) {
  const files = await findOrgFiles(dir);
  if (files.length == 0) {
    logWarning("No timers found in " + dir);
    return false;
  }
  const timers = await Promise.all(files.map(collectTimersFromFile));
  return timers.filter(t => t.tasks.length > 0);
}

function getActiveTimers(timers) {
  // @TODO rewrite to avoid filter and map
  const activeFilterReg = /\[[a-z0-9-\s:]*\]$/i;
  return timers
    .filter(t =>
      t.tasks.some(
        tk => tk.clocks.filter(c => c.match(activeFilterReg)).length > 0
      )
    )
    .map(t => ({
      filename: t.filename,
      tasks: t.tasks
        .map(tk => ({
          title: tk.title,
          clocks: tk.clocks.filter(c => c.match(activeFilterReg))
        }))
        .filter(tk => tk.clocks.length > 0)
    }));
}

function printActiveTimers(activeTimers) {
  if (activeTimers.length === 0) {
    console.log("No active timers");
  } else {
    activeTimers.forEach(timer => {
      console.log("[+] Active Timers:");
      timer.tasks.forEach(tk => {
        console.log("    Task:" + tk.title.replace(/^\**/, ""));
        tk.clocks.forEach(c => {
          console.log(
            "    Started at:" +
              c
                .replace(/CLOCK:/i, "")
                .replace(/\[/g, "")
                .replace(/\]/g, "")
          );
        });
      });
      console.log("    File: " + timer.filename);
    });
  }
}

const statusFile = "./status.txt";
async function readStatus() {
  return new Promise((done, reject) => {
    fs.readFile(statusFile, "utf8", (err, data) => {
      if (err) throw err;
      done(data);
    });
  })
    .catch(err => {
      logError(err);
      return false;
    })
    .then(data =>
      data
        .replace(/\n/g, "_")
        .replace(/^_*/, "")
        .replace(/_*$/g, "")
    );
}

let currentMessage = false;

async function run() {
  const timers = await getTimers(orgDir);
  const newActiveTimers = await getActiveTimers(timers);
  const status = await readStatus();
  if (
    newActiveTimers.length === 0 &&
    JSON.stringify(status) !== JSON.stringify(currentMessage)
  ) {
    currentMessage = status;
    return status;
  } else if (
    newActiveTimers.length &&
    JSON.stringify(newActiveTimers) !== JSON.stringify(currentMessage)
  ) {
    currentMessage = newActiveTimers;
    return formatTimers(newActiveTimers);
  }
}

setupArduino(run);

async function runConstantly() {
  await run();
  setTimeout(runConstantly, runEvery);
}
//runConstantly();
