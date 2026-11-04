

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
    class="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-700"
  >
    <option value="">All users</option>
    ${Array.from({ length: 10 }, (_, index) => `
      <option value="${index + 1}">User ${index + 1}</option>
    `).join('')}
  </select>
</div>

      <section id="posts-container" class="space-y-4">
      </section>
    </div>
  </main>
`

const postsContainer = document.querySelector('#posts-container')
const userFilter = document.querySelector('#user-filter')
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
      <p class="text-slate-600">
        ${escapeHTML(post.body)}
      </p>

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