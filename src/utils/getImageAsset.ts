export default function getImageAsset(asset: string) {
  return require(`@/assets/images/${asset}`)
}
