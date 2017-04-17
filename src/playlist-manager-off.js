/**
 * Script for the playlist-manager page. This page is created whenever the user
 * clicks the Playlist Manager button.
 */

const revokeTokenUrl = "https://accounts.google.com/o/oauth2/revoke"
const clientId = "728451052888-9pc51r3cra9fo6fp3spuq7h22oi5mtgd.apps.googleusercontent.com"
const redirectUri = "http://localhost/playlist-manager/oauth-callback"
const scope = "https://www.googleapis.com/auth/youtube"

let playlistManager = {}
playlistManager.accessToken = null
playlistManager.playlists = {}

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
  revokeToken(playlistManager.accessToken, (error) => {
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
      let template = Handlebars.compile($("#playlist-template").html());
      for(let playlist of playlists) {
        playlistManager.playlists[playlist.id] = playlist
        let html = template({id: playlist.id, title: playlist.snippet.title})
        $("#playlists").append(html)

      }
      // document.getElementById("playlists").innerHTML = playlists.map(function(playlist) {
      //   return playlist.snippet.title
      // }).sort().join(",")

      // for(playlist of playlists) {
      //   document.getElementById("playlists").innerHTML += playlist.snippet.title
      // }
    }
  })
}

$("#playlists").on("click", ".playlist-link", function(event) {
  console.log($(event.currentTarget).attr("id"))
  let playlistId = $(event.currentTarget).attr("id")
  let playlistItems = []
  getPlaylistItems(null, playlistId, playlistItems, function(error) {
    if (error) {
      console.log(error)
    } else {
      playlistManager.playlists[playlistId].items = {}
      for(let playlistItem of playlistItems) {
        playlistManager.playlists[playlistId].items[playlistItem.id] = playlistItem
        let data = playlistItem.snippet
        // console.log(playlistItem)
        console.log(`${data.position} ${data.publishedAt} ${data.title}`)
      }

      playlistItems.sort(function(a, b) {
        if (a.snippet.title > b.snippet.title) {
          return 1
        } else if (a.snippet.title < b.snippet.title) {
          return -1
        } else {
          return 0
        }
      })

      for(let playlistItem of playlistItems) {
        let data = playlistItem.snippet
        // console.log(playlistItem)
        console.log(`${data.position} ${data.publishedAt} ${data.title}`)
      }

    }
  })
})

$("#playlists").on("click", ".playlist-sort-link", function(event) {
  console.log($(event.currentTarget).attr("id"))
  let playlistId = $(event.currentTarget).attr("id")
  let playlistItems = playlistManager.playlists[playlistId].items

  let items = Object.keys(playlistItems).map(key => playlistItems[key])

  items.sort(function(a, b) {
    if (a.snippet.title < b.snippet.title) {
      return 1
    } else if (a.snippet.title > b.snippet.title) {
      return -1
    } else {
      return 0
    }
  })

  for(let item of items) {
    let data = item.snippet
    // console.log(playlistItem)
    console.log(`${data.position} ${data.publishedAt} ${data.title}`)
  }

})

function getPlaylists(pageToken, playlists, callback) {
  let url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true"

  if (pageToken) {
    url += "&pageToken=" + pageToken
  }

  let options = {
    headers: {
      "Authorization": "Bearer " + playlistManager.accessToken
    }
  }

  fetch(url, options)
    .then(function(response) {
      if (response.status != 200) {
        callback("Error retrieving playlists: " + response.status)
        return
      }

      response.json().then(function(data) {
        for(let playlist of data.items) {
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

function getPlaylistItems(pageToken, playlistId, playlistItems, callback) {
  let url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=" + playlistId

  if (pageToken) {
    url += "&pageToken=" + pageToken
  }

  let options = {
    headers: {
      "Authorization": "Bearer " + playlistManager.accessToken
    }
  }

  fetch(url, options)
    .then(function(response) {
      if (response.status != 200) {
        callback("Error retrieving playlist items: " + response.status)
        return
      }

      response.json().then(function(data) {
        for(let playlistItem of data.items) {
          playlistItems.push(playlistItem)
        }

        if (data.nextPageToken) {
          getPlaylistItems(data.nextPageToken, playlistId, playlistItems, callback)
        } else {
          callback()
        }
      })
    })
    .catch(function(error) {
      callback(error)
    })
}

function updatePlaylistItem(playlistItem, callback) {
  let url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet"

  let options = {
    method: 'put',
    headers: {
      "Authorization": "Bearer " + playlistManager.accessToken
    },
    body: JSON.stringify()
  }

  fetch(url, options)
    .then(function(response) {
      if (response.status != 200) {
        callback("Error updating playlistItem: " + response.status)
        return
      }

      response.json().then(function(data) {
        for(let playlist of data.items) {
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
        playlistManager.accessToken = token
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
