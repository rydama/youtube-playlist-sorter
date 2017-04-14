import React from "react"

export default function PlaylistItem(props) {
  return(
    <li>
      <a href="#" onClick={() => props.onPlaylistSelected(props.playlist)}>{props.playlist.snippet.title}</a>
    </li>
  )
}
