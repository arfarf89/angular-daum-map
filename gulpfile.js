var gulp = require('gulp');
var jshint = require('gulp-jshint');
var karma = require('karma').server;
var $ = require('gulp-load-plugins')({pattern: ['gulp-*']});

gulp.task('lint', function () {
  return gulp.src('src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', function () {
  gulp.watch('src/*.js', ['lint']);
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

gulp.task('build', ['lint'], function () {
  return gulp.src(['src/module.js', 'src/directives/*.js'])
    .pipe($.concat('angular-daum-map.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.rename('angular-daum-map.min.js'))
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('default', ['lint']);
