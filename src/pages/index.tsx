import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  return(
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.posts}>
            { postsPagination.results.map(post => {
              return (
                <Link key={post.uid} href={`posts/${post.uid}`}>
                  <a>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div className={styles.dateAndAuthor}>
                      <time>
                        <FiCalendar className={styles.icon}/>
                        {post.first_publication_date}
                      </time>
                      <p>
                        <FiUser className={styles.icon}/>
                        {post.data.author}
                      </p>
                    </div>
                  </a>
                </Link>
              )
            }) }

            <button className={styles.loadMoreButton}>
              Carregar mais posts
            </button>                                                                                                                                                
          </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
    pageSize: 5
  })

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR,
        }
      ).replace(/\s[a-z]/g, char => char.toUpperCase()),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: RichText.asText(post.data.author)
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: 'AAAAAAAAAAAAAAAAAAA',
        results: posts 
      }
    }
  }
};
