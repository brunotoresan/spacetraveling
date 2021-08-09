import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'
import { formatDate } from '../commonFunctions'
import { RichText } from 'prismic-dom';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post() {
  return(
    <h1>Hello World</h1>
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
