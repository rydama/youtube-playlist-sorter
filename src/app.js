import React from "react";
import ReactDOM from "react-dom";
import PlaylistSorter from "./playlist-sorter";

// Bootstrap needs jquery:
// http://stackoverflow.com/questions/34120250/error-using-bootstrap-jquery-packages-in-es6-with-browserify
import $ from "jquery";
window.jQuery = window.$ = $;
require("bootstrap");

ReactDOM.render(
  <PlaylistSorter />,
  document.getElementById("playlist-sorter")
);
