import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

const NotesPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Notes" />
      <h1>Notes</h1>

      <p>
        Sometimes when I read a book, I note down lessons or takeaways that I found relevant.
        I find that putting my notes up here makes it possible for me to revisit them more than I would if they weren't here.
      </p>

      <ul>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <li>
              <article key={node.fields.slug} style={{paddingBottom: rhythm(0)}}>
                <div>
                  <Link to={node.fields.slug}>
                    {title}
                  </Link>
                </div>

                <small>{node.frontmatter.date}</small>
                {' '}&bull;{' '}
                <small className={`${node.frontmatter.category} category`}>{node.frontmatter.category}</small>
              </article>
            </li>
          )
        })}
      </ul>

    </Layout>
  )
}

export default NotesPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {frontmatter: {draft: {ne: true}, notes: {eq: true} }},
      sort: { fields: [frontmatter___date], order: DESC }
      ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            category
          }
        }
      }
    }
  }
`
