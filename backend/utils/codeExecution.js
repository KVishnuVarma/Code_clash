const { exec } = require("child_process");

const executeCode = (language, code, input) => {
  return new Promise((resolve, reject) => {
    let command;

    if (language === "Python") {
      command = `python -c "${code}"`;
    } else if (language === "JavaScript") {
      command = `node -e "${code}"`;
    } else {
      return reject("Unsupported language");
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Execution Error:", error);
        return resolve({ stdout: null, stderr: stderr.trim() });
      }

      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
};

module.exports = { executeCode };
