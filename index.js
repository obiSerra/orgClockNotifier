const fs = require("fs");
const readline = require("readline");
const path = require("path");

// @TODO - move config out
const orgDir = "/Users/roberto/Dropbox/org-docs";

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
      t.tasks.some(tk => tk.clocks.some(c => c.match(activeFilterReg)))
    )
    .map(t => ({
      filename: t.filename,
      tasks: t.tasks.map(tk => ({
        title: tk.title,
        clocks: tk.clocks.filter(c => c.match(activeFilterReg))
      }))
    }));
}

function printActiveTimers(activeTimers) {
  activeTimers.forEach(timer => {
    console.log("Active Timer in file: " + timer.filename);
    timer.tasks.forEach(tk => {
      console.log("Task:" + tk.title.replace(/^\**/, ""));
      tk.clocks.forEach(c => {
        console.log(
          "Timer started at:" +
            c
              .replace(/CLOCK:/i, "")
              .replace(/\[/g, "")
              .replace(/\]/g, "")
        );
      });
    });
  });
}

async function run() {
  const timers = await getTimers(orgDir);
  console.log(
    "---------------------------------------------------------------------------------------------------"
  );
  const activeTimers = getActiveTimers(timers);
  printActiveTimers(activeTimers);
}

run();
