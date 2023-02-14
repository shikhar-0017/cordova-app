const SPLASH_SCREEN_TIMEOUT = 3000;

window.onload = () => {
  const packageData = JSON.parse(window.localStorage.getItem("package"));
  console.log(window.planInterval);
  setTimeout(() => {
    if (packageData === null) {
      window.location = "home.html";
    } else {
      if (packageData.expiresIn > Date.now()) {
        // SUBSCRIPTION IS ACTIVE
        window.location = "subscriber.html";
      } else {
        // SUBSCRIPTION ENDS
        window.localStorage.removeItem("package");
        window.location = "home.html";
      }
    }
  }, SPLASH_SCREEN_TIMEOUT);
};
