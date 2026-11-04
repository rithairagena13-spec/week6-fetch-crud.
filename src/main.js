

import './style.css'
import { api } from './api/http.js'

const app = document.querySelector('#app')

let posts = []
let isLoading = false
let errorMessage = ''

app.innerHTML = `
  <main class="min-h-screen bg-slate-100 px-6 py-10">
    <div class="mx-auto max-w-5xl">
      <h1 class="mb-2 text-3xl font-bold text-slate-800">
        CRUD Posts Manager
      </h1>
      <p class="mb-8 text-slate-500">
        Manage your posts using JSONPlaceholder.
      </p>
      <div class="mb-6">
  <label for="user-filter" class="mb-2 block font-medium text-slate-700">
    Filter by user
  </label>

  <select
    id="user-filter"
    class="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-700">
    <option value="">All users</option>
    ${Array.from({ length: 10 }, (_, index) => `
      <option value="${index + 1}">User ${index + 1}</option>
    `).join('')}
  </select>
</div>

<form id="post-form" class="mb-8 rounded-xl bg-white p-6 shadow-sm">
  <h2 class="mb-4 text-xl font-bold text-slate-800">
    Create New Post
  </h2>

  <div class="mb-4">
    <label for="post-title" class="mb-2 block font-medium text-slate-700">
      Title
    </label>
    <input
      type="text"
      id="post-title"
      required
      placeholder="Enter post title"
      class="w-full rounded-lg border border-slate-300 p-3"
    />
  </div>

  <div class="mb-4">
    <label for="post-body" class="mb-2 block font-medium text-slate-700">
      Description
    </label>
    <textarea
      id="post-body"
      required
      placeholder="Write your post..."
      class="w-full rounded-lg border border-slate-300 p-3"
    ></textarea>
  </div>

  <button
    type="submit"
    class="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700">
    Create Post
  </button>
</form>

      <section id="posts-container" class="space-y-4">
      </section>
    </div>
  </main>
`

const postsContainer = document.querySelector('#posts-container')
const userFilter = document.querySelector('#user-filter')
const postForm = document.querySelector('#post-form')
const titleInput = document.querySelector('#post-title')
const bodyInput = document.querySelector('#post-body')
function renderPosts() {
  if (isLoading) {
    postsContainer.innerHTML = `
      <p class="rounded-lg bg-white p-6 text-center text-slate-500">
        Loading posts...
      </p>
    `
    return
  }

  if (errorMessage) {
    postsContainer.innerHTML = `
      <p class="rounded-lg bg-red-50 p-6 text-center text-red-600">
        ${errorMessage}
      </p>
    `
    return
  }

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <p class="rounded-lg bg-white p-6 text-center text-slate-500">
        No posts found.
      </p>
    `
    return
  }

  postsContainer.innerHTML = posts.map(post => `
   <article class="rounded-xl bg-white p-6 shadow-sm">
  <h2 class="mb-2 text-lg font-semibold text-slate-800">
    ${escapeHTML(post.title)}
  </h2>

  <p class="mb-4 text-slate-600">
    ${escapeHTML(post.body)}
  </p>

  <button
    class="edit-btn rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
    data-id="${post.id}" >
    Edit
  </button>
 <button
  class="delete-btn rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
  data-id="${post.id}">
  Delete
</button>
</article>
  `).join('')
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

async function loadPosts(userId = '') {
  isLoading = true
  errorMessage = ''
  renderPosts()

  try {
  const params = new URLSearchParams()

if (userId) {
  params.append('userId', userId)
} else {
  params.append('_limit', '10')
}

posts = await api.get(`/posts?${params}`)
  } catch (error) {
    errorMessage = error.message || 'Something went wrong.'
  } finally {
    isLoading = false
    renderPosts()
  }
}

loadPosts()
userFilter.addEventListener('change', () => {
  const userId = userFilter.value

  loadPosts(userId)
})

postForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const newPost = {
    title: titleInput.value.trim(),
    body: bodyInput.value.trim(),
    userId: 1,
  }

  try {
    const createdPost = await api.post('/posts', newPost)

    posts.unshift(createdPost)

    renderPosts()

    postForm.reset()
  } catch (error) {
    alert(error.message || 'Failed to create post.')
  }
})

postsContainer.addEventListener('click', async (event) => {
  if (event.target.classList.contains('edit-btn')) {
    const postId = Number(event.target.dataset.id)

    const post = posts.find(post => post.id === postId)

    const newTitle = prompt('Enter the new post title:', post.title)

    if (!newTitle || !newTitle.trim()) return

    try {
      const updatedPost = await api.patch(`/posts/${postId}`, {
        title: newTitle.trim(),
      })

      posts = posts.map(post =>
        post.id === postId
          ? { ...post, title: updatedPost.title }
          : post
      )

      renderPosts()
    } catch (error) {
      alert(error.message || 'Failed to update post.')
    }
  }
    if (event.target.classList.contains('delete-btn')) {
    const postId = Number(event.target.dataset.id)

    const confirmed = confirm('Are you sure you want to delete this post?')

    if (!confirmed) return

    try {
      await api.del(`/posts/${postId}`)

      posts = posts.filter(post => post.id !== postId)

      renderPosts()
    } catch (error) {
      alert(error.message || 'Failed to delete post.')
    }
  }
})