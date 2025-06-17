import * as dat from "dat.gui";

export class DatGuiManager {
  private static gui: dat.GUI;

  private constructor() {}

  public static initialize(): void {
    if (!DatGuiManager.gui) {
      DatGuiManager.gui = new dat.GUI();
    }
  }

  public static get GUI() {
    return DatGuiManager.gui;
  }

  public static add(target: any, property: string, name: string): void {
    if (!DatGuiManager.gui) {
      console.error(
        "DatGuiManager has not been initialized. Call DatGuiManager.initialize() first."
      );
      return;
    }
    DatGuiManager.gui.add(target, property).name(name);
  }

  public static addFolder(property: string): dat.GUI | undefined {
    if (!DatGuiManager.gui) {
      console.error(
        "DatGuiManager has not been initialized. Call DatGuiManager.initialize() first."
      );
      return;
    }
    return DatGuiManager.GUI.addFolder(property);
  }
} 