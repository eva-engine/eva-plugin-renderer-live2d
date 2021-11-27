/*
为开发和生产环境构建，并将d.ts文件整合

USAGE:

--devOnly -d  为开发环境构建      $tnpm run build -- --devOnly
--prodOnly -p 为生产环境构建      $tnpm run build -- --prodOnly
--formats -f  指定构建格式       $tnpm run build -- --formats ejs-umd-esm
--types -t    生成d.ts             $tnpm run build -- --types
--sourcemap -s 生成sourceMap    $tnpm run build -- --sourcemap

常用命令

生产环境构建eva.js的cjs和umd包，$tnpm run build eva.js -- -f cjs-umd -p

开发环境构建所有plugin，$tnpm run build plugin -- -ad
*/

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const {gzipSync} = require('zlib');
const {compress} = require('brotli');

const args = require('minimist')(process.argv.slice(2));
const formats = args.formats || args.f;
const devOnly = args.devOnly || args.d;
const prodOnly = !devOnly && (args.prodOnly || args.p);
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildTypes = args.t || args.types || isRelease;

const pkgDir = path.resolve(__dirname, '../');
const pkg = require(`${pkgDir}/package.json`);

run();

async function run() {
  if (isRelease) {
    await fs.remove(path.resolve(__dirname, '../node_modules/.rts2_cache'));
  }
  await build();
  checkFileSize(`${pkgDir}/dist/index.global.js`);
}

async function build() {
  if (!formats) {
    await fs.remove(`${pkgDir}/dist`);
  }

  const env = (pkg.buildOptions && pkg.buildOptions.env) || (devOnly ? 'development' : 'production');
  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `NODE_ENV:${env}`,
        formats ? `FORMATS:${formats}` : '',
        buildTypes ? 'TYPES:true' : '',
        prodOnly ? 'PROD_ONLY:true' : '',
        sourceMap ? 'SOURCE_MAP:true' : '',
      ]
        .filter(Boolean)
        .join(','),
    ],
    {stdio: 'inherit'},
  );

  if (buildTypes) {
    console.log();
    console.log(chalk.bold(chalk.yellow('Rolling up type definitions...')));

    const {Extractor, ExtractorConfig} = require('@microsoft/api-extractor');
    const extractorConfigPath = path.resolve(pkgDir, 'api-extractor.json');
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    });

    if (extractorResult.succeeded) {
      console.log(chalk.bold(chalk.green('API Extractor completed successfully.')));
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` + ` and ${extractorResult.warningCount} warnings`,
      );
      process.exitCode = 1;
    }

    await fs.remove(`${pkgDir}/dist/src`);
  }
}

function checkFileSize(filePath) {
  if (!fs.existsSync(filePath)) return;
  const file = fs.readFileSync(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  const gzipped = gzipSync(file);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(file);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(
    `${chalk.gray(chalk.bold(path.basename(filePath)))} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`,
  );
}
