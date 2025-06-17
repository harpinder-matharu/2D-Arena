import { Howl } from 'howler';

export default class Sounds {
    static soundBG;
    static bgMusciIsPlay: boolean;
    static isInit: boolean;

    static init() {
        Sounds.soundBG = new Howl({
            src: ['music/BGM.mp3'],
            loop: true,
            volume: 0.2
        });
        this.isInit = true;
    }

    static playBgMusic(): void {
        if (!Sounds.bgMusciIsPlay && this.isInit) {
            Sounds.bgMusciIsPlay = true;
            Sounds.soundBG.play();
        }
    }

    static stopBgMusic(): void {
        if (Sounds.bgMusciIsPlay && this.isInit) {
            Sounds.bgMusciIsPlay = false;
            Sounds.soundBG.stop();
        }
    }
}