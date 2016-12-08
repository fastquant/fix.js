const gulp = require('gulp');
const ts = require("gulp-typescript");
const project = ts.createProject("tsconfig.json");
const typings = require("gulp-typings");
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const glob = require('glob')
const { Generator } = require('./build/message_generator')

gulp.task("generate_messages", () => {
    let output = path.join(__dirname, 'src', "messages.ts")
    new Generator(output).generate()
})
gulp.task("typings", function () { return gulp.src("typings.json").pipe(typings()); });
gulp.task("compile", () => { return project.src().pipe(project()).js.pipe(gulp.dest("dist")); });
gulp.task('default', ['compile']);
