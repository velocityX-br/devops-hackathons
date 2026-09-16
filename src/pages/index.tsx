import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <p className={styles.eyebrow}>
          <Translate id="homepage.eyebrow">Personal knowledge base</Translate>
        </p>
        <h1 className="hero__title">Bryan Chen</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            <Translate id="homepage.cta.about">
              About me
            </Translate>
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/blog">
            <Translate id="homepage.cta.blog">
              Read the blog
            </Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Home"
      description="Bryan Chen — solution architect & DevOps engineer. Kubernetes, hybrid infrastructure, plus MCP, RAG, agent skills, and orchestration.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
