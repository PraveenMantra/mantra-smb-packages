(function () {
  const ANALYTICS_ENDPOINT =
    "https://bwt7dhs7tmdhuv6fh37tsobftq0owntt.lambda-url.ca-central-1.on.aws/"; // ← Replace with your endpoint

  let sessionId;
  const sessionStart = Date.now();

  // === Send Event ===
  function sendAnalyticsEvent(eventName, data = {}) {
    const payload = {
      event: eventName,
      data,
      sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    };

    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn("[Analytics] Error sending event:", err);
    });
  }

  // === Session Management ===
  function generateSessionId() {
    return "sess-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now();
  }

  function trackSessionStart() {
    sendAnalyticsEvent("session_start", {
      startedAt: new Date().toISOString(),
    });
  }

  function getSessionId() {
    let existing = sessionStorage.getItem("sessionId");
    if (!existing) {
      existing = generateSessionId();
      sessionStorage.setItem("sessionId", existing);
      sessionId = existing;
      return true; // Indicates a new session
    } else {
      sessionId = existing;
      return false; // Existing session
    }
  }

  // Fix: Call getSessionId and trigger session_start if new session
  const isNewSession = getSessionId();
  if (isNewSession) {
    trackSessionStart();
  }

  // === Page View Tracking ===
  function trackPageView() {
    sendAnalyticsEvent("page_view", {
      title: document.title,
      path: window.location.pathname,
    });
  }

  // === Click Tracking ===
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a");
    if (link && link.href) {
      sendAnalyticsEvent("link_click", {
        text: link.innerText.trim(),
        href: link.href,
      });
    }

    const button = e.target.closest("button");
    if (button) {
      sendAnalyticsEvent("button_click", {
        text: button.innerText.trim(),
        id: button.id || "",
        class: button.className || "",
      });
    }
  });

  // === Form Submission Tracking ===
  document.addEventListener("submit", function (e) {
    const form = e.target;
    sendAnalyticsEvent("form_submit", {
      id: form.id || "",
      class: form.className || "",
      action: form.action || "",
      method: form.method || "GET",
    });
  });

  // === SPA Route Change Tracking ===
  function patchHistoryMethod(method) {
    const original = history[method];
    history[method] = function () {
      const result = original.apply(this, arguments);
      trackPageView();
      return result;
    };
  }

  patchHistoryMethod("pushState");
  patchHistoryMethod("replaceState");
  window.addEventListener("popstate", trackPageView);

  // === Track Session Duration on Unload ===
  window.addEventListener("beforeunload", function () {
    const duration = Date.now() - sessionStart;
    const payload = {
      event: "session_end",
      data: { durationMs: duration },
      sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, JSON.stringify(payload));
    } else {
      // fallback for very old browsers
      fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  });

  // === Initial Page View ===
  trackPageView();

  console.log("[Analytics Tracker] Initialized, sessionId:", sessionId);
})();
