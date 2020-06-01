import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"

import Footer from "../components/footer"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`

  let header

  let subMenu = (
    <h4
      style={{
        marginTop: rhythm(1 / 2)
      }}
    >
      {(location.pathname !== rootPath) && (<span><Link to={`/`}>Home</Link>{' '}&bull;{' '}</span>)}
      <Link to={`/about`}>About</Link>
      {' '}&bull;{' '}<Link to={`/archive`}>Archive</Link>
      {' '}&bull;{' '}<Link to={`/notes`}>Notes</Link>
    </h4>
  )

  if (location.pathname === rootPath) {
    header = (
      <div
        style={{
          borderBottom: `1px solid hsla(0,0%,0%,0.07)`
        }}
      >
        <h1
          style={{
            ...scale(1.5),
            marginBottom: 0,
            marginTop: 0,
            borderBottom: 0
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>

        {subMenu}
      </div>
    )
  } else {
    header = (
      <div>
        <h3
          style={{
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>

        {subMenu}
      </div>
    )
  }

  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(30),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header>{header}</header>
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
