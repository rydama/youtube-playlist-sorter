import React from "react"

export default class PlaylistDetailsPanel extends React.Component {
  constructor(props) {
    super(props)

    this.handleSortClicked = this.handleSortClicked.bind(this)

    this.state = {
      playlistItems: []
    }
  }

  componentDidMount() {
    this.props.onProgressStart("Loading videos...")
    this.loadPlaylistItems()
  }

  handleSortClicked(isDescending) {
    let playlistItems = this.sortPlaylistItems(this.state.playlistItems, isDescending)

    for (let [index, playlistItem] of playlistItems.entries()) {
      playlistItem.snippet.position = index
    }

    this.props.onProgressStart("Sorting videos...")

    this.updatePlaylistItems(playlistItems, (error) => {
      this.props.onProgressStop()
      if (error) {
        this.props.onError(error)
      } else {
        this.setState({
          playlistItems: playlistItems
        })
      }
    })
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

  sortPlaylistItems(playlistItems, isDescending) {
    playlistItems.sort((a, b) => {
      if (isDescending) {
        if (b.snippet.title < a.snippet.title) {
          return -1
        }
        if (b.snippet.title > a.snippet.title) {
          return 1
        }
        return 0
      } else {
        if (a.snippet.title < b.snippet.title) {
          return -1
        }
        if (a.snippet.title > b.snippet.title) {
          return 1
        }
        return 0
      }
    })

    return playlistItems
  }

  updatePlaylistItems(playlistItems, callback) {
    let toUpdate = Array.from(playlistItems)
    let playlistItem = toUpdate.shift()

    this.updatePlaylistItem(playlistItem, (error) => {
      if (error) {
        callback(error)
      } else if (toUpdate.length) {
        this.updatePlaylistItems(toUpdate, callback)
      } else {
        callback()
      }
    })
  }

  updatePlaylistItem(playlistItem, callback) {
    let url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet"

    let options = {
      method: 'put',
      headers: {
        "Authorization": "Bearer " + this.props.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(playlistItem)
    }

    console.log("updating", playlistItem.snippet.title, playlistItem.snippet.position)

    fetch(url, options)
      .then((response) => {
        if (response.status != 200) {

          response.text().then((data) => {
            console.log(data)
            callback("Error updating playlistItem: " + response.status)
          })

          // handle 400 manualSortRequired
          //{
          //  "error": {
          //   "errors": [
          //    {
          //     "domain": "youtube.playlistItem",
          //     "reason": "manualSortRequired",
          //     "message": "Playlist sort type need to be MANUAL to support position."
          //    }
          //   ],
          //   "code": 400,
          //   "message": "Playlist sort type need to be MANUAL to support position."
          //  }
          // }

          return
        }

        callback()
      })
      .catch((error) => {
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
        <button onClick={() => this.handleSortClicked(false)}>A-Z</button>
        <button onClick={() => this.handleSortClicked(true)}>Z-A</button>
        <ul>{items}</ul>
      </div>
    )
  }
}
