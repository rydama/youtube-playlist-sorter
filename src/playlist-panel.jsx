import React from "react"
import PropTypes from "prop-types"
import PlaylistLink from "./playlist-link"
import { orderBy } from "natural-orderby"

class PlaylistPanel extends React.Component {

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

  render() {
    const playlistLinks = this.state.playlists.map((playlist) =>
      <PlaylistLink key={playlist.id} playlist={playlist} onPlaylistSelected={this.props.onPlaylistSelected} />
    )

    return(
      <div className="content-panel container">
        <ul className="item-list">{playlistLinks}</ul>
      </div>
    )
  }

  loadPlaylists() {
    let playlists = []

    this.getPlaylists(null, playlists, (error) => {
      if (error) {
        this.props.onError(`Error retrieving playlists: ${error}`)
      } else {
        this.setState({
          playlists: this.sortPlaylists(playlists)
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

  sortPlaylists(playlists) {
    return orderBy(playlists, v => v.snippet.title)
  }
}

PlaylistPanel.propTypes = {
  accessToken: PropTypes.string.isRequired,
  onProgressStart: PropTypes.func.isRequired,
  onProgressStop: PropTypes.func.isRequired,
  onPlaylistSelected: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default PlaylistPanel
