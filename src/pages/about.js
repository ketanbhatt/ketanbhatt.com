import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"


const AboutPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="About" />
      <h1>About me</h1>

      <p>Typical millennial in tech. Got a lot too soon without struggling a lot (call it luck), and now “Am I doing enough? What should I do?” is a constant confusion.</p>
      <p>Frequently thinks about losing weight and starting to live a healthy life and then orders Butter Chicken with Coke.</p>
      <p>Figuring out what’s next, just in time.</p>
    </Layout>
  )
}

export default AboutPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
