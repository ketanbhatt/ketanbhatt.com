import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"


const NotFoundPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const relatedPosts = data.allMarkdownRemark.edges

  const relatedPostsHtml = (
    <div>
      <h4>But all hope is not lost. Try these maybe...</h4>
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
      <SEO title="404: Not Found" />
      <h1>Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
      {relatedPostsHtml}
    </Layout>
  )
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
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
