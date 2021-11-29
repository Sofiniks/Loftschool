const yargs = require('yargs');
const path = require('path');
const { readdir, stat, mkdir, access, rename } = require('fs');

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

const reader = src => {
  readdir(src, function (err, files) {
    if (err) throw err;
    if (!files.length) throw new Error('Нет файлов!');

    files.forEach(function (file) {
      const currentPath = path.resolve(src, file);

      stat(currentPath, function (err, stats) {
        if (err) throw err;

        if (stats.isDirectory()) {
          reader(currentPath);
        } else {
          access(config.dist, err => {
            if (err) {
              mkdir(config.dist, { recursive: true }, (err) => {
                if (err) throw err;
              });
            } else {
              const firstLetter = file.substr(0, 1);
              if (firstLetter !== '.') {
                access(`${config.dist}/${firstLetter.toUpperCase()}`, err => {
                  if (err) {
                    mkdir(`${config.dist}/${firstLetter.toUpperCase()}`, { recursive: true }, (err) => {
                      if (err) throw err;
                    });
                  }
                  const oldPath = path.join(__dirname, currentPath);
                  const newPath = path.join(__dirname, `${config.dist}/${firstLetter.toUpperCase()}`, file);

                  rename(oldPath, newPath, function (err) {
                    if (err) {
                      throw err;
                    }
                  });
                });
              }
            }
          });
        }
      });
    });
  });
};

try {
  reader(config.entry);
} catch (error) {
  console.log(error);
}
