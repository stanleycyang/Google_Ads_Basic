// Document selectors

var videoContent = document.querySelector('#contentElement');
var playButton = document.querySelector('#playButton');
var adContainer = document.querySelector('#adContainer');

// Tell the SDK where to put the ads on your page
// Div is set on top of the video player
// Tell the SDK to render the ads in that div
// Provide a handle to your content video player, the SDK will place ads mid-rolls
var adDisplayContainer = new google.ima.AdDisplayContainer(
  adContainer,
  videoContent
);

// re-use the adsLoader instance for the entire lifecycle of the page
var adsLoader = new google.ima.AdsLoader(adDisplayContainer);

// Handle the errors
function onAdError(adErrorEvent) {
  // Handle the error logging and destroy the AdsManager
  // Console the error
  console.error(adErrorEvent.getError());
  adsManager.destroy();
}

// An event listener to tell the SDK that our content video is completed so the SDK can play any post-roll ads
function contentEndedListener() {
  adsLoader.contentComplete();
}

function onContentPauseRequested() {
  videoContent.removeEventListener('ended', contentEndedListener);
}

function onContentResumeRequested() {
  // This function is where we should ensure the UI is ready
  videoContent.addEventListener('ended', contentEndedListener);
  videoContent.play();
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  adsManager = adsManagerLoadedEvent.getAdsManager(videoContent);

  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);

  try {
    // Initialize the ads manager. Ad rules playlist will start playing at this time
    adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
    // Call start to show ads. Single video and overlay ads will start at this time. This call will be ignored for ad rules as ads start when the adManager is initialized
    adsManager.start();
  } catch(adError) {
    // An error may be thrown here if problem is with VAST response
  }
}

// Add event listeners
adsLoader.addEventListener(
  google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
  onAdsManagerLoaded,
  false
);

// Error has occurred
adsLoader.addEventListener(
  google.ima.AdErrorEvent.Type.AD_ERROR,
  onAdError,
  false
);

// Run post roll ads
videoContent.onended = contentEndedListener;

// Request video ads
var adsRequest = new google.ima.AdsRequest();
adsRequest.adTagUrl = 'http://pubads.g.doubleclick.net/gampad/ads?' +
    'sz=640x360&iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&' +
    'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
    'url=[referrer_url]&correlator=[timestamp]';

adsRequest.linearAdSlotWidth = 640;
adsRequest.linearAdSlotHeight = 400;
adsRequest.nonLinearAdSlotWidth = 640;
adsRequest.nonLinearAdSlotHeight = 150;

function requestAds() {
  adsLoader.requestAds(adsRequest);
}


window.addEventListener('load', function(){
  // When the play button is clicked...
  playButton.addEventListener('click', function(){
    // Initialize the video div. Must be done as the result of a user action on mobile
    adDisplayContainer.initialize();
    // Request ads
    requestAds();
    // Play the video
    videoContent.play();
  }, false);
});


