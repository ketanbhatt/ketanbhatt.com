import React from "react"
import { Link, graphql } from "gatsby"
import Disqus from 'gatsby-plugin-disqus'

import Layout from "../components/layout"
import SEO from "../components/seo"
import SubscribeForm from "../components/subscribe"
import { rhythm, scale } from "../utils/typography"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const relatedPosts = data.allMarkdownRemark.edges

  const { title, siteUrl } = data.site.siteMetadata
  const { previous, next } = pageContext

  let disqusConfig = {
    url: `${siteUrl + post.fields.slug}`,
    identifier: post.fields.slug,
    title: post.frontmatter.title,
  }


  const relatedPostsHtml = relatedPosts.length === 0 ? (<p></p>) : (
    <div>
      <h4>More in {post.frontmatter.category}</h4>
      <ul style={{paddingLeft: rhythm(1), marginLeft: 0}}>
        {relatedPosts.map(({ node }) => {
          return (<li style={{marginBottom: rhythm(1/5)}}><Link to={node.fields.slug}>{node.frontmatter.title}</Link></li>)
        })}
      </ul>
      <br/>
      <hr/>
    </div>
  )

  return (
    <Layout location={location} title={title}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article>
        <header>
          <h1
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
            }}
          >
            {post.frontmatter.title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {post.frontmatter.date}
            {' '}&bull;{' '}
            <span className={`${post.frontmatter.category} category`}>{post.frontmatter.category}</span>
          </p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
      </article>

      <SubscribeForm formIdentifier={post.frontmatter.category} />

      <nav>
        {relatedPostsHtml}
        <ul
          style={{
            display: `flex`,
            flexDirection: `row`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
            marginLeft: 0,
          }}
        >
          <li>{previous && (<p>←</p>)}</li>
          <li style={{width: rhythm(13)}}>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li style={{width: rhythm(13), textAlign: `right`}}>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title}
              </Link>
            )}
          </li>
          <li>{next && (<p>→</p>)}</li>
        </ul>
      </nav>
      {(process.env.NODE_ENV !== `development`) && (<Disqus config={disqusConfig} />)}
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!, $category: String!) {
    site {
      siteMetadata {
        title
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 280)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        category
      }
      fields {
        slug
      }
    }
    allMarkdownRemark(
        filter: {frontmatter: {draft: {ne: true}, category: {eq: $category}}, fields: {slug: {ne: $slug}}},
        sort: {fields: frontmatter___date, order: DESC},
        limit: 5
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
