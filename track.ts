import { timezones } from "./lib/timezones"

export function track({ token, datasource = 'analytics_events', namespace }) {
  const COOKIE_NAME = 'session-id'

  let globalAttributes = {}

  if (document.currentScript) {
    // host = document.currentScript.getAttribute('data-host')
    // proxy = document.currentScript.getAttribute('data-proxy')
    token ||= document.currentScript.getAttribute('data-token') || ''
    // domain = document.currentScript.getAttribute('data-domain')
    datasource =
      document.currentScript.getAttribute('data-datasource') || datasource

    for (const attr of document.currentScript.attributes) {
      if (attr.name.startsWith('tb_')) {
        globalAttributes[attr.name.slice(3)] = attr.value
      }
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
      ).toString(16)
    )
  }

  function _getSessionId() {
    let cookie = {}
    document.cookie.split(';').forEach(function (el) {
      let [key, value] = el.split('=')
      cookie[key.trim()] = value
    })
    return cookie[COOKIE_NAME]
  }

  /**
   * Set session id
   */
  function _setSessionId() {
    /**
     * Try to keep same session id if session cookie exists, generate a new one otherwise.
     *   - First request in a session will generate a new session id
     *   - The next request will keep the same session id and extend the TTL for 30 more minutes
     */
    const sessionId = _getSessionId() || _uuidv4()
    let cookieValue = `${COOKIE_NAME}=${sessionId}; Max-Age=1800; path=/; secure`

    // if (domain) {
    //   cookieValue += `; domain=${domain}`
    // }

    document.cookie = cookieValue
  }

  /**
   * Try to mask PPI and potential sensible attributes
   *
   * @param  { object } payload Event payload
   * @return { object } Sanitized payload
   */
  const _maskSuspiciousAttributes = payload => {
    const attributesToMask = [
      'username',
      'user',
      'user_id',
      'userid',
      'password',
      'pass',
      'pin',
      'passcode',
      'token',
      'api_token',
      'email',
      'address',
      'phone',
      'sex',
      'gender',
      'order',
      'order_id',
      'orderid',
      'payment',
      'credit_card',
    ]

    // Deep copy
    let _payload = JSON.stringify(payload)
    attributesToMask.forEach(attr => {
      _payload = _payload.replaceAll(
        new RegExp(`("${attr}"):(".+?"|\\d+)`, 'mgi'),
        '$1:"********"'
      )
    })

    return _payload
  }

  /**
   * Send event to endpoint
   *
   * @param  { string } name Event name
   * @param  { object } payload Event payload
   * @return { object } request response
   */
  async function _sendEvent(name, payload) {
    _setSessionId()
    let url

    // Use public Tinybird url if no custom endpoint is provided
    // if (proxy) {
    //   url = `${proxy}/api/tracking`
    // } else if (host) {
    //   host = host.replaceAll(/\/+$/gm, '')
    //   url = `${host}/v0/events?name=${DATASOURCE}&token=${token}`
    // } else {

    // }
    url = `https://api.tinybird.co/v0/events?name=${datasource}&token=${token}`

    payload = _maskSuspiciousAttributes(payload)
    payload = Object.assign({}, JSON.parse(payload), globalAttributes)
    payload = JSON.stringify(payload)

    const request = new XMLHttpRequest()
    request.open('POST', url, true)
    request.setRequestHeader('Content-Type', 'application/json')
    request.send(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: name,
        version: '1',
        session_id: _getSessionId(),
        payload,
        namespace,
      })
    )
  }

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

  // Client
  window['Tinybird'] = { trackEvent: _sendEvent }

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
