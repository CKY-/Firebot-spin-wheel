import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { overlaySpinWheelEffectType } from "./overlay-spin-wheel";
import { initLogger, logger } from "./logger";
import { Request, Response } from 'express';
import spinHtml from './spinhtml.html';
// @ts-ignore
import easing from './easing.mj';
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
    const { effectManager, frontendCommunicator,resourceTokenManager, httpServer } = runRequest.modules;
    webServer = httpServer
    webServer.registerCustomRoute("cky-spin", "easing.js", "GET", (req: Request, res: Response) => {
      res.setHeader('content-type', 'text/javascript');
      res.end(easing)
    });
    
    initLogger(runRequest.modules.logger);
    logger.info("SpinWheel Overlay Script is loading...");
    //logger.info(easing);
    // const { logger } = runRequest.modules;
    const request = (runRequest.modules as any).request;
    effectManager.registerEffect(
      overlaySpinWheelEffectType(request, frontendCommunicator, resourceTokenManager, runRequest)
    );
  },
  stop: () => {
    webServer.unregisterCustomRoute("cky-spin", "easing.js", "GET");
  }
};

export let webServer: HttpServerManager;

export default script;
