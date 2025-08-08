import fs from "fs"
import axios from "axios"

import { generateGitHubAppJwt } from "../../../libs/data/src/lib/generate-jwt"

export async function generateWebToken() {
  try {
    const PRIVATE_KEY = fs.readFileSync("pkcs8_key.pem", "utf8")
    return await generateGitHubAppJwt(
      process.env.PLASMO_PUBLIC_GITHUB_APP_ID,
      PRIVATE_KEY
    )
  } catch (error) {
    console.error("JWT generation failed:", error)
    throw error
  }
}

const GITHUB_USERNAME = process.env.PLASMO_PUBLIC_GITHUB_USERNAME
const GITHUB_APP_ID = process.env.PLASMO_PUBLIC_GITHUB_APP_ID

async function getAllCommits() {
  try {
    console.log("Fetching commits for user:", GITHUB_USERNAME)
    const jwt = await generateWebToken()
    const response = await axios.get(
      `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: "application/vnd.github.cloak-preview"
        }
      }
    )
    return response.data.items
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `API Error (${error.response?.status}):`,
        error.response?.data
      )
    } else {
      console.error("Unexpected error:", error)
    }
    throw error
  }
}

// Message listener with better error handling
chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  if (message.type === "GET_COMMIT_COUNT") {
    if (!GITHUB_USERNAME) {
      sendResponse({ error: "GITHUB_USERNAME not configured" })
      return false
    }

    if (!GITHUB_APP_ID) {
      sendResponse({ error: "GITHUB_APP_ID not configured" })
      return false
    }

    // Handle async operations properly
    ;(async () => {
      try {
        const count = await getAllCommits()
        sendResponse({ count })
      } catch (error) {
        console.error("Error in GET_COMMIT_COUNT:", error)
        sendResponse({
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    })()

    return true // Keep connection open for async response
  }

  return false
})

// Add error handlers for service worker
self.addEventListener("error", (event) => {
  console.error("Service worker error:", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
})
