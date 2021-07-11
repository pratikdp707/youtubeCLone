// Options
const CLIENT_ID = '576186946633-75jdga9q1j2e4r8d24nhki9lchlag01j.apps.googleusercontent.com';
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
const subscriptionContainer = document.getElementById('subscription-data');
const channelData = document.getElementById('channel-data');
const playlistContainer = document.getElementById('playlist');

//const defaultChannel = 'MotorOctane';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();
    const channel = channelInput.value;
    let url1 = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=channel&key=AIzaSyD8Ri1vjH8w8s5cJKXPnp_A5HGA0tR4AqU&maxResults=3`;
    let url2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${channel}&type=playlist&key=AIzaSyD8Ri1vjH8w8s5cJKXPnp_A5HGA0tR4AqU&maxResults=5`
    displayChannel(url1);
    displayVideos(url2);
    subscriptionContainer.innerHTML = '';
    videoContainer.innerHTML = '';
    channelInput.value = '';
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
        getChannel('mine');
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
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
    subscriptionContainer.innerHTML = '';
    playlistContainer.innerHTML = '';
    videoContainer.innerHTML = '';
    channelData.innerHTML = data;
}

// Get channel from API
function getChannel(channel) {
    if (channel === 'mine') {
        gapi.client.youtube.channels
            .list({
                part: 'snippet,contentDetails,statistics',
                mine: true
            })
            .then(response => {
                console.log(response);
                const channel = response.result.items[0];
                console.log(channel);

                const html = `<div class="row">
            <div class="col col-12 col-md-3" style="text-align: center;">
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
    } else {
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
    subscriptionContainer.innerHTML = '';
    request.execute(response => {
        console.log(response);
        const playListItems = response.result.items;

        if (playListItems.length != 0) {
            let htmlStart = `<div class="row"><h5 style="padding:17px;">Latest Videos</h5></div>
            <div class="row">`;
            let htmlEnd = `</div>`;
            // Loop through videos and append output

            playListItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                htmlStart += `<div class="col-12 col-md-4 col-lg-3 col-xl-2" style="margin: 7px 0";>
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>`;
            });

            // Output videos
            videoContainer.innerHTML = htmlStart + htmlEnd;
        } else {
            videoContainer.innerHTML = `<div class="row"><h5 style="padding:17px;">Latest Videos</h5></div>
            <div class="row" style="padding-left: 50px;">
            <h6>No Videos Found</h6>
            </div>
            </div>`;
        }
    });
}


document.getElementById('my-playlist').addEventListener('click', event => {
    getChannel('mine');
    document.getElementById('channel-input').value = '';
})


document.getElementById('my-subscriptions').addEventListener('click', event => {
    displaySubscriptions();
    document.getElementById('channel-input').value = '';

})

function displaySubscriptions() {
    const requestOptions = {
        mine: true,
        part: 'snippet,id,snippet,subscriberSnippet',
        maxResults: 12
    };
    const request = gapi.client.youtube.subscriptions.list(requestOptions);
    videoContainer.innerHTML = '';
    channelData.innerHTML = '';
    playlistContainer.innerHTML = '';
    request.execute(response => {
        console.log(response);
        if (response.items.length != 0) {

            let htmlStart = `<div class="row"><h5 style="padding:17px;">Subscriptions</h5></div>
        `;
            let htmlEnd = `</div>`;
            console.log(response.items);
            response.items.forEach(item => {
                htmlStart += `<div class="row" style="margin: 10px 0;"><div class="col-2" style="text-align:right;">
            <img src=${item.snippet.thumbnails.medium.url} alt="" style="height: 70px; width: 70px; border-radius: 50%;">
        </div>
        <div class="col-10">
            <h5>${item.snippet.title}</h5>
            <p>Subscribed On : ${new Date(item.snippet.publishedAt).toDateString()}</p>
        </div></div>`;
            })
            subscriptionContainer.innerHTML = htmlStart;
        } else {
            subscriptionContainer.innerHTML = `<div class="row"><h5 style="padding:17px;">Subscriptions</h5></div>
        <div class="row" style="padding-left: 50px;">
        <h6>No Subscriptions Found</h6>
        </div>
        </div>`;
        }

    });
}

async function displayChannel(url) {
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    let htmlStart = `<h4>Channels</h4>`;
    var sub = 0;
    var videos = 0;
    data.items.forEach(item => {

        gapi.client.youtube.channels
            .list({
                part: 'snippet,contentDetails,statistics',
                id: item.id.channelId
            }).then(response => {
                console.log(response);
                sub = response.result.items[0].statistics.subscriberCount;
                videos = response.result.items[0].statistics.videoCount;
                console.log(sub);
                console.log(videos);
                htmlStart += `<div class="row" style="margin-top: 20px;">
       <div class="col col-2" style="text-align: right;">
           <img src=${item.snippet.thumbnails.medium.url} alt="" class="channels-image">
       </div>
       <div class="col-col-10">
           <h4 class="title" style="text-align: left;">${item.snippet.title}</h4>
           <p class="channel-sub-video">${numberWithCommas(sub)} Subscribers</p>
           <p class="channel-sub-video">${numberWithCommas(videos)} Videos</p>
       </div>
       </div>`
                channelData.innerHTML = htmlStart;

            });
    });
}

async function displayVideos(url) {
    console.log("hii");
    let response = await fetch(url);
    let data = await response.json();
    console.log(data);
    let htmlStart = `<h4>Playlists</h4>`;
    data.items.forEach(item => {

        const requestOptions = {
            playlistId: item.id.playlistId,
            part: 'snippet',
            maxResults: 12
        };
        const request = gapi.client.youtube.playlistItems.list(requestOptions);
        subscriptionContainer.innerHTML = '';
        request.execute(response => {
            console.log(response);
            const playListItems = response.result.items;

                htmlStart += `<div class="row"><h5 style="padding:17px;">${item.snippet.title}</h5></div>
                <div class="row">`;
                let htmlEnd = `</div>`;
                // Loop through videos and append output

                playListItems.forEach(item => {
                    const videoId = item.snippet.resourceId.videoId;

                    htmlStart += `<div class="col-12 col-md-4 col-lg-3 col-xl-2" style="margin: 7px 0";>
                    <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </div>`;
                });
                htmlStart += htmlEnd;
                // Output videos
                videoContainer.innerHTML = htmlStart;


                //     htmlStart += `<div class="row" style="margin-top: 20px;">
                //    <div class="col col-12 col-md-2" style="text-align: right;">
                //        <img src=${item.snippet.thumbnails.medium.url} alt="" class="channels-image">
                //    </div>
                //    <div class="col-col-12 col-md-10">
                //        <h4 class="title" style="text-align: left;">${item.snippet.title}</h4>
                //        <p class="channel-sub-video">${item.snippet.channelTitle}</p>
                //        <p class="channel-sub-video">${new Date(item.snippet.publishedAt).toDateString} Videos</p>
                //    </div>
                //    </div>`
        });
    });
}

