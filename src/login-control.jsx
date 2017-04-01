import React from "react";

export default class LoginControl extends React.Component {
  constructor(props) {
    super(props)
    this.state = { isLoggedIn: false }
    this.handleLoginClicked = this.handleLoginClicked.bind(this)
    this.handleLogoutClicked = this.handleLogoutClicked.bind(this)
  }

  handleLoginClicked() {
    this.setState( { isLoggedIn: true} )
  }

  handleLogoutClicked() {
    this.setState( { isLoggedIn: false} )
  }

  render() {
    if (this.state.isLoggedIn) {
      return(
        <p>
          <button id="logout-button" onClick={this.handleLogoutClicked}>Logout</button>
        </p>
      );
    } else {
      return(
        <p>
          <button id="login-button" onClick={this.handleLoginClicked}>Login with YouTube</button>
        </p>
      );
    }
  }
}
