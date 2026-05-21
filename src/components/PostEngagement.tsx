import React from 'react';
import Giscus from '@giscus/react';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Translate from '@docusaurus/Translate';

type PostEngagementProps = {
  postId?: string;
  postTitle?: string;
  enableComments?: boolean;
};

type GiscusConfig = {
  repo?: string;
  repoId?: string;
  category?: string;
  categoryId?: string;
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  strict?: '0' | '1';
  reactionsEnabled?: '0' | '1';
  emitMetadata?: '0' | '1';
  inputPosition?: 'top' | 'bottom';
  lang?: string;
  loading?: 'lazy' | 'eager';
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function useGiscusLang(defaultLang: string | undefined): string {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  if (currentLocale === 'zh-Hans') {
    return 'zh-CN';
  }
  return defaultLang ?? 'en';
}

export default function PostEngagement({
  postId,
  postTitle,
  enableComments = true,
}: PostEngagementProps): JSX.Element {
  const {colorMode} = useColorMode();
  const themeConfig = useThemeConfig() as {giscus?: GiscusConfig};
  const giscus = themeConfig.giscus;
  const giscusLang = useGiscusLang(giscus?.lang);
  const hasRequiredGiscusConfig =
    Boolean(giscus?.repo) &&
    Boolean(giscus?.repoId) &&
    Boolean(giscus?.category) &&
    Boolean(giscus?.categoryId);

  const onOpenFeedback = (): void => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'post_feedback_entry', {
        feedback_type: 'reactions_or_comment',
        post_id: postId ?? window.location.pathname,
        post_title: postTitle ?? document.title,
        page_path: window.location.pathname,
      });
    }

    const commentsEl = document.getElementById('post-comments');
    if (commentsEl) {
      commentsEl.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  return (
    <section className="postEngagement">
      <div className="postEngagementHeader">
        <h3>
          <Translate id="postEngagement.title">What Do You Think ? 😊</Translate>
        </h3>
        <p>
          <Translate id="postEngagement.subtitle">
            Welcome to share your thoughts and join the discussion.
          </Translate>
        </p>
      </div>

      <div className="postEngagementActions">
        <button type="button" className="postLikeButton" onClick={onOpenFeedback}>
          <Translate id="postEngagement.cta">
            Navigate to the discussion ➡️
          </Translate>
        </button>
      </div>

      {enableComments ? (
        hasRequiredGiscusConfig ? (
          <div className="postComments" id="post-comments">
            <h4>
              <Translate id="postEngagement.comments">Comments</Translate>
            </h4>
            <Giscus
              repo={giscus!.repo! as `${string}/${string}`}
              repoId={giscus!.repoId!}
              category={giscus!.category!}
              categoryId={giscus!.categoryId!}
              mapping={giscus?.mapping ?? 'pathname'}
              strict={giscus?.strict ?? '0'}
              reactionsEnabled={giscus?.reactionsEnabled ?? '1'}
              emitMetadata={giscus?.emitMetadata ?? '0'}
              inputPosition={giscus?.inputPosition ?? 'top'}
              theme={colorMode === 'dark' ? 'dark' : 'light'}
              lang={giscusLang}
              loading={giscus?.loading ?? 'lazy'}
              term={postId}
            />
          </div>
        ) : (
          <p className="postCommentHint">
            <Translate id="postEngagement.giscusHint">
              Comments are enabled, but Giscus is not fully configured yet. Please
              set repoId and categoryId in docusaurus.config.js.
            </Translate>
          </p>
        )
      ) : null}
    </section>
  );
}
