document.addEventListener("DOMContentLoaded", async function () {
  const spinner = document.getElementById("spinner");
  const links = document.querySelectorAll("a, button");
  const profileContentContainer = document.getElementById("content-section");
  const profileImage = document.querySelector(".hero-image img");
  const imagePlaceholder = document.getElementById("image-placeholder");
  let profileHeader = document.getElementById("hero-name");
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
    profileHeader.classList.remove("visible");
    // Wait for the fade-out transition to complete
    await delay(1000); // Adjust the delay to match the CSS transition duration
    // Change the text to profile name and fade it in
    profileHeader.innerText = data.profileName;
    profileHeader.classList.add("visible");
    // Disable links and buttons when spinner is visible
    handleMetaData(data);
    handleProfileImagePlaceholder();
    updateProfileSummary(data);
    appendUnderConstructionMessage(data);
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
    let profileSummary = document.getElementById("hero-summary");

    // Trigger the transition by adding the 'visible' class
    setTimeout(() => {
      profileSummary.innerText = data.profileSummary;
      profileSummary.classList.add("visible");
    }, 500);
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

  function updateSocialMediaLinks(data) {
    const socialMediaLinks = data.socialMediaLinks;
    const socialMediaContainer = document.querySelector(".contact-section");
    // Create and append LinkedIn link
    fetch("assets/iconMap.json")
      .then((response) => response.json())
      .then((data) => {});
    for (socialLink of socialMediaLinks) {
      const socialLinkElement = createSocialLink(
        socialLink.href,
        `assets/${socialLink.name}.png`,
        socialLink.name
      );
      socialMediaContainer.appendChild(socialLinkElement);
    }
  }

  function setupContactLink(emailAddress) {
    const contactLink = document.getElementById("contact-link");
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
