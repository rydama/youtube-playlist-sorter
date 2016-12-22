// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const electron = require('electron').remote
const BrowserWindow = electron.BrowserWindow

const revokeTokenUrl = "https://accounts.google.com/o/oauth2/revoke"
const clientId = "728451052888-9pc51r3cra9fo6fp3spuq7h22oi5mtgd.apps.googleusercontent.com"
const redirectUri = "http://localhost/playlist-manager/oauth-callback"
const scope = "https://www.googleapis.com/auth/youtube"

let accessToken = null

document.getElementById("login-button").onclick = function(event) {
  var authWindow = new BrowserWindow({
    width: 800, 
    height: 600, 
    show: false, 
    'node-integration': false,
    'web-security': false
  });


  var authUrl = "https://accounts.google.com/o/oauth2/auth" +
    "?client_id=" + clientId +
    "&redirect_uri=" + encodeURIComponent(redirectUri) +
    "&scope=" + encodeURIComponent(scope) +
    "&response_type=token"

  authWindow.loadURL(authUrl);
  authWindow.show();
  // 'will-navigate' is an event emitted when the window.location changes
  // newUrl should contain the tokens you need
  authWindow.webContents.on('will-navigate', function (event, newUrl) {
    console.log("navigate")
    if (handleOauthCallback(newUrl)) {
      authWindow.destroy() 
    }
  });

  authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
    console.log("redirect")
    if (handleOauthCallback(newUrl)) {
      authWindow.destroy() 
    }
  });

  authWindow.on('closed', function() {
    authWindow = null;
  });
}

document.getElementById("logout-button").onclick = function(event) {
  revokeToken(accessToken, (error) => {
    if (!error) {
      console.log("Successfully revoked access token")
    } else {
      console.log(error)
    }
  })

  electron.session.defaultSession.clearStorageData({}, () => {
    console.log("cleared local storage")
  })
}

document.getElementById("get-playlists-button").onclick = function(event) {
  let playlists = []
  getPlaylists(null, playlists, function(error) {
    if (error) {
      document.getElementById("playlists").innerHTML = "Error retrieving playlists: " + error
    } else {
      document.getElementById("playlists").innerHTML = playlists.map(function(playlist) {
        return playlist.snippet.title
      }).sort() .join(",")

      // for(playlist of playlists) {
      //   document.getElementById("playlists").innerHTML += playlist.snippet.title
      // }
    }
  })
}

function getPlaylists(pageToken, playlists, callback) {
  let url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true"
  if (pageToken) {
    url += "&pageToken=" + pageToken
  }

  let options = {
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  }

  fetch(url, options)
    .then(function(response) {
      if (response.status != 200) {
        callback("Error retrieving playlists: " + response.status)
        return
      }

      response.json().then(function(data) {
        for(playlist of data.items) {
          playlists.push(playlist)
        }

        if (data.nextPageToken) {
          getPlaylists(data.nextPageToken, playlists, callback)
        } else {
          callback()
        }
      })
    })
    .catch(function(error) {
      callback(error)
    })

}

function handleOauthCallback(url) {
  // Expecting something like:
  // http://localhost/playlist-manager/oauth-callback#access_token=ya29.CiqvkQSLDvp28N_w&token_type=Bearer&expires_in=3600

  console.log(url);
  if (url.startsWith(redirectUri)) {
    let accessTokenParam = "access_token="
    let index = url.indexOf(accessTokenParam)
    let params = url.substring(index + accessTokenParam.length).split("&")
    let token = params[0]

    validateToken(token, function(isValid) {
      if (isValid) {
        document.getElementById("token").innerHTML = token
        accessToken = token
      } else {
        document.getElementById("token").innerHTML = "invalid token"
      }
    })

    return true
  }

  return false
}

// See https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps
function validateToken(token, callback) {
  let url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + token

  fetch(url)
    .then(function(response) {
      if (response.status != 200) {
        callback(false)
        return
      }

      response.json().then(function(data) {
        callback(data.audience == clientId)
      })
    })
    .catch(function(error) {
      console.log("fetch error: " + error)
      callback(false)
    })
}

function revokeToken(token, callback) {
  let url = revokeTokenUrl + "?token=" + token

  fetch(url)
    .then(function(response) {
      if (response.status != 200) {
        callback("Failed to revoke token: " + response.status)
        return
      }

      response.json().then(function(data) {
        callback()
      })
    })
    .catch(function(error) {
      callback("fetch error: " + error)
    })
}
