let gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require("browser-sync").create();

let paths = {
    styles: {
        src: "./public/styles/*.scss",
        dest: "public/css"
    }
};

function style() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on("error", sass.logError)
        .pipe(postcss([
            autoprefixer(),
            cssnano()
        ]))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        notify: false,
        proxy: "shipenguin.ngrok.io"
    });
    gulp.watch("./public/styles/**/*.scss", style);
    gulp.watch("./public/*.html").on("change", browserSync.reload);
    gulp.watch("./public/js/**/*.js").on("change", browserSync.reload);
}

exports.watch = watch;
exports.style = style;

let build = gulp.parallel(style, watch);

gulp.task('default', build);
