import React from "react"
import PropTypes from "prop-types"

const clientId = "728451052888-9pc51r3cra9fo6fp3spuq7h22oi5mtgd.apps.googleusercontent.com"
const redirectUri = "http://localhost/playlist-sorter/oauth-callback"
const scope = "https://www.googleapis.com/auth/youtube"

class LoginPanel extends React.Component {
  constructor(props) {
    super(props)
    this.handleLoginClicked = this.handleLoginClicked.bind(this)
    this.handleOauthCallback = this.handleOauthCallback.bind(this)
    this.validateToken = this.validateToken.bind(this)
    this.handleBeforeNavigate = this.handleBeforeNavigate.bind(this)

    this.state = {
      loginError: null
    }
  }

  componentDidMount() {
    chrome.webNavigation.onBeforeNavigate.addListener(this.handleBeforeNavigate)
    chrome.webNavigation.onCompleted.addListener(this.handleBeforeNavigate)
  }

  componentWillUnmount() {
    chrome.webNavigation.onBeforeNavigate.removeListener(this.handleBeforeNavigate)
    chrome.webNavigation.onCompleted.removeListener(this.handleBeforeNavigate)
  }

  render() {
    let errorDiv = <div/>
    if (this.state.loginError) {
      errorDiv =
        <div class={this.state.loginError ? "" : "hidden" }>
          Login failed: {this.state.loginError}
        </div>
    }

    return(
      <div className="flex-container">
        <div className="login">
          <div className="row">
            <div className="col-md-12">
              <h1>Playlist Sorter for YouTube&trade;</h1>
            </div>
          </div>


          <div className="row">
            <div className="col-md-12 center-text">
              <button className="btn btn-info login-button" onClick={this.handleLoginClicked}>Login with YouTube</button>
            </div>
          </div>

          {errorDiv}
        </div>
      </div>
    )
  }

  handleBeforeNavigate(details) {
    if (this.handleOauthCallback(details.url)) {
      // Close the login window
      chrome.tabs.remove(details.tabId)
    }
  }

  handleLoginFailed(error) {
    this.setState({ loginError: error })
  }

  handleLoginClicked() {
    let authUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
      "?client_id=" + clientId +
      "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&scope=" + encodeURIComponent(scope) +
      "&response_type=token"

    let width = 600
    let height = 600
    let left = (screen.width/2) - (width/2)
    let top = (screen.height/2) - (height/2)

    let options = {
      "url": authUrl,
      "width": width,
      "height": height,
      "left": Math.round(left),
      "top": Math.round(top),
      "type": "popup"
    }

    chrome.windows.create(options, () => {})
  }

  handleOauthCallback(url) {
    // Expecting something like:
    // http://localhost/playlist-sorter/oauth-callback#access_token=ya29.CiqvkQSLDvp28N_w&token_type=Bearer&expires_in=3600

    if (url.startsWith(redirectUri)) {
      let accessTokenParam = "access_token="
      let index = url.indexOf(accessTokenParam)
      let params = url.substring(index + accessTokenParam.length).split("&")
      let token = params[0]

      this.validateToken(token, (error) => {
        if (!error) {
          this.props.onLoginSuccess(token)
        } else {
          this.handleLoginFailed(error)
        }
      })

      return true
    }

    return false
  }

  // See https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps
  validateToken(token, callback) {
    let url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`

    fetch(url)
      .then((response) => {
        if (response.status != 200) {
          callback(false)
          return
        }

        response.json().then((data) => {
          callback(data.audience == clientId ? null : "Mismatched client ID")
        })
      })
      .catch((error) => callback(error))
  }
}

LoginPanel.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired
}

export default LoginPanel
