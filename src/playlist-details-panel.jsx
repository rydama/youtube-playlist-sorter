import React from "react"

export default class PlaylistDetailsPanel extends React.Component {
  constructor(props) {
    super(props)

    this.requestInProgress = false
    this.handleSortClicked = this.handleSortClicked.bind(this)

    this.state = {
      playlistItems: []
    }
  }

  componentDidMount() {
    this.props.onProgressStart("Loading videos...")
    this.loadPlaylistItems()
  }

  shouldComponentUpdate(nextProps, nextState) {
    // We get an update when we start our sort request because we
    // call this.props.onProgressStart(...).
    // Prevent his update.
    return !this.requestInProgress
  }

  handleSortClicked(isDescending) {
    this.requestInProgress = true
    this.props.onProgressStart("Sorting videos...")

    let playlistItems = this.sortPlaylistItems(this.state.playlistItems, isDescending)

    for (let [index, playlistItem] of playlistItems.entries()) {
      playlistItem.snippet.position = index
    }

    this.updatePlaylistItems(playlistItems).then(() => {
      this.requestInProgress = false
      this.setState({
        playlistItems: playlistItems
      })
    })
    .catch((error) =>
      this.props.onError(error.message)
    )
    .then(() =>
      this.props.onProgressStop()
    )
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

  updatePlaylistItems(playlistItems) {
    let promises = playlistItems.map((playlistItem) => this.updatePlaylistItem(playlistItem))
    return Promise.all(promises)
  }

  updatePlaylistItem(playlistItem) {
    let url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet"

    let options = {
      method: 'put',
      headers: {
        "Authorization": "Bearer " + this.props.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(playlistItem)
    }

    return fetch(url, options).then((response) => {
      if (!response.ok) {
        response.json().then((data) => {
          throw new Error(this.getErrorMessage(data) || `updating playlistItem: ${response.status}`)
        })
      }
    })
  }

  getErrorMessage(data) {
    let error = data.error

    if (error) {
      if (error.errors && error.errors.length > 0) {
        if (error.errors[0].reason == "manualSortRequired") {
          let url = `https://www.youtube.com/playlist?list=${this.props.playlist.id}`
          return `You must first change the playlist settings ordering to Manual at ${url}`
        }
      }

      return `${error.code}: ${error.message}`
    }

    return null;
  }

  render() {
    let items = this.state.playlistItems.map((playlistItem) =>
      <li key={playlistItem.id}>
        <p>{playlistItem.snippet.title} {playlistItem.snippet.publishedAt}</p>
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
