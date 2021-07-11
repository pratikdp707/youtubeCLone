// Options
const CLIENT_ID = '449113742081-bc5bn8vlb6v4d7nb0aoid9pal1esqe5r.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
//const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl'

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('uploaded-videos');

const defaultChannel = 'MotorOctane';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.value;

    getChannel(channel);
});

// Load auth2 library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
    gapi.client
        .init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        })
        .then(() => {
            // Listen for sign in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle initial sign in state
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
            document.getElementById('signout-button').addEventListener('click', e => {
                console.log(e.target.innerText);
            })
        });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        // content.style.display = 'block';
        // videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        // content.style.display = 'none';
        // videoContainer.style.display = 'none';
        document.getElementById('channel-data').innerHTML = '';
    }
}

// Handle login
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

// Display channel data
function showChannelData(data) {
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

// Get channel from API
function getChannel(channel) {
    gapi.client.youtube.channels
        .list({
            part: 'snippet,contentDetails,statistics',
            forUsername: channel
        })
        .then(response => {
            console.log(response);
            const channel = response.result.items[0];
            console.log(channel);

            const html = `<div class="row">
            <div class="col col-12 col-md-3" style="text-align: center; padding-top: 30px;">
                <img src=${channel.snippet.thumbnails.default.url}
                    alt="" class="channel-image">
            </div>
            <div class="col-col-12 col-md-9">
                <h4 class="title" style="text-align: left;">${channel.snippet.title}</h4>
                <h6>Subscribers: ${numberWithCommas(
                channel.statistics.subscriberCount
            )}</h6>
                <h6>Views: ${numberWithCommas(
                channel.statistics.viewCount
            )}</h6>
                <h6>Videos Uploaded: ${numberWithCommas(channel.statistics.videoCount)}</h6>
                <p>${channel.snippet.description}</p>
            </div>
        </div>`;
            showChannelData(html);

            const playlistId = channel.contentDetails.relatedPlaylists.uploads;
            displayPlaylist(playlistId);
        })
        .catch(err => alert('No Channel By That Name'));
}

// Add commas to number
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function displayPlaylist(playlistId) {
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 12
    };

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response => {
        console.log(response);
        const playListItems = response.result.items;
        if (playListItems) {
            let htmlStart = `<div class="row"><h5 style="padding:17px;">Latest Videos</h5></div>
            <div class="row">`;
            let htmlEnd = `</div>`;
            // Loop through videos and append output
            
            playListItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                htmlStart += `<div class="col-12 col-md-4 col-lg-3 col-xl-2">
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>`;
            });

            // Output videos
            videoContainer.innerHTML = htmlStart+htmlEnd;
        } else {
            videoContainer.innerHTML = 'No Uploaded Videos';
        }
    });
}
