module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/module.js',
      'src/*.js',
      'spec/**/*.js'
    ],

    browsers: ['PhantomJS']
  });
};
