(function () {
  "use strict";

  const form = document.getElementById("estimator-form");

  if (form) {
    const result = document.getElementById("result");

    const RATE_PER_KM = 1.5;

    const SPEED = {
      standard: {
        label: "Standard",
        multiplier: 1,
        eta: "2 to 3 days",
        note: "no surcharge"
      },
      express: {
        label: "Express",
        multiplier: 1.5,
        eta: "Today",
        note: "+50% surcharge"
      },
      midnight: {
        label: "Midnight call-out",
        multiplier: 2,
        eta: "Within 3 hours",
        note: "+100% surcharge"
      }
    };

    const requiredFieldIds = [
      "name",
      "email",
      "destination",
      "distance",
      "ghost",
      "severity",
      "propertySize",
      "area"
    ];

    function money(amount) {
      return "RM " + amount.toFixed(2);
    }

    function escapeHtml(value) {
      const div = document.createElement("div");
      div.textContent = String(value);
      return div.innerHTML;
    }

    function showError(id, message) {
      const field = document.getElementById(id);
      const error = document.getElementById(id + "-error");

      if (error) error.textContent = message;
      if (field) field.setAttribute("aria-invalid", "true");
    }

    function clearError(id) {
      const field = document.getElementById(id);
      const error = document.getElementById(id + "-error");

      if (error) error.textContent = "";
      if (field) field.removeAttribute("aria-invalid");
    }

    function showSpeedError(message) {
      const error = document.getElementById("speed-error");
      if (error) error.textContent = message;
    }

    function clearSpeedError() {
      showSpeedError("");
    }

    requiredFieldIds.forEach(function (id) {
      const field = document.getElementById(id);
      if (!field) return;

      field.addEventListener("input", function () {
        clearError(id);
      });

      field.addEventListener("change", function () {
        clearError(id);
      });
    });

    document.querySelectorAll('input[name="speed"]').forEach(function (radio) {
      radio.addEventListener("change", clearSpeedError);
    });

    function validateForm() {
      requiredFieldIds.forEach(clearError);
      clearSpeedError();

      let isValid = true;

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const destination = document.getElementById("destination").value.trim();
      const distance = document.getElementById("distance").value.trim();
      const ghost = document.getElementById("ghost").value;
      const propertySize = document.getElementById("propertySize").value;
      const area = document.getElementById("area").value;
      const speed = document.querySelector('input[name="speed"]:checked');

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) {
        showError("name", "Name is required.");
        isValid = false;
      }

      if (!email) {
        showError("email", "Email address is required.");
        isValid = false;
      } else if (!emailPattern.test(email)) {
        showError("email", "Please enter a valid email address.");
        isValid = false;
      }

      if (!distance) {
        showError("distance", "Distance is required.");
        isValid = false;
      } else if (
        !Number.isFinite(Number(distance)) ||
        Number(distance) < 1 ||
        Number(distance) > 500
      ) {
        showError("distance", "Distance must be between 1 and 500 km.");
        isValid = false;
      }

      if (!ghost) {
        showError("ghost", "Please select a ghost type.");
        isValid = false;
      }

      if (!destination) {
    showError("destination", "Destination is required.");
    isValid = false;
      } else if (destination.length < 3) {
          showError("destination", "Please enter a valid destination.");
          isValid = false;
      }

      if (!propertySize) {
        showError("propertySize", "Please select property size.");
        isValid = false;
      }

      if (!area) {
        showError("area", "Please select the affected area.");
        isValid = false;
      }

      if (!speed) {
        showSpeedError("Please choose a delivery speed.");
        isValid = false;
      }

      return isValid;
    }

    function calculateEstimate() {
  const distance = Number(
    document.getElementById("distance").value
  );

  const destination =
    document.getElementById("destination").value.trim();

  const ghostSelect = document.getElementById("ghost");
  const ghostFee = Number(ghostSelect.value);
  const ghostLabel =
    ghostSelect.options[ghostSelect.selectedIndex].text;

  const propertySelect =
    document.getElementById("propertySize");

  const propertyFee = Number(propertySelect.value);
  const propertyLabel =
    propertySelect.options[propertySelect.selectedIndex].text;

  const area = document.getElementById("area").value;

  const speedChoice =
    document.querySelector('input[name="speed"]:checked');

  const speed = SPEED[speedChoice.value];

  

  let addons = 0;
  const addonNames = [];

  document.querySelectorAll('input[name="addon"]:checked')
    .forEach(function (addon) {
      addons += Number(addon.value);
      addonNames.push(addon.parentNode.textContent.trim());
    });

  const travel = distance * RATE_PER_KM;

  const subtotal = ghostFee + travel + propertyFee + addons;

  const speedCharge = subtotal * (speed.multiplier - 1);

  const total = subtotal + speedCharge;

  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    destination: destination,
    distance: distance,
    ghostFee: ghostFee,
    ghostLabel: ghostLabel,
    propertyFee: propertyFee,
    propertyLabel: propertyLabel,
    area: area,
    travel: travel,
    addons: addons,
    addonNames: addonNames,
    speed: speed,
    speedCharge: speedCharge,
    total: total
  };
}
  
    function showResult(data) {
      const addonText = data.addonNames.length
        ? escapeHtml(data.addonNames.join(", "))
        : "None selected";

      const details = [
  "<li>Name: " + escapeHtml(data.name) + "</li>",
  "<li>Email: " + escapeHtml(data.email) + "</li>",
  "<li>Destination: " + escapeHtml(data.destination) + "</li>",
  "<li>Distance: " + data.distance + " km</li>",
  "<li>Ghost type: " + escapeHtml(data.ghostLabel) + "</li>",
  "<li>Property size: " + escapeHtml(data.propertyLabel) + "</li>",
  "<li>Affected area: " + escapeHtml(data.area) + "</li>",
  "<li>Delivery speed: " + escapeHtml(data.speed.label) + "</li>",
  "<li>Add-ons: " + addonText + "</li>"
].join("");

      const costRows = [
  ["Ghost removal", data.ghostFee],
  ["Travel", data.travel],
  ["Property size", data.propertyFee]
];

if (data.addons > 0) {
  costRows.push(["Add-ons", data.addons]);
}

if (data.speedCharge > 0) {
  costRows.push([
    data.speed.label + " surcharge",
    data.speedCharge
  ]);
}

      const costBreakdown = costRows.map(function (row) {
        return "<li><span>" +
          escapeHtml(row[0]) +
          "</span><span>" +
          money(row[1]) +
          "</span></li>";
      }).join("");

      const rules = [
  "<li>Ghost fee: " + escapeHtml(data.ghostLabel) + "</li>",
  "<li>Destination: " + escapeHtml(data.destination) + "</li>",
  "<li>Travel: " + data.distance + " km × RM 1.50 = " +
    money(data.travel) + "</li>",
  "<li>Property size: " + escapeHtml(data.propertyLabel) +
    " = " + money(data.propertyFee) + "</li>",
  "<li>Affected area: " + escapeHtml(data.area) + "</li>",
  "<li>Speed: " + escapeHtml(data.speed.label) +
    ", " + escapeHtml(data.speed.note) + "</li>",
  "<li>Add-ons: " + addonText + "</li>"
  ].join("");

      result.innerHTML =
        "<h2>Estimate for " +
          escapeHtml(data.name) + "</h2>" +

        '<p class="total">' +
          money(data.total) + "</p>" +

        '<p class="eta">Arrival: ' +
          escapeHtml(data.speed.eta) + "</p>" +

        '<h3 class="rules-title">Your details: </h3>' +
        '<ul class="rules-used">' +
          details + "</ul>" +

        '<h3 class="rules-title">Cost breakdown: </h3>' +
        '<ul class="rules-used">' +
         costBreakdown + "</ul>" +

        '<h3 class="rules-title">Rules used: </h3>' +
        '<ul class="rules-used">' +
          rules + "</ul>";

      result.classList.remove("reveal");
      void result.offsetWidth;
      result.classList.add("reveal");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm()) {
        alert("Please complete all required fields correctly.");

        const firstInvalid =
          form.querySelector('[aria-invalid="true"]');

        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }

        return;
      }

      const estimate = calculateEstimate();

showResult(estimate);
alert(
    "Calculation Complete!\n\n" +
    "Your estimated cost is " + money(estimate.total)
);
    });

    const resetButton = document.getElementById("reset-btn");

    if (resetButton) {
      resetButton.addEventListener("click", function (event) {
        if (!confirm("Clear the form and your estimate?")) {
          event.preventDefault();
        }
      });
    }

    form.addEventListener("reset", function () {
      requiredFieldIds.forEach(clearError);
      clearSpeedError();

      if (result) {
        result.classList.remove("reveal");

        result.innerHTML =
          "<h2>Your estimate</h2>" +
          '<p class="empty">Fill in the form and choose Get estimate. Your cost and arrival time appear here.</p>';
      }
    });
  }

  const sliderTrack = document.getElementById("sliderTrack");
  const sliderSlides =
    document.querySelectorAll(".hero-slider .slide");

  const sliderDots =
    document.querySelectorAll(".hero-slider .dot");

  const nextButton = document.getElementById("nextBtn");
  const prevButton = document.getElementById("prevBtn");

  if (sliderTrack && sliderSlides.length > 0) {
    let currentIndex = 0;
    const totalSlides = sliderSlides.length;

    function displaySlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;

      sliderTrack.style.transform =
        "translateX(-" + (currentIndex * 100) + "%)";

      sliderSlides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === currentIndex);
      });

      sliderDots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === currentIndex);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        displaySlide(currentIndex + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        displaySlide(currentIndex - 1);
      });
    }

    sliderDots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        displaySlide(index);
      });
    });

    let autoSlide = setInterval(function () {
      displaySlide(currentIndex + 1);
    }, 4000);

    const slider = document.querySelector(".hero-slider");

    if (slider) {
      slider.addEventListener("mouseenter", function () {
        clearInterval(autoSlide);
      });

      slider.addEventListener("mouseleave", function () {
        autoSlide = setInterval(function () {
          displaySlide(currentIndex + 1);
        }, 4000);
      });
    }

    displaySlide(0);
  }

  document.querySelectorAll(".select-ghost-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const ghostSelect = document.getElementById("ghost");

      if (ghostSelect) {
        ghostSelect.value = this.dataset.value;

        ghostSelect.dispatchEvent(
          new Event("change", { bubbles: true })
        );
      }
    });
  });

})();
