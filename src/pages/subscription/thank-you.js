import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"
import { rhythm } from "../../utils/typography"


const ThankYouPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const relatedPosts = data.allMarkdownRemark.edges

  const relatedPostsHtml = (
    <div>
      <h4>Or, start reading something right now!</h4>
      <ul style={{paddingLeft: rhythm(1), marginLeft: 0}}>
        {relatedPosts.map(({ node }) => {
          return (<li style={{marginBottom: rhythm(1/5)}}><Link to={node.fields.slug}>{node.frontmatter.title}</Link></li>)
        })}
      </ul>
      <hr/>
    </div>
  )

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Subscription confirmed!" />
      <h1>Thank You!</h1>
      <p>You're officially confirmed and on the list.</p>
      <p>Expect some great emails headed your way very soon.</p>
      {relatedPostsHtml}
    </Layout>
  )
}

export default ThankYouPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
        filter: {frontmatter: {draft: {ne: true}}},
        sort: {fields: frontmatter___date, order: DESC},
        limit: 5,
    ){
      edges {
        node {
          frontmatter {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
