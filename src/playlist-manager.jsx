import React from "react"
import LoginPanel from "./login-panel"
import PlaylistPanel from "./playlist-panel"

const loginPanelId = "login"
const playlistPanelId = "playlist"
const playlistDetailsPanelId = "playlist-details"

export default class PlaylistManager extends React.Component {
  constructor() {
    super()

    this.handleLoginSuccess = this.handleLoginSuccess.bind(this)
    this.handleProgressStart = this.handleProgressStart.bind(this)
    this.handleProgressStop = this.handleProgressStop.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleError = this.handleError.bind(this)

    this.state = {
      accessToken: null,
      currentPanelId: loginPanelId,
      loginError: null,
      progressMessage: null
    }
  }

  handleLoginSuccess(accessToken) {
    this.setState({
      accessToken: accessToken,
      currentPanelId: playlistPanelId,
    })
  }

  handleProgressStart(message) {
    this.setState({
      progressMessage: message
    })
  }

  handleProgressStop() {
    this.setState({
      progressMessage: null
    })
  }

  handleLogout() {
    this.setState({
      accessToken: null,
      currentPanelId: loginPanelId
    })
  }

  handleError(message) {
    this.setState({
      errorMessage: message
    })
  }

  render() {
    let panel = <LoginPanel onLoginSuccess={this.handleLoginSuccess} />

    if (this.state.currentPanelId == playlistPanelId) {
      panel = <PlaylistPanel
        accessToken={this.state.accessToken}
        onError={this.handleError}
        onProgressStart={this.handleProgressStart}
        onProgressStop={this.handleProgressStop} />
    } else if (this.state.currentPanelId == playlistDetailsPanelId) {
      //panel = <PlaylistDetailsPanel />
    }

    return(
      <div>
        <h1>YouTube Playlist Manager</h1>

        <div className={this.state.errorMessage ? "" : "hidden"}>Error: {this.state.errorMessage}</div>

        <div>{this.state.progressMessage}</div>

        <button className={this.state.accessToken ? "" : "hidden"} onClick={this.handleLogout}>Logout</button>

        {panel}

        <div>
          {this.state.accessToken}
        </div>
      </div>
    )
  }
}
