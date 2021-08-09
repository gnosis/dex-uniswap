import React from 'react'

import { PRODUCTION_URL } from 'constants/index'
import { AlertTriangle } from 'react-feather'
import URLWarningUni, { StyledClose } from './URLWarningMod'
import ReactMarkdown from 'react-markdown'
import { useAnnouncementVisible, useCloseAnnouncement } from '@src/custom/state/userMod/hooks'
import { hashCode } from 'utils/misc'
import useFetchFile from 'hooks/useFetchFile'

export * from './URLWarningMod'

// Announcement content: Modify this file to edit the announcement
//  https://github.com/gnosis/cowswap/blob/announcements/docs/announcements.md
const ANNOUNCEMENTS_MARKDOWN_URL =
  'https://raw.githubusercontent.com/gnosis/cowswap/announcements/docs/announcements.md'

export default function URLWarning() {
  // Ger announcement if there's one
  const { file, error } = useFetchFile(ANNOUNCEMENTS_MARKDOWN_URL)
  const announcementText = error ? undefined : file?.trim()
  const contentHash = announcementText ? hashCode(announcementText).toString() : undefined

  if (error) {
    console.error('[URLWarning] Error getting the announcement text: ', error)
  } else {
    console.debug('[URLWarning] Announcement text', announcementText, contentHash)
  }

  const announcementVisible = useAnnouncementVisible(contentHash)
  const closeAnnouncement = useCloseAnnouncement()
  const announcement = announcementVisible && announcementText && (
    <>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> <ReactMarkdown>{announcementText}</ReactMarkdown>
      </div>
      <StyledClose size={12} onClick={() => closeAnnouncement(contentHash)} />
    </>
  )

  return <URLWarningUni url={PRODUCTION_URL} announcement={announcement} />
}
