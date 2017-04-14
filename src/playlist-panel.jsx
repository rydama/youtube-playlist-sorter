import React from "react"
import PlaylistLink from "./playlist-link"

export default class PlaylistPanel extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      playlists: []
    }
  }

  componentDidMount() {
    this.props.onProgressStart("Loading playlists...")
    this.loadPlaylists()
  }

  loadPlaylists() {
    let playlists = []

    this.getPlaylists(null, playlists, (error) => {
      if (error) {
        this.props.onError(`Error retrieving playlists: ${error}`)
      } else {
        this.setState({
          playlists: playlists
        })

        this.props.onProgressStop()
      }
    })
  }

  getPlaylists(pageToken, playlists, callback) {
    let url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true"

    if (pageToken) {
      url += "&pageToken=" + pageToken
    }

    let options = {
      headers: {
        "Authorization": "Bearer " + this.props.accessToken
      }
    }

    fetch(url, options)
      .then((response) => {
        if (response.status != 200) {
          callback("Error retrieving playlists: " + response.status)
          return
        }

        response.json().then((data) => {
          for(let playlist of data.items) {
            playlists.push(playlist)
          }

          if (data.nextPageToken) {
            this.getPlaylists(data.nextPageToken, playlists, callback)
          } else {
            callback()
          }
        })
      })
      .catch((error) => {
        callback(error)
      })
  }

  render() {
    const playlistLinks = this.state.playlists.map((playlist) =>
      <PlaylistLink key={playlist.id} playlist={playlist} onPlaylistSelected={this.props.onPlaylistSelected} />
    )

    return(
      <div>
        <ul>{playlistLinks}</ul>
      </div>
    )
  }
}
