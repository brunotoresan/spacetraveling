import React from 'react';
import { useUtterances } from '../../hooks/utterances'
import style from './comment.module.scss'

const commentNodeId = 'comments';
const theme = 'photon-dark'

export default function Comments() {
    useUtterances(commentNodeId, theme);
    return (
        <div 
            id={commentNodeId}
            className={style.commentContent} 
        />
    )
}
  