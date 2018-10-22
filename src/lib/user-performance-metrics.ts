// Forked and modified from UXM: https://github.com/treosh/uxm

declare let PerformancePaintTiming: any

/**
 * `window.performance` or `null`
 */
const perf = typeof window !== "undefined" ? window.performance : null

/**
 * Returns a duration if both inputs are valid and start occurs before end,
 * otherwise returns `null`.
 */
const sanitizedMetrics = (start: number, end: number): number | null =>
  start > 0 && end > 0 && end - start > 0 ? end - start : null

export function mark(markName) {
  if (perf && perf.mark) {
    perf.mark(markName)
  }
}

export function measure(measureName, startMarkName) {
  if (perf && perf.measure) {
    try {
      perf.measure(measureName, startMarkName)
    } catch (err) {
      console.error(err)
    }
  }
}

export function getUserTiming() {
  if (!perf || typeof PerformanceMark === "undefined") return null
  const marks = perf.getEntriesByType("mark").map(mark => {
    return {
      type: "mark",
      name: mark.name,
      startTime: Math.round(mark.startTime),
    }
  })
  const measures = perf.getEntriesByType("measure").map(measure => {
    return {
      type: "measure",
      name: measure.name,
      startTime: Math.round(measure.startTime),
      duration: Math.round(measure.duration),
    }
  })
  return marks.concat(measures)
}

export function getFirstPaint() {
  if (typeof PerformancePaintTiming === "undefined") return null
  const firstPaint = perf
    .getEntriesByType("paint")
    .find(({ name }) => name === "first-paint")
  return firstPaint ? Math.round(firstPaint.startTime) : null
}

export function getFirstContentfulPaint() {
  if (typeof PerformancePaintTiming === "undefined") return null
  const firstContentfulPaint = perf
    .getEntriesByType("paint")
    .find(({ name }) => name === "first-contentful-paint")
  return firstContentfulPaint
    ? Math.round(firstContentfulPaint.startTime)
    : null
}

export function getOnLoad() {
  if (!perf || !perf.timing) return null
  return sanitizedMetrics(perf.timing.requestStart, perf.timing.loadEventEnd)
}

export function getDomContentLoaded() {
  if (!perf || !perf.timing) return null
  return sanitizedMetrics(
    perf.timing.requestStart,
    perf.timing.domContentLoadedEventEnd
  )
}

export function getDomComplete() {
  if (!perf || !perf.timing) return null
  return sanitizedMetrics(perf.timing.requestStart, perf.timing.domComplete)
}

export function getDeviceMemory() {
  const deviceMemory =
    // @ts-ignore
    typeof navigator !== "undefined" ? navigator.deviceMemory : undefined
  if (deviceMemory === undefined) return null
  return deviceMemory > 1 ? "full" : "lite"
}

/**
 * In order for this method to work you'll need to inject this snippet of JS in
 * the head section of the site markup
 *
 * !function(){if('PerformanceLongTaskTiming' in window){var g=window.__lt={e:[]};
 * g.o=new PerformanceObserver(function(l){g.e=g.e.concat(l.getEntries())});
 * g.o.observe({entryTypes:['longtask']})}}();
 */
export function getLongTasks() {
  // @ts-ignore
  if (typeof window.__lt === "undefined") return null
  // @ts-ignore
  return window.__lt.e.map(longTask => ({
    startTime: Math.round(longTask.startTime),
    duration: Math.round(longTask.duration),
  }))
}
