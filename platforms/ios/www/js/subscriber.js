let planInterval;

document.addEventListener("init", function (e) {
  const packageData = JSON.parse(window.localStorage.getItem("package"));
  const container = document.getElementById("content");

  if (packageData == null) {
    container.innerHTML = `
    <h1 class="red-text">Subcription end</h1>
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
    <h1 class="red-text">${packageData.name}</h1>
    <ons-button class="primary">Subscription ends in ${secondsRemaining} seconds</ons-button>`;
}
