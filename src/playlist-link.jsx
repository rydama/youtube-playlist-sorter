import React from "react"

export default function PlaylistLink(props) {
  return(
    <li>
      <div className="playlist">
          <a href="#" onClick={() => props.onPlaylistSelected(props.playlist)}>
          <img src={props.playlist.snippet.thumbnails.default.url} />
          <div className="info">
            <div className="title">{props.playlist.snippet.title}</div>
            <div className="video-count">4 videos</div>
          </div>
        </a>
      </div>
    </li>
  )
}
