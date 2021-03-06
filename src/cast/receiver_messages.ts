// Nessages to be processed inside the Cast Receiver app

import { CastManager } from "./cast_manager";

import { BaseCastMessage } from "./types";
import { CAST_DEV_HASS_URL, CAST_DEV } from "./const";
import { Auth } from "home-assistant-js-websocket";

export interface GetStatusMessage extends BaseCastMessage {
  type: "get_status";
}

export interface ConnectMessage extends BaseCastMessage {
  type: "connect";
  refreshToken: string;
  clientId: string;
  hassUrl: string;
}

export interface ShowLovelaceViewMessage extends BaseCastMessage {
  type: "show_lovelace_view";
  viewPath: string | null;
}

export interface ShowDemoMessage extends BaseCastMessage {
  type: "show_demo";
}

export type HassMessage =
  | ShowDemoMessage
  | GetStatusMessage
  | ConnectMessage
  | ShowLovelaceViewMessage;

export const castSendAuth = (cast: CastManager, auth: Auth) =>
  cast.sendMessage({
    type: "connect",
    refreshToken: auth.data.refresh_token,
    clientId: auth.data.clientId,
    hassUrl: CAST_DEV ? CAST_DEV_HASS_URL : auth.data.hassUrl,
  });

export const castSendShowLovelaceView = (
  cast: CastManager,
  viewPath: ShowLovelaceViewMessage["viewPath"]
) =>
  cast.sendMessage({
    type: "show_lovelace_view",
    viewPath,
  });

export const castSendShowDemo = (cast: CastManager) =>
  cast.sendMessage({
    type: "show_demo",
  });

export const ensureConnectedCastSession = (cast: CastManager, auth: Auth) => {
  if (cast.castConnectedToOurHass) {
    return;
  }

  return new Promise((resolve) => {
    const unsub = cast.addEventListener("connection-changed", () => {
      if (cast.castConnectedToOurHass) {
        unsub();
        resolve();
        return;
      }
    });

    castSendAuth(cast, auth);
  });
};
