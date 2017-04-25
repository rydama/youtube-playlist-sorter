import React from "react"
import LoginPanel from "./login-panel"
import PlaylistPanel from "./playlist-panel"
import PlaylistDetailsPanel from "./playlist-details-panel"

const loginPanelId = "login"
const playlistPanelId = "playlist"
const playlistDetailsPanelId = "playlist-details"

export default class PlaylistManager extends React.Component {
  constructor() {
    super()

    this.handleLoginSuccess = this.handleLoginSuccess.bind(this)
    this.handlePlaylistSelected = this.handlePlaylistSelected.bind(this)
    this.handleBackToPlaylists = this.handleBackToPlaylists.bind(this)
    this.handleProgressStart = this.handleProgressStart.bind(this)
    this.handleProgressStop = this.handleProgressStop.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleError = this.handleError.bind(this)

    this.state = {
      accessToken: null,
      currentPanelId: loginPanelId,
      currentPlaylist: null,
      loginError: null,
      progressMessage: null
    }
  }

  render() {
    return(
      <div>
        <h1>YouTube Playlist Manager</h1>

        <a href="#" className={this.state.currentPanelId == playlistDetailsPanelId ? "" : "hidden"} onClick={this.handleBackToPlaylists}>Back to Playlists</a>

        <div className={this.state.errorMessage ? "" : "hidden"}>Error: {this.state.errorMessage}</div>

        <div>{this.state.progressMessage}</div>

        <button className={this.state.accessToken ? "" : "hidden"} onClick={this.handleLogout}>Logout</button>

        {this.getCurrentPanel()}
      </div>
    )
  }

  handleLoginSuccess(accessToken) {
    this.setState({
      accessToken: accessToken,
      currentPanelId: playlistPanelId,
    })
  }

  handlePlaylistSelected(playlist) {
    this.setState({
      currentPlaylist: playlist,
      currentPanelId: playlistDetailsPanelId
    })
  }

  handleBackToPlaylists() {
    this.setState({
      currentPanelId: playlistPanelId
    })
  }

  handleProgressStart(message) {
    this.setState({
      progressMessage: message,
      errorMessage: null
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

  getCurrentPanel() {
    let panel = <LoginPanel onLoginSuccess={this.handleLoginSuccess} />

    if (this.state.currentPanelId == playlistPanelId) {
      panel = <PlaylistPanel
        accessToken={this.state.accessToken}
        onPlaylistSelected={this.handlePlaylistSelected}
        onError={this.handleError}
        onProgressStart={this.handleProgressStart}
        onProgressStop={this.handleProgressStop} />
    } else if (this.state.currentPanelId == playlistDetailsPanelId) {
      panel = <PlaylistDetailsPanel
        accessToken={this.state.accessToken}
        playlist={this.state.currentPlaylist}
        onError={this.handleError}
        onProgressStart={this.handleProgressStart}
        onProgressStop={this.handleProgressStop} />
    }

    return panel
  }
}
