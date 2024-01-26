const express = require("express");
const fs = require("fs");
const readline = require("readline");

const app = express();
const port = 8080;

app.get("/data", (req, res) => {
  const { n, m } = req.query;

  if (!n) {
    return res.status(400).send("Parameter n is required.");
  }

  const filePath = `tmp/data/${n}.txt`;

  if (m) {
    const lineStream = createLineStream(filePath, m);
    lineStream.pipe(res);
  } else {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
});

function createLineStream(filePath, lineNumber) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentLine = 0;

  const lineStream = new require("stream").Transform({
    transform(chunk, encoding, callback) {
      if (currentLine == lineNumber - 1) {
        this.push(chunk);
      }
      currentLine++;
      callback();
    },
  });

  rl.on("line", (line) => {
    if (currentLine == lineNumber - 1) {
      lineStream.write(`${line}\n`);
      rl.close();
    }
    currentLine++;
  });

  rl.on("close", () => {
    lineStream.end();
  });

  return lineStream;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
