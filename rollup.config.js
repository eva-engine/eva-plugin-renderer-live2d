import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import {terser} from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const packageDir = path.resolve(__dirname);
const resolve = p => path.resolve(packageDir, p);

const entryFile = resolve('src/index.ts');
const pkg = require(resolve(`package.json`));
const exampleDir = resolve('example');
const evajsDistDir = resolve('dist');

const outputConfigs = {
  esm: {
    file: resolve(`dist/plugin.esm.js`),
    format: 'es',
  },
  cjs: {
    file: resolve(`dist/plugin.cjs.js`),
    format: 'cjs',
  },
  global: {
    name: pkg.bundle,
    file: resolve('dist/plugin.global.js'),
    format: 'iife',
  },
};

// ts检查优化
let hasTypesChecked = false;

const defaultFormats = ['esm', 'cjs', 'global'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split('-');
const packageFormats = inlineFormats || defaultFormats;

const packageConfigs = [];
if (!process.env.PROD_ONLY) {
  packageFormats.forEach(format => {
    if (!outputConfigs[format]) return;

    if (format === 'esm') {
      packageConfigs.push(createEsmDevelopConfig(format));
    }

    if (format === 'cjs') {
      packageConfigs.push(createCjsDevelopConfig(format));
    }

    if (format === 'global') {
      packageConfigs.push(createUmdDevelopConfig(format));
    }
  });
}

// 为生产环境创建rollup配置
if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach(format => {
    if (!outputConfigs[format]) return;

    if (format === 'cjs') {
      packageConfigs.push(createCjsProductionConfig(format));
    }

    if (format === 'global') {
      packageConfigs.push(createMinifiedConfig(format));
    }
  });
}

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.sourcemap = !!process.env.SOURCE_MAP;
  const shouldEmitDeclaration = process.env.TYPES != null && !hasTypesChecked;

  const tsPlugin = typescript({
    check: process.env.NODE_ENV === 'production' && !hasTypesChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    objectHashIgnoreUnknownHack: true,
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclaration,
        declarationMap: false,
      },
      exclude: ['**/__tests__'],
    },
  });
  hasTypesChecked = true;

  return {
    input: entryFile,
    output: {
      ...output,
      globals: {
        'pixi.js': 'PIXI',
        '@eva/eva.js': 'EVA',
        '@eva/plugin-renderer': 'EVA.plugin.renderer',
        '@eva/renderer-adapter': 'EVA.rendererAdapter',
      },
    },
    external: ['pixi.js', '@eva/eva.js', '@eva/plugin-renderer', '@eva/renderer-adapter'],
    plugins: [
      ...plugins,
      globals(),
      builtins(),
      json({preferConst: true}),
      commonjs(),
      tsPlugin,
      replace({
        __DEV__: process.env.NODE_ENV === 'development',
        __TEST__: false,
      }),
    ],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
  };
}

function createCjsDevelopConfig(format) {
  return createConfig(format, {
    file: outputConfigs[format].file,
    format: outputConfigs[format].format,
  });
}

function createEsmDevelopConfig(format) {
  return createConfig(format, {
    file: outputConfigs[format].file,
    format: outputConfigs[format].format,
  });
}

function createUmdDevelopConfig(format) {
  let plugins = [
    nodeResolve({
      browser: true,
      mainFields: ['jsnext', 'esnext', 'module', 'main'],
      rootDir: packageDir,
    }),
  ];

  if (process.env.ROLLUP_WATCH) {
    plugins.push(
      ...[
        serve({
          open: true,
          contentBase: [exampleDir, evajsDistDir],
          host: 'localhost',
          port: 8080,
        }),
        livereload(evajsDistDir),
      ],
    );
  }

  return createConfig(format, outputConfigs[format], plugins);
}

function createCjsProductionConfig(format) {
  return createConfig(
    format,
    {
      file: resolve(`dist/plugin.${format}.prod.js`),
      format: outputConfigs[format].format,
    },
    [
      terser({
        toplevel: true,
        mangle: true,
        output: {comments: false},
        compress: true,
      }),
    ],
  );
}

function createMinifiedConfig(targetFormat) {
  const {file, name, format} = outputConfigs[targetFormat];
  return createConfig(
    format,
    {
      name,
      format,
      file: file.replace(/\.js$/, '.min.js'),
    },
    [
      nodeResolve({
        browser: true,
        mainFields: ['jsnext', 'esnext', 'module', 'main'],
        rootDir: packageDir,
        preferBuiltins: true,
      }),
      terser({
        toplevel: true,
        mangle: true,
        output: {comments: false},
        compress: true,
      }),
    ],
  );
}

export default packageConfigs;
