const SPLASH_SCREEN_TIMEOUT = 2000;


document.addEventListener("deviceready", function(){
  // const packageData = JSON.parse(window.localStorage.getItem("package"));
  cordova.plugins.notification.badge.configure({ autoClear: true });
  setTimeout(() => {
    window.location = "subscriber.html";
    // if (packageData === null) {
    //   window.location = "home.html";
    // } else {
    //   if (packageData.expiresIn > Date.now()) {
    //     // SUBSCRIPTION IS ACTIVE
    //     window.location = "subscriber.html";
    //   } else {
    //     // SUBSCRIPTION ENDS
    //     window.localStorage.removeItem("package"); // REMOVE KEY FROM STORAGE
    //     window.location = "home.html"; // REDIRECT TO PITCH SCREEN
    //   }
    // }
  }, SPLASH_SCREEN_TIMEOUT);
});
