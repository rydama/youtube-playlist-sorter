import React from "react"

export default function Header(props) {
  return(
    <div className="container-fluid">
      <div className="row">
        <div className="col-xs-4">
          Playlist Manager
        </div>
        <div className="col-xs-4 center-text">
          {props.statusMessage}
        </div>
        <div className="col-xs-4 pull-right">
          <button onClick={() => props.onLogout()}>Logout</button>
        </div>
      </div>
    </div>
  )
}
