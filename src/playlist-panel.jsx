import React from "react"
import PlaylistItem from "./playlist-item"

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
    let token = this.props.accessToken

    let playlists = []
    this.getPlaylists(null, playlists, (error) => {
      if (error) {
        this.props.onError(`Error retrieving playlists: ${error}`)
      } else {
        this.setState({
          playlists: playlists
        })

        this.props.onProgressStop()

        // for(let playlist of playlists) {
        //   playlistManager.playlists[playlist.id] = playlist
        //   let html = template({id: playlist.id, title: playlist.snippet.title})
        //   $("#playlists").append(html)

        // }
        // document.getElementById("playlists").innerHTML = playlists.map(function(playlist) {
        //   return playlist.snippet.title
        // }).sort().join(",")

        // for(playlist of playlists) {
        //   document.getElementById("playlists").innerHTML += playlist.snippet.title
        // }
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
    const playlistItems = this.state.playlists.map((playlist) =>
      <PlaylistItem playlist={playlist} />
    )

    return(
      <div>
        <ul>{playlistItems}</ul>
      </div>
    )
  }
}
