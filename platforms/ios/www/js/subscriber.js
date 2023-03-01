let planInterval;

document.addEventListener("deviceready", function () {
  // INIT IN_APP_PURCHASE
  Purchases.setDebugLogsEnabled(true);
  if (window.cordova.platformId === "ios") {
    Purchases.configure("appl_CqjmeUrrKCQizDlxutadJxHpQtt");
  }
  changeContent();
});


// CHANGE HOME SCREEN CONTENT BASED ON USER ACTIVE SUBSCRIPTION
function changeContent(){
  const packageData = JSON.parse(window.localStorage.getItem("package"));
  const container = document.getElementById("content");

  if (packageData == null) {
    container.innerHTML = `
    <h1 class="red-text">No Subcription Found</h1>
    <ons-button class="primary" onclick="window.location = 'home.html'">Start free trial</ons-button>
    <br />
    <br />
    <ons-button modifier="quiet" id="restore" class="hidden" onclick="restore()" >Restore purchase</ons-button>`;

    return;
  }

  planInterval = setInterval(function () {
    startCountDown(packageData);
  }, 1000);
}

// START TIMER FOR EXPIRY
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

// RESTORE PURCHASE
function restore() {
  SpinnerDialog.show(null, "Restoring purchase", true);
  Purchases.restorePurchases(
    info => {
      SpinnerDialog.hide();
      const isPro = typeof info.entitlements.active["UnlockEverything"] !== "undefined";
      if(isPro){
        alert("Purchase active");

        let productIdentifier = info.entitlements.active["UnlockEverything"].productIdentifier;

        // STORE PACKAGE DETAIL IN PERSISTANT STORAGE
        let package = {
          name:
            productIdentifier == "Kiddopia.PremiumSubscription.Monthly"
              ? "Monthly"
              : "Yearly",
          expiresIn: info?.entitlements.active["UnlockEverything"]?.expirationDateMillis,
        };

        window.localStorage.setItem("package", JSON.stringify(package));
        window.location.reload();

      }else{
        alert("No purchased found");
        window.localStorage.removeItem("package");
      }

    },
    error => {
      SpinnerDialog.hide();
      alert(error.message);
    }
  );
}
