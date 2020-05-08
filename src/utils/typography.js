import Typography from "typography"
import ThemeGithub from "typography-theme-github"

ThemeGithub.overrideThemeStyles = () => {
  return {
    "a.gatsby-resp-image-link": {
      boxShadow: `none`,
    },
  }
}

const typography = new Typography(ThemeGithub)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
