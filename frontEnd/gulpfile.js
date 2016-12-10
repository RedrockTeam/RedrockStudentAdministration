var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var babel = require('gulp-babel');
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');

var dist = '../www/trainee/static',
    src = './src';
var srcMatch = {
    html: src + '/html/*.html',
    script: src + '/script/*.js',
    style: src + '/style/*.css',
    image: src + '/image/*'
};
var distPath = {
    html: dist + '/html/',
    script: dist + '/script/',
    style: dist + '/style/',
    image: dist + '/image/'
};

var compile_html = function () {
    return gulp.src(srcMatch.html)
        .pipe(htmlmin())
        .pipe(gulp.dest(distPath.html));
}
var compile_script = function () {
    return gulp.src(srcMatch.script)
        .pipe(plumber())
        .pipe(gulpif('*.es6.js', babel({presets: ['es2015']})))
        .pipe(gulp.dest(distPath.script));
}
var compile_style = function () {
    return gulp.src(srcMatch.style)
        .pipe(gulp.dest(distPath.style));
}
var compile_image = function () {
    return gulp.src(srcMatch.image)
        .pipe(gulp.dest(distPath.image));
}

var watch_html = watch_type('html', compile_html);
var watch_script = watch_type('script', compile_script);
var watch_style = watch_type('style', compile_style);
var watch_image = watch_type('image', compile_image);

function watch_type (type, fn) {
    fn();
    return function () {
        gulp.watch(srcMatch[type], fn);
    }
}
gulp.task('compile_html', watch_html);
gulp.task('compile_script', watch_script);
gulp.task('compile_style', watch_style);
gulp.task('compile_image', watch_image);
gulp.task('watch', [
    'compile_html', 
    'compile_script', 
    'compile_style', 
    'compile_image'
]);