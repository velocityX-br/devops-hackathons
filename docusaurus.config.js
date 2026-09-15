// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const {themes} = require('prism-react-renderer');

const organizationName = "velocityX-br";
const projectName = "devops-hackathons";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Bryan Chen — DevOps Hackathons",
  tagline: "Linux · Kubernetes · DNS · Hybrid Cloud Infrastructure",
  url: `https://${organizationName}.github.io`,
  baseUrl: `/${projectName}/`,
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  favicon: "img/favicon.ico",
  // GitHub Pages adds a trailing slash by default that I don't want
  trailingSlash: false,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName, // Usually your GitHub org/user name.
  projectName, // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh-Hans"],
    localeConfigs: {
      en: {
        label: "English",
        direction: "ltr",
      },
      "zh-Hans": {
        label: "简体中文",
        direction: "ltr",
      },
    },
  },

  plugins: [
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-XSB0TXWK4Y', // 用你的 GA4 ID 替换
        anonymizeIP: true,
      },
    ],
    [
      'drawio',
      {},
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        blog: {
          showReadingTime: true,
          // Show all posts in the blog sidebar ("Recent posts" / 最新文章).
          blogSidebarCount: "ALL",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Bryan Chen",
        logo: {
          alt: "Bryan Chen",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "About",
          },
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Notes",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/velocityX-br",
            label: "GitHub",
            position: "right",
          },
          {
            type: "localeDropdown",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Me",
            items: [
              {
                label: "About",
                to: "/docs/intro",
              },
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/velocityX-br",
              },
            ],
          },
          {
            title: "Notes",
            items: [
              {
                label: "DNS Architecture",
                to: "/docs/Architecture/DNS/2026_DNS_Design",
              },
              {
                label: "Kubernetes",
                to: "/docs/Kubernetes/kubernetes_cheatsheet",
              },
              {
                label: "Linux",
                to: "/docs/Linux/unix_cheatsheet",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "This repo",
                href: `https://github.com/${organizationName}/${projectName}`,
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Bryan Chen. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
      },
      giscus: {
        repo: 'velocityX-br/devops-hackathons',
        repoId: 'R_kgDOOUvUFQ',
        category: 'General',
        categoryId: 'DIC_kwDOOUvUFc4C8CkN',
        mapping: 'pathname',
        strict: '0',
        reactionsEnabled: '1',
        emitMetadata: '0',
        inputPosition: 'bottom',
        lang: 'en',
        loading: 'lazy',
      },
    }),
};

module.exports = config;
