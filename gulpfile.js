const gulp = require('gulp');
const run = require('gulp-run');
const gulpClean = require('gulp-clean');
const replace = require('gulp-replace');

function clean() {
  console.log('Start cleaning old builds.');
  return gulp.src('webpack', { read: false, allowEmpty: true }).pipe(gulpClean());
}

function runWebpack() {
  console.log('Start building server with webpack.');
  return run('npx webpack').exec();
}

function version() {
  let index = process.argv.indexOf('--releaseVersion');
  let releaseVersion;
  if (index > -1) {
    releaseVersion = process.argv[index + 1];
  } else {
    console.log('Version is not send as buildw arguments');
    // throw new Error('Version is not send as buildw arguments');
    releaseVersion = '1.0.0';
  }
  console.log('Release version is :' + releaseVersion);
  return gulp
    .src('package.json')
    .pipe(replace(/(\"version\"\s*:\s*\"\d+\.\d+\.\d+)(\"|\-SNAPSHOT\")/, '"version' + '": "' + releaseVersion + '"'))
    .pipe(gulp.dest('./', { overwrite: true }));
}

function copyPackageJson() {
  console.log('Copying package.json file to build directory.');
  gulp.src('webpack/bundle.js.map', { read: false, allowEmpty: true }).pipe(gulpClean());
  return gulp.src('package.json').pipe(gulp.dest('webpack/'));
}

function transpile() {
  console.log('dirname:', __dirname);
  return run('npm run build-ts').exec();
}

function copyBuildFiles() {
  return gulp.src('build/app/**/*.js').pipe(gulp.dest('webpack/build/app/'));
}

function installingDependencies() {
  // Copy all src-files into webpack-folder
  // gulp.src('src/app/**/*.ts').pipe(gulp.dest('src/app/'));
  process.env.NODE_ENV = 'production';
  process.chdir('webpack/');
  console.log('Running npm install to fetch bundle dependencies.');
  return run('npm install').exec();
}

function packageFiles() {
  console.log('Packaging deployment file.');
  return run('npm pack').exec();
}
const build = gulp.series(transpile, runWebpack, version, copyPackageJson, installingDependencies);
// const build = gulp.series(transpile, runWebpack, version, copyPackageJson, installingDependencies, packageFiles);
// const build = gulp.series(
//   version,
//   copyPackageJson,
//   transpile,
//   copyBuildFiles,
//   installingDependencies,
//   runWebpack,
//   packageFiles
// );

exports.build = build;
exports.clean = clean;
exports.default = gulp.series(clean, build);
