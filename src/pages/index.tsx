import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { formatDate } from './formatFunctions'
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
  preview: boolean
}

function formatPosts(postResponse: ApiSearchResponse): Post[] {
  const posts = postResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })
  return posts
}

export default function Home({ postsPagination, preview }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  async function handleLoadMorePosts() {
    await fetch(nextPage)
          .then(response => response.json())
          .then(response => {
            setNextPage(response.next_page)
            setPosts(posts.concat(formatPosts(response)))
          })
  }

    return(
      <>
        <Head>
          <title>Home | spacetraveling</title>
        </Head>

        <main className={commonStyles.container}>
          <div className={styles.posts}>
              { posts.map(post => {
                return (
                  <Link key={post.uid} href={`/post/${post.uid}`}>
                    <a>
                      <strong>{post.data.title}</strong>
                      <p>{post.data.subtitle}</p>
                      <div className={styles.dateAndAuthor}>
                        <time>
                          <FiCalendar className={commonStyles.icon}/>
                          {formatDate(post.first_publication_date)}
                        </time>
                        <p>
                          <FiUser className={commonStyles.icon}/>
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
                  onClick={handleLoadMorePosts}>
                  Carregar mais posts
                </button>                                                                                                                                                
              }
              {preview && (
                <aside>
                  <Link href="/api/exit-preview">
                    <a className={commonStyles.exitPreview}>
                      Sair do modo Preview
                    </a>
                  </Link>
                </aside>
              )}
            </div>
        </main>
      </>
    )
}

// preview: https://prismic.io/docs/technologies/previews-nextjs
export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview=false,
  previewData
}) => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
    pageSize: 1,
    ref: previewData?.ref ?? null,
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: formatPosts(postsResponse)
      },
      preview
    }
  }
};
