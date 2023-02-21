let planInterval;

document.addEventListener("init", function (e) {
  const packageData = JSON.parse(window.localStorage.getItem("package"));
  const container = document.getElementById("content");

  const granted = window.localStorage.getItem("isPermissionGranted");
  if (granted == null) {
    document.getElementById("allow").style.display = "block";
  }

  if (packageData == null) {
    container.innerHTML = `
    <h1 class="red-text">No Subcription Found</h1>
    <ons-button class="primary" onclick="window.location = 'home.html'">Start free trial</ons-button>`;
    return;
  }

  planInterval = setInterval(function () {
    startCountDown(packageData);
  }, 1000);
});

function startCountDown(packageData) {
  const container = document.getElementById("content");
  const currentTime = Date.now();
  const expiresIn = packageData.expiresIn;

  const secondsRemaining = parseInt((expiresIn - currentTime) / 1000);

  if (currentTime >= expiresIn || secondsRemaining <= 0) {
    container.innerHTML = `
      <h1 class="red-text">Subcription end</h1>
      <ons-button class="primary" onclick="window.location = 'home.html'">Start free trial</ons-button>`;
    clearInterval(planInterval);
    window.localStorage.removeItem("package");
    return;
  }

  container.innerHTML = `
    <h1 class="red-text">${packageData.name}: ${packageData.duration}</h1>
    <ons-button class="primary">Subscription ends in ${secondsRemaining} seconds</ons-button>
    <br />
    <br />
    <ons-button class="primary" onclick="reset()">Reset subscription</ons-button>`;
}

function reset() {
  window.localStorage.removeItem("package");
  window.location = "home.html";
}

function getPermission() {
  FirebasePlugin.grantPermission(function (granted) {
    window.localStorage.setItem("isPermissionGranted", granted);
    if (granted) {
      console.log("Permission granted");
    }
  });
}
