import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head'
import Link from 'next/link'
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { formatDate, formatEstimatedReadTime, formatEditDate } from '../formatFunctions'
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Fragment } from 'react'
import Comments from '../../components/Comments'

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  estimatedReadTime: string;
  uid: string
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string
    }[];
  };
  previousPost: {
    uid: string;
    title: string
  };
  nextPost: {
    uid: string;
    title: string
  }
}

interface PostProps {
  post: Post;
  preview: boolean
}

export default function Post({post, preview}: PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return <div className={styles.loading}>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <img className={styles.bannerImg} src={post.data.banner.url} />
      <main className={styles.container}>
        <article className={styles.post}>
          <h1 className={styles.postTitle}>{post.data.title}</h1>
          <div className={styles.dateAuthorAndReadTime}>
            <time>
              <FiCalendar className={commonStyles.icon}/>
              {post.first_publication_date}
            </time>
            <p className={styles.author}>
              <FiUser className={commonStyles.icon}/>
              {post.data.author}
            </p>
            <p>
              <FiClock className={commonStyles.icon}/>
              {post.estimatedReadTime}
            </p>
          </div>
          <div className={styles.editionPostData}>
            {post.last_publication_date}
          </div>
          <section className={styles.postContent}>
            { post.data.content.map(content => (
              <Fragment key={content.heading}>
                <h2 className={styles.contentTitle}>{content.heading}</h2>
                <div
                  className={styles.contentBody}
                  dangerouslySetInnerHTML={{ __html: content.body }} 
                />
              </ Fragment>
            ))}
          </section>
          <nav className={styles.otherPostsContainer}>
            <div className={styles.previousAndNextPosts}>
              <Link href={post.previousPost.uid}>
                <a>
                  <p className={styles.otherPostTitle}>
                    {post.previousPost.title}
                  </p>
                  <p className={styles.otherPost}>
                    Post anterior
                  </p>
                </a>
              </Link>
              <Link href={post.nextPost.uid}>
                <a>
                  <p className={styles.otherPostTitle}>
                    {post.nextPost.title}
                  </p>
                  <p className={styles.otherPost}>
                    Próximo post
                  </p>
                </a>
              </Link>          
            </div>
          </nav>
          <Comments />
          {preview && (
            <aside className={commonStyles.exitPreview}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </article>
      </main>
    </>
  )
}

// https://stackoverflow.com/questions/67787456/what-is-the-difference-between-fallback-false-vs-true-vs-blocking-of-getstaticpa?noredirect=1
export const getStaticPaths : GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')], {
      pageSize: 2
  });
  
  const preRenderedPaths = posts.results.map(post => ({
      params: { slug: post.uid }
  }))

  return {
    paths: preRenderedPaths,
    fallback: true
  }
};

// preview: https://prismic.io/docs/technologies/previews-nextjs
export const getStaticProps : GetStaticProps = async ({
  preview=false,
  previewData,
  params 
}) => {
  const prismic = getPrismicClient();
  const { slug } = params

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const previousPost = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title'],
    pageSize: 1,
    after: response.id,
    orderings: '[document.first_publication_date desc]',
    ref: previewData?.ref ?? null,
  })

  const nextPost = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title'],
    pageSize: 1,
    after: response.id,
    orderings: '[document.first_publication_date]',
    ref: previewData?.ref ?? null,
  })  

  const content = response.data.content.map(content => ({
    heading: content.heading,
    body: RichText.asHtml(content.body)
  }))

  const post = {
    uid: response.uid,
    first_publication_date: formatDate(response.first_publication_date),
    last_publication_date: formatEditDate(response.last_publication_date),
    estimatedReadTime: formatEstimatedReadTime(content),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content
    },
    previousPost: {
      uid: (previousPost.results.length > 0) ? previousPost.results[0].uid : '/',
      title: (previousPost.results.length > 0) ? previousPost.results[0].data.title : 'Home page'
    },
    nextPost: {
      uid: (nextPost.results.length > 0) ? nextPost.results[0].uid : '/',
      title: (nextPost.results.length > 0) ? nextPost.results[0].data.title : 'Home page'
    }
  }

  return {
    props: {
      post,
      preview
    }
  }
};
