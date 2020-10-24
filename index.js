'use strict';

const path = require('path');
const fs = require('fs');
const neoblessed = require('@blessed/neo-blessed');

function getManifest() {
  let pkg = {
    scripts: {},
    devDependencies: {},
    dependencies: {},
  };

  try {
    pkg = require(process.cwd() + '/package.json');
  } catch (e) {
    // throw error
  }

  return pkg;
}

function getTheme(configFile, styles) {
  const configPath =
    process.env.OS === 'Windows_NT'
      ? path.resolve(process.env.APPDATA, `${configFile}`)
      : path.resolve(process.env.HOME, `.config/${configFile}`);

  let config = { theme: 'Dracula' };
  try {
    config = require(configPath);
  } catch (e) {
    // Write config file
    fs.writeFile(configPath, JSON.stringify(config, null, 2), (err) => {
      if (err) throw err;
    });
  }

  const colors = require(`blessed-themes/themes/${config.theme}`);
  const theme = styles(colors.colors);
  return theme;
}

function runCommand(screen, cmd, configFile) {
  const theme = getTheme(configFile);
  const {
    terminal: { border, style },
  } = theme;
  const terminal = neoblessed.terminal({
    parent: screen,
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%',
    border,
    style,
    label: cmd,
    fullUnicode: true,
    screenKeys: false,
    cwd: process.env.PWD,
  });
  screen.append(terminal);
  screen.render();
  terminal.focus();

  terminal.key('escape', function () {
    terminal.detach();
  });

  terminal.pty.write(`${cmd}\r\n`);
}

module.exports = {
  getManifest,
  getTheme,
  runCommand,
};
