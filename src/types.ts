
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
    itemLabelAlign: string;
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
    borderColor: string;
    debug: boolean;
    lineColor: string;
}

export interface PropsItem {
    label: string;
    weight: number;
}

export interface EventData {
    
    imageType: string;
    imageUrl: string;
    imageFile: string;
    imageFolder: string;
    resourceToken: string | number | boolean;
    overlayInstance: String;
    uuid: string;
    displayDuration: number
    props: Props;
}

export interface EV {
    name: string;
    data: {
        result: string;
    }
}