document.addEventListener("DOMContentLoaded", function () {
  fetch("assets/data.json")
    .then((response) => response.json())
    .then((data) => {
      handleMetaData(data);
      updateProfileHeaderAndSummary(data);
      appendUnderConstructionMessage(data);
      updateProfileContent(data);
      updateProfileLinks(data);
      updateSocialMediaLinks(data);
      setupContactLink(data.emailAddress);
    });

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

  function updateProfileHeaderAndSummary(data) {
    document.getElementById("profile-header").innerText = data.profileName;
    document.getElementById("profile-summary").innerText = data.profileSummary;
  }

  function appendUnderConstructionMessage(data) {
    if (data.underConstruction) {
      const message = document.createElement("p");
      message.textContent =
        "Thanks for visiting! This site is under construction at the moment, but you can find some of my current work here in the meantime:";
      const profileSummary = document.getElementById("profile-summary");
      profileSummary.parentNode.insertBefore(
        message,
        profileSummary.nextSibling
      );
    }
  }

  function updateProfileContent(data) {
    const profileContent = document.getElementById("profile-content");
    data.profileContent.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      profileContent.appendChild(li);
    });
  }

  function updateProfileLinks(data) {
    const profileLinksSection = document.getElementById("profile-links-list");
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
    const socialMediaContainer = document.querySelector(".social-media");
    // Create and append LinkedIn link
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
