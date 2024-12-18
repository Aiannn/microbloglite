function showUserName() {
  const username = document.querySelector("#navbarDropdown");
  username.textContent = JSON.parse(localStorage.getItem("login-data")).username;
}
showUserName();

document.addEventListener("DOMContentLoaded", () => {
  const username = getLoginData().username; // Get username from local storage or other logic
  fetchUserProfile(username);
});

// Function to fetch user profile data
function fetchUserProfile(username) {
  fetch(`${apiBaseURL}/api/users/${username}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getLoginData().token}`, // Include auth token
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }
      return response.json();
    })
    .then((data) => {
      renderUserProfile(data); // Call to render user data in the DOM
    })
    .catch((error) => {
      console.error("Error fetching profile:", error);
      const main = document.querySelector("main");
      const errorMsg = document.createElement("p");
      errorMsg.className = "text-danger";
      errorMsg.textContent = "Failed to load profile data.";
      main.appendChild(errorMsg);
    });
}

const main = document.querySelector("main");
function renderUserProfile(user) {
  // Clear main content
  main.innerHTML = "";

  // Profile container
  const container = document.createElement("div");
  container.className = "container mt-3";

  // Profile details
  const profileDetails = document.createElement("div");
  profileDetails.id = "profileDetails";

  const username = document.createElement("h3");
  username.textContent = `Username: ${user.username}`;
  profileDetails.appendChild(username);

  const fullName = document.createElement("p");
  fullName.id = "fullName";
  fullName.textContent = `Full Name: ${user.fullName}`;
  profileDetails.appendChild(fullName);

  const bio = document.createElement("p");
  bio.id = "bio";
  bio.textContent = `Bio: ${user.bio}`;
  profileDetails.appendChild(bio);

  const createdAt = document.createElement("p");
  createdAt.textContent = `Created At: ${formatDate(user.createdAt)}`;
  profileDetails.appendChild(createdAt);

  container.appendChild(profileDetails);

  // Edit button
  const editButton = document.createElement("button");
  editButton.className = "btn btn-primary";
  editButton.textContent = "Edit Profile";
  container.appendChild(editButton);

  main.appendChild(container);

  // Handle edit button click
  editButton.addEventListener("click", () => {
    renderEditForm(user);
  });
}

function renderEditForm(user) {
  // Clear main content
  main.innerHTML = "";

  // Edit form container
  const container = document.createElement("div");
  container.className = "container mt-3";

  const form = document.createElement("form");

  // Full Name input
  const fullNameLabel = document.createElement("label");
  fullNameLabel.textContent = "Full Name:";
  const fullNameInput = document.createElement("input");
  fullNameInput.type = "text";
  fullNameInput.className = "form-control";
  fullNameInput.value = user.fullName;

  // Bio input
  const bioLabel = document.createElement("label");
  bioLabel.textContent = "Bio:";
  const bioInput = document.createElement("textarea");
  bioInput.className = "form-control";
  bioInput.rows = 3;
  bioInput.value = user.bio;

  // Save and cancel buttons
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "btn btn-success mt-2";
  saveButton.textContent = "Save Changes";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "btn btn-secondary mt-2 ms-2";
  cancelButton.textContent = "Cancel";

  // Append elements to form
  form.appendChild(fullNameLabel);
  form.appendChild(fullNameInput);
  form.appendChild(bioLabel);
  form.appendChild(bioInput);
  form.appendChild(saveButton);
  form.appendChild(cancelButton);

  container.appendChild(form);
  main.appendChild(container);

  // Save button event
  saveButton.addEventListener("click", () => {
    const updatedUser = {
      fullName: fullNameInput.value,
      bio: bioInput.value,
    };

    fetch(`${apiBaseURL}/api/users/${user.username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getLoginData().token}`,
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then((updatedUserData) => {
        console.log("Profile updated:", updatedUserData);
        renderUserProfile(updatedUserData);
      })
      .catch((error) => console.error("Error updating profile:", error));
  });

  // Cancel button event
  cancelButton.addEventListener("click", () => {
    renderUserProfile(user);
  });
}

// Helper function to format the date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
