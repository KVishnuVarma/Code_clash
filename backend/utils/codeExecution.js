const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const executeCode = (language, code, input) => {
  return new Promise((resolve, reject) => {
    let command;
    let tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const uniqueId = uuidv4();
    let filePath, execCmd, cleanup;

    if (language.toLowerCase() === "python") {
      filePath = path.join(tempDir, `code_${uniqueId}.py`);
      fs.writeFileSync(filePath, code);
      execCmd = `python "${filePath}"`;
      cleanup = () => fs.unlinkSync(filePath);
    } else if (language.toLowerCase() === "javascript") {
      filePath = path.join(tempDir, `code_${uniqueId}.js`);
      fs.writeFileSync(filePath, code);
      execCmd = `node "${filePath}"`;
      cleanup = () => fs.unlinkSync(filePath);
    } else if (language.toLowerCase() === "java") {
      // Java: Write to Solution.java, compile, then run
      const javaDir = path.join(tempDir, `java_${uniqueId}`);
      fs.mkdirSync(javaDir);
      filePath = path.join(javaDir, "Solution.java");
      fs.writeFileSync(filePath, code);
      execCmd = `cd "${javaDir}" && javac Solution.java && java Solution`;
      cleanup = () => {
        fs.rmSync(javaDir, { recursive: true, force: true });
      };
    } else if (language.toLowerCase() === "cpp" || language.toLowerCase() === "c++") {
      // C++: Write to Solution.cpp, compile, then run
      const cppDir = path.join(tempDir, `cpp_${uniqueId}`);
      fs.mkdirSync(cppDir);
      filePath = path.join(cppDir, "Solution.cpp");
      fs.writeFileSync(filePath, code);
      execCmd = `cd "${cppDir}" && g++ Solution.cpp -o Solution && ./Solution`;
      cleanup = () => {
        fs.rmSync(cppDir, { recursive: true, force: true });
      };
    } else {
      return reject("Unsupported language");
    }

    const child = exec(execCmd, { timeout: 5000 }, (error, stdout, stderr) => {
      if (cleanup) cleanup();
      if (error) {
        return resolve({ stdout: stdout ? stdout.trim() : null, stderr: stderr ? stderr.trim() : error.message });
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
    if (input) {
      child.stdin.write(input);
      if (!input.endsWith("\n")) child.stdin.write("\n");
      child.stdin.end();
    }
  });
};

module.exports = { executeCode };
