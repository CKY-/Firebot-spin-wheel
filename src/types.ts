
interface Props {
    name: string;
    radius: number;
    rotation: number;
    isInteractive: boolean;
    pixelRatio: number;
    itemLabelFontSizeMax: number;
    pointerAngle: number;
    itemLabelRadius: number;
    itemLabelRadiusMax: number;
    itemLabelRotation: number;
    itemLabelAlign: any;
    itemLabelStrokeColor: string;
    itemLabelColors: string[];
    itemLabelBaselineOffset: number;
    itemLabelFont: string;
    itemBackgroundColors: string[];
    rotationSpeedMax: number;
    rotationResistance: number;
    lineWidth: number;
    overlayImage: string;
    borderWidth: number;
    items: PropsItem[]
    offset:  Offset;
    borderColor: string;

}

export interface Offset {
    w: number;
    h: number
}

export interface PropsItem {
    label: string;
    weight: number;
}

export interface EventData {
    overlayInstance: String;
    uuid: string;
    displayDuration: number
    props: Props;
}