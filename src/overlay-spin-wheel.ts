import { Firebot, RunRequest, ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { v4 } from "uuid";
import { resolve } from "path";

import { logger } from "./logger";
import { webServer } from "./main";

import { randomUUID } from "crypto";
import { EventData, CkyEvent, EV } from "./types";

const wait = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

interface EffectModel {
    timerTitle: String;
    timerDuration: number;
    endTriggerCallUrl: String;
    timerIncludeName: Boolean;
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
    justify: String;
    align: String;
    debugBorder: Boolean;
    dropShadow: Boolean;
    overlayInstance: String;
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
            <eos-container header="Timer Name">
                <firebot-input input-title="Title" model="effect.timerTitle" placeholder="Enter a name for the timer."></firebot-input>
                <label class="control-fb control--checkbox" style="margin-top:15px"> Show Timer name
                        <input type="checkbox" ng-model="effect.timerIncludeName">
                        <div class="control__indicator"></div>
                </label>        
                <firebot-editableObjectList input-title="Title" model="effect.timerTitle" placeholder="Enter a name for the timer."></firebot-input>
                <firebot-input input-title="Duration" model="effect.timerDuration" placeholder="Enter time in seconds."></firebot-input>

                <firebot-input input-title="Timer Ended" model="effect.endTriggerCallUrl" placeholder="Time Up Trigger."></firebot-input>
                <div class="volume-slider-wrapper">
                <i class="fal fa-volume-down volume-low"></i>
                <rzslider rz-slider-model="effect.volume" rz-slider-options="{floor: 1, ceil: 10, hideLimitLabels: true, showSelectionBar: true}"></rzslider>
                <i class="fal fa-volume-up volume-high"></i>
            </div>
            </eos-container>
            <eos-container header="Choices" pad-top="true">
                 <firebot-editable-list settings="optionSettings" model="effect.choices" />
            </eos-container>
            <eos-container header="Choices" pad-top="true">
                 <firebot-editableObjectList settings="optionSettings" model="effect.choices" />
            </eos-container>
            <eos-container header="Advanced Settings" class="setting-padtop">
                <label class="control-fb control--checkbox">Show Advanced Settings
                    <input type="checkbox" ng-model="effect.isAdvancedSettings" >
                    <div class="control__indicator"></div>
                </label>
                <div ng-show="effect.isAdvancedSettings" class="ml-6 mb-10">
                    <div class="input-group" style="margin-bottom: 10px;">
                        <span class="input-group-addon">Width (in pixels)</span>
                        <input
                            class="form-control"
                            type="number"
                            min="1" max="10000"
                            ng-model="effect.width">
                        <span class="input-group-addon">Height (in pixels)</span>
                        <input
                            class="form-control"
                            type="number"
                            min="1" max="10000"
                            ng-model="effect.height">
                    </div>
  
                    <p>This defines the size of the (invisible) box that the above timer will be placed in.</p>

                    <label class="control-fb control--checkbox"> Show Debug Border <tooltip text="'Show a red border around the timer to make it easier to see its position.'"></tooltip>
                        <input type="checkbox" ng-model="effect.debugBorder" />
                        <div class="control__indicator"></div>
                    </label>

                    <p>Justification</p>
                    <label class="control-fb control--radio">Left
                        <input type="radio" ng-model="effect.justify" value="flex-start"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio" >Center
                        <input type="radio" ng-model="effect.justify" value="center"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio" >Right
                        <input type="radio" ng-model="effect.justify" value="flex-end"/>
                        <div class="control__indicator"></div>
                    </label>

                    <p>Align</p>
                    <label class="control-fb control--radio">Top
                        <input type="radio" ng-model="effect.align" value="flex-start"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio" >Center
                        <input type="radio" ng-model="effect.align" value="center"/>
                        <div class="control__indicator"></div>
                    </label>
                    <label class="control-fb control--radio" >Bottom
                        <input type="radio" ng-model="effect.align" value="flex-end"/>
                        <div class="control__indicator"></div>
                    </label>
                </div>
            </eos-container>

            <eos-container header="Overlay positioning" class="setting-padtop">
                <label class="control-fb control--checkbox">Show Overlay Settings
                    <input type="checkbox" ng-model="effect.isOverlaySettings" >
                    <div class="control__indicator"></div>
                </label>
            </eos-container>
            <div ng-show="effect.isOverlaySettings">

                <eos-overlay-position effect="effect" class="setting-padtop"></eos-overlay-position>

                <eos-enter-exit-animations effect="effect" class="setting-padtop"></eos-enter-exit-animations>

                <eos-overlay-instance effect="effect" class="setting-padtop"></eos-overlay-instance>
            </div>

            <div class="effect-info alert alert-warning">
                This effect requires the Firebot overlay to be loaded in your broadcasting software.
            </div>
            `,
        optionsController: ($scope) => {
        },
        optionsValidator: (effect) => {
            let errors = [];
            if (effect.timerTitle == null || effect.timerTitle.length < 1) {
                errors.push("Please enter name for the timer");
            }
            if (effect.timerDuration == null) {
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
            const baseCanvasSize = 500;
            const data: EventData = {
                overlayInstance: event.effect.overlayInstance,
                uuid: randomUUID(),
                displayDuration: 30,
                props: {
                    name: "Takeaway",
                    radius: 0.89,
                    itemLabelFontSizeMax: baseCanvasSize,
                    pointerAngle: 90,
                    pixelRatio: 0,
                    rotation: 0,
                    isInteractive: true,
                    itemLabelBaselineOffset: 0,
                    itemLabelRadius: 0.92,
                    itemLabelRadiusMax: 0.37,
                    itemLabelRotation: 0,
                    itemLabelAlign: AlignText.right,
                    itemLabelColors: ["#000"],
                    itemLabelStrokeColor: '#fff',
                    itemLabelFont: "Rubik",
                    itemBackgroundColors: ["#fbf8c4", "#e4f1aa", "#c0d26e", "#ff7d7d"],
                    rotationSpeedMax: 700,
                    offset: { w: 0, h: 0 },
                    rotationResistance: -110,
                    borderColor: '#000',
                    lineWidth: 0,
                    overlayImage:
                        "https://cdn.discordapp.com/attachments/959615433848270859/1196854408152088586/wheel-1-overlay.png",
                    borderWidth: 0,
                    debug: false, // So we can see pointer angle.
                    items: [
                        {
                            label: "Dog",
                            weight: 6
                        },
                        {
                            label: "Cat",
                            weight: 4.9
                        },
                        {
                            label: "Fish",
                            weight: 4.1
                        },
                        {
                            label: "Rabbit",
                            weight: 3.7
                        },
                        {
                            label: "Bird",
                            weight: 3
                        },
                        {
                            label: "Chicken",
                            weight: 2.8
                        },
                        {
                            label: "Lizard",
                            weight: 2.5
                        },
                        {
                            label: "Turtle",
                            weight: 1
                        }
                    ]
                }
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