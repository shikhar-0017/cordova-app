// GLOBAL VARIABLES
var carouselInterval;

document.addEventListener("deviceready", function () {
  FirebasePlugin.getToken(
    function (fcmToken) {
      alert(fcmToken);
      console.log(fcmToken);
    },
    function (error) {
      alert("Error: " + error);
    }
  );

  FirebasePlugin.hasPermission(function (hasPermission) {
    if (!hasPermission) {
      FirebasePlugin.grantPermission(function (granted) {
        if (granted) {
          console.log("Permission granted");
        }
      });
    }
  });

  FirebasePlugin.onMessageReceived(
    function (message) {
      console.log(message);
      alert(JSON.stringify(message));
    },
    function (error) {
      console.error(error);
    }
  );
});

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
      // DO SOMETHING
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

  elements.forEach((element) => {
    element.classList.remove("active");
  });

  e.parentElement.classList.add("active");

  document.getElementById("start-trial").removeAttribute("disabled");
  document
    .getElementsByClassName("package-terms")[0]
    .classList.remove("hidden");

  if (e.value === "MONTHLY") {
    document.getElementById("package-term-amt").innerHTML = "$9.99 per month";
  } else {
    document.getElementById("package-term-amt").innerHTML = "$6.99 per year";
  }
}

function startDebit() {
  const packageData = JSON.parse(window.localStorage.getItem("package"));

  if (packageData == null || packageData.expiresIn < Date.now()) {
    var dialog = document.getElementById("my-alert-dialog");

    if (dialog) {
      dialog.show();
    } else {
      ons
        .createElement("alert-dialog.html", { append: true })
        .then(function (dialog) {
          dialog.show();
        });
    }
  } else {
    alert(`${packageData.name} Package already active`);
    window.location = "subscriber.html";
  }
}

function startPurchase(debit) {
  document.getElementById("my-alert-dialog").hide();

  let packageName = document.querySelector(
    'input[name="package"]:checked'
  ).value;

  let packageDuration = 0;
  let packageTime = "";

  if (debit) {
    if (packageName === "MONTHLY") {
      packageDuration = 780000; // MONTHLY DURATION (13 mins) in ms
      packageTime = "13 mins";
    } else {
      packageDuration = 1560000; // YEARLY DURATION (26 mins) in ms
      packageTime = "26 mins";
    }
  } else {
    // WHEN USER NOT OPTED FOR AUTO DEBIT
    packageName = "FREE TRIAL";
    packageDuration = 120000; // TRIAL DURATION (2 mins) in ms
    packageTime = "2 mins";
  }

  const expiresIn = Date.now() + packageDuration;
  let package = {
    name: packageName,
    expiresIn,
    duration: packageTime,
  };

  document
    .getElementById("myNavigator")
    .resetToPage("thankyou.html", { animation: "push" })
    .then(function () {
      window.localStorage.setItem("package", JSON.stringify(package));
    });
}

function goBack() {
  document.getElementById("myNavigator").popPage();
}
