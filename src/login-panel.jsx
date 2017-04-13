import React from "react"

const clientId = "728451052888-9pc51r3cra9fo6fp3spuq7h22oi5mtgd.apps.googleusercontent.com"
const redirectUri = "http://localhost/playlist-manager/oauth-callback"
const scope = "https://www.googleapis.com/auth/youtube"

export default class LoginPanel extends React.Component {
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
  }

  componentWillUnmount() {
    chrome.webNavigation.onBeforeNavigate.removeListener(this.handleBeforeNavigate)
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
    let authUrl = "https://accounts.google.com/o/oauth2/auth" +
      "?client_id=" + clientId +
      "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&scope=" + encodeURIComponent(scope) +
      "&response_type=token"

    let options = {
      'url': authUrl,
      'width': 600,
      'height': 400,
      'type': 'popup'
    }

    chrome.windows.create(options, function(window) {
    })
  }

  handleOauthCallback(url) {
    // Expecting something like:
    // http://localhost/playlist-manager/oauth-callback#access_token=ya29.CiqvkQSLDvp28N_w&token_type=Bearer&expires_in=3600

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
      .then(function(response) {
        if (response.status != 200) {
          callback(false)
          return
        }

        response.json().then(function(data) {
          callback(data.audience == clientId ? null : "Mismatched client ID")
        })
      })
      .catch(function(error) {
        callback(error)
      })
  }

  render() {
    let errorDiv = <div/>
    if (this.props.loginError) {
      errorDiv =
        <div class={this.props.loginError ? "" : "hidden" }>
          Login failed: {this.props.loginError}
        </div>
    }

    return(
      <div>
        <div>Playlist Manager</div>
        <div>
          <button onClick={this.handleLoginClicked}>Login with YouTube</button>
        </div>

        {errorDiv}
      </div>
    )
  }
}
