import React from "react"
import LoginPanel from "./login-panel"
import Header from "./header"
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
    this.handleResize = this.handleResize.bind(this)

    this.state = {
      accessToken: null,
      currentPanelId: loginPanelId,
      currentPlaylist: null,
      loginError: null,
      progressMessage: null,
      width: 0,
      height: 0
    }
  }

  componentDidMount() {
    this.handleResize()
    window.addEventListener("resize", this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize)
  }


  render() {
    return(
      <div style={{ width: this.state.width, height: this.state.height }}>
        {this.getHeader()}
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
    this.revokeToken(this.state.accessToken).catch((error) => {
      console.log("Could not revoke token:", error.message)
    })

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

  handleResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  getHeader() {
    let statusMessage = this.state.errorMessage || this.state.progressMessage
    if (this.state.currentPanelId != loginPanelId) {
      return <Header statusMessage={statusMessage} onLogout={this.handleLogout} />
    }
    return null
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
        onBackToPlaylists={this.handleBackToPlaylists}
        onError={this.handleError}
        onProgressStart={this.handleProgressStart}
        onProgressStop={this.handleProgressStop} />
    }

    return panel
  }

  revokeToken(token) {
    const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`
    return fetch(url)
  }
}
