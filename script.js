// handle meta data section in the header
document.addEventListener("DOMContentLoaded", function () {
  fetch("assets/data.json")
    .then((response) => response.json())
    .then((data) => {
      const profileData = data;
      document.getElementById("page-title").textContent = profileData.logoName;
      document.getElementById("canonical-link").href =
        profileData.canonicalLink;

      profileData.metaData.forEach((meta) => {
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
    });
});
