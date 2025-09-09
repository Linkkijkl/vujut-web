#!/bin/sh

# Creates links to all required dependencies in a way that they become available to Hugo.

rm -Rf assets/node && mkdir -p assets/node
# Bootstrap
link node_modules/bootstrap/dist/js/bootstrap.bundle.min.js assets/node/bootstrap.bundle.min.js
link node_modules/bootstrap/dist/css/bootstrap.min.css assets/node/bootstrap.min.css
# Masonry-layout
link node_modules/masonry-layout/dist/masonry.pkgd.min.js assets/node/masonry.pkgd.min.js
