import { timezones } from './lib/timezones'

export let track: (name: string, payload: any) => void = () => {
  throw new Error('analytics init() not called, not initialized')
}

let alreadyInit = false

export function init({
  token = '',
  datasource = 'analytics_events',
  cookieName = 'analytics-session-id',
  namespace,
  eventsEndpoint = '',
  globalAttributes = {} as Record<string, any>,
}) {
  if (typeof window === 'undefined') return
  if (alreadyInit) return
  alreadyInit = true

  /**
   * Send event to endpoint
   *
   * @param  { string } name Event name
   * @param  { object } payload Event payload
   * @return { object } request response
   */
  async function _sendEvent(name, payload) {
    _setSessionId({ cookieName })
    let url

    if (eventsEndpoint) {
      url = eventsEndpoint
    } else {
      url = `https://api.tinybird.co/v0/events?name=${datasource}&token=${token}`
    }

    // payload = _maskSuspiciousAttributes(payload)
    payload = Object.assign({}, payload, globalAttributes)
    payload = JSON.stringify(payload)

    const request = new XMLHttpRequest()
    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/json')
    request.send(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: name,
        version: '1',
        session_id: _getSessionId({ cookieName }) || 'iframe',
        payload,
        namespace,
      }),
    )
  }
  track = _sendEvent

  /**
   * Track page hit
   */
  function _trackPageHit() {
    // If local development environment
    // if (/^localhost$|^127(\.[0-9]+){0,2}\.[0-9]+$|^\[::1?\]$/.test(location.hostname) || location.protocol === 'file:') return;
    // If test environment
    if (window['__nightmare'] || window.navigator.webdriver) return

    let country, locale
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      country = timezones[timezone]
      locale =
        navigator.languages && navigator.languages.length
          ? navigator.languages[0]
          : navigator['userLanguage'] ||
            navigator.language ||
            navigator['browserLanguage'] ||
            'en'
    } catch (error) {
      // ignore error
    }

    // Wait a bit for SPA routers
    setTimeout(() => {
      _sendEvent('page_hit', {
        'user-agent': window.navigator.userAgent,
        locale,
        location: country,
        referrer: document.referrer,
        pathname: window.location.pathname,
        href: window.location.href,
      })
    }, 300)
  }

  // Event listener
  window.addEventListener('hashchange', _trackPageHit)
  const his = window.history
  if (his.pushState) {
    const originalPushState = his['pushState']
    his.pushState = function () {
      originalPushState.apply(this, arguments as any)
      _trackPageHit()
    }
    window.addEventListener('popstate', _trackPageHit)
  }

  let lastPage
  function handleVisibilityChange() {
    if (!lastPage && document.visibilityState === 'visible') {
      _trackPageHit()
    }
  }

  if (document.visibilityState === ('prerender' as any)) {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  } else {
    _trackPageHit()
  }
}

/**
 * Generate uuid to identify the session. Random, not data-derived
 */
function _uuidv4() {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  )
}

let sessionIdCache: string

/**
 * Set session id
 */
function _setSessionId({ cookieName }) {
  /**
   * Try to keep same session id if session cookie exists, generate a new one otherwise.
   *   - First request in a session will generate a new session id
   *   - The next request will keep the same session id and extend the TTL for 30 more minutes
   */
  const sessionId = _getSessionId({ cookieName }) || _uuidv4()
  let cookieValue = `${cookieName}=${sessionId}; Max-Age=1800; path=/; secure`

  // if (domain) {
  //   cookieValue += `; domain=${domain}`
  // }

  document.cookie = cookieValue
  sessionIdCache = sessionId
}

function _getSessionId({ cookieName }) {
  if (sessionIdCache) return sessionIdCache
  let cookie = {}
  document.cookie.split(';').forEach(function (el) {
    let [key, value] = el.split('=')
    cookie[key.trim()] = value
  })
  let value = cookie[cookieName]
  if (value) {
    sessionIdCache = value
  }
  return value
}
