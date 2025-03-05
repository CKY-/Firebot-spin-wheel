import { Firebot, RunRequest, ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { v4 } from "uuid";
import * as path from "path";
import { readdir } from 'node:fs/promises';
import { logger } from "./logger";
import { webServer } from "./main";
import { randomUUID } from "crypto";
import { EventData, EV, PropsItem } from "./types";
import { resolve } from "path";
import effectTemplate from './effect-template.html';

const fs = require("fs");
const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

interface EffectModel {
  length: number;
  variable: string;
  inbetweenAnimation: any;
  inbetweenDelay: number;
  inbetweenDuration: number;
  inbetweenRepeat: any;
  enterAnimation: any;
  enterDuration: number;
  exitAnimation: any;
  exitDuration: number;
  // customCoords: any;
  // position: any;
  // height: number;
  // width: number;
  // debugBorder: Boolean;
  // dropShadow: Boolean;
  overlayInstance: string;
  EventData: EventData;
  fileOrList: string;
  filePath: string;
  imageType: string;
  imageUrl: string;
  imageFile: string;
  imageFolder: string;
  resourceToken: string | number | boolean;
  easingValue: number;
  easingLabel: string;
  duration: number;
  //html: string;
}

export function overlaySpinWheelEffectType(
  request: any,
  frontendCommunicator: ScriptModules["frontendCommunicator"],
  resourceTokenManager: ScriptModules["resourceTokenManager"],
  runRequest: any
) {
  const overlaySpinWheelEffectType: Firebot.EffectType<EffectModel> = {
    definition: {
      id: "cky:spin-wheel",
      name: "Spin Wheel Overlay",
      description: "Spins a wheel in the overlay.",
      icon: "fad fa-spinner",
      categories: ["overlay"],
      dependencies: [],
      // @ts-ignore
      outputs: [
        {
          label: "Winning Slice",
          description: "Name of the winning slice",
          defaultName: "winningSlice"
        },
        {
          label: "Winning Value",
          description: "Value of the winning slice",
          defaultName: "winningValue"
        }
      ],
      triggers: {
        command: true,
        custom_script: true,
        startup_script: true,
        api: true,
        event: true,
        hotkey: true,
        timer: true,
        counter: true,
        preset: true,
        manual: true,
        quick_action:true,
      },
    },
    optionsTemplate: effectTemplate,
    optionsController: ($scope: any, backendCommunicator: any, utilityService: any, $q: any, $rootScope: any) => {

      $scope.easingFunctions = [
        'default (easeSinOut)',
        'easeSinInOut',
        'easeCubicOut',
        'easeCubicInOut',
        'easeElasticOut',
        'easeBounceOut',
      ];

      $scope.setEasingType = function () {
        $scope.effect.easingValue = $scope.easingFunctions.findIndex((label: string) => {
          // console.log(label);
          // console.log($scope.effect.easingLabel);
          return label === $scope.effect.easingLabel;
        });
        // console.log($scope.effect.easingValue, $scope.effect.easingLabel);
      }

      $scope.resetDefault = () => {
        $scope.effect.EventData = {};
        $scope.effect.EventData.props = {};
        $scope.effect.EventData.props.items = [];
        $scope.effect.EventData.props.itemBackgroundColors = ["#fbf8c4", "#e4f1aa", "#c0d26e", "#ff7d7d"];
        $scope.effect.EventData.props.itemLabelColors = ["#000"];
        $scope.effect.EventData.props.radius = 0.89;
        $scope.effect.EventData.props.itemLabelFontSizeMax = 500;
        $scope.effect.EventData.props.pointerAngle = 90;
        $scope.effect.EventData.props.pixelRatio = 0;
        $scope.effect.EventData.props.rotation = 4;
        $scope.effect.EventData.props.isInteractive = true;
        $scope.effect.EventData.props.itemLabelBaselineOffset = 0;
        $scope.effect.EventData.props.itemLabelRadius = 0.92;
        $scope.effect.EventData.props.itemLabelRadiusMax = 0.37;
        $scope.effect.EventData.props.itemLabelRotation = 0;
        $scope.effect.EventData.props.itemLabelStrokeColor = '#fff';
        $scope.effect.EventData.props.itemLabelFont = "Rubik";
        $scope.effect.EventData.props.rotationSpeedMax = 700;
        $scope.effect.EventData.props.rotationResistance = -31;
        $scope.effect.EventData.props.borderColor = '#000';
        $scope.effect.EventData.props.lineWidth = 0;
        $scope.effect.EventData.props.borderWidth = 0;
        $scope.effect.EventData.duration = 2600;
        $scope.effect.easingValue = 0;
        $scope.effect.easingLabel = $scope.easingFunctions[$scope.effect.easingValue];
      }

      // $scope.sliderTranslate = (value: number) => value * 100;
      if ($scope.effect.EventData == null) {
        $scope.resetDefault();
      }

      if ($scope.effect.easingValue == null || $scope.effect.easingValue === -1) {
        //console.log($scope.effect.easingValue)
        $scope.effect.easingValue = 0;
      }

      if ($scope.effect.easingLabel == "" || $scope.effect.easingLabel == null) {
        $scope.effect.easingLabel = $scope.easingFunctions[$scope.effect.easingValue];
      }

      if ($scope.effect.EventData.props.itemLabelAlign == null) {
        $scope.effect.EventData.props.itemLabelAlign = "right";
      }

      if ($scope.effect.fileOrList == null) {
        $scope.effect.fileOrList = "file";
      }

      if ($scope.effect.imageType == null) {
        $scope.effect.imageType = "url";
      }

      $scope.showOverlayInfoModal = function (overlayInstance: string) {
        utilityService.showOverlayInfoModal(overlayInstance);
      };

      $scope.removeItemAtIndex = (index: number) => {
        if (index > -1) {
          $scope.effect.EventData.props.items.splice(index, 1);
        }
      }

      $scope.removeItemBackgroundColorsAtIndex = (index: number) => {
        if (index > -1) {
          $scope.effect.EventData.props.itemBackgroundColors.splice(index, 1);
        }
      }

      $scope.removeItemLabelColorsAtIndex = (index: number) => {
        if (index > -1) {
          $scope.effect.EventData.props.itemLabelColors.splice(index, 1);
        }
      }

      $scope.addSpinWheelItem = () => {
        $scope.effect.EventData.props.items.push(
          {
            label: "",
            weight: 1
          }
        )
        // console.log($scope.effect.EventData.props.items)
      }
      if ($scope.effect.duration == null) {
        $scope.effect.duration = 2600;
      }

      $scope.addSpinWheelItemLabelColor = () => {
        $scope.effect.EventData.props.itemLabelColors.push("#000")
        //console.log($scope.effect.EventData.props.itemLabelColors)
      }

      $scope.addSpinWheelItemBackgroundColor = () => {
        $scope.effect.EventData.props.itemBackgroundColors.push("#fff")
        //console.log($scope.effect.EventData.props.itemBackgroundColors)
      }
      //$scope.addSpinWheelItem();

      $scope.placeHolderUrl = "https://cdn.discordapp.com/attachments/959615433848270859/1199955203898740839/wheel-2-overlay.png";

      $scope.showImage = false;
      $scope.imageLoaded = function (successful: boolean) {
        $scope.showImage = successful;
      };
      $scope.openLink = function (url: string) {
        $rootScope.openLinkExternally(url);
      };

      $scope.getImagePreviewSrc = function () {
        let path;
        if ($scope.effect.imageType === "local") {
          path = $scope.effect.imageFile;
        } else if ($scope.effect.imageType === "url") {
          path = $scope.effect.imageUrl;
        } else {
          path = $scope.effect.imageFolder;
        }
        return path;
      };

      $scope.imageTypeUpdated = function () {
        if ($scope.effect.imageType === "local") {
          $scope.effect.imageUrl = undefined;
          $scope.effect.imageFolder = undefined;
        } else if ($scope.effect.imageType === "url") {
          $scope.effect.imageFile = undefined;
          $scope.effect.imageFolder = undefined;
        } else {
          $scope.effect.imageUrl = undefined;
          $scope.effect.imageFile = undefined;
        }
      };
    },

    optionsValidator: (effect) => {
      let errors = [];
      if (effect.length == null) {
        errors.push("Please enter a value for duration");
      }
      return errors;
    },
    onTriggerEvent: async (event) => {

      if (event.effect.fileOrList == "file") {
        let contents: string;
        try {
          contents = fs.readFileSync(event.effect.filePath, { encoding: "utf8" });
        } catch (err) {
          logger.error("error reading file", err);
        }
        event.effect.EventData.props.items = JSON.parse(contents);
      }
      else if (event.effect.fileOrList == "variable") {
        try {
          event.effect.EventData.props.items = JSON.parse(event.effect.variable);
        } catch (err) {
          logger.error("error reading variable", err);
        }
      }

      const data: EventData = {
        enterAnimation: event.effect.enterAnimation,
        exitAnimation: event.effect.exitAnimation,
        enterDuration: event.effect.enterDuration,
        exitDuration: event.effect.enterAnimation,
        inbetweenAnimation: event.effect.inbetweenAnimation,
        inbetweenDelay: event.effect.inbetweenDelay,
        inbetweenDuration: event.effect.inbetweenDuration,
        inbetweenRepeat: event.effect.inbetweenRepeat,

        easingValue: event.effect.easingValue,
        imageType: event.effect.imageType,
        imageUrl: event.effect.imageUrl,
        imageFolder: event.effect.imageFolder,
        imageFile: event.effect.imageFile,
        resourceToken: event.effect.resourceToken,
        overlayInstance: event.effect.overlayInstance,
        uuid: randomUUID(),
        length: event.effect.length,
        props: event.effect.EventData.props,
        duration: event.effect.duration ?? 1
      };

      if (event.effect.imageType == null) {
        event.effect.imageType = "local";
      }

      if (event.effect.imageType === "local") {

        const resourceToken = resourceTokenManager.storeResourcePath(
          event.effect.imageFile,
          event.effect.length
        );
        data.resourceToken = resourceToken;
      }

      if (event.effect.imageType === "folderRandom") {

        let files: string[] = [];
        try {
          files = await readdir(event.effect.imageFolder)
        } catch (err) {
          logger.warn("Unable to read image folder", err);
        }

        // @ts-ignore
        const filteredFiles = files.filter(i => (/\.(gif|jpg|jpeg|png)$/i).test(i));

        const chosenFile = filteredFiles[Math.floor(Math.random() * filteredFiles.length)];

        const fullFilePath = path.join(event.effect.imageFolder, chosenFile);

        const resourceToken = resourceTokenManager.storeResourcePath(
          fullFilePath,
          event.effect.length
        );
        data.resourceToken = resourceToken;
      }

      data.props.items.forEach((item) => {
        // @ts-ignore
        item.weight = parseFloat(item.weight) || 1;
      });
      //console.log("tokenOutsideCB:", data.resourceToken)
      const waitPromise = new Promise<PropsItem>((resolve) => {
        const listener = (ev: EV) => {
          if (ev.name !== data.uuid) return;
          // @ts-ignore
          webServer.off("overlay-event", listener);
          resolve(ev.data.result);
        }
        // @ts-ignore
        webServer.on("overlay-event", listener);
      });

      // @ts-ignore
      webServer.sendToOverlay("cky-spinwheel", data);

      const winningSlice = await waitPromise;

      return {
        success: true,
        outputs: {
          winningSlice: winningSlice.label,
          winningValue: winningSlice.value
        }
      };
    },
    overlayExtension: {
      dependencies: {
        css: [],
        js: []
      },
      event: {
        name: "cky-spinwheel",
        onOverlayEvent: (event: EventData) => {
          // Frontend Code Here
          //const html = require('./spinhtml.html');

          const html = /*html*/`
                              <div id={{WHEELSPINDIVID}}  class="position-wrapper middle-center">
                                    <div id="spin-wheel" class="spin-wheel inner-position">
                                        <style>
                                            @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400&display=swap');
                                            @import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400&display=swap');
                                            @import url('https://fonts.googleapis.com/css2?family=Pragati+Narrow&display=swap');
                                            @import url('https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap');

                                            * {
                                                margin: 0;
                                                padding: 0;
                                                font-family: 'Lucida Grande', sans-serif;
                                                font-size: 15px;
                                                -webkit-tap-highlight-color: transparent;
                                                user-select: none;
                                                /* Prevent selecting ui text when dragging */
                                            }

                                            .spin-wheel {
                                                /* Prevent pull-down-to-refresh gesture */
                                                overscroll-behavior-y: contain;
                                                height: 100%;
                                                /* Prevent iOS rubber-band effect */
                                                position: fixed;
                                                width: 100%;
                                                /* Prevent browser from handling touch events */
                                                touch-action: none;
                                                display: flex;
                                                flex-direction: column;
                                                justify-items: stretch;
                                                align-items: stretch;
                                            }

                                            .wheel-wrapper {
                                                overflow: hidden;
                                                height: 100%;
                                                width: 100%;
                                            }

                                            select {
                                                padding: 2px;
                                            }

                                            label {
                                                margin-right: 5px;
                                            }
                                        </style>
                                        <div class="wheel-wrapper"></div>
                                    </div>
                                </div>
          `;

          function loadHtmlAndExecute() {
            const { uuid, length, props } = event;
            const data = event;
            //console.log(data)
            if (data.imageType === "url") {
              data.props.overlayImage = data.imageUrl;
            } else {
              if (data.resourceToken != null) {
                const token = encodeURIComponent(data.resourceToken);
                data.props.overlayImage = `http://${window.location.hostname}:7472/resource/${token}`;
              } else {
                data.props.overlayImage = "https://cdn.discordapp.com/attachments/1195710104834691182/1200288158638682132/wheel-4-overlay-2.png"
              }
            }

            $("#wrapper").append(html.replace("{{WHEELSPINDIVID}}", uuid));

            const container = document.getElementById(uuid).getElementsByClassName("wheel-wrapper")[0];

            //console.log('2');
            const easingFunctions = [
              {
                label: 'default (easeSinOut)',
                function: null,
              },
              {
                label: 'easeSinInOut',
                // @ts-ignore
                function: window.easing.sinInOut,
              },
              {
                label: 'easeCubicOut',
                // @ts-ignore
                function: window.easing.cubicOut,
              },
              {
                label: 'easeCubicInOut',
                // @ts-ignore
                function: window.easing.cubicInOut,
              },
              {
                label: 'easeElasticOut',
                // @ts-ignore
                function: window.easing.elasticInOut,
              },
              {
                label: 'easeBounceOut',
                // @ts-ignore
                function: window.easing.bounceOut,
              },
            ];

            const mils = length * 1000;
            console.log(mils && mils > 0 ? mils : 18000)
            // @ts-ignore
            showTimedAnimatedElement(
              `#${uuid}`,
              data.enterAnimation,
              data.enterDuration,
              data.inbetweenAnimation,
              data.inbetweenDelay,
              data.inbetweenDuration,
              data.inbetweenRepeat,
              data.exitAnimation,
              data.exitDuration,
              mils && mils > 0 ? mils : 18000,
              null,
              () => {
                setTimeout(() => $(`#${uuid}`).remove(), mils && mils > 0 ? mils : 18000);
              }
            );
            // @ts-ignore
            window.wheel = new spinWheel.Wheel(container, props);
            function fetchWinningItemIndex() {
              return getRandomInt(0, props.items.length);
            }
            function getRandomInt(min: number, max: number) {
              min = Math.ceil(min);
              max = Math.floor(max);
              return Math.floor(Math.random() * (max - min) + min);
            }
            // @ts-ignore
            // wheel.pointerAngle = 90;
            const winningItemIndex = fetchWinningItemIndex();
            let durType = "s";
            let enterDuration = 1;
            if (data.enterDuration) {
              durType = (data.enterDuration.toString().match(/[^\d.-]/g) || []).join("");
              enterDuration = Number(data.enterDuration.toString().replace(durType, ""));
            }
            console.log(data.enterDuration);
            if (durType == "s") {
              enterDuration = enterDuration * 1000;
            }

            enterDuration = data.duration + enterDuration;
            const revolutions = data.props.rotation;
            // @ts-ignore
            setTimeout(() => wheel.spinToItem(winningItemIndex, data.duration, false, revolutions, 1, easingFunctions[data.easingValue].function), enterDuration)

            // @ts-ignore
            wheel.onRest = (e) => {
              // @ts-ignore
              sendWebsocketEvent(uuid, { result: props.items[e.currentIndex] });
              // console.log(e);
              // console.log(length);
              // setTimeout(() => $(`#${uuid}`).remove(), length * 1000);
            };
          }

          const script_elem = document.getElementById("cky-spin-wheel-iife");

          if (script_elem == null) {

            const easing = document.createElement('script');

            easing.type = "module";

            easing.id = "cky-spin-wheel-easing"

            easing.async = false;

            easing.innerHTML = `import * as easing from 'http://${window.location.host}/integrations/cky-spin/easing.js';
                        window.easing = easing;
                       //console.log('1');`

            document.head.appendChild(easing);

            const spin_wheel = document.createElement('script');

            spin_wheel.src = 'https://cdn.jsdelivr.net/npm/spin-wheel@4.3.1/dist/spin-wheel-iife.js';

            spin_wheel.async = false;

            spin_wheel.id = "cky-spin-wheel-iife";

            spin_wheel.onload = function () {
              loadHtmlAndExecute();
            }
            document.head.appendChild(spin_wheel);
            loadHtmlAndExecute();

          } else {
            loadHtmlAndExecute();
          }
        }
      }
    }
  };
  return overlaySpinWheelEffectType;
}

//$runEffect[``{ "id": "97ea3470-bd17-11ee-9735-adcee9f0ceb9", "type": "cky:spin-wheel", "active": true, "EventData": { "props": { "items": [{ "label": "One", "weight": "10" }, { "label": "two", "weight": 1 }, { "label": "Three", "weight": 1 }], "itemBackgroundColors": ["#fbf8c4", "#e4f1aa", "#c0d26e", "#ff7d7d"], "itemLabelColors": ["#000"], "radius": 0.89, "itemLabelFontSizeMax": 500, "pointerAngle": 90, "pixelRatio": 0, "rotation": 0, "isInteractive": true, "itemLabelBaselineOffset": 0, "itemLabelRadius": 0.92, "itemLabelRadiusMax": 0.37, "itemLabelRotation": 0, "itemLabelStrokeColor": "#fff", "itemLabelFont": "Rubik", "rotationSpeedMax": 700, "rotationResistance": -31, "borderColor": "#000", "lineWidth": 0, "overlayImage": "https://cdn.discordapp.com/attachments/959615433848270859/1199955203898740839/wheel-2-overlay.png", "borderWidth": 0, "itemLabelAlign": "right", "name": "something" } }, "fileOrList": "list", "imageType": "url", "outputNames": { "winningSlice": "winningSlice" }, "displayDuration": "30", "imageUrl": "https://cdn.discordapp.com/attachments/1195710104834691182/1200288158907121755/wheel-1-overlay-2.png", "easingValue": 5, "easingLabel": "easeBounceOut", "enterAnimation": "fadeIn", "exitAnimation": "fadeOut", "inbetweenAnimation": "none", "enterDuration": "2s", "exitDuration": "1s", "length": "10" } ``]