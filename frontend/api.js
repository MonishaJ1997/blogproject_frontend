const API_URL = "http://127.0.0.1:8000/api";

// --- GET: Load all posts ---
async function loadPosts() {
  let res = await fetch(`${API_URL}/posts/`);
  let data = await res.json();
  let container = document.getElementById("posts");
  container.innerHTML = "";

  data.forEach(post => {
    let div = document.createElement("div");
    div.classList.add("post-card");
    div.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.content}</p>
      <small>by ${post.author.username} on ${new Date(post.created_at).toLocaleString()}</small>
      <div class="post-actions">
        <button onclick="deletePost(${post.id})">❌ Delete</button>
        <button onclick="editPost(${post.id}, '${post.title}', '${post.content}')">✏ Edit</button>
      </div>
      <h4>Comments:</h4>
      <ul>${post.comments.map(c => `<li><b>${c.author.username}</b>: ${c.content}</li>`).join("")}</ul>
      <textarea id="comment-${post.id}" placeholder="Write a comment..."></textarea>
      <button onclick="addComment(${post.id})">💬 Add Comment</button>
    `;
    container.appendChild(div);
  });
}


// --- POST: Add Comment ---
async function addComment(postId) {
  let token = localStorage.getItem("token");
  let content = document.getElementById(`comment-${postId}`).value;

  let res = await fetch(`${API_URL}/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ post: postId, content })
  });

  if (res.ok) loadPosts();
  else alert("Login required to add comments.");
}

// --- DELETE: Remove Post ---
async function deletePost(postId) {
  let token = localStorage.getItem("token");

  let res = await fetch(`${API_URL}/posts/${postId}/`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  });

  if (res.ok) {
    alert("Post deleted!");
    loadPosts();
  } else alert("Not allowed.");
}

// --- PUT: Edit Post ---
async function editPost(postId, oldTitle, oldContent) {
  let token = localStorage.getItem("token");
  let newTitle = prompt("Edit title:", oldTitle);
  let newContent = prompt("Edit content:", oldContent);

  if (!newTitle || !newContent) return;

  let res = await fetch(`${API_URL}/posts/${postId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ title: newTitle, content: newContent })
  });

  if (res.ok) {
    alert("Post updated!");
    loadPosts();
  } else alert("Not allowed.");
}



document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:8000/api/posts/")
        .then((res) => res.json())
        .then((posts) => {
            const container = document.getElementById("blog-container");

            posts.forEach((post) => {
                const postDiv = document.createElement("div");
                postDiv.className = "blog-post";

                let commentsHTML = "";
                post.comments.forEach((comment) => {
                    commentsHTML += `<p><strong>${comment.author.username}</strong>: ${comment.content}</p>`;
                });

                postDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <p><em>By ${post.author.username} on ${new Date(post.created_at).toLocaleString()}</em></p>
                    <div class="comments">
                        <h4>Comments:</h4>
                        ${commentsHTML || "<p>No comments yet.</p>"}
                    </div>
                `;

                container.appendChild(postDiv);
            });
        })
        .catch((err) => console.error("Failed to fetch posts:", err));
});
