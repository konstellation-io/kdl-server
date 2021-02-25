const puppeteer = require('puppeteer')

function getEnvVar(name) {
  const value = process.env[name]
  
  if (value == "" || value == undefined || value == null) {
    throw "The variable \"" + name + "\" is required."
  }
  
  return value
}

async function authorizeDroneApp() {
  const user = getEnvVar("GITEA_ADMIN_USER")
  const pass = getEnvVar("GITEA_ADMIN_PASSWORD")
  const url = getEnvVar("DRONE_URL")

  console.log("Gitea login...")
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-notifications',
      '--ignore-certificate-errors'
    ]
  }
)
  const page = await browser.newPage()
  await page.goto(url)

  const usernameSelector = 'input#user_name'
  const passSelector = 'input#password'

  await page.waitForSelector(usernameSelector)
  await page.waitForSelector(passSelector)

  const usernameField = await page.$(usernameSelector)
  await usernameField.click()
  await usernameField.type(user)
  await usernameField.dispose()

  const passwordField = await page.$(passSelector)
  await passwordField.click()
  await passwordField.type(pass)
  await passwordField.dispose()

  await Promise.all([
    page.click('form.form button'),
    page.waitForNavigation()
  ])

  if (page.url() == url) {
    console.log("Drone is already authorized.")
    await browser.close()
    return
  }

  console.log("Authorizing Drone...")

  const authorizeBtnSelector = "input#authorize-app"
  await page.waitForSelector(authorizeBtnSelector)

  await Promise.all([
    await page.click(authorizeBtnSelector),
    page.waitForNavigation()
  ])

  await browser.close()
}

authorizeDroneApp()
  .then(() => {
    console.log("Drone authorization finished.")
  })
  .catch(err => {
    console.error("Drone authorization failed: " + err)
  })
