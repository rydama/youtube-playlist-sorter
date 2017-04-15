import React from "react"

export default class PlaylistDetailsPanel extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      playlistItems: []
    }
  }

  componentDidMount() {
    this.props.onProgressStart("Loading videos...")
    this.loadPlaylistItems()
  }

  loadPlaylistItems() {
    let playlistItems = []

    this.getPlaylistItems(null, this.props.playlist.id, playlistItems, (error) => {
      if (error) {
        this.props.onError(`Error retrieving playlist details: ${error}`)
      } else {
        this.setState({
          playlistItems: playlistItems
        })

        this.props.onProgressStop()
      }
    })
  }

  getPlaylistItems(pageToken, playlistId, playlistItems, callback) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}`

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
          callback(response.status)
          return
        }

        response.json().then((data) => {
          for(let playlistItem of data.items) {
            playlistItems.push(playlistItem)
          }

          if (data.nextPageToken) {
            this.getPlaylistItems(data.nextPageToken, playlistId, playlistItems, callback)
          } else {
            callback()
          }
        })
      })
      .catch(function(error) {
        callback(error)
      })
  }

  render() {
    let items = this.state.playlistItems.map((playlistItem) =>
      <li key={playlistItem.id}>
        <p>{playlistItem.snippet.position} {playlistItem.snippet.title} {playlistItem.snippet.publishedAt}</p>
      </li>
    )

    return(
      <div>
        <h2>{this.props.playlist.snippet.title}</h2>
        <button>A-Z</button>
        <ul>{items}</ul>
      </div>
    )
  }
}
