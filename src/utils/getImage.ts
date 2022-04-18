import { Theme } from "@/types";
import { useAppStore } from "@/store/app";

const themeNeutralImages = ["google-icon", "green-tick", "twitter-icon"];

let appStore;

export function getImage(imageName: string, theme: Theme): string {
  if (!appStore) {
    appStore = useAppStore();
  }
  if (themeNeutralImages.includes(imageName)) {
    return require(`@/assets/images/${imageName}.png`)
  } else {
    return require(`@/assets/images/${imageName}-${appStore.theme}-mode.png`)
  }
}
