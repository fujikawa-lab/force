import type { NextFunction } from "express"
import type { ArtsyRequest, ArtsyResponse } from "./artsyExpress"

import { string } from "underscore"
import artsyXapp from "@artsy/xapp"
import moment from "moment"
import Referrer from "referer-parser"
import uuid from "node-uuid"
import { parse } from "url"
import * as helpers from "../template_helpers"
import config from "../../config"
import * as templateModules from "../../desktop/lib/template_modules"

const { NODE_ENV } = config

/**
 * Inject common project-wide [view locals](http://expressjs.com/api.html#app.locals).
 */
export function localsMiddleware(
  req: ArtsyRequest,
  res: ArtsyResponse,
  next: NextFunction
) {
  let referrer
  const ua = req.get("user-agent") || ""

  // Attach libraries to locals, many of these are used in jade templates
  res.locals._s = string //
  res.locals.moment = moment
  res.locals.helpers = helpers
  for (let key in templateModules) {
    const helper = templateModules[key]
    res.locals[key] = helper
  }

  // Cache views if production or staging
  if (NODE_ENV === "production" || NODE_ENV === "staging") {
    res.locals.cache = true
  }

  // HTML class middleware used by mobile
  res.locals.htmlClass = ""
  if (ua.match(/Artsy-Mobile/)) {
    res.locals.htmlClass += " layout-artsy-mobile-app"
  }
  if (req.user != null) {
    res.locals.htmlClass += " layout-logged-in"
  }

  // Inject some project-wide sharify data such as the session id, the current
  // path and the xapp token.
  res.locals.sd.SESSION_ID =
    req.session != null
      ? req.session.id != null
        ? req.session.id
        : (req.session.id = uuid.v1())
      : undefined
  res.locals.sd.CURRENT_PATH = parse(req.url).pathname
  res.locals.sd.ARTSY_XAPP_TOKEN = artsyXapp.token
  res.locals.sd.REFERRER = referrer = req.get("Referrer")
  if (referrer) {
    res.locals.sd.MEDIUM = new Referrer(referrer).medium
  }
  res.locals.sd.EIGEN = ua.match("Artsy-Mobile") != null
  res.locals.sd.REFLECTION = ua.match("Artsy/Reflection") != null
  res.locals.sd.REQUEST_TIMESTAMP = Date.now()
  res.locals.sd.NOTIFICATION_COUNT =
    req.cookies != null ? req.cookies["notification-count"] : undefined
  res.locals.sd.USER_AGENT = res.locals.userAgent = escape(ua)
  res.locals.sd.REQUEST_ID = req.id
  res.locals.sd.IS_MOBILE = Boolean(
    (ua.match(/iPhone/i) && !ua.match(/iPad/i)) ||
      (ua.match(/Android/i) && ua.match(/Mobile/i)) ||
      ua.match(/Windows Phone/i) ||
      ua.match(/BB10/i) ||
      ua.match(/BlackBerry/i)
  )
  res.locals.sd.IS_TABLET = Boolean(
    (ua.match(/iPad/i) && ua.match(/Mobile/i)) ||
      // specifically targets Vivo
      (ua.match(/vivo/i) && ua.match(/Mobile/i)) ||
      // targets android devices that are not mobile
      (ua.match(/Android/i) && ua.match(/Mobile/i))
  )

  next()
}
