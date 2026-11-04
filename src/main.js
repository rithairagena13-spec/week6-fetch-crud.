import './style.css'
import { api } from './api/http.js'

document.querySelector('#app').innerHTML = `
  <h1 class="text-3xl font-bold text-indigo-600">
    CRUD Posts Manager
  </h1>
`

async function testRequest() {
  try {
    const posts = await api.get('/posts?_limit=1')
    console.log('API response:', posts)
  } catch (error) {
    console.error('API error:', error)
  }
}

testRequest()