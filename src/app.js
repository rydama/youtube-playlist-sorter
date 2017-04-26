import React from "react";
import ReactDOM from "react-dom";
import PlaylistManager from "./playlist-manager";

// Importing jQuery and bootstrap:
// http://stackoverflow.com/questions/34120250/error-using-bootstrap-jquery-packages-in-es6-with-browserify
import $ from "jquery";
window.jQuery = window.$ = $;
require("bootstrap");

ReactDOM.render(
  <PlaylistManager />,
  document.getElementById("playlist-manager")
);
