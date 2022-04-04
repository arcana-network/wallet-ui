const images = {
  dark: {
    googleIcon: require("@/assets/images/google-icon.png"),
    twitterIcon: require("@/assets/images/twitter-icon.png"),
    githubIcon: require("@/assets/images/github-dark-mode-icon.png"),
    profileIcon: require("@/assets/images/profile-dark-mode-icon.png"),
    copyIcon: require("@/assets/images/copy-dark-mode-icon.png"),
    infoIcon: require("@/assets/images/info-dark-mode-icon.png"),
    arrowIcon: require("@/assets/images/arrow-dark-mode-icon.png"),
  },
  light: {
    googleIcon: require("@/assets/images/google-icon.png"),
    twitterIcon: require("@/assets/images/twitter-icon.png"),
    githubIcon: require("@/assets/images/github-icon.png"),
    profileIcon: require("@/assets/images/profile-icon.png"),
    copyIcon: require("@/assets/images/copy-icon.png"),
    infoIcon: require("@/assets/images/info-icon.png"),
    arrowIcon: require("@/assets/images/arrow-icon.png"),
  },
};

export function getImages(theme) {
  return images[theme];
}
