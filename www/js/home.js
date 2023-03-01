// GLOBAL VARIABLES
var carouselInterval;

document.addEventListener("deviceready", function () {
  cordova.plugins.notification.badge.configure({ autoClear: true });
  cordova.plugins.notification.local.hasPermission(function (hasPermission) {
    const granted = window.localStorage.getItem("isPermissionGranted");
    if (!hasPermission) {
      // APP DON'T HAVE THE PERMISSION
      // CHECK IF USER ALREADY DENY FOR THE PERMISSION
      if (granted == null) {
        var dialog = document.getElementById("notification-dialog");

        if (dialog) {
          dialog.show();
        } else {
          ons
            .createElement("notification-dialog.html", { append: true })
            .then(function (dialog) {
              dialog.show();
            });
        }
      }
    } else {
      // APP ALREADY HAS THE PERMISSION
      cordova.plugins.notification.local.getScheduledIds(function (ids) {
        if (ids.length == 0) {
          // No upcoming notification scheduled
          // Schedule new notifications from start for testing POC
          // startFreeNotification();
        }
      });
    }
  });

  // INIT IN_APP_PURCHASE
  if (window.cordova.platformId === "ios") {
    Purchases.configure("appl_CqjmeUrrKCQizDlxutadJxHpQtt");
  }

  // GET ACTIVE PACKAGES
  Purchases.getOfferings(
    (offerings) => {
      if (offerings.current !== null) {
        // Display current offering with offerings.current
        window.localStorage.setItem(
          "applePackage",
          JSON.stringify(offerings?.current)
        );
      }
    },
    (error) => {
      console.log(error);
      window.localStorage.setItem("applePackage", "");
    }
  );
});

function hideNotificationDialog() {
  document.getElementById("notification-dialog").hide();
}

function getPermission() {
  document.getElementById("notification-dialog").hide();
  cordova.plugins.notification.local.requestPermission(function (granted) {
    window.localStorage.setItem("isPermissionGranted", granted);
    if (granted) {
      startFreeNotification();
    }
  });

  // FirebasePlugin.grantPermission(function (granted) {
  //   window.localStorage.setItem("isPermissionGranted", granted);
  //   if (granted) {
  //     console.log("Permission granted");
  //   }
  // });
}

document.addEventListener("init", function (e) {
  const id = e.target.id; // PAGE ID
  if (id === "pitch") {
    initCarousel();
  }
});

function initCarousel() {
  // CARAOUSEL INDICATORS
  const carouselItems = document.getElementsByTagName("ons-carousel-item");
  let dots = "";
  for (let i = 0; i < carouselItems.length; i++) {
    dots += `<span id="dot${i}" data-index="${i}" class="dot"></span>`;
  }
  document.getElementsByClassName("carousel-indicator")[0].innerHTML = dots;
  document.getElementById(`dot0`).classList.add("dot-active");
  clearInterval(carouselInterval);
  // SET AUTOPLAY ON CAROUSEL
  carouselInterval = setInterval(function () {
    var carousel = document.getElementById("pitch-carousel");
    if (carousel?.getActiveIndex() === carousel?.itemCount - 1)
      carousel?.first();
    else carousel?.next();
  }, 5000);
}

// CAROUSEL INDICATOR CHANGES
document.addEventListener("postchange", function (event) {
  const carousel = document.getElementById("pitch-carousel");
  const index = carousel.getActiveIndex();
  const dots = document.getElementsByClassName("dot");

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("dot-active");
  }

  document.getElementById(`dot${index}`).classList.add("dot-active");
});

function toggleParentalGate() {
  const element = document.getElementsByClassName("parental-gate")[0];
  if (element) {
    element?.classList.toggle("active");
  }
}

let years = [];

function setAge(number) {
  years.push(number);
  setInput();
  if (years.length == 4) {
    checkAge();
    return;
  }
}

function checkAge() {
  const ageyears = parseInt(years?.join(""));
  const currentyear = new Date().getFullYear();

  const age = currentyear - ageyears;

  const container = document.getElementsByClassName("input-container")[0];

  if (age < 18) {
    container.classList.add("error");
    setTimeout(() => {
      years = [];
      setInput();
    }, 800);
    return;
  }

  if (age > 100) {
    container.classList.add("error");
    setTimeout(() => {
      years = [];
      setInput();
    }, 800);
    return;
  }

  years = [];
  setInput();
  document
    .getElementsByClassName("parental-gate")[0]
    .classList.remove("active");

  // NAVIGATE TO PACKAGE SCREEN
  document
    .getElementById("myNavigator")
    .pushPage("package.html")
    .then(function () {
      const packages = JSON.parse(window.localStorage.getItem("applePackage"));
      if (packages == null) return;

      const currencySymbol = packages?.monthly?.product?.priceString?.charAt(0);
      const montlyRate = packages?.monthly?.product?.price;
      const monthlyId = packages?.monthly?.product?.identifier;
      const annualRate = packages?.annual?.product?.price;
      const annualId = packages?.annual?.product?.identifier;

      // MONTHLY AMOUNT
      document.querySelector(
        "#monthly .package-amount h2"
      ).innerHTML = `${currencySymbol}${montlyRate}`;

      document.querySelector("input#month").value = monthlyId;

      document.querySelector(
        "#monthly .package-note span"
      ).innerHTML = `${currencySymbol}${montlyRate}`;

      // YEARLY AMOUNTS
      document.querySelector(
        "#yearly .package-amount h2"
      ).innerHTML = `${currencySymbol}${annualRate}`;

      // YEARLY AMOUNT
      // DIFFERENCE AMOUNT
      document.querySelector(
        "#yearly .package-amount h3"
      ).innerHTML = `${currencySymbol}${montlyRate * 12}`;

      //SAVINGS
      const savings = montlyRate * 12 - annualRate;
      if (savings > 0) {
        document.querySelector(
          "#yearly .savings h3"
        ).innerHTML = `SAVE ${currencySymbol}${savings}`;
      } else {
        document.querySelector("#yearly .package-savings").style.display =
          "none";
      }

      document.querySelector("input#year").value = annualId;

      document.querySelector(
        "#yearly .package-note span"
      ).innerHTML = `${currencySymbol}${annualRate}`;
    });
}

function clearAge() {
  years.splice(-1);
  setInput();
}

function setInput() {
  const input = document.getElementsByClassName("input");

  for (let i = 0; i < 4; i++) {
    const year = years[i];
    if (year === undefined) {
      input[i].innerHTML = "";
    } else {
      input[i].innerHTML = year;
    }
  }

  document
    .getElementsByClassName("input-container")[0]
    .classList.remove("error");
}

function setPlan(e) {
  const elements = document.querySelectorAll("div.package");

  const packages = JSON.parse(window.localStorage.getItem("applePackage"));

  elements.forEach((element) => {
    element.classList.remove("active");
  });

  e.parentElement.classList.add("active");

  document.getElementById("start-trial").removeAttribute("disabled");
  document
    .getElementsByClassName("package-terms")[0]
    .classList.remove("hidden");

  if (e.value === "Kiddopia.PremiumSubscription.Monthly") {
    document.getElementById(
      "package-term-amt"
    ).innerHTML = `${packages?.monthly?.product?.priceString} per month`;
  } else {
    document.getElementById(
      "package-term-amt"
    ).innerHTML = `${packages?.annual?.product?.priceString} per year`;
  }
}

function startPurchase() {
  let productId = document.querySelector('input[name="package"]:checked').value;

  SpinnerDialog.show(null, "Initiating purchase", true);

  Purchases.purchaseProduct(
    productId,
    ({ productIdentifier, customerInfo }) => {
      // Purchase successfull
      SpinnerDialog.hide();
      console.log(customerInfo);

      if (typeof customerInfo.entitlements.active["UnlockEverything"] !== "undefined") {
        document
        .getElementById("myNavigator")
        .resetToPage("thankyou.html", { animation: "push" })
        .then(function () {
          // START THE TRIAL NOTIFICATION
          startTrialNotification();

          let package = {
            name:
              productIdentifier == "Kiddopia.PremiumSubscription.Monthly"
                ? "Monthly"
                : "Yearly",
            expiresIn: customerInfo.entitlements.active["UnlockEverything"]?.expirationDateMillis,
          };

          window.localStorage.setItem("package", JSON.stringify(package));
        });
      }else{
        alert("Something went wrong");
      }
    },
    ({ error, userCancelled }) => {
      // Error making purchase
      SpinnerDialog.hide();
      alert(error.message);
    },
    null,
    Purchases.PURCHASE_TYPE.INAPP
  );
}

function goBack() {
  document.getElementById("myNavigator").popPage();
}

function startFreeNotification() {
  const ids = JSON.parse(window.localStorage.getItem("scheduleIds"));

  // NOTIFICATIONS LIST
  cordova.plugins.notification.local.schedule({
    id: 1,
    foreground: true,
    title: "D1",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 10, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 2,
    foreground: true,
    title: "D2",
    text: "It's Kiddopiaaaaa timeee 🤟🤟🤟",
    attachments: ["file://img/notification-bg.png"],
    trigger: { in: 20, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 3,
    foreground: true,
    title: "D3",
    text: "FIRE! FIIRRREEEE!!\nSave the captain now",
    trigger: { in: 30, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 4,
    foreground: true,
    title: "D4",
    text: "Tap and hold to explore 👆👆👆",
    trigger: { in: 40, unit: "second" },
    attachments: ["file://img/notification.png"],
    actionGroupId: "watch-now-later",
    badge: 1,
    actions: [
      {
        id: "watch-now",
        title: "Watch Now",
        launch: true,
      },
      {
        id: "watch-later",
        title: "Watch Later",
        ui: "decline",
      },
    ],
  });

  cordova.plugins.notification.local.schedule({
    id: 5,
    foreground: true,
    title: "D5",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 50, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 6,
    foreground: true,
    title: "D6",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 60, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 7,
    foreground: true,
    title: "D7",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 70, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 8,
    foreground: true,
    title: "D8",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 80, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 9,
    foreground: true,
    title: "D9",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 90, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 10,
    foreground: true,
    title: "D10",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 100, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 11,
    foreground: true,
    title: "D11",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 110, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 12,
    foreground: true,
    title: "D12",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 120, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 13,
    foreground: true,
    title: "D13",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 130, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 14,
    foreground: true,
    title: "D14",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 140, unit: "second" },
    badge: 1,
  });

  cordova.plugins.notification.local.schedule({
    id: 15,
    foreground: true,
    title: "D15",
    text: "FIRE! FIIRRREEEE!!",
    trigger: { in: 150, unit: "second" },
    badge: 1,
  });
}

function startTrialNotification() {
  // CANCELS ALL FREE NOTIFICATIONS
  cordova.plugins.notification.local.getScheduledIds(async function (ids) {
    window.localStorage.setItem("scheduleIds", JSON.stringify(ids));
    await cordova.plugins.notification.local.cancel(ids);

    // STARTS TRIAL NOTIFICATIONS
    cordova.plugins.notification.local.schedule({
      id: 51,
      foreground: true,
      title: "T1 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      trigger: { in: 10, unit: "second" },
      badge: 1,
    });

    cordova.plugins.notification.local.schedule({
      id: 52,
      foreground: true,
      title: "T2 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      attachments: ["file://img/notification-bg.png"],
      trigger: { in: 20, unit: "second" },
      badge: 1,
    });

    cordova.plugins.notification.local.schedule({
      id: 53,
      foreground: true,
      title: "T3 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      trigger: { in: 30, unit: "second" },
      badge: 1,
    });

    cordova.plugins.notification.local.schedule({
      id: 54,
      foreground: true,
      title: "T4 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      trigger: { in: 40, unit: "second" },
      badge: 1,
    });

    cordova.plugins.notification.local.schedule({
      id: 55,
      foreground: true,
      title: "T5 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      trigger: { in: 50, unit: "second" },
      badge: 1,
    });

    cordova.plugins.notification.local.schedule({
      id: 56,
      foreground: true,
      title: "T6 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      trigger: { in: 60, unit: "second" },
      badge: 1,
    });

    cordova.plugins.notification.local.schedule({
      id: 57,
      foreground: true,
      title: "T7 Hungry? 😋",
      text: "Let's make cupcakes!\nWe'll show you how 👨🏻‍🍳",
      trigger: { in: 70, unit: "second" },
      badge: 1,
    });
  });
}
