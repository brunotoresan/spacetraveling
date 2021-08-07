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
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useState } from 'react'

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

function formatDate(date: string): string{
  return format(
    new Date(date),
    "dd MMM yyyy",
    {
      locale: ptBR,
    }
  ).replace(/\s[a-z]/g, char => char.toUpperCase())
}

function formatPosts(postResponse: ApiSearchResponse): Post[] {
  const posts = postResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: formatDate(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: RichText.asText(post.data.author)
      }
    }
  })
  return posts
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page)

  async function handleLoadMorePosts(next_page: string) {
    await fetch(next_page)
          .then(response => response.json())
          .then(response => { 
            setPosts(posts.concat(formatPosts(response)))
            setNextPage(response.next_page)
          })
  }

    return(
      <>
        <Head>
          <title>Home | spacetraveling</title>
        </Head>

        <div className={styles.container}>
          <div className={styles.posts}>
              { posts.map(post => {
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

              {nextPage &&
                <button 
                  className={styles.loadMoreButton}
                  onClick={() => handleLoadMorePosts(postsPagination.next_page)}>
                  Carregar mais posts
                </button>                                                                                                                                                
              }
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
    pageSize: 3
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: formatPosts(postsResponse)
      }
    }
  }
};
