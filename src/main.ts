import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { overlaySpinWheelEffectType } from "./overlay-spin-wheel";
import { initLogger, logger } from "./logger";
import { Request, Response } from 'express';
import spinHtml from './spinhtml.html';
//import spinJs from './frontendJs/spin.js';
import { HttpServerManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/http-server-manager";

interface Params {
}

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Spin Wheel Script",
      description: "Spin Wheel Effect",
      author: "CKY",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
    };
  },
  run: (runRequest) => {
    const { effectManager, frontendCommunicator, httpServer } = runRequest.modules;
    webServer = httpServer;

    initLogger(runRequest.modules.logger);
    logger.info("Timer Overlay Script is loading...");

    // const { logger } = runRequest.modules;
    const request = (runRequest.modules as any).request;
    effectManager.registerEffect(
      overlaySpinWheelEffectType(request, frontendCommunicator, runRequest)
    );
  },
};

export let webServer: HttpServerManager;

export default script;
