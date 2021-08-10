import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head'
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { formatDate } from '../commonFunctions'
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import postStyles from '../../styles/post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Fragment } from 'react'

interface Post {
  slug: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: string
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>{post.slug} | spacetraveling</title>
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
              4min
            </p>
          </div>
          <section>
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
        </article>
      </main>
    </>
  )
}

// https://stackoverflow.com/questions/67787456/what-is-the-difference-between-fallback-false-vs-true-vs-blocking-of-getstaticpa?noredirect=1
export const getStaticPaths = async () => {
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

export const getStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } =  context.params

  const response = await prismic.getByUID('posts', String(slug), {});
  
  const content = response.data.content.map(content => ({
    heading: content.heading,
    body: RichText.asHtml(content.body)
  }))

  const post = {
    slug,
    first_publication_date: formatDate(response.first_publication_date),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: RichText.asText(response.data.author),
      content
    }
  }

  return {
    props: {
      post
    }
  }
};
