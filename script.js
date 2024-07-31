document.addEventListener("DOMContentLoaded", async function () {
  const spinner = document.getElementById("spinner");
  const links = document.querySelectorAll("a, button");
  const profileContentContainer = document.getElementById("content-section");
  const profileImage = document.querySelector(".hero-image img");
  const imagePlaceholder = document.getElementById("image-placeholder");
  let heroName = document.getElementById("hero-name");
  // Function to create a delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    handleNavBar();
    spinner.style.display = "block"; // Show the spinner
    profileImage.style.opacity = "0.5"; // Dim the profile image
    // Transition to profile name after a short delay

    const observer = new MutationObserver(function () {
      if (spinner.style.display === "block") {
        links.forEach((link) => link.setAttribute("disabled", "true"));
      } else {
        links.forEach((link) => link.removeAttribute("disabled"));
      }
    });

    observer.observe(spinner, {
      attributes: true,
      attributeFilter: ["style"],
    });
    // Start both the data fetch and the minimum delay
    const fetchData = fetch("assets/data.json").then((response) =>
      response.json()
    );
    const minDelay = delay(2250); // 2.25 seconds delay

    const [data] = await Promise.all([fetchData, minDelay]);
    // Fade out "Content Loading..."
    heroName.classList.remove("visible");
    // Wait for the fade-out transition to complete
    await delay(1000); // Adjust the delay to match the CSS transition duration
    // Change the text to profile name and fade it in
    heroName.innerText = data.profileName;
    heroName.classList.add("visible");
    // Disable links and buttons when spinner is visible
    handleMetaData(data);
    handleProfileImagePlaceholder();
    updateProfileSummary(data);
    appendUnderConstructionMessage(data);
    handleLearnMoreButton();
    handleAdditionalLinksButton();
    updateProfileContent(data);
    updateProfileLinks(data);
    updateSocialMediaLinks(data);
    setupContactLink(data.emailAddress);

    spinner.style.display = "none"; // Hide the spinner
    profileImage.style.opacity = "1"; // Restore the profile image opacity
    profileContentContainer.style.display = "block"; // Show the profile content
    profileImage.style.visibility = "visible"; // Show the profile image
    imagePlaceholder.style.display = "none"; // Hide the image placeholder
  } catch (error) {
    console.error("Error fetching data:", error);
    spinner.style.display = "none"; // Hide the spinner even if there's an error
  }

  function handleNavBar() {
    const navBar = document.getElementById("nav-bar");
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const menuModal = document.getElementById("menu-modal");

    // Scroll effect for nav bar
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        navBar.classList.add("transparent");
      } else {
        navBar.classList.remove("transparent");
      }
    });

    // Hamburger menu click event
    hamburgerMenu.addEventListener("click", function () {
      if (
        menuModal.style.display === "none" ||
        menuModal.style.display === ""
      ) {
        menuModal.style.display = "flex";
        menuModal.style.flexDirection = "column";
      } else {
        menuModal.style.display = "none";
      }
    });

    // Close modal on click outside
    window.addEventListener("click", function (event) {
      if (event.target === menuModal) {
        menuModal.style.display = "none";
      }
    });

    // Close modal on link click
    menuModal.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        menuModal.style.display = "none";
        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        });
      });
    });

    // Smooth scroll
    navBar.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        });
      });
    });
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
        .getElementById("about-section")
        .scrollIntoView({ behavior: "smooth" });
    });
  }

  function appendUnderConstructionMessage(data) {
    if (data.underConstruction) {
      const message = document.createElement("p");
      message.textContent =
        "Thanks for visiting! This site is under construction at the moment, but you can find some of my current work here in the meantime:";
      const profileSummary = document.getElementById("hero-summary");
      profileSummary.parentNode.insertBefore(
        message,
        profileSummary.nextSibling
      );
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
          .getElementById("about-section")
          .scrollIntoView({ behavior: "smooth" });
      });
  }

  function handleAdditionalLinksButton() {
    const scrollButton = document.getElementById(
      "additional-links-scroll-button"
    );
    const aboutSection = document.getElementById("about-section");
    const linkSection = document.getElementById("links-section");

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

  async function fetchIconMap() {
    try {
      const response = await fetch("assets/iconMap.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch icon map:", error);
      return null;
    }
  }

  async function updateSocialMediaLinks(data) {
    const socialMediaLinks = data.socialMediaLinks;
    const socialMediaContainer = document.getElementById(
      "contact-anchors-list"
    );

    const iconMap = await fetchIconMap();

    if (!iconMap) {
      console.error(
        "Icon map is not available. Cannot update social media links."
      );
      return;
    }

    for (socialLink of socialMediaLinks) {
      if (iconObj) {
        const socialLinkElement = createSocialLink(
          socialLink.href,
          `assets/${socialLink.name}.png`,
          iconObj.altText
        );
        socialMediaContainer.appendChild(socialLinkElement);
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
});
