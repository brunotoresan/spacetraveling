import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface PostContent {
  heading: string
  body: string
}

export function formatDate(date: string): string {
    return format(
      new Date(date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ).replace(/\s[a-z]/g, char => char.toUpperCase())
}

export function formatEstimatedReadTime(content: PostContent[]): string {
  const humanAverageWordsPerMinute = 200

  const totalPostsWords = content.reduce((wordsNumber, postSection) => {
    wordsNumber += postSection.heading.split(' ').length
    wordsNumber += postSection.body.split(' ').length
    return wordsNumber
  }, 0)

  const estimatedReadTime = Math.ceil(totalPostsWords / humanAverageWordsPerMinute)

  return `${estimatedReadTime} min`
}