import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Version from '../Version'
import { BookOpen, Search, Book, AlertTriangle } from 'react-feather'
export const FOOTER_URLS = [
  { name: '© 2021 Gnosis' },
  {
    name: 'About',
    url: '/about',
    Icon: BookOpen
  },
  { name: 'Cookies', url: '/cookie-policy', Icon: Search },
  { name: 'Privacy', url: '/privacy-policy', Icon: AlertTriangle },
  { name: 'Terms', url: '/terms-and-conditions', Icon: Book }
]

const FooterVersion = styled(Version)`
  margin-right: auto;
  min-width: max-content;
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-evenly;
  margin: auto 6rem 0 2rem;

  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const UrlWrapper = styled(Wrapper)`
  align-self: flex-end;
  margin: 0 0 1rem 0;

  > * {
    color: black;
    font-size: small;
    text-align: center;
    white-space: nowrap;
    margin: 0 0.5rem;
    width: 20%;

    &:not(:last-child) {
      border-right: 1px solid #00000040;

      ${({ theme }) => theme.mediaWidth.upToLarge`
        border: none;
      `}
    }
  }
`

export default function Footer() {
  return (
    <Wrapper>
      <FooterVersion />
      <UrlWrapper>
        {FOOTER_URLS.map(({ name, url }, i) => {
          const key = url || name + '_' + i
          return url ? (
            <Link key={key} to={url}>
              {name}
            </Link>
          ) : (
            <span key={key}>{name}</span>
          )
        })}
      </UrlWrapper>
    </Wrapper>
  )
}
