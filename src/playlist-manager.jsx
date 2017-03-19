import React from "react";
import LoginControl from "./login-control"

export default class PlaylistManager extends React.Component {
  constructor() {
    super();

    this.state = {
      accessToken: null
    };
  }

  render() {
    return(
      <div>
        <h1>YouTube Playlist Manager</h1>
        <LoginControl loggedIn={!!this.state.accessToken} />
      </div>
    );
  }
}
