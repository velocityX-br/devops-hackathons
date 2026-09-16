import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type FeatureItem = {
  title: JSX.Element;
  description: JSX.Element;
  to: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: (
      <Translate id="homepage.feature.about.title">About</Translate>
    ),
    to: '/docs/intro',
    description: (
      <Translate id="homepage.feature.about.description">
        Solution architecture, cloud-native ops, and hands-on AI engineering —
        MCP servers, RAG, skills, and agent orchestration.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.feature.notes.title">Technical notes</Translate>
    ),
    to: '/docs/Solution_Architect/DNS/2026_DNS_Design',
    description: (
      <Translate id="homepage.feature.notes.description">
        Production-oriented runbooks and designs — BIND on K8s, hybrid
        infrastructure, operators, and platform troubleshooting.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="homepage.feature.blog.title">Blog</Translate>
    ),
    to: '/blog',
    description: (
      <Translate id="homepage.feature.blog.description">
        Longer write-ups on operators, multi-cluster GitOps, networking
        edge cases, and applied AI (MCP, agents, delivery workflows).
      </Translate>
    ),
  },
];

function Feature({title, description, to}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('text--center padding-horiz--md', styles.featureCard)}>
        <h3>
          <Link to={to}>{title}</Link>
        </h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
