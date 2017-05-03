import React from "react"

export default function Header(props) {
  return(
    <div className="header container">
      <div className="row header-row">
        <div className="col-xs-3 header-title">
          Playlist Manager
        </div>
        <div className="col-xs-6 center-text header-status-text">
          {props.statusMessage}
        </div>
        <div className="col-xs-3">
          <button className="btn btn-info pull-right header-logout" onClick={() => props.onLogout()}>Logout</button>
        </div>
      </div>
    </div>
  )
}
