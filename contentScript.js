(() => {
  let youtubeLeftControls = null;
  let youtubePlayer = null;
  let currentVideo = null;
  let currentVideoBookmarks = [];

  const newVideoLoaded = async () => {
    debugger;
    const bookmarkButtonExists =
      document.getElementsByClassName("bookmark-btn")[0];
    currentVideoBookmarks = await fetchBookmarks();
    if (!bookmarkButtonExists) {
      const bookmarkBtn = document.createElement("img");
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";
      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];
      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    debugger;
    const { type, value, videoId } = obj;
    switch (type) {
      case "NEW": {
        currentVideo = videoId;
        newVideoLoaded();
        break;
      }
      case "PLAY": {
        youtubePlayer.currentTime = value;
        break;
      }
      case "DELETE": {
        currentVideoBookmarks = currentVideoBookmarks.filter(
          (bookmark) => bookmark.time !== value
        );
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
        response(currentVideoBookmarks);
        break;
      }
    }
  });

  const fetchBookmarks = () => {
    if (!currentVideo) {
      return [];
    }
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTimestamp = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTimestamp,
      desc: `Bookmarked at ${getTime(currentTimestamp)}`,
    };
    currentVideoBookmarks = await fetchBookmarks();
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  newVideoLoaded();
})();

const getTime = (timestamp) => {
  const date = new Date(0);
  date.setSeconds(timestamp);
  return date.toISOString().substring(11, 19);
};
