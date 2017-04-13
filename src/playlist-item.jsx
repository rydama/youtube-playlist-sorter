import React from "react"

export default function PlaylistItem(props) {
  return(
    <li className="foo" key={props.playlist.id}>
      <a href="#" onClick={handlePlaylistClicked}>{props.playlist.snippet.title}</a>
    </li>
  )
}

function handlePlaylistClicked(event) {
  console.log("clicked", event.target)

}
