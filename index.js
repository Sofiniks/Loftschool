const yargs = require('yargs');
const path = require('path');
const util = require('util');
const { readdir, statSync, access, mkdir, copyFile } = require('fs');

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('1.0.1')
  .alias('version', 'v')
  .example('node $0 --entry ./path --dist ./path -D')
  .option('entry', {
    alias: 'e',
    describe: 'Указывает путь к читаемой директории',
    demandOption: true
  })
  .option('dist', {
    alias: 'd',
    describe: 'Указывает путь к исходной директории',
    default: './output'
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удалить ли папку ?',
    default: false,
    boolean: true
  })
  .epilog('Homework 1')
  .argv;

const config = {
  entry: path.resolve(__dirname, args.entry),
  dist: path.resolve(__dirname, args.dist),
  delete: args.delete
};

const read = util.promisify(readdir);
const copy = util.promisify(copyFile);
const accessAsync = util.promisify(access);
const mkDirAsync = util.promisify(mkdir);

const copyFiles = async (file, currentPath) => {
  try {
    await accessAsync(config.dist);
  } catch (error) {
    mkDirAsync((config.dist), { recursive: true }).catch(err => { if (err) throw err; });
  }
  const firstLetter = file.substr(0, 1);
  try {
    await accessAsync(`${config.dist}/${firstLetter.toUpperCase()}`);
  } catch (error) {
    mkDirAsync(path.resolve(config.dist, firstLetter.toUpperCase()), { recursive: true }).catch(err => { if (err) throw err; });
  }

  const newPath = path.resolve(`${config.dist}/${firstLetter.toUpperCase()}`, file);
  copy(currentPath, newPath).catch(err => { if (err) throw err; });
};

const organizePaths = (arr, src) => {
  arr.filter(item => item.substr(0, 1) !== '.').forEach(async file => {
    const currentPath = path.resolve(src, file);
    const stat = statSync(currentPath);

    if (stat.isDirectory()) {
      reader(currentPath);
    } else {
      copyFiles(file, currentPath);
    }
  });
};

const reader = src => {
  read(src).then(items => organizePaths(items, src));
};

try {
  reader(config.entry);
} catch (error) {
  console.log(error);
}
