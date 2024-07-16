document.addEventListener("DOMContentLoaded", function () {
  const profileData = {
    image: "path-to-your-profile-image.jpg",
    name: "Jess Yupanqui",
    bio: "Your bio goes here...",
  };

  document.getElementById("profile-image").src = profileData.image;
  document.getElementById("name").textContent = profileData.name;
  document.getElementById("bio").textContent = profileData.bio;
});
