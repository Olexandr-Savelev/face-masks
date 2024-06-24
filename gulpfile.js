import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import uglify from "gulp-uglify";
import imagemin, { gifsicle, optipng, svgo } from "gulp-imagemin";
import mozjpeg from "imagemin-mozjpeg";
import jpegtran from "imagemin-jpegtran";
import concat from "gulp-concat";
import htmlmin from "gulp-htmlmin";
import browserSync from "browser-sync";
import clean from "gulp-clean";
import autoprefixer from "gulp-autoprefixer";

const server = browserSync.create();

const paths = {
  styles: {
    src: "src/scss/main.scss",
    dest: "dist/css/", 
  },
  scripts: {
    src: "src/js/**/*.js",
    dest: "dist/js/",
  },
  images: {
    src: "src/images/**/*",
    dest: "dist/images/",
  },
  fonts: {
    src: "src/fonts/**/*",
    dest: "dist/fonts/",
  },
  html: {
    src: "src/**/*.html",
    dest: "dist/",
  },
};

function cleanDist() {
  return gulp.src("dist", { allowEmpty: true, read: false }).pipe(clean());
}

function styles() {
  return gulp
    .src(paths.styles.src, { encoding: false })
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        grid: true,
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream());
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(server.stream());
}

function images() {
  return gulp
    .src(paths.images.src, { encoding: false })
    .pipe(
      imagemin([
        gifsicle({ interlaced: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
        mozjpeg({ quality: 75, progressive: true }),
        jpegtran({ progressive: true }),
      ])
    )
    .on("error", (err) => {
      console.error("Error during image optimization:", err);
    })
    .pipe(gulp.dest(paths.images.dest))
    .pipe(server.stream());
}

function fonts() {
  return gulp
    .src(paths.fonts.src, { encoding: false })
    .pipe(gulp.dest(paths.fonts.dest));
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(server.stream());
}

function watch() {
  server.init({
    server: {
      baseDir: "./dist",
    },
  });

  gulp.watch("src/scss/**/*.scss", styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.fonts.src, fonts);
  gulp.watch(paths.html.src, html);
}

const build = gulp.series(
  cleanDist,
  gulp.parallel(styles, scripts, images, fonts, html)
);
const serve = gulp.series(build, watch);

export { cleanDist as clean };
export { styles };
export { scripts };
export { images };
export { fonts };
export { html };
export { watch };
export { build };
export { serve };
