import React from "react"

export default function PlaylistLink(props) {
  return(
    <li>
      <a href="#" onClick={() => props.onPlaylistSelected(props.playlist)}>
      <img src={props.playlist.snippet.thumbnails.default.url} />
      {props.playlist.snippet.title}
      </a>
    </li>
  )
}
