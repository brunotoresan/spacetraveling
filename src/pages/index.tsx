import Head from 'next/head'
import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { FiCalendar, FiUser } from 'react-icons/fi';

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

export default function Home() {
  return(
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.posts}>

            <a href="">
              <strong>Título do post</strong>
              <p>scelerisque in dictum non consectetur a erat nam at lectus urna duis convallis convallis tellus</p>
              <div className={styles.dateAndAuthor}>
                <time><FiCalendar /> 12 de março de 2021</time>
                <p><FiUser /> Bruno Toresan</p>
              </div>
            </a>

            <button className={styles.loadMoreButton}>
              Subscribe now
            </button>                                                                                                                                                
          </div>
      </div>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
