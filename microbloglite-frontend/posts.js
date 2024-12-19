/* Posts Page JavaScript */

"use strict";

function showUserName() {
  const username = document.querySelector("#navbarDropdown");
  username.textContent = JSON.parse(localStorage.getItem("login-data")).username;
}
showUserName();

function loadPosts() {
  const loginData = getLoginData();
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  };
  fetch(apiBaseURL + "/api/posts", options)
    .then((response) => response.json())
    .then((posts) => {
      console.log(posts);
      for (let post of posts) {
        buildCard(post, loginData.username);
      }
    });
}
loadPosts();

function formatDate(isoString) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}-${day}-${year} ${hours}:${minutes}`;
}

function buildCard(info, currentUser) {
  const row = document.querySelector("#postRow");

  let col = document.createElement("div");
  col.className = "col-md-4 d-flex justify-content-center mb-4";

  let card = document.createElement("div");
  card.className = "card";
  card.style = "width: 18rem;";
  col.append(card);

  let cardBody = document.createElement("div");
  cardBody.className = "card-body";
  card.append(cardBody);

  const gravatarHash = md5(info.username.trim().toLowerCase());
  const gravatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon`;

  let avatar = document.createElement("img");
  avatar.src = gravatarUrl;
  avatar.alt = `${info.username}'s avatar`;
  avatar.className = "rounded-circle me-3";
  avatar.style.width = "40px";
  avatar.style.height = "40px";
  cardBody.append(avatar);

  let h5 = document.createElement("h5");
  h5.className = "card-title";
  h5.innerText = `${info.username}`;
  cardBody.append(h5);

  let p = document.createElement("p");
  p.className = "card-text";
  p.innerText = `${info.text}`;
  cardBody.append(p);

  let timestamp = document.createElement("p");
  timestamp.className = "card-text";
  let timestampText = document.createElement("small");
  timestampText.className = "text-body-secondary";
  timestampText.innerText = `${formatDate(info.createdAt)}`;
  timestamp.append(timestampText);
  cardBody.append(timestamp);

  // Like Button Logic
  const likeButton = document.createElement("button");
  likeButton.className = "btn btn-sm me-2";
  likeButton.textContent = "♥ Like";
  likeButton.style.color = isPostLiked(info.likes, currentUser) ? "red" : "grey";

  likeButton.addEventListener("click", () => {
    handleLikeButtonClick(info._id, likeButton, currentUser);
  });
  cardBody.append(likeButton);

  // Delete Button (only for the post owner)
  if (info.username === currentUser) {
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      handleDeletePost(info._id, col);
    });

    cardBody.append(deleteButton);
  }

  //   row.append(col);
  row.prepend(col);
}

function isPostLiked(likes, currentUser) {
  return likes.some((like) => like.username === currentUser);
}

function handleLikeButtonClick(postId, button, currentUser) {
  const loginData = getLoginData();

  // Check if the post is already liked by the user
  const isLiked = button.style.color === "red";

  if (isLiked) {
    // Find the likeId associated with the current user
    const likeId = button.getAttribute("data-like-id");

    if (!likeId) {
      console.error("Like ID not found for this post.");
      return;
    }

    // Unlike the post using DELETE request
    fetch(`${apiBaseURL}/api/likes/${likeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to unlike the post.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Post unliked:", data);
        button.style.color = "grey"; // Update button color
        button.removeAttribute("data-like-id"); // Remove the likeId from the button
      })
      .catch((error) => console.error("Error unliking post:", error));
  } else {
    // Like the post using POST request
    fetch(`${apiBaseURL}/api/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({ postId: postId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to like the post.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Post liked:", data);
        button.style.color = "red"; // Update button color
        button.setAttribute("data-like-id", data._id); // Save the likeId for unliking later
      })
      .catch((error) => console.error("Error liking post:", error));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const newPostButton = document.querySelector("#new-post");

  newPostButton.addEventListener("click", () => {
    createNewPostModal();
  });

  function createNewPostModal() {
    // Check if modal already exists to prevent duplication
    const existingModal = document.querySelector("#newPostModal");
    if (existingModal) {
      const modalInstance = new bootstrap.Modal(existingModal);
      modalInstance.show();
      return;
    }

    // Modal Outer Structure
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "newPostModal";
    modal.tabIndex = "-1";
    modal.setAttribute("aria-labelledby", "newPostModalLabel");
    modal.setAttribute("aria-hidden", "true");

    const modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog";
    modal.appendChild(modalDialog);

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalDialog.appendChild(modalContent);

    // Modal Header
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalContent.appendChild(modalHeader);

    const modalTitle = document.createElement("h5");
    modalTitle.className = "modal-title";
    modalTitle.id = "newPostModalLabel";
    modalTitle.textContent = "Create a New Post";
    modalHeader.appendChild(modalTitle);

    const closeButton = document.createElement("button");
    closeButton.className = "btn-close";
    closeButton.setAttribute("data-bs-dismiss", "modal");
    closeButton.setAttribute("aria-label", "Close");
    modalHeader.appendChild(closeButton);

    // Modal Body with Textarea
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    modalContent.appendChild(modalBody);

    const textArea = document.createElement("textarea");
    textArea.id = "postContent";
    textArea.className = "form-control";
    textArea.rows = "5";
    textArea.placeholder = "Write your post here...";
    modalBody.appendChild(textArea);

    // Modal Footer with Post Button
    const modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    modalContent.appendChild(modalFooter);

    const postButton = document.createElement("button");
    postButton.className = "btn btn-primary";
    postButton.textContent = "POST";
    modalFooter.appendChild(postButton);

    // Append modal to the body
    document.body.appendChild(modal);

    // Bootstrap Modal Instance
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // Post Button Click Handler
    postButton.addEventListener("click", () => {
      const postContent = textArea.value;
      const loginData = getLoginData();

      // POST request to server
      fetch(apiBaseURL + "/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getLoginData().token}`, // Replace with token logic
        },
        body: JSON.stringify({
          text: postContent,
        }),
      })
        .then((response) => response.json())
        .then((newPost) => {
          console.log("Post created successfully:", newPost);
          buildCard(newPost, loginData.username);

          modalInstance.hide(); // Close the modal
          textArea.value = ""; // Clear the textarea
        })
        .catch((error) => console.error("Error creating post:", error));
    });
  }
});

function handleDeletePost(postId, postElement) {
  const loginData = getLoginData();

  fetch(`${apiBaseURL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete the post.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Post deleted successfully:", data);
      postElement.remove(); // Remove the post card from the DOM
    })
    .catch((error) => console.error("Error deleting post:", error));
}
