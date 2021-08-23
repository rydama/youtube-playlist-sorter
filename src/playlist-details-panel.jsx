import React from "react";
import PropTypes from "prop-types";
import CircularProgressbar from "react-circular-progressbar";
import { orderBy } from "natural-orderby";

class PlaylistDetailsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.handleSortClicked = this.handleSortClicked.bind(this);

    this.state = {
      playlistItems: null,
      percentComplete: 100,
      currentlySortingVideoTitle: "",
    };
  }

  componentDidMount() {
    this.props.onProgressStart("Loading videos...");
    this.loadPlaylistItems();
  }

  render() {
    let videoCountText = "";
    let items = [];

    if (this.state.playlistItems) {
      items = this.state.playlistItems.map((playlistItem) => (
        <li key={playlistItem.id}>
          <div className="item video-item">
            <a
              href={`https://www.youtube.com/watch?v=${playlistItem.snippet.resourceId.videoId}`}
              target="_blank"
            >
              <img src={playlistItem.snippet.thumbnails.default.url} />
              <div className="info">
                <div className="title">{playlistItem.snippet.title}</div>
              </div>
            </a>
          </div>
        </li>
      ));

      let itemCount = this.props.itemCount;
      let validItemCount = this.state.playlistItems.length;
      let deletedCount = itemCount - validItemCount;
      let deletedText =
        deletedCount > 0 ? `, ignoring ${deletedCount} deleted` : "";
      videoCountText = `(${validItemCount} ${
        validItemCount == 1 ? "video" : "videos"
      }${deletedText})`;
    }

    let playlistUrl = `https://www.youtube.com/playlist?list=${this.props.playlist.id}`;
    let progressCircle = null;
    if (this.state.percentComplete != 100) {
      progressCircle = (
        <CircularProgressbar
          percentage={this.state.percentComplete}
          textForPercentage={() => ""}
        />
      );
    }

    const helpText =
      "note: once sorting is complete, it can take a few minutes before the playlist is fully updated on YouTube";

    return (
      <div className="content-panel container">
        <div className="row">
          <div className="col-xs-4 back-link">
            <a href="#" onClick={() => this.props.onBackToPlaylists()}>
              &larr; Back to Playlists
            </a>
          </div>
          <div className="col-xs-4 playlist-title center-text">
            {this.props.playlist.snippet.title} {videoCountText}
          </div>
          <div className="col-xs-4 youtube-nav-link">
            <a className="pull-right" href={playlistUrl} target="_blank">
              Go to this playlist on YouTube
            </a>
          </div>
        </div>
        <div className="action-row">
          <div>Sort: </div>
          <div>
            <a
              href="#"
              className="sort-link"
              title={helpText}
              onClick={() => this.handleSortClicked({ descending: false })}
            >
              A-Z
            </a>
            <a
              href="#"
              className="sort-link"
              title={helpText}
              onClick={() => this.handleSortClicked({ descending: true })}
            >
              Z-A
            </a>
            <a
              href="#"
              className="sort-link"
              title={helpText}
              onClick={() => this.handleSortClicked({ shuffle: true })}
            >
              Shuffle
            </a>
            <a
              href="#"
              className="sort-link"
              title={helpText}
              onClick={() =>
                this.handleSortClicked({ durationDescending: false })
              }
            >
              shorter to longer
            </a>
            <a
              href="#"
              className="sort-link"
              title={helpText}
              onClick={() =>
                this.handleSortClicked({ durationDescending: true })
              }
            >
              longer to shorter
            </a>
          </div>
          <div className="sort-progress-bar">{progressCircle}</div>
          <div className="sort-video-title">
            {this.state.currentlySortingVideoTitle}
          </div>
        </div>
        <div className="playlist-items">
          <ul className="item-list">{items}</ul>
        </div>
      </div>
    );
  }

  handleSortClicked(options) {
    this.props.onProgressStart("Sorting videos...");

    let itemsCopy = Array.from(this.state.playlistItems);
    if (options.shuffle) {
      itemsCopy = this.shufflePlaylistItems(itemsCopy);
    } else if (
      options.durationDescending === true ||
      options.durationDescending === false
    ) {
      this.sortByDuration(itemsCopy, options.durationDescending).then(
        (i) => (itemsCopy = i)
      );
    } else {
      itemsCopy = this.sortPlaylistItems(itemsCopy, options.descending);
    }

    for (let [index, playlistItem] of itemsCopy.entries()) {
      playlistItem.snippet.position = index;
    }

    this.updatePlaylistItems(Array.from(itemsCopy))
      .then(() => {
        this.setState({
          playlistItems: itemsCopy,
        });
      })
      .catch((error) => {
        this.props.onError(error.message);
      })
      .then(() => {
        this.props.onProgressStop();
        this.setState({
          percentComplete: 100,
          currentlySortingVideoTitle: "",
        });
      });
  }

  loadPlaylistItems() {
    let playlistItems = [];

    this.getPlaylistItems(
      null,
      this.props.playlist.id,
      playlistItems,
      (error) => {
        if (error) {
          this.props.onError(`Error retrieving playlist details: ${error}`);
        } else {
          this.setState({
            playlistItems: playlistItems,
          });

          this.props.onProgressStop();
        }
      }
    );
  }

  async getVideoContentDetails(videoId) {
    let url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails`;
    let options = {
      headers: {
        Authorization: "Bearer " + this.props.accessToken,
      },
    };
    let result = await fetch(url, options);
    let result2 = await result.json();
    return result2.items[0].contentDetails;
  }

  getPlaylistItems(pageToken, playlistId, playlistItems, callback) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`;

    if (pageToken) {
      url += "&pageToken=" + pageToken;
    }

    let options = {
      headers: {
        Authorization: "Bearer " + this.props.accessToken,
      },
    };

    fetch(url, options)
      .then((response) => {
        if (response.status != 200) {
          callback(response.status);
          return;
        }

        response.json().then((data) => {
          for (let playlistItem of data.items) {
            // Playlists can contain videos that have since been deleted. We want to omit
            // these items. The youtube API doesn't seem to indicate this in the playlist item.
            // The only way I can see to identify a deleted video (without trying to fetch it)
            // is if thumbnails is undefined or empty.
            if (
              playlistItem.snippet.thumbnails &&
              playlistItem.snippet.thumbnails.default
            ) {
              playlistItems.push(playlistItem);
            }
          }

          if (data.nextPageToken) {
            this.getPlaylistItems(
              data.nextPageToken,
              playlistId,
              playlistItems,
              callback
            );
          } else {
            callback();
          }
        });
      })
      .catch((error) => callback(error));
  }

  sortPlaylistItems(playlistItems, isDescending) {
    return orderBy(
      playlistItems,
      (v) => v.snippet.title,
      isDescending ? "desc" : "asc"
    );
  }

  shufflePlaylistItems(playlistItems) {
    for (let i = playlistItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // semi-colon here to keep eslint no-unexpected-multiline quiet
      [playlistItems[i], playlistItems[j]] = [
        playlistItems[j],
        playlistItems[i],
      ];
    }

    return playlistItems;
  }

  async sortByDuration(playlistItems, isDescending) {
    let promises = playlistItems.map(async (playlistItem) => {
      let videoId = playlistItem.snippet.resourceId.videoId;
      let videoContentDetails = await this.getVideoContentDetails(videoId);
      return {
        playlistItem,
        duration: YTDurationToSeconds(videoContentDetails.duration),
      };
    });
    let videosToSort = await Promise.all(promises);
    console.log(videosToSort);
    let sortedVideos = orderBy(
      videosToSort,
      (v) => v.duration,
      isDescending ? "desc" : "asc"
    );
    console.log(sortedVideos);
    return sortedVideos.map((v) => v.playlistItem);
  }

  updatePlaylistItems(itemsRemaining) {
    this.updatePercentComplete(itemsRemaining);

    let toUpdate = itemsRemaining.shift();
    this.setState({
      currentlySortingVideoTitle: toUpdate.snippet.title,
    });

    return this.updatePlaylistItem(toUpdate).then(() => {
      if (itemsRemaining.length > 0) {
        return this.updatePlaylistItems(itemsRemaining);
      }
    });
  }

  updatePercentComplete(itemsRemaining) {
    let complete = this.state.playlistItems.length - itemsRemaining.length;
    let percentComplete = Math.floor(
      (complete / this.state.playlistItems.length) * 100
    );
    this.setState({
      percentComplete: percentComplete,
    });
  }

  updatePlaylistItem(playlistItem) {
    const url =
      "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet";

    // Update only the required properties, plus the new position.
    const updateItem = {
      id: playlistItem.id,
      snippet: {
        playlistId: playlistItem.snippet.playlistId,
        resourceId: playlistItem.snippet.resourceId,
        position: playlistItem.snippet.position,
      },
    };

    const options = {
      method: "put",
      headers: {
        Authorization: "Bearer " + this.props.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateItem),
    };

    return fetch(url, options).then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          const message =
            this.getErrorMessage(data) ||
            `updating playlistItem: ${response.status}`;
          throw new Error(message);
        });
      }
    });
  }

  getErrorMessage(data) {
    let error = data.error;

    if (error) {
      if (error.errors && error.errors.length > 0) {
        if (error.errors[0].reason == "manualSortRequired") {
          let url = `https://www.youtube.com/playlist?list=${this.props.playlist.id}`;
          let playlistLink = `<a href="${url}" target="_blank">here</a>`;
          return `You must first change the playlist to manual ordering by dragging a video to a different position ${playlistLink}.`;
        }
      }

      return `${error.code}: ${error.message}`;
    }

    return null;
  }
}

function YTDurationToSeconds(duration) {
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  match = match.slice(1).map(function (x) {
    if (x != null) {
      return x.replace(/\D/, "");
    }
  });

  var hours = parseInt(match[0]) || 0;
  var minutes = parseInt(match[1]) || 0;
  var seconds = parseInt(match[2]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

PlaylistDetailsPanel.propTypes = {
  accessToken: PropTypes.string.isRequired,
  playlist: PropTypes.object.isRequired,
  itemCount: PropTypes.number.isRequired,
  onProgressStart: PropTypes.func.isRequired,
  onProgressStop: PropTypes.func.isRequired,
  onBackToPlaylists: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default PlaylistDetailsPanel;
