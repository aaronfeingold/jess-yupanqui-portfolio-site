const CACHE_TIMESTAMP_KEY = "cacheTimestamp";
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes in milliseconds

document.addEventListener("DOMContentLoaded", async function () {
  const spinner = document.getElementById("spinner");
  const links = document.querySelectorAll("a, button");
  const heroName = document.getElementById("hero-name");
  const profileImage = document.querySelector(".hero-image img");
  const profileContentContainer = document.getElementById("content-section");
  const imagePlaceholder = document.getElementById("image-placeholder");

  try {
    handleNavBar();
    handleSubsectionBackgrounds();
    spinner.style.display = "block"; // Show the spinner
    profileImage.style.opacity = "0.5"; // Dim the profile image

    const observer = new MutationObserver(
      handleMutationObserver(spinner, links)
    );
    observer.observe(spinner, {
      attributes: true,
      attributeFilter: ["style"],
    });

    const minDelay = delay(2250); // 2.25 seconds delay
    const [data] = await Promise.all([fetchAndCacheData(), minDelay]);

    heroName.classList.remove("visible");
    handleHeroImage(data);
    profileImage.style.visibility = "visible"; // Show the profile image
    profileImage.classList.add("visible");
    await delay(1000); // Adjust the delay to match the CSS transition duration
    heroName.innerText = data.profileName;
    heroName.classList.add("visible");

    handleMetaData(data);
    handleProfileImagePlaceholder();
    updateProfileSummary(data);
    appendUnderConstructionMessage(data);
    handleLearnMoreButton();
    handleAdditionalLinksButton();
    handleConnectButton();
    updateProfileContent(data);
    updateProfileLinks(data);
    await updateSocialMediaLinks(data);
    setupContactLink(data.emailAddress);

    spinner.style.display = "none"; // Hide the spinner
    profileImage.style.opacity = "1"; // Restore the profile image opacity
    profileContentContainer.style.display = "block"; // Show the profile content
    imagePlaceholder.style.display = "none"; // Hide the image placeholder
  } catch (error) {
    console.error("Error fetching data:", error);
    spinner.style.display = "none"; // Hide the spinner even if there's an error
  }
});

function handleMutationObserver(spinner, links) {
  return function () {
    if (spinner.style.display === "block") {
      links.forEach((link) => link.setAttribute("disabled", "true"));
    } else {
      links.forEach((link) => link.removeAttribute("disabled"));
    }
  };
}

async function fetchAndCacheData() {
  const cachedData = localStorage.getItem("data");
  const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const now = new Date().getTime();

  if (cachedData && cacheTimestamp) {
    const age = now - parseInt(cacheTimestamp, 10);
    if (age < CACHE_EXPIRATION) {
      // Use cached data
      return JSON.parse(cachedData);
    }
  }

  try {
    const response = await fetch("assets/data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
    localStorage.setItem("data", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return null;
  }
}

async function fetchAndCacheIconMap() {
  const cachedIconMap = localStorage.getItem("iconMap");
  if (cachedIconMap) {
    return JSON.parse(cachedIconMap);
  }

  try {
    const response = await fetch("assets/iconMap.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const iconMap = await response.json();
    localStorage.setItem("iconMap", JSON.stringify(iconMap));

    return iconMap;
  } catch (error) {
    console.error("Failed to fetch icon map:", error);

    return null;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleNavBar() {
  const navBar = document.getElementById("nav-bar");
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const menuModal = document.getElementById("menu-modal");

  function toggleNavBarTransparency() {
    if (window.scrollY > 50) {
      navBar.classList.add("transparent");
    } else {
      navBar.classList.remove("transparent");
    }
  }

  function toggleMenuModal() {
    if (menuModal.classList.contains("active")) {
      menuModal.classList.remove("active");
      setTimeout(() => {
        menuModal.style.display = "none";
      }, 300); // Match the transition duration
    } else {
      menuModal.style.display = "flex";
      menuModal.style.flexDirection = "column";
      setTimeout(() => {
        menuModal.classList.add("active");
      }, 10); // Small delay to ensure display is set before adding class
    }
  }

  function closeModalOnClickOutside(e) {
    e.preventDefault();
    if (!menuModal.contains(e.target) && !hamburgerMenu.contains(e.target)) {
      menuModal.classList.remove("active");
      setTimeout(() => {
        menuModal.style.display = "none";
      }, 300); // Match the transition duration
    }
  }

  function closeModalOnLinkClick(e) {
    e.preventDefault();
    menuModal.classList.remove("active");
    setTimeout(() => {
      menuModal.style.display = "none";
    }, 300); // Match the transition duration
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  }

  function addSmoothScroll(anchor) {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  // Scroll effect for nav bar
  window.addEventListener("scroll", toggleNavBarTransparency);

  // Hamburger menu click event
  hamburgerMenu.addEventListener("click", toggleMenuModal);

  // Close modal on click outside
  window.addEventListener("click", closeModalOnClickOutside);

  // Close modal on link click
  menuModal.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeModalOnLinkClick);
  });

  // Smooth scroll
  navBar.querySelectorAll('a[href^="#"]').forEach(addSmoothScroll);
}

function handleMetaData(data) {
  document.getElementById("page-title").textContent = data.logoName;
  document.getElementById("canonical-link").href = data.canonicalLink;

  data.metaData.forEach((meta) => {
    let metaElement = document.createElement("meta");

    if (meta.property) {
      metaElement.setAttribute("property", meta.property);
    } else if (meta.itemprop) {
      metaElement.setAttribute("itemprop", meta.itemprop);
    } else if (meta.name) {
      metaElement.setAttribute("name", meta.name);
    }

    metaElement.content = meta.content;
    document.head.appendChild(metaElement);
  });
}

function handleProfileImagePlaceholder() {
  const profileImage = document.getElementById("hero-image");
  const placeholder = document.getElementById("image-placeholder");
  if (!profileImage || !placeholder) {
    console.error("Profile image or placeholder element not found.");
    return;
  }

  // Ensure the image is hidden initially
  profileImage.style.display = "none";
  profileImage.onload = function () {
    placeholder.style.display = "none";
    profileImage.style.display = "block";
  };

  // Check if the image is already loaded (for cached images)
  if (profileImage.complete) {
    profileImage.onload();
  }
}

function updateProfileSummary(data) {
  const heroSummary = document.getElementById("hero-summary");
  const scrollButton = document.getElementById("learn-more-scroll-button");

  // Trigger the transition by adding the 'visible' class
  setTimeout(() => {
    heroSummary.innerText = data.profileSummary;
    heroSummary.classList.add("visible");
  }, 500);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            scrollButton.classList.add("visible");
          }, 1000);

          observer.unobserve(heroSummary); // Stop observing once the button is visible
        }
      });
    },
    {
      threshold: 1.0, // Adjust this value as needed
    }
  );

  observer.observe(heroSummary);

  scrollButton.addEventListener("click", function () {
    document
      .getElementById("about-subsection")
      .scrollIntoView({ behavior: "smooth" });
  });
}

function appendUnderConstructionMessage(data) {
  if (data.underConstruction) {
    const message = document.createElement("p");
    message.textContent = data.appendUnderConstructionMessage;
    const profileSummary = document.getElementById("hero-summary");
    profileSummary.parentNode.insertBefore(message, profileSummary.nextSibling);
  }
}

function updateProfileContent(data) {
  const profileContent = document.getElementById("about-content");
  data.profileContent.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    profileContent.appendChild(li);
  });
}

function handleLearnMoreButton() {
  document
    .getElementById("learn-more-scroll-button")
    .addEventListener("click", function () {
      document
        .getElementById("about-subsection")
        .scrollIntoView({ behavior: "smooth" });
    });
}

function handleAdditionalLinksButton() {
  const scrollButton = document.getElementById(
    "additional-links-scroll-button"
  );
  const aboutSection = document.getElementById("about-subsection");
  const linkSection = document.getElementById("links-subsection");

  // Intersection Observer to show the button when about-section is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            scrollButton.classList.add("visible");
          }, 500);

          observer.unobserve(aboutSection); // Stop observing once the button is visible
        }
      });
    },
    {
      threshold: 0.1, // Adjust as needed
    }
  );

  observer.observe(aboutSection);

  // Smooth scroll to link-section when button is clicked
  scrollButton.addEventListener("click", () => {
    linkSection.scrollIntoView({ behavior: "smooth" });
  });
}

function handleConnectButton() {
  const scrollButton = document.getElementById("connect-scroll-button");
  const linksSection = document.getElementById("links-subsection");
  const connectSection = document.getElementById("footer");

  // Intersection Observer to show the button when links-section is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            scrollButton.classList.add("visible");
          }, 500);

          observer.unobserve(linksSection); // Stop observing once the button is visible
        }
      });
    },
    {
      threshold: 0.1, // Adjust as needed
    }
  );

  observer.observe(linksSection);

  // Smooth scroll to link-section when button is clicked
  scrollButton.addEventListener("click", () => {
    connectSection.scrollIntoView({ behavior: "smooth" });
  });
}

function updateProfileLinks(data) {
  const profileLinksSection = document.getElementById("links-list");
  if (Array.isArray(data.variousHyperlinks)) {
    data.variousHyperlinks.forEach((link) => {
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.textContent = link.text;
      anchor.target = "_blank"; // Open link in new tab
      listItem.appendChild(anchor);
      profileLinksSection.appendChild(listItem);
    });
  }
}

// Helper function to create social media link
function createSocialLink(href, imgSrc, altText) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.target = "_blank"; // Open link in new tab
  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = altText;
  anchor.appendChild(img);
  return anchor;
}

async function updateSocialMediaLinks(data) {
  const socialMediaLinks = data.socialMediaLinks;
  const contactList = document.getElementById("connect-list");

  const iconMap = await fetchAndCacheIconMap();

  if (!iconMap) {
    console.error(
      "Icon map is not available. Cannot update social media links."
    );
    return;
  }

  for (socialLink of socialMediaLinks) {
    const iconObj = iconMap.iconList.find(
      (iconObj) => iconObj.name === socialLink.name
    );
    if (iconObj) {
      const socialLinkElement = createSocialLink(
        socialLink.href,
        `assets/${socialLink.name}.png`,
        iconObj.altText
      );
      const listItem = document.createElement("li");
      listItem.appendChild(socialLinkElement);
      contactList.appendChild(listItem);
    } else {
      console.warn(`Icon for ${socialLink.name} not found in icon map.`);
    }
  }
}

function setupContactLink(emailAddress) {
  const contactLink = document.getElementById("email-contact");
  const toast = document.getElementById("toast");

  contactLink.addEventListener("click", (event) => {
    event.preventDefault();
    copyToClipboard(emailAddress);
    showToast(emailAddress);
  });

  function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  function showToast(emailAddress) {
    toast.classList.add("show");
    toast.innerText = `Email ${emailAddress} copied to clipboard!`;
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

function handleSubsectionBackgrounds() {
  const backgroundImages = ["#d29145", "#d9cbb6"];
  const subsections = document.querySelectorAll(".content-subsection");

  for (let i = 0; i < subsections.length; i++) {
    subsections[i].style.backgroundColor =
      backgroundImages[i % backgroundImages.length];

    if (i === subsections.length - 1) {
      subsections[i].style.height = "auto";
    } else {
      subsections[i].style.minHeight = "100vh";
    }
  }
}

function handleHeroImage(data) {
  const heroImage = document.getElementById("hero-image");
  heroImage.src = data.profileImage;
}
