import * as gulp from 'gulp';
import * as changedInPlace from 'gulp-changed-in-place';
import * as sourcemaps from 'gulp-sourcemaps';
import * as less from 'gulp-less';
import * as project from '../aurelia.json';
import {build} from 'aurelia-cli';

export function processCSS() {
  return gulp.src(project.cssProcessor.source)
    .pipe(changedInPlace({firstPass:true}))
    .pipe(build.bundle());
};

export function processLESS() {
  return gulp.src(project.lessProcessor.source)
    //removi para evitar que não compile o index.less quando alterado arquivos do @import
    //.pipe(changedInPlace({firstPass:true}))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(build.bundle());
};
