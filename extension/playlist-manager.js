/**
 * Script for the playlist-manager page. This page is created whenever the user
 * clicks the Playlist Manager button.
 */

const revokeTokenUrl = "https://accounts.google.com/o/oauth2/revoke"
const clientId = "728451052888-9pc51r3cra9fo6fp3spuq7h22oi5mtgd.apps.googleusercontent.com"
const redirectUri = "http://localhost/playlist-manager/oauth-callback"
const scope = "https://www.googleapis.com/auth/youtube"

let accessToken = null

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  if (handleOauthCallback(details.url)) {
    chrome.tabs.remove(details.tabId)
  }
});

document.getElementById("login-button").onclick = function(event) {
  var authUrl = "https://accounts.google.com/o/oauth2/auth" +
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
    // console.log("tabs: " + window.tabs.length)
  })
}

document.getElementById("logout-button").onclick = function(event) {
  revokeToken(accessToken, (error) => {
    if (!error) {
      console.log("Successfully revoked access token")
    } else {
      console.log(error)
    }
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

  if (url.startsWith(redirectUri)) {
    console.log("handling redirect uri: " + url);
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
