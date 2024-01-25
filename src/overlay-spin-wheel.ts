import { Firebot, RunRequest, ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { v4 } from "uuid";
import { resolve } from "path";
//import { spinWheelList } from "./gui/app/directives/controls/spin-wheel-list.js"
import { logger } from "./logger";
import { webServer } from "./main";

import { randomUUID } from "crypto";
import { EventData, CkyEvent, EV } from "./types";

const wait = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

interface EffectModel {
    displayDuration: number;
    endTriggerCallUrl: String;
    inbetweenAnimation: any;
    inbetweenDelay: number;
    inbetweenDuration: number;
    inbetweenRepeat: any;
    enterAnimation: any;
    enterDuration: number;
    exitAnimation: any;
    exitDuration: number;
    customCoords: any;
    position: any;
    duration: number;
    height: number;
    width: number;
    debugBorder: Boolean;
    dropShadow: Boolean;
    overlayInstance: String;
    CkyEvent: CkyEvent;
    html: string;

}

export function overlaySpinWheelEffectType(
    request: any,
    frontendCommunicator: ScriptModules["frontendCommunicator"],
    runRequest: any
) {
    const overlaySpinWheelEffectType: Firebot.EffectType<EffectModel> = {
        definition: {
            id: "cky:spin-wheel",
            name: "Spin Wheel (CKY Special Sauce)",
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
            },
        },
        optionsTemplate: ` 
        <setting-container header="Spin Wheel Settings" collapsed="true">
          <firebot-input input-title="Name" model="effect.CkyEvent.props.name" placeholder="Enter a name for the spin Wheel."></firebot-input>
          <label class="control-fb control--checkbox" style="margin-top:15px"> Show Debug Box's
            <input type="checkbox" ng-model="effect.CkyEvent.props.debug">
            <div class="control__indicator"></div>
          </label>
          <firebot-input input-title="Duration" model="effect.displayDuration" placeholder="Enter time in seconds."></firebot-input>
            <p>Align</p>
            <label class="control-fb control--radio">Left
              <input type="radio" ng-model="effect.CkyEvent.props.itemLabelAlign" value="AlignText.left" />
              <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">Center
              <input type="radio" ng-model="effect.CkyEvent.props.itemLabelAlign" value="AlignText.center" />
              <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">Right
              <input type="radio" ng-model="effect.CkyEvent.props.itemLabelAlign" value="AlignText.right" />
              <div class="control__indicator"></div>
            </label>
        </setting-container>

        <setting-container header="Choices" pad-top="true"collapsed="true">
          <div class="input-group" style="width: 100%;">
            <div ng-repeat="item in effect.CkyEvent.props.items track by $index" class="list-item">
              <div class="item ml-8" style="font-weight: 400;width: 100%;margin-bottom: 10px;">
                <div>
                  <div style="margin-bottom: 10px;">
                    <firebot-input input-title="Label:" model="item.label" placeholder="Enter a name for the wheel item."></firebot-input>
                  </div>
                    <firebot-input input-title="Weight:" model=""item.weight" placeholder="Weight % for item."></firebot-input>
                </div>
              </div>
              <div class="ml-4">
                <span class="clickable" style="color: #fb7373;" ng-click="removeItemAtIndex($index);$event.stopPropagation();" aria-label="Remove item">
                  <i class="fad fa-trash-alt" aria-hidden="true"></i>
                </span>
              </div>
            </div>
            <p class="muted" ng-show="effect.CkyEvent.props.items.length < 1">No items added.</p>
            <div class="mx-0 mt-2.5 mb-4">
              <button class="filter-bar" ng-click="addSpinWheelItem()" uib-tooltip="Add item" tooltip-append-to-body="true" aria-label="Add item">
                <i class="far fa-plus"></i>
              </button>
            </div>
          </div>

          <collapsable-panel header="Colors" style="padding: 15px 0px 10px 0px;">
          <div class="input-group" style="width: 100%;padding: 15px 0px 10px 0px;">
            <b>Item Label Colors</b>
            <div ng-repeat="color in effect.CkyEvent.props.itemLabelColors track by $index" class="list-item">
              <div class="item ml-8" style="font-weight: 400;width: 100%;margin-bottom: 10px;">
                <div>
                  <div style="margin-bottom: 10px;">
                    <b>Item Label Color</b>
                    <color-picker-input model="effect.CkyEvent.props.itemLabelColors[$index]" label="Label Color"></color-picker-input>
                  </div>
                </div>
              </div>
              <div class="ml-4">
                <span class="clickable" style="color: #fb7373;" ng-click="removeItemLabelColorsAtIndex($index);$event.stopPropagation();" aria-label="Remove item">
                  <i class="fad fa-trash-alt" aria-hidden="true"></i>
                </span>
              </div>
            </div>
            <p class="muted" ng-show="effect.CkyEvent.props.itemLabelColors.length < 1">No Item Label Colors added.</p>
            <div class="mx-0 mt-2.5 mb-4">
              <button class="filter-bar" ng-click="addSpinWheelItemLabelColor()" uib-tooltip="Add Item Label Colors" tooltip-append-to-body="true" aria-label="Add Item Label Colors">
                <i class="far fa-plus"></i>
              </button>
            </div>
          </div>

          <div class="itemBackgroundColors">
            <div class="input-group" style="width: 100%;padding: 15px 0px 10px 0px;">
              <b>Item Background Colors</b>
              <div ng-repeat="color in effect.CkyEvent.props.itemBackgroundColors track by $index" class="list-item">
                <div class="item ml-8" style="font-weight: 400;width: 100%;margin-bottom: 10px;">
                  <div>
                    <div style="margin-bottom: 10px;">
                      <b>Item Background Color</b>
                      <color-picker-input model="effect.CkyEvent.props.itemBackgroundColors[$index]" label="Embed Color"></color-picker-input>
                    </div>
                  </div>
                </div>
                <div class="ml-4">
                  <span class="clickable" style="color: #fb7373;" ng-click="removeItemBackgroundColorsAtIndex($index);$event.stopPropagation();" aria-label="Remove item">
                    <i class="fad fa-trash-alt" aria-hidden="true"></i>
                  </span>
                </div>
              </div>
              <p class="muted" ng-show="effect.CkyEvent.props.items.length < 1">No items added.</p>
              <div class="mx-0 mt-2.5 mb-4">
                <button class="filter-bar" ng-click="addSpinWheelItemBackgroundColor()" uib-tooltip="Add item" tooltip-append-to-body="true" aria-label="Add item">
                  <i class="far fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </collapsable-panel>
        </setting-container>

        <eos-container header="Advanced Settings" class="setting-padtop">
          <label class="control-fb control--checkbox">Show Advanced Settings
            <input type="checkbox" ng-model="effect.isAdvancedSettings">
            <div class="control__indicator"></div>
          </label>
          <div ng-show="effect.isAdvancedSettings" class="ml-6 mb-10">
            <div class="input-group" style="margin-bottom: 10px;">
              <span class="input-group-addon">Width (in pixels)</span>
              <input class="form-control" type="number" min="1" max="10000" ng-model="effect.width">
              <span class="input-group-addon">Height (in pixels)</span>
              <input class="form-control" type="number" min="1" max="10000" ng-model="effect.height">
            </div>

            <p>This defines the size of the (invisible) box that the above timer will be placed in.</p>

            <label class="control-fb control--checkbox"> Show Debug Border <tooltip text="'Show a red border around the timer to make it easier to see its position.'"></tooltip>
              <input type="checkbox" ng-model="effect.debugBorder" />
              <div class="control__indicator"></div>
            </label>



            <p>Align</p>
            <label class="control-fb control--radio">Top
              <input type="radio" ng-model="effect.align" value="flex-start" />
              <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">Center
              <input type="radio" ng-model="effect.align" value="center" />
              <div class="control__indicator"></div>
            </label>
            <label class="control-fb control--radio">Bottom
              <input type="radio" ng-model="effect.align" value="flex-end" />
              <div class="control__indicator"></div>
            </label>
          </div>
        </eos-container>

        <eos-container header="Overlay positioning" class="setting-padtop">
          <label class="control-fb control--checkbox">Show Overlay Settings
            <input type="checkbox" ng-model="effect.isOverlaySettings">
            <div class="control__indicator"></div>
          </label>
        </eos-container>
        <div ng-show="effect.isOverlaySettings">

          <eos-overlay-position effect="effect" class="setting-padtop"></eos-overlay-position>

          <eos-enter-exit-animations effect="effect" class="setting-padtop"></eos-enter-exit-animations>

          <eos-overlay-instance effect="effect" class="setting-padtop"></eos-overlay-instance>
        </div>

        <div class="effect-info alert alert-warning">
                This effect requires the Firebot overlay to be loaded in your broadcasting software. <a href ng-click="showOverlayInfoModal(effect.overlayInstance)" style="text-decoration:underline">Learn more</a>
         </div>

            `,
        optionsController: ($scope: any, backendCommunicator: any, utilityService: any, $q: any) => {
            $scope.optionSettings = {
                noDuplicates: true,
                maxItems: 5,
                trigger: $scope.trigger,
                triggerMeta: $scope.triggerMeta
            };

            if ($scope.effect.CkyEvent == null) {
                $scope.effect.CkyEvent = {};
                $scope.effect.CkyEvent.props = {};
                $scope.effect.CkyEvent.props.items = [];
                $scope.effect.CkyEvent.props.itemBackgroundColors = ["#fbf8c4", "#e4f1aa", "#c0d26e", "#ff7d7d"];
                $scope.effect.CkyEvent.props.itemLabelColors = ["#000"];
                $scope.effect.CkyEvent.props.radius = 0.89;
                $scope.effect.CkyEvent.props.itemLabelFontSizeMax = 500;
                $scope.effect.CkyEvent.props.pointerAngle = 90;
                $scope.effect.CkyEvent.props.pixelRatio = 0;
                $scope.effect.CkyEvent.props.rotation = 0;
                $scope.effect.CkyEvent.props.isInteractive = true;
                $scope.effect.CkyEvent.props.itemLabelBaselineOffset = 0;
                $scope.effect.CkyEvent.props.itemLabelRadius = 0.92;
                $scope.effect.CkyEvent.props.itemLabelRadiusMax = 0.37;
                $scope.effect.CkyEvent.props.itemLabelRotation = 0;
                $scope.effect.CkyEvent.props.itemLabelStrokeColor = '#fff';
                $scope.effect.CkyEvent.props.itemLabelFont = "Rubik";
                $scope.effect.CkyEvent.props.rotationSpeedMax = 700;
                $scope.effect.CkyEvent.props.rotationResistance = -110;
                $scope.effect.CkyEvent.props.borderColor = '#000';
                $scope.effect.CkyEvent.props.lineWidth = 0;
                $scope.effect.CkyEvent.props.overlayImage = "https://cdn.discordapp.com/attachments/959615433848270859/1196854408152088586/wheel-1-overlay.png";
                $scope.effect.CkyEvent.props.borderWidth = 0;
            }

            $scope.showOverlayInfoModal = function (overlayInstance: string) {
                utilityService.showOverlayInfoModal(overlayInstance);
            };
            $scope.removeItemAtIndex = (index: number) => {
                if (index > -1) {
                    $scope.effect.CkyEvent.props.items.splice(index, 1);
                }
            }

            $scope.removeItemBackgroundColorsAtIndex = (index: number) => {
                if (index > -1) {
                    $scope.effect.CkyEvent.props.itemBackgroundColors.splice(index, 1);
                }
            }

            $scope.removeItemLabelColorsAtIndex = (index: number) => {
                if (index > -1) {
                    $scope.effect.CkyEvent.props.itemLabelColors.splice(index, 1);
                }
            }

            $scope.addSpinWheelItem = () => {
                $scope.effect.CkyEvent.props.items.push(
                    {
                        label: "",
                        weight: 1
                    }
                )
                console.log($scope.effect.CkyEvent.props.items)
            }

            $scope.addSpinWheelItemLabelColor = () => {
                $scope.effect.CkyEvent.props.itemLabelColors.push("#000")
                console.log($scope.effect.CkyEvent.props.itemLabelColors)
            }

            $scope.addSpinWheelItemBackgroundColor = () => {
                $scope.effect.CkyEvent.props.itemBackgroundColors.push("#fff")
                console.log($scope.effect.CkyEvent.props.itemBackgroundColors)
            }
            //$scope.addSpinWheelItem();
        },

        optionsValidator: (effect) => {

            let errors = [];
            if (effect.displayDuration == null) {
                errors.push("Please enter a value for the timer");
            }
            return errors;
        },
        onTriggerEvent: async (event) => {

            // return new Promise((resolve) => {

            //     const effect = event.effect;
            //     logger.debug("effect: ", effect);
            //     logger.debug("endTrigger: ", effect.endTriggerCallUrl);
            //     const timeStamp = Date.now();
            //     const removal = `timer_${timeStamp}`;

            //     const styleHTML = html;

            //     const jsHTML = `

            //     `;

            //     const contentsHTML = `

            //     `

            //     let duration = +effect.timerDuration + +2;
            //     logger.debug('Duration: ', duration); // TODO: Remove before publishing
            //     let timerTitle = effect.timerTitle;
            //     logger.debug("removal1: ", removal);
            //     let combineHTML = styleHTML + contentsHTML + jsHTML;

            //     const timerHTML = `<div id="${removal}">${combineHTML}</div>`;
            //     logger.debug("removal2: ", removal);

            //     //data transfer object
            //     let dto = {
            //         length: duration,
            //         inbetweenAnimation: effect.inbetweenAnimation,
            //         inbetweenDelay: effect.inbetweenDelay,
            //         inbetweenDuration: effect.inbetweenDuration,
            //         inbetweenRepeat: effect.inbetweenRepeat,
            //         enterAnimation: effect.enterAnimation,
            //         enterDuration: effect.enterDuration,
            //         exitAnimation: effect.exitAnimation,
            //         exitDuration: effect.exitDuration,
            //         customCoords: effect.customCoords,
            //         position: effect.position,
            //         duration: effect.duration,
            //         height: effect.height,
            //         width: effect.width,
            //         justify: effect.justify,
            //         align: effect.align,
            //         debugBorder: effect.debugBorder,
            //         dropShadow: effect.dropShadow,
            //         overlayInstance: effect.overlayInstance,
            //         html: timerHTML
            //     };

            //     // Ensure defaults
            //     if (dto.duration <= 0) {
            //         logger.debug("Effect duration is less than 0, resetting duration to 5 sec");
            //         dto.duration = 5;
            //     }

            //     if (dto.height == null || dto.height < 1) {
            //         logger.debug("Setting default height");
            //         dto.height = 200;
            //     }

            //     if (dto.width == null || dto.width < 1) {
            //         logger.debug("Setting default width");
            //         dto.width = 400;
            //     }

            //     if (dto.position === "" || dto.position == null) {
            //         logger.debug("Setting default overlay position");
            //         dto.position = "Middle";
            //     }

            //     if (dto.justify == null) {
            //         dto.justify = "center";
            //     }

            //     if (dto.align == null) {
            //         dto.align = "center";
            //     }

            //     logger.info("Settings from overlayTimerEffect: ");
            //     logger.debug("dto: ", dto);
            //     runRequest.modules.httpServer.sendToOverlay("html", dto);
            //     //webServer.sendToOverlay("html", dto);
            //     return true;

            // });
            const AlignText = Object.freeze({
                left: "left",
                right: "right",
                center: "center"
            });
            const data: EventData = {
                overlayInstance: event.effect.overlayInstance,
                uuid: randomUUID(),
                displayDuration: 30,
                props: event.effect.CkyEvent.props
                // {
                //     name: "Takeaway",
                //     radius: 0.89,
                //     itemLabelFontSizeMax: 500,
                //     pointerAngle: 90,
                //     pixelRatio: 0,
                //     rotation: 0,
                //     isInteractive: true,
                //     itemLabelBaselineOffset: 0,
                //     itemLabelRadius: 0.92,
                //     itemLabelRadiusMax: 0.37,
                //     itemLabelRotation: 0,
                //     itemLabelAlign: AlignText.right,
                //     itemLabelColors: ["#000"],
                //     itemLabelStrokeColor: '#fff',
                //     itemLabelFont: "Rubik",
                //     itemBackgroundColors: ["#fbf8c4", "#e4f1aa", "#c0d26e", "#ff7d7d"],
                //     rotationSpeedMax: 700,
                //     rotationResistance: -110,
                //     borderColor: '#000',
                //     lineWidth: 0,
                //     overlayImage: "https://cdn.discordapp.com/attachments/959615433848270859/1196854408152088586/wheel-1-overlay.png",
                //     borderWidth: 0,
                //     debug: false, // So we can see pointer angle.
                //     items: [
                //         {
                //             label: "Dog",
                //             weight: 6
                //         },
                //         {
                //             label: "Cat",
                //             weight: 4.9
                //         },
                //         {
                //             label: "Fish",
                //             weight: 4.1
                //         },
                //         {
                //             label: "Rabbit",
                //             weight: 3.7
                //         },
                //         {
                //             label: "Bird",
                //             weight: 3
                //         },
                //         {
                //             label: "Chicken",
                //             weight: 2.8
                //         },
                //         {
                //             label: "Lizard",
                //             weight: 2.5
                //         },
                //         {
                //             label: "Turtle",
                //             weight: 1
                //         }
                //     ]
                // }
            };

            const waitPromise = new Promise<string>((resolve) => {
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
                    winningSlice
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
                onOverlayEvent: (event: CkyEvent) => {
                    // Frontend Code Here
                    //const html = require('./spinhtml.html');


                    const html = /*html*/`<div id={{WHEELSPINDIVID}}>
                                    <div class="spin-wheel">
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
                                </div>`;

                    function loadHtmlAndExecute() {
                        const { uuid, displayDuration, props } = event;

                        $("#wrapper").append(html.replace("{{WHEELSPINDIVID}}", uuid));
                        const container = document.getElementById(uuid).getElementsByClassName("wheel-wrapper")[0];
                        // @ts-ignore
                        window.wheel = new spinWheel.Wheel(container, props);

                        function fetchWinningItemIndexFromApi() {
                            return getRandomInt(0, props.items.length);
                        }
                        function getRandomInt(min: number, max: number) {
                            min = Math.ceil(min);
                            max = Math.floor(max);
                            return Math.floor(Math.random() * (max - min) + min);
                        }
                        // @ts-ignore
                        wheel.pointerAngle = 90;
                        const winningItemIndex = fetchWinningItemIndexFromApi();
                        const duration = 2600;
                        const revolutions = 200;
                        // @ts-ignore
                        wheel.spinToItem(winningItemIndex, duration, true, revolutions, 1);
                        // @ts-ignore
                        wheel.onRest = (e) => {
                            // @ts-ignore
                            sendWebsocketEvent(uuid, { "result": `"${props.items[e.currentIndex].label}"` });
                            console.log(e);
                            console.log(props.items[e.currentIndex].label);

                            setTimeout(() => $(`#${uuid}`).remove(), displayDuration * 1000);
                        };
                    }

                    const script_elem = document.getElementById("cky-spin-wheel-iife");

                    if (script_elem == null) {
                        const spin_wheel = document.createElement('script');

                        spin_wheel.src = 'https://cdn.jsdelivr.net/npm/spin-wheel@4.3.1/dist/spin-wheel-iife.js';

                        spin_wheel.async = false;

                        spin_wheel.id = "cky-spin-wheel-iife";

                        spin_wheel.onload = function () {
                            loadHtmlAndExecute();
                        }

                        document.head.appendChild(spin_wheel);
                    } else {
                        loadHtmlAndExecute();
                    }
                }
            }
        }
    };
    return overlaySpinWheelEffectType;
}