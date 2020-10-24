'use strict';

const path = require('path');
const fs = require('fs');
const neoblessed = require('@blessed/neo-blessed');

class BlessedUtils {
  constructor(screen, configFile, styles) {
    this.screen = screen;
    this.configFile = configFile;
    this.styles = styles;
  }

  getManifest() {
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

  getTheme() {
    const configPath =
      process.env.OS === 'Windows_NT'
        ? path.resolve(process.env.APPDATA, `${this.configFile}`)
        : path.resolve(process.env.HOME, `.config/${this.configFile}`);

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
    const theme = this.styles(colors.colors);
    return theme;
  }

  runCommand(cmd) {
    const theme = this.getTheme();
    const {
      terminal: { border, style },
    } = theme;
    const terminal = neoblessed.terminal({
      parent: this.screen,
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
    this.screen.append(terminal);
    this.screen.render();
    terminal.focus();

    terminal.key('escape', function () {
      terminal.detach();
    });

    terminal.pty.write(`${cmd}\r\n`);
  }
}

module.exports = { BlessedUtils };
