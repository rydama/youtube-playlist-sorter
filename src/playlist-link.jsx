import React from "react"
import PropTypes from "prop-types"

const PlaylistLink = (props) => {
  let itemCount = props.playlist.contentDetails.itemCount
  let videoCountText = `${itemCount} ${itemCount == 1 ? "video" : "videos"}`

  return(
    <li>
      <div className="item">
        <a href="#" onClick={() => props.onPlaylistSelected(props.playlist, itemCount)}>
          <img src={props.playlist.snippet.thumbnails.default.url} />
          <div className="info">
            <div className="title">{props.playlist.snippet.title}</div>
            <div className="video-count">{videoCountText}</div>
          </div>
        </a>
      </div>
    </li>
  )
}

PlaylistLink.propTypes = {
  playlist: PropTypes.object.isRequired,
  onPlaylistSelected: PropTypes.func.isRequired
}

export default PlaylistLink
